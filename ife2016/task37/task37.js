/**
 * Created by mystery on 2016/4/13.
 */

/**
 * 创造浮出层组件
 * @param {String} title 浮出层标题
 * @param {String} content 浮出层内容
 * @param {Function} okCallback 点击确定按钮后的回调函数
 * @param {Function} cancelCallback 点击取消按钮后的回调函数
 * @returns {Element} 返回创造的浮出层组件
 */
function createSurface(title,content,okCallback,cancelCallback){
    var shade = document.createElement("div");
    shade.className = "shade";
    shade.innerHTML = "<div class='surface'><header>"+title+"</header><main class='surface-main'><p>"+content+"</p></main><footer><button class='surface-button' id='surface-cancel'>取消</button><button class='surface-button' id='surface-ok'>确定</button></footer>";
    document.body.appendChild(shade);
    // 为确定、取消按钮绑定事件
    document.getElementById("surface-ok").addEventListener("click", function () {
        shade.parentNode.removeChild(shade);
        okCallback();
    });
    document.getElementById("surface-cancel").addEventListener("click", function () {
        shade.parentNode.removeChild(shade);
        cancelCallback();
    });
    // 为遮罩绑定移除事件
    shade.addEventListener("click", function (e) {
        var target = e.target || e.srcElement;
        // 点在遮罩而不是浮出层上，关闭
        if(target === this){
            this.parentNode.removeChild(this);
        }
    });
    // 鼠标按住浮出层头部时，实现拖曳效果
    var offsetX,offsetY;
    shade.querySelector("header").addEventListener("mousedown", function (e) {
        var surface = this.parentNode;
        //获得鼠标点击处相对于浮出层、相对于浏览器视口的偏移
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        // 用实际像素值替代百分比
        surface.style.left = e.clientX - offsetX - 1 + "px";
        surface.style.top = e.clientY - offsetY - 1 + "px";
        // 去除为居中设置的transform
        surface.style.transform = "translate(0,0)";

        // 为浮出层绑定拖拽事件及鼠标松开事件
        shade.addEventListener("mousemove",dragHandler);
        shade.addEventListener("mouseup", function detachDragHandler() {
            this.removeEventListener("mousemove",dragHandler);
            this.removeEventListener("mouseup",detachDragHandler);
        });
    });
    // 拖曳事件handler，-1是去除边框宽度
    function dragHandler(e){
        // 防止出界
        var left,top;
        left = Math.min(e.clientX - offsetX -1,document.body.clientWidth - shade.firstChild.offsetWidth);
        if(left<0) left=0;
        top = Math.min(e.clientY - offsetY -1,window.innerHeight - shade.firstChild.offsetHeight);
        if(top < 0 ) top = 0;
        this.firstChild.style.left = left+"px";
        this.firstChild.style.top = top + "px";
    }
    return shade;
}

// demo代码
document.querySelector("#show-surface").addEventListener("click", function () {
    createSurface("这是一个浮出层","这是一个浮出层啊浮出层", function () {},function () {});
});