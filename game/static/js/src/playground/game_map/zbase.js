class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0 class="game-map"></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height; // 全屏显示画布
        this.playground.$playground.append(this.$canvas);
        
        // 用于相对运动和小地图
        let width = this.playground.virtual_map_width;
        let height = this.playground.virtual_map_height;
        this.l = height * 0.05;
        this.nx = Math.ceil(width / this.l);
        this.ny = Math.ceil(height / this.l);
    }

    start() {
        this.$canvas.focus(); // 聚焦
        this.generate_grid();
    }

    generate_grid() {
        this.grids = [];
        for (let i = 0; i < this.ny; i ++ ) {
            for (let j = 0; j < this.nx; j ++ ) {
                this.grids.push(new Grid(this.playground, this.ctx, j, i, this.l, "rgba(222, 237, 225, 0.2)"));
            }
        }
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
        if(Math.random() > 0.4) new Snow(this.playground,0,0); // 下雪花

        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
