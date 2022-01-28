class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0; // 伤害方向
        this.damage_speed = 0;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.eps = 0.01;
        this.friction = 0.9; // 被攻击后击退速度衰减系数
        this.spent_time = 0;
        this.fireballs = [];

        this.cur_skill = null;

        if (this.character !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;
        }

        if (this.character === "me") {
            this.fireball_coldtime = 3;  // 单位：秒
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

            this.blink_coldtime = 5;  // 单位：秒
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }
    }

    start() {
        this.playground.player_count ++ ;
        this.playground.notice_board.write("已就绪：" + this.playground.player_count + "人");

        if (this.playground.player_count >= 3) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting");
        }

        if (this.character === "me") {
            this.add_listening_events();
        } else if (this.character === "robot") { // AI 玩家随机游走
            // let tx = Math.random() * this.playground.width / this.playground.scale;
            // let ty = Math.random() * this.playground.height / this.playground.scale;
            let tx = Math.random() * this.playground.virtual_map_width; // 全地图
            let ty = Math.random() * this.playground.virtual_map_height;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false; // 右键菜单取消
        });
        this.playground.game_map.$canvas.mousedown(function(e) {
            if (outer.playground.state !== "fighting")
                return true;

            const rect = outer.ctx.canvas.getBoundingClientRect();
            let tx = (e.clientX - rect.left) / outer.playground.scale + outer.playground.cx;
            let ty = (e.clientY - rect.top) / outer.playground.scale + outer.playground.cy;
            if (e.which === 3) { // 3鼠标右键，1左键，2滚轮
                // let tx = (e.clientX - rect.left) / outer.playground.scale;
                // let ty = (e.clientY - rect.top) / outer.playground.scale;   
                if (tx < 0 || tx > outer.playground.virtual_map_width || ty < 0 || ty > outer.playground.virtual_map_height) return; // 不能向地图外移动
                //鼠标右键的粒子效果
                for (let i = 0; i < 5 + Math.random() * 10; i++) {
                    let radius = 0.05 * Math.random() * 0.1;
                    let angle = Math.PI * 2 * Math.random();
                    let vx = Math.cos(angle);
                    let vy = Math.sin(angle);
                    let color = outer.color;
                    let speed = 0.15 * 5;
                    let move_length = 0.05 * Math.random() * 3.5;
                    new Particle(outer.playground, (e.clientX - rect.left) / outer.playground.scale + outer.playground.cx, (e.clientY - rect.top) / outer.playground.scale + outer.playground.cy, radius, vx, vy, color, speed, move_length);
                }
                
                outer.move_to(tx, ty);

                if (outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_move_to(tx, ty);
                }
            } else if (e.which === 1) {
                // let tx = (e.clientX - rect.left) / outer.playground.scale;
                // let ty = (e.clientY - rect.top) / outer.playground.scale;
                if (outer.cur_skill === "fireball") {
                    if (outer.fireball_coldtime > outer.eps)
                        return false;

                    let fireball = outer.shoot_fireball(tx, ty);

                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                } else if (outer.cur_skill === "blink") {
                    if (outer.blink_coldtime > outer.eps)
                        return false;

                    outer.blink(tx, ty);

                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_blink(tx, ty);
                    }
                }

                outer.cur_skill = null;
            }
        });

        this.playground.game_map.$canvas.keydown(function(e) {
            if (e.which === 13) {  // enter
                if (outer.playground.mode === "multi mode") {  // 打开聊天框
                    outer.playground.chat_field.show_input();
                    return false;
                }
            } else if (e.which === 27) {  // esc
                if (outer.playground.mode === "multi mode") {  // 关闭聊天框
                    outer.playground.chat_field.hide_input();
                }
            } 

            if (e.which === 32 || e.which === 49) { // 按1键或空格聚焦玩家
                outer.playground.focus_player = outer;
                outer.playground.re_cx_cy(outer.x, outer.y);
                return false;
            }

            if (outer.playground.state !== "fighting")
                return true;

            if (e.which === 81) {  // q
                if (outer.fireball_coldtime > outer.eps)
                    return true; // 是否向上冒泡，true表示是

                outer.cur_skill = "fireball";
                return false;
            } else if (e.which === 70) {  // f
                if (outer.blink_coldtime > outer.eps)
                    return true;

                outer.cur_skill = "blink";
                return false;
            }
        });
    }

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 1;
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 0.01);
        this.playground.fireballs_in_playground.push(fireball);
        this.fireballs.push(fireball);

        this.fireball_coldtime = 3;

        return fireball;
    }

    destroy_fireball(uuid) {
        for (let i = 0; i < this.fireballs.length; i ++ ) {
            let fireball = this.fireballs[i];
            if (fireball.uuid === uuid) {
                fireball.destroy();
                break;
            }
        }
    }

    blink(tx, ty) {
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, 0.8);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        this.blink_coldtime = 5;
        this.move_length = 0;  // 闪现完停下来
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attacked(angle, damage) {
        for (let i = 0; i < 20 + Math.random() * 10; i ++ ) {
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
        if (this.radius < this.eps) {
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 0.8;
    }

    receive_attack(x, y, angle, damage, ball_uuid, attacker) {
        attacker.destroy_fireball(ball_uuid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }

    update() {
        this.spent_time += this.timedelta / 1000;

        this.update_win();

        if (this.character === "me" && this.playground.state === "fighting") {
            this.update_coldtime();
        }

        if (this.character === "me" && this.playground.focus_player === this) {
            // 如果是玩家，并且正在被聚焦，修改 background的 (cx, cy) 使玩家始终处于中央
            this.playground.re_cx_cy(this.x, this.y);
        }

        this.update_move();

        this.render();
    }

    update_win() {
        if (this.playground.state === "fighting" && this.character === "me" && this.playground.players.length === 1) {
            this.playground.state = "over";
            this.playground.score_board.win();
        }
    }

    update_coldtime() {
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }

    update_move() {  // 更新玩家移动, 冷静期为 5s
        if (this.character === "robot" && this.spent_time > 4 && Math.random() < 1 / 180) {
            // 敌人随机攻击，因每秒刷新60次，1/180的概率攻击，表示每3秒发射一次
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;  // AI 预判
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);
        }

        if (this.damage_speed > this.eps) {
            this.vx = this.vy = 0;
            this.move_length = 0; // 被攻击则暂时无法操纵角色移动
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (this.character === "robot") {
                    // let tx = Math.random() * this.playground.width / this.playground.scale;
                    // let ty = Math.random() * this.playground.height / this.playground.scale;
                    let tx = Math.random() * this.playground.virtual_map_width;
                    let ty = Math.random() * this.playground.virtual_map_height;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
    }

    render() {
        let scale = this.playground.scale;
        let ctx_x = this.x - this.playground.cx;
        let ctx_y = this.y - this.playground.cy; // 把虚拟地图中的坐标换算成canvas中的坐标
        if (ctx_x < -0.2 * this.playground.width / scale ||
            ctx_x > 1.2 * this.playground.width / scale ||
            ctx_y < -0.2 * this.playground.height / scale ||
            ctx_y > 1.2 * this.playground.height / scale) {
            if (this.character != "me") { // 一个隐藏的bug，如果是玩家自己并且return，会导致技能图标渲染不出来
                return;
            }
        }

        
        if (this.character !== "robot") {
            this.ctx.save();
            this.ctx.beginPath();
            // this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.arc(ctx_x * scale, ctx_y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (ctx_x - this.radius) * scale, (ctx_y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(ctx_x * scale, ctx_y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

        if (this.character === "me" && this.playground.state === "fighting") {
            this.render_skill_coldtime();
        }
    }

    render_skill_coldtime() {
        let scale = this.playground.scale;
        let x = 0.1, y = 0.9, r = 0.04;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.fireball_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }

        x = 0.2, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.blink_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 5) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }

    on_destroy() {
        if (this.character === "me") {
            if (this.playground.state === "fighting") {
                this.playground.state = "over";
                this.playground.score_board.lose();
            }
        }

        // this.playground.players.splice(this.playground.players.indexOf(this), 1);

        for (let i = 0; i < this.playground.players.length; i ++ ) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}
