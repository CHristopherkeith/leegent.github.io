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
        font-size:16px;
        margin: 0;
        height: 100%;
        background-color: #efefef;
    }

    #container {
        position: relative;
        min-height: 300px;
        background-color: #fff;
        box-shadow: 2px 2px 3px #aaa;
    }

    @media screen and (min-width:421px){
        #wrapper{
            padding-bottom: 100px;
        }
        #container{
            margin: 0 10% 0 10%;
            top: 3em;
            padding: 10px;
            width: 80%;
        }
    }

    @media screen and (max-width:420px){
        #container{
            padding: 3px;
        }
    }
</style>
