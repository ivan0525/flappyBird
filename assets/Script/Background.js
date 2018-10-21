const Constant = require('Constant');
cc.Class({
    extends: cc.Component,
    properties: {
        // 地板节点
        groundNode: {
            default: null,
            type: cc.Node
        },
        // 地板图片
        groundImg: {
            default: null,
            type: cc.Sprite
        },
        // 背景节点
        backgroundNode: {
            default: null,
            type: cc.Node
        }
    },
    onLoad () {
        // 获取背景宽度
        this.backgroundWidth = this.backgroundNode.width;
        // 地板图片的宽度
        this.groundImgWidth = this.groundImg.node.width;
        // 地板移动定时器
        this.schedule(this.onGroundMove, Constant.GROUND_MOVE_INTERVAL);
    },
    onGroundMove: function () {
        this.groundNode.x += Constant.GROUND_VX;
        if (this.groundNode.x < -this.backgroundWidth / 2) {
            this.groundNode.x = this.backgroundWidth / 2;
        }
    }

});
