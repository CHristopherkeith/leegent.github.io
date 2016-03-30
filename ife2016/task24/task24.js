/**
 * Created by mystery on 2016/3/29.
 */

// 将遍历经过的结点顺序存入nodeList队列，然后一个个地取出染色
var nodeList = [];
var timer, interval, currentNode;
// isSearch表示是否在进行搜索，found参数用于标明队列里最后一个node是不是搜索到的结果
function act(isSearch,found) {
    currentNode.style.backgroundColor = "white";
    if (nodeList.length == 0) {
        clearInterval(timer);
        if(isSearch){
            if(found) currentNode.style.backgroundColor = "red";
            else alert("未找到符合条件的结点！")
        }
    }
    else {
        currentNode = nodeList.shift();
        currentNode.style.backgroundColor = "royalblue";
    }
}
// 所有传入的参数都是一个Element对象
// 深度优先遍历
function dfs(root) {
    // 当前结点入队
    nodeList.push(root);
    // 递归遍历各子树
    for (var i in root.childNodes) {
        if (root.childNodes[i].nodeType == 1) {
            dfs(root.childNodes[i]);
        }
    }
}
// 广度优先遍历，由于子问题不是子树，故不能递归
function bfs(root) {
    var queue = []; // 辅助队列，顺序存储待访问结点
    var current = root;
    // 当前结点入队
    queue.push(current);
    while (queue.length > 0) {
        // 从“待访问”队列取出队首结点访问，并将其所有子节点入队
        current = queue.shift();
        nodeList.push(current);
        // 将当前结点的所有孩子节点入“待访问”队
        for (var i in current.childNodes) {
            if (current.childNodes[i].nodeType == 1) {
                queue.push(current.childNodes[i]);
            }
        }
    }
}
// 广度优先搜索
function bfSearch(root,query) {
    var queue = []; // 辅助队列，顺序存储待访问结点
    var current = root;
    // 当前结点入队
    queue.push(current);
    while (queue.length > 0) {
        // 从“待访问”队列取出队首结点访问，并将其所有子节点入队
        current = queue.shift();
        nodeList.push(current);
        // 将当前结点的所有孩子节点入“待访问”队
        for (var i in current.childNodes) {
            if(current.childNodes[i].nodeType == 3){
                if(current.childNodes[i].nodeValue.indexOf(query)!=-1) return current; //找到了
            }
            if (current.childNodes[i].nodeType == 1) {
                queue.push(current.childNodes[i]);
            }
        }
    }
    return null;// 没找到
}

function buttonHandler(e) {
    var target = e.target || e.srcElement;
    var option = document.getElementsByName("speed");
    if (option[0].checked) interval = 300;
    else if (option[1].checked) interval = 600;
    var isSearch;
    var searchResult=null;
    //若有正在执行的动画，则立即停止
    if (currentNode != null) currentNode.style.backgroundColor = "white";
    nodeList.length = 0; // 清空队列
    clearInterval(timer); // 停止动画
    currentNode = document.getElementById("root");
    switch (target.id) {
        case "dfs":
            dfs(currentNode);
            isSearch=false;
            break;
        case "bfs":
            bfs(currentNode);
            isSearch=false;
            break;
        case "search":
            searchResult = bfSearch(currentNode,document.getElementById("searchText").value);
            isSearch=true;
            break;
    }
    timer = setInterval(function(){act(isSearch,searchResult!=null)}, interval);
}

// 选中结点事件代理
var selectedNode = null;
function selectDelegate(e){
    var target = e.target || e.srcElement;
    if(target.nodeType ==1 ){
        // 将之前选中的结点改回白色
        if(selectedNode!=null) selectedNode.style.backgroundColor = "white";
        selectedNode = target;
        selectedNode.style.backgroundColor = "lightgreen";
        stopBubble(e);
    }
}
// 删除结点，自动递归删除子节点
function deleteNode(){
    if(selectedNode==null) return;
    selectedNode.parentNode.removeChild(selectedNode);
    selectedNode = null;
}
// 增加节点
function addNode(){
    if(selectedNode == null)  return;
    var newNode = document.createElement("div");
    newNode.innerHTML = document.getElementById("newNodeText").value;
    selectedNode.appendChild(newNode);
}

// 添加按钮事件
addEvent(document.getElementById("dfs"), "click", buttonHandler);
addEvent(document.getElementById("bfs"), "click", buttonHandler);
addEvent(document.getElementById("search"), "click", buttonHandler);
addEvent(document.getElementById("root"),"click",selectDelegate);
addEvent(document.getElementById("delete"),"click",deleteNode);
addEvent(document.getElementById("add"),"click",addNode);

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
function stopBubble(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    else if (e.cancelBubble) {
        e.cancelBubble=true;
    }
}