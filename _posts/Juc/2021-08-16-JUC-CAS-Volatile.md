---
layout: post
title: 多线程与高并发二-CAS与volatile
categories: Juc
tags: Juc
keywords: 多线程与高并发二-CAS与volatile
date: 2021-08-16
---
# **volatile**

## volatile作用

保证线程的**可见性**，同时**禁止指令的重排序**

![valatile作用](/assets/img/Juc/JUC-CAS-Volatile/valatile-16289549133103.png)

### **可见性**

堆内存是所有线程共享里面的内存，除了共享的内存之外呢，每个线程都有自己的专属的区域，都有自己的工作内存，如果说在共享内存里有一个值的话，当我们线程，某一个线程都要去访问这个值的时候，会将这个值copy一份，copy到自己的这个工作空间里头，然后对

这个值的任何改变，首先是在自己的空间里进行改变，什么时候写回去，就是改完之后会马上写回去。什么时候去检查有没有新的值，也不好控制。在这个线程里面发生的改变，并没有及时的反应到另外一个线程里面，这就是线程之间的不可见 ，对这个变量值加了volatile之后就能够保证 一个线程的改变，另外一个线程马上就能看到。

```java
/**
 * volatile 关键字，使一个变量在多个线程间可见
 * A B线程都用到一个变量，java默认是A线程中保留一份copy，这样如果B线程修改了该变量，则A线程未必知道
 * 使用volatile关键字，会让所有线程都会读到变量的修改值
 * 
 * 在下面的代码中，running是存在于堆内存的t对象中
 * 当线程t1开始运行的时候，会把running值从内存中读到t1线程的工作区，在运行过程中直接使用这个copy，并不会每次都去
 * 读取堆内存，这样，当主线程修改running的值之后，t1线程感知不到，所以不会停止运行
 * 
 * 使用volatile，将会强制所有线程都去堆内存中读取running的值
 * 
 * 可以阅读这篇文章进行更深入的理解
 * http://www.cnblogs.com/nexiyi/p/java_memory_model_and_thread.html
 * 
 * volatile并不能保证多个线程共同修改running变量时所带来的不一致问题，也就是说volatile不能替代synchronized
 * @author mashibing
 */
package com.mashibing.juc.c_012_Volatile;

import java.util.concurrent.TimeUnit;

public class T01_HelloVolatile {
   /*volatile*/ boolean running = true; //对比一下有无volatile的情况下，整个程序运行结果的区别
   void m() {
      System.out.println("m start");
      while(running) {
      }
      System.out.println("m end!");
   }
   
   public static void main(String[] args) {
      T01_HelloVolatile t = new T01_HelloVolatile();
      
      new Thread(t::m, "t1").start();

      try {
         TimeUnit.SECONDS.sleep(1);
      } catch (InterruptedException e) {
         e.printStackTrace();
      }
      
      t.running = false;
   }
   
}
```

### **禁止指令重新排序**

指令重排序也是和cpu有关系，每次写都会被线程读到，加了volatile之后。cpu原来执行一条指令的时候它是一步一步的顺序的执行，但是现在的cpu为了提高效率，它会把指令并发的来执行，第一个指令执行到一半的时候第二个指令可能就已经开始执行了，这叫做流水线式的执行。

## DCL单例

new对象指令呢是分成四步 1.给指令申请内存 2.栈顶的内容做了个备份3.给成员变量初始化 4.是把这块内存的内容赋值给INSTANCE。既然有这个值了你在另外一个线程里头上来先去检查，你会发现这个值已经有了，你根本就不会进入锁那部分的代码。

```java
package com.mashibing.dp.singleton;

/**
 * lazy loading
 * 也称懒汉式
 * 虽然达到了按需初始化的目的，但却带来线程不安全的问题
 * 可以通过synchronized解决，但也带来效率下降
 */
public class Mgr06 {
    private static volatile Mgr06 INSTANCE; //JIT

    private Mgr06() {
    }

    public static Mgr06 getInstance() {
        if (INSTANCE == null) {
            //双重检查
            synchronized (Mgr06.class) {
                if(INSTANCE == null) {
                    try {
                        Thread.sleep(1);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    INSTANCE = new Mgr06();
                }
            }
        }
        return INSTANCE;
    }

    public void m() {
        System.out.println("m");
    }

    public static void main(String[] args) {
        for(int i=0; i<100; i++) {
            new Thread(()->{
                System.out.println(Mgr06.getInstance().hashCode());
            }).start();
        }
    }
}
```

## 保证不了原子性

```java
/**
 * volatile并不能保证多个线程共同修改running变量时所带来的不一致问题，也就是说volatile不能替代synchronized
 * 运行下面的程序，并分析结果
 * @author mashibing
 */
package com.mashibing.juc.c_012_Volatile;

import java.util.ArrayList;
import java.util.List;

public class T04_VolatileNotSync {
   volatile int count = 0;
   void m() {
      for(int i=0; i<10000; i++) count++;
   }
   
   public static void main(String[] args) {
      T04_VolatileNotSync t = new T04_VolatileNotSync();
      
      List<Thread> threads = new ArrayList<Thread>();
      
      for(int i=0; i<10; i++) {
         threads.add(new Thread(t::m, "thread-"+i));
      }
      
      threads.forEach((o)->o.start());
      
      threads.forEach((o)->{
         try {
            o.join();
         } catch (InterruptedException e) {
            e.printStackTrace();
         }
      });
      
      System.out.println(t.count);
      
      
   }
   
}
```

## 锁优化

```java
/**
 * synchronized优化
 * 同步代码块中的语句越少越好
 * 比较m1和m2
 * @author mashibing
 */
package com.mashibing.juc.c_016_LockOptimization;

import java.util.concurrent.TimeUnit;


public class FineCoarseLock {
   
   int count = 0;

   synchronized void m1() {
      //do sth need not sync
      try {
         TimeUnit.SECONDS.sleep(2);
      } catch (InterruptedException e) {
         e.printStackTrace();
      }
      //业务逻辑中只有下面这句需要sync，这时不应该给整个方法上锁
      count ++;
      
      //do sth need not sync
      try {
         TimeUnit.SECONDS.sleep(2);
      } catch (InterruptedException e) {
         e.printStackTrace();
      }
   }
   
   void m2() {
      //do sth need not sync
      try {
         TimeUnit.SECONDS.sleep(2);
      } catch (InterruptedException e) {
         e.printStackTrace();
      }
      //业务逻辑中只有下面这句需要sync，这时不应该给整个方法上锁
      //采用细粒度的锁，可以使线程争用时间变短，从而提高效率
      synchronized(this) {
         count ++;
      }
      //do sth need not sync
      try {
         TimeUnit.SECONDS.sleep(2);
      } catch (InterruptedException e) {
         e.printStackTrace();
      }
   }  
}
```

注意事项：

```
不要以字符串常量作为锁定对象
如果o变成另外一个对象，则锁定的对象发生改变。因此，以对象作为锁的时候不让它发生改变，加final。
```

## synchronized VS volatile

- synchronized锁的是对象而不得代码，锁方法锁的是this，锁static方法锁的是class，锁定方法和非锁定方法是可以同时执行的，锁升级从偏向锁到自旋锁到重量级锁

- volatile 保证线程的可见性，同时防止指令重排序。线程可见性在CPU的级别是用缓存一直性来保证的；禁止指令重排序CPU级别是你禁止不了的，那是人家内部运行的过程，提高效率的。但是在虚拟机级别你加volatile之后呢，这个指令重排序就可以禁止。严格来讲，还要去深究它的内部的话，它是加了读屏障和写屏障，这个是CPU的一个原语。

# CAS

![CAS](/assets/img/Juc/JUC-CAS-Volatile/CAS.png)

## AtomicInteger

```java
/**
 * 解决同样的问题的更高效的方法，使用AtomXXX类
 * AtomXXX类本身方法都是原子性的，但不能保证多个方法连续调用是原子性的
 * @author mashibing
 */
package com.mashibing.juc.c_018_00_AtomicXXX;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;


public class T01_AtomicInteger {
   /*volatile*/ //int count1 = 0;
   
   AtomicInteger count = new AtomicInteger(0); 

   /*synchronized*/ void m() { 
      for (int i = 0; i < 10000; i++)
         //if count1.get() < 1000
         count.incrementAndGet(); //count1++
   }

   public static void main(String[] args) {
      T01_AtomicInteger t = new T01_AtomicInteger();

      List<Thread> threads = new ArrayList<Thread>();

      for (int i = 0; i < 10; i++) {
         threads.add(new Thread(t::m, "thread-" + i));
      }

      threads.forEach((o) -> o.start());

      threads.forEach((o) -> {
         try {
            o.join();
         } catch (InterruptedException e) {
            e.printStackTrace();
         }
      });

      System.out.println(t.count);

   }

}
```

![casget](/assets/img/Juc/JUC-CAS-Volatile/casget.png)

![casget2](/assets/img/Juc/JUC-CAS-Volatile/casget2-16289555764085.png)

## Unsafe

<img src="/assets/img/Juc/JUC-CAS-Volatile/unsafe.png" alt="unsafe" style="zoom:80%;" />

## ABA问题

望值是1，准备变成2，这个对象Object，在这个过程中，没有一个线程改过我肯定是可以更改的，但是如果有一个线程先把这个1变成了2后来又变回1，中间值更改过，它不会影响我这个cas下面操作，这就是ABA问题。

这种问题怎么解决。如果是int类型的，最终值是你期望的，也没有关系，这种没关系可以不去管这个问题。如果你确实想管这个问题可以加版本号，做任何一个值的修改，修改完之后加一，后面检查的时候**连带版本号一起检查**。

如果是基础类型：无所谓。不影响结果值；如果是引用类型：后面的业务逻辑是不是还和原来保持一样，这就不好说了。

