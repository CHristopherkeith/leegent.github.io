/**
 *
 * @param {Object} {Element} targetDOM 日历输出结果的DOM元素（文本框）.{Date} startDay 可选日期的第一天,{Date} endDay 可选日期的最后一天, {Boolean} isMultiselect 是否选择时间段 {Number} maxLen 最大时间跨度 {Number} minLen 最小时间跨度
 */
/**
 * @description 日历构造函数
 * @param obj
 * @constructor
 */
function Datepicker(obj) {
    this.targetJQ = $(obj.targetDOM);
    // 将关联文本框指回来
    this.targetJQ[0].datepicker = this;
    this.startDay = obj.startDay;
    this.endDay = obj.endDay;

    // 时段选择变量
    this.isMultiselect = obj.isMultiselect || false;
    // 选择状态，时段选择时会用到，0是尚未点击，1是点击了第一个日期，2是点击了第二个日期，再点一下则会回到状态0
    this.state = 0;
    // 第一个日期就是currentDate
    this.secondDate = null;
    // 最大、最小时间跨度，为0说明无限制
    this.maxLen = obj.maxLen || 0;
    this.minLen = obj.minLen || 0;

    // 当前选中的日期。单选模式下不能为空，多选模式下可以为空
    this.currentDate = new Date();
    // 当前页面所在的年、月
    this.selectedYear = this.currentDate.getFullYear();
    this.selectedMonth = this.currentDate.getMonth() + 1;
    // 多选模式下将currentDate置空
    if (this.isMultiselect)this.currentDate = null;
    // 被选中日期，一定会被渲染。多选模式下可以将其置为-1
    this.selectedDate = -1;
    // 可选日期的范围
    if (!this.startDay) this.startDay = new Date(this.selectedMonth + "/" + this.currentDate.getDate() + "/" + (this.selectedYear - 1));
    if (!this.endDay) this.endDay = new Date(this.selectedMonth + "/" + this.currentDate.getDate() + "/" + (this.selectedYear + 1));
    // 选择日期后的回调函数
    this.callback = null;
    // 从模板创建jQuery对象
    this.JQ = $($("#template-datepicker").html()).appendTo(document.body).css(
        {
            "left": this.targetJQ.offset().left + "px",
            "top": this.targetJQ.offset().top
            + parseInt(this.targetJQ.css("border-top-width"))
            + parseInt(this.targetJQ.css("padding-top"))
            + this.targetJQ.height()
            + parseInt(this.targetJQ.css("padding-bottom"))
            + parseInt(this.targetJQ.css("border-bottom-width"))
            + "px",
            "z-index": 100
        }
    );
    // 将DOM对象指回自身
    this.JQ[0].self = this;
    // 日期部分单元格的数组
    this.dates = this.JQ.find("td");
    // 缓存年月下拉框
    this.yearSelector = this.JQ.find(".datepicker-select-year");
    this.monthSelector = this.JQ.find(".datepicker-select-month");
    // 缓存确定、取消按钮
    this.okbtn = this.JQ.find(".datepicker-ok");
    this.cancelbtn = this.JQ.find(".datepicker-cancel");
    // 给DOM设置指向该对象的指针
    this.yearSelector[0].datepicker = this;
    this.monthSelector[0].datepicker = this;
    this.okbtn[0].datepicker = this;
    this.cancelbtn[0].datepicker = this;

    // ================初始化界面=========================
    // 年下拉框添加option，以今年为准前推30年、后推5年
    var option;
    for (var i = this.selectedYear - 30; i <= this.selectedYear + 5; i++) {
        option = $("<option>").text(i).val(i);
        this.yearSelector.append(option);
    }
    this.yearSelector.val(this.selectedYear);
    // 向月下拉框添加option    
    for (i = 1; i < 13; i++) {
        option = $("<option>").text(i).val(i);
        this.monthSelector.append(option);
    }
    this.monthSelector.val(this.selectedMonth);
    // 渲染日期表格
    this.render();
    //=====================事件绑定区=========================
    // 绑定的文本框被点击时，清空文本框，转换日历的可见性
    this.targetJQ.click(function () {
        this.value = "";
        this.datepicker.JQ.toggle();
    });
    // 绑定事件：选择年份改变、选择月份改变
    this.yearSelector.bind("change", function () {
        this.datepicker.selectedYear = $(this).val();
        this.datepicker.render();
    });
    this.monthSelector.bind("change", function () {
        this.datepicker.selectedMonth = $(this).val();
        this.datepicker.render();
    });
    // 绑定事件：点击确定、取消按钮
    this.okbtn.bind("click", function ok() {
        // 向关联文本框输出日期
        this.datepicker.outputDate();
        // 清除已有选择
        this.datepicker.reset();
        this.datepicker.render();
        // 改变日历可见性
        this.datepicker.JQ.toggle();
    });
    this.cancelbtn.bind("click", function cancel() {
        // 清除已有选择
        this.datepicker.reset();
        this.datepicker.render();
        // 改变日历可见性
        this.datepicker.JQ.toggle();
    });
    // datepicker DIV充当点击事件代理
    this.JQ.bind("click", function (e) {
        var target = e.target || e.srcElement;
        // 点上个月日期或者左箭头
        if (target.className == "datepicker-day-previousmonth" || target.className == "datepicker-arrow-left") {
            // 1月的前一月是上一年的12月
            if (this.self.selectedMonth === 1) {
                this.self.selectedMonth = 12;
                this.self.selectedYear--;
            }
            else this.self.selectedMonth--;
            this.self.render();
        }
        // 点击下个月日期或右箭头
        else if (target.className == "datepicker-day-nextmonth" || target.className == "datepicker-arrow-right") {
            // 12月的后一月是下一年的1月
            if (this.self.selectedMonth === 12) {
                this.self.selectedMonth = 1;
                this.self.selectedYear++;
            }
            else this.self.selectedMonth++;
            this.self.render();
        }
        // 点击当月可选日期
        else if (target.className.indexOf("datepicker-day-currentmonth") != -1) {
            // 多选模式交给专门的函数处理
            if (this.self.isMultiselect) {
                this.self.clickMulti(target);
            }
            else {
                this.self.selectedDate = target.dataset.date;
                this.self.render();
                // 若设置了回调函数则执行之
                if (this.self.callback) this.self.callback();
            }
        }
    });
}
// 恢复默认值
Datepicker.prototype.reset = function () {
    this.currentDate = new Date();
    this.secondDate = null;
    this.selectedYear = this.currentDate.getFullYear();
    this.selectedMonth = this.currentDate.getMonth() + 1;
    if (this.isMultiselect) this.currentDate = null;
    this.selectedDate = -1;
    this.state = 0;
};
// 设置选中的日期对象。只有在点击可选日期时才会调用该函数
Datepicker.prototype.setCurrentDate = function () {
    if (this.currentDate != null) {
        this.currentDate.setFullYear(this.selectedYear);
        this.currentDate.setMonth(this.selectedMonth - 1);
        this.currentDate.setDate(this.selectedDate);
    }
    else {
        this.currentDate = new Date((this.selectedMonth) + "/" + this.selectedDate + "/" + this.selectedYear);
    }
};
// 返回选中的日期对象
Datepicker.prototype.getCurrentDate = function () {
    return this.currentDate;
};
/**
 * 设置选中日期的接口
 * @param {Date} obj 要设置的日期
 */
Datepicker.prototype.setSelected = function (obj) {
    this.selectedYear = obj.getFullYear();
    this.selectedMonth = obj.getMonth() + 1;
    this.selectedDate = obj.getDate();
    this.outputDate();
    this.render();
};
// 获取选中日期的"YYYY-mm-DD"格式字符串
Datepicker.prototype.formatDate = function (date) {
    if (date instanceof Date)    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    else return "";
};
/**
 * 获取两个日期之间相差的天数，忽视时分秒。date2在后为正，date1在后为负
 * @param {Date} date1
 * @param {Date} date2
 * @returns {Number}
 */
Datepicker.prototype.dateDiff = function (date1, date2) {
    if (!(date1 instanceof Date) || !(date2 instanceof Date)) return null;
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    return (date2 - date1) / (1000 * 60 * 60 * 24);
};
// 向关联的DOM元素输出日期
Datepicker.prototype.outputDate = function () {
    if (!this.isMultiselect) {
        this.targetJQ.val(this.formatDate(this.currentDate));
    }
    else {
        if (this.currentDate < this.secondDate) {
            this.targetJQ.val(this.formatDate(this.currentDate) + " 至 " + this.formatDate(this.secondDate));
        }
        else {
            this.targetJQ.val(this.formatDate(this.secondDate) + " 至 " + this.formatDate(this.currentDate));
        }
    }
};
/**
 * 判断一个日期是否在可选范围内
 * @param {Date} day 日期
 */
Datepicker.prototype.isSelectable = function (day) {
    return !!(day >= this.startDay && day <= this.endDay);
};
// 设置选择日期后的回调函数
Datepicker.prototype.setCallback = function (cb) {
    this.callback = cb;
};
// 将多选模式的点击事件分离出来写成函数
// 判断是否处在选择的时间段
Datepicker.prototype.isInTimeSegment = function (day) {
    // 只在模式2下有可能返回true
    if (this.state <= 1) return false;
    return !!((day >= this.currentDate && day <= this.secondDate) || (day >= this.secondDate && day <= this.currentDate))
};
// 多选模式下的点击代理，target是一个可选范围内的日期DOM。该函数作用是切换状态
Datepicker.prototype.clickMulti = function (target) {
    // 状态0，未选择任何日期
    if (this.state == 0) {
        this.selectedDate = target.dataset.date;
        this.state = 1;
        this.setCurrentDate();
        this.render();
    }
    // 状态1，已选择了第一个日期
    else if (this.state == 1) {
        // 当前点击的年月日的临时变量
        var tmpdate = new Date(this.selectedMonth + "/" + target.dataset.date + "/" + this.selectedYear);
        var diff = Math.abs(this.dateDiff(tmpdate, this.currentDate));
        // 若重复点击已选日期，则什么也不做
        if (diff == 0) return;
        // 判断一下是否满足时间跨度要求，不满足时阻止此次选择并给出相应提示
        if (this.maxLen > 0 && diff > this.maxLen) {
            alert("您选择的日期跨度为" + diff + "天，超过了" + this.maxLen + "天的最大跨度！");
            return;
        }
        if (this.minLen > 0 && diff < this.minLen) {
            alert("您选择的日期跨度为" + diff + "天，低于了" + this.minLen + "天的最小跨度！");
            return;
        }
        // 将第二个日期指向该变量
        this.secondDate = tmpdate;
        this.state = 2;
        this.render();
    }
    // 状态3，已经选中了一个时间段 ，再点则将刚点击的点作为新的currentDate，回到状态1
    else {
        this.selectedDate = target.dataset.date;
        this.setCurrentDate();
        this.secondDate = null;
        this.state = 1;
        this.render();
    }
};
// 渲染年、月和日期选择页面
Datepicker.prototype.render = function () {
    // 渲染年月
    this.yearSelector.val(this.selectedYear);
    this.monthSelector.val(this.selectedMonth);
    var that = this;
    // 本年的二月最后一天是28还是29
    var FebLastDay = (function () {
        // 是闰年
        if ((that.selectedYear % 4 === 0 && that.selectedYear % 100 != 0) || that.selectedYear % 400 === 0) return 29;
        else return 28;
    })();
    var lastDateOfMonths = [0, 31, FebLastDay, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    // 向日期表格添加日期
    // 临时日期型变量
    var tmp = new Date(this.selectedMonth + "/" + 1 + "/" + this.selectedYear);
    // 获得本月1号是星期几，也等于要输出的上个月最后几天的天数
    var firstDayOfCurrentMonth = tmp.getDay();
    var i, k; // k代表当前输出几号
    // 计算开头要输出几格上个月的日期。 先-1变成0——11，模12，然后-1表示上个月，+12再%12表示12月到1月循环，最后+1变回1——12月
    var lastMonth = (this.selectedMonth - 1 - 1 + 12) % 12 + 1;
    // 输出上个月的日期
    for (i = 0, k = lastDateOfMonths[lastMonth] - firstDayOfCurrentMonth + 1; i < firstDayOfCurrentMonth; k++, i++) {
        $(this.dates[i]).removeClass().addClass("datepicker-day-previousmonth").html(k);
    }
    // 输出当前月份的日期。先判断是否处于可选范围，据此输出不同的样式；在可选范围内再判断是否是当前被选中日期
    for (k = 1; k <= lastDateOfMonths[this.selectedMonth]; k++, i++) {
        tmp.setDate(k);
        // 可选日期，分3种情况：普通可选，已被选中，位于时段内
        if (this.isSelectable(tmp)) {
            // 用data-date自定义属性存储日期，可以用dataset来取
            $(this.dates[i]).removeClass().addClass("datepicker-day-currentmonth").attr("data-date", k).html(k);
            if (this.dateDiff(tmp, this.currentDate) == 0 || this.dateDiff(tmp, this.secondDate) == 0) {
                $(this.dates[i]).addClass("datepicker-day-selected");
            }
            if (this.isInTimeSegment(tmp)) $(this.dates[i]).addClass("datepicker-day-timeSegment");
        }
        // 不可选日期
        else {
            $(this.dates[i]).removeClass().addClass('datepicker-day-unselectable').html(k);
        }
    }
    // 输出下个月的日期
    for (k = 1; i < this.dates.length; k++, i++) {
        $(this.dates[i]).removeClass().addClass('datepicker-day-nextmonth').html(k);
    }
};
//=================================demo===============================================
var start = new Date("4/6/2016");
var end = new Date("6/22/2016");
var obj = {
    targetDOM: document.querySelector("#input-date"),
    startDay: start,
    endDay: end,
    isMultiselect: true,
    minLen: 7,
    maxLen: 40
};
var calendar = new Datepicker(obj);
calendar.setCallback(function () {
    var date = this.getSelected();
    alert("你选择了日期 " + date);
});