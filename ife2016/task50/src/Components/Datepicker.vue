<template>
<div id="datepicker-shade" class="shade" @click="onShade"></div>
	<div class='datepicker'>
        <section class='datepicker-header'>
            <div class='datepicker-arrow-left' @click="goToLastMonth"></div>
            <label class='datepicker-label-year'>
	            <select class='datepicker-select-year' v-model="selectedYear" @change="render">
	            	<option v-for="year in years">{{ year.content }}</option>
	            </select> 年
            </label>
            <label class='datepicker-label-month'>
	            <select class='datepicker-select-month' v-model="selectedMonth" @change="render">
	            	<option v-for="month in months">{{ month.content }}</option>
	            </select> 月
            </label>
            <div class='datepicker-arrow-right' @click="goToNextMonth"></div>
        </section>
        <section class='datepicker-body'>
            <table class='datepicker-day'>
                <thead>
	                <tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr>
                </thead>
                <tbody @click="datesDelegation">
	                <tr v-for="line in dates">
	                	<td v-for="date in line" v-bind:class="date.classes" data-date="{{ date.content }}">{{ date.content }}</td>
	                </tr>
                </tbody>
            </table>
            <template v-if="ismultiselect == true">
	            <button class="datepicker-ok" @click="okCancelHandler('ok')" :disabled="okDisabled">确定</button>
	            <button class="datepicker-cancel" @click="okCancelHandler('cancel')">取消</button>
            </template>
        </section>
    </div>	
</template>

<script type="text/javascript">
/**
 * @description 日历构造函数
 * @param {targetDOM:{Element},startDay:{Date},endDay:{Date},isMultiselect:{Boolean},maxLen:{Number},minLen:{Number}} targetDOM 日历输出结果的DOM元素（文本框）{Date} startDay 可选日期的第一天,{Date} endDay 可选日期的最后一天, {Boolean} isMultiselect 是否选择时间段 {Number} maxLen 最大时间跨度 {Number} minLen 最小时间跨度
 * @constructor
 */
export default{
	props:["startday","endday","ismultiselect","maxlen","minlen"],
	data:function () {
		return {
			years:[],
			months:[],
			// 日期格式：{content:{String},classes:['isLastMonth','isNextMonth','isCurrentMonth','isUnselectable','isSelected','isTimeSegment']}
			dates:[[],[],[],[],[],[]],
			startDay:null,
			endDay:null,
			state:0,
			okDisabled:null,
			selectedYear:-1,
			selectedMonth:-1,
			selectedDate:-1,
			// 以下两个变量仅在时段选择模式使用
			firstDate:null,
			secondDate:null
		};
	},
	created:function () {
		this.startDay = new Date(this.startday);
		this.endDay = new Date(this.endday);
		var current = new Date();
		if(this.isMultiselect){
			this.firstDate = new Date();
		}
		else{
			this.selectedDate = current.getDate();
		}
		this.selectedYear = current.getFullYear();
		this.selectedMonth = current.getMonth()+1;
		// 向年下拉框添加option
	    for (var i = this.selectedYear; i <= this.selectedYear + 1; i++) {
	        this.years.push({content:i});
	    };
	    // 向月下拉框添加option    
	    for (i = 1; i <= 12; i++) {
	        this.months.push({content:i});
	    };
	    this.render();
	},
	methods:{
		goToLastMonth:function () {
			// 1月的前一月是上一年的12月
		    if (this.selectedMonth === 1) {
		        this.selectedMonth = 12;
		        this.selectedYear--;
		    }
		    else this.selectedMonth--;
		    this.render();
		},
		goToNextMonth: function () {
			// 12月的后一月是下一年的1月
		    if (this.selectedMonth === 12) {
		        this.selectedMonth = 1;
		        this.selectedYear++;
		    }
		    else this.selectedMonth++;
		    this.render();
		},
		render:function () {
		    // 本年的二月最后一天是28还是29
		    var FebLastDay = (function (year) {
		        // 是闰年
		        if ((year % 4 === 0 && year % 100 != 0) || year % 400 === 0) return 29;
		        else return 28;
		    })(this.selectedYear);
		    var lastDateOfMonths = [0, 31, FebLastDay, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		    // 临时日期型变量
		    var tmp = new Date(this.selectedMonth + "/" + 1 + "/" + this.selectedYear+" 1:0:0"),
		        current = new Date(this.selectedMonth + "/" + this.selectedDate + "/" + this.selectedYear);
		    // 获得本月1号是星期几，也等于要输出的上个月最后几天的天数
		    var firstDayOfCurrentMonth = tmp.getDay();
		    var i,k,line,dateObj; // i表示日期格的索引(从0到41),k代表当前输出几号,line代表当前在第几行,dateObj是存放在dates里的数据对象
		    // 计算开头要输出几格上个月的日期。 先-1变成0——11，模12，然后-1表示上个月，+12再%12表示12月到1月循环，最后+1变回1——12月
		    var lastMonth = (this.selectedMonth - 1 - 1 + 12) % 12 + 1;
			line = 0;
			while(this.dates[line].pop());
		    // 输出上个月的日期
		    for (i = 0, k = lastDateOfMonths[lastMonth] - firstDayOfCurrentMonth + 1; i < firstDayOfCurrentMonth; k++, i++) {
		        this.dates[line].push({content:k,classes:["datepicker-day-previousmonth"]});
		    }
		    // 输出当前月份的日期。先判断是否处于可选范围，据此输出不同的样式；在可选范围内再判断是否是当前被选中日期
		    for (k = 1; k <= lastDateOfMonths[this.selectedMonth]; k++, i++) {
		    	if( i > 0 && i % 7 === 0 ){
		    		line++;
					// 清空该行日期
					while(this.dates[line].pop());
		    		// this.dates[line] = [];
		    	}
		        tmp.setDate(k);
		        // 可选日期，分3种情况：普通可选，已被选中，位于时段内
		        if (this.isSelectable(tmp)) {
		            // 用data-date自定义属性存储日期，可以用dataset来取
		        	dateObj = {content:k,classes:["datepicker-day-currentmonth"]};
		        	// 时段模式下
		        	if(this.isMultiselect){
			            if (this.getDateDiff(tmp, this.firstDate) === 0 || this.getDateDiff(tmp, this.secondDate) === 0) {
			                dateObj.classes.push("datepicker-day-selected");
			            }
			            if (this.isInTimeSegment(tmp)) {
			            	dateObj.classes.push("datepicker-day-timeSegment");
			            }
		            }
		            // 单选模式下
		            else{
		            	if(k == this.selectedDate){
		            		dateObj.classes.push("datepicker-day-selected");
		            	}
		            }
		        }
		        // 不可选日期
		        else {
		        	dateObj = {content:k,classes:["datepicker-day-unselectable"]};
		        }
	            this.dates[line].push(dateObj);
		    }
		    // 输出下个月的日期
		    for (k = 1; i < 42; k++, i++) {
		    	if( i % 7 === 0 ){
		    		line++;
					// 清空该行日期
					while(this.dates[line].pop());
		    		// this.dates[line] = [];
		    	}
		    	dateObj = {content:k,classes:["datepicker-day-nextmonth"]};
		        this.dates[line].push(dateObj);
		    }
		},
		// 日期区域点击事件代理
		datesDelegation:function (e) {
			var target = e.target || e.srcElement;
			// 点上个月日期
	        if (target.className === "datepicker-day-previousmonth") {
	            this.goToLastMonth();
	        }
	        // 点击下个月日期
	        else if (target.className === "datepicker-day-nextmonth") {
	            this.goToNextMonth();
	        }
			// 点击当月可选日期
	        if (target.className.indexOf("datepicker-day-currentmonth") != -1) {
	        	// 多选状态
	            if (this.isMultiselect) {
	                this.clickMulti(target.dataset.date);
	            }
	            else {
	                this.clickSingle(target.dataset.date);
	            }
	        }
        },
        // 单选模式下点击可选日期后的动作
		clickSingle : function (targetdate) {
		    this.selectedDate = targetdate;
		    // 直接输出结果
		    this.$dispatch("singleSelect",{selectedDate:  this.selectedYear + "-" + this.selectedMonth + "-" + this.selectedDate});
		},
		// 多选模式下点击可选日期后的动作。该函数作用是切换状态
		clickMulti : function (targetdate) {
		    // 状态0，未选择任何日期，点击之后选择了第一个日期
		    if (this.state === 0) {
		        this.selectedDate = targetdate;
		        this.state = 1;
		        this.okDisabled = "disabled";
		        this.firstDate.setFullYear(this.selectedYear,this.selectedMonth-1,this.selectedDate);
		        this.render();
		    }
		    // 状态1，已选择了第一个日期，点击若有效则选择第二个日期
		    else if (this.state === 1) {
		        // 当前点击的年月日的临时变量
		        var tmpdate = new Date(this.selectedMonth + "/" + targetdate + "/" + this.selectedYear);
		        // 时间跨度等于首末日之差再加1
		        var timespan = Math.abs(this.getDateDiff(tmpdate, this.firstDate))+1;
		        // 若重复点击已选日期，则什么也不做
		        if (timespan === 1) return;
		        // 判断一下是否满足时间跨度要求，不满足时阻止此次选择并给出相应提示
		        if (this.maxLen > 0 && timespan > this.maxLen) {
		            alert("您选择的日期跨度为" + timespan + "天，超过了" + this.maxLen + "天的最大跨度！");
		            return;
		        }
		        if (this.minLen > 0 && timespan < this.minLen) {
		            alert("您选择的日期跨度为" + timespan + "天，低于了" + this.minLen + "天的最小跨度！");
		            return;
		        }
		        // 将第二个日期指向该变量
		        this.secondDate = tmpdate;
		        this.state = 2;
		        this.okDisabled=null;
		        this.render();
		    }
		    // 状态2，已经选中了一个时间段 ，再点则将刚点击的点作为新的firstDate，回到状态1
		    else {
		        this.selectedDate = targetdate;
		        this.firstDate.setFullYear(this.selectedYear,this.selectedMonth-1,this.selectedDate);
		        this.secondDate = null;
		        this.state = 1;
		        this.okDisabled="disabled";
		        this.render();
		    }
		},
		/**
		 * 获取两个日期之间相差的天数，忽视时分秒。date2在后为正，date1在后为负
		 * @param {Date} date1
		 * @param {Date} date2
		 * @returns {Number}
		 */
		getDateDiff : function (date1, date2) {
		    if (!(date1 instanceof Date) || !(date2 instanceof Date)) return null;
		    date1.setHours(0, 0, 0, 0);
		    date2.setHours(0, 0, 0, 0);
		    return ((date2 - date1) / (1000 * 60 * 60 * 24));
		},
		/**
		 * 判断一个日期是否在可选范围内
		 * @param {Date} day 日期
		 */
		isSelectable : function (day) {
		    return !!(day >= this.startDay && day <= this.endDay);
		},
		/**
		 * 判断是否处在选择的时间段
		 * @param {Date} date 要判断的日期
		 * @returns {boolean}
		 */
		isInTimeSegment : function (date) {
		    // 只在模式2下有可能返回true
		    if (this.state <= 1) return false;
		    return !!((date >= this.firstDate && date <= this.secondDate) || (date >= this.secondDate && date <= this.firstDate))
		},
		// 点击确定/取消按钮的处理函数 
		okCancelHandler:function (btn) {
			if(btn === "cancel") this.$dispatch("cancelClick");
			else{
				var msg = {firstDate:this.firstDate,secondDate:this.secondDate};
				this.$dispatch("okClick",msg);
			}
		},
		// 点击遮罩，相当于点击取消
		onShade:function (e) {
			var target = e.target || e.srcElement;
			if(target.id === "datepicker-shade"){
				this.$dispatch("cancelClick");
			}
		}
	}
}

</script>

<style lang="less">
	/*日期输入框*/
/*#input-date{
    border: 1px solid #ccc;
    padding: 4px;
    width: 15em;
    background: url(calendar.png) no-repeat right -18px;
}*/
/*透明遮罩*/
#datepicker-shade{
	z-index:10;
}
/*日历*/
.datepicker{
	z-index: 11;
    position: absolute;
    bottom:60px;
    left: 180px;
    width: 250px;
    border: 1px solid lightgray;
    background-color: #fff;
    user-select:none;
    -webkit-user-select:none;
}
/*头部，选择年月*/
.datepicker-header{
    padding: 5px 5px;
    height: 20px;
    background-color: #00AA55;
    font-size: 14px;
    color: #fff;
    line-height: 20px;
}
.datepicker-arrow-left{
    float: left;
    margin-top: 2px;
    border-right: 10px solid #fff;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
}
.datepicker-arrow-left:hover{
    cursor: pointer;
    border-right-color: #6898c2;
}
.datepicker-arrow-right{
    float: right;
    margin-top: 2px;
    display: inline-block;
    border-left: 10px solid #fff;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
}
.datepicker-arrow-right:hover{
    cursor: pointer;
    border-left-color: #6898c2;
}
.datepicker-label-year{
    float:left;
    margin-left: 15px;
}
.datepicker-label-month{
    float: left;
    margin-left: 10px;
}
/*体部，选择日期*/
.datepicker-body{
    padding: 5px 10px;
}
.datepicker-day{
    /*border-collapse: collapse;*/
    font-size: 14px;
    width: 100%;
    text-align: center;
    thead{
	  font-family: "黑体";    
      color: #00AA55;
      &:hover{
	    cursor: default;      	
      }
    }
    tbody{
	  line-height: 25px;
	  font-family: "Microsoft Yahei";   
	  &:hover{
	    cursor: pointer;
	  } 	
    }
}
/*特殊样式*/
/*被选中的日期*/
.datepicker-day-selected, .datepicker-day-currentmonth:hover{
    background-color: #BBFFEE !important;
}
/*其他月份的日期*/
.datepicker-day-previousmonth,.datepicker-day-nextmonth{
    color: gray;
}
/*不可选择的日期*/
.datepicker-day-unselectable{
    color:red;
}
/*时间段内的日期*/
.datepicker-day-timeSegment{
    color:royalblue;
}
/**********************/
</style>