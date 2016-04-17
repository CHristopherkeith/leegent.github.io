/**
 * 日历构造函数
 * @param {Object} 日历出现的坐标
 */
function Datepicker(pos) {
    this.currentDate = new Date();
    this.selectedYear = this.currentDate.getFullYear();
    this.selectedMonth = this.currentDate.getMonth() + 1;
    this.selectedDate = this.currentDate.getDate();
    // 创建jQuery对象
    this.JQ = $("<div class='datepicker'><section class='datepicker-header'><div class='datepicker-arrow-left'></div><label class='datepicker-label-year'><select class='datepicker-select-year'></select> 年</label><label class='datepicker-label-month'><select class='datepicker-select-month'></select> 月</label><div class='datepicker-arrow-right'></div></section><section class='datepicker-body'><table class='datepicker-day'><thead><tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thead><tbody></tbody></table></section></div>").appendTo(document.body).css({"left":pos.left,"top":pos.top});
    // 将DOM对象指回自身
    this.JQ[0].self = this;
    // 缓存年月下拉框
    var yearSelector = this.JQ.find(".datepicker-select-year");
    var monthSelector = this.JQ.find(".datepicker-select-month");
    // 向年下拉框添加option，以今年为准，前推30年，后推5年    
    var option;
    for(var i = this.selectedYear - 30; i< this.selectedYear+5; i++){
            option = $("<option>").text(i).val(i);
            yearSelector.append(option);
    }
    yearSelector.val(this.selectedYear);
    // 向月下拉框添加option    
    for(i = 1; i<13; i++){
        option = $("<option>").text(i).val(i);
        monthSelector.append(option);
    }
    monthSelector.val(this.selectedMonth);

	// 本年的二月最后一天是28还是29
    var FebLastDay = (function () {
    	// 是闰年
		if((this.selectedYear % 4 ===0 && this.selectedYear%100 != 0) || this.selectedYear % 400 ===0) return 29;
		else return 28;
    })();
    var lastDateOfMonths = [0,31,FebLastDay,31,30,31,30,31,31,30,31,30,31];

    // 向日期表格添加日期，同时附注该日期的格式    
    // 获得本月1号是星期几
    var firstDayOfthisMonth = (this.currentDate.getDay() - (this.currentDate.getDate() % 7 -1) +7) %7;
    // 日期表格一共几行
    var lineNum = Math.ceil((lastDateOfMonths[this.selectedMonth]+firstDayOfthisMonth)/7);
    var dayHTML = "";
    var j,k=1; // k代表当前输出几号
    for(i=0;i<lineNum;i++){
    	dayHTML +="<tr>";
		// 首行输出上个月最后几天
    	if(i==0){
    		for(j=0;j<firstDayOfthisMonth;j++){
    			dayHTML += "<td class='datepicker-day-othermonth'>" 
		    			+ (lastDateOfMonths[this.selectedMonth-1] - firstDayOfthisMonth + 1 + j)
		    			+ "</td>";
    		}
    		// 再输出本月的头几天
    		for(;j<7;j++,k++){
    			if(k==this.selectedDate)  dayHTML += "<td class='datepicker-day-selected'>"+ k +"</td>";
    			else dayHTML+="<td>"+ k +"</td>";
    		}
    	}
    	// 最后一行输出下个月的头几天
    	else if(i==lineNum-1){
    		for(j=0;j<lastDateOfMonths[this.selectedMonth]-k+1;j++,k++){
    			if(k==this.selectedDate)  dayHTML += "<td class='datepicker-day-selected'>"+ k +"</td>";
    			else dayHTML+="<td>"+ k +"</td>";
    		}
    		for(k=1;j<7;j++,k++){
    			dayHTML += "<td class='datepicker-day-othermonth'>" + k + "</td>";
    		}
    	}
    	else{
    		for(j=0;j<7;j++,k++){
    			if(k==this.selectedDate)  dayHTML += "<td class='datepicker-day-selected'>"+ k +"</td>";
    			else dayHTML+="<td>"+ k +"</td>";
    		}
    	}
    	// 行末
    	dayHTML += "</tr>";
    }
    this.JQ.find("tbody").html(dayHTML);

    // 给年份、月份下拉框DOM设置指向该对象的指针
    yearSelector[0].datepicker = this;
    monthSelector[0].datepicker = this;

    // 绑定事件：选择年份改变、选择月份改变、点击某个日期
    yearSelector.bind("change",function () {
    	this.datepicker.selectedYear = $(this).val();
    	this.datepicker.render();
    });
}
// 设置当前日期
Datepicker.prototype.setCurrentDate = function (){
	this.currentDate = new Date(this.selectedYear+"-"+this.selectedMonth+"-"+this.selectedDate);
}
// 渲染日期选择页面
Datepicker.prototype.render = function () {
	this.setCurrentDate();

}
var calendar = new Datepicker({left:"500px",top:"100px"});