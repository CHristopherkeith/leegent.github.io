<template>
	<div>
		<header class="view-header">{{ questionnaire.title }}</header>
		<main class="view-main">
			<section v-for="question in qList" class="view-question">
				<div class="view-question-area-desc">
					<span class="view-question-required">{{ question.required?"*":"&nbsp;" }}</span>Q{{ question.order }}&nbsp;({{ question.qtype | qTypeFormat }}){{ question.stem }}
                </div>
                <div class="view-question-area-option">
	                <textarea class="view-question-textarea" v-if="question.qtype === 'text'" v-model="resp[question.order-1]"></textarea>
	                <ul v-else>
	                	<li v-for="option in question.options">
	                		<label><input type="{{ question.qtype=='single'?'radio':'checkbox' }}" :name="question.order" :value="option.id" v-model="resp[question.order-1]">{{ option.content }}</label>
	                	</li>
	                </ul>
                </div>
			</section>
		</main>
		<footer class="view-footer"><a class="button-in-table" :disabled="submittable" @click="submit">提交回答</a><a class="button-in-table" v-link="'/'">返回列表</a></footer>
	</div>
</template>

<script>
	import store from "./store";
	import filter from "../Filters/filter";

	export default {
		data:function () {
			var q = store.fetchQuestionnaire(parseInt(this.$route.params.qid));
			return {
                qid:parseInt(this.$route.params.qid),
				questionnaire:q,
				qList:q.questionList,
                // 答案的数据模型
                resp:[]
			}
		},
        created:function () {
            // 初始化resp
            for(var i=0;i<this.qList.length;i++){
                if(this.qList[i].qtype === "single"){
                    this.resp.push(0);
                }
                else if(this.qList[i].qtype === "multi"){
                    this.resp.push([]);
                }
                else {
                    this.resp.push("");
                }
            }
        },
		computed:{
			submittable: function () {
				if(this.questionnaire.state === "released") return "";
				else return "disabled";
			}
		},
        methods:{
            submit: function () {
                // 首先查看问卷状态
                if(this.questionnaire.state === "draft"){
                    alert("提交失败，问卷尚未发布");
                    return false;
                }
                else if(this.questionnaire.state === "closed"){
                    alert("提交失败，问卷已过截止日期！");
                    return false;
                }
                // 首先检验各个必答题是否都已做好
                for(var i=0;i<this.resp.length;i++){
                    if(this.qList[i].required && (this.resp[i] === 0 || this.resp[i].length === 0)){
                        alert("请先完成所有必答题");
                        return false;
                    }
                }
                if(store.submitAnswer(this.qid,this.resp)){
                    alert("提交成功！");
                    this.$route.router.go("/");
                }
            }
        },
		filters:filter
	}
</script>

<style lang="less">
    @base-color: #ee7419;
    @hover-color: #fcf0e5;
    @border-style: 1px solid #000;
    .view-header {
        position: relative;
        padding: 10px 10px 10px 10px;
        // border-bottom: @border-style;
        font-size: 30px;
        font-family: "黑体";
        text-align: center;
    }

    .view-main {
        padding: 20px;
        min-height: 135px;
    }

    .view-question {
	    padding: 1em;
    	-webkit-user-select: none;
    	user-select: none;
    	cursor: default;
    }

    .view-question-required{
    	color: red;
    }

    .view-question-area-desc {
      font-family: "黑体";
    }

    .view-question-area-option {
        min-height: 1em;
        ul{
        	list-style: none;
        	font-size: 14px;
        	font-family: "Microsoft YaHei UI";
        	li{
        		display: inline-block;
        		margin-right: 2em;
        	}
        }
    }

    .view-question-textarea{
    	margin-left: 2.5em;
    	width: 40em;
    	height: 5em;
    }

    .view-footer {
      position: relative;
      padding: 20px 80px 20px 80px;
      text-align: center;
    }

</style>