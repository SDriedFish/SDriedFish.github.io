---
layout: post
title: ZooKeeper3-实战
categories: BigData
tags: BigData
keywords: ZooKeeper3-实战
date: 2021-09-20
---
# 引入

ZooKeeper是做分布式协调的，那它协调啥？
配置写在哪里？难道运维人员要登录到每一台机器一台一台地改吗？
可以将配置文件放在一个共享的位置中，比如redis，比如数据库，比如zk，任何一个地方。
zk具有回调机制，就不需要轮询了。

**使用ZooKeeper实现分布式配置中心**
思路：我们将所有的配置数据用data配置到zk中去，在客户端我们既可以get它，也可以watch它。
一旦外界对这个数据进行了修改，这个修改就会引发watch的回调。

# 分布式配置中心

![image-20210912180222924](/assets/img/Zookeeper/Zookeeper3-Training/image-20210912180222924.png)



## 代码

**测试程序**

```java
package com.msb.zookeeper.config;

import org.apache.zookeeper.AsyncCallback;
import org.apache.zookeeper.WatchedEvent;
import org.apache.zookeeper.Watcher;
import org.apache.zookeeper.ZooKeeper;
import org.apache.zookeeper.data.Stat;

import java.util.concurrent.CountDownLatch;

public class WatchCallBack implements Watcher, AsyncCallback.StatCallback, AsyncCallback.DataCallback {

    ZooKeeper zk;
    MyConf conf;
    CountDownLatch cc = new CountDownLatch(1);

    public MyConf getConf() {
        return conf;
    }

    public void setConf(MyConf conf) {
        this.conf = conf;
    }

    public ZooKeeper getZk() {
        return zk;
    }

    public void setZk(ZooKeeper zk) {
        this.zk = zk;
    }


    public void aWait() {
        //实际是/testLock/AppConf
        zk.exists("/AppConf", this, this, "ABC");
        try {
            cc.await();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    @Override
    //DataCallback
    public void processResult(int rc, String path, Object ctx, byte[] data, Stat stat) {

        if (data != null) {
            String s = new String(data);
            conf.setConf(s);
            cc.countDown();
        }


    }

    @Override
    //StatCallback
    public void processResult(int rc, String path, Object ctx, Stat stat) {
        if (stat != null) {
            zk.getData("/AppConf", this, this, "sdfs");
        }

    }

    @Override
    public void process(WatchedEvent event) {

        switch (event.getType()) {
            case None:
                break;
            case NodeCreated:
                zk.getData("/AppConf", this, this, "sdfs");

                break;
            case NodeDeleted:
                //容忍性
                //节点被删除事件，这要根据业务的容忍性，写处理方式
                System.out.println("节点被删除了");
                conf.setConf("");
                cc = new CountDownLatch(1);
                break;
            case NodeDataChanged:
                //数据被更改
                zk.getData("/AppConf", this, this, "sdfs");

                break;
            case NodeChildrenChanged:
                break;
        }

    }
}
```

**ZKUtils.java 用来配置Zookeeper的Server端服务器地址，以及创建并返回Zookeeper实例**

```java
package com.msb.zookeeper.config;

import org.apache.zookeeper.ZooKeeper;

import java.util.concurrent.CountDownLatch;

public class ZKUtils {

    private  static ZooKeeper zk;

    ///testLock 是指定的根目录，后续所有的操作都在以 /testLock 为根目录的基础上进行
    private static String address = "192.168.10.71:2181,192.168.10.72:2181,192.168.10.73:2181,192.168.10.74:2181/testLock";

    private static DefaultWatch watch = new DefaultWatch();

    private static CountDownLatch init  =  new CountDownLatch(1);
    public static ZooKeeper  getZK(){

        try {
            zk = new ZooKeeper(address,1000,watch);
            watch.setCc(init);
            init.await();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return zk;
    }
}
```

**DefaultWatch.java，连接默认watch**

```java
package com.msb.zookeeper.config;

import org.apache.zookeeper.WatchedEvent;
import org.apache.zookeeper.Watcher;

import java.util.concurrent.CountDownLatch;

public class DefaultWatch  implements Watcher {

    CountDownLatch cc ;

    public void setCc(CountDownLatch cc) {
        this.cc = cc;
    }

    @Override
    public void process(WatchedEvent event) {

        System.out.println(event.toString());

        switch (event.getState()) {
            case Unknown:
                break;
            case Disconnected:
                break;
            case NoSyncConnected:
                break;
            case SyncConnected:
                System.out.println("连接成功.");
                cc.countDown();
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
    }
}
```

**WatchCallBack.java**

```java
package com.msb.zookeeper.config;

import org.apache.zookeeper.AsyncCallback;
import org.apache.zookeeper.WatchedEvent;
import org.apache.zookeeper.Watcher;
import org.apache.zookeeper.ZooKeeper;
import org.apache.zookeeper.data.Stat;

import java.util.concurrent.CountDownLatch;

public class WatchCallBack implements Watcher, AsyncCallback.StatCallback, AsyncCallback.DataCallback {

    ZooKeeper zk;
    MyConf conf;
    CountDownLatch cc = new CountDownLatch(1);

    public MyConf getConf() {
        return conf;
    }

    public void setConf(MyConf conf) {
        this.conf = conf;
    }

    public ZooKeeper getZk() {
        return zk;
    }

    public void setZk(ZooKeeper zk) {
        this.zk = zk;
    }


    public void aWait() {
        //实际是/testLock/AppConf
        zk.exists("/AppConf", this, this, "ABC");
        try {
            cc.await();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    @Override
    //DataCallback
    public void processResult(int rc, String path, Object ctx, byte[] data, Stat stat) {

        if (data != null) {
            String s = new String(data);
            conf.setConf(s);
            cc.countDown();
        }


    }

    @Override
    //StatCallback
    public void processResult(int rc, String path, Object ctx, Stat stat) {
        if (stat != null) {
            zk.getData("/AppConf", this, this, "sdfs");
        }

    }

    @Override
    public void process(WatchedEvent event) {

        switch (event.getType()) {
            case None:
                break;
            case NodeCreated:
                zk.getData("/AppConf", this, this, "sdfs");

                break;
            case NodeDeleted:
                //容忍性
                //节点被删除事件，这要根据业务的容忍性，写处理方式
                System.out.println("节点被删除了");
                conf.setConf("");
                cc = new CountDownLatch(1);
                break;
            case NodeDataChanged:
                //数据被更改
                zk.getData("/AppConf", this, this, "sdfs");

                break;
            case NodeChildrenChanged:
                break;
        }

    }
}
```

**zk操作**

![image-20210912180630471](/assets/img/Zookeeper/Zookeeper3-Training/image-20210912180630471.png)

**结果**

```
2021-09-12 18:03:17,296 [myid:] - INFO  [main:Environment@98] - Client environment:java.compiler=<NA>
2021-09-12 18:03:17,296 [myid:] - INFO  [main:Environment@98] - Client environment:os.name=Windows 7
2021-09-12 18:03:17,296 [myid:] - INFO  [main:Environment@98] - Client environment:os.memory.free=109MB
2021-09-12 18:03:17,297 [myid:] - INFO  [main:Environment@98] - Client environment:os.memory.max=1808MB
2021-09-12 18:03:17,297 [myid:] - INFO  [main:Environment@98] - Client environment:os.memory.total=123MB
2021-09-12 18:03:17,305 [myid:] - INFO  [main:ZooKeeper@637] - Initiating client connection, connectString=192.168.10.71:2181,192.168.10.72:2181,192.168.10.73:2181,192.168.10.74:2181/testLock sessionTimeout=1000 watcher=com.msb.zookeeper.config.DefaultWatch@6f79caec
2021-09-12 18:03:17,311 [myid:] - INFO  [main:X509Util@77] - Setting -D jdk.tls.rejectClientInitiatedRenegotiation=true to disable client-initiated TLS renegotiation
2021-09-12 18:03:17,489 [myid:] - INFO  [main:ClientCnxnSocket@239] - jute.maxbuffer value is 1048575 Bytes
2021-09-12 18:03:17,507 [myid:] - INFO  [main:ClientCnxn@1726] - zookeeper.request.timeout value is 0. feature enabled=false
2021-09-12 18:03:37,841 [myid:192.168.10.72:2181] - INFO  [main-SendThread(192.168.10.72:2181):ClientCnxn$SendThread@1171] - Opening socket connection to server 192.168.10.72/192.168.10.72:2181.
2021-09-12 18:03:37,842 [myid:192.168.10.72:2181] - INFO  [main-SendThread(192.168.10.72:2181):ClientCnxn$SendThread@1173] - SASL config status: Will not attempt to authenticate using SASL (unknown error)
2021-09-12 18:03:37,845 [myid:192.168.10.72:2181] - INFO  [main-SendThread(192.168.10.72:2181):ClientCnxn$SendThread@1005] - Socket connection established, initiating session, client: /192.168.10.1:1936, server: 192.168.10.72/192.168.10.72:2181
2021-09-12 18:03:37,864 [myid:192.168.10.72:2181] - INFO  [main-SendThread(192.168.10.72:2181):ClientCnxn$SendThread@1438] - Session establishment complete on server 192.168.10.72/192.168.10.72:2181, session id = 0x200010e98900004, negotiated timeout = 4000
WatchedEvent state:SyncConnected type:None path:null
连接成功.
old
old
new
new
节点被删除了
conf diu le ......
```



# 分布式锁

![image-20210912181110619](/assets/img/Zookeeper/Zookeeper3-Training/image-20210912181110619.png)

https://blog.csdn.net/qiangcuo6087/article/details/79067136

https://www.cnblogs.com/codestory/p/11387116.html

https://blog.csdn.net/sunfeizhi/article/details/51926396

**测试程序**

```java
package com.msb.zookeeper.lock;

import com.msb.zookeeper.config.ZKUtils;
import org.apache.zookeeper.ZooKeeper;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

public class TestLock {


    ZooKeeper zk ;

    @Before
    public void conn (){
        zk  = ZKUtils.getZK();
    }

    @After
    public void close (){
        try {
            zk.close();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void lock(){

        for (int i = 0; i < 10; i++) {//模拟10个线程分布在10台机器上
            new Thread(){
                @Override
                public void run() {
                    WatchCallBack watchCallBack = new WatchCallBack();
                    watchCallBack.setZk(zk);
                    String threadName = Thread.currentThread().getName();
                    watchCallBack.setThreadName(threadName);
                    //每一个线程：
                    //抢锁
                    watchCallBack.tryLock();
                    //干活
                    System.out.println(threadName+" working...");
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    //释放锁
                    watchCallBack.unLock();


                }
            }.start();
        }
        while(true){

        }


    }
}
```

**WatchCallBack.java，分布式锁的Watcher**

```java
package com.msb.zookeeper.lock;

import org.apache.zookeeper.*;
import org.apache.zookeeper.data.Stat;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.CountDownLatch;

public class WatchCallBack   implements Watcher, AsyncCallback.StringCallback ,AsyncCallback.Children2Callback ,AsyncCallback.StatCallback {

    ZooKeeper zk ;
    String threadName;
    CountDownLatch cc = new CountDownLatch(1);
    String pathName;

    public String getPathName() {
        return pathName;
    }

    public void setPathName(String pathName) {
        this.pathName = pathName;
    }

    public String getThreadName() {
        return threadName;
    }

    public void setThreadName(String threadName) {
        this.threadName = threadName;
    }

    public ZooKeeper getZk() {
        return zk;
    }

    public void setZk(ZooKeeper zk) {
        this.zk = zk;
    }

    public void tryLock(){
        try {

            System.out.println(threadName + "  create....");
//            if(zk.getData("/"))
            zk.create("/lock",threadName.getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL_SEQUENTIAL,this,"abc");

            cc.await();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    public void unLock(){
        try {
            zk.delete(pathName,-1);
            System.out.println(threadName + " over work....");
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (KeeperException e) {
            e.printStackTrace();
        }
    }


    @Override
    public void process(WatchedEvent event) {


        //如果第一个哥们，那个锁释放了，其实只有第二个收到了回调事件！！
        //如果，不是第一个哥们，某一个，挂了，也能造成他后边的收到这个通知，从而让他后边那个跟去watch挂掉这个哥们前边的。。。
        switch (event.getType()) {
            case None:
                break;
            case NodeCreated:
                break;
            case NodeDeleted:
                zk.getChildren("/",false,this ,"sdf");
                break;
            case NodeDataChanged:
                break;
            case NodeChildrenChanged:
                break;
        }

    }

    @Override
    public void processResult(int rc, String path, Object ctx, String name) {
        if(name != null ){
            System.out.println(threadName  +"  create node : " +  name );
            pathName =  name ;
            zk.getChildren("/",false,this ,"sdf");
        }

    }

    //getChildren  call back
    @Override
    public void processResult(int rc, String path, Object ctx, List<String> children, Stat stat) {


//        System.out.println(threadName+"look locks.....");
//        for (String child : children) {
//            System.out.println(child);
//        }

        //一定能看到自己前边的 list children乱序 查询自己位置
        Collections.sort(children);
        int i = children.indexOf(pathName.substring(1));


        //是不是第一个
        if(i == 0){
            //yes
            System.out.println(threadName +" i am first....");
            try {
                zk.setData("/",threadName.getBytes(),-1);
                cc.countDown();

            } catch (KeeperException e) {
                e.printStackTrace();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }else{
            //no watch前一个
            zk.exists("/"+children.get(i-1),this,this,"sdf");
        }

    }

    @Override
    public void processResult(int rc, String path, Object ctx, Stat stat) {
        //偷懒
    }
}
```



```markdown
connectString=192.168.10.71:2181,192.168.10.72:2181,192.168.10.73:2181,192.168.10.74:2181/testLock sessionTimeout=1000 watcher=com.msb.zookeeper.config.DefaultWatch@6f79caec
2021-09-12 19:25:59,328 [myid:] - INFO  [main:X509Util@77] - Setting -D jdk.tls.rejectClientInitiatedRenegotiation=true to disable client-initiated TLS renegotiation
2021-09-12 19:25:59,562 [myid:] - INFO  [main:ClientCnxnSocket@239] - jute.maxbuffer value is 1048575 Bytes
2021-09-12 19:25:59,576 [myid:] - INFO  [main:ClientCnxn@1726] - zookeeper.request.timeout value is 0. feature enabled=false
2021-09-12 19:26:19,929 [myid:192.168.10.73:2181] - INFO  [main-SendThread(192.168.10.73:2181):ClientCnxn$SendThread@1171] - Opening socket connection to server 192.168.10.73/192.168.10.73:2181.
2021-09-12 19:26:19,929 [myid:192.168.10.73:2181] - INFO  [main-SendThread(192.168.10.73:2181):ClientCnxn$SendThread@1173] - SASL config status: Will not attempt to authenticate using SASL (unknown error)
2021-09-12 19:26:20,181 [myid:192.168.10.73:2181] - WARN  [main-SendThread(192.168.10.73:2181):ClientCnxn$SendThread@1247] - Client session timed out, have not heard from server in 20599ms for session id 0x0
2021-09-12 19:26:20,182 [myid:192.168.10.73:2181] - WARN  [main-SendThread(192.168.10.73:2181):ClientCnxn$SendThread@1290] - Session 0x0 for sever 192.168.10.73/192.168.10.73:2181, Closing socket connection. Attempting reconnect except it is a SessionExpiredException.
org.apache.zookeeper.ClientCnxn$SessionTimeoutException: Client session timed out, have not heard from server in 20599ms for session id 0x0
	at org.apache.zookeeper.ClientCnxn$SendThread.run(ClientCnxn.java:1248)
2021-09-12 19:26:40,606 [myid:192.168.10.72:2181] - INFO  [main-SendThread(192.168.10.72:2181):ClientCnxn$SendThread@1171] - Opening socket connection to server 192.168.10.72/192.168.10.72:2181.
2021-09-12 19:26:40,606 [myid:192.168.10.72:2181] - INFO  [main-SendThread(192.168.10.72:2181):ClientCnxn$SendThread@1173] - SASL config status: Will not attempt to authenticate using SASL (unknown error)
2021-09-12 19:26:40,611 [myid:192.168.10.72:2181] - INFO  [main-SendThread(192.168.10.72:2181):ClientCnxn$SendThread@1005] - Socket connection established, initiating session, client: /192.168.10.1:2467, server: 192.168.10.72/192.168.10.72:2181
2021-09-12 19:26:40,627 [myid:192.168.10.72:2181] - INFO  [main-SendThread(192.168.10.72:2181):ClientCnxn$SendThread@1438] - Session establishment complete on server 192.168.10.72/192.168.10.72:2181, session id = 0x200010e98900005, negotiated timeout = 4000
WatchedEvent state:SyncConnected type:None path:null
连接成功.
Thread-3  create....
Thread-2  create....
Thread-9  create....
Thread-4  create....
Thread-6  create....
Thread-0  create....
Thread-1  create....
Thread-5  create....
Thread-8  create....
Thread-7  create....
Thread-3  create node : /lock0000000001
Thread-0  create node : /lock0000000002
Thread-8  create node : /lock0000000003
Thread-1  create node : /lock0000000004
Thread-5  create node : /lock0000000005
Thread-6  create node : /lock0000000006
Thread-2  create node : /lock0000000007
Thread-7  create node : /lock0000000008
Thread-9  create node : /lock0000000009
Thread-4  create node : /lock0000000010
Thread-3 i am first....
Thread-3 working...
Thread-3 over work....
Thread-0 i am first....
Thread-0 working...
Thread-0 over work....
Thread-8 i am first....
Thread-8 working...
Thread-8 over work....
Thread-1 i am first....
Thread-1 working...
Thread-1 over work....
Thread-5 i am first....
Thread-5 working...
Thread-5 over work....
Thread-6 i am first....
Thread-6 working...
Thread-6 over work....
Thread-2 i am first....
Thread-2 working...
Thread-2 over work....
Thread-7 i am first....
Thread-7 working...
Thread-7 over work....
Thread-9 i am first....
Thread-9 working...
Thread-9 over work....
Thread-4 i am first....
Thread-4 working...
Thread-4 over work....
```

在程序执行的同时，从Zookeeper的Client端不断获取目录内容，看到整个过程大致是这样的：

当一个线程中的任务执行完之后，显示调用了`zk.delete(pathName, -1)`将节点删除。这样就能触发下一个正在watch它的节点所在的线程，去判断自己是不是在排名的第一个。

如果是第一个，开始干活
如果不是第一个，watch它的前一个（这种情况出现在前一个节点突然挂了的情况）
