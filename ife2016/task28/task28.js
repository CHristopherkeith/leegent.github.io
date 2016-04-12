/*
 * 2016.4.12重构：重新划分了各部分的功能，解除耦合。飞船构造函数只负责创建飞船，一切参数的初始化都由飞船工厂负责并传入飞船
 * ******************
 * ***  程序说明  ***
 * ******************
 * 整个程序分为控制台、媒介（BUS）、行星、飞船四大模块，其中行星上又有指挥官、飞船工厂、信号接收器和数据中心四个子模块
 * 控制台：持有游戏界面的控制台。这个模块比较特殊，因为需要输出信息的地方比较多，所以调用控制台的语句到处散落，但逻辑上并没有什么
 *         耦合，删去不影响主体功能
 * BUS：中介者，行星与飞船之间的一切联系都需要通过BUS，也是飞船发射后唯一直接打交道的模块
 * 行星是一个复杂的模块，其内部的四个子模块耦合相对较紧：
 *    1.指挥官：持有游戏界面上的命令面板，因此具备向BUS发射指令的功能，也可以命令飞船工厂发射飞船
 *    2.飞船工厂：负责发射飞船，管理飞船id；可以向指挥官反馈飞船发射成功，使其添加飞船的命令面板；也可以向数据中心通告飞船发射成功，
 *                令其在监控界面添加新飞船
 *    3.信号接收器：功能很单一，接收BUS发来的信息并转交给信息中心。我给它附加了过滤命令广播的功能。它存在的意义是在BUS里为行星提供
 *      一个观察者接口。
 *    4.数据中心：持有游戏界面上的显示屏，可以解码由信号接收器转交的飞船状态广播并显示出来。当收到飞船“待销毁”的状态广播时，通知
 *                飞船工厂将飞船的id重新设为可用。
 *
 */

/*
 * 模块1.游戏控制台，用于输出信息
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
    /** 
     * 打印信息
     * @param {String} text 信息文本
     * @param {String} style 信息装饰风格
     */
    print: function (text, style) {
        var printText = this.getTime() + text;
        if (style == "fail") printText = "\<span class = 'console-text-fail'>" + printText + "\</span>";
        this.self.append($("<p>" + printText + "</p>"));
        this.self.scrollTop(this.self[0].scrollHeight);
    }
};

/*
 * 模块2.BUS
 * 新一代传播介质，速度快，丢包率低，但只能传递二进制数据
 * 采用了中介者模式和观察者模式
 */
var BUS = {
    // 存在于介质中的信息宿主
    observers: [],
    // 注册新飞船
    addObserver: function (newObserver) {
        this.observers.push(newObserver);
        /*this.observers.sort(function (a, b) {
            return a.getId() - b.getId();
        });*/
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
    // 收到信号后，延时300毫秒转发给所有观察者，同时有10%的概率丢失命令，但会一直重试以保证传递成功
    onReceive: function (msg) {
        // 此处的msg是一个二进制代码
        setTimeout(function () {
            // 保存当前函数
            var fn = arguments.callee;
            // 模拟10%丢包率
            var rnd = Math.random() * 100;
            //成功
            if (rnd >= 10) {
                for (var i = 0; i < BUS.observers.length; i++) {
                    BUS.observers[i].onReceiveMessage(msg);
                }
            }
            // 发送失败
            else {
                if (msg.length === 8) {
                    gameconsole.print("[发送失败] 您下达的\"" + msg + "\"指令不幸丢失，正在尝试重传", "fail");
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
        // 飞船信息编码器：JSON->二进制
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
        // 飞船信息译码器：二进制->JSON
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
 * 模块3.行星
 * 行星上有指挥官、飞船工厂、信号接收器和数据中心四个子模块
 */
var planet = {
	// 初始化函数
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
     * (1)指挥官，掌握着每艘船的命令面板，发布命令的功能
     */
    commander: {
        //（指挥官视角里存在的）飞船数量计数
        _craftCount: 0,       
        //（指挥官视角里存在的）飞船对应的命令面板，元素格式为{id:id,cp:commandPanel}
        _commandPanels: [],
        // 飞船发射：给飞船添加一个命令面板
        onNewCraftLaunch: function (newId) {
            var cp = $("\<div id=" + newId + "-command' class='command-set'>\<span>对" + newId + "号飞船下达命令\</span><button id='sc" + newId + "-move'>飞行\</button><button id='sc" + newId + "-stop'>停止\</button><button id='sc" + newId + "-self-destory'>销毁\</button></div>").appendTo($("#command-area"));
            this._commandPanels.push({id: newId, cp: cp});
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
        // 飞船销毁：移除命令面板
        onCraftDestoried: function (id) {
            for (var i = 0; i < this._commandPanels.length; i++) {
                if (this._commandPanels[i].id == id) {
                    this._commandPanels[i].cp.remove();
                    this._commandPanels.splice(i, 1);
                    return true;
                }
            }
            return false;
        },
        /** 
         * 下达命令
         * @param {String} type 命令类型，包括create,move,stop,selfDestory四种
         * @param {Number} id 命令指向的飞船编号
         * @return {String} consoleText 输出到游戏控制台的文字
         */
        createCommand: function (type, id) {
            var consoleText = "";
            switch (type) {
                // 创建飞船，查看动力、能源系统选项，作为参数传给飞船工厂
                case "create":
                    if (this._craftCount >= 4) {
                        consoleText = "将军，我们的太空战舰数量已达指挥上限！";
                    }
                    else {
                        var obj = {};
                        // 从命令面板获取飞船动力、能源选项
                        obj.drive = $("input[name='drive']:checked").val();
                        obj.power = $("input[name='power']:checked").val();
                        this._craftCount++;
                        // 创造飞船
                        var newId = planet.spacecraftFactory.launchCraft(obj);
                        consoleText = "新的飞船（编号：" + newId + "）已加入作战序列！目前我们共有" + this._craftCount + "艘太空飞船";
                    }
                    return consoleText; // 无需向媒介发送指令，故直接返回
                case "move":
                    consoleText = "命令" + id + "号飞船 开始飞行 的信号已发射";
                    break;
                case "stop":
                    consoleText = "命令" + id + "号飞船 停止移动 的信号已发射";
                    break;
                case "selfDestory":
                    this._craftCount--;
                    consoleText = "您已下令" + id + "号飞船自毁。目前我们还剩" + this._craftCount + "艘太空飞船";
                    // 指挥官认为飞船必然自爆，故直接移除命令面板
                    this.onCraftDestoried(id);
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
     * (2)飞船工厂，管理飞船id，创造飞船，并且在指挥官视野里创建对应的控制面板，在数据中心加入新飞船。返回新飞船id
     */
    spacecraftFactory:{
    	// 飞船编号管理系统
    	idManager:{
			// 可用的飞船编号，用下标标识编号，内容表示是否可用。初始1-10都可用
		    _spareId: [true, true, true, true, true, true, true, true, true, true],
		    // 为创造新的飞船，获取一个新id，获取失败时返回-1
		    getNewId:function(){
		    	var newId = this._spareId.indexOf(true)+1;
		    	// 将该id设为非空闲
		    	if(newId != -1) this._spareId[newId-1] = false;
		    	return newId;
			},
			// 归还id，在飞船被销毁之后
			returnId:function(id){
				this._spareId[id-1] = true;
			}
    	},
    	/**
    	 * 发射飞船，参数为从界面接收的动力、能源系统选项
    	 * @param {{drive:{Number},power:{Number}}} 动力、能源系统
    	 * @return {Number} newId 新飞船的ID
    	 */
    	launchCraft: function (o) {
			//预设数据：最接近行星的轨道高度，轨道间隔
			const FIRST_ORBIT = 50, ORBIT_INTERVAL = 60;
	        // 构造新船需要参数：id,orbit,speed,consume,charge
	        var obj = {};
	        //获得一个编号
	        var newId = this.idManager.getNewId();
	        if (newId === -1) {
	            alert("飞船数量超出上限！");
	            return;
	        }
	        obj.id = newId;
	        // 计算飞船轨道
	        obj.orbit = FIRST_ORBIT + (obj.id - 1) * ORBIT_INTERVAL;
	        // 设置飞船动力、能源参数
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
	        planet.commander.onNewCraftLaunch(newId);
	        // 通知数据中心添加对新飞船的监控
	        planet.DC.addCraft(sc);	

	        return newId;
	    }
    },
    /*
     * (3)信号接收器
     */
    signalReceiver: {
        // 将其ID设为0
        getId: function () {
            return 0;
        },
        onReceiveMessage: function (binaryInfo) {
            if (binaryInfo.length === 8) return; // 忽略命令广播
            planet.DC.onReceive(binaryInfo);
        }
    },
    /*
     * (4)数据处理中心，展示飞船状态。在收到飞船被摧毁的消息时，通知飞船工厂归还飞船id
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
        // 收到信息，显示并做必要的处理
       onReceive: function (binaryInfo) {
            var that = this;
            // 调用适配器解码二进制信息
            var jsonInfo = BUS.adapter.decodeCraftInfo(binaryInfo);
            // 取出飞船信息所在行
            var lineNum = this.crafts.indexOf(jsonInfo.id)+1;
            var line = this.table.find("tr:eq(" + lineNum + ")");
            // 更新飞船状态和能源
            line.children("td:eq(3)").text(this.state[jsonInfo.state]);
            line.children("td:eq(4)").text(jsonInfo.energy+"%");
            // 若是待摧毁的飞船信息，通知飞船工厂归还id（使其可再次使用），并在1秒后移除该飞船信息
            if(jsonInfo.state === "DESTORY") {
            	planet.spacecraftFactory.idManager.returnId(jsonInfo.id);
            	setTimeout(function () {
                    that.removeCraft(jsonInfo.id)
                },1000);
            }
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

$(document).ready(function () {
    /******绑定创建飞船事件******/
    $("#create").bind("click", function () {
        gameconsole.print(planet.commander.createCommand("create"));
    });
    // decodeC始化行星
    planet.init();
});