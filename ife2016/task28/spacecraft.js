/**
 * 模块4.飞船的构造函数
 * 飞船共有三个内部系统：能源，动力，控制。前两个系统互不访问，由控制系统集中管理
 * 控制系统向上承接指令，向下指挥其他系统执行指令。自毁功能也在控制系统内
 * 内部变量和函数用下划线表示，建议不直接访问（本来打算用闭包封装，但这样无法使用原型继承，对内存开销有影响）
 * 飞船暴露给外界的接口有3个：getId(),getSystemType()和onReceiveMessage()
 * 飞船的初始化参数一概由飞船工厂提供，各处注册也基本由工厂负责，除了BUS那里（可以这样理解，飞船一诞生就自动存在于介质中，销毁时也自动从BUS消失，并不是通过工厂代劳）
 * @param obj
 * @constructor
 */
function Spacecraft(obj) {
    // 注意构造函数里的this会被指向新创建的对象
    var that = this; // 用于在销毁自身的函数里放一个指向飞船对象的指针，见_controller的_selfDestory函数

    // 计算飞船轨道(距行星表面的高度）
    this._orbit = obj.orbit;

    //飞船的编号
    this._id = obj.id;
    //当前状态:"MOVE","STAY","DESTORY"三种
    this._state = "STAY";
    //创造DOM对象(jQuery)并与此关联
    this._self = $("\<div class='spacecraft' id=sc" + obj.id + ">\<div class='spacecraft-tailwing'></div>\<div class='spacecraft-cabin'>\<span class='spacecraft-info'>" + obj.id + "号-\<span class='spacecraft-energy'>100</span>%</span></div></div>").appendTo($("#universe")).css({
        "top": planet.top + planet.diameter + this._orbit + "px",
        "transform-origin": "50% " + (-( planet.diameter / 2 + this._orbit)) + "px"
    });
    //尾部火焰
    this._firetail = $("\<div class='spacecraft-firetail'></div>").appendTo(this._self);
    this._self.spacecraft = this;
    /*
     * 动力系统，保存飞船的姿态信息，执行飞行
     */
    this._driveSystem = {
        //动力系统类型
        _type: obj.drive,
        //飞船姿态（角度）
        _angle: 0,
        //速度，单位为px/100毫秒
        _speed: obj.speed / 10,
        //角速度
        _angleSpeed: 0,
        //计算角速度的函数，用余弦定理
        _calculateAS: function () {
            // 获得飞船轨道半径
            var radius = planet.diameter / 2 + that._orbit;
            that._driveSystem._angleSpeed = Math.acos(1 - that._driveSystem._speed * that._driveSystem._speed / (2 * radius * radius)) * 180 / Math.PI;
        },
        //飞行一步
        _moveOnce: function () {
            that._driveSystem._angle = (that._driveSystem._angle + that._driveSystem._angleSpeed) % 360;
            that._self.css("transform", "rotate(" + that._driveSystem._angle + "deg)");
        }
    };
    /*
     * 能源系统，保存能源信息，执行蓄能和耗能
     */
    this._powerSystem = {
        // 能源系统类型
        _type: obj.power,
        //能源，单位为百分比，取值0到100
        _energy: 100,
        //消耗能源速度，单位为百分比/秒
        _consumeVelocity: obj.consume,
        //充电速度，单位为百分比/秒
        _chargeVelocity: obj.charge,
        //充电一下
        _chargeOnce: function () {
            var energyText = that._self.find(".spacecraft-energy");
            that._powerSystem._energy = Math.min(that._powerSystem._energy + that._powerSystem._chargeVelocity, 100);
            energyText.text(that._powerSystem._energy);
            // 能量充满，通知控制中心
            if (that._powerSystem._energy == 100) {
                that._controller._informed("full_power");
            }
        },
        //飞行耗电一下
        _consumeOnce: function () {
            var energyText = that._self.find(".spacecraft-energy");
            that._powerSystem._energy = Math.max(that._powerSystem._energy - that._powerSystem._consumeVelocity, 0);
            energyText.text(that._powerSystem._energy);
            // 能量耗尽，通知控制中心
            if (!that._powerSystem._hasEnoughEnergy()) {
                that._controller._informed("low_power");
            }
        },
        //能源是否足够一次飞行
        _hasEnoughEnergy: function () {
            return that._powerSystem._energy >= that._powerSystem._consumeVelocity;
        }
    };
    /*
     * 控制系统，负责掌控飞船的飞行与能源。飞船收到的命令都交由控制系统执行
     */
    this._controller = {
        // 飞行和能源定时器
        _driveTimer: function () {
        },
        _powerTimer: function () {
        },
        // 飞行
        _move: function () {
            // 检查状态，如在飞，则啥也不做
            if (that._state == "MOVE") return;
            // 如能源不足，则不飞
            if (!that._powerSystem._hasEnoughEnergy()) {
                that._controller._informed("low_power");
                return;
            }
            // 计算一下角速度
            that._driveSystem._calculateAS();
            // 开始飞行
            that._state = "MOVE";
            clearInterval(that._controller._powerTimer);
            that._controller._driveTimer = setInterval(function () {
                that._driveSystem._moveOnce();
            }, 100);
            that._controller._powerTimer = setInterval(function () {
                that._powerSystem._consumeOnce();
            }, 1000);
            //尾部火焰可见
            that._firetail.css("display", "block");
        },
        // 停止
        _stop: function () {
            // 检查状态，如停着，则啥也不做
            if (that._state === "STAY") return;
            that._state = "STAY";
            // 停飞
            clearInterval(that._controller._driveTimer);
            // 能源系统停止
            clearInterval(that._controller._powerTimer);
            // 开始充电
            that._controller._powerTimer = setInterval(function () {
                that._powerSystem._chargeOnce();
            }, 1000);
            //尾部火焰不可见
            that._firetail.css("display", "none");
        },
        // 来自飞船内部的信息
        _informed: function (info) {
            switch (info) {
                // 能量耗尽，停飞
                case "low_power":
                    that._controller._stop();
                    gameconsole.print(that._id + "号飞船 能量耗尽，停飞蓄能");
                    break;
                // 能量充满，停止充电
                case "full_power":
                    clearInterval(that._controller._powerTimer);
                    gameconsole.print(that._id + "号飞船 能量已充满");
                    break;
            }
        },
        // 自毁
        _selfDestory: function () {
            if (that._state === "MOVE") clearInterval(that._controller._driveTimer);
            clearInterval(that._controller._powerTimer);
            // 将状态改为“待摧毁”
            that._state = "DESTORY";
            // 停止发送自身状态
            clearInterval(that._signalSender);
            // 发送一条“待摧毁”信息
            BUS.onReceive(BUS.adapter.encodeCraftInfo({
                id: that._id,
                state: that._state,
                energy: that._powerSystem._energy
            }));
            // 删除DOM结点
            that._self.remove();
            // 取消介质订阅（该飞船不再存在于介质中，就可以认为它不存在了）
            BUS.removeObserver(that);
        }
    };
    /*
     * 信号发射器，通过介质广播自身状态，一直运行直到飞船销毁
     */
    this._signalSender = setInterval(function () {
        var info = {
            id: that._id,
            state: that._state,
            energy: that._powerSystem._energy
        };
        BUS.onReceive(BUS.adapter.encodeCraftInfo(info));
    }, 1000);
    // 将自己注册到BUS中
    BUS.addObserver(this);
}
/*
 * 飞船对外提供的接口
 * */
// 1.获取飞船id
Spacecraft.prototype.getId = function () {
    return this._id;
};
// 2.获取飞船能源和动力系统
Spacecraft.prototype.getSystemType = function () {
    return {
        drive: this._driveSystem._type,
        power: this._powerSystem._type
    };
}
// 3.接收并执行命令
Spacecraft.prototype.onReceiveMessage = function (bicmd) {
    // 判断信息长度，8位的才是命令，16位的是飞船状态广播
    if (bicmd.length === 16) return; // 忽略状态广播信息
    // 解码
    var cmd = BUS.adapter.decodeCommand(bicmd);
    if (cmd.id != this._id) return;
    var text;
    switch (cmd.command) {
        case "move":
            this._controller._move();
            text = this._id + "号飞船 开始飞行";
            break;
        case "stop":
            this._controller._stop();
            text = this._id + "号飞船 停止移动";
            break;
        case "selfDestory":
            text = this._id + "号飞船 已自爆";
            this._controller._selfDestory();
            break;
    }
    gameconsole.print(text);
}