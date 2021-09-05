---
layout: post
title: JVM4-内存布局
categories: Jvm
tags: Jvm
keywords: JVM4-内存布局
date: 2021-08-27
---

# Java并发内存模型

![image-20210815182335940](/assets/img/Jvm/JVM-Object/image-20210815182335940.png)



# 使用JavaAgent测试Object的大小

## 对象大小（64位机）

### 观察虚拟机配置

java -XX:+PrintCommandLineFlags -version

```
-XX:InitialHeapSize=133199488 -XX:MaxHeapSize=2131191808 -XX:+PrintCommandLineFlags -XX:+UseCompressedClassPointers -XX:+UseCompressedOops -XX:-UseLargePagesIndividualAllocation -XX:+UseParallelGC
java version "1.8.0_171"
Java(TM) SE Runtime Environment (build 1.8.0_171-b11)
Java HotSpot(TM) 64-Bit Server VM (build 25.171-b11, mixed mode)
```

# **对象的内存布局**

在HotSpot虚拟机里，对象在堆内存中的存储布局可以划分为三个部分：对象头（Header）、实例数据（Instance Data）和对齐填充（Padding）。

### 普通对象

1. 对象头：markword  8  **ClassPointer指针**：-XX:+UseCompressedClassPointers 为4字节 不开启为8字节

   > HotSpot虚拟机对象的对象头部分包括两类信息。第一类是用于存储对象**自身的运行时数据**，如**哈希（HashCode）、GC分代年龄、锁状态标志、线程持有的锁、偏向线程ID、偏向时间戳等**，这部分数据的长度在32位和64位的虚拟机（未开启压缩指针）中分别为32个比特和64个比特，官方称它 为“**Mark Word**”。对象头的另外一部分是**类型指针**，即对象指向它的类型元数据的指针。此外，如果对象是一个Java数组，那在对象头中还必须有一块用于**记录数组长度的数据**。

2. 实例数据
   1. 引用类型：-XX:+UseCompressedOops 为4字节 不开启为8字节 
      Oops Ordinary Object Pointers

3. Padding对齐，8的倍数

   ![image-20210815190513174](/assets/img/Jvm/JVM-Object/image-20210815190513174.png)

### 数组对象

1. 对象头：**markword** 8  **ClassPointer指针**同上  **数组长度**：4字节

2. 数组数据

3. 对齐 8的倍数

   ![image-20210815183317017](/assets/img/Jvm/JVM-Object/image-20210815183317017.png)

## 实验

1. 新建项目ObjectSize （1.8）

2. 创建文件ObjectSizeAgent

   ```java
   package com.mashibing.jvm.agent;
   
   import java.lang.instrument.Instrumentation;
   
   public class ObjectSizeAgent {
       private static Instrumentation inst;
   
       public static void premain(String agentArgs, Instrumentation _inst) {
           inst = _inst;
       }
   
       public static long sizeOf(Object o) {
           return inst.getObjectSize(o);
       }
   }
   ```

3. src目录下创建META-INF/MANIFEST.MF

   ```java
   Manifest-Version: 1.0
   Created-By: mashibing.com
   Premain-Class: com.mashibing.jvm.agent.ObjectSizeAgent
   ```

   注意Premain-Class这行必须是新的一行（回车 + 换行），确认idea不能有任何错误提示

4. 打包jar文件

5. 在需要使用该Agent Jar的项目中引入该Jar包
   project structure - project settings - library 添加该jar包

6. 运行时需要该Agent Jar的类，加入参数：

   ```java
   -javaagent:C:\work\ijprojects\ObjectSize\out\artifacts\ObjectSize_jar\ObjectSize.jar
   ```

7. 如何使用该类：

   ```java
   package com.mashibing.jvm.c3_jmm;
   
   import com.mashibing.jvm.agent.ObjectSizeAgent;
   
   public class T03_SizeOfAnObject {
       public static void main(String[] args) {
           System.out.println(ObjectSizeAgent.sizeOf(new Object()));
           System.out.println(ObjectSizeAgent.sizeOf(new int[] {}));
           System.out.println(ObjectSizeAgent.sizeOf(new P()));
       }
   
       //一个Object占多少个字节
       // -XX:+UseCompressedClassPointers -XX:+UseCompressedOops
       // Oops = ordinary object pointers
       private static class P {
                           //8 _markword
                           //4 _class pointer
           int id;         //4
           String name;    //4
           int age;        //4
   
           byte b1;        //1
           byte b2;        //1
   
           Object o;       //4
           byte b3;        //1
   
       }
   }
   
   
   ```

```
16
16
32

Process finished with exit code 0
```

![image-20210815190613557](/assets/img/Jvm/JVM-Object/image-20210815190613557.png)

## Hotspot开启内存压缩的规则（64位机）

1. 4G以下，直接砍掉高32位
2. 4G - 32G，默认开启内存压缩 ClassPointers Oops
3. 32G，压缩无效，使用64位
   内存并不是越大越好（^-^）

## 对象定位

https://blog.csdn.net/clover_lily/article/details/80095580

1. 句柄池
2. 直接指针

## 分配过程

![对象分配过程详解](/assets/img/Jvm/JVM-Object/feipeiguocheng.png)