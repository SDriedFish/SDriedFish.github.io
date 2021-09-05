---
layout: post
title: 多线程与高并发九-JMH及Disruptor
categories: Juc
tags: Juc
keywords: 多线程与高并发九-JMH及Disruptor
date: 2021-08-23
---

# JMH

![jmh](/assets/img/Juc/JUC-JMH-Disruptor/jmh-16289207537762.png)
## 官网

 http://openjdk.java.net/projects/code-tools/jmh/ 

## 创建JMH测试

1. 创建Maven项目，添加依赖

   ```java
   <?xml version="1.0" encoding="UTF-8"?>
   <project xmlns="http://maven.apache.org/POM/4.0.0"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
       <modelVersion>4.0.0</modelVersion>
   
       <properties>
           <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
           <encoding>UTF-8</encoding>
           <java.version>1.8</java.version>
           <maven.compiler.source>1.8</maven.compiler.source>
           <maven.compiler.target>1.8</maven.compiler.target>
       </properties>
   
       <groupId>mashibing.com</groupId>
       <artifactId>HelloJMH2</artifactId>
       <version>1.0-SNAPSHOT</version>
   
   
       <dependencies>
           <!-- https://mvnrepository.com/artifact/org.openjdk.jmh/jmh-core -->
           <dependency>
               <groupId>org.openjdk.jmh</groupId>
               <artifactId>jmh-core</artifactId>
               <version>1.21</version>
           </dependency>
   
           <!-- https://mvnrepository.com/artifact/org.openjdk.jmh/jmh-generator-annprocess -->
           <dependency>
               <groupId>org.openjdk.jmh</groupId>
               <artifactId>jmh-generator-annprocess</artifactId>
               <version>1.21</version>
               <scope>test</scope>
           </dependency>
       </dependencies>
   
   
   </project>
   ```

2. idea安装JMH插件 JMH plugin v1.0.3

3. 由于用到了注解，打开运行程序注解配置

   > compiler -> Annotation Processors -> Enable Annotation Processing

4. 定义需要测试类PS (ParallelStream)

   ```java
   package com.mashibing.jmh;
   
   import java.util.ArrayList;
   import java.util.List;
   import java.util.Random;
   
   public class PS {
   
   	static List<Integer> nums = new ArrayList<>();
   	static {
   		Random r = new Random();
   		for (int i = 0; i < 10000; i++) nums.add(1000000 + r.nextInt(1000000));
   	}
   
   	static void foreach() {
   		nums.forEach(v->isPrime(v));
   	}
   
   	static void parallel() {
   		nums.parallelStream().forEach(PS::isPrime);
   	}
   	
   	static boolean isPrime(int num) {
   		for(int i=2; i<=num/2; i++) {
   			if(num % i == 0) return false;
   		}
   		return true;
   	}
   }
   ```

5. 写单元测试

   > 这个测试类一定要在test package下面  写

   ```java
   package com.mashibing.jmh;
   
   import org.openjdk.jmh.annotations.Benchmark;
   
   import static org.junit.jupiter.api.Assertions.*;
   
   public class PSTest {
    @Benchmark
    public void testForEach() {
        PS.foreach();
    }
   }
   ```

6. 运行测试类，如果遇到下面的错误：

   ```java
   ERROR: org.openjdk.jmh.runner.RunnerException: ERROR: Exception while trying to acquire the JMH lock (C:\WINDOWS\/jmh.lock): C:\WINDOWS\jmh.lock (拒绝访问。), exiting. Use -Djmh.ignoreLock=true to forcefully continue.
   	at org.openjdk.jmh.runner.Runner.run(Runner.java:216)
   	at org.openjdk.jmh.Main.main(Main.java:71)
   ```

   这个错误是因为JMH运行需要访问系统的TMP目录，解决办法是：

   打开RunConfiguration -> Environment Variables -> include system environment viables

7. 阅读测试报告

## JMH中的基本概念

1. Warmup
   预热，由于JVM中对于特定代码会存在优化（本地化），预热对于测试结果很重要
2. Mesurement
   总共执行多少次测试
3. Timeout
   
4. Threads
   线程数，由fork指定
5. Benchmark mode
   基准测试的模式
6. Benchmark
   测试哪一段代码

## Next

官方样例：http://hg.openjdk.java.net/code-tools/jmh/file/tip/jmh-samples/src/main/java/org/openjdk/jmh/samples/

# Disruptor

内存里的高效队列

![disruptor](/assets/img/Juc/JUC-JMH-Disruptor/disruptor-16289430880931.png)

## 介绍

主页：http://lmax-exchange.github.io/disruptor/

源码：https://github.com/LMAX-Exchange/disruptor

GettingStarted: https://github.com/LMAX-Exchange/disruptor/wiki/Getting-Started

api: http://lmax-exchange.github.io/disruptor/docs/index.html

maven: https://mvnrepository.com/artifact/com.lmax/disruptor

## Disruptor的特点

对比ConcurrentLinkedQueue : 链表实现

JDK中没有ConcurrentArrayQueue

Disruptor是数组实现的

无锁，高并发，使用环形Buffer，直接覆盖（不用清除）旧的数据，降低GC频率

实现了基于事件的生产者消费者模式（观察者模式）

## RingBuffer

环形队列

RingBuffer的序号，指向下一个可用的元素

采用数组实现，没有首尾指针

对比ConcurrentLinkedQueue，用数组实现的速度更快

> 假如长度为8，当添加到第12个元素的时候在哪个序号上呢？用12%8决定
>
> 当Buffer被填满的时候到底是覆盖还是等待，由Producer决定
>
> 长度设为2的n次幂，利于二进制计算，例如：12%8 = 12 & (8 - 1)  pos = num & (size -1)

![disruptor1](/assets/img/Juc/JUC-JMH-Disruptor/disruptor1.png)

## Disruptor开发步骤

1. 定义Event - 队列中需要处理的元素

2. 定义Event工厂，用于填充队列

   > 这里牵扯到效率问题：disruptor初始化的时候，会调用Event工厂，对ringBuffer进行内存的提前分配
   >
   > GC产生频率会降低

3. 定义EventHandler（消费者），处理容器中的元素

4. ThreadFactory :生产者的线程工厂

   ```java
   /**
    *
    * @param event
    * @param sequence RingBuffer的序号
    * @param endOfBatch 是否为最后一个元素
    * @throws Exception
    */
   @Override
   public void onEvent(LongEvent event, long sequence, boolean endOfBatch) throws Exception {
       count ++;
       System.out.println("[" + Thread.currentThread().getName() + "]" + event + " 序号：" + sequence);
   }
   ```

   ```java
   // Construct the Disruptor
   Disruptor<LongEvent> disruptor = new Disruptor<>(factory, bufferSize, Executors.defaultThreadFactory());
   ```

## 事件发布模板

```java
long sequence = ringBuffer.next();  // Grab the next sequence
try {
    LongEvent event = ringBuffer.get(sequence); // Get the entry in the Disruptor
    // for the sequence
    event.set(8888L);  // Fill with data
} finally {
    ringBuffer.publish(sequence);
}
```

## 使用EventTranslator发布事件

```java
        EventTranslator<LongEvent> translator1 = new EventTranslator<LongEvent>() {
            @Override
            public void translateTo(LongEvent event, long sequence) {
                event.set(8888L);
            }
        };

        ringBuffer.publishEvent(translator1);

        //===============================================================
        EventTranslatorOneArg<LongEvent, Long> translator2 = new EventTranslatorOneArg<LongEvent, Long>() {
            @Override
            public void translateTo(LongEvent event, long sequence, Long l) {
                event.set(l);
            }
        };

        //===============================================================
        EventTranslatorVararg<LongEvent> translator5 = new EventTranslatorVararg<LongEvent>() {

            @Override
            public void translateTo(LongEvent event, long sequence, Object... objects) {
                long result = 0;
                for(Object o : objects) {
                    long l = (Long)o;
                    result += l;
                }
                event.set(result);
            }
        };

        ringBuffer.publishEvent(translator5, 10000L, 10000L, 10000L, 10000L);
```

## 使用Lamda表达式发布事件

```java
package com.mashibing.disruptor;

import com.lmax.disruptor.RingBuffer;
import com.lmax.disruptor.dsl.Disruptor;
import com.lmax.disruptor.util.DaemonThreadFactory;

public class Main03
{
    public static void main(String[] args) throws Exception
    {
        // Specify the size of the ring buffer, must be power of 2.
        int bufferSize = 1024;

        // Construct the Disruptor
        Disruptor<LongEvent> disruptor = new Disruptor<>(LongEvent::new, bufferSize, DaemonThreadFactory.INSTANCE);

        // Connect the handler
        disruptor.handleEventsWith((event, sequence, endOfBatch) -> System.out.println("Event: " + event));

        // Start the Disruptor, starts all threads running
        disruptor.start();

        // Get the ring buffer from the Disruptor to be used for publishing.
        RingBuffer<LongEvent> ringBuffer = disruptor.getRingBuffer();


        ringBuffer.publishEvent((event, sequence) -> event.set(10000L));

        System.in.read();
    }
}
```

## ProducerType生产者线程模式

> ProducerType有两种模式 Producer.MULTI和Producer.SINGLE
>
> 默认是MULTI，表示在多线程模式下产生sequence,如果确认是单线程生产者，那么可以指定SINGLE，效率会提升
>
> 如果是多个生产者（多线程），但模式指定为SINGLE，会出什么问题呢？消息覆盖

多消费者

```java
// Connect the handlers
LongEventHandler h1 = new LongEventHandler();
LongEventHandler h2 = new LongEventHandler();
disruptor.handleEventsWith(h1, h2);
```

## 等待策略

1. (常用）BlockingWaitStrategy：通过线程阻塞的方式，等待生产者唤醒，被唤醒后，再循环检查依赖的sequence是否已经消费。

2. BusySpinWaitStrategy：线程一直自旋等待，可能比较耗cpu

3. LiteBlockingWaitStrategy：线程阻塞等待生产者唤醒，与BlockingWaitStrategy相比，区别在signalNeeded.getAndSet,如果两个线程同时访问一个访问waitfor,一个访问signalAll时，可以减少lock加锁次数.
4. LiteTimeoutBlockingWaitStrategy：与LiteBlockingWaitStrategy相比，设置了阻塞时间，超过时间后抛异常。

5. PhasedBackoffWaitStrategy：根据时间参数和传入的等待策略来决定使用哪种等待策略

6. TimeoutBlockingWaitStrategy：相对于BlockingWaitStrategy来说，设置了等待时间，超过后抛异常

7. （常用）YieldingWaitStrategy：尝试100次，然后Thread.yield()让出cpu

8. （常用）SleepingWaitStrategy : sleep

## 消费者异常处理

默认：disruptor.setDefaultExceptionHandler()

覆盖：disruptor.handleExceptionFor().with()

```java
disruptor.handleExceptionsFor(h1).with(new ExceptionHandler<LongEvent>() {
    @Override
    public void handleEventException(Throwable throwable, long l, LongEvent longEvent) {
        System.out.println("exception");
        //throwable.printStackTrace();
    }

    @Override
    public void handleOnStartException(Throwable throwable) {
        System.out.println("Exception Start to Handle!");
    }

    @Override
    public void handleOnShutdownException(Throwable throwable) {
        System.out.println("Exception Handled!");
    }
});
```

