
/**
 * Copyright (c) 2019 Xiamen Yaji Software Co.Ltd. All rights reserved.
 * Created by daisy on 2019/06/25.
 */
import { _decorator, Component, Node, Touch, EventTouch, Vec3, LabelComponent, Prefab, ParticleSystemComponent, ModelComponent, AnimationComponent, CameraComponent } from "cc";
import { Constants } from "../data/constants";
import { Board } from "./board";
import { utils } from "../utils/utils";
import { PoolManager } from "../utils/pool-manager";
const { ccclass, property } = _decorator;

// 局部 vec3 变量复用
const _tempPos = new Vec3();

@ccclass("Ball")
export class Ball extends Component {
    @property(Prefab)
    diamondParticlePrefab: Prefab = null;
    @property({ type: Prefab })
    scoreAniPrefab: Prefab = null;
    // @property({ type: Prefab })
    // trail01Prefab: Prefab = null;

    @property({ type: Prefab })
    trail02Prefab: Prefab = null;

    /** @type {Board} - 当前接触的板 */
    currBoard: Board = null; 

    boardCount = 0;
    jumpState = Constants.BALL_JUMP_STATE.JUMPUP;
    /** @type {number} - 应该是当前板的编号 */
    currBoardIdx = 0;
    diffLevel = 1;
    /** @type {number} - 当前跳跃频率（移动距离是以每帧移动*频率来判断）*/
    currJumpFrame = 0; 
    /** @type {boolean} - 当前已存在冲刺板 */
    hasSprint = false;
    isTouch = false;

    /** @type {number}  - 点击屏幕位置 x */
    touchPosX = 0; // 
    /** @type {number} - 移动位置 x */
    movePosX = 0; 
    /** @type {boolean} - 处于弹簧版弹跳状态 */
    isJumpSpring = false; 
    /** @type {number} - 间隔多少个板，再根据难度随机新版本 */
    boardGroupCount = 0;
    trailNode: Node = null;

    _wpos = new Vec3();


    start () {
        Constants.game.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        Constants.game.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        Constants.game.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);


        // @ts-ignore
        // this.trailNode = PoolManager.instance.getNode(this.trail01Prefab, this.node.parent);
        this.updateBall();
        this.reset();
        this.trailNode.active = false;
    }

    onDestroy() {
        Constants.game.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        Constants.game.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        Constants.game.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    update(deltaTime: number) {
        if (Constants.game.state === Constants.GAME_STATE.PLAYING) {
            const boardBox = Constants.game.boardManager;
            const boardList = boardBox.getBoardList();
            if (this.jumpState === Constants.BALL_JUMP_STATE.SPRINT) {// 冲刺
                // 冲刺状态结束后状态切换
                if (this.currJumpFrame > Constants.BALL_JUMP_FRAMES_SPRINT) {
                    this.jumpState = Constants.BALL_JUMP_STATE.JUMPUP;
                    this.isJumpSpring = false;
                    this.currJumpFrame = 0;
                    this.hasSprint = false;
                    // const eulerAngles = this.node.eulerAngles;
                    // this.node.eulerAngles = new Vec3(eulerAngles.x, -Constants.BALL_SPRINT_STEP_Y, eulerAngles.z);
                    boardBox.clearDiamond();
                }

                this.currJumpFrame++;
                const diamondSprintList = boardBox.getDiamondSprintList();
                for (let i = 0; i < Constants.DIAMOND_NUM; i++) {
                    if (Math.abs(this.node.position.y - diamondSprintList[i].position.y) <= Constants.DIAMOND_SPRINT_SCORE_AREA && Math.abs(this.node.position.x - diamondSprintList[i].position.x) <= Constants.DIAMOND_SPRINT_SCORE_AREA) {
                        Constants.game.addScore(Constants.DIAMOND_SCORE);
                        this.showScore(Constants.DIAMOND_SCORE);
                        Constants.game.ball.playDiamondParticle(this.node.position);
                        diamondSprintList[i].active = false;
                    }
                }
                this.setPosY();
                this.setPosX();
                // this.setRotY();
                this.touchPosX = this.movePosX;
                const y = this.node.position.y + Constants.CAMERA_OFFSET_Y_SPRINT;
                Constants.game.cameraCtrl.setOriginPosY(y);
            } else {
                for (let i = this.currBoardIdx + 1; i >= 0; i--) {
                    const board = boardList[i];
                    const pos = this.node.position;
                    const boardPos = boardList[i].node.position;
                    // 跳板的锚点是在底部的吗？ 
                    // 小球和板上的钻石检测
                    if (Math.abs(pos.x - boardPos.x) <= boardList[i].getRadius() && Math.abs(pos.y - (boardPos.y + Constants.BOARD_HEIGTH)) <= Constants.DIAMOND_SCORE_AREA) {
                        boardList[i].checkDiamond(this.node.position.x);
                    }

                    // 超过当前跳板应该弹跳高度，开始下降
                    if (this.jumpState === Constants.BALL_JUMP_STATE.FALLDOWN) {
                        // 落在底部了
                        // 游戏结束
                        if (this.currJumpFrame > Constants.PLAYER_MAX_DOWN_FRAMES || this.currBoard.node.position.y - this.node.position.y > Constants.BOARD_GAP + Constants.BOARD_HEIGTH) {
                            const part = this.trailNode.getComponentInChildren(ParticleSystemComponent);
                            part.stop();
                            part.node.active = false;
                            Constants.game.gameDie();
                            return;
                        }

                        // 是否在当前检测的板上
                        if (this.isOnBoard(board)) {
                            this.currBoard = board;
                            this.currBoardIdx = i;
                            this.activeCurrBoard();
                            break;
                        }
                    }
                }

                this.currJumpFrame++;

                if (this.jumpState === Constants.BALL_JUMP_STATE.JUMPUP) {
                    if (this.isJumpSpring && this.currJumpFrame >= Constants.BALL_JUMP_FRAMES_SPRING) {
                        // 处于跳跃状态并且当前跳跃高度超过弹簧板跳跃高度
                        this.jumpState = Constants.BALL_JUMP_STATE.FALLDOWN;
                        this.currJumpFrame = 0;
                    } else {
                        if (!this.isJumpSpring && this.currJumpFrame >= Constants.BALL_JUMP_FRAMES) {
                            // 跳跃距离达到限制，开始下落
                            this.jumpState = Constants.BALL_JUMP_STATE.FALLDOWN;
                            this.currJumpFrame = 0;
                        }
                    }
                }

                this.setPosY();
                this.setPosX();
                // this.setRotZ();

                if (this.currBoard.type !== Constants.BOARD_TYPE.SPRINT) {
                    Constants.game.cameraCtrl.setOriginPosX(this.node.position.x);
                }

                this.touchPosX = this.movePosX;
            }

            this.setTrailPos();
        }
    }

    onTouchStart(touch: Touch, event: EventTouch){
        this.isTouch = true;
        this.touchPosX = touch.getLocation().x;
        this.movePosX = this.touchPosX;
    }

    onTouchMove(touch: Touch, event: EventTouch){
        this.movePosX = touch.getLocation().x;
    }

    onTouchEnd(touch: Touch, event: EventTouch){
        this.isTouch = false;
    }

    reset() {
        this.boardCount = 0;
        this.diffLevel = 1;
        _tempPos.set(Constants.BOARD_INIT_POS);
        _tempPos.y += Constants.BALL_RADIUS + Constants.BOARD_HEIGTH / 2 - .001;
        this.node.setPosition(_tempPos);
        this.node.eulerAngles = new Vec3();
        this.currJumpFrame = 0;
        this.jumpState = Constants.BALL_JUMP_STATE.FALLDOWN;
        this.hasSprint = false;
        this.currBoardIdx = 0;
        this.show();
        this.playTrail();
        this.setTrailPos();
    }

    updateBall() {
        // PoolManager.instance.putNode(this.trailNode);

        // @ts-ignore
        this.trailNode = PoolManager.instance.getNode(this.trail02Prefab, this.node.parent);
    }

    show() {
        this.node.active = true;
    }

    hide() {
        this.node.active = false;
    }

    /** 激活当前小球所在的板 */
    activeCurrBoard() {
        const pos = this.node.position;
        const boardPos = this.currBoard.node.position;
        const boardType = this.currBoard.type;
        const y = boardPos.y + Constants.BALL_RADIUS + this.currBoard.getHeight() / 2 - .01;
        // 设置小球在板上位置
        this.node.setPosition(pos.x, y, pos.z);
        this.currJumpFrame = 0;
        if (boardType === Constants.BOARD_TYPE.SPRINT) {
            this.jumpState = Constants.BALL_JUMP_STATE.SPRINT;
            // this.node.eulerAngles = new Vec3(this.node.eulerAngles.x, this.node.eulerAngles.y, 0);
            Constants.game.cameraCtrl.setOriginPosX(boardPos.x);
        } else {
            this.jumpState = Constants.BALL_JUMP_STATE.JUMPUP;
        }

        if (!this.currBoard.isActive) {
            this.currBoard.isActive = true;
            let score = Constants.SCORE_BOARD_NOT_CENTER;
            // 跳板圆心半径，小球根据距离圆心远近增加不同分数
            if (boardType !== Constants.BOARD_TYPE.NORMAL && boardType !== Constants.BOARD_TYPE.DROP || Math.abs(pos.x - boardPos.x) <= Constants.BOARD_RADIUS_CENTER) {
                score = Constants.SCORE_BOARD_CENTER;
            }

            Constants.game.addScore(score);
            this.showScore(score);
            this.boardCount++;
            if (this.boardCount === 5) {// 第五块板隐藏新手界面
                Constants.game.node.emit(Constants.GAME_EVENT.HIDETIPS);
            }

            this.diffLevel += score / 2;
            // 新增跳板 
            for (let i = this.currBoardIdx - Constants.BOARD_NEW_INDEX; i > 0; i--) {
                this.newBoard();
            }
        }

        this.isJumpSpring = boardType === Constants.BOARD_TYPE.SPRING;
        this.currBoard.setBump();
        this.currBoard.setWave();
        if (boardType == Constants.BOARD_TYPE.SPRING || boardType == Constants.BOARD_TYPE.SPRINT) {
            this.currBoard.setSpring()
        }

        // 掉落板开始掉落
        const boardList = Constants.game.boardManager.getBoardList();
        if (boardType === Constants.BOARD_TYPE.DROP) {
            for (let l = 0; l < this.currBoardIdx; l++) {
                boardList[l].setDrop();
            }
        }

        const c = boardPos.y + Constants.CAMERA_OFFSET_Y;
        Constants.game.cameraCtrl.setOriginPosY(c);
        Constants.game.cameraCtrl.preType = boardType;
    }

    // 创建新跳板信息
    newBoard() {
        let type = Constants.BOARD_TYPE.NORMAL;
        if (this.boardGroupCount <= 0) {
            const coeff = utils.getDiffCoeff(this.diffLevel, 1, 10);
            const t = Math.random() * coeff;
            if (t < 4.2) {
                type = Constants.BOARD_TYPE.NORMAL;
                this.boardGroupCount = 2;
            } else if (t <= 5.5) {
                type = Constants.BOARD_TYPE.GIANT;
                this.boardGroupCount = 3;
            } else if (t <= 6.2) {
                type = Constants.BOARD_TYPE.SPRING;
                if (Math.random() > 0.5) {
                    this.boardGroupCount = 2;
                }
            } else if (t <= 7) {
                type = Constants.BOARD_TYPE.DROP;
                this.boardGroupCount = 3
            } else if (t <= 7.5 && false === this.hasSprint) {
                type = Constants.BOARD_TYPE.SPRINT;
                this.hasSprint = true;
            } else {
                type = Constants.BOARD_TYPE.NORMAL;
            }
        }
        this.boardGroupCount--;
        Constants.game.boardManager.newBoard(type, this.diffLevel);
    }

    // 界面上的弹跳分数
    showScore(score: number) {
        const node = PoolManager.instance.getNode(this.scoreAniPrefab, cc.find('Canvas/resultUI'));
        const pos = new Vec3();
        const cameraComp = Constants.game.cameraCtrl.node.getComponent(CameraComponent);
        this._wpos.set(this.node.worldPosition);
        cameraComp.convertToUINode(this._wpos, cc.find('Canvas/resultUI'), pos);

        pos.x += 50;
        node.setPosition(pos);
        node.getComponentInChildren(LabelComponent).string = `+${score}`;
        const animationComponent = node.getComponent(AnimationComponent);
        animationComponent.once('finished', () => {
            PoolManager.instance.putNode(node);
        });
        animationComponent.play();
    }

    /** 小球水平位置变化，每帧变动 */
    setPosX() {
        if (this.isTouch && this.touchPosX !== this.movePosX) {
            _tempPos.set(this.node.position);
            if (this.jumpState === Constants.BALL_JUMP_STATE.SPRINT) {
                let x = (this.movePosX - this.touchPosX) * Constants.COEFF_POS_BALL;
                this.node.setPosition(_tempPos.x + x, _tempPos.y, _tempPos.z);
                _tempPos.set(this.node.position);
                x = _tempPos.x;
                let t = 1.3 * Constants.SCENE_MAX_OFFSET_X;
                const currBoardPos = this.currBoard.node.position;
                if (x > currBoardPos.x + t) {//限制小球最远与跳板的距离
                    this.node.setPosition(currBoardPos.x + t, _tempPos.y, _tempPos.z);
                } else if (x < this.currBoard.node.position.x - t) {
                    this.node.setPosition(currBoardPos.x - t, _tempPos.y, _tempPos.z);
                }
            } else {// 每帧移动步长
                const x = (this.movePosX - this.touchPosX) * Constants.COEFF_POS_BALL;
                this.node.setPosition(_tempPos.x + x, _tempPos.y, _tempPos.z);
            }
        }
    }

    // 垂直位置变化，每帧变动
    setPosY() {
        _tempPos.set(this.node.position);
        // 跳跃状态处理
        if (this.jumpState === Constants.BALL_JUMP_STATE.JUMPUP) {
            if (this.isJumpSpring) {// 处于弹簧版弹跳状态
                _tempPos.y += Constants.BALL_JUMP_STEP_SPRING[Math.floor(this.currJumpFrame / 3)];
            } else {// 正常跳跃
                _tempPos.y += Constants.BALL_JUMP_STEP[Math.floor(this.currJumpFrame / 2)];
            }
            this.node.setPosition(_tempPos);
            // 下落状态处理
        } else if (this.jumpState === Constants.BALL_JUMP_STATE.FALLDOWN) {
            if (this.currBoard.type === Constants.BOARD_TYPE.SPRING) {
                if (this.currJumpFrame < Constants.BALL_JUMP_FRAMES_SPRING) {
                    _tempPos.y -= Constants.BALL_JUMP_STEP_SPRING[Math.floor((Constants.BALL_JUMP_FRAMES_SPRING - this.currJumpFrame - 1) / 3)]
                } else {
                    _tempPos.y -= Constants.BALL_JUMP_STEP_SPRING[0]
                }
            } else if (this.currJumpFrame < Constants.BALL_JUMP_FRAMES) {
                _tempPos.y -= Constants.BALL_JUMP_STEP[Math.floor((Constants.BALL_JUMP_FRAMES - this.currJumpFrame - 1) / 2)];
            } else {
                _tempPos.y -= Constants.BALL_JUMP_STEP[0];
            }
            this.node.setPosition(_tempPos);
            // 冲刺跳跃状态处理
        } else if (this.jumpState === Constants.BALL_JUMP_STATE.SPRINT) {
            _tempPos.y += Constants.BALL_JUMP_STEP_SPRINT;
            this.node.setPosition(_tempPos);
            // 在 [26 - 190] 区间 每五帧 创建一颗钻石
            if (this.currJumpFrame >= Constants.DIAMOND_START_FRAME + 20 && this.currJumpFrame <= Constants.BALL_JUMP_FRAMES_SPRINT - 50 && this.currJumpFrame % Math.floor(Constants.DIAMOND_SPRINT_STEP_Y / Constants.BALL_JUMP_STEP_SPRINT) == 0) {
                Constants.game.boardManager.newDiamond()
            }

        }
    }

    // 当前处于哪块板子上
    isOnBoard(board: Board) {
        const pos = this.node.position;
        const boardPos = board.node.position;
        const x = Math.abs(pos.x - boardPos.x);
        const y = pos.y - boardPos.y;
        // 在板子的半径内
        if (x <= board.getRadius()) {
            if (y >= 0 && y <= Constants.BALL_RADIUS + board.getHeight() / 2){
                return true;
            }

            // 处于下落状态
            if (this.isJumpSpring && this.currJumpFrame >= Constants.BALL_JUMP_FRAMES_SPRING) {
                // 是否处于反弹后的第一次匀减速范围内
                if (Math.abs(y) < Constants.BALL_JUMP_STEP_SPRING[0]) {
                    return true;
                }
            } else if (!this.isJumpSpring && this.currJumpFrame >= Constants.BALL_JUMP_FRAMES){
                if (Math.abs(y) < Constants.BALL_JUMP_STEP[0]){
                    return true;
                }
            }
        }

        return false;
    }

    revive() {
        this.currBoardIdx--;
        if (this.currBoard.type === Constants.BOARD_TYPE.SPRINT) {
            this.currBoardIdx++;
            this.currBoard = Constants.game.boardManager.getBoardList()[this.currBoardIdx];
        }
        this.currBoard.revive();
        const pos = this.currBoard.node.position.clone();
        pos.y += Constants.BALL_RADIUS + this.currBoard.getHeight() / 2 - .001;
        this.node.setPosition(pos);
        this.node.eulerAngles = new cc.Vec3(0, 0, 0);
        this.currJumpFrame = 0;
        this.show();
        const y = this.currBoard.node.position.y + Constants.CAMERA_OFFSET_Y;
        Constants.game.cameraCtrl.setOriginPosX(pos.x);
        Constants.game.cameraCtrl.setOriginPosY(y);
        this.playTrail();
        this.setTrailPos();
    }

    playDiamondParticle(pos: Vec3) {
        // @ts-ignore
        const diamondParticle = PoolManager.instance.getNode(this.diamondParticlePrefab, this.node.parent);
        diamondParticle.setPosition(pos);
        const particleSystemComponent = diamondParticle.getComponent(ParticleSystemComponent);
        particleSystemComponent.play();
        const fun = () => {
            if (!particleSystemComponent.isPlaying) {
                PoolManager.instance.putNode(diamondParticle);
                this.unschedule(fun);
            }
        };
        this.schedule(fun, 0.1);
    }

    playTrail(){
        this.trailNode.active = true;
        this.trailNode.getComponentInChildren(ParticleSystemComponent).play();
    }

    setTrailPos() {
        const pos = this.node.position;
        this.trailNode.setPosition(pos.x, pos.y - 0.1, pos.z);
    }
}