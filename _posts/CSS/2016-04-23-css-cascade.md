---
layout: post
title: CSS小知识
categories: CSS
tags: CSS
keywords: CSS
date: 2016-04-23 
---
CSS层叠样式表(Cascading Style Sheets)是一种用来表现HTML（标准通用标记语言的一个应用）或XML（标准通用标记语言的一个子集）等文件样式的计算机语言。cascade说明层叠的概念是很重要的，层叠就是浏览器对多个样式来源进行叠加，优先级是叠加的实现方式，而这些是构成什么选择器胜出的关键因素。


### 层叠
即使是在不太复杂的样式表中，要寻找同一个元素可能有两种或更多的规则，CSS 通过层叠的过程处理这种冲突。层叠就是浏览器对多个样式来源进行叠加，最终确定结果的过程，样式的来源有5个，前三项为开发者样式：

1. 内联样式`<a style="">`
2. 嵌入式样式表`<style>a{color: blue;}</style>`
3. 外部样式表`<link rel="stylesheet" href="css/main.css">`
4. 用户样式表；用户还可以指定风格行为来查看一个或多个文档，例如用户可能有视力障碍，想设置字体大小对所有网页的访问是双倍的正常大小，以便更容易阅读。
5. 浏览器样式表；浏览器也会有自己的一套默认渲染行为，如果html中没有为标签设置样式，则浏览器会按照自己的样式来显示。

给定选择器的多个样式规则冲突时，当根据样式表的来源的优先级顺序：内联样式 > 内部样式 > 外部样式 > 用户自定义样式 > 浏览器样式；具有较高优先级的风格规则将覆盖较低优先级的相同风格规则。下面是举例说明：

```css
/* main.css */
 p{
    color:blue;
    font-size:24px;
 }
```

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title></title>
    <link rel="stylesheet" href="main.css">
    <style>
        p{color:red;} 
    </style>
</head>
<body>
    <p>1234567890</p>   
</body>
</html>
```
打开chrome开发者工具可以发现元素p的样式为`color:red;font-size:24px;`，因为嵌入式样式表中**p**元素没有*font-size*的样式，而外部样式表中**p**元素有*font-size*的样式，层叠对这两个样式来源进行叠加使得**p**元素有*font-size*样式，而样式来源优先级内部样式 > 外部样式使得`color:red`生效。
![][cascade-demo]

### 权重
CSS规范为不同类型的选择器定义了特殊性权重，特殊性权重越高，样式会被优先应用。
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
[cascade-demo]:{{site.baseurl}}/assets/img/CSS/casede/cascade-demo.jpg  