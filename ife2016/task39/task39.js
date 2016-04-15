/**
 * Created by mystery on 2016/4/15.
 */

/**
 * 创建头部固定的表格
 * @param {Array} head 全体列名的数组
 * @param {Array} attributes 全体属性名，与列名按对应的顺序排好
 * @param {Array} data 表格信息
 */
function createHeadFixedTable(head, attributes, data) {
    // 创建表格
    var table = document.createElement("table");
    table.className = "headfixedtable";
    // 创建头部
    var headHTML = "";
    for (var i = 0; i < head.length; i++) {
        headHTML += "<th>" + head[i] + "</th>";
    }
    headHTML += "";
    var html = "<thead><tr>" + headHTML + "</tr></thead>";
    // 是否已创建了固定头部，以及固定头部的引用
    var hasFixedHead = false;
    var fixedHead = document.createElement("tr");
    fixedHead.className = "fixedthead";
    fixedHead.innerHTML = headHTML;

    // 写入表格数据
    for (i = 0; i < data.length; i++) {
        html += "<tr>";
        for (var j = 0; j < attributes.length; j++) {
            html += "<td>" + data[i][attributes[j]] + "</td>";
        }
        html += "</tr>";
    }
    table.innerHTML = html;

    // 监听onscroll事件
    document.addEventListener("scroll", handler);
    function handler() {
        var tableClientY = table.getBoundingClientRect().top, lastRowClientY = table.lastChild.lastChild.getBoundingClientRect().top;
        if (!hasFixedHead && (tableClientY <= 0 && lastRowClientY >= 0)) {
            // 将fixedHead插入到表格里
            table.firstChild.insertBefore(fixedHead,table.firstChild.firstChild);
            hasFixedHead = true;
        }
        if(hasFixedHead && (tableClientY > 0 || lastRowClientY < 0)){
            // 将fixedHead从表格里移除（但不删除）
            fixedHead = table.firstChild.removeChild(fixedHead);
            hasFixedHead = false;
        }
    }
    return table;
}

//以下是demo代码
document.getElementById("btn").addEventListener("click", function () {
    var head = ["姓名","语文","数学","英语","总分"];
    var attributes = ["name","Chinese","math","English","sum"];
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
            name:"陆绩",
            Chinese:80,
            math:85,
            English:75,
            sum:240
        },
        {
            name:"羊祜",
            Chinese:100,
            math:70,
            English:90,
            sum:260
        },
        {
            name:"潘凤",
            Chinese:80,
            math:90,
            English:80,
            sum:250
        },
        {
            name:"费祎",
            Chinese:60,
            math:100,
            English:70,
            sum:230
        },
        {
            name:"卻正",
            Chinese:80,
            math:85,
            English:75,
            sum:240
        }
    ];
    document.getElementById("demo").appendChild(createHeadFixedTable(head,attributes,data));
});