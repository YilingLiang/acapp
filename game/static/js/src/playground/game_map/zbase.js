class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d'); // 画布context
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height; // 全屏显示画布
        this.playground.$playground.append(this.$canvas);
    }

    start() {
    }

    update() {
        this.render(); // 每一帧都要画一次
    }

    render() {// 渲染画布函数
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
