/**
 * Created by mystery on 2016/3/23.
 */
/* 数据格式演示
 var aqiSourceData = {
 "北京": {
 "2016-01-01": 10,
 "2016-01-02": 10,
 "2016-01-03": 10,
 "2016-01-04": 10
 }
 };
 */

// 以下两个函数用于随机模拟生成测试数据
function getDateStr(dat) {
    var y = dat.getFullYear();
    var m = dat.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = dat.getDate();
    d = d < 10 ? '0' + d : d;
    return y + '-' + m + '-' + d;
}
function randomBuildData(seed) {
    var returnData = {};
    var dat = new Date("2016-01-01");
    var datStr = '';
    for (var i = 1; i < 92; i++) {
        datStr = getDateStr(dat);
        returnData[datStr] = Math.ceil(Math.random() * seed);
        dat.setDate(dat.getDate() + 1);
    }
    return returnData;
}

var aqiSourceData = {
    "北京": randomBuildData(500),
    "上海": randomBuildData(300),
    "广州": randomBuildData(200),
    "深圳": randomBuildData(100),
    "成都": randomBuildData(300),
    "西安": randomBuildData(500),
    "福州": randomBuildData(100),
    "厦门": randomBuildData(100),
    "沈阳": randomBuildData(500)
};

// 用于渲染图表的数据
var chartData = {};

// 记录当前页面的表单选项
var pageState = {
    nowSelectCity: "北京",
    nowGraTime: "day"
}

/**
 * 渲染图表
 */
function renderChart() {
    var canvas=document.getElementsByClassName("aqi-chart-wrap")[0];
    canvas.innerHTML="";
    var list=document.createElement("ul");
    var itemWidth;
    switch (pageState.nowGraTime){
        case "day":
            itemWidth="12px";
            break;
        case "week":
            itemWidth="20px";
            break;
        case "month":
            itemWidth="50px";
            break;
    }
    var colorList=["black","gray","green","blue","red","aqua","chartreuse"];
    var colorPointer=0;
    for(var i in chartData){
        var item= document.createElement("li");
        item.title= i + " 空气质量："+ chartData[i];
        item.style["list-style"]="none";
        item.style.display="inline-block";
        item.style.backgroundColor=colorList[colorPointer++];
        item.style.height=chartData[i]+"px";
        item.style.width=itemWidth;
        list.appendChild(item);
        colorPointer %= 7;
    }
    canvas.appendChild(list);
}

/**
 * 日、周、月的radio事件点击时的处理函数
 */
function graTimeChange(e) {
    // 确定是否选项发生了变化
    var target= e.target || e.srcElement;
    if(target.tagName!="INPUT") return; // 不是radio的事件
    if(target.value===pageState.nowGraTime) return; // 没改变日期级别
    // 设置对应数据
    pageState.nowGraTime=target.value;
    initAqiChartData();
    // 调用图表渲染函数
    renderChart();
}

/**
 * select发生变化时的处理函数
 */
function citySelectChange() {
    // 确定是否选项发生了变化
    if(this.value===pageState.nowSelectCity) return;
    // 设置对应数据
    pageState.nowSelectCity=this.value;
    initAqiChartData();
    // 调用图表渲染函数
    renderChart();
}

/**
 * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
 */
function initGraTimeForm() {
    // 使用事件代理
    addEvent(document.getElementById("form-gra-time"),"click",function(e){
        graTimeChange(e);
    });
}

/**
 * 初始化城市Select下拉选择框中的选项
 */
function initCitySelector() {
    // 读取aqiSourceData中的城市，然后设置id为city-select的下拉列表中的选项
    var select=document.getElementById("city-select");
    select.innerHTML="";
    for(var x in aqiSourceData){
        var newoption=document.createElement("option");
        newoption.innerHTML=x;
        select.appendChild(newoption);
    }
    // 给select设置事件，当选项发生变化时调用函数citySelectChange
    addEvent(select,"change",citySelectChange);
}

/**
 * 初始化图表需要的数据格式
 */
function initAqiChartData() {
    // 将原始的源数据处理成图表需要的数据格式
    // 处理好的数据存到 chartData 中

    // 首先取到当前选中城市的数据，存在一个对象中
    var cityData=aqiSourceData[pageState.nowSelectCity];
    var x;
    chartData={};
    switch (pageState.nowGraTime){
        // 直接把源数据复制给chartData即可
        case "day":
            for(x in cityData){
                chartData[x]=cityData[x];
            }
            break;
        // 换成自然周
        case "week":
            var wSum=0,weekDayCount=0;
            var weekth=1;
            for(x in cityData){
                var date=new Date(x);
                if(date.getDay()==1 && weekDayCount>0){ // 周一，汇总上周数据
                    chartData["第"+weekth+"周"]=(wSum/weekDayCount).toFixed(2);
                    weekth++;
                    wSum=cityData[x];weekDayCount=1; // 新的一周
                }
                else{ // 非周一，累加数据
                    wSum += cityData[x];
                    weekDayCount++;
                }
            }
            chartData["第"+weekth+"周"]=(wSum/weekDayCount).toFixed(2); // 输出最后一周的数据，不管这周完整与否
            break;
        // 换成月份
        case "month":
            var mSum=0,monthDayCount= 0;
            var lastMonth;
            for(x in cityData){
                var date=new Date(x);
                if(date.getDate()==1 && monthDayCount>0){ // 1号，汇总上月数据
                    lastMonth=date.getMonth()==0?12:date.getMonth();
                    chartData[lastMonth+"月"]=(mSum/monthDayCount).toFixed(2);
                    mSum=cityData[x];monthDayCount=1;
                }
                else{ // 非周一，累加数据
                    mSum += cityData[x];
                    monthDayCount++;
                }
            }
            chartData[(date.getMonth()+1)+"月"]=(mSum/monthDayCount).toFixed(2);// 输出最后一月的数据，不管这月完整与否
            break;
    }
}

/**
 * 初始化函数
 */
function init() {
    initGraTimeForm()
    initCitySelector();
    initAqiChartData();
    renderChart();
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
