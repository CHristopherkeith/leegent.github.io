
function cmdDelegation(e) {
    var target = e.target || e.srcElement;
    var queue = document.getElementById("queue");
    var input = document.getElementById("input-text");
    var text,x;
    if (target.title.substr(-2, 2) == "in") {
        text = input.value.trim();
        if (text=="") {
            alert("输入内容不能为空！");
            input.value="";
            input.focus();
            return false;
        }
        text = text.split(/\r|,|，|、|\s/);
        if(/^(\w|[\u4e00-\u9fa5])+$/.test(text.join("")) == false ){
            alert("正文只能输入英语字母、数字、汉字！");
            return;
        }
    }
    switch (target.title) {
        case "left-in":
            for(x=0;x<text.length;x++){
                queue.insertBefore(createBox(text[x]), queue.firstChild);
            }
            break;
        case "right-in":
            for(x=0;x<text.length;x++) {
                queue.appendChild(createBox(text[x]));
            }
            break;
        case "left-out":
            alert(queue.removeChild(queue.firstChild).title);
            break;
        case "right-out":
            alert(queue.removeChild(queue.lastChild).title);
            break;
        case "query":
            var queryText = document.getElementById("queryText").value.trim();
            if(queue.childNodes.length==0){
                alert("查询队列为空！");
                return;
            }
            else if(queryText.length==0){
                alert("请输入要查询的字符串");
                return;
            }
            for(x=0;x<queue.childNodes.length;x++){
                // 首先清除上次的高亮结果
                queue.childNodes[x].innerHTML = queue.childNodes[x].innerHTML.replace(/<.*?span.*?>/g,"");
                // 找到匹配结果，套上高亮class
                queue.childNodes[x].innerHTML = queue.childNodes[x].innerHTML.replace(new RegExp("("+queryText+")","g"),"\<span class = highlight\>$1\<\/span\>");
            }
            break;
    }
}

function queueDelegation(e) {
    var target = e.target || e.srcElement;
    if (target.nodeType == 1 && target.title) {
        target.parentNode.removeChild(target);
        stopEvent(e);
    }
}

function createBox(text) {
    var inbox = document.createElement("div");
    inbox.style.float = "left";
    inbox.style["margin-right"] = 3+"px";
    inbox.style.padding = 5 + "px";
    inbox.style.color = "white";
    inbox.style.backgroundColor = "red";
    inbox.innerHTML = text;
    inbox.title = text;
    return inbox;
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