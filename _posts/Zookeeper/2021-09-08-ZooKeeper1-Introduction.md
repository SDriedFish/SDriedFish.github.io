---
layout: post
title: ZooKeeper1-介绍
categories: ZooKeeper
tags: ZooKeeper
keywords: ZooKeeper1-介绍
date: 2021-09-08
---
# 回顾Redis

![image-20210905232841787](/assets/img/Zookeeper/Zookeeper1-Introduction/image-20210905232841787.png)

# ZooKeeper介绍

## 官网

https://zookeeper.apache.org/

http://zookeeper.apache.org/doc/r3.6.3/zookeeperOver.html

### **ZooKeeper：分布式应用程序的分布式协调服务**

ZooKeeper 是分布式应用程序的分布式开源协调服务。它公开了一组简单的原语，分布式应用程序可以基于这些原语来实现更高级别的同步、配置维护以及组和命名服务。它被设计为易于编程，并使用以熟悉的文件系统目录树结构为样式的数据模型。它在 Java 中运行，并且具有 Java 和 C 的绑定。

众所周知，协调服务很难做好。它们特别容易出现诸如竞争条件和死锁之类的错误。ZooKeeper 背后的动机是减轻分布式应用程序从头开始实现协调服务的责任。

### 设计目标

**ZooKeeper 很简单。**ZooKeeper 允许分布式进程通过共享的分层命名空间相互协调，该命名空间的组织类似于标准文件系统。命名空间由数据寄存器组成——在 ZooKeeper 中称为 znodes——这些类似于文件和目录。与典型的为存储而设计的文件系统不同，ZooKeeper 数据保存在内存中，这意味着 ZooKeeper 可以实现高吞吐量和低延迟。

ZooKeeper 实现非常重视高性能、高可用、严格有序的访问。ZooKeeper 的性能方面意味着它可以用于大型分布式系统。可靠性方面使其不会成为单点故障。严格的排序意味着可以在客户端实现复杂的同步原语。

**ZooKeeper 被复制。**就像它协调的分布式进程一样，ZooKeeper 本身旨在通过一组称为集合的主机进行复制。

![image-20210905233721225](/assets/img/Zookeeper/Zookeeper1-Introduction/image-20210905233721225.png)

> 每个节点的数据都一样。有一个leader，其他都是follower，是一个主从集群。

组成 ZooKeeper 服务的服务器必须相互了解。它们维护内存中的状态图像，以及持久存储中的事务日志和快照。只要大多数服务器可用，ZooKeeper 服务就可用。

客户端连接到单个 ZooKeeper 服务器。客户端维护一个 TCP 连接，通过它发送请求、获取响应、获取监视事件和发送心跳。如果与服务器的 TCP 连接中断，客户端将连接到不同的服务器。

<img src="/assets/img/Zookeeper/Zookeeper1-Introduction/image-20210905232707592.png" alt="image-20210905232707592" style="zoom:67%;" />

**ZooKeeper 已订购。**ZooKeeper 用反映所有 ZooKeeper 事务顺序的数字标记每个更新。后续操作可以使用顺序来实现更高级别的抽象，例如同步原语。

**ZooKeeper 速度很快。**它在“读取主导”工作负载中特别快。ZooKeeper 应用程序在数千台机器上运行，它在读取比写入更常见的情况下表现最佳，比率约为 10:1。

### 数据模型和分层命名空间

ZooKeeper 提供的命名空间很像标准文件系统的命名空间。名称是由斜杠 (/) 分隔的一系列路径元素。ZooKeeper 命名空间中的每个节点都由路径标识。

**ZooKeeper 的分层命名空间**

![image-20210905233736262](/assets/img/Zookeeper/Zookeeper1-Introduction/image-20210905233736262.png)

### 节点和临时节点

与标准文件系统不同，ZooKeeper 命名空间中的每个节点都可以拥有与其关联的数据以及子节点。这就像拥有一个允许文件也成为目录的文件系统。（ZooKeeper 旨在存储协调数据：状态信息、配置、位置信息等，因此每个节点存储的数据通常很小，在字节到千字节范围内。）我们使用术语*znode*来明确我们正在谈论 ZooKeeper 数据节点。**zk每个node只能存1M**

Znodes 维护一个统计结构，其中包括数据更改、ACL 更改和时间戳的版本号，以允许缓存验证和协调更新。每次 znode 的数据更改时，版本号都会增加。例如，每当客户端检索数据时，它也会收到数据的版本。

存储在命名空间中每个 znode 的数据是原子读写的。读取获取与 znode 关联的所有数据字节，写入替换所有数据。每个节点都有一个访问控制列表 (ACL)，它限制了谁可以做什么。

ZooKeeper 也有临时节点的概念。只要创建 znode 的会话处于活动状态，这些 znode 就存在。当会话结束时，znode 被删除。

> session来代表这个客户端连接，**临时节点**处于活动session状态

<img src="/assets/img/Zookeeper/Zookeeper1-Introduction/image-20210905232815783.png" alt="image-20210905232815783" style="zoom:80%;" />

### 可靠性

为了显示系统在注入故障时随时间的行为，我们运行了一个由 7 台机器组成的 ZooKeeper 服务。我们运行了与之前相同的饱和基准测试，但这次我们将写入百分比保持在 30% 不变，这是我们预期工作负载的保守比例。

![image-20210905233756232](/assets/img/Zookeeper/Zookeeper1-Introduction/image-20210905233756232.png)

从这张图中有一些重要的观察结果。首先，如果跟随者失败并快速恢复，那么即使出现故障，ZooKeeper 也能够维持高吞吐量。但也许更重要的是，领导者选举算法允许系统足够快地恢复以防止吞吐量大幅下降。在我们的观察中，ZooKeeper 花费不到 200 毫秒的时间来选举一个新的领导者。第三，随着追随者的恢复，一旦他们开始处理请求，ZooKeeper 能够再次提高吞吐量。

### 保证

ZooKeeper 非常快速且非常简单。但是，由于它的目标是成为构建更复杂服务（例如同步）的基础，因此它提供了一组保证。这些是：

- 顺序一致性 - 来自客户端的更新将按发送顺序应用。
- 原子性 - 更新要么成功要么失败。没有部分结果。
- 单一系统映像 - 无论客户端连接到哪个服务器，它都会看到相同的服务视图。即，即使客户端故障转移到具有相同会话的不同服务器，客户端也永远不会看到系统的旧视图。
- 可靠性 - 应用更新后，它将从那时起一直存在，直到客户端覆盖更新。
- 及时性 - 系统的客户视图保证在特定时间范围内是最新的。 **最终一致性**

# ZooKeeper 安装

1. 准备好ZK的tar压缩包

https://www.apache.org/dyn/closer.lua/zookeeper/zookeeper-3.7.0/apache-zookeeper-3.7.0-bin.tar.gz、

2. 解压

   `tar -zxvf apache-zookeeper-3.7.0-bin.tar.gz`

3. 创建目录

```shell
mkdir /opt/zhoum
mv apache-zookeeper-3.7.0-bin /opt/zhoum

cd /opt/zhoum/apache-zookeeper-3.7.0-bin && cd conf
cp zoo_sample.cfg zoo.cfg # zk 默认配置文件名称为zoo.cfg

# 修改配置
# 未来持久化数据的目录，里面创建 myid 文件，内容为1，代表配置文件里面对应的，这台机器的id号

mkdir -p /var/zhoum/zk && echo 1 > /var/zhoum/zk/myid  && cat /var/zhoum/zk/myid

cd /var/zhoum/zk
vi zoo.cfg

#将存放数据的目录修改成：
dataDir=/var/zhoum/zk

# 配置文件最后面添加：

# 注意要提前配好IP地址与主机名映射的/etc/hosts文件，否则计算机怎么知道node11是谁？或者你不配的话，直接用ip地址代替nodexx也可以

server.1=node11:2888:3888
server.2=node12:2888:3888
server.3=node13:2888:3888
server.4=node14:2888:3888

# 含义：没有leader的时候，节点之间通过3888端口通信，投票选出leader之后，leader使用2888端口

# 如何快速选出leader？通过谦让，谁的id最大就用谁。过半通过即可（3台通过即可）。
```

4. 同步节点配置

   ```shell
   # 将当前目录下的zhoum拷贝到远程的与当前pwd相同的目录下
   
   # 以下三行全部在node11上操作
   scp -r ./zhoum/ node12:`pwd`   	# node12
   scp -r ./zhoum/ node13:`pwd`	# node13
   scp -r ./zhoum/ node14:`pwd`	# node14
   
   # 像node11那样，分别配置另外三个node的myid，并cat输出验证
   mkdir -p /var/zhoum/zk && echo 2 > /var/zhoum/zk/myid  && cat /var/zhoum/zk/myid # 在node12上操作
   mkdir -p /var/zhoum/zk && echo 3 > /var/zhoum/zk/myid  && cat /var/zhoum/zk/myid # 在node13上操作
   mkdir -p /var/zhoum/zk && echo 4 > /var/zhoum/zk/myid  && cat /var/zhoum/zk/myid # 在node14上操作
   ```

   

5. 时间同步 `ntpdate`

   https://blog.csdn.net/a_drjiaoda/article/details/89674468

6. 配置ZK的环境变量


```shell
vi /etc/profile
#zookeeper 
export ZOOKEEPER_HOME=/opt/zhoum/apache-zookeeper-3.7.0-bin
export PATH=$PATH:$REDIS_HOME/bin:$ZOOKEEPER_HOME/bin
# 重新加载配置文件
source /etc/profile
# 其他三个节点执行相同步骤
```
7.启动zk

`zkServer.sh start-foreground`

`zkServer.sh status` 查看当前机器上zk的状态（leader或者follower）

 `zkCli.sh` 使用客户端连接

![image-20210907221832800](/assets/img/Zookeeper/Zookeeper1-Introduction/image-20210907221832800.png)

![image-20210907221901217](/assets/img/Zookeeper/Zookeeper1-Introduction/image-20210907221901217.png)

![image-20210907221932416](/assets/img/Zookeeper/Zookeeper1-Introduction/image-20210907221932416.png)

![image-20210907222506336](/assets/img/Zookeeper/Zookeeper1-Introduction/image-20210907222506336.png)



8.客户端操作

创建节点`create [-s] [-e] [-c] [-t ttl] path [data] [acl]`

```shell
[zk: localhost:2181(CONNECTED) 3] create /ooxx ""
Created /ooxx
[zk: localhost:2181(CONNECTED) 4] ls /
[ooxx, zookeeper]
[zk: localhost:2181(CONNECTED) 5] create /ooxx/xxoo ""
Created /ooxx/xxoo
[zk: localhost:2181(CONNECTED) 6] get /ooxx

[zk: localhost:2181(CONNECTED) 7] ls /ooxx
[xxoo]
[zk: localhost:2181(CONNECTED) 8] get /ooxx

[zk: localhost:2181(CONNECTED) 9] set /ooxx "hello"
[zk: localhost:2181(CONNECTED) 10] get /ooxx
hello
[zk: localhost:2181(CONNECTED) 10] get /ooxx
hello

[zk: localhost:2181(CONNECTED) 11] stat /ooxx
cZxid = 0x200000002
ctime = Tue Sep 07 22:33:08 CST 2021
mZxid = 0x200000004
mtime = Tue Sep 07 22:34:30 CST 2021
pZxid = 0x200000003
cversion = 1
dataVersion = 1
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 5
numChildren = 1
```

> #### 1. cZxid-创建节点的事务zxid
>
> - 每次修改zookeeper状态都会收到一个zxid形式的时间戳,也就是zookeeper事务ID。事务ID是zookeeper中所有修改总的次序。每个修改都有唯一的zxid,如果zxid1小于zxid,那么zxid在zxid2之前发生。新的leader会自动将事务id重新开始，并且修改事务id的前缀。
>
> #### 2. ctime-znode被创建的毫秒数(从1970年开始)
>
> #### 3. mZxid-znode最后更新的事务zxid
>
> #### 4. mtime-znode最后修改的毫秒数(从1970年开始)
>
> #### 5. pZxid-最后更新的子节点zxid
>
> #### 6. cversion-znode子节点变化号,znode子节点修改次数
>
> #### 7. dataversion-znode数据变化号
>
> #### 8. aclVersion-znode访问控制列表的变化号
>
> #### 9. ephemeralOwner-如果是临时节点,这个是znode拥有session id。如果不是临时节点则是0。
>
> #### 10. dataLength-znode的数据长度
>
> #### 11. numChildren-znode子节点数量



创建临时节点 `create -e /ephemeraltest ephemeraltestdata`

`2021-09-07 22:48:54,342 [myid:3] - INFO  [CommitProcessor:3:LeaderSessionTracker@104] - Committing global session 0x30000c673bf0001`   客户端**连接进来**之后，自动给它创建的sessionid，session退出之后，临时节点也就不再保留了

如果客户端连接的这个服务端挂了，那么客户端fail over重新连接到其他的服务端之后，之前创建的临时节点还存在吗？

因为“统一视图”不仅是针对节点，而且针对sessionid。

```shell
[zk: localhost:2181(CONNECTED) 0] create -e /oxox "SDDS"
Created /oxox
[zk: localhost:2181(CONNECTED) 1] get -s /oxox
SDDS
cZxid = 0x200000008
ctime = Tue Sep 07 22:50:58 CST 2021
mZxid = 0x200000008
mtime = Tue Sep 07 22:50:58 CST 2021
pZxid = 0x200000008
cversion = 0
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x30000c673bf0001
dataLength = 4
numChildren = 0
```



创建顺序节点

使用`create -s`，zk自动帮你保证节点之间的区分，可以让每一个**客户端**拿到的**节点名称不会重复**。

类似于分布式id(id唯一自增)，节点名称是全局唯一的。可以做隔离，统一命名。

```shell
[zk: localhost:2181(CONNECTED) 4] create -s /abc/xxx "sdsd"
Created /abc/xxx0000000000
```



## 节点间通信原理

任意两个节点之间，只要有一个（socket）连接，就可以实现**双向通信**。

![image-20210907222242064](/assets/img/Zookeeper/Zookeeper1-Introduction/image-20210907222242064.png)

#### 节点间连接情况如下

使用 `netstat -natp | egrep '(2888|3888)'` 查看

![image-20210908230029596](/assets/img/Zookeeper/Zookeeper1-Introduction/image-20210908230029596.png)

![image-20210908230116367](/assets/img/Zookeeper/Zookeeper1-Introduction/image-20210908230116367.png)

![image-20210908230308424](/assets/img/Zookeeper/Zookeeper1-Introduction/image-20210908230308424.png)

![image-20210908230358464](/assets/img/Zookeeper/Zookeeper1-Introduction/image-20210908230358464.png)