---
layout: post
title: Redis3-集合
categories: Redis
tags: Redis
keywords: Redis3-集合
date: 2021-08-31
---
# 集合

- List
- Hash
- Set
- sorted_set

## List

<img src="/assets/img/Redis/Redis3-Collection/image-20210818233142077.png" alt="image-20210818233142077" style="zoom:80%;" />

**双向链表**

![image-20210818233242207](/assets/img/Redis/Redis3-Collection/image-20210818233242207.png)

### 命令

1. `LPUSH k1 a b c d e`   *Prepend one or multiple values to a list*

2. `RPUSH k2 e d c b a`  *Append one or multiple values to a list*

3. `LPOP k1`   *Remove and get the first element in a list*

4.   `RPOP k1` *Remove and get the last element in a list*

5. `LRANGE k1 0 -1`   *Get a range of elements from a list*
6. `LINDEX LSET`   类似数组操作
<center class="half">
    <img src="/assets/img/Redis/Redis3-Collection/image-20210818234015613.png" width="500"/>
    <img src="/assets/img/Redis/Redis3-Collection/image-20210818234243884.png" width="500"/>
</center>

7. `LREM k3 2 a` *Remove elements from a list*  
8. `LINSERT k3 after 6 a` * Insert an element before or after another element in a list* 

![image-20210818235211226](/assets/img/Redis/Redis3-Collection/image-20210818235211226.png)
9. `BLPOP ooxx 0` *Remove and get the first element in a list, or block until one is available*   阻塞队列FIFO

<img src="/assets/img/Redis/Redis3-Collection/image-20210818235714792.png" alt="image-20210818235714792" style="zoom:67%;" />

 9.  `LTRIM k4 2 -2`  删除首尾 *Trim a list to the specified range*  

## Hash
![image-20210819221302254](/assets/img/Redis/Redis3-Collection/image-20210819221302254.png)
### 命令
<center class="half">
    <img src="/assets/img/Redis/Redis3-Collection/image-20210819221419503.png" width="500"/>
    <img src="/assets/img/Redis/Redis3-Collection/image-20210819221648039.png" width="500"/>
</center>


**业务场景**：微博点赞，数量增加；收藏、详情页

## SET

![image-20210819223555555](/assets/img/Redis/Redis3-Collection/image-20210819223555555.png)

<center class="half">
    <img src="/assets/img/Redis/Redis3-Collection/image-20210819224235856.png" width="450"/>
    <img src="/assets/img/Redis/Redis3-Collection/image-20210819225244681.png" width="350"/>
</center>


`SRANDMEMBER k4 10`  count为整数：取出一个去重的结果集（不能超过已有集）负数：取出一个带重复的结果集，一定满足你要的数量

**业务场景**：抽奖  

 `SPOP k4`  满足抽到后取出，不能重复抽

## sorted_set

**有序Set集合**

![image-20210819233246938](/assets/img/Redis/Redis3-Collection/image-20210819233246938.png)

**排序**

因此，除了**元素本身**以外，你需要有**分值**这个维度，用来排序。如果分值相同，则按照名称字典序排列。

![image-20210819233436418](/assets/img/Redis/Redis3-Collection/image-20210819233436418.png)

### 命令

![image-20210819234047346](/assets/img/Redis/Redis3-Collection/image-20210819234047346.png)

<center class="half">
    <img src="/assets/img/Redis/Redis3-Collection/image-20210820220759902.png" width="450"/>
    <img src="/assets/img/Redis/Redis3-Collection/image-20210820221343691.png" width="350"/>
</center>
**集合计算**

`ZUNIONSTORE` *Add multiple sorted sets and store the resulting sorted set in a new key*

<center class="half">
    <img src="/assets/img/Redis/Redis3-Collection/image-20210820222044152.png" width="450"/>
    <img src="/assets/img/Redis/Redis3-Collection/image-20210820222044152.png" width="350"/>
</center>


### 排序原理

底层结构：**skip list 跳表**  类平衡树   参考  `ConcurrentSkipListMap`

![image-20210820223259840](/assets/img/Redis/Redis3-Collection/image-20210820223259840.png)
