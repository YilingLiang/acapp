class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);

        this.hide();
        this.root.$ac_game.append(this.$playground);

        this.start();
    }

    get_random_color() {
        let colors = ["blue", "grey", "red", "pink", "green", "orange"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    start() {
        let outer = this;
        $(window).resize(function() {
            outer.resize();
        });
    }

    resize() {
        // console.log("resize size of window");
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = 16 * unit;
        this.height = 9 * unit;
        this.scale = this.height;

        if (this.game_map) this.game_map.resize();
    }

    update() {
    }

    show(mode) { // 打开 playground 界面
        let outer = this;
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);

        this.mode = mode;
        this.state = "waiting"; // waiting -> fighting -> over
        this.player_count = 0;
        
        this.notice_board = new NoticeBoard(this);
        this.resize();

        this.players = [];
        this.fireballs = []; // 存储攻击的火球
        this.players.push(new Player(this, this.width / 2 / this.scale, this.height / 2 / this.scale, this.height * 0.05 / this.scale, "white", this.height * 0.15 / this.scale, "me", this.root.settings.username, this.root.settings.photo));
        if (mode === "single mode"){
            for (let i = 0; i < 5; i ++ ){
                this.players.push(new Player(this, this.width / 2 / this.scale, this.height / 2 / this.scale, this.height * 0.05 / this.scale, this.get_random_color(), this.height * 0.15 / this.scale, "robot"));
            }
        } else if (mode === "multi mode") {
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            this.mps.ws.onopen = function(){
                // 连接创建成功后向后端发送消息
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);

            };
        }
    }

    hide() { // 关闭 playground 界面
        this.$playground.hide();
    }
}


