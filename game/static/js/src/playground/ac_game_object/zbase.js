let AC_GAME_OBJECTS = [];
class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);
        this.has_called_start = false; // 是否执行过start函数,如果没有则只执行一次，此后只执行更新函数就可，其实就是将第一帧单独处理
        this.timedelta = 0; // 当前帧距离上一帧的时间间隔
    }

    start () { // 只会在第一帧执行一次
    }

    update() { // 每一帧均执行一次
    }

    on_destory() { // 在被删除销毁之前会执行一次 
        
    }
    destory() { // 删除一个物体
        this.on_destory();
        AC_GAME_OBJECTS.splice(AC_GAME_OBJECTS.indexOf(this), 1);

        // for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
        //     if (AC_GAME_OBJECTS[i] === this) {
        //         AC_GAME_OBJECTS.splice(i, 1);
        //         break;
        //     }
        // }
    }
}

let last_timestamp;
let AC_GAME_ANIMATION = function(timestamp) {

    for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ){
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start) {
            obj.start(); obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;

    requestAnimationFrame(AC_GAME_ANIMATION); // 递归渲染
}

requestAnimationFrame(AC_GAME_ANIMATION);
