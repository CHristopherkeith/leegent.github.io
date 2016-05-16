<template>
	<div>
		<header class="view-header">{{ questionnaire.title }}</header>
		<main class="view-main">
			<section v-for="question in qList" class="view-question">
				<div class="view-question-area-desc">
					<span class="view-question-required">{{ question.required?"*":"&nbsp;" }}</span>Q{{ question.order }}&nbsp;({{ question.qtype | qTypeFormat }}){{ question.stem }}
                </div>
                <div>
	                <textarea class="view-question-textarea" v-if="question.qtype === 'text'" v-model="resp[question.order-1]"></textarea>
	                <ul v-else class="view-question-options">
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
        font-family: "黑体";
        text-align: center;
    }

    .view-question {
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

    .view-question-options {
    	list-style: none;
    	font-family: "Microsoft YaHei UI";
    	li{
    		display: inline-block;
    	}
    }

    .view-footer {
      position: relative;
      text-align: center;
    }

    @media (min-width:421px){
        .view-header{
            padding: .625em;
            font-size: 1.875em;
        }

        .view-main {
            padding: 1.25em;
        }

        .view-question{
            padding: 1em;            
        }

        .view-question-options{
            font-size: .875em;
            li{
                margin-right: 2em;
            }
        }

        .view-question-textarea{
            margin-left: 2.5em;
            width: 40em;
            height: 5em;
        }

        .view-footer{
            padding: 1.25em 5em;
        }
    }

    @media (max-width:420px){
        .view-header{
            padding: .225em;
            font-size: 1.25em;
        }

        .view-main {
            padding: .25em;
        }

        .view-question-options{
            font-size: 1em;
            padding:0 .5em 0 .5em;
            li{
                margin-right: .5em;
            }
        }

        .view-question-textarea{
            margin: 0 5% 0 5%;
            width: 90%;
            height: 5em;
        }

        .view-footer{
            padding: .25em 1em;
        }
    }

</style>