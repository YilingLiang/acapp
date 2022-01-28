class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <video class="yljbg" src="https://app817.acapp.acwing.com.cn/static/videos/ylj2.mp4" loop autoplay muted></video>
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            单人模式
        </div> 
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
            多人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-teach">
            游戏说明
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-exit">
            退出
        </div>
    </div>
</div>
`);
        this.$menu.hide();
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$exit = this.$menu.find('.ac-game-menu-field-item-exit');
        this.$teach = this.$menu.find('.ac-game-menu-field-item-teach');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });
        this.$multi_mode.click(function(){
            console.log("click multi mode");
            outer.hide();
            outer.root.playground.show("multi mode");
        });
        this.$exit.click(function(){
            console.log("click exit");
            outer.root.settings.logout_on_remote();
        });
        this.$teach.click(function(){
            outer.hide();
            outer.root.teach.show();
        });
    }

    show() {  // 显示menu界面
        this.$menu.show();
    }

    hide() {  // 关闭menu界面
        this.$menu.hide();
    }
}

