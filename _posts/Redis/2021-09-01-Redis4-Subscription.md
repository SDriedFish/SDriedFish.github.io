---
layout: post
title: Redis4-消息订阅
categories: Redis
tags: Redis
keywords: Redis4-消息订阅
date: 2021-09-01
---
# redis进阶使用

## 管道（Pipelining）

http://redis.cn/topics/pipelining.html

<img src="/assets/img/Redis/Redis4-Subscription/image-20210821175506494.png" alt="image-20210821175506494" style="zoom:80%;" />



### 管道连接redis

一次发送多个命令，节省往返时间

1. 安装nc  `yum install nc -y`

2. 通过nc连接redis  `nc localhost 6379`  注意配置`/etc/hosts`

3. 通过echo向nc发送指令 `echo -e "set k2 99\nincr k2\n get k2" |nc localhost 6379`

   ![image-20210821203634163](/assets/img/Redis/Redis4-Subscription/image-20210821203634163.png)

## 发布订阅(pub/Sub)

#### 发送者

`publish channel message`

#### 订阅者

`subscribe channel`

<center class="half">
    <img src="/assets/img/Redis/Redis4-Subscription/image-20210821204311645.png" width="500"/>
    <img src="/assets/img/Redis/Redis4-Subscription/image-20210821204325975.png" width="500"/>
</center>
## 聊天室架构

- 每个人能够收到实时消息  `发布订阅`

- 上滑加载最近3天消息  `sorted_set`

- 再上滑加载历史消息，所有消息都应该被存在数据库中

  **单调发布,写入`sorted_set`和单调kafka入库构成事务**

![image-20210821204520960](/assets/img/Redis/Redis4-Subscription/image-20210821204520960.png)

**启动不同的redis去接收订阅的消息，有的用来推送给用户，有的用来发给kafka，继而存储到数据库中**

![image-20210821204548970](/assets/img/Redis/Redis4-Subscription/image-20210821204548970.png)

## 事务

![image-20210821205929899](/assets/img/Redis/Redis4-Subscription/image-20210821205929899.png)



假设是**client1**先开启的事务**multi**(绿色)，client2后开启的事务**multi**(黄色)，并且假设client2的exec先到达，client1的exec后到达：

**客户端的exec先达到则先执行事务**

![image-20210821210705302](/assets/img/Redis/Redis4-Subscription/image-20210821210705302.png)

<center class="half">
    <img src="/assets/img/Redis/Redis4-Subscription/image-20210821211357020.png" width="200"/>
    <img src="/assets/img/Redis/Redis4-Subscription/image-20210821211408117.png" width="300"/>
</center>


### watch 

**WATCH** 命令可以为 Redis 事务提供 check-and-set （CAS）行为。

事务只能在所有被监视键都没有被修改的前提下执行， 如果这个前提不能满足的话，事务就不会被执行。

![image-20210821210808703](/assets/img/Redis/Redis4-Subscription/image-20210821210808703.png)

在 [WATCH](http://redis.cn/commands/watch.html) 执行之后， [EXEC](http://redis.cn/commands/exec.html) 执行之前， 有其他客户端修改了 `mykey` 的值， 那么当前客户端的事务就会失败。 程序需要做的， 就是不断重试这个操作， 直到没有发生碰撞为止。

<center class="half">
    <img src="/assets/img/Redis/Redis4-Subscription/image-20210821212337427.png" width="300"/>
    <img src="/assets/img/Redis/Redis4-Subscription/image-20210821212410849.png" width="300"/>
</center>
## RedisBloom布隆过滤器

![image-20210821212643260](/assets/img/Redis/Redis4-Subscription/image-20210821212643260.png)

**解决缓存穿透问题**

**缓存穿透**，是指查询一个数据库中不一定存在的数据；

正常使用缓存查询数据的流程是，依据key去查询value，数据查询先进行缓存查询，如果key不存在或者key已经过期，再对数据库进行查询，并把查询到的对象，放进缓存。如果数据库查询对象为空，则不放进缓存。

如果每次都查询一个不存在value的key，由于缓存中没有数据，所以每次都会去查询数据库；

当对key查询的并发请求量很大时，每次都访问DB，很可能对DB造成影响；并且由于缓存不命中，每次都查询持久层，那么也失去了缓存的意义。

**布隆过滤器原理**
原理就是一个对一个key进行k个hash算法获取k个值，在比特数组中将这k个值散列后设定为1，然后查的时候如果特定的这几个位置都为1，那么布隆过滤器判断该key存在。

布隆过滤器可能会误判，如果它说不存在那肯定不存在，如果它说存在，那数据有可能实际不存在；Redis的bitmap只支持2^32大小，对应到内存也就是512MB，误判率万分之一，可以放下2亿左右的数据，性能高，空间占用率及小，省去了大量无效的数据库连接。

因此我们可以通过布隆过滤器，将Redis缓存穿透控制在一个可容范围内。

**三种bloom实现方式**

![image-20210821215804445](/assets/img/Redis/Redis4-Subscription/image-20210821215804445.png)

![image-20210821220526505](/assets/img/Redis/Redis4-Subscription/image-20210821220526505.png)

# redis作为数据库/缓存区别

![image-20210821220630171](/assets/img/Redis/Redis4-Subscription/image-20210821220630171.png)

**key的有效期**

![image-20210821222422799](/assets/img/Redis/Redis4-Subscription/image-20210821222422799.png)

**补充说明**

缓存：数据可以丢 急速，内存数据掉电易失。

数据库：数据绝对不能丢的 速度+持久性



**redis+mysql** 同时作为 **数据库**  描述不太对
