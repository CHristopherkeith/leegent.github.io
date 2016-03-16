# 任务一-第4题 定位和居中问题
- 实现扇形思路：1.border-radius画个圆，然后用两个div覆盖住圆的270°;2.用伪类:before和:after创建遮挡伪元素
- 居中思路：在单个block元素的情况下实现垂直居中，必须把它从文档流中抽出来，可以用postion:absolute来实现