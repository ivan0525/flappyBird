cc.Class({
  extends: cc.Component,
  properties: {
    // 小鸟是否通过管道
    isPassed: false
  },
  onLoad () {},
  init: function (type) {
    // 设置管道类型(上/下)
    this.type = type;
  }
})