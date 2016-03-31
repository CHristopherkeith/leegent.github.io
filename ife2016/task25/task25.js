/**
 * Created by mystery on 2016/3/29.
 * 感谢Steel Team，他们的代码给了我很大的启发
 */

// ==========================================封装TreeNode================================================
function TreeNode(obj) {
    this.parent = obj.parent;
    this.childs = obj.childs || [];
    this.data = obj.data || "";
    this.selfElement = obj.selfElement; // 访问对应的DOM结点
    this.selfElement.TreeNode = this;  // 对应的DOM结点访问回来
}
// 原型模式封装公共操作
TreeNode.prototype = {
    constructor: TreeNode,
    // 解耦样式操作，三个参数表示是否改变箭头、可见性、改为高亮、改为普通
    render: function (arrow, visibility, toHighlight, deHighlight) {
        if (arguments.length < 3) {
            toHighlight = false;
            deHighlight = false;
        }
        if (arrow) {
            if (this.childs.length == 0) { // 是个叶节点，设为空箭头
                this.selfElement.getElementsByClassName("arrow")[0].className = "arrow empty-arrow";
            }
            else if (this.childs[0].selfElement.className.indexOf("nodebody-visible") != -1) { // 有可见结点，设为下箭头
                this.selfElement.getElementsByClassName("arrow")[0].className = "arrow down-arrow";
            }
            else {
                this.selfElement.getElementsByClassName("arrow")[0].className = "arrow right-arrow"; // 右箭头
            }
        }
        if (visibility) { // 改变可见性
            if (this.selfElement.className.indexOf("nodebody-visible") == -1) { // 本不可见，改为可见
                this.selfElement.className = this.selfElement.className.replace("hidden", "visible");
            }
            else { //改为不可见
                this.selfElement.className = this.selfElement.className.replace("visible", "hidden");
            }
        }
        if (toHighlight) { // 改变高亮
            this.selfElement.getElementsByClassName("node-title")[0].className = "node-title node-title-highlight";
        }
        if (deHighlight) { // 取消高亮
            this.selfElement.getElementsByClassName("node-title")[0].className = "node-title";
        }
    },
    // 删除结点，DOM会自动递归删除子节点，TreeNode递归手动删除子节点
    deleteNode: function () {
        var i;
        // 递归删除子节点
        if(this.childs.length>0){
            for(i=0;i<this.childs.length;i++){
                this.childs[i].deleteNode();
            }
        }
        this.parent.selfElement.removeChild(this.selfElement);// 移除对应的DOM结点
        for (i = 0; i < this.parent.childs.length; i++) { // 从父节点删除该孩子
            if (this.parent.childs[i] == this) {
                this.parent.childs.splice(i, 1);
                break;
            }
        }
        // 调整父结点箭头样式
        this.parent.render(true, false);
    },
    // 增加子节点
    addChild: function (text) {
        if (text == null) return this;
        if (text.trim() == "") {
            alert("节点内容不能为空！");
            return this;
        }
        // 先增加子节点，再渲染自身样式
        // 创建新的DOM结点并附加
        var newNode = document.createElement("div");
        newNode.className = "nodebody-visible";
        var newHeader = document.createElement("label");
        newHeader.className = "node-header";
        var newSymbol = document.createElement("div");
        newSymbol.className = "arrow empty-arrow";
        var newTitle = document.createElement("span");
        newTitle.className = "node-title";
        newTitle.innerHTML = text;
        var space = document.createElement("span");
        space.innerHTML = "&nbsp;&nbsp;";
        var newDelete = document.createElement("img");
        newDelete.className = "deleteIcon";
        newDelete.src = "images/delete.png";
        var newAdd = document.createElement("img");
        newAdd.className = "addIcon";
        newAdd.src = "images/add.png";
        newHeader.appendChild(newSymbol);
        newHeader.appendChild(newTitle);
        newHeader.appendChild(space);
        newHeader.appendChild(newAdd);
        newHeader.appendChild(newDelete);
        newNode.appendChild(newHeader);
        this.selfElement.appendChild(newNode);
        // 创建对应的TreeNode对象并添加到子节点队列
        this.childs.push(new TreeNode({parent: this, childs: [], data: text, selfElement: newNode}));
        // 渲染自身样式
        this.render(true, false);
        return this; // 返回自身，以便链式操作
    },
    // 展开、收拢结点
    toggleFold: function () {
        if (this.childs.length == 0) return this; // 叶节点，无需操作
        // 改变所有子节点的可见状态
        for (var i=0;i<this.childs.length;i++)
            this.childs[i].render(false, true);
        // 渲染本节点的箭头
        this.render(true, false);
        return this; // 返回自身，以便链式操作
    }
};
//=======================================以上是封装TreeNode的代码=============================================

//=============================================事件绑定区===============================================
// 获得页面上的root结点
var rootDom = document.getElementsByClassName("nodebody-visible")[0];
// 为root绑定事件代理，处理所有节点的点击事件
addEvent(rootDom, "click", function (e) {
    var target = e.target || e.srcElement;
    var domNode = target;
    while (domNode.className.indexOf("nodebody") == -1) domNode = domNode.parentNode; // 找到类名含有nodebody前缀的DOM结点
    selectedNode = domNode.TreeNode; // 获取DOM对象对应的TreeNode对象
    if (target.className.indexOf("node-title") != -1 || target.className.indexOf("arrow") != -1) {
        // 如果点在节点文字或箭头上
        selectedNode.toggleFold(); // 触发toggle操作
    }
    else if (target.className == "addIcon") { // 点在加号上
        selectedNode.addChild(prompt("请输入子结点的内容："));
    }
    else if (target.className == "deleteIcon") { // 点在减号上
        selectedNode.deleteNode();
    }
});
// 创建根节点对应的TreeNode对象
var root = new TreeNode({parent: null, childs: [], data: "前端攻城狮", selfElement: rootDom});

// 给root绑定广度优先搜索函数，无需访问DOM，返回一个搜索结果队列
root.search = function (query) {
    var resultList = [];
    // 广度优先搜索
    var queue = []; // 辅助队列，顺序存储待访问结点
    var current = this;
    // 当前结点入队
    queue.push(current);
    while (queue.length > 0) {
        // 从“待访问”队列取出队首结点访问，并将其所有子节点入队
        current = queue.shift();
        // 还原当前结点颜色
        current.render(false, false, false, true);
        // 读取当前结点data
        if (current.data == query) resultList.push(current); //找到了
        // 将当前结点的所有孩子节点入“待访问”队
        for (var i=0;i<current.childs.length;i++) {
            queue.push(current.childs[i]);
        }
    }
    return resultList;
};
// 搜索并显示结果
addEvent(document.getElementById("search"), "click", function () {
    var text = document.getElementById("searchText").value.trim();
    if(text == "") {
        document.getElementById("result").innerHTML = "请输入查询内容！";
        return;
    }
    // 执行搜索
    var resultList = root.search(text);
    // 处理搜索结果
    if (resultList.length == 0) {
        document.getElementById("result").innerHTML = "没有查询到符合条件的结点！";
    }
    else {
        document.getElementById("result").innerHTML = "查询到" + resultList.length + "个符合条件的结点";
        // 将所有结果结点沿途展开，结果结点加粗红色展示
        var pathNode;
        for (var x = 0;x<resultList.length;x++) {
            pathNode = resultList[x];
            pathNode.render(false, false, true, false);
            while (pathNode.parent != null) {
                if (pathNode.selfElement.className == "nodebody-hidden") pathNode.parent.toggleFold(); // 若是收拢状态，则展开
                pathNode = pathNode.parent;
            }
        }
    }
});
// 清除搜索结果
addEvent(document.getElementById("clear"), "click", function () {
    document.getElementById("searchText").value = "";
    root.search(null); // 清除高亮样式
    document.getElementById("result").innerHTML = "";
});
//==================================================================================================

//=======================================Demo展示区==================================================
//动态生成Demo树
root.addChild("编程语言").addChild("IT公司").addChild("谈笑风生");
root.childs[0].addChild("C++").addChild("JavaScript").addChild("PHP").toggleFold();
root.childs[0].childs[1].addChild("JavaScript").toggleFold();
root.childs[1].addChild("百度").addChild("腾讯").addChild("大众点评").addChild("JavaScript").toggleFold();
root.childs[2].addChild("身经百战").addChild("学习一个").addChild("吟两句诗").toggleFold();
root.childs[2].childs[2].addChild("苟利国家生死以").toggleFold();
//初始化查询Demo值
document.getElementById("searchText").value = "JavaScript";
//==================================================================================================

// 跨浏览器兼容的工具函数
function addEvent(element, type, handler) {
    if (element.addEventListener) {
        element.addEventListener(type, handler);
    }
    else if (element.attachEvent) {
        element.attachEvent("on" + type, handler);
    }
    else {
        element["on" + type] = handler;
    }
}