/**
 * Created by mystery on 2016/3/29.
 */

// 将遍历经过的结点顺序存入nodeList队列，然后一个个地取出染色
var nodeList = [];
var timer, interval,currentNode;
function act() {
    currentNode.style.backgroundColor = "white";
    if(nodeList.length==0){
        clearInterval(timer);
    }
    else {
        currentNode = nodeList.shift();
        currentNode.style.backgroundColor = "royalblue";
    }
}
// 所有传入的参数都是一个Element对象
// 前序遍历
function mlr(root) {
    // 当前结点入队
    nodeList.push(root);
    // 递归遍历左右子树
    if (root.firstElementChild){
        mlr(root.firstElementChild);
    }
    if (root.lastElementChild) {
        mlr(root.lastElementChild);
    }
}
// 中序遍历
function lmr(root) {
    // 递归遍历左子树
    if (root.firstElementChild){
        lmr(root.firstElementChild);
    }
    // 当前结点入队
    nodeList.push(root);
    // 递归遍历右子树
    if (root.lastElementChild) {
        lmr(root.lastElementChild);
    }
}
// 后序遍历
function lrm(root) {
    // 递归遍历左子树
    if (root.firstElementChild){
        lrm(root.firstElementChild);
    }
    // 递归遍历右子树
    if (root.lastElementChild) {
        lrm(root.lastElementChild);
    }
    // 当前结点入队
    nodeList.push(root);
}

function buttonHandler(e) {
    var target = e.target || e.srcElement;
    var option = document.getElementsByName("speed");
    if (option[0].checked) interval = 400;
    else if (option[1].checked) interval = 800;
    //若有正在执行的动画，则立即停止
    if(currentNode!=null) currentNode.style.backgroundColor = "white";
    nodeList.length=0; // 清空队列
    clearInterval(timer); // 停止动画
    currentNode = document.getElementById("root");
    switch (target.id) {
        case "mlr":
            mlr(currentNode);
            break;
        case "lmr":
            lmr(currentNode);
            break;
        case "lrm":
            lrm(currentNode);
            break;
    }
    timer = setInterval(act, interval);
    console.log(interval);
}

// 添加按钮事件
addEvent(document.getElementById("mlr"), "click", buttonHandler);
addEvent(document.getElementById("lmr"), "click", buttonHandler);
addEvent(document.getElementById("lrm"), "click", buttonHandler);

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