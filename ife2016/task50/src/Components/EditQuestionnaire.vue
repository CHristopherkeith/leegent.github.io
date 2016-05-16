<template>
<datepicker v-if="showDatepicker" :startday="startDay" :endday="endDay" :ismultiselect="isMultiselect" :maxlen="maxLen" :minlen="minLen"></datepicker>
    <div class="edit-container">
        <header class="edit-header"><input type="text" class="edit-title-input" placeholder="这里是标题" v-model="qTitle"></header>
        <main class="edit-main">
            <section v-for="question in quesList" class="edit-question">
                <div class="edit-question-area-desc">
                    Q{{ question.order }}&nbsp;({{ question.qtype | qTypeFormat }})
                    <input type="text" class="edit-question-input" v-model="question.stem">
                    <label>
                        <input type="checkbox" checked="checked" v-model="question.required">
                        此题必答
                    </label>
                </div>
                <div class="edit-question-area-option">
                <template v-if="question.qtype !== 'text'">
                    <div v-for="option in question.options" class="edit-question-option-{{question.qtype}}">
                        <span>{{ option.id }}.</span>
                        <input type="text" class="edit-question-input" v-model="option.content">
                        <span class="edit-option-button-delete" @click="deleteOption(question.order,option.id)">删除选项</span>                           
                    </div>
                    <div class="edit-option-button-add" @click="addOption(question.order)">┼&nbsp;新增选项</div>
                </template>
                </div>
                <div class="edit-question-area-adjust">
                    <span v-if="question.order>1" @click="moveUp(question.order)">上移</span>
                    <span v-if="question.order<quesList.length" @click="moveDown(question.order)">下移</span>
                    <span @click="copyQuestion(question.order)">复用</span>
                    <span @click="deleteQuestion(question.order)">删除</span>
                </div>
            </section>
            <div class="edit-new-question">
                <section class="edit-new-question-type" v-if="addButtonState">
                    <span class="edit-new-question-single" @click="addQuestion('single')">单选题</span>
                    <span class="edit-new-question-multi" @click="addQuestion('multi')">多选题</span>
                    <span class="edit-new-question-text" @click="addQuestion('text')">文本题</span>
                </section>
                <div class="edit-new-question-button" v-on:click="showAddQuestion">┼&nbsp;添加问题</div>
            </div>
        </main>
        <footer class="edit-footer">
            <label>问卷截止日期:&nbsp;<input type="text" v-model="inputDeadline" @click="clickInputDate" @keypress.prevent></label>
            <a class="button-in-table" v-link="'/'">返回列表</a><a class="button-in-table" @click="release">发布问卷</a><a class="button-in-table" @click="save">保存问卷</a>
        </footer>
    </div>
</template>

<script>
    import datepicker from "./Datepicker.vue";
    import store from "./store.js";
    import filter from "../Filters/filter"

    export default{
        components:{
            datepicker
        },
        data:function () {
            let questionnaire = store.fetchQuestionnaire(parseInt(this.$route.params.qid));
            return {
                qid:parseInt(this.$route.params.qid),
                // 添加新问题的三个按钮是否展示
                addButtonState:false,
                // 日历是否显示
                showDatepicker:false,
                // 问卷标题
                qTitle:questionnaire.title,
                // 问卷截止日期
                deadline:questionnaire.deadline,
                // 用户在控件上选择的截止日期
                inputDeadline:null,
                // 问题列表
                quesList:questionnaire.questionList,
                // 构造日历的五个参数
                startDay:(new Date()).setHours(0,0,0),
                endDay:new Date("6/10/2017"),
                isMultiselect:false,
                maxLen:0,
                minLen:0
            };
        },
        created:function () {
            if(this.deadline!=null){
                var tmp = this.deadline.split("/");
                this.inputDeadline = tmp[2]+"-"+tmp[0]+"-"+tmp[1];
            }
            else{
                this.inputDeadline = "";
            }
        },
        methods:{
            // 点击添加问题后的回调
            showAddQuestion:function (e) {
                this.addButtonState = !this.addButtonState;
            },
            // 获得问题类型的中文表示
            getTypeName:function (qtype) {
                
            },
            // 添加新问题
            addQuestion:function (qtype) {
                var newQues={};
                newQues.order = this.getNewOrder();
                newQues.qtype = qtype;
                newQues.required = true;
                if(qtype==="single"){
                    newQues.stem="单选题";
                    newQues.options=[{id:1,content:"单选项一"},{id:2,content:"单选项二"}];
                }
                else if(qtype==="multi") {
                    newQues.stem="多选题";
                    newQues.options=[{id:1,content:"多选项一"},{id:2,content:"多选项二"}];
                }
                else{
                    newQues.stem="文本题";
                    newQues.options=[];
                }
                this.quesList.push(newQues);
            },
            // 新增选项
            addOption:function (order) {
                var text,newId;
                if(this.quesList[order-1].qtype==="single") text = "新单选项";
                else text = "新多选项";
                newId = this.quesList[order-1].options.length+1;
                this.quesList[order-1].options.push({id:newId,content:text});
            },
            /** 
             * 删除选项
             * @param {Number} order 题目序号
             * @param {Number} id 选项id
             */
            deleteOption:function (order,id) {
                this.quesList[order-1].options.splice(id-1,1);
                // 调整删除的选项之后所有选项的id
                for(var i=id-1;i<this.quesList[order-1].options.length;i++){
                    this.quesList[order-1].options[i].id -= 1;
                }
            },
            // 获取题号，即是最大的题号
            getNewOrder:function () {
                return this.quesList.length+1;
            },
            moveUp:function (order) {
                this.swapQuestions(order,order-1);
            },
            moveDown:function (order) {
                this.swapQuestions(order,order+1);
            },
            swapQuestions:function (o1,o2) {
                this.quesList[o1-1] = this.quesList.splice(o2-1,1,this.quesList[o1-1])[0];
                this.quesList[o1-1].order = o1;
                this.quesList[o2-1].order = o2;
            },
            // 复用：深复制
            copyQuestion:function (order) {
                var q = {},
                    tmp,
                    i;
                q.order = this.quesList[order-1].order;
                q.title = this.quesList[order-1].title;
                q.qtype = this.quesList[order-1].qtype;
                q.required = true;
                q.options = [];
                for(i=0;i<this.quesList[order-1].options.length;i++){
                    tmp = {};
                    tmp.content = this.quesList[order-1].options[i].content;
                    q.options.push(tmp);
                }
                // 插入到原问题的后面
                this.quesList.splice(order,0,q);
                for(i=order;i<this.quesList.length;i++){
                    this.quesList[i].order ++;
                }
            },
            // 删除问题
            deleteQuestion:function (order) {
                for(var i = order;i<this.quesList.length;i++){
                    this.quesList[i].order -= 1;
                }
                this.quesList.splice(order-1,1);
            },
            clickInputDate:function(){
                this.toggleDatepicker();
                this.deadline = null;
            },
            // 切换日历显示状态
            toggleDatepicker:function () {
                this.showDatepicker = !this.showDatepicker;
            },
            hideDatepicker:function (){
                this.showDatepicker = false;
            },
            // 保存问卷
            save: function () {
                var i,dl,tmp;
                // 检查问题是否有至少一道
                if(this.quesList.length === 0){
                    alert("问卷至少应有1道问题！");
                    return false;
                }
                // 检查各问题是否有题干，选择题是否有两个及以上选项
                for(i=0;i<this.quesList.length;i++){
                    if(this.quesList[i].stem.trim() === ""){
                        alert("请确保每道题都有说明文字");
                        return false;
                    }
                    if(this.quesList[i].qtype === "single" || this.quesList[i].qtype === "multi"){
                        if(this.quesList[i].options.length < 2){
                            alert("选择题至少要有两个选项！");
                            return false;
                        }
                    }
                }
                // 检查截止日期是否有填写
                if(this.inputDeadline === "") dl=null;
                else{
                    tmp = this.inputDeadline.split("-");
                    dl = tmp[1]+"/"+tmp[2]+"/"+tmp[0];
                }
                if(store.saveQuestionnaire(this.qid,this.qTitle,dl,this.quesList)) alert("问卷保存成功！");
            },
            // 发布问卷
            release:function () {
                var rsp = store.releaseQuestionnaire(this.qid);
                if( rsp === true){
                    alert("问卷发布成功！");
                    // 回到首页
                    this.$route.router.go("/");
                }
                else alert(rsp);
            }
        },
        events:{
            "singleSelect": function(msg){
                this.inputDeadline = msg.selectedDate;
                this.hideDatepicker();
            },
            "okClick": function (msg){
                this.showDatepicker = false;
            },
            "cancelClick":function (){
                this.showDatepicker = false;
            }
        },
        filters:filter
    }
</script>

<style lang="less">
    @base-color: #ee7419;
    @hover-color: #fcf0e5;
    @border-style: 1px solid #000;
    .edit-button-common {
        -webkit-user-select: none;
        user-select: none;
        cursor: pointer;
        font-weight: lighter;
    }

    .edit-container {
      width: 100%;
    }

    .edit-header {
        position: relative;
        padding: 10px 10px 10px 10px;
        border-bottom: @border-style;
    }

    .edit-title-input {
        margin: 0;
        height: 3em;
        width: 100%;
        border: none;
        font-size: 25px;
        font-family: "黑体";
        text-align: center;
    &:hover {
         background-color: @hover-color;
     }
    }

    .edit-main {
        padding: 20px;
        border-bottom: @border-style;
        min-height: 135px;
    }

    .edit-question-input {
        outline: none;
        width: 60em;
        background-color: transparent;
        border: none;
        width: 600px;
        &:focus{
            font-weight: bold;
        }
    }

    .edit-question {
        padding: 1em;
        &:hover {
         background-color: @hover-color;
         .edit-question-area-adjust>span{
            visibility: visible;
         }
         .edit-option-button-add{
            visibility: visible;
         }
         .edit-option-button-delete{
            visibility: visible;
         }
        }
    }

    .edit-question-area-desc {
      font-family: "黑体";
      input {
        font-family: "黑体";
      }
      label{
        .edit-button-common;
        float:right;
        font-size: 16px;
      }
    }

    .edit-question-area-option {
        padding-left: 3em;
        min-height: 1em;
    }

    .edit-question-option-before {
        display: inline-block;
        content: " ";
        width: 8px;
        height: 8px;
        border: 1px solid #000;
    }

    .edit-question-option-single:before {
        .edit-question-option-before;
        border-radius: 50%;
    }

    .edit-question-option-multi:before {
      .edit-question-option-before;
    }

    .edit-option-button-add{
        .edit-button-common;
        visibility: hidden;
        display: inline-block;
        margin-top: .5em;
        padding:.3em 1.5em;
        font-size: 12px;
        border:1px dashed #000;
        &:hover{
            font-weight: bold;
        }
    }
    .edit-option-button-delete{
        .edit-button-common;
        visibility: hidden;
        display: inline-block;
        font-size: 12px;
        &:hover{
            color:blue;
        }
    }

    .edit-question-area-adjust {
        height:1.6em;
        text-align: right;
      span {
        .edit-button-common;
        visibility: hidden;
        display: inline-block;
        margin: .3em .5em;
        font-size: 14px;
        font-family: "Microsoft YaHei UI";
        &:hover {
          color: blue;
      }
    }
    }

    .edit-new-question {
        width: 100%;
        border: 1px solid lightgray;
    }

    .edit-new-question-button {
      .edit-button-common;
      height: 5em;
      background-color: #efefef;
      font-size: 20px;
      line-height: 5em;
      text-align: center;
      &:hover {
        font-weight: bold;
      }
    }

    .edit-new-question-type {
        height: 4em;
        display: flex;
        justify-content: center;
        align-items: center;
        span {
        .edit-button-common;
            padding: .3em 1.5em;
            border: 1px solid lightgray;
            background-color: #efefef;
            font-size: 14px;
            margin: 0 1em;
        }
        span:hover {
            background-color: @base-color;
            color: #fff;
        }
    }

    .edit-footer {
      position: relative;
      padding: 20px 80px 20px 80px;
      label {
        .edit-button-common;
        margin-right: 1em;
      }
      a {
        float: right;
      }
    }
</style>