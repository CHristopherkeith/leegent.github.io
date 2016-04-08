/*
* 预设数据
* */
//最接近行星的轨道高度，轨道间隔
var firstOrbit = 50,orbitInterval = 60;

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
    print: function (text,style) {
        var printText = this.getTime() + text ;
        if(style == "fail") printText = "\<span class = 'console-text-fail'>"+printText+"\</span>";
        this.self.append($("<p>" + printText + "</p>"));
        this.self.scrollTop(this.self[0].scrollHeight);
    }
};

/*
 * Mediator，实质是个代理，从信号发射器接收命令，广播给所有飞船
 */
var mediator = {
    // 全体飞船
    crafts: [],
    // 注册新飞船
    addCraft: function (newCraft) {
        this.crafts.push(newCraft);
        this.crafts.sort(function (a, b) {
            return a.getId() - b.getId()
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
    // 收到信号后，延时1秒转发给飞船，同时有30%的概率丢失命令
    onReceive: function (cmd) {
        setTimeout(function () {
            // 模拟30%丢包率
            var rnd = Math.random() * 100;
            //成功
            if (rnd >= 30) {
                for (var i = 0; i < mediator.crafts.length; i++) {
                    mediator.crafts[i].executeCommand(cmd);
                }
            }
            // 丢包
            else {
                gameconsole.print("[发送失败] 您对" + cmd.id + "号飞船下达的\"" + cmd.command + "\"指令不幸丢失","fail");
            }
        }, 1000);
    }
};

/*
 * 指挥官，掌握着每艘船的命令面板，发布命令的功能
 */
var commander = {
    //（指挥官视角里存在的）飞船数量计数
    craftCount: 0,
    //（指挥官视角里存在的）飞船对应的命令面板，元素格式为{id:id,cp:commandPanel}
    commandPanels: [],
    // 下达命令
    createCommand: function (type, id) {
        var consoleText = "";
        switch (type) {
            case "create":
                if (this.craftCount >= 4) {
                    consoleText = "将军，我们的太空战舰数量已达指挥上限！";
                }
                else {
                    this.craftCount++;
                    var newId = spacecraftFactory().getId();
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
                // 移除该飞船的命令界面
                for (var i = 0; i < this.commandPanels.length; i++) {
                    if (this.commandPanels[i].id == id) {
                        this.commandPanels[i].cp.remove();
                        this.commandPanels.splice(i, 1);
                    }
                }
                break;
        }
        // 向mediator发射信号
        this.send({id: id, command: type});
        return consoleText;
    },
    // 用信号发射器向mediator发射指令
    send: function (cmd) {
        mediator.onReceive(cmd);
    }
};

/*
 * 飞船的构造函数
 * 飞船共有三个内部系统：能源，动力，控制。前两个系统互不访问，由控制系统集中管理
 * 控制系统向上承接指令，向下指挥其他系统执行指令。自毁功能也在控制系统内
 * 飞船暴露给外界的接口有2个：getId()和executeCommand()
 */
var Spacecraft = function (id) {
    var planet = $(".planet");
    var planetTop = parseInt(planet.css("top").replace("px", "")), planetDiameter = planet.width();
    // 创造飞船形象并放在初始位置
    var self = $("\<div class='spacecraft' id=sc" + id + ">\<div class='spacecraft-tailwing'></div>\<div class='spacecraft-cabin'>\<span class='spacecraft-info'>" + id + "号-\<span class='spacecraft-energy'>100</span>%</span></div></div>");
    // 计算飞船轨道(距行星表面的高度）
    var orbit = firstOrbit + (id - 1) * orbitInterval;
    self.appendTo($("#universe")).css({
        "top": planetTop + planetDiameter + orbit + "px",
        "transform-origin": "50% " + (-( planetDiameter / 2 + orbit)) + "px"
    });
    var craft = {
        //飞船的编号
        _id: id,
        //当前状态:"MOVE","STAY"两种
        _state: "STAY",
        //创造DOM对象(jQuery)并与此关联
        _self: self,
        /*
         * 动力系统，保存飞船的姿态信息，执行飞行
         */
        _driveSystem: {
            //飞船的轨道高度
            _orbit: orbit,
            //飞船姿态（角度）
            _angle: 0,
            //速度，单位为px/100毫秒
            _speed: 4,
            //角速度
            _angleSpeed: 0,
            //计算角速度的函数，用余弦定理
            _calculateAS: function () {
                // 获得飞船轨道半径
                var radius = $(".planet").width() / 2 + this._orbit;
                this._angleSpeed = Math.acos(1 - this._speed * this._speed / (2 * radius * radius)) * 180 / Math.PI;
            },
            //飞行一步
            _moveOnce: function () {
                this._angle = (this._angle + this._angleSpeed) % 360;
                craft._self.css("transform", "rotate(" + this._angle + "deg)");
            }
        },
        /*
         * 能源系统，保存能源信息，执行蓄能和耗能
         */
        _powerSystem: {
            //能源，单位为百分比，取值0到100
            _energy: 100,
            //消耗能源速度，单位为百分比/秒
            _consumeVelocity: 4,
            //充电速度，单位为百分比/秒
            _chargeVelocity: 2,
            //充电一下
            _chargeOnce: function () {
                var energyText = craft._self.find(".spacecraft-energy");
                this._energy = Math.min(this._energy + this._chargeVelocity, 100);
                energyText.text(this._energy);
                // 能量充满，通知控制中心
                if (this._energy == 100) {
                    craft._controller._informed("full_power");
                }
            },
            //飞行耗电一下
            _consumeOnce: function () {
                var energyText = craft._self.find(".spacecraft-energy");
                this._energy = Math.max(this._energy - this._consumeVelocity, 0);
                energyText.text(this._energy);
                // 能量耗尽，通知控制中心
                if (!this._hasEnoughEnergy()) {
                    craft._controller._informed("low_power");
                }
            },
            //能源是否足够一次飞行
            _hasEnoughEnergy: function () {
                return this._energy >= this._consumeVelocity;
            }
        },
        /*
         * 控制系统，负责掌控飞船的飞行与能源。飞船收到的命令都交由控制系统执行
         */
        _controller: {
            // 飞行和能源定时器
            _driveTimer: function () {
            },
            _powerTimer: function () {
            },
            // 飞行
            _move: function () {
                // 检查状态，如在飞，则啥也不做
                if (craft._state == "MOVE") return;
                // 如能源不足，则不飞
                if (!craft._powerSystem._hasEnoughEnergy()) {
                    this._informed("low_power");
                    return;
                }
                // 计算一下角速度
                craft._driveSystem._calculateAS();
                // 开始飞行
                craft._state = "MOVE";
                clearInterval(this._powerTimer);
                this._driveTimer = setInterval(function () {
                    craft._driveSystem._moveOnce();
                }, 100);
                this._powerTimer = setInterval(function () {
                    craft._powerSystem._consumeOnce();
                }, 1000);
            },
            // 停止
            _stop: function () {
                // 检查状态，如停着，则啥也不做
                if (craft._state == "STAY") return;
                craft._state = "STAY";
                // 停飞
                clearInterval(this._driveTimer);
                // 能源系统停止
                clearInterval(this._powerTimer);
                // 开始充电
                this._powerTimer = setInterval(function () {
                    craft._powerSystem._chargeOnce();
                }, 1000);
            },
            // 来自飞船内部的信息
            _informed: function (info) {
                switch (info) {
                    // 能量耗尽，停飞
                    case "low_power":
                        this._stop();
                        gameconsole.print(craft._id + "号飞船 能量耗尽，停飞蓄能");
                        break;
                    // 能量充满，停止充电
                    case "full_power":
                        clearInterval(this._powerTimer);
                        gameconsole.print(craft._id + "号飞船 能量已充满");
                        break;
                }
            },
            // 自毁
            _selfDestory: function () {
                // 删除DOM结点
                craft._self.remove();
                // 取消mediator订阅（该飞船不再存在于mediator中，就可以认为它不存在了）
                mediator.removeCraft(craft);
            }
        },
        /*
         * 下面是飞船对外提供的两个接口
         * */
        // 获取飞船id
        getId: function () {
            return craft._id;
        },
        // 接收并执行命令
        executeCommand: function (cmd) {
            if (cmd.id != craft._id) return;
            var text;
            switch (cmd.command) {
                case "move":
                    craft._controller._move();
                    text = craft._id + "号飞船 开始飞行";
                    break;
                case "stop":
                    craft._controller._stop();
                    text = craft._id + "号飞船 停止移动";
                    break;
                case "selfDestory":
                    text = craft._id + "号飞船 已自爆";
                    craft._controller._selfDestory();
                    break;
            }
            gameconsole.print(text);
        }
    };
    self.spacecraft = craft;
    // 在mediator那里注册
    mediator.addCraft(craft);
    return craft;
};

/*
 * 飞船工厂，选择一个编号创造飞船，并且在指挥官视野里创建控制面板
 */
function spacecraftFactory() {
    var newId = -1;
    //选择一个空闲的编号
    if (mediator.crafts.length == 0) newId = 1;
    else {
        for (var i = 0; i < mediator.crafts.length; i++) {
            if (mediator.crafts[i].getId() > i + 1) {
                newId = i + 1;
                break;
            }
        }
        if (newId === -1) newId = mediator.crafts.length + 1;
    }
    // 创建新的飞船
    var sc = new Spacecraft(newId);
    // 在指挥面板添加对应的指令按钮
    var cp = $("\<div id=" + sc.getId() + "-command' class='command-set'>\<span>对" + sc.getId() + "号飞船下达命令</span><button id='sc" + sc.getId() + "-move'>飞行\</button><button id='sc" + sc.getId() + "-stop'>停止\</button><button id='sc" + sc.getId() + "-self-destory'>销毁\</button></div>").appendTo($("#command-area"));
    commander.commandPanels.push({id: sc.getId(), cp: cp});
    // 点击按钮信息传给指挥官
    $("#sc" + sc.getId() + "-move").click(function () {
        gameconsole.print(commander.createCommand("move", sc.getId()));
    });
    $("#sc" + sc.getId() + "-stop").click(function () {
        gameconsole.print(commander.createCommand("stop", sc.getId()));
    });
    $("#sc" + sc.getId() + "-self-destory").click(function () {
        gameconsole.print(commander.createCommand("selfDestory", sc.getId()));
    });
    return sc;
}

$(document).ready(function () {
    /******绑定创建飞船事件******/
    $("#create").bind("click", function () {
        gameconsole.print(commander.createCommand("create"));
    })
});