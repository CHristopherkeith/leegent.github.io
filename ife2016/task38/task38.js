/**
 * 排序图表的构造函数
 * 2016.4.16重构：解除数据与DOM操作的耦合
 * 期望参数是五个数组，分别是列显示名、每列对应的属性名，表格数据，可排序的列号，每个可排序列的升序、降序排序规则
 * @param {Array} head
 * @param {Array} attributes
 * @param {Array} data
 * @param {Array} sortableColumns
 * @constructor
 */
function SortableTable (head,attributes,data,sortableColumns){
    this.head = head;
    this.attributes = attributes;
    this.data = data;
    this.sortableColumns = sortableColumns;

	this.tableDOM = document.createElement("table");
    this.tableDOM.className = "sortabletable";
    this.tableDOM.table = this; // 从DOM元素关联回来

    // 表头不能改变，因此获取表头HTML以节省渲染表格开支
    this.headHTML = "<tr class='table-header'>";
    for(var i=0;i<this.head.length;i++){
        this.headHTML += "<th>"+this.head[i];
        // 若设置该列可排序，则添加一个点击排序的标志。data-column自定义属性用于识别这个箭头属于哪一列
        if(this.sortableColumns.indexOf(i)!=-1) this.headHTML+="<div class = 'arrow-container'><div class = 'arrow-up' data-column = "+i+"></div><div class = 'arrow-down' data-column = "+i+"></div></div>";
        this.headHTML += "</th>";
    }
    this.headHTML += "</tr>";

    // 渲染表格
    this.render();

	// 点击排序事件代理
	this.tableDOM.addEventListener("click",function (e) {
		var target = e.target || e.srcElement;
        var that = this;
		if(target.className!="arrow-up" && target.className!="arrow-down") return;
		var i = target.getAttribute("data-column");
		// 点击上箭头，升序排列
		if(target.className === "arrow-up"){
			this.table.data.sort(function (a,b) {
				return a[that.table.attributes[i]]-b[that.table.attributes[i]];
			});
		}
		// 点击下箭头，降序排列
		else if(target.className === "arrow-down"){
            this.table.data.sort(function (a,b) {
				return b[that.table.attributes[i]]-a[that.table.attributes[i]];
			});
		}
		// 重新渲染表格
        this.table.render();
	});
}
/**
 * 渲染表格
 */
SortableTable.prototype.render = function (){
    var html = this.headHTML;
    // 添加数据
    for(var i=0;i<this.data.length;i++){
        html +="<tr>";
        for(var j=0;j<this.attributes.length;j++){
            html += "<td>"+this.data[i][this.attributes[j]]+"</td>";
        }
        html +="</tr>";
    }
    this.tableDOM.innerHTML = html;
};
/**
 * 更新数据
 * @param {Array} data
 */
SortableTable.prototype.updateData = function (data) {
    this.data = data;
    this.render();
}
/**
 * 获取表格DOM元素
 */
SortableTable.prototype.getDOM = function () {
    return this.tableDOM;
}

// 以下是演示代码，点击按钮出现图表
document.getElementById("btn").addEventListener("click",function () {
	var header = ["姓名","语文","数学","英语","总分"];
	var data = [
	{
		name:"曹植",
		Chinese:100,
		math:70,
		English:90,
		sum:260
	},
	{
		name:"曹冲",
		Chinese:80,
		math:90,
		English:80,
		sum:250
	},
	{
		name:"孙亮",
		Chinese:60,
		math:100,
		English:70,
		sum:230
	},
	{
		name:"谯周",
		Chinese:80,
		math:85,
		English:75,
		sum:240
	}
	];
	var attributes = ["name","Chinese","math","English","sum"]; 
	var sortableColumns = [1,2,3,4];
	var mytable = new SortableTable(header,attributes,data,sortableColumns);
    document.getElementById("main").appendChild(mytable.getDOM());
});