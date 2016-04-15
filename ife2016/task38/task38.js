/** 
 * 排序图表的工厂函数
 * 期望参数是四个数组，分别是列显示名、每列对应的属性名，表格数据，以及可排序的列号
 * 构造图表的数据通过闭包的形式存在内存里
 */
function createSortableTable (header,attributes,data,sortableColumns){	
	var mytable = document.createElement("table");
	mytable.className = "sortabletable";
	var html = "";
	var headerHTML = "<tr class='table-header'>";
	// 添加表头
	for(var i=0;i<header.length;i++){
		headerHTML += "<th>"+header[i];
		// 若设置该列可排序，则添加一个点击排序的标志。data-column自定义属性用于识别这个箭头属于哪一列
		if(sortableColumns.indexOf(i)!=-1) headerHTML+="<div class = 'arrow-container'><div class = 'arrow-up' data-column = "+i+"></div><div class = 'arrow-down' data-column = "+i+"></div></div>";
		headerHTML += "</th>";
	}
	headerHTML += "</tr>";
	html = headerHTML;
	// 添加数据
	for(i=0;i<data.length;i++){
        html +="<tr>";
		for(var j=0;j<attributes.length;j++){
            html += "<td>"+data[i][attributes[j]]+"</td>";
        }
        html +="</tr>";
	}
	mytable.innerHTML = html;
	// 点击排序事件代理
	mytable.addEventListener("click",function (e) {
		var target = e.target || e.srcElement;
		if(target.className!="arrow-up" && target.className!="arrow-down") return;
		i = target.getAttribute("data-column");
		// 点击上箭头，升序排列
		if(target.className === "arrow-up"){			
			data.sort(function (a,b) {
				return a[attributes[i]]-b[attributes[i]];
			});
		}
		// 点击下箭头，降序排列
		else if(target.className === "arrow-down"){
			data.sort(function (a,b) {
				return b[attributes[i]]-a[attributes[i]];
			});
		}
		// 重新设置表格数据
		html = headerHTML;
        for(i=0;i<data.length;i++){
            html +="<tr>";
            for(var j=0;j<attributes.length;j++){
                html += "<td>"+data[i][attributes[j]]+"</td>";
            }
            html +="</tr>";
        }
		mytable.innerHTML = html;
	});
	return mytable;
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
	var mytable = createSortableTable(header,attributes,data,sortableColumns);
	document.getElementById("main").appendChild(mytable);
});