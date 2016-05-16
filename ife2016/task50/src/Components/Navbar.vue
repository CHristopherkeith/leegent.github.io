/**
 * Created by Leegent on 2016/5/6.
 */
<template>
    <header class='navbar'>
        <div class='navbar-maintitle'>问卷管理</div>
        <div class='navbar-subtitle' v-link="'/'">我的问卷</div>
    </header>
</template>

<script>
    export default{
        
    }
</script>

<style lang="less">
    @base-color:#ee7419;
    .navbar {
        position: relative;
        width: 100%;
        height: 2.5em;
        background-color: @base-color;
        color:white;
    }
    .navbar-title(@fsize:18px;@fweight:bold;@mleft:2.5em){
        display: inline-block;
        position: absolute;
        top:50%;
        transform: translateY(-50%);
        margin-left: @mleft;
        font-size: @fsize;
        font-family: "黑体";
        font-weight: @fweight;
    }
    .navbar-maintitle{
        .navbar-title;
    }
    .navbar-subtitle{
        .navbar-title(14px;normal;10em);
        cursor:pointer;
        -webkit-user-select:none;
        user-select:none;
    }
</style>