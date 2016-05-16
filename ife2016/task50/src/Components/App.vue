<template>
    <div id='wrapper'><!-- header -->
        <navbar></navbar><!-- main view -->
        <main id='container'>
            <router-view></router-view>
        </main>
    </div>
</template>

<script>
    import navbar from "./Navbar.vue";
    import store from "./store";

    export default{
        data:function () {
            return {
                qid:1
            };
        },
        components:{
            navbar
        },
        created:function (argument) {
            // 加载初始数据
            store.initData();
        }
    };
</script>

<style lang="less">
    html {
        margin: 0;
        height: 100%;
    }

    body {
        margin: 0;
        height: 100%;
        background-color: #efefef;
    }

    #wrapper{
        padding-bottom: 100px;
    }

    #container {
        position: relative;
        top: 50px;
        margin: 0 10% 0 10%;
        padding: 10px 10px 10px 10px;
        width: 80%;
        min-width: 600px;
        min-height: 300px;
        background-color: #fff;
        box-shadow: 2px 2px 3px #aaa;
    }
</style>
