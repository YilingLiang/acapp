class FireBall extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.01;
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps) {
            this.destory();
            return false;
        }
        this.update_move();
        if (this.player.character !== 'enemy') {
            // 判断的决策权在所有者窗口
            this.update_attack();
        }

        this.render();
    }

    update_move() {
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }

    update_attack() {
        for (let i = 0; i < this.playground.fireballs.length; i ++ ) {
            // 判断攻击之间是否抵消, 同一玩家的火球之间不抵消
            let fireball = this.playground.fireballs[i];
            if (this.player != fireball.player && this.is_collision(fireball)) {
                this.destory();
                this.destory_fireball_p(fireball);
            }
        }
        
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            // 判断是否攻击中玩家, 自己的技能不能击中自己
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
                break; //只攻击一名玩家
            }
        }
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2, dy = y1 - y2;
        return Math.sqrt(dx *dx + dy * dy);
    }

    is_collision(obj) {
        let distance = this.get_dist(this.x, this.y, obj.x, obj.y);
        if (distance < this.radius + obj.radius)
            return true;
        return false;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        if (this.playground.mode === "multi mode") {
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        }

        this.destory();
    }

    render() {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    destory_fireball_p(obj) {  // 
        AC_GAME_OBJECTS.splice(AC_GAME_OBJECTS.indexOf(obj), 1);
        this.playground.fireballs.splice(this.playground.fireballs.indexOf(obj), 1);
    }

    on_destory() {
        let fireballs = this.player.fireballs;
        fireballs.splice(fireballs.indexOf(this), 1);

        this.playground.fireballs.splice(this.playground.fireballs.indexOf(this), 1);
    }

}
