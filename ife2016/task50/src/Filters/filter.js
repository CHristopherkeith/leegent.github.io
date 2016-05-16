// 问卷状态过滤器
function qStateFormat(qs) {
	if(qs === "draft") return "未发布";
	else if(qs === "released") return "发布中";
	else if(qs === "closed") return "已结束";
	else return "【状态错误】";
}

// 日期格式过滤器
function pureDate(date){
	if(date === null || date === "-") return "-";
	var tmp = date.split("/");
	return tmp[2]+"-"+tmp[0]+"-"+tmp[1];
}

// 题型过滤器
function qTypeFormat(qtype){
	if(qtype==="single") return "单选题";
    else if(qtype==="multi") return "多选题";
    else if(qtype==="text") return "文本题";
    else return "unknown";
}

export default {
	qStateFormat,pureDate,qTypeFormat
}