const Bird = require('Bird');
const Background = require('Background');
const Constant = require('Constant');
const Storage = require('Storage');
var Game = cc.Class({
    extends: cc.Component,
    properties: {
        // 游戏开始按钮
        gameMenu: {
            default: null,
            type: cc.Node
        },
        // 地板对象
        background: {
            default: null,
            type: Background
        },
        // 当前玩家分数文字标签
        curScoreText: {
            default: null,
            type: cc.Label
        },
        // 游戏失败文字标签
        gameOverText: {
            default: null,
            type: cc.Label
        },
        // 管道创建节点
        pipesNode: {
            default: null,
            type: cc.Node
        },
        // 管道预制数组
        pipePrefabs: {
            default: [],
            type: [cc.Prefab]
        },
        // 重新刷新游戏
        gameReflashTime: 3,
        // 上下管道间最大间隙
        pipeMaxGap: 150,
        // 上下管道间最小间隙
        pipeMinGap: 80,
        // 管道生成的事件间隔
        pipeSpawnInterval: 2,
        // 管道纵向最大偏移量
        pipeMaxOffsetY: 250,
        // 管道生成时，水平方向屏幕外偏移量
        pipeSpawnOffsetX: 30,
        // 小鸟对象
        bird: {
            default: null,
            type: Bird
        },
        // 最高分数的文字标签
        highScore: {
            default: null,
            type: cc.Label
        }
    },
    onLoad () {
        // 初始化游戏失败的标志
        this.isGameOver = false;
        // this.curScoreText.active = false;
        // 初始化当前分数
        this.curScore = 0;
        // 获取屏幕尺寸
        this.size = cc.winSize;
        // 地板的高度
        this.floorHeight = this.background.groundNode.height;
        // 地板的世界坐标
        this.groundWorld = this.background.groundNode.convertToWorldSpace(
            cc.v2(0, 0)
        );
        // 初始化管道数组
        this.pipes = [];
        // 历史最高分
        this.score = Storage.getItem(Constant.HIGHSCORE_TXT);
        if (this.score > 0) {
            this.highScore.string = 'HighScore: ' + this.score;
        }
    },
    // 游戏开始，触摸屏幕触发的事件
    onTouchBegin: function (event) {
        if (this.isGameOver === true) return;
        this.bird.onFly();
    },
    onStartGame: function () {
        // 游戏开始，将最高分隐藏掉
        cc.log(this.highScore);
        this.highScore.node.active = false;
        // 初始化触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegin, this);
        // 关闭菜单节点显示
        this.gameMenu.active = false;

        // 游戏开始显示当前分数
        this.curScoreText.string = '' + this.curScore;
        // 小鸟开始下落
        this.bird.onStartDrop();
        // 启动管道生成定时器
        this.schedule(this.spwanPipes, this.pipeSpawnInterval);
        // 启动游戏逻辑更新定时器
        this.schedule(this.gameUpdate, Constant.GROUND_MOVE_INTERVAL);
    },
    // 生成管道方法
    spwanPipes: function () {
        // 管道预制（上端），生成管道实例
        var pipeUp = cc.instantiate(this.pipePrefabs[Constant.PIPE_UP]);
        // 定义为上端类型
        pipeUp.getComponent('Pipe').init(Constant.PIPE_UP);
        // 获取管道的高度（上端与上端的相同）
        var pipeHeight = pipeUp.getComponent('cc.Sprite').spriteFrame.getRect()
            .height;
        // 设置上端管道的横向起始位置（屏幕右端另加一定偏移）
        pipeUp.x = this.size.width / 2;
        // 设置上端管道的纵向起始位置（随机取偏移量）
        pipeUp.y =
            Math.floor(Math.random() * this.pipeMaxOffsetY) + pipeHeight / 2;
        // 下端管道预制， 生成管道实例
        var pipeDown = cc.instantiate(this.pipePrefabs[Constant.PIPE_DOWN]);
        pipeDown.getComponent('Pipe').init(Constant.PIPE_DOWN);
        pipeDown.x = this.size.width / 2;
        // 随机生成上下管道间的间隙值（该值在pipeMinGap和pipeMaxGap之间）
        var pipeGap =
            Math.random() * (this.pipeMaxGap - this.pipeMinGap) +
            this.pipeMinGap;
        pipeDown.y = pipeUp.y - pipeGap - pipeHeight;
        // 添加管道到pipes节点上
        this.pipesNode.addChild(pipeUp);
        this.pipesNode.addChild(pipeDown);
        // 添加管道到管道数组中
        this.pipes.push(pipeUp);
        this.pipes.push(pipeDown);
    },
    // 游戏界面更新
    gameUpdate: function () {
        for (var i = 0;i < this.pipes.length;i++) {
            // 获得当前管道对象节点
            var curPipeNode = this.pipes[i];
            // 管道的宽度
            var pipeW = curPipeNode.width;
            // 获取小鸟的盒子
            var birdBox = this.bird.node.getBoundingBox();
            // 获取当前管道的盒子
            var pipeBox = curPipeNode.getBoundingBox();
            // 判断小鸟的盒子和管道是否相交
            if (cc.Intersection.rectRect(birdBox, pipeBox)) {
                // 相交了，则游戏结束
                this.onGameOver();
            }
            // 获得当前管道对象
            var curPipe = curPipeNode.getComponent('Pipe');
            // 判断小鸟是否顺利通过管道
            if (
                curPipeNode.x < this.bird.node.x &&
                curPipe.isPassed === false &&
                curPipe.type === Constant.PIPE_UP
            ) {
                // 小鸟通过管道，给管道的isPassed属性置为true
                curPipe.isPassed = true;
                // 调用加分的方法
                this.addScore();
            }
            // 更新当前管道节点的水平位置
            curPipeNode.x += Constant.GROUND_VX;
            // 将超出屏幕的管道移除
            if (curPipeNode.x < -(this.size.width / 2 + pipeW / 2)) {
                this.pipes.splice(i, 1);
                this.pipesNode.removeChild(curPipeNode, true);
            }
        }
        // 小鸟的世界坐标, 节点的原点在左下角
        var birdWorld = this.bird.node.convertToWorldSpace(cc.v2(0, 0));
        // 小鸟触底，则游戏结束
        if (
            Math.floor(birdWorld.y) <=
            Math.floor(this.groundWorld.y + this.floorHeight)
        ) {
            this.onGameOver();
        }
    },
    onGameOver: function () {
        // 设置游戏失败标志
        this.isGameOver = true;
        // 死亡时，界面显示“GameOver”
        this.gameOverText.string = Constant.GAMEOVER_TXT;
        // 关闭所有定时器
        this.bird.getComponent(cc.Animation).stop();
        this.bird.unscheduleAllCallbacks();
        this.background.unscheduleAllCallbacks();
        this.unscheduleAllCallbacks();
        // 一定时间后，重新刷新游戏到开始状态
        this.schedule(function () {
            cc.director.loadScene('Bird');
        }, this.gameReflashTime);
        cc.log('game over');
        if (this.score < this.curScore) {
            Storage.setItem(Constant.HIGHSCORE_TXT, this.curScore);
        }
    },
    addScore: function () {
        // 加分
        this.curScore++;
        // 将分数显示到游戏界面（这里用空串将number类型转换成字符串类型）
        this.curScoreText.string = '' + this.curScore;
    }
});
module.exports = Game;
