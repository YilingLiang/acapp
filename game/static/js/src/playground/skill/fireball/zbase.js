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
        this.eps = 0.1;
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps) {
            this.destory();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        for (let i = 0; i < this.playground.fireballs.length; i ++ ) {
            // 判断攻击之间是否抵消, 同一玩家的火球之间不抵消
            let fireball = this.playground.fireballs[i];
            if (this.player != fireball.player && this.is_collision(fireball)) {
                this.destory();
                this.destory_fireball(fireball);
                break;
            }
        }
        
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            // 判断是否攻击中玩家, 自己的技能不能击中自己
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
            }
        }
        
        this.render();
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
        this.destory();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    destory_fireball(obj) {  // 
        AC_GAME_OBJECTS.splice(AC_GAME_OBJECTS.indexOf(obj), 1);
        this.playground.fireballs.splice(this.playground.fireballs.indexOf(obj), 1);
    }

    on_destory() {
        this.playground.fireballs.splice(this.playground.fireballs.indexOf(this), 1);
    }

}
