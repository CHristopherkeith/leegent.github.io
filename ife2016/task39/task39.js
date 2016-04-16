/**
 * 创建头部固定的表格构造函数
 * @param {Array} head 全体列名的数组
 * @param {Array} attributes 全体属性名，与列名按对应的顺序排好
 * @param {Array} data 表格信息
 */
function HeadFixedTable(head, attributes, data) {
	var that = this;
	this.head = head;
	this.attributes = attributes;
	this.data = data;
    // 创建表格
    this.tableDOM = document.createElement("table");
    this.tableDOM.className = "headfixedtable";
    this.tableDOM.table = this;
    // 创建头部
    var headContent = "";
    for (var i = 0; i < head.length; i++) {
        headContent += "<th>" + head[i] + "</th>";
    }
    this.headHTML = "<thead><tr>" + headContent + "</tr></thead>";
    // 首次渲染表格
    this.render();
    // 是否已创建了固定头部，以及固定头部的引用
    this.hasFixedHead = false;
    this.fixedHeadRow = document.createElement("tr");
    this.fixedHeadRow.className = "fixedthead";
    this.fixedHeadRow.innerHTML = headContent;

    // 监听onscroll事件。由于该事件目标不是表格，故不得不用闭包来指定当前表格
    document.addEventListener("scroll", function () {
    	var tableClientY = that.tableDOM.getBoundingClientRect().top, lastRowClientY = that.tableDOM.lastChild.lastChild.getBoundingClientRect().top;
        if (!that.tableDOM.hasFixedHead && (tableClientY <= 0 && lastRowClientY >= 0)) {
            // 将fixedHeadRow插入到表格里
            that.tableDOM.firstChild.insertBefore(that.fixedHeadRow,that.tableDOM.firstChild.firstChild);
            that.tableDOM.hasFixedHead = true;
        }
        if(that.tableDOM.hasFixedHead && (tableClientY > 0 || lastRowClientY < 0)){
            // 将fixedHeadRow从表格里移除（但不删除）
            that.fixedHeadRow = that.tableDOM.firstChild.removeChild(that.fixedHeadRow);
            that.tableDOM.hasFixedHead = false;
        }
    });
}
/**
 * 渲染表格
 */
HeadFixedTable.prototype.render=function () {
	var html = this.headHTML;
	// 写入表格数据
    for (var i = 0; i < this.data.length; i++) {
        html += "<tr>";
        for (var j = 0; j < this.attributes.length; j++) {
            html += "<td>" + this.data[i][this.attributes[j]] + "</td>";
        }
        html += "</tr>";
    }
    this.tableDOM.innerHTML = html;
}
/**
 * 获取表格DOM元素
 */
 HeadFixedTable.prototype.getDOM = function() {
 	return this.tableDOM;
 }
 /**
 * 更新表格数据
 */
 HeadFixedTable.prototype.updateData = function(data){
 	this.data = data;
 	this.render();
 }

//以下是demo代码
document.getElementById("btn").addEventListener("click", function () {
    var head = ["姓名","语文","数学","英语","总分"];
    var attributes = ["name","Chinese","math","English","sum"];
    var data = [
        {
            name:"曹植",
            Chinese:100,
            math:70,
            English:90,
            sum:260
        },
        {
            name:"曹冲",
            Chinese:80,
            math:90,
            English:80,
            sum:250
        },
        {
            name:"孙亮",
            Chinese:60,
            math:100,
            English:70,
            sum:230
        },
        {
            name:"陆绩",
            Chinese:80,
            math:85,
            English:75,
            sum:240
        },
        {
            name:"羊祜",
            Chinese:100,
            math:70,
            English:90,
            sum:260
        },
        {
            name:"潘凤",
            Chinese:80,
            math:90,
            English:80,
            sum:250
        },
        {
            name:"费祎",
            Chinese:60,
            math:100,
            English:70,
            sum:230
        },
        {
            name:"卻正",
            Chinese:80,
            math:85,
            English:75,
            sum:240
        }
    ];
    document.getElementById("demo").appendChild((new HeadFixedTable(head,attributes,data)).getDOM());
});