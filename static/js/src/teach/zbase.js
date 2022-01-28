class AcGameTeach {
    constructor(root) {
        this.root = root;
        this.$teach = $(`
<div class="ac-game-teach">
    <div class="ac-game-game-teach">
        <div class="ac-game-game-teach-title">游戏说明</div>
        <p class="ac-game-game-teach-content">
        单人游戏由玩家与AI对战，多人游戏每局对战有3名玩家参与，击败所有其他玩家方可取胜。
        </p>
    </div>
    <div class="ac-game-op-teach">
        <div class="ac-game-op-teach-title">操作说明</div>
        <div class="ac-game-op-teach-content">
            <p>鼠标右键：移动</p>
            <p>鼠标左键：朝目标方向使用技能</p>
            <p>Q: 发射火球</p>
            <p>F：闪现</p>
            <p>Enter：多人游戏中开启局内聊天</p>
            <p>ECS：关闭多人游戏中聊天输入框</p>
            <p>左键小地图拖动：切地图</p>
            <p>1或space：小地图视角切回玩家</p>
        </div>
    </div>
    <div class="ac-game-teach-return">返回</div>
</div>
        `);
        this.$return = this.$teach.find('.ac-game-teach-return');

        this.$teach.hide();
        this.root.$ac_game.append(this.$teach);

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$return.click(function() {
            outer.hide();
            outer.root.menu.show();
        });
    }

    show() {
        this.$teach.show();
    }

    hide() {
        this.$teach.hide();
    }
}
