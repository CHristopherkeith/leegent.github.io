/*
 * 预设数据
 * */
//最接近行星的轨道高度，轨道间隔
const FIRST_ORBIT = 50, ORBIT_INTERVAL = 60;

/*
 * 游戏控制台，用于输出信息
 */
var gameconsole = {
    self: $("#console"),
    // 日期时间补零
    D: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09"],
    // 获得当前时间
    getTime: function () {
        var time = new Date();
        return time.getFullYear() + "-" +
            (this.D[time.getMonth() + 1] || (time.getMonth() + 1)) + "-" +
            (this.D[time.getDate()] || time.getDate()) + " " +
            (this.D[time.getHours()] || time.getHours()) + ":" +
            (this.D[time.getMinutes()] || time.getMinutes()) + ":" +
            (this.D[time.getSeconds()] || time.getSeconds()) +
            "&nbsp;&nbsp;";
    },
    // 打印信息
    print: function (text, style) {
        var printText = this.getTime() + text;
        if (style == "fail") printText = "\<span class = 'console-text-fail'>" + printText + "\</span>";
        this.self.append($("<p>" + printText + "</p>"));
        this.self.scrollTop(this.self[0].scrollHeight);
    }
};

/*
 * BUS是新一代传播介质，速度快，丢包率低，但只能传递二进制数据
 * 采用了中介者模式和观察者模式
 */
var BUS = {
    // 存在于介质中的信息宿主
    observers: [],
    // 注册新飞船
    addObserver: function (newObserver) {
        this.observers.push(newObserver);
        this.observers.sort(function (a, b) {
            return a.getId() - b.getId();
        });
    },
    // 移除飞船
    removeObserver: function (rc) {
        for (var i = 0; i < this.observers.length; i++) {
            if (this.observers[i].getId() == rc.getId()) {
                this.observers.splice(i, 1);
                break;
            }
        }
    },
    // 收到信号后，延时300毫秒转发给飞船，同时有10%的概率丢失命令，但会一直重试以保证传递成功
    onReceive: function (cmd) {
        // 此处的cmd是一个二进制代码
        setTimeout(function () {
            // 保存当前函数
            var fn = arguments.callee;
            // 模拟10%丢包率
            var rnd = Math.random() * 100;
            //成功
            if (rnd >= 10) {
                for (var i = 0; i < BUS.observers.length; i++) {
                    BUS.observers[i].onReceiveMessage(cmd);
                }
            }
            // 发送失败
            else {
                if (cmd.length === 8) {
                    gameconsole.print("[发送失败] 您下达的\"" + cmd + "\"指令不幸丢失，正在尝试重传", "fail");
                }
                // 持续尝试重传
                setTimeout(fn, 300);
            }
        }, 300);
    },
    /* 
     * BUS适配器，提供给原mediator的用户，用于JSON命令格式与二进制传输格式之间的转换
     */
    adapter: {
        // 命令编码器：JSON->二进制
        encodeCommand: function (jsonCommand) {
            // 将JSON格式的指令转化成二进制码
            var bicmd = "";
            // 前四位标示飞船编号
            bicmd += parseInt(jsonCommand.id, 10).toString(2);
            while (bicmd.length < 4) bicmd = "0" + bicmd;
            // 后四位标示具体指令（0001：开始飞行，0010：停止飞行，1100：自我销毁）
            switch (jsonCommand.command) {
                case "move":
                    bicmd += "0001";
                    break;
                case "stop":
                    bicmd += "0010";
                    break;
                case "selfDestory":
                    bicmd += "1100";
                    break;
            }
            return bicmd;
        },
        // 命令译码器：二进制->JSON
        decodeCommand: function (binaryCommand) {
            var cmd = {};
            cmd.id = parseInt(binaryCommand.substr(0, 4), 2);
            // 后四位标示具体指令（0001：开始飞行，0010：停止飞行，1100：自我销毁）
            switch (binaryCommand.substr(4)) {
                case "0001":
                    cmd.command = "move";
                    break;
                case "0010":
                    cmd.command = "stop";
                    break;
                case "1100":
                    cmd.command = "selfDestory";
                    break;
            }
            return cmd;
        },
        // 飞船信息编码器
        encodeCraftInfo: function (jsonInfo) {
            // 将JSON格式的指令转化成二进制码
            var biInfo = "";
            // 前四位标示飞船编号
            biInfo += parseInt(jsonInfo.id, 10).toString(2);
            while (biInfo.length < 4) {
                biInfo = "0" + biInfo;
            }
            // 4~8位表示飞船状态
            if (jsonInfo.state === "MOVE") {
                biInfo += "0001";
            }
            else if (jsonInfo.state === "STAY") {
                biInfo += "0010";
            }
            else {
                biInfo += "1100";
            }
            // 后八位用于记录飞船剩余能源百分比
            var biEnergy = parseInt(jsonInfo.energy, 10).toString(2);
            while (biEnergy.length < 8) {
                biEnergy = "0" + biEnergy;
            }
            biInfo += biEnergy;
            return biInfo;
        },
        // 飞船信息译码器
        decodeCraftInfo: function (binaryInfo) {
            var jsonInfo = {};
            //  前四位是id
            jsonInfo.id = parseInt(binaryInfo.substr(0, 4), 2);
            // 接下来四位是状态
            if (binaryInfo.substr(4, 4) === "0001") {
                jsonInfo.state = "MOVE";
            }
            else if (binaryInfo.substr(4, 4) === "0010") {
                jsonInfo.state = "STAY";
            }
            else {
                jsonInfo.state = "DESTORY";
            }
            // 最后四位是能量标志
            jsonInfo.energy = parseInt(binaryInfo.substr(8), 2);
            return jsonInfo;
        }
    }
};

/*
 * 行星：行星上有指挥官、飞船工厂、信号接收器和数据中心
 */
var planet = {
    init: function () {
        // jquery对象
        this.self = $(".planet");
        // 行星距屏幕顶端距离
        this.top = parseInt(this.self.css("top").replace("px", ""));
        // 行星直径
        this.diameter = this.self.width();
        // 将行星上的信号接收器添加到BUS
        BUS.addObserver(this.signalReceiver);
    },
    /*
     * 指挥官，掌握着每艘船的命令面板，发布命令的功能
     */
    commander: {
        //（指挥官视角里存在的）飞船数量计数
        craftCount: 0,
        // 已被使用的飞船编号，用下标标识编号，内容表示是否可用。初始1-10都可用
        usedId: [true, true, true, true, true, true, true, true, true, true],
        //（指挥官视角里存在的）飞船对应的命令面板，元素格式为{id:id,cp:commandPanel}
        commandPanels: [],
        // 增加命令面板
        addCommandPanel: function (newId) {
            var cp = $("\<div id=" + newId + "-command' class='command-set'>\<span>对" + newId + "号飞船下达命令\</span><button id='sc" + newId + "-move'>飞行\</button><button id='sc" + newId + "-stop'>停止\</button><button id='sc" + newId + "-self-destory'>销毁\</button></div>").appendTo($("#command-area"));
            this.commandPanels.push({id: newId, cp: cp});
            var that = this;
            // 点击按钮信息传给指挥官
            $("#sc" + newId + "-move").click(function () {
                gameconsole.print(that.createCommand("move", newId));
            });
            $("#sc" + newId + "-stop").click(function () {
                gameconsole.print(that.createCommand("stop", newId));
            });
            $("#sc" + newId + "-self-destory").click(function () {
                gameconsole.print(that.createCommand("selfDestory", newId));
            });
        },
        // 移除命令面板
        removeCommandPanel: function (id) {
            for (var i = 0; i < this.commandPanels.length; i++) {
                if (this.commandPanels[i].id == id) {
                    this.commandPanels[i].cp.remove();
                    this.commandPanels.splice(i, 1);
                }
            }
        },
        // 下达命令
        createCommand: function (type, id) {
            var consoleText = "";
            switch (type) {
                // 创建飞船，查看动力、能源系统选项，作为参数传给飞船工厂
                case "create":
                    if (this.craftCount >= 4) {
                        consoleText = "将军，我们的太空战舰数量已达指挥上限！";
                    }
                    else {
                        var obj = {};
                        obj.drive = $("input[name='drive']:checked").val();
                        obj.power = $("input[name='power']:checked").val();
                        this.craftCount++;
                        var newId = planet.spacecraftFactory(obj);
                        consoleText = "新的飞船（编号：" + newId + "）已加入作战序列！目前我们共有" + this.craftCount + "艘太空飞船";
                    }
                    return consoleText; // 无需向mediator发送指令，故直接返回
                case "move":
                    consoleText = "命令" + id + "号飞船 开始飞行 的信号已发射";
                    break;
                case "stop":
                    consoleText = "命令" + id + "号飞船 停止移动 的信号已发射";
                    break;
                case "selfDestory":
                    this.craftCount--;
                    consoleText = "您已下令" + id + "号飞船自毁。目前我们还剩" + this.craftCount + "艘太空飞船";
                    // 指挥官认为飞船必然自爆，故直接移除命令面板
                    this.removeCommandPanel(id);
                    break;
            }
            // 向介质发射信号
            this.send({id: id, command: type});
            return consoleText;
        },
        // 用信号发射器向介质发射指令
        send: function (cmd) {
            BUS.onReceive(BUS.adapter.encodeCommand(cmd));
        }
    },
    /*
     * 飞船工厂，创造飞船，并且在指挥官视野里创建对应的控制面板，在数据中心加入新飞船。返回新飞船id
     */
    spacecraftFactory: function (o) {
        // 构造新船需要四个参数：id、speed、consume、charge
        var obj = {};
        //选择一个可用的编号
        var newId = planet.commander.usedId.indexOf(true) + 1;
        if (newId === -1) {
            alert("飞船数量超出上限！");
            return;
        }
        planet.commander.usedId[newId - 1] = false; // 占用该id
        obj.id = newId;
        obj.drive = parseInt(o.drive, 10);
        switch (obj.drive) {
            case 1:
                obj.speed = 30;
                obj.consume = 2;
                break;
            case 2:
                obj.speed = 50;
                obj.consume = 4;
                break;
            case 3:
                obj.speed = 80;
                obj.consume = 6;
                break;
        }
        obj.power = parseInt(o.power, 10);
        switch (obj.power) {
            case 1:
                obj.charge = 2;
                break;
            case 2:
                obj.charge = 3;
                break;
            case 3:
                obj.charge = 4;
                break;
        }
        // 创建新的飞船
        var sc = new Spacecraft(obj);
        Object.seal(sc); // 禁止增删飞船的属性
        // 在指挥面板添加对应的指令按钮
        planet.commander.addCommandPanel(newId);
        // 通知数据中心添加对新飞船的监控
        this.DC.addCraft(sc);
        // 返回新飞船的ID
        return newId;
    },
    /*
     * 信号接收器
     */
    signalReceiver: {
        // 将其ID设为0
        getId: function () {
            return 0;
        },
        onReceiveMessage: function (binaryInfo) {
            if (binaryInfo.length === 8) return; // 忽略命令广播
            planet.DC.display(binaryInfo);
        }
    },
    /*
     * 数据处理中心，展示飞船状态
     */
    DC: {
        // 持有jquery对象
        table: $("#screen-table"),
        // 飞船数量
        craftCount: 0,
        // 飞船id，下标+1表示飞船对应的表格行
        crafts: [],
        // 动力、能源系统、状态展示名
        driveSystems: ["Unknown", "红警号", "星际号", "三体号"],
        powerSystems: ["Unknown", "光能型", "以太型", "核聚型"],
        state: {
            MOVE: "飞行中",
            STAY: "悬停中",
            DESTORY:"待销毁"
        },
        // 展示飞船状态
        display: function (binaryInfo) {
            var that = this;
            // 调用适配器解码二进制信息
            var jsonInfo = BUS.adapter.decodeCraftInfo(binaryInfo);
            // 取出飞船信息所在行
            var lineNum = this.crafts.indexOf(jsonInfo.id)+1;
            var line = this.table.find("tr:eq(" + lineNum + ")");
            // 更新飞船状态和能源
            line.children("td:eq(3)").text(this.state[jsonInfo.state]);
            line.children("td:eq(4)").text(jsonInfo.energy+"%");
            // 若是待摧毁的飞船信息，1秒后移除该飞船信息
            if(jsonInfo.state === "DESTORY") setTimeout(function () {
                that.removeCraft(jsonInfo.id)
            },1000);
        },
        // 添加新飞船
        addCraft: function (sc) {
            // 添加到表格里
            this.table.children("tbody").append("\<tr><td>" + sc.getId() + "\</td><td>" + this.driveSystems[sc.getSystemType().drive] + "\</td><td>" + this.powerSystems[sc.getSystemType().power] + "\</td><td>" + this.state["STAY"] + "\</td><td>100%</td></tr>");
            this.craftCount++;
            this.crafts.push(sc.getId());
        },
        /**
         * 移除飞船
         * @param {Number} id
         */
        removeCraft: function (id) {
            this.table.find("tr:eq(" + (this.crafts.indexOf(id)+1) + ")").remove();
            this.crafts.splice(this.crafts.indexOf(id),1);
        }
    }
};

/**
 * 飞船的构造函数
 * 飞船共有三个内部系统：能源，动力，控制。前两个系统互不访问，由控制系统集中管理
 * 控制系统向上承接指令，向下指挥其他系统执行指令。自毁功能也在控制系统内
 * 内部变量和函数用下划线表示，建议不直接访问（本来打算用闭包封装，但这样无法使用原型继承，对内存开销有影响）
 * 飞船暴露给外界的接口有3个：getId(),getSystemType()和onReceiveMessage()
 * @param obj
 * @constructor
 */
function Spacecraft(obj) {
    // 注意构造函数里的this会被指向新创建的对象
    var that = this; // 用于在销毁自身的函数里放一个指向飞船对象的指针，见_controller的_selfDestory函数

    // 计算飞船轨道(距行星表面的高度）
    this._orbit = FIRST_ORBIT + (obj.id - 1) * ORBIT_INTERVAL;

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
            // 停止定时以消除闭包
            // 删除DOM结点
            that._self.remove();
            // 取消介质订阅（该飞船不再存在于介质中，就可以认为它不存在了）
            BUS.removeObserver(that);
            // 归还id
            planet.commander.usedId[that._id - 1] = true;
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
    // 将自己添加到BUS中
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

$(document).ready(function () {
    /******绑定创建飞船事件******/
    $("#create").bind("click", function () {
        gameconsole.print(planet.commander.createCommand("create"));
    });
    // decodeC始化行星
    planet.init();
});