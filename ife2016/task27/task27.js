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
 * */
var BUS = {
    // 全体飞船
    crafts: [],
    // 注册新飞船
    addCraft: function (newCraft) {
        this.crafts.push(newCraft);
        this.crafts.sort(function (a, b) {
            return a.getId() - b.getId();
        });
    },
    // 移除飞船
    removeCraft: function (rc) {
        for (var i = 0; i < this.crafts.length; i++) {
            if (this.crafts[i].getId() == rc.getId()) {
                this.crafts.splice(i, 1);
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
                for (var i = 0; i < BUS.crafts.length; i++) {
                    BUS.crafts[i].executeCommand(cmd);
                }
            }
            // 发送失败
            else {
                gameconsole.print("[发送失败] 您下达的\"" + cmd + "\"指令不幸丢失，正在尝试重传", "fail");
                // 持续尝试重传
                setTimeout(fn, 300);
            }
        }, 300);
    },
    /* 
     * BUS适配器，提供给原mediator的用户，用于JSON命令格式与二进制传输格式之间的转换
     */
    adapter : {
        // 编码器：JSON->二进制
        encode : function(jsonCommand){
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
        // 译码器：二进制->JSON
        decode : function (binaryCommand){
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
        }
    }
};
 
/*
 * 行星：行星上有指挥官、飞船工厂
 */
var planet = {
    init:function(){
        // jquery对象
        this.self = $(".planet");
        // 行星距屏幕顶端距离
        this.top = parseInt(this.self.css("top").replace("px", ""));
        // 行星直径
        this.diameter = this.self.width();
    },
    /*
     * 指挥官，掌握着每艘船的命令面板，发布命令的功能
     */
    commander : {
        //（指挥官视角里存在的）飞船数量计数
        craftCount: 0,
        //（指挥官视角里存在的）飞船对应的命令面板，元素格式为{id:id,cp:commandPanel}
        commandPanels: [],
        // 增加命令面板
        addCommandPanel:function(newId){
            var cp = $("\<div id=" + newId + "-command' class='command-set'>\<span>对" + newId + "号飞船下达命令\</span><button id='sc" + newId + "-move'>飞行\</button><button id='sc" + newId + "-stop'>停止\</button><button id='sc" + newId + "-self-destory'>销毁\</button></div>").appendTo($("#command-area"));
            this.commandPanels.push({id: newId, cp: cp});
            var that =this;
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
        removeCommandPanel:function(id){
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
            BUS.onReceive(BUS.adapter.encode(cmd));
        }
    },
    /*
     * 飞船工厂，创造飞船并且在指挥官视野里创建对应的控制面板，返回新飞船id
     */
    spacecraftFactory:function(o) {
        // 构造新船需要四个参数：id、speed、consume、charge
        var obj = {};
        var newId = -1;
        //选择一个空闲的编号
        if (BUS.crafts.length == 0) newId = 1;
        else {
            for (var i = 0; i < BUS.crafts.length; i++) {
                if (BUS.crafts[i].getId() > i + 1) {
                    newId = i + 1;
                    break;
                }
            }
            if (newId === -1) newId = BUS.crafts.length + 1;
        }
        // 设置用于构造新船的属性
        obj.id = newId;
        switch (parseInt(o.drive, 10)) {
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
        switch (parseInt(o.power, 10)) {
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
        
        // 返回新飞船的ID
        return newId;
    }
};

/*
 * 飞船的构造函数
 * 飞船共有三个内部系统：能源，动力，控制。前两个系统互不访问，由控制系统集中管理
 * 控制系统向上承接指令，向下指挥其他系统执行指令。自毁功能也在控制系统内
 * 内部变量和函数用闭包封装起来，外界无法访问
 * 飞船暴露给外界的接口有2个：getId()和executeCommand()
 */
function Spacecraft (obj) {
    var that = this; // 用于在销毁自身的函数里放一个指向飞船对象的指针，见_controller的_selfDestory函数

    // 计算飞船轨道(距行星表面的高度）
    var _orbit = FIRST_ORBIT + (obj.id - 1) * ORBIT_INTERVAL;

    //飞船的编号
    var _id = obj.id;
    //当前状态:"MOVE","STAY"两种
    var _state = "STAY";
    //创造DOM对象(jQuery)并与此关联
    var _self = $("\<div class='spacecraft' id=sc" + obj.id + ">\<div class='spacecraft-tailwing'></div>\<div class='spacecraft-cabin'>\<span class='spacecraft-info'>" + obj.id + "号-\<span class='spacecraft-energy'>100</span>%</span></div></div>").appendTo($("#universe")).css({
        "top": planet.top + planet.diameter + _orbit + "px",
        "transform-origin": "50% " + (-( planet.diameter / 2 + _orbit)) + "px"
    });
    //尾部火焰
    var _firetail = $("\<div class='spacecraft-firetail'></div>").appendTo(_self);
    _self.spacecraft = this;
    /*
     * 动力系统，保存飞船的姿态信息，执行飞行
     */
    var _driveSystem = {
        //飞船姿态（角度）
        _angle: 0,
        //速度，单位为px/100毫秒
        _speed: obj.speed / 10,
        //角速度
        _angleSpeed: 0,
        //计算角速度的函数，用余弦定理
        _calculateAS: function () {
            // 获得飞船轨道半径
            var radius = planet.diameter / 2 + _orbit;
            _driveSystem._angleSpeed = Math.acos(1 - _driveSystem._speed * _driveSystem._speed / (2 * radius * radius)) * 180 / Math.PI;
        },
        //飞行一步
        _moveOnce: function () {
            _driveSystem._angle = (_driveSystem._angle + _driveSystem._angleSpeed) % 360;
            _self.css("transform", "rotate(" + _driveSystem._angle + "deg)");
        }
    };
    /*
     * 能源系统，保存能源信息，执行蓄能和耗能
     */
    var _powerSystem = {
        //能源，单位为百分比，取值0到100
        _energy: 100,
        //消耗能源速度，单位为百分比/秒
        _consumeVelocity: obj.consume,
        //充电速度，单位为百分比/秒
        _chargeVelocity: obj.charge,
        //充电一下
        _chargeOnce: function () {
            var energyText = _self.find(".spacecraft-energy");
            _powerSystem._energy = Math.min(_powerSystem._energy + _powerSystem._chargeVelocity, 100);
            energyText.text(_powerSystem._energy);
            // 能量充满，通知控制中心
            if (_powerSystem._energy == 100) {
                _controller._informed("full_power");
            }
        },
        //飞行耗电一下
        _consumeOnce: function () {
            var energyText = _self.find(".spacecraft-energy");
            _powerSystem._energy = Math.max(_powerSystem._energy - _powerSystem._consumeVelocity, 0);
            energyText.text(_powerSystem._energy);
            // 能量耗尽，通知控制中心
            if (!_powerSystem._hasEnoughEnergy()) {
                _controller._informed("low_power");
            }
        },
        //能源是否足够一次飞行
        _hasEnoughEnergy: function () {
            return _powerSystem._energy >= _powerSystem._consumeVelocity;
        }
    };
    /*
     * 控制系统，负责掌控飞船的飞行与能源。飞船收到的命令都交由控制系统执行
     */
    var _controller = {
        // 飞行和能源定时器
        _driveTimer: function () {
        },
        _powerTimer: function () {
        },
        // 飞行
        _move: function () {
            // 检查状态，如在飞，则啥也不做
            if (_state == "MOVE") return;
            // 如能源不足，则不飞
            if (!_powerSystem._hasEnoughEnergy()) {
                _controller._informed("low_power");
                return;
            }
            // 计算一下角速度
            _driveSystem._calculateAS();
            // 开始飞行
            _state = "MOVE";
            clearInterval(_controller._powerTimer);
            _controller._driveTimer = setInterval(function () {
                _driveSystem._moveOnce();
            }, 100);
            _controller._powerTimer = setInterval(function () {
                _powerSystem._consumeOnce();
            }, 1000);
            //尾部火焰可见
            _firetail.css("display","block");
        },
        // 停止
        _stop: function () {
            // 检查状态，如停着，则啥也不做
            if (_state === "STAY") return;
            _state = "STAY";
            // 停飞
            clearInterval(_controller._driveTimer);
            // 能源系统停止
            clearInterval(_controller._powerTimer);
            // 开始充电
            _controller._powerTimer = setInterval(function () {
                _powerSystem._chargeOnce();
            }, 1000);
            //尾部火焰不可见
            _firetail.css("display","none");
        },
        // 来自飞船内部的信息
        _informed: function (info) {
            switch (info) {
                // 能量耗尽，停飞
                case "low_power":
                    _controller._stop();
                    gameconsole.print(_id + "号飞船 能量耗尽，停飞蓄能");
                    break;
                // 能量充满，停止充电
                case "full_power":
                    clearInterval(_controller._powerTimer);
                    gameconsole.print(_id + "号飞船 能量已充满");
                    break;
            }
        },
        // 自毁
        _selfDestory: function () {
            // 停止定时以消除闭包
            if(_state === "MOVE") clearInterval(_controller._driveTimer);
            clearInterval(_controller._powerTimer);
            // 删除DOM结点
            _self.remove();
            // 取消介质订阅（该飞船不再存在于介质中，就可以认为它不存在了）
            BUS.removeCraft(that);
        }
    };
    /*
     * 飞船对外提供两个接口
     * */
    // 1.获取飞船id
    this.getId = function () {
        return _id;
    };
    // 2.接收并执行命令
    this.executeCommand = function (bicmd) {
        // 解码
        var cmd = BUS.adapter.decode(bicmd);
        if (cmd.id != _id) return;
        var text;
        switch (cmd.command) {
            case "move":
                _controller._move();
                text = _id + "号飞船 开始飞行";
                break;
            case "stop":
                _controller._stop();
                text = _id + "号飞船 停止移动";
                break;
            case "selfDestory":
                text = _id + "号飞船 已自爆";
                _controller._selfDestory();
                break;
        }
        gameconsole.print(text);
    };
    // 在介质那里注册
    BUS.addCraft(this);
}

$(document).ready(function () {
    /******绑定创建飞船事件******/
    $("#create").bind("click", function () {
        gameconsole.print(planet.commander.createCommand("create"));
    });
    // 初始化行星
    planet.init();
});