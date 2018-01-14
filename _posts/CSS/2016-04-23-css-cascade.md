---
layout: post
title: CSS小知识
categories: CSS
tags: CSS
keywords: CSS
date: 2016-04-23 
---
层叠样式表(英文全称：Cascading Style Sheets)是一种用来表现HTML（标准通用标记语言的一个应用）或XML（标准通用标记语言的一个子集）等文件样式的计算机语言。CSS不仅可以静态地修饰网页，还可以配合各种脚本语言动态地对网页各元素进行格式化。

## 基础知识
### 层叠
即使是在不太复杂的样式表中，要寻找同一个元素可能有两种或更多的规则，CSS 通过层叠（cascade）的过程处理这种冲突。层叠就是浏览器对多个样式来源进行叠加，最终确定结果的过程

1. 创作人员的样式+>+读者人员的样式+>+用户代理的默认样式
2. 标记为重要声明（!important）的读者样式+>+一切样式

### 权重
![CSS权重][weight]

* 第一等：代表内联样式，如：style=""，权值为1000
* 第二等：代表ID选择器，如；#content，权值为100
* 第三等：代表类、伪类和属性选择器，如.menu,a:hover,btn[name="ok"]，权值为10
* 第四类：代表类型选择器和伪元素选择器，如div,p,h1:after，权值为1

最后把这些值加起来，再就是当前元素的权重了。

**权重的基本规则**
1. 不同的权重，权重值高则生效
2. 相同的权重，以后面出现的选择器为最后规则

下面是举例说明：
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title></title>
    <link rel="stylesheet" href="">
    <style>
        p{color:red;font-size: 40px} /*标签，权值为1*/        
        p span{color:green;} /*两个标签，权值为1+1=2*/      
        p>span{color:blue;}/*权值与上面的相同，因此采取就近原则*/
        .warning{color:blue;} /*类选择符，权值为10*/
        p span.warning{color:green;} /*权值为1+1+10=12*/
        #footer .note span{color:red;} /*权值为100+10+1=111*/
    </style>
</head>
<body>
    <p><span>1234567890</span></p>
    <div id="footer">
        <p class="note"><span class="warning">warning</span></p>
    </div>
</body>
</html> 
```
以上代码生成的效果为：
![][demo]




[weight]:{{site.baseurl}}/assets/img/CSS/casede/css-weight.jpg  
[demo]:{{site.baseurl}}/assets/img/CSS/casede/weight-demo.jpg  