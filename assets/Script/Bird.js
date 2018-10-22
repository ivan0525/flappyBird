cc.Class({
    extends: cc.Component,
    properties: {
        // 小鸟重力值
        gravity: 0.5,
        // 小鸟上升高度值
        birdFlyHeight: 5,
        // 小鸟飞翔动画名称
        animName: '',
        // 小鸟振翅音乐
        flyAudio: {
            default: null,
            type: cc.AudioClip
        }
    },
    onLoad () {
        this.getComponent(cc.Animation).play(this.animName);
        // 初始化速度为0
        this.velocity = 0;
    },
    // 开始下落，调用下落方法
    onStartDrop: function () {
        this.schedule(this.onDrop, 0.01);
    },
    // 小鸟下落方法
    onDrop: function () {
        this.node.y += this.velocity;
        this.velocity -= this.gravity;
    },
    // 小鸟飞起方法
    onFly: function () {
        // 小鸟飞起，设置速度为向上的
        this.velocity = this.birdFlyHeight;
        // 播放飞起声音
        cc.audioEngine.playEffect(this.flyAudio, false); // 参数：播放的音乐；   是否循环播放
    }

});
