class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super();
        console.log(character, username);
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0; // 伤害方向
        this.damage_speed = 0
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.is_alive = true;
        this.eps = 0.01;
        this.friction = 0.8; // 被攻击后移动的速度衰减系数
        this.spend_time = 0;

        this.cur_skill = null; // 当前选的技能
		if (this.character !== "robot") {
			this.img = new Image();
			this.img.src = this.photo;
		}
    }

    start() {
        if (this.character === "me") {
            this.playground.game_map.$canvas.on("contextmenu", function() {
                return false;// 右键菜单取消
            });
            this.add_listening_events();
        } else if (this.character === "robot") { // AI 玩家进行随机游走
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }

    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.mousedown(function(e) {
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {// 等于3代表鼠标右键,1左键,滚轮2
                // outer.move_to(e.clientX, e.clientY);
                outer.move_to((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale); // 多终端显示矫正
            } else if (e.which === 1) {
                if (outer.cur_skill === "fireball") {
                    // outer.shoot_fireball(e.clientX, e.clientY);
                    outer.shoot_fireball((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
                }
                outer.cur_skill = null;
            }
        });

        $(window).keydown(function(e) {
            if (e.which === 81) { // keycode 81 is "q" on keyboard
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01 / this.playground.scale;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "yellow";
        let speed = this.playground.height * 0.4 / this.playground.scale;
        let move_length = this.playground.height * 1.1 / this.playground.scale; // 自己定义个合适的
        // new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01);
        this.playground.fireballs.push(
            new FireBall(this.playground, this, x, y, radius, vx, vy, color, 
                speed, move_length, this.playground.height * 0.01 / this.playground.scale));
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy *dy);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attacked(angle, damage) {
        for (let i = 0; i < 10 + Math.random() * 10; i ++ ) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        this.radius -= damage;
        if (this.radius < this.eps ){ // 半径小到一定程度则死亡
            this.is_alive = false;
            this.destory();
            if (this.character === "me" && !this.is_alive) $("canvas").unbind(); //会 unbind 所有事件
            this.playground.game_map.$canvas.on("contextmenu", function() {
                return false;// 右键菜单取消
            });

            return false;
        } else {
            this.damage_x = Math.cos(angle);
            this.damage_y = Math.sin(angle);
            this.damage_speed = damage * 80; // 后面可以调整一下
            this.speed *= 0.8;
        }
    }

    update() {
        this.update_move();
        this.render();
    }

    update_move() { // 更新玩家移动
        this.spend_time += this.timedelta / 1000; // 攻击冷静期, 前5秒不攻击
        if (this.character === "robot" && this.spend_time > 5 && Math.random() < 1 / 180) {
            // 敌人随机攻击，因每秒刷新60次，1/180的概率攻击，表示每3秒发射一次。
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.5;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.5; // 预判 0.5s 后的位置

            this.shoot_fireball(tx, ty);    
        }

        if (this.damage_speed > this.eps) { // 注意eps是相对值
            this.vx = this.vy = 0;
            this.move_length = 0; // 被攻击则无法操纵角色
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else{

            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (this.character === "robot") {
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        // console.log("剩余的玩家", this.playground.players);
        // console.log("图中剩下的元素", AC_GAME_OBJECTS);
        // console.log("剩余的火球", this.playground.fireballs);

    }

    render() {
        let scale = this.playground.scale;
		if (this.character !== "robot") {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale); 
            this.ctx.restore();

        } else{
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }
    on_destory() { 
        this.playground.players.splice(this.playground.players.indexOf(this), 1);
    }
}
