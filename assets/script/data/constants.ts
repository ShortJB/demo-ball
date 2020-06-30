/**
 * Copyright (c) 2019 Xiamen Yaji Software Co.Ltd. All rights reserved.
 * Created by daisy on 2019/06/25.
 */
import { _decorator, Vec3 } from "cc";
import { Game } from "../game/game";

//跳板类型
enum BOARD_TYPE {
    /**
     * @zh 正常
     */
    NORMAL = 0,
    /**
     * @zh 弹簧
     */
    SPRING = 1,
    /**
     * @zh 会掉落的跳板
     */
    DROP = 2,
    /**
     * @zh 大跳板
     */
    GIANT = 3,
    /**
     * @zh 冲刺跳板
     */
    SPRINT = 4
}

enum GAME_STATE {
    /**
     * @zh 游戏准备中
     */
    READY = 1,
    /**
     * @zh 游戏中
     */
    PLAYING = 2,
    /**
     * @zh 游戏暂停
     */
    PAUSE = 3,
    /**
     * @zh 游戏结束
     */
    OVER = 4,
}

enum GAME_EVENT {
    /**
     * @zh 重新开始
     */
    RESTART = 'restart',
    /**
     * @zh 复活
     */
    REVIVE = 'revive',
    /**
     * @zh 增加分数
     */
    ADDSCORE = 'add-score',
    /**
     * @zh 死亡中
     */
    DYING = 'dying',
    /**
     * @zh 隐藏提示板
     */
    HIDETIPS = 'hide-tips',
}

enum JUMP_STATE {
    /**
     * @zh 正常跳跃
     */
    JUMPUP = 1,
    /**
     * @zh 下落
     */
    FALLDOWN = 2,
    /**
     * @zh 冲刺
     */
    SPRINT = 3,
}

export class Constants {
    static game: Game;
     /** @property {number} Constants.COEFF_POS_BALL */
    static COEFF_POS_BALL = 8 / 360;
    /** @property {number} Constants.PLAYER_MAX_DOWN_FRAMES - 最大下落帧数 */
    static PLAYER_MAX_DOWN_FRAMES = 40;
    /** @property {number} Constants.MAX_SCORE - 历史最高*/
    static MAX_SCORE = 0;

    // score
    /** @property {number} Constants.SCORE_BOARD_CENTER - 小球靠近跳板圆心的分数 */
    static SCORE_BOARD_CENTER = 2; 
     /** @property {number} Constants.SCORE_BOARD_NOT_CENTER - 小球跳入非跳板圆心的分数 */
    static SCORE_BOARD_NOT_CENTER = 1;

    // board
    /** @property {number} Constants.BOARD_INIT_POS - 跳板初始位置 */
    static BOARD_INIT_POS = new Vec3(0, 10, 0);
    /** @property {number} Constants.BOARD_NUM - 跳板初始个数 */
    static BOARD_NUM = 6;  
    /** @property {number} Constants.BOARD_NEW_INDEX - 每次新增两个跳板 */
    static BOARD_NEW_INDEX = 2;
     /** @property {number} Constants.BOARD_HEIGTH - 跳板厚度 */
    static BOARD_HEIGTH = 0.25;  
     /** @property {number} Constants.BOARD_RADIUS - 跳板半径 */
    static BOARD_RADIUS = 1.5;  
     /** @property {number} Constants.BOARD_HEIGTH_SCALE_DROP - 掉落板厚度缩放比例 */
    static BOARD_HEIGTH_SCALE_DROP = 0.5; 
    /** @property {number} Constants.BOARD_RADIUS_SCALE_GIANT - 大跳板缩放比例 */
    static BOARD_RADIUS_SCALE_GIANT = 2.8; 
    /** @property {number} Constants.BOARD_GAP - 正常板间隔高度 */
    static BOARD_GAP = 4.3; 
    /** @property {number} Constants.BOARD_GAP_SPRING - 弹簧板间隔高度 */
    static BOARD_GAP_SPRING = 9; 
    /** @property {number} Constants.BOARD_GAP_SPRINT - 冲刺板间隔高度 */
    static BOARD_GAP_SPRINT = 192; 
     /** @property {number} Constants.BOARD_SCALE_GIANT - 大跳板缩放比例 */
    static BOARD_SCALE_GIANT = 2.8;
    /** @property {number} Constants.SCENE_MAX_OFFSET_X - 小球最大横向移动距离 */
    static SCENE_MAX_OFFSET_X = 3.5;
     /** @property {number} Constants.BOARD_TYPE - 跳板类型枚举 */
    static BOARD_TYPE = BOARD_TYPE; 
     /** @property {number} Constants.BOARD_DROP_FRAMES - 掉落板下落帧数 */
    static BOARD_DROP_FRAMES = 40;  
     /** @property {number} Constants.BOARD_DROP_STEP - 掉落板每帧下落距离 */
    static BOARD_DROP_STEP = 0.5; 
    /** @property {number} Constants.BOARD_RADIUS_CENTER - 跳板圆心半径，小球根据距离圆心远近增加不同分数 */
    static BOARD_RADIUS_CENTER = 0.35; 
    /** @property {number} Constants.BOARD_SPRING_FRAMES - 跳板的弹簧上升帧数 */
    static BOARD_SPRING_FRAMES = 10;
     /** @property {number} Constants.BOARD_WAVE_FRAMES - 板子波动帧率 */
    static BOARD_WAVE_FRAMES = 16; 
    static BOARD_WAVE_INNER_START_FRAMES = 8;
    static BOARD_WAVE_INNER_STEP = 0.12 * 2;
    static BOARD_WAVE_STEP = 0.15 * 15;
     /** @property {number} Constants.BOARD_MOVING_STEP - 移动板移动速度 */
    static BOARD_MOVING_STEP = 0.03; 

    static SPRING_HEIGHT = 0.2;
    static SPRING_HELIX_STEP = 0.5;
    static SPRING_HELIX_STEP_SPIRNT = 1.2;
    static SPRING_TOP_STEP = 0.25;
    static SPRING_TOP_STEP_SPRINT = 0.5;
    static WAVE_OFFSET_Y = 0.13 / 2;

    // camera
    /** @property {number} Constants.CAMERA_INIT_POS - 相机初始位置 */
    static CAMERA_INIT_POS = new Vec3(0, 15, 22); 
    /** @property {number} Constants.CAMERA_INIT_ROT - 相机初始旋转 */
    static CAMERA_INIT_ROT = new Vec3(-11, 0, 0); 
    /** @property {number} Constants.CAMERA_MOVE_X_FRAMES - 相机横向偏移比例 */
    static CAMERA_MOVE_X_FRAMES = 20; 
     /** @property {number} Constants.CAMERA_MOVE_Y_FRAMES - 相机纵向偏移比例 */
    static CAMERA_MOVE_Y_FRAMES = 15;  
    /** @property {number} Constants.CAMERA_MOVE_Y_FRAMES_SPRING - 弹簧跳板纵向偏移比例 */
    static CAMERA_MOVE_Y_FRAMES_SPRING = 23; 
    /** @property {number} Constants.CAMERA_MOVE_MINI_ERR - 相机位置最小误差 */
    static CAMERA_MOVE_MINI_ERR = 0.02; 
    static CAMERA_OFFSET_Y = 10;
    static CAMERA_OFFSET_Y_SPRINT = 15;
    /** @property {number} - 板撞击特效帧数 */
    static BOARD_BUMP_FRAMES = 10;
    static BOARD_BUMP_STEP = [-0.15, -0.1, -0.07, -0.02, -0.003, 0.003, 0.02, 0.07, 0.1, 0.15];

    // game
    /** @property {number} Constants.GAME_STATE - 游戏状态枚举 */
    static GAME_STATE = GAME_STATE; 
    /** @property {number} Constants.GAME_EVENT - 游戏事件枚举 */
    static GAME_EVENT = GAME_EVENT; 

    // ball
     /** @property {number} Constants.BALL_RADIUS - 球体半径 */
    static BALL_RADIUS = 0.5;
    /** @property {number} Constants.BALL_JUMP_STATE - 小球跳跃状态枚举 */
    static BALL_JUMP_STATE = JUMP_STATE; 
    /** @property {number} Constants.BALL_JUMP_FRAMES - 正常跳跃帧数 */
    static BALL_JUMP_FRAMES = 20; 
    /** @property {number} Constants.BALL_JUMP_FRAMES_SPRING - 弹簧板跳跃帧数 */
    static BALL_JUMP_FRAMES_SPRING = 27;
     /** @property {number} Constants.BALL_JUMP_FRAMES_SPRINT - 冲刺板跳跃帧数 */
    static BALL_JUMP_FRAMES_SPRINT = 240; 
     /** @property {number} Constants.BALL_JUMP_STEP - 正常跳跃步长 */
    static BALL_JUMP_STEP = [0.8, 0.6, 0.5, 0.4, 0.3, 0.2, 0.15, 0.1, 0.05, 0.03];
     /** @property {number} Constants.BALL_JUMP_STEP_SPRING - 弹簧跳跃步长 */
    static BALL_JUMP_STEP_SPRING = [1.2, 0.8, 0.6, 0.4, 0.3, 0.2, 0.15, 0.1, 0.05];
     /** @property {number} Constants.BALL_JUMP_STEP_SPRINT - 冲刺跳跃步长 */
    static BALL_JUMP_STEP_SPRINT = 0.8; // 冲刺跳跃步长
     /** @property {number} Constants.BALL_SPRINT_STEP_Y  */
    static BALL_SPRINT_STEP_Y = 10; //

    // diamond
    /** @property {number} Constants.DIAMOND_NUM  - 钻石复用数量*/
    static DIAMOND_NUM = 10; 
    static DIAMOND_PIECE_NUM = 10;
    static DIAMOND_RADIUS = 0.3;
    static DIAMOND_ROTATE_STEP_Y = 1.5;
    static DIAMOND_SCORE = 1;
    /** 小球吃钻石最大距离 */
    static DIAMOND_SCORE_AREA = 0.6;
    static DIAMOND_SPRINT_SCORE_AREA = 1;
    /** @property {number} Constants.DIAMOND_SPRINT_STEP_Y  - 钻石之间的Y轴距离*/
    static DIAMOND_SPRINT_STEP_Y = 4;
     /** @property {number} Constants.DIAMOND_START_FRAME  - 开始创建钻石的帧数*/
    static DIAMOND_START_FRAME = 6;

}
