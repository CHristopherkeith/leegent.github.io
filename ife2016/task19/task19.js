var randomData=[];
// 生成随机数组
function getRandomData(length) {
    if (arguments.length == 0) length = 50;
    randomData = [];
    for (var i = 0; i < length; i++) {
        randomData[i] = Math.round(Math.random() * 90) + 10;
    }
}
// 快速排序
function quickSort(array,low,high) {
    if (high <= low) return;
    // 选择第一个元素作为基准元素
    var pivot = array[low], i=low,j=high;
    // 将所有比pivot小的元素放到其左边，大的放到右边
    while (i < j) {
        while (i < j && array[j] >= pivot) --j;
        array[i] = array[j];
        while (i < j && array[i] <= pivot) ++i;
        array[j] = array[i];
    }
    array[i] = pivot;
    // 递归对左右排序
    arguments.callee(array,low,i-1);
    arguments.callee(array,i+1,high);
}

//可视化快速排序
// 动作列表，依次执行
var leftList=[],rightList=[];
// 动作间隔
var quickInterval = 200;
// 所有动作都已准备就绪
var isReady=false;
// 执行动作
function doAction(){
    if(leftList.length + rightList.length==0){
        isReady=false;
        //还原所有染色区域
        var queue = document.getElementById("queue");
        for(var k=0;k<queue.childNodes.length;k++){
            queue.childNodes[k].firstChild.style.backgroundColor="red";
        }
    }
    if(!isReady) return;
    if(leftList.length>0){
        (leftList.shift())(); // 取出第一个函数并执行    
    }
    else if(rightList.length>0){
        (rightList.pop())(); // 弹栈并执行
    }
    // 延时执行下一个函数
    setTimeout(arguments.callee,quickInterval);
}

function visualSort(array,low,high,barArray) {
    if (high <= low){
        if(low>=0 && low<array.length) barArray.childNodes[low].firstChild.style.backgroundColor="red";
        if(high<array.length-1 && high>=0) barArray.childNodes[high].firstChild.style.backgroundColor="red";
        return;
    }
    // 选择第一个元素作为基准元素
    var pivot = array[low], i=low,j=high;
    // 还原所有染色区域
    for(var k=0;k<array.length;k++)
        barArray.childNodes[k].firstChild.style.backgroundColor="red";
    // 将当前排序的区域染色
    for(k=low;k<=high;k++)
        barArray.childNodes[k].firstChild.style.backgroundColor="#6898c2";
    // 将所有比pivot小的元素放到其左边，大的放到右边
    var nodei,nodej;
    while (i < j) {
        while (i < j && array[j] > pivot) --j;
        array[i] = array[j];
        nodei = barArray.childNodes[i].firstChild;
        nodej = barArray.childNodes[j].firstChild;
        nodei.style.height = nodej.style.height;
        nodei.style.top = nodej.style.top;
        nodei.title=nodej.title;
        while (i < j && array[i] <= pivot) ++i;
        array[j] = array[i];
        nodei = barArray.childNodes[i].firstChild;
        nodej = barArray.childNodes[j].firstChild;
        nodej.style.height = nodei.style.height;
        nodej.style.top = nodei.style.top;
        nodej.title=nodei.title;
    }
    array[i] = pivot;
    nodei.style.height = (pivot*2)+"px";
    nodei.style.top = (200 - pivot*2) + "px";
    nodei.title = pivot;
    nodei.style.backgroundColor = "blue";
    // 递归对左右排序
    var fn=arguments.callee;
    var that=this;
    if(i > low) leftList.push(function(){
        fn.call(that,array,low,i-1,barArray);
    });
    if(i < high) rightList.push(function(){
        fn.call(that,array,i+1,high,barArray);
    });
}

// 冒泡排序
var bubbleList=[];
var timer;
var bubbleInterval=50;
function bubble(array){
    if(array.length<=1) return;
    var tmp;
    for(var i=0;i<=array.length;i++){
        for(var j=array.length-1;j>i;j--){
            if(array[j]<array[j-1]){
                tmp=array[j];
                array[j]=array[j-1];
                array[j-1]=tmp;
                // 将每一步冒泡过程压入队列等待播放
                bubbleList.push(j);
            }
        }
    }
}
// 播放冒泡过程
function displayBubble(barQueue){
    if(bubbleList.length==0){
        for(var k=0;k<barQueue.childNodes.length;k++){
            barQueue.childNodes[k].firstChild.style.backgroundColor="#6898c2";
        }
        clearInterval(timer);
        return;
    } 
    var nowbar=bubbleList.shift();    
    var nodei = barQueue.childNodes[nowbar].firstChild,
    nodej = barQueue.childNodes[nowbar-1].firstChild;
    var tmp=[nodei.style.title,nodei.style.height,nodei.style.top];
    nodei.style.title = nodej.style.title;
    nodei.style.height = nodej.style.height;
    nodei.style.top = nodej.style.top;
    nodej.style.title = tmp[0];
    nodej.style.height = tmp[1];
    nodej.style.top=tmp[2];
    // nodei.style.backgroundColor = "red";
    for(var k=nowbar;k<barQueue.childNodes.length;k++){
        barQueue.childNodes[k].firstChild.style.backgroundColor="red";
    }
    nodej.style.backgroundColor = "#6898c2";
}

function cmdDelegation(e) {
    var target = e.target || e.srcElement;
    var queue = document.getElementById("queue");
    var input = document.getElementById("input-text");
    if (target.title.substr(-2, 2) == "in") {
        if (!/^\d+$/.test(input.value.trim())) {
            alert("只能输入数字！");
            return false;
        }
        var inputNum = parseInt(input.value);
        if (inputNum < 10 || inputNum > 100) {
            alert("输入数字必须在10到100之间！");
            return false;
        }
    }
    switch (target.title) {
        case "left-in":
            if (queue.childNodes.length <= 60) {
                queue.insertBefore(createBox(input.value), queue.firstChild);
                randomData.unshift(input.value);
            }
            else {
                alert("队列内元素最多60个！");
            }
            break;
        case "right-in":
            if (queue.childNodes.length <= 60) {
                queue.appendChild(createBox(input.value));
                randomData.push(input.value);
            }
            else {
                console.log(queue.childNodes.length);
                alert("队列内元素最多60个！");
            }
            break;
        case "left-out":
            if (randomData.length > 0) {
                alert(queue.removeChild(queue.firstChild).firstChild.title);
                randomData.shift();
            }
            break;
        case "right-out":
            if (randomData.length > 0) {
                alert(queue.removeChild(queue.lastChild).firstChild.title);
                randomData.pop();
            }
            break;
        case "randomData":
            // 清空队列
            queue.innerHTML = "";
            // 模拟事件输入随机生成数据
            getRandomData(60);
            for (var i = 0; i < randomData.length; i++) {
                input.value = randomData[i];
                queue.appendChild(createBox(input.value));
            }
            input.value = "";
            break;
        case "sort":
            if(randomData.length==0) return;
            // 将visualSort函数放进action队列里，依次执行
            leftList.push(function(){
                visualSort(randomData,0,randomData.length-1,queue);
            });
            isReady=true;
            doAction();
            break;
        case "bubble":
            // 先冒泡排序，用一个队列“录”下排序过程
            bubble(randomData);
            // “播放”排序过程
            timer=setInterval(function(){
                displayBubble(queue);
            },bubbleInterval);
            break;
        //case "showData":
        //    console.log(randomData);
    }
}
function queueDelegation(e) {
    var target = e.target || e.srcElement;
    if (target.nodeType == 1 && target.title) {
        target.parentNode.parentNode.removeChild(target.parentNode);
        stopEvent(e);
    }
}

function createBox(number) {
    // 外层，为内层提供向下偏移的基准
    var outbox = document.createElement("div");
    outbox.style.float = "left";
    outbox.style["margin-left"] = "2px";
    outbox.style.height = "200px";
    outbox.style.width = "10px";
    // 内层，需要从“画板”的顶部偏移到底部
    var inbox = document.createElement("div");
    inbox.style.position = "relative";
    inbox.style.height = number * 2 + "px";
    inbox.style.top = 200 - number * 2 + "px";
    inbox.style.backgroundColor = "red";
    inbox.title = number;
    outbox.appendChild(inbox);
    return outbox;
}

function init() {
    // add event delegations
    addEvent(document.getElementById("cmd"), "click", function (e) {
        cmdDelegation(e);
    });
    addEvent(document.getElementById("queue"), "click", function (e) {
        queueDelegation(e);
    })
}

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
        e.cancelBubble();
    }
}

init();