<template>
	<div class="view-container">
		<header class="view-header">{{ title }}</header>
		<section class="view-question" v-for="question in qList">
			<div class="view-question-chart" id="chart-{{ question.order }}"></div>
		</section>
		<footer class="view-footer"><a class="button-in-table" v-link="'/'">返回问卷列表</a></footer>
	</div>
</template>

<script>
import store from "./store";
import filter from "../Filters/filter"
var echarts = require("echarts");

export default{
	data:function () {
		var questionnaire = store.fetchQuestionnaire(parseInt(this.$route.params.qid)),
			qList = questionnaire.questionList,
			respList = questionnaire.respondents;		
		return {
			title:questionnaire.title,
			qList:qList,
			respList:respList,
			myCharts:[]
		}
	},
	ready:function () {
		// 统计每个问题的回答情况，按照echarts接受的格式存放
		var chartsOptions = [], chartsData = [],
			option, optionCount,
			i,j,k;
		for(i=0;i<this.qList.length;i++){
			option = {};
			// 获取题号、题干
			option.title = { text : this.qList[i].order+"."+this.qList[i].stem };
			option.tooltip = {};
			// 对于单选题
			if(this.qList[i].qtype === "single"){
				optionCount = [];
				for(j=0;j<this.qList[i].options.length;j++){
					// 每个选项的内容
					optionCount.push({value:0,name:this.qList[i].options[j].content});
				}
				chartsData.push(optionCount);
				option.series = [{name:"人数",type:"pie",data:null,barMaxWidth:50}];
			}
			// 对于多选题
			else if(this.qList[i].qtype === "multi"){
				// 统计选择该问题各个选项的人数
				optionCount = [];
				// 获取各个选项的名字
				option.xAxis = {data:[]};
				for(j=0;j<this.qList[i].options.length;j++){
					option.xAxis.data.push(this.qList[i].options[j].content);
					optionCount.push(0);
				}
				chartsData.push(optionCount);
				option.yAxis={};
				option.series = [
					{
						name:"人数",
						type:"bar",
						data:null,
						barMaxWidth:50
					}
				];
			}
			// 对于文本题，用条形展现有效回答人数
			else{
				chartsData.push([0,this.respList.length]);
				option.xAxis = {data:["有效回答","无效回答或未作答"]};
				option.yAxis = {};
				option.series = [
					{
						name:"人数",
						type:"bar",
						data:null,
						barMaxWidth:50
					}
				];
			}
			// 添加该题的配置
			chartsOptions.push(option);
		}
		// 遍历所有回答者，统计每个问题的回答情况
		for(i=0;i<this.respList.length;i++){
			for(j=0;j<this.respList[i].length;j++){
				// 单选题
				if(this.qList[j].qtype === "single"){
					if(isNaN(this.respList[i][j])){
						console.log("Wrong data format!");
					}
					else{
						chartsData[j][this.respList[i][j]-1].value++;
					}
				}
				// 多选题
				else if(this.qList[j].qtype === "multi"){
					if(!(this.respList[i][j] instanceof Array)){
						console.log("Wrong data format!");
					}
					else{
						for(k=0;k<this.respList[i][j].length;k++){
							chartsData[j][this.respList[i][j][k]-1]++;
						}
					}
				}
				// 文本题，统计答案长度大于0的人数
				else{
					if(this.respList[i][j].length > 0) {
						chartsData[j][0]++;
						chartsData[j][1]--;
					}
				}
			}
		}
		//  将数据添加到图表配置里，初始化图表
		var chart;
		for(i=0;i<chartsOptions.length;i++){
			chartsOptions[i].series[0].data = chartsData[i];
			chart = echarts.init(document.getElementById("chart-"+(i+1)));
			chart.setOption(chartsOptions[i]);
			this.myCharts.push(chart);
		}		
	},
	methods:{

	},
	filters:filter
}
</script>

<style>
	@media (min-width:421px){
		.view-question-chart{
			width: 600px;
			height: 400px;
		}
	}
	@media (max-width:420px){
		.view-question-chart{
			width: 100%;
			height: 200px;
		}
	}
</style>