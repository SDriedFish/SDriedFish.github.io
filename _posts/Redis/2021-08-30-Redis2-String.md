---
layout: post
title: Redis2-string和bitmap
categories: Redis
tags: Redis
keywords: Redis2-string和bitmap
date: 2021-08-30
---
![image-20210817225056836](/assets/img/Redis/Redis2-String/image-20210817225056836.png)

![image-20210817225146395](/assets/img/Redis/Redis2-String/image-20210817225146395.png)

# 常用命令

1. redis-cli 连接客户端

2. redis-cli -p 6380 连接制定端口

3.  redis-cli -h 帮助文档

4. select 8  选择库(默认16个库)

5. redis-cli -p 6380 -n 8 连接制定端口制定8号库

6.  help @generic 查看通用组帮助

7. set key380 hello  设置key

8. get key380 获取key

9. keys *   查询所有key

10. FLUSHDB 清数据

 # String Byte

- 字符串
- 数值
- bitmap

## 字符串

![image-20210817230541850](/assets/img/Redis/Redis2-String/image-20210817230541850.png)

### 命令

1.  `SET key value [expiration EX seconds|PX milliseconds] [NX|XX]`  `nx`表示无值的时候才执行成功(分布式锁)  `xx`表示有值的时候才执行成功
2. `mset k3 value3 k4 value4` 含义为 more set，用来设置多个值
3. `mget k1 k2` 获取两个值
4. `appenk k1 "world"` 在k1后面追加world
5. `GETRANGE k1 6 10`  获取k1某两个索引之间的字符串子串（支持**正负索引**）
6. `GETRANGE k1 0 -1`       `-1` 负索引
7. `SETRANGE k1 6 zhoum` 从某个索引开始覆盖
8. `strlen k1` 获取字符串长度
9. `getset k1 zhoum` 取出旧值，并将旧值设置为新值  减少io通信
10.  `msetnx k2 c k3 d` 这个命令可以保证多笔操作是原子操作，类似于一个事务中
11.  `type k1`  查看`k1`的value类型
12.  `FLUSHALL` Remove all keys from all databases
13.  `object encoding k1`   如果value为1，上面的命令显示为int类型
14.  `APPEND`  `INCR` 等方法会改变数据的类型

<img src="/assets/img/Redis/Redis2-String/image-20210817235830876.png" alt="image-20210817235830876" style="zoom:50%;" />

**命令指定类型**

<img src="/assets/img/Redis/Redis2-String/image-20210817232035030.png" alt="image-20210817232035030" style="zoom:67%;" />



**数值类型**

1. `INCR k1` +1
2. `INCRBY k1 23`  +23
3. `decr k1`  -1
4. `decrby k1 22` -22
5. `incrbyfloat k1 0.5`  -0.5



## 二进制安全

**redis 是二进制安全的，并不会去破坏你的编码，也不去关心你是什么编码。底层存储的时候，是按照Byte字节存储的**。我们前面看到的encoding，只是为了让加减之类的运算方法变得更快一些。

在redis进程与外界交互的时候，redis存储的是字节流，而不会转换成字符流，也不会擅自按照某种数据类型存储，这样保证了数据不会被破坏，不会发生数据被截断/溢出等错误。

- 编码并不会影响数据的存储

- 因此，在**多人**使用redis的时候，我们一定要在用户端**约定好**数据的**编码和解码**。

  `Xshell` 默认连接编码 `UTF-8` ,`UTF-8` 中字3个字节`GBK` 两个字节

  `redis-cli -p 6380 --raw`  自动转连接编码(方便查看内容)


<center class="half">
    <img src="/assets/img/Redis/Redis2-String/image-20210817234446205.png" width="500"/>
    <img src="/assets/img/Redis/Redis2-String/image-20210817234903647.png" width="300"/>
</center>


原子性命令  `MSETNX` Set multiple keys to multiple values, only if none of the keys exist

![image-20210818000112597](/assets/img/Redis/Redis2-String/image-20210818000112597.png)

## bitmap

![image-20210818220344154](/assets/img/Redis/Redis2-String/image-20210818220344154.png)

1. `SETBIT k1 1 1`  二进制位 1offset设为1

   > 执行`SETBIT k1 1 1`和`setbit k1 7 1`  值为`01000001`  `get k1`为ASCII的`A` 再执行`SETBIT k1 9 1` 后 长度变为2，占两个字节 值为`01000001 01000000`   `get k1`为ASCII的`A@`
   

![image-20210818222521241](/assets/img/Redis/Redis2-String/image-20210818222521241.png)
2. `BITPOS k1 1 0 0`   返回第0个字节到第0个字节  第一个值为1的位置信息  

  >  k1为`01000001 01000000`执行`BITPOS k1 1 0 0`  返回1  执行`BITPOS k1 1 0 1`   返回 1

   ![image-20210818224003623](/assets/img/Redis/Redis2-String/image-20210818224003623.png)

3. `BITCOUNT k1 1 1 1`   返回第1个字节到第1个字节 1出现的次数

![image-20210818224156421](/assets/img/Redis/Redis2-String/image-20210818224156421.png)

4. `BITOP and andkey k1 k2`  多个值与或非操作 `andkey`  保存结果

![image-20210818224725937](/assets/img/Redis/Redis2-String/image-20210818224725937.png)

### 实际场景

![image-20210818231347292](/assets/img/Redis/Redis2-String/image-20210818231347292.png)

- 公司有用户系统，让你**统计用户登录天数**，且**时间窗口随机**。例如，A用户在某一年中登陆了几次。怎么优化？

1. 常见方式： 用数据库存放<ID,登录日期>

2. 可以使用redis实现，假设一年400天，让每一天对应一个二进制位，需要50个字节即可。

   > `setbit gary 1 1` 第2天登录
   >
   > `setbit gary 7 1` 第8天登录
   >
   > `setbit gary 364 1` 第365天登录
   >
   > `BITCOUNT gary -2 -1` 统计 在最后16天的总登录次数

   ![image-20210818225630429](/assets/img/Redis/Redis2-String/image-20210818225630429.png)

- 京东618做活动：登录就送礼物，大库备货多少礼物假设京东有2E用户

  用户分：僵尸用户/冷热用户/忠诚用户  

  目标即为：活跃用户统计！

  随即窗口比如说 1号~3号登录为活跃用户 连续登录要去重

  > `setbit 20210801  1  1`   1号用户在1号登录
  >
  > `setbit 20210802  1  1`   1号用户在2号登录
  >
  > `setbit 20210802  7  1`   7号用户在2号登录
  >
  > `BITOP or destkey 20210801 20210802` 用户(包括去重)存入destkey
  >
  > `BITCOUNT destkey 0 -1` 计算人数

  

![image-20210818230913324](/assets/img/Redis/Redis2-String/image-20210818230913324.png)

