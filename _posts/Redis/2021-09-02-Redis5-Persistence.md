---
layout: post
title: Redis5-持久化
categories: Redis
tags: Redis
keywords: Redis5-持久化
date: 2021-09-02
---
# 单机持久化

# 存储层

1. 快照/副本

2. 日志

## RDB

> 对应快照

<img src="/assets/img/Redis/Redis5-Persistence/image-20210823222633787.png" alt="image-20210823222633787" style="zoom:80%;" />



时点性，是每隔一段时间存一下

- 阻塞，redis不对外提供服务

  <img src="/assets/img/Redis/Redis5-Persistence/image-20210823222757064.png" alt="image-20210823222757064" style="zoom:80%;" />
  
- 非阻塞，redis继续对外提供服务

  > 非阻塞过程写个过程中存在修改，数据正确性不能保证，备份的时间点也无法确认，redis采用下图方式无法实现

  <img src="/assets/img/Redis/Redis5-Persistence/image-20210823223129485.png" alt="image-20210823223129485" style="zoom:80%;" />
  
- 非阻塞，fork方式
  
> redis 子进程用来RDB持久化落盘，父进程用来提供服务

  ![image-20210823231213282](/assets/img/Redis/Redis5-Persistence/image-20210823231213282.png)

  ### 管道

  1. 衔接，前一个命令的输出作为后一个命令的输入
  
  2. 管道会触发创建【子进程】
  
     > echo $$ |  more
     >
     > echo $BASHPID | more
     >
     > $$ 优先级高于 | ，普通变量 `$BASHPID`优先级低于管道

  ![image-20210823224100489](/assets/img/Redis/Redis5-Persistence/image-20210823224100489.png)

### 父子进程&fork

使用linux的时候：父子进程 **父进程的数据，子进程可不可以看得到？**

**常规思想**，进程是数据隔离的！

![image-20210823224904413](/assets/img/Redis/Redis5-Persistence/image-20210823224904413.png)

**进阶思想**，父进程其实可以让子进程看到数据！

linux中`export`的环境变量，子进程的修改不会破坏父进程

父进程的修改也不会破坏子进程

<center class="half">
    <img src="/assets/img/Redis/Redis5-Persistence/image-20210823225209293.png" width="300"/>
    <img src="/assets/img/Redis/Redis5-Persistence/image-20210823225627364.png" width="300"/>
    <img src="/assets/img/Redis/Redis5-Persistence/image-20210823225942065.png" width="300"/>
</center>
![image-20210823230439427](/assets/img/Redis/Redis5-Persistence/image-20210823230439427.png)

### 写时复制

> 在fork之后exec之前两个进程**用的是相同的物理空间**（内存区），子进程的代码段、数据段、堆栈都是指向父进程的物理空间，也就是说，两者的虚拟空间不同，但其对应的**物理空间是同一个**。
>
> 当父子进程中**有更改相应段的行为发生时**，再**为子进程相应的段分配物理空间**



![image-20210823231109711](/assets/img/Redis/Redis5-Persistence/image-20210823231109711.png)

### 开启方式

`redis.conf`配置文件

![image-20210823232638834](/assets/img/Redis/Redis5-Persistence/image-20210823232638834.png)

## AOF(append only file)

> 对应日志

![image-20210823235022520](/assets/img/Redis/Redis5-Persistence/image-20210823235022520.png)

**日志目录** `/var/lib/redis/6379`

![image-20210824225354832](/assets/img/Redis/Redis5-Persistence/image-20210824225354832.png)

开启混合模式 `aof-use-rdb-preamble yes`
```markdown
# When loading Redis recognizes that the AOF file starts with the "REDIS"
# string and loads the prefixed RDB file, and continues loading the AOF
# tail
aof-use-rdb-preamble no
```

![image-20210824230400926](/assets/img/Redis/Redis5-Persistence/image-20210824230400926.png)

**AOF自动记录**

```markdown
# Redis is able to automatically rewrite the log file implicitly calling
# BGREWRITEAOF when the AOF log size grows by the specified percentage.
#
# This is how it works: Redis remembers the size of the AOF file after the
# latest rewrite (if no rewrite has happened since the restart, the size of
# the AOF at startup is used).
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

