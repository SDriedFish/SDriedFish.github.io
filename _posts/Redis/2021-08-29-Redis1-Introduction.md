---
layout: post
title: Redis1-介绍及安装
categories: Redis
tags: Redis
keywords: Redis1-介绍及安装
date: 2021-08-29
---

# 常识

**磁盘：**

1，寻址：ms

2，带宽：G/M

**内存：**

1，寻址：ns

2，带宽：很大

秒>毫秒>微秒>纳秒 磁盘比内存在寻址上慢了10W倍

**I/O buffer：成本问题**

磁盘与磁道，扇区，一扇区 512Byte带来一个成本变大：索引

4K 操作系统，无论你读多少，都是最少4k从磁盘拿

**随着文件变大，速度变慢，为什么？**
因为IO成为瓶颈。

**数据库的出现**
DataPage：大小为4K，正好符合操作系统的一次IO的数据量。
数据、索引、B+树（减少大的IO）

<img src="/assets/img/Redis/Redis1-Introduction/image-20210815214411356.png" alt="image-20210815214411356" style="zoom: 80%;" />

**内存数据库价格昂贵**

构建HANA要耗资2亿

![image-20210815215659954](/assets/img/Redis/Redis1-Introduction/image-20210815215659954.png)

**数据在磁盘和内存体积不一样**

在磁盘当中没有指针的概念，数据不能像对象一样出现，没有指针，如果一个东西存了两遍，就是实打实的两遍。

**折中：使用缓存**
memcached，redis

**速度的提升，受限于2个基础设施的限制**
1、冯诺依曼体系的硬件（磁盘IO，慢）
2、以太网，TCP/IP的网络（不稳定，数据一致性等问题）
也是因此出现了memcached，redis

**总结**

![image-20210815220200482](/assets/img/Redis/Redis1-Introduction/image-20210815220200482.png)

# Redis 

**redis的学习网站**

1.  redis.cn
2.  redis.io
3.  db-engines.com

## 官网描述

Redis 是一个开源（BSD许可）的，内存中的数据结构存储系统，它可以用作数据库、缓存和消息中间件。

它支持多种类型的数据结构，如 字符串（strings）， 散列（hashes）， 列表（lists）， 集合（sets）， 有序集合（sorted sets） 与范围查询， bitmaps， hyperloglogs 和 地理空间（geospatial） 索引半径查询。 Redis 内置了 复制（replication），LUA脚本（Lua scripting）， LRU驱动事件（LRU eviction），事务（transactions） 和不同级别的 磁盘持久化（persistence）， 并通过 Redis哨兵（Sentinel）和自动分区（Cluster）提供高可用性（high availability）。

## **Redis  vs  memcached** 

![image-20210815221357628](/assets/img/Redis/Redis1-Introduction/image-20210815221357628.png)

**那么，Redis存在那么多数据类型的意义是什么？**
如果客户端想要获得JSON中的某一小部分元素，可以只取其一小部分，直接返回给客户端。
而Memcached需要全量地返回整个JSON而不能去解析它的一部分，需要客户端自己去解析。Memcached的性能损耗会在IO以及客户端数据的解析上。

因此，重要的不是类型，重要的是Redis Server对每种数据类型都实现了自己的方法（函数）。
**本质上是一种解耦，计算向数据移动。(在服务端redis计算)**

![image-20210815221549981](/assets/img/Redis/Redis1-Introduction/image-20210815221549981.png)

## 安装

官网下载：http://download.redis.io/releases/redis-5.0.5.tar.gz

**安装步骤**

```shell
1.yum install wget

2.cd ~

3.mkdir soft

4.cd soft

5.wget  http://download.redis.io/releases/redis-5.0.5.tar.gz

6.tar xf  redis...tar.gz

7.cd redis-src

8.看README.md

9. make 

 ....yum install gcc 

.... make distclean

10.make

11.cd src  ....生成了可执行程序

12. cd ..

13.make install PREFIX=/opt/mashibing/redis5

14.vi /etc/profile

...  export REDIS_HOME=/opt/mashibing/redis5

...  export PATH=$PATH:$REDIS_HOME/bin

..source /etc/profile

15.cd utils

16../install_server.sh （可以执行一次或多次）

  a) 一个物理机中可以有多个redis实例（进程）.通过port区分

  b) 可执行程序就一份在目录.但是内存中未来的多个实例需要各自的配置文件.持久化目录等资源

  c) service  redis_6379 start/stop/stauts   >  linux  /etc/init.d/**** 

  d)脚本还会帮你启动！

17.ps -ef | grep redis 
```

![image-20210815225323039](/assets/img/Redis/Redis1-Introduction/image-20210815225323039.png)

<img src="/assets/img/Redis/Redis1-Introduction/image-20210815225756317.png" alt="image-20210815225756317" style="zoom:67%;" />

## epoll  非阻塞多路复用

​	epoll是Linux内核为处理大批量文件描述符而作了改进的poll，是Linux下多路复用IO接口select/poll的增强版本，它能显著提高程序在大量并发连接中只有少量活跃的情况下的系统CPU利用率。另一点原因就是获取事件的时候，它无须遍历整个被侦听的描述符集，只要遍历那些被内核IO事件异步唤醒而加入Ready队列的描述符集合就行了。epoll除了提供select/poll那种IO事件的水平触发（Level Triggered）外，还提供了边缘触发（Edge Triggered），这就使得用户空间程序有可能缓存IO状态，减少epoll_wait/epoll_pwait的调用，提高应用程序效率。

`0拷贝`使用的系统调用`sendfile`

https://blog.csdn.net/qq_35433716/article/details/85345907

![image-20210815225931291](/assets/img/Redis/Redis1-Introduction/image-20210815225931291.png)

连上图

<img src="/assets/img/Redis/Redis1-Introduction/image-20210816230043838.png" alt="image-20210816230043838" style="zoom:80%;" />

**查看redis进程文件描述符**

```shell
cd  /proc/18824/fd

ls
```

![image-20210815230424954](/assets/img/Redis/Redis1-Introduction/image-20210815230424954.png)