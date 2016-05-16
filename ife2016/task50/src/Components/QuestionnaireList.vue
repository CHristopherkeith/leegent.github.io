<template>
    <pop v-if="showPop" :title="popTitle" :content="popContent"></pop>
    <table class="headfixedtable" v-if="qList.length>0">
        <thead>
        <tr class="questionair-list-head">
            <th></th>
            <th>标题</th>
            <th>发布时间</th>
            <th>结束时间</th>
            <th>状态</th>
            <th><span>操作</span><a class="button-create" @click="createQues">┼&nbsp;新建问卷</a></th>
        </tr>
        </thead>
        <template v-for="ques in qList">
            <tr class="questionair-list-rows">
                <td class="questionair-list-first-column"><input type="checkbox" name="questionaire" v-bind:value="ques.id" v-model="checkedQues"></td>
                <td>{{ ques.title }}</td>
                <td>{{ ques.releaseDate | pureDate }}</td>
                <td>{{ ques.state === 'draft'? null : ques.deadline | pureDate }}</td>
                <td class="questionaire-state-{{ ques.state }}">{{ ques.state | qStateFormat }}</td>
                <td v-if="ques.state === 'draft'" class="questionaire-list-last-column">
                    <a class="button-in-table" v-link="{name:'editques',params:{user:1,qid:ques.id}}">编辑</a><a class="button-in-table" @click="deleteQues(ques.id,ques.title)">删除</a><a class="button-in-table" v-link="{name:'viewques',params:{user:1,qid:ques.id}}">查看问卷</a>
                </td>
                <td v-else class="questionaire-list-last-column">
                    <a class="button-in-table" v-link="{name:'viewques',params:{user:1,qid:ques.id}}">查看问卷</a><a class="button-in-table" v-link="{name:'viewcharts',params:{user:1,qid:ques.id}}">查看数据</a>
                </td>
            </tr>G
        </template>
        <tr class="questionair-list-lastrow">
            <td class="questionair-list-first-column"><label><input type="checkbox" v-model="checkedAll" @change="checkAll">全选</label></td>
            <td colspan="5"><a class="button-in-table" @click="batchDelete">批量删除</a> </td>
        </tr>
        </table>
    <a v-else class = "button-big-create" @click="createQues">┼&nbsp;新建问卷</a>
</template>

<script>
    import pop from "./Pop";
    import store from "./store";
    import filter from "../Filters/filter";

    export default{
        components:{
            "pop":pop
        },
        data:function(){
            var qList = store.fetch().questionnaireList;
            return {
                qList: qList,
                checkedQues: [],
                checkedAll: false,
                // 是否显示浮出层
                showPop:false,
                // 浮出层组件标题和提示内容
                popTitle:"提示",
                popContent:"",
                // 当前操作的问卷id
                currentQid:0
            };
        },
        methods:{
            // 全选
            checkAll () {
                // 表示勾上了全选
                if(this.checkedAll){
                    // 取消所有选中
                    while(this.checkedQues.pop());
                    // 将所有qid入队
                    for(var i=0;i<this.qList.length;i++){
                        this.checkedQues.push(this.qList[i].id);
                    }
                }
                // 表示取消了全选
                else {
                    // 取消所有选中
                    while(this.checkedQues.pop());
                }
            },
            // 新建问卷：创建一个空白问卷并跳转到该问卷的编辑页面
            createQues () {
                var newqid = store.addQuestionnaire(1);
                this.$route.router.go({name:"editques",params:{user:1,qid:newqid}});
            },
            // 删除单个问卷
            deleteQues (qid,title) {
                // 弹出浮出层
                this.currentQid = qid;
                this.popTitle = "删除提示";
                this.popContent = "确定要删除问卷 " + title+" 吗?";
                this.showPop = true;
            },
            // 批量删除问卷
            batchDelete () {
                // 检查是否有选中的问卷
                if(this.checkedQues.length === 0) alert("请选中要删除的问卷");
                else{                    
                    this.currentQid = "batch"; // 表示批量删除
                    this.popTitle = "批量删除提示";
                    this.popContent = "确定要删除所有选中的问卷吗？";
                    this.showPop = true;
                }
            }
        },
        filters:filter,
        events:{
            // 浮出层选择事件
            popChoice: function(msg){
                if(msg === "ok"){
                    // 批量删除
                    if(this.currentQid === "batch"){
                        for(var i=0;i<this.checkedQues.length;i++){
                            store.deleteQuestionnaire(this.checkedQues[i]);
                        }
                        // 更新问卷列表数据
                        this.qList = store.fetch().questionnaireList;
                    }
                    // 单个删除
                    else{
                        if(store.deleteQuestionnaire(this.currentQid)){
                            // 更新问卷列表数据
                            this.qList = store.fetch().questionnaireList;
                        }
                        else{
                            alert("删除失败，问卷id不存在");
                        }
                    }
                }
                else if(msg === "cancel"){}
                else{
                    console.log("似乎混入了奇怪的数据:" + msg);
                }
                this.showPop = false;
            }
        }
    }
</script>

<style lang="less">
    /*头部固定表格*/
    @QList-border-style:1px solid #000;
    @base-color:#ee7419;
    @hover-color:#fcf0e5;
    .prevent-select{
        -webkit-user-select:none;
        user-select:none;
        cursor: default;
    }
    .headfixedtable{
        width: 100%;
        font-size: 15px;
        border-collapse: collapse;
    }
    .headfixedtable-head(@width){
        padding: 5px;
        width: @width;
        color: #000;
        border-bottom: @QList-border-style;
        background-color: #ddd;
    }
    .questionair-list-head{
        .prevent-select;
        th:first-child{
            .headfixedtable-head(6%);
        }
        th:nth-child(2){
            .headfixedtable-head(31%);
        };
        th:nth-child(3){
            .headfixedtable-head(13%);
        };
        th:nth-child(4){
            .headfixedtable-head(13%);
        };
        th:nth-child(5){
            .headfixedtable-head(5%);
        };
        th:nth-child(6) {
            .headfixedtable-head(32%);
            span{
                position: relative;
                top:5px;
                left: 2.6em;
            }
        };
    }
    .fixedhead{
        position: fixed;
        top:0;
    }
    .questionair-list-rows:hover{
        background-color: @hover-color;
    }

    .questionair-list-rows td{
        padding: 5px;
        border-bottom: @QList-border-style;
    }

    .questionaire-state-draft{
        color:blue;
    }
    .questionaire-state-released{
        color: red;
        font-weight: bolder;
    }
    .questionaire-state-closed{
        font-style: italic;
    }
    
    .questionair-list-lastrow{
      .prevent-select;
      td{
        padding-top:10px;
        &:first-child{
          padding-left: 5px;
        }
        &:last-child{
          padding-left: 10px;
        }
      }
    }

    .questionaire-list-last-column{
        text-align: center;
        a{
            margin-left: 1em;
        }
    }

    .button-common{
        font-family: "Microsoft YaHei UI";
        font-weight: lighter;
        text-decoration: none;
        cursor: pointer;
        -webkit-user-select: none;
        user-select: none;
    }
    .button-big-create{
        padding:.6em 1.8em .6em 1.8em;
        .button-common;
        position:absolute;
        border-radius: 5px;
        left:50%;
        top:50%;
        transform: translate(-50%,-50%);
        background-color: @base-color;
        color:#fff;
        font-size: 30px;
    }
    .button-create{
        float: right;
        padding: 5px;
        border-radius: 3px;
        background-color: @base-color;
        color: #fff;
        font-size:14px;
        .button-common
    }

    .button-in-table{
        border: @QList-border-style;
        display: inline-block;
        margin:0 5px;
        padding:0.1em 1.2em 0.1em 1.2em;
        color: #000;
        .button-common;
    }
    .button-in-table:hover{
        color:#fff;
        background-color: @base-color;
    }
</style>