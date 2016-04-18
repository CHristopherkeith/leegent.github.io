/**
 * 日历构造函数
 * @param {Object} pos 日历出现的坐标
 * @param {Element} target 日历输出结果的DOM元素
 * @param {Date} startDay 可选日期的第一天
 * @param {Date} endDay 可选日期的最后一天
 */
function Datepicker(pos,target,startDay,endDay) {
	this.target = target;
	this.startDay = startDay;
	this.endDay = endDay;
    if(!this.startDay) this.startDay = new Date((this.selectedYear-1)+"-"+this.selectedMonth+"-"+this.selectedDate);
    if(!this.endDay) this.endDay = new Date((this.selectedYear+1)+"-"+this.selectedMonth+"-"+this.selectedDate);
    this.currentDate = new Date();
    this.selectedYear = this.currentDate.getFullYear();
    this.selectedMonth = this.currentDate.getMonth() + 1;
    this.selectedDate = this.currentDate.getDate();
    // 创建jQuery对象
    this.JQ = $("<div class='datepicker'><section class='datepicker-header'><div class='datepicker-arrow-left'></div><label class='datepicker-label-year'><select class='datepicker-select-year'></select> 年</label><label class='datepicker-label-month'><select class='datepicker-select-month'></select> 月</label><div class='datepicker-arrow-right'></div></section><section class='datepicker-body'><table class='datepicker-day'><thead><tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thead><tbody></tbody></table></section></div>").appendTo(document.body).css({"left":pos.left,"top":pos.top});
    // 将DOM对象指回自身
    this.JQ[0].self = this;
    // 表格tbody（日期部分）
    this.dates = this.JQ.find("tbody");
    // 缓存年月下拉框
    this.yearSelector = this.JQ.find(".datepicker-select-year");
    this.monthSelector = this.JQ.find(".datepicker-select-month");
    // 给年份、月份下拉框DOM设置指向该对象的指针
    this.yearSelector[0].datepicker = this;
    this.monthSelector[0].datepicker = this;
    
    // 初始化界面
    // 年下拉框添加option，以今年为准前推30年、后推5年
    var option;
    for(var i = this.selectedYear-30; i<= this.selectedYear+5; i++){
            option = $("<option>").text(i).val(i);
            this.yearSelector.append(option);
    }
    this.yearSelector.val(this.selectedYear);
    // 向月下拉框添加option    
    for(i = 1; i<13; i++){
        option = $("<option>").text(i).val(i);
        this.monthSelector.append(option);
    }
    this.monthSelector.val(this.selectedMonth);
    // 渲染日期表格
    this.render();
    //=====================事件绑定区=========================
    // 绑定事件：选择年份改变、选择月份改变
    this.yearSelector.bind("change",function () {
    	this.datepicker.selectedYear = $(this).val();
    	this.datepicker.setCurrentDate();
    	this.datepicker.render();
    });
    this.monthSelector.bind("change",function () {
    	this.datepicker.selectedMonth = $(this).val();
    	this.datepicker.setCurrentDate();
    	this.datepicker.render();
    });
    // datepicker DIV充当点击事件代理
    this.JQ.bind("click",function (e) {
    	var target = e.target || e.srcElement;
    	// 点击当月日期
    	if(target.className.indexOf("datepicker-day-selectedmonth")!=-1){
    		this.self.selectedDate = target.dataset.date;
    		this.self.setCurrentDate();
    		// 向关联DOM输出日期
    		this.self.outputDate();
    		this.self.render();
    	}
    	// 点上个月日期或者左箭头
    	else if(target.className == "datepicker-day-previousmonth" || target.className == "datepicker-arrow-left"){
    		// 1月的前一月是上一年的12月
    		if(this.self.selectedMonth===1){
    			this.self.selectedMonth = 12;
    			this.self.selectedYear --;
    		}
			else this.self.selectedMonth-- ;
			this.self.setCurrentDate();
    		this.self.render();
    	}
    	else if(target.className == "datepicker-day-nextmonth" || target.className == "datepicker-arrow-right"){
    		// 12月的后一月是下一年的1月
    		if(this.self.selectedMonth===12){
    			this.self.selectedMonth = 1;
    			this.self.selectedYear++;
    		}
    		else this.self.selectedMonth ++;
    		this.self.setCurrentDate();
    		this.self.render();
    	}
    });
}
// 设置当前日期
Datepicker.prototype.setCurrentDate = function (){
	this.currentDate.setFullYear(this.selectedYear);
	this.currentDate.setMonth(this.selectedMonth-1);
	this.currentDate.setDate(this.selectedDate);
}
/**
 * 设置选中日期的接口
 * @param {Date} obj 要设置的日期
 */
Datepicker.prototype.setSelected = function(obj){
	this.selectedYear = obj.getFullYear();
	this.selectedMonth = obj.getMonth() + 1;
	this.selectedDate = obj.getDate();
	this.outputDate();
	this.render();
}
// 获取选中日期的"YYYY-mm-DD"格式字符串
Datepicker.prototype.getSelected = function(){
	return this.selectedYear+"-"+this.selectedMonth+"-"+this.selectedDate;
}
// 向关联的DOM元素输出日期
Datepicker.prototype.outputDate = function () {
	this.target.value = this.getSelected();
}
// 返回一个日期对象的接口
Datepicker.prototype.getCurrentDate = function(){
	return this.currentDate;
}
/**
 * 判断一个日期是否在可选范围内
 * @param {Date} day 日期
 */
Datepicker.prototype.isSelectable= function(day){
	if(day - this.startDay >= 0 && day - this.endDay <= 0) return true;
	return false; 
}
// 渲染年、月和日期选择页面
Datepicker.prototype.render = function () {
	// 渲染年月
	this.yearSelector.val(this.selectedYear);
	this.monthSelector.val(this.selectedMonth);
	var that = this;
	// 本年的二月最后一天是28还是29
    var FebLastDay = (function () {
    	// 是闰年
		if((that.selectedYear % 4 ===0 && that.selectedYear%100 != 0) || that.selectedYear % 400 ===0) return 29;
		else return 28;
    })();
    var lastDateOfMonths = [0,31,FebLastDay,31,30,31,30,31,31,30,31,30,31];
    // 向日期表格添加日期 
    // 获得本月1号是星期几
    var firstDayOfSelectedMonth = (this.currentDate.getDay() - (this.currentDate.getDate() % 7 -1) +7) %7;
    // 日期表格一共几行
    var lineNum = Math.ceil((lastDateOfMonths[this.selectedMonth]+firstDayOfSelectedMonth)/7);
    var dayHTML = "",
		tmp=new Date(this.selectedYear+"-"+this.selectedMonth+"-"+1); // 用于判断日期范围的临时变量
    var i,j,k=1; // k代表当前输出几号
    // 输出当前月份的日期前，先判断是否处于可选范围，据此输出不同的样式；在可选范围内再判断是否是当前被选中日期
    for(i=0;i<lineNum;i++){
    	dayHTML +="<tr>";
		// 首行输出上个月最后几天
    	if(i==0){
    		for(j=0;j<firstDayOfSelectedMonth;j++){
    			dayHTML += "<td class='datepicker-day-previousmonth'>" 
		    			// 先-1变成0——11，模12，然后-1表示上个月，+12再%12表示12月到1月循环，最后+1变回1——12月
		    			+ (lastDateOfMonths[(this.selectedMonth-1-1+12)%12+1] - firstDayOfSelectedMonth + 1 + j)
		    			+ "</td>";
    		}
    		// 再输出本月的头几天
    		for(;j<7;j++,k++){
    			tmp.setDate(k);
    			if(this.isSelectable(tmp)){
	    			// 用data-date自定义属性存储日期，可以用dataset来取
	    			if(k==this.selectedDate)  dayHTML += "<td class='datepicker-day-selected datepicker-day-selectedmonth'  data-date="+k+">"+ k +"</td>";
	    			else dayHTML+="<td class='datepicker-day-selectedmonth' data-date="+k+">"+ k +"</td>";
    			}
    			else{
    				dayHTML += "<td class='datepicker-day-unselectable' data-date="+k+">"+ k +"</td>";
    			}
    		}
    	}
    	// 最后一行输出下个月的头几天
    	else if(i==lineNum-1){
    		var done = k;
    		for(j=0;j<lastDateOfMonths[this.selectedMonth]-done+1;j++,k++){
    			tmp.setDate(k);
    			if(this.isSelectable(tmp)){
	    			// 用data-date自定义属性存储日期，可以用dataset来取
	    			if(k==this.selectedDate)  dayHTML += "<td class='datepicker-day-selected datepicker-day-selectedmonth'  data-date="+k+">"+ k +"</td>";
	    			else dayHTML+="<td class='datepicker-day-selectedmonth' data-date="+k+">"+ k +"</td>";
    			}
    			else{
    				dayHTML += "<td class='datepicker-day-unselectable' data-date="+k+">"+ k +"</td>";
    			}
    		}
    		for(k=1;j<7;j++,k++){
    			dayHTML += "<td class='datepicker-day-nextmonth'>" + k + "</td>";
    		}
    	}
    	// 普通行
    	else{
    		for(j=0;j<7;j++,k++){
				tmp.setDate(k);
    			if(this.isSelectable(tmp)){
	    			// 用data-date自定义属性存储日期，可以用dataset来取
	    			if(k==this.selectedDate)  dayHTML += "<td class='datepicker-day-selected datepicker-day-selectedmonth'  data-date="+k+">"+ k +"</td>";
	    			else dayHTML+="<td class='datepicker-day-selectedmonth' data-date="+k+">"+ k +"</td>";
    			}
    			else{
    				dayHTML += "<td class='datepicker-day-unselectable' data-date="+k+">"+ k +"</td>";
    			}
    		}
    	}
    	// 行末
    	dayHTML += "</tr>";
    }
    this.dates.html(dayHTML);
}

//=================================demo===============================================
var start = new Date("2016-4-6");
var end = new Date("2016-6-22");
var calendar = new Datepicker({left:"500px",top:"100px"},$("#input-date")[0],start,end);