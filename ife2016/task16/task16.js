/**
 * Created by mystery on 2016/3/22.
 */
/**
 * aqiData，存储用户输入的空气指数数据
 * 示例格式：
 * aqiData = {
 *    "北京": 90,
 *    "上海": 40
 * };
 */
var aqiData = {};

/**
 * 从用户输入中获取数据，向aqiData中增加一条数据
 * 然后渲染aqi-list列表，增加新增的数据
 */
function addAqiData() {
    var city=document.getElementById("aqi-city-input").value;
    var aqi=document.getElementById("aqi-value-input").value;
    if(city==null || aqi==null) return false;
    city=city.trim();
    aqi=aqi.trim();
    if(city.length==0 || aqi.length==0) return false;
    aqiData[city]=aqi;
    renderAqiList();
    return true;
}

/**
 * 渲染aqi-table表格
 */
function renderAqiList() {
    var tbody=document.getElementById("aqi-table").getElementsByTagName("tbody")[0];
    //清空原表内容
    tbody.innerHTML="";
    //重新渲染表格，先加个表头
    tbody.innerHTML="<tr><td>城市</td><td>空气质量</td><td>操作</td></tr>"
    for(var x in aqiData){
        var newRow=document.createElement("tr");
        var newCol1=document.createElement("td");
        newCol1.innerHTML=x;
        newRow.appendChild(newCol1);
        var newCol2=document.createElement("td");
        newCol2.innerHTML=aqiData[x];
        newRow.appendChild(newCol2);
        var newCol3=document.createElement("td");
        var newbtn=document.createElement("button");
        newbtn.innerHTML="删除";
        newCol3.appendChild(newbtn);
        newRow.appendChild(newCol3);
        tbody.appendChild(newRow);
    }
}

/**
 * 点击add-btn时的处理逻辑
 * 获取用户输入，更新数据，并进行页面呈现的更新
 */
function addBtnHandle() {
    addAqiData();
    renderAqiList();
}

/**
 * 点击各个删除按钮的时候的处理逻辑
 * 获取哪个城市数据被删，删除数据，更新表格显示
 */
function delBtnHandle(e) {
    //事件代理
    var target= e.target|| e.srcElement;
    if(target.tagName!="BUTTON"){
        console.log(target.tagName);
        return;
    }
    var city=target.parentNode.parentNode.firstChild.innerHTML;
    delete aqiData[city];
    renderAqiList();
}

function init() {
    var btn=document.getElementById("add-btn");
    var tbl=document.getElementById("aqi-table");
    // 在这下面给add-btn绑定一个点击事件，点击时触发addBtnHandle函数
    addEvent(btn,"click",addBtnHandle);
    // 想办法给aqi-table中的所有删除按钮绑定事件，触发delBtnHandle函数
    addEvent(tbl,"click",delBtnHandle);
}

function addEvent(element,type,handler){
    if(addEventListener){
        element.addEventListener(type,handler);
    }
    else if(attachEvent){
        element.attachEvent("on"+type,handler);
    }
    else{
        element["on"+type]=handler;
    }
}

init();
