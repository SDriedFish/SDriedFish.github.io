---
layout: post
title: 多线程与高并发七-线程池
categories: Juc
tags: Juc
keywords: 多线程与高并发七-线程池
date: 2021-08-21
---
**面试题**

```shell
//要求用线程顺序打印A1B2C3....Z26
```

LockSupport

```java
public class T02_00_LockSupport {


    static Thread t1 = null, t2 = null;

    public static void main(String[] args) throws Exception {
        char[] aI = "1234567".toCharArray();
        char[] aC = "ABCDEFG".toCharArray();

        t1 = new Thread(() -> {

                for(char c : aI) {
                    System.out.print(c);
                    LockSupport.unpark(t2); //叫醒T2
                    LockSupport.park(); //T1阻塞
                }

        }, "t1");

        t2 = new Thread(() -> {

            for(char c : aC) {
                LockSupport.park(); //t2阻塞
                System.out.print(c);
                LockSupport.unpark(t1); //叫醒t1
            }

        }, "t2");

        t1.start();
        t2.start();
    }
}
```

**sync-wait-notify**

```java
public class T06_00_sync_wait_notify {
    public static void main(String[] args) {
        final Object o = new Object();

        char[] aI = "1234567".toCharArray();
        char[] aC = "ABCDEFG".toCharArray();

        new Thread(()->{
            synchronized (o) {
                for(char c : aI) {
                    System.out.print(c);
                    try {
                        o.notify();
                        o.wait(); //让出锁
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }

                o.notify(); //必须，否则无法停止程序
            }

        }, "t1").start();

        new Thread(()->{
            synchronized (o) {
                for(char c : aC) {
                    System.out.print(c);
                    try {
                        o.notify();
                        o.wait();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }

                o.notify();
            }
        }, "t2").start();
    }
}
```

# 线程池

## 三个接口

![三个接口](/assets/img/Juc/JUC-ThreadPool/sange.png)

![executor](/assets/img/Juc/JUC-ThreadPool/executor.png)

## 相关接口及类

**Callable**

> 类似Runnable  有返回值


```java
@FunctionalInterface
public interface Callable<V> {
    /**
     * Computes a result, or throws an exception if unable to do so.
     *
     * @return computed result
     * @throws Exception if unable to compute a result
     */
    V call() throws Exception;
}
```

**Future**

> 存储执行的将来才产生的结果

```java
Future<String> future = service.submit(c); //异步
System.out.println(future.get());//阻塞
```

**FutureTask**

> 有返回值的任务，Runnable 与Future结合

**CompletableFuture**

> 可以管理一堆Future结果   allOf  等待所有任务结束   anyOf  等待任一任务结束
>
> 可用场景:  提供服务查询各大电商网站同一类产品的价格并汇总展示

```java
CompletableFuture<Double> futureTM = CompletableFuture.supplyAsync(()->priceOfTM());
CompletableFuture<Double> futureTB = CompletableFuture.supplyAsync(()->priceOfTB());
CompletableFuture<Double> futureJD = CompletableFuture.supplyAsync(()->priceOfJD());

CompletableFuture.allOf(futureTM, futureTB, futureJD).join();
```

## 两类线程池

<img src="/assets/img/Juc/JUC-ThreadPool/class.png" alt="线程池类" style="zoom:80%;" />

一个线程池维护两个集合（用的HashSet），一个集合是一个个任务，一个集合是一个个线程。

<img src="/assets/img/Juc/JUC-ThreadPool/pool.png" alt="线程池" style="zoom:80%;" />

### 七个参数

> corePoolSize: 核心线程数 ，一直在线程池中
>
> maximumPoolSize：最大线程数
>
>  keepAliveTime  unit:  空闲时间，空闲线程隔多长时间归还OS
>
> workQueue：任务队列
>
> threadFactory：生产线程的方法(阿里手册：必须指定有意义线程名称  jstack排查)
>
> RejectedExecutionHandler：拒绝策略,线程池忙且任务队列慢则执行拒绝策略，实际一般自定义拒绝策略

```java
ThreadPoolExecutor tpe = new ThreadPoolExecutor(2, 4,
        60, TimeUnit.SECONDS,
        new ArrayBlockingQueue<Runnable>(4),
        Executors.defaultThreadFactory(),
        new ThreadPoolExecutor.CallerRunsPolicy());
```

**拒绝策略**

![拒绝策略](/assets/img/Juc/JUC-ThreadPool/RejectedExecutionHandler.png)

### 线程池流程

![线程池流程](/assets/img/Juc/JUC-ThreadPool/progress.png)
