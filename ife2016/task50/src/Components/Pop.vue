/**
* Created by Leegent on 2016/5/8.
*/
<template>
    <div class='shade' @click='removePop'>
        <div class='pop'>
            <header class='pop-header' v-on:mousedown='dragPrepareHandler'>{{ title }}</header>
            <main class='pop-main'><p>{{ content }}</p></main>
            <footer class='pop-footer'>
                <button class='pop-button' id='pop-cancel' @click='cancel'>取消</button>
                <button class='pop-button' id='pop-ok' @click='ok'>确定</button>
            </footer>
        </div>
    </div>
</template>

<script>
    export default {
        props: ["title","content"],
        methods: {
            ok: function () {
                this.$dispatch("popChoice", "ok","qid");
            },
            cancel: function () {
                this.$dispatch("popChoice", "cancel");
            },
            removePop: function (e) {
                if (e.target.className === 'shade') {
                    this.$dispatch("popChoice","cancel");
                }
            },
            dragPrepareHandler: function (e) {
                var pop = e.target.parentNode;
                var shade = pop.parentNode;
                //获得鼠标点击处相对于浮出层、相对于浏览器视口的偏移
                var offsetX = e.offsetX;
                var offsetY = e.offsetY;
                // 用实际像素值替代百分比
                pop.style.left = e.clientX - offsetX - 1 + "px";
                pop.style.top = e.clientY - offsetY - 1 + "px";
                // 去除为居中设置的transform
                pop.style.transform = "translate(0,0)";

                // 为浮出层绑定拖拽事件及鼠标松开事件
                // TODO:此处用的原生方法实现，是否可以找到更Vue的方法？
                function dragHandler(e) {
                    // 防止出界
                    var left, top;
                    left = Math.min(e.clientX - offsetX - 1, document.body.clientWidth - shade.firstElementChild.offsetWidth);
                    if (left < 0) left = 0;
                    top = Math.min(e.clientY - offsetY - 1, window.innerHeight - shade.firstElementChild.offsetHeight);
                    if (top < 0) top = 0;
                    this.firstElementChild.style.left = left + "px";
                    this.firstElementChild.style.top = top + "px";
                };
                shade.addEventListener("mousemove", dragHandler);
                shade.addEventListener("mouseup", function detachDragHandler() {
                    this.removeEventListener("mousemove", dragHandler);
                    this.removeEventListener("mouseup", detachDragHandler);
                });
            }
        }
    };
</script>

<style lang="less">
    @base-color: #ee7419;
    @header-color: #f7f7f7;
    @pop-font: "Microsoft YaHei UI";
    @border-style: 1px solid #999;
    /*半透明遮罩*/
    .shade {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background-color: rgba(133, 133, 133, 0.5);
    }

    .pop {
        position: fixed;
        box-sizing: border-box;
        width: 400px;
        height: 200px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 5px;
        background-color: #fff;
        font-family: @pop-font;
        overflow: hidden;
        box-shadow: 2px 2px 3px #aaa;
        cursor: default;
        -webkit-user-select: none;
    }

    .pop-header {
        box-sizing: border-box;
        padding: 10px;
        background-color: @header-color;
        font-size: 16px;
        font-weight: bold;
        color: #000;
    }

    .pop-main {
        padding: 10px;
    }

    .pop-footer {
        position: absolute;
        width: 100%;
        bottom: 0;
    }

    .pop-button(@bgcolor;@color) {
        float: right;
        width: 80px;
        height: 30px;
        margin-right: 20px;
        margin-bottom: 20px;
        background-color: @bgcolor;
        color: @color;
        border: @border-style;
        font-family: @pop-font;
        border-radius: 3px;
        cursor: pointer;
    }

    #pop-ok {
    .pop-button(@base-color; #fff);
    }

    #pop-cancel {
    .pop-button(#fff; #000);
    }
</style>