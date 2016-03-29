// ============第一部分：构造函数+原型模式================================
function myQueue(id, maxLen) {
    this.queue = document.getElementById(id);
    this.maxLength = arguments.length < 2 ? 10 : maxLen;
    // 绑定删除事件代理
    addEvent(this.queue, "click", queueDelegation);
}

// 新加入的文本是否已存在
myQueue.prototype.exists = function (newItem) {
    for (var i in this.queue.childNodes) {
        if (this.queue.childNodes[i].innerHTML == newItem) return true;
    }
    return false;
}
// 创造新的div结点
myQueue.prototype.createBox = function (text) {
    var inbox = document.createElement("div");
    inbox.style.float = "left";
    inbox.style.margin = 3 + "px";
    inbox.style.padding = 5 + "px";
    inbox.style.color = "white";
    inbox.style.backgroundColor = "#6898c2";
    inbox.innerHTML = text;
    inbox.title = text;
    // 绑定一个显示删除的事件
    addEvent(inbox,"mouseenter",tagQueueMouseHandler);
    addEvent(inbox,"mouseleave",tagQueueMouseHandler);
    return inbox;
}
// 出队，移除最早的结点
myQueue.prototype.deQueue = function () {
    if (this.queue.childNodes.length > 0) return this.queue.removeChild(this.queue.firstChild);
}
// 入队
myQueue.prototype.enQueue = function (item) {
    item = item.trim(); // 做trim处理
    if (item.length == 0) return; // 空元素直接返回
    if (this.exists(item)) return; // 遇到重复输入的项，自动忽视
    while (this.queue.childNodes.length >= this.maxLength) { // 已满，最早的元素出队
        this.deQueue();
    }
    this.queue.appendChild(this.createBox(item));
};
// ============以上是构造函数+原型模式================================
// 创建两个队列对象
var tagQueue = new myQueue("tag-queue",10);
var hobbyQueue = new myQueue("hobby-queue");

/*
* 第二部分：事件处理函数
*/
// queue用事件代理删除结点
function queueDelegation(e) {
    var target = e.target || e.srcElement;
    if (target.nodeType == 1 && target.title) {
        target.parentNode.removeChild(target);
        stopEvent(e);
    }
}
// 处理tag-queue的键盘输入事件
function tagInputHandler(e){
    // 回车、空格、逗号
    if(e.keyCode == 13 || e.keyCode == 32 || e.which == ",".charCodeAt(0)){
        e.preventDefault();
        var input = document.getElementById("tag-input");
        tagQueue.enQueue(input.value);
        input.value = "";
        return;
    }
}
// 处理鼠标事件
function tagQueueMouseHandler(e){
    var tar = e.target || e.srcElement;
    console.log(e.type);
    switch (e.type){
        case "mouseenter":
            tar.innerHTML = "点击删除 "+tar.innerHTML;
            tar.style.backgroundColor="red";
            break;
        case "mouseleave":
            tar.innerHTML = tar.innerHTML.substr(5);
            tar.style.backgroundColor = "#6898c2";
            break;
    }
}
//处理 添加兴趣爱好事件
function addHobbies(){
    var input = document.getElementById("hobby-input");
    var text = input.value.trim();
    if (text=="") {
        alert("输入内容不能为空！");
        input.value="";
        input.focus();
        return false;
    }
    // 分隔符
    text = text.split(/\r|,|，|、|\s/);
    // 逐个添加到hobbyQueue中
    for(var x in text){
        hobbyQueue.enQueue(text[x]);
    }
    input.value="";
    return true;
}
// 初始化，绑定事件
function init() {
    // 监听tag文本框输入事件
    addEvent(document.getElementById("tag-input"),"keypress",tagInputHandler);
    // 点击“确认兴趣爱好”事件
    addEvent(document.getElementById("ok"),"click",addHobbies);
}
/*
 * 以上是事件处理函数
 */
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
function stopEvent(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    else if (e.cancelBubble) {
        e.cancelBubble=true;
    }
}

init();