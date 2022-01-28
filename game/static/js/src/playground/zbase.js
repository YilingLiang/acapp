class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);
        this.focus_player = null; // 镜头聚焦玩家

        this.hide();
        this.root.$ac_game.append(this.$playground);

        this.start();
    }

    get_random_color() {
        let colors = ["pink", "grey", "orange", "LightSkyBlue", "cyan", "pink", "Moccasin", "PaleGreen", "Violet", "Tomato", "Silver"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i ++ ) {
            let x = parseInt(Math.floor(Math.random() * 10));  // 返回[0, 1)之间的数
            res += x;
        }
        return res;
    }

    start() {
        let outer = this;
        let uuid = this.create_uuid();
        $(window).on(`resize.${uuid}`, function() {
            outer.resize();
        });

        if (this.root.AcWingOS) {
            this.root.AcWingOS.api.window.on_close(function() {
                $(window).off(`resize.${uuid}`);
            });
        }
    }

    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;

        if (this.game_map) this.game_map.resize();
        if (this.mini_map) this.mini_map.resize();
    }

    re_cx_cy(x, y) { // 画到中心 
        this.cx = Math.max(x - 0.5 * this.width / this.scale, 0);
        this.cx = Math.min(this.cx, this.virtual_map_width - this.width / this.scale);
        this.cy = Math.max(y - 0.5 * this.height / this.scale, 0);
        this.cy = Math.min(this.cy, this.virtual_map_height - 1);
    }

    show(mode) {  // 打开playground界面
        let outer = this;
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.virtual_map_width = 4;
        this.virtual_map_height = this.virtual_map_width;
        this.game_map = new GameMap(this);

        this.mode = mode;
        this.state = "waiting";  // waiting -> fighting -> over
        this.notice_board = new NoticeBoard(this);
        this.score_board = new ScoreBoard(this);
        this.player_count = 0;

        this.resize();

        this.players = [];
        this.fireballs_in_playground = [];
        // this.snows = [];

        // this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));
        let player_x = Math.random() * this.virtual_map_width;
        while (player_x + 0.05 >= this.virtual_map_width || player_x - 0.05 <= 0) player_x = Math.random() * this.virtual_map_width;
        let player_y = Math.random() * this.virtual_map_height;
        while (player_y + 0.05 >= this.virtual_map_height || player_y - 0.05 <= 0) player_y = Math.random() * this.virtual_map_height;
        this.players.push(new Player(this, player_x, player_y, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));
        // 上代码的含义是随机出一个有效的位置
        //玩家被创建后需要的修改 // 根据玩家位置确定画布相对于虚拟地图的偏移量
        this.re_cx_cy(this.players[0].x, this.players[0].y);
        this.focus_player = this.players[0];

        if (mode === "single mode") {
            for (let i = 0; i < 10; i ++ ) {
                let px = Math.random() * this.virtual_map_width;
                let py = Math.random() * this.virtual_map_height;
                // this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
                this.players.push(new Player(this, px, py, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        } else if (mode === "multi mode") {
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;

            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            }; 
        }
        this.mini_map = new MiniMap(this);
        this.mini_map.resize();
    }

    hide() {  // 关闭playground界面
        while (this.players && this.players.length > 0) {
            this.players[0].destroy();
        }

        if(this.mini_map) {
            this.mini_map.destroy();
            this.mini_map = null;
        }

        if (this.game_map) {
            this.game_map.destroy();
            this.game_map = null;
        }

        if (this.notice_board) {
            this.notice_board.destroy();
            this.notice_board = null;
        }

        if (this.score_board) {
            this.score_board.destroy();
            this.score_board = null;
        }

        this.$playground.empty();

        this.$playground.hide();
    }
}
