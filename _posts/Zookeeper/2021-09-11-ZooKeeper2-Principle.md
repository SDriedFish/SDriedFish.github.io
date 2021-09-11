---
layout: post
title: ZooKeeper2-原理
categories: ZooKeeper
tags: ZooKeeper
keywords: ZooKeeper2-原理
date: 2021-09-11
---

ZooKeeper是提供分布式“协调”的，具有扩展，可靠性，时序性

- 在以往的分布式系统中，最典型的集群模式是 master/slave 模式（主备模式），我们把所有能够处理写操作的机器成为Master机器，把所有通过异步复制方式获取最新数据，并提供度服务的机器称为Slave机器
- 而在 ZooKeeper中，这些概念被颠覆了。它没有引入 master/slave 的概念 ，而是引入了 leader、follower、observer三种角色。
- leader服务器为客户端提供读和写服务
- follower、observer 都能提供读服务，区别在于 observer 不参与 leader 的选举过程，也不参与写操作的“过半写成功”策略。
- 因此，observer 可以在不影响写性能的情况下，提升集群的读性能。



![image-20210909232659929](/assets/img/Zookeeper/Zookeeper2-Principle/image-20210909232659929.png)

# Paxos算法

https://www.douban.com/note/208430424/

https://www.zhihu.com/question/19787937

https://blog.csdn.net/lin819747263/article/details/106313936

https://www.cnblogs.com/linbingdong/p/6253479.html

Paxos算法是基于**消息传递**且具有**高度容错特性**的**一致性算法**，是目前公认的解决**分布式一致性**问题**最有效**的算法之一。

![image-20210910215658744](/assets/img/Zookeeper/Zookeeper2-Principle/image-20210910215658744.png)

#  ZAB 协议

**ZAB协议：对Paxos的简化**

https://blog.csdn.net/liuchang19950703/article/details/111406622

https://www.cnblogs.com/stateis0/p/9062133.html

- 两阶段提交，先写磁盘日志，再写到内存。

- zk的数据保存在内存

- zk的日志保存在磁盘

  

![image-20210909232713775](/assets/img/Zookeeper/Zookeeper2-Principle/image-20210909232713775.png)

启停zookeeper

`zkServer.sh start`

`zkServer.sh stop`

![image-20210910233014782](/assets/img/Zookeeper/Zookeeper2-Principle/image-20210910233014782.png)

**leader node13** 挂掉后重新投票选主

![image-20210910232913287](/assets/img/Zookeeper/Zookeeper2-Principle/image-20210910232913287.png)

# Watcher 机制

我们假设有两个客户端，它们想要通过ZooKeeper相互知道对方挂没挂。有多种方式。区别在于方向性、时效性。

1. 相互发送心跳，由开发人员自己实现
2. Watcher ，基于ZooKeeper。/ooxx/a 节点消失会产生事件event，事件产生之后，会回调之前定义的回调方法。
   在 ZooKeeper 中，引入了 Watcher 机制来实现分布式通知的功能。

ZooKeeper 允许客户端向服务端注册一个 Watcher 监听，当服务端的一些指定事件触发了这个Watcher，那么就会向指定客户端发送一个事件通知，来实现分布式通知功能。

https://blog.csdn.net/yamaxifeng_132/article/details/86677015

![image-20210911231728829](/assets/img/Zookeeper/Zookeeper2-Principle/image-20210911231728829.png)

# API 实战

把 zookeeper 安装目录里的 conf 目录下的 log4j.properties 文件放进 项目根目录的 resources 目录下，方便观察日志

```java
import org.apache.zookeeper.*;
import org.apache.zookeeper.data.Stat;

import java.util.concurrent.CountDownLatch;

/**
 * Hello world!
 */
public class App {
    public static void main(String[] args) throws Exception {
        System.out.println("Hello World!");

        //zk是有session概念的，没有连接池的概念
        //watch:观察，回调
        //watch的注册值发生在 读类型调用，get，exites
        //第一类：new zk 时候，传入的watch，这个watch，session级别的，跟path 、node没有关系
        final CountDownLatch cd = new CountDownLatch(1);
        final ZooKeeper zk = new ZooKeeper("192.168.10.71:2181,192.168.10.72:2181,192.168.10.73:2181,192.168.10.74:2181",
                3000, new Watcher() {
            //Watch 的回调方法！
            @Override
            public void process(WatchedEvent event) {
                Event.KeeperState state = event.getState();
                Event.EventType type = event.getType();
                System.out.println("new zk watch: " + event.toString());

                switch (state) {
                    case Unknown:
                        break;
                    case Disconnected:
                        break;
                    case NoSyncConnected:
                        break;
                    case SyncConnected:
                        System.out.println("connected");
                        cd.countDown();
                        break;
                    case AuthFailed:
                        break;
                    case ConnectedReadOnly:
                        break;
                    case SaslAuthenticated:
                        break;
                    case Expired:
                        break;
                }

                switch (type) {
                    case None:
                        break;
                    case NodeCreated:
                        break;
                    case NodeDeleted:
                        break;
                    case NodeDataChanged:
                        break;
                    case NodeChildrenChanged:
                        break;
                }


            }
        });

        cd.await();
        ZooKeeper.States state = zk.getState();
        switch (state) {
            case CONNECTING:
                System.out.println("ing......");
                break;
            case ASSOCIATING:
                break;
            case CONNECTED:
                System.out.println("ed........");
                break;
            case CONNECTEDREADONLY:
                break;
            case CLOSED:
                break;
            case AUTH_FAILED:
                break;
            case NOT_CONNECTED:
                break;
        }


        String pathName = zk.create("/ooxx", "olddata".getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL);

        final Stat stat = new Stat();
        byte[] node = zk.getData("/ooxx", new Watcher() {
            @Override
            public void process(WatchedEvent event) {
                System.out.println("getData watch: " + event.toString());
                try {
                    //true   default Watch  被重新注册   new zk的那个watch
                    zk.getData("/ooxx", this, stat);
                } catch (KeeperException e) {
                    e.printStackTrace();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }, stat);

        System.out.println(new String(node));

        //触发回调
        Stat stat1 = zk.setData("/ooxx", "newdata".getBytes(), 0);
        //还会触发吗？
        Stat stat2 = zk.setData("/ooxx", "newdata01".getBytes(), stat1.getVersion());

        System.out.println("-------async start----------");
        zk.getData("/ooxx", false, new AsyncCallback.DataCallback() {
            @Override
            public void processResult(int rc, String path, Object ctx, byte[] data, Stat stat) {
                System.out.println("-------async call back----------");
                System.out.println(ctx.toString());
                System.out.println(new String(data));

            }

        }, "abc");
        System.out.println("-------async over----------");
        Thread.sleep(10000);
    }
}
```
**结果**

```markdown
Hello World!
2021-09-11 23:15:03,185 [myid:] - INFO  [main:Environment@98] - Client environment:java.io.tmpdir=C:\Users\ADMINI~1\AppData\Local\Temp\
2021-09-11 23:15:03,185 [myid:] - INFO  [main:Environment@98] - Client environment:java.compiler=<NA>
2021-09-11 23:15:03,186 [myid:] - INFO  [main:Environment@98] - Client environment:os.name=Windows 7
2021-09-11 23:15:03,186 [myid:] - INFO  [main:Environment@98] - Client environment:os.arch=amd64
2021-09-11 23:15:03,186 [myid:] - INFO  [main:Environment@98] - Client environment:os.version=6.1
2021-09-11 23:15:03,186 [myid:] - INFO  [main:Environment@98] - Client environment:user.name=Administrator
2021-09-11 23:15:03,186 [myid:] - INFO  [main:Environment@98] - Client environment:user.home=C:\Users\Administrator
2021-09-11 23:15:03,186 [myid:] - INFO  [main:Environment@98] - Client environment:os.memory.free=114MB
2021-09-11 23:15:03,187 [myid:] - INFO  [main:Environment@98] - Client environment:os.memory.max=1808MB
2021-09-11 23:15:03,187 [myid:] - INFO  [main:Environment@98] - Client environment:os.memory.total=123MB
2021-09-11 23:15:03,192 [myid:] - INFO  [main:ZooKeeper@637] - Initiating client connection, connectString=192.168.10.71:2181,192.168.10.72:2181,192.168.10.73:2181,192.168.10.74:2181 sessionTimeout=3000 watcher=com.msb.zookeeper.App$1@7591083d
2021-09-11 23:15:03,199 [myid:] - INFO  [main:X509Util@77] - Setting -D jdk.tls.rejectClientInitiatedRenegotiation=true to disable client-initiated TLS renegotiation
2021-09-11 23:15:03,596 [myid:] - INFO  [main:ClientCnxnSocket@239] - jute.maxbuffer value is 1048575 Bytes
2021-09-11 23:15:03,606 [myid:] - INFO  [main:ClientCnxn@1726] - zookeeper.request.timeout value is 0. feature enabled=false
2021-09-11 23:15:21,624 [myid:192.168.10.72:2181] - INFO  [main-SendThread(192.168.10.72:2181):ClientCnxn$SendThread@1171] - Opening socket connection to server 192.168.10.72/192.168.10.72:2181.
2021-09-11 23:15:21,624 [myid:192.168.10.72:2181] - INFO  [main-SendThread(192.168.10.72:2181):ClientCnxn$SendThread@1173] - SASL config status: Will not attempt to authenticate using SASL (unknown error)
2021-09-11 23:15:21,650 [myid:192.168.10.72:2181] - INFO  [main-SendThread(192.168.10.72:2181):ClientCnxn$SendThread@1005] - Socket connection established, initiating session, client: /192.168.10.1:8291, server: 192.168.10.72/192.168.10.72:2181
2021-09-11 23:15:21,670 [myid:192.168.10.72:2181] - INFO  [main-SendThread(192.168.10.72:2181):ClientCnxn$SendThread@1438] - Session establishment complete on server 192.168.10.72/192.168.10.72:2181, session id = 0x200010e98900003, negotiated timeout = 4000
new zk watch: WatchedEvent state:SyncConnected type:None path:null
connected
ed........
olddata
getData watch: WatchedEvent state:SyncConnected type:NodeDataChanged path:/ooxx
getData watch: WatchedEvent state:SyncConnected type:NodeDataChanged path:/ooxx
-------async start----------
-------async over----------
-------async call back----------
abc
newdata01
```

