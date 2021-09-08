---
layout: post
title: CSS Position
categories: 前端
tags: 前端
keywords: CSS Position
date: 2018-05-28 
---
Html中的三种布局方式
* 标准流 
* 浮动
* 定位

# 标准流
标准流顺序布局，html元素分为两大元素：块元素和行元素。常见的有
1. 块元素: div h1~h6 table
2. 行元素: a span img 
块元素竖直排列，行元素横向排列，使用```display:block```将行元素转为块元素布局

# 定位
Position决定元素如何定位，通过```top,right,bottom,left```实现位置
1. static：默认值，按正常标准流布局
2. relative：相对定位，相对自身原来位置定位，top>bottom，left>right。对立出现，只有top或者left失效。
> left right top bottom   的移动方式相当于margin-left(向右) margin-right(向左)margin-top(向下) margin-bottom(向上)

3. absolute: 绝对定位会脱离文档流,脱离条件需要加top:0;left:0;定位元素参照物是第一个定位祖先元素,如果没有就一直往上找，直到body即相对当前窗口定位 以窗口四个边为标准定位
4. fixed: 是最自由的，不受任何元素制约，常用于弹窗广告
5. inherit: 子元素继承父元素的r/a/f等定位

# z-index

只作用于有定位属性的元素；
大的会覆盖小的；
为auto不参与层级比较；
父元素层级大，会影响子元素。