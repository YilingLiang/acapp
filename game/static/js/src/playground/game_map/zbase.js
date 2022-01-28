class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height; // 全屏显示画布
        this.playground.$playground.append(this.$canvas);
    }

    start() {
        this.$canvas.focus(); // 聚焦
    }

    resize() { // 动态调节窗口大小
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(176, 224, 230, 0.8)"; // 避免调整大小时渐变的效果
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update() {
        this.render();
    }

    render() { // 渲染画布函数
        if(this.playground.players.length > 0 && this.playground.players[0].character === 'me') {
            this.ctx.fillStyle = 'rgba(176, 224, 230, 0.8)';
        } else {
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        }
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
