# 任务一-第3题 三栏布局
- 布局思想：因为左右两列宽度确定，要求中间一列实现自适应，故可以将左右列float（或左列用absolute，但不推荐），中列通过margin或padding控制左右距离，达到正确显示。
- 问题：中列div有个子元素article，当为div设置边框之后，div的**上下边框与子元素之间**会自动出现**一段间隙**，padding=0也无法取消。将div背景设为白色可以使其视觉上消失，但这样一来，div的内边距就无法控制了。
- 解决方案1：删去中列div，将article直接拿来布局，则可绕过此问题。
- 揭开真相：最终发现是由于article内的第一个元素——p元素的默认margin-top和margin-bottom属性导致的。

  p的margin-top理论上应使p内的文字相对于article上沿下移，但由于block元素之间的margin叠加原理（margin相遇取其大者），article的0 margin事实上被替换为了p的margin值，故其上沿相对div下移相应的距离，p随之下移后不再动。下沿同理。
  