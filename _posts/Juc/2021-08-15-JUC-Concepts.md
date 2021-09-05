---
layout: post
title: 多线程与高并发一-线程基础
categories: Juc
tags: Juc
keywords: 多线程与高并发一-线程基础
date: 2021-08-15
---
# 多线程

## 基本概念

什么是叫一个进程？ 什么叫一个线程？

Program app ->QQ.exe

**进程：**做一个简单的解释，你的硬盘上有一个简单的程序，这个程序叫QQ.exe，这是一个程序，

这个程序是一个静态的概念，它被扔在硬盘上也没人理他，但是当你双击它，弹出一个界面输入账

号密码登录进去了，OK，这个时候叫做一个进程。进程相对于程序来说它是一个动态的概念

**线程：**作为一个进程里面最小的执行单元它就叫一个线程，用简单的话讲一个程序里不同的执行路

径就叫做一个线程

<img src="/assets/img/Juc/JUC-Concepts/基础概念.png" alt="基础概念" style="zoom:80%;" />

## **创建线程的几种方式**

```java
public class T02_HowToCreateThread {
    static class MyThread extends Thread {
        @Override
        public void run() {
            System.out.println("Hello MyThread!");
        }
    }

    static class MyRun implements Runnable {
        @Override
        public void run() {
            System.out.println("Hello MyRun!");
        }
    }

    public static void main(String[] args) {
        new MyThread().start();
        new Thread(new MyRun()).start();
        new Thread(()->{
            System.out.println("Hello Lambda!");
        }).start();
    }

}
```

## 几个线程的方法

```java
package com.mashibing.juc.c_000;

public class T03_Sleep_Yield_Join {
    public static void main(String[] args) {
//        testSleep();
//        testYield();
        testJoin();
    }

    /*Sleep,意思就是睡眠，当前线程暂停一段时间让给别的线程去运行。Sleep是怎么复活的？由你的睡眠时间而定，等睡眠到规定的时间自动复活*/
    static void testSleep() {
        new Thread(()->{
            for(int i=0; i<100; i++) {
                System.out.println("A" + i);
                try {
                    Thread.sleep(500);
                    //TimeUnit.Milliseconds.sleep(500)
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }

 /*Yield,就是当前线程正在执行的时候停止下来进入等待队列，回到等待队列里在系统的调度算 法里头呢还是依然有可能把你刚回去的这个线程拿回来继续执行， 当然，更大的可能性是把原来等待的那些拿 出一个来执行，所以yield的意思是我让出一下CPU，后面你们能不能抢到那我不管*/
    static void testYield() {
        new Thread(()->{
            for(int i=0; i<100; i++) {
                System.out.println("A" + i);
                if(i%10 == 0) Thread.yield();


            }
        }).start();

        new Thread(()->{
            for(int i=0; i<100; i++) {
                System.out.println("------------B" + i);
                if(i%10 == 0) Thread.yield();
            }
        }).start();
    }
    /*join， 意思就是在自己当前线程加入你调用Join的线程（），本线程等待。等调用的线程运行 完了，自己再去执行。t1和t2两个线程，
    在t1的某个点上调用了t2.join,它会跑到t2去运行，t1等待t2运 行完毕继续t1运行（自己join自己没有意义） */
    static void testJoin() {
        Thread t1 = new Thread(()->{
            for(int i=0; i<100; i++) {
                System.out.println("A" + i);
                try {
                    Thread.sleep(500);
                    //TimeUnit.Milliseconds.sleep(500)
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });

        Thread t2 = new Thread(()->{

            try {
                t1.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            for(int i=0; i<100; i++) {
                System.out.println("A" + i);
                try {
                    Thread.sleep(500);
                    //TimeUnit.Milliseconds.sleep(500)
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });

        t1.start();
        t2.start();
    }
}

```

## **线程状态**

![线程状态](/assets/img/Juc/JUC-Concepts/线程状态.png)

> 当我们new一个线程时，还没有调用start()该线程处于新建状态线程对象调用 start()方法时候，他会被线程调度器来执行，也就是交给操作系统来执行了，那么操作系统来执行的时候，这整个的状态叫Runnable，Runnable内部有两个状态**(1)Ready就绪状态(2)Running运行状态**。就绪状态是说扔到CPU的等待队列里面去排队等待CPU运行，等真正扔到CPU上去运行的时候才叫Running运行状态。（调用yiled时候会从Running状态跑到Ready状态去，线
> 程配调度器选中执行的时候又从Ready状态跑到Running状态去）如果你线程顺利的执行完了就会进去 **(3)Teminated结束状态**，（需要注意Teminated完了之后还可不可以回到new状态再调用start？这是不行的，完了这就是结束了）在Runnable这个状态里头还有其他一些状态的变迁**(4)TimedWaiting等待、(5)Waiting等待、(6)Blocked阻塞**，在同步代码块的情况就下没得到锁就会阻塞状态，获得锁的时候是就绪状态运行。在运行的时候如果调用了o.wait()、t.join()、LockSupport.park()进入Waiting状态，调用o.notify()、o.notifiAll()、LockSupport.unpark()就又回到Running状态。TimedWaiting按照时间等待，等时间结束自己就回去了，Thread.sleep(time)、o.wait(time)、t.jion(time)、LockSupport.parkNanos()、LockSupport.parkUntil()这些都是关于时间等待的方法。

```java
package com.mashibing.juc.c_000;

public class T04_ThreadState {

    static class MyThread extends Thread {

        @Override

        public void run() {

            System.out.println(this.getState());

            for (int i = 0; i < 10; i++) {

                try {

                    Thread.sleep(500);

                } catch (InterruptedException e) {

                    e.printStackTrace();

                }

                System.out.println(i);

            }

        }

    }

    public static void main(String[] args) {

        Thread t = new MyThread();

    //怎么样得到这个线程的状态呢？就是通过getState()这个方法

        System.out.println(t.getState());//他是一个new状态

        t.start();//到这start完了之后呢是Runnable的状态

        try {

            t.join();

        } catch (InterruptedException e) {

            e.printStackTrace();

        }

    //然后join之后，结束了是一个Timenated状态

        System.out.println(t.getState());

    }

}
```

# Syncronized

为什么要上锁呢？访问某一段代码或者某临界资源的时候是需要有一把锁的概念在这儿的。

给一个变量/一段代码**加锁**的含义是：线程**拿到锁之后**，才能修改一个变量/执行一段代码。

## synchronized(o)

```java
package com.mashibing.juc.c_001;

public class T {
   
   private int count = 10;
   private Object o = new Object();
   
   public void m() {
      synchronized(o) { //任何线程要执行下面的代码，必须先拿到o的锁
         count--;
         System.out.println(Thread.currentThread().getName() + " count = " + count);
      }
   }
   
}
```

如果说你每次都定义个一个锁的对象Object o 把它new出来那加锁的时候太麻烦每次都要new一个新的对象出来，所以呢，有一个简单的方式就是**synchronized(this)**锁定当前对象就行

## synchronized(this)

如果你要是锁定当前对象

```java
package com.mashibing.juc.c_002;

public class T {
   
   private int count = 10;
   
   public void m() {
      synchronized(this) { //任何线程要执行下面的代码，必须先拿到this的锁
         count--;
         System.out.println(Thread.currentThread().getName() + " count = " + count);
      }
   }
   
}
```



```
public class T {

   private int count = 10;
   
   public synchronized void m() { //等同于在方法的代码执行时要synchronized(this)
      count--;
      System.out.println(Thread.currentThread().getName() + " count = " + count);
   }


}
```

## synchronized(T.class)

synchronized(T.class)锁的就是T类的对象

```java
public class T {

   private static int count = 10;
   
   public synchronized static void m() { //这里等同于synchronized(FineCoarseLock.class)
      count--;
      System.out.println(Thread.currentThread().getName() + " count = " + count);
   }
   
   public static void mm() {
      synchronized(T.class) { //考虑一下这里写synchronized(this)是否可以？
         count --;
      }
   }

}
```

## **同步方法和非同步方法是否可以同时调用？**

```java
/**
 * 同步和非同步方法是否可以同时调用？
 * @author mashibing
 */

package com.mashibing.juc.c_007;

public class T {

   public synchronized void m1() { 
      System.out.println(Thread.currentThread().getName() + " m1 start...");
      try {
         Thread.sleep(10000);
      } catch (InterruptedException e) {
         e.printStackTrace();
      }
      System.out.println(Thread.currentThread().getName() + " m1 end");
   }
   
   public void m2() {
      try {
         Thread.sleep(5000);
      } catch (InterruptedException e) {
         e.printStackTrace();
      }
      System.out.println(Thread.currentThread().getName() + " m2 ");
   }
   
   public static void main(String[] args) {
      T t = new T();

      new Thread(t::m1, "t1").start();
      new Thread(t::m2, "t2").start();

   }
   
}
```

## 原子性与可见性

synchronized既保证了原子性，又保证了可见性。

```java
/**
 * 分析一下这个程序的输出
 *
 * @author mashibing
 */

package com.mashibing.juc.c_005;

public class T implements Runnable {

    private /*volatile*/ int count = 100;

    public synchronized void run() {
        count--;
        System.out.println(Thread.currentThread().getName() + " count = " + count);
    }

    public static void main(String[] args) {
        T t = new T();
        for (int i = 0; i < 100; i++) {
            new Thread(t, "THREAD" + i).start();
        }
    }
   
}
```

## 可重入

```java
/**
 * 一个同步方法可以调用另外一个同步方法，一个线程已经拥有某个对象的锁，再次申请的时候仍然会得到该对象的锁.
 * 也就是说synchronized获得的锁是可重入的
 * @author mashibing
 */
package com.mashibing.juc.c_009;

import java.util.concurrent.TimeUnit;

public class T {
   synchronized void m1() {
      System.out.println("m1 start");
      try {
         TimeUnit.SECONDS.sleep(1);
      } catch (InterruptedException e) {
         e.printStackTrace();
      }
      m2();
      System.out.println("m1 end");
   }
   
   synchronized void m2() {
      try {
         TimeUnit.SECONDS.sleep(2);
      } catch (InterruptedException e) {
         e.printStackTrace();
      }
      System.out.println("m2");
   }

   public static void main(String[] args) {
      new T().m1();
   }
}
```

模拟一个父类子类的概念，父类synchronized，子类调用super.m的时候必须得可重入，否则就会出问题（调用父类是同一把锁）。所谓的重入锁就是你拿到这把锁之后不停加锁加锁，加好几道，但锁定的还是同一个对象，去一道就减个1，就是这么个概念。

```java
package com.mashibing.juc.c_010;

import java.util.concurrent.TimeUnit;

public class T {
   synchronized void m() {
      System.out.println("m start");
      try {
         TimeUnit.SECONDS.sleep(1);
      } catch (InterruptedException e) {
         e.printStackTrace();
      }
      System.out.println("m end");
   }
   
   public static void main(String[] args) {
      new TT().m();
   }
   
}

class TT extends T {
   @Override
   synchronized void m() {
      System.out.println("child m start");
      super.m();
      System.out.println("child m end");
   }
}
```

## 异常锁

```java
/**
 * 程序在执行过程中，如果出现异常，默认情况锁会被释放
 * 所以，在并发处理的过程中，有异常要多加小心，不然可能会发生不一致的情况。
 * 比如，在一个web app处理过程中，多个servlet线程共同访问同一个资源，这时如果异常处理不合适，
 * 在第一个线程中抛出异常，其他线程就会进入同步代码区，有可能会访问到异常产生时的数据。
 * 因此要非常小心的处理同步业务逻辑中的异常
 * @author mashibing
 */
package com.mashibing.juc.c_011;

import java.util.concurrent.TimeUnit;

public class T {
   int count = 0;
   synchronized void m() {
      System.out.println(Thread.currentThread().getName() + " start");
      while(true) {
         count ++;
         System.out.println(Thread.currentThread().getName() + " count = " + count);
         try {
            TimeUnit.SECONDS.sleep(1);
            
         } catch (InterruptedException e) {
            e.printStackTrace();
         }
         
         if(count == 5) {
            int i = 1/0; //此处抛出异常，锁将被释放，要想不被释放，可以在这里进行catch，然后让循环继续
            System.out.println(i);
         }
      }
   }
   
   public static void main(String[] args) {
      T t = new T();
      Runnable r = new Runnable() {

         @Override
         public void run() {
            t.m();
         }
         
      };
      new Thread(r, "t1").start();
      
      try {
         TimeUnit.SECONDS.sleep(3);
      } catch (InterruptedException e) {
         e.printStackTrace();
      }
      
      new Thread(r, "t2").start();
   }
   
}
```

## synchronized应用的例子-脏读

```java
/**
 * 面试题：模拟银行账户
 * 对业务写方法加锁
 * 对业务读方法不加锁
 * 这样行不行？
 *
 * 容易产生脏读问题（dirtyRead）
 */

package com.mashibing.juc.c_008;

import java.util.concurrent.TimeUnit;

public class Account {
   String name;
   double balance;
   
   public synchronized void set(String name, double balance) {
      this.name = name;

      try {
         Thread.sleep(2000);
      } catch (InterruptedException e) {
         e.printStackTrace();
      }

      
      this.balance = balance;
   }
   
   public /*synchronized*/ double getBalance(String name) {
      return this.balance;
   }
   
   
   public static void main(String[] args) {
      Account a = new Account();
      new Thread(()->a.set("zhangsan", 100.0)).start();
      
      try {
         TimeUnit.SECONDS.sleep(1);
      } catch (InterruptedException e) {
         e.printStackTrace();
      }
      
      System.out.println(a.getBalance("zhangsan"));
      
      try {
         TimeUnit.SECONDS.sleep(2);
      } catch (InterruptedException e) {
         e.printStackTrace();
      }
      
      System.out.println(a.getBalance("zhangsan"));
   }
}
```

## **synchronized**的底层实现

```markdown
synchronized的底层实现
JDK早期的 重量级 - OS
后来的改进
锁升级的概念：
    我就是厕所所长 （一 二）

sync (Object)
markword 记录这个线程ID （偏向锁）
如果线程争用：升级为 自旋锁
10次以后，
升级为重量级锁 - OS

执行时间短（加锁代码），线程数少，用自旋
执行时间长，线程数多，用系统锁
```

