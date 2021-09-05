---
layout: post
title: JVM5-运行时数据
categories: Jvm
tags: Jvm
keywords: JVM5-运行时数据
date: 2021-08-28
---

# 运行时数据区的构成

![image-20210815191354673](/assets/img/Jvm/JVM-RuntimeDataArea/image-20210815191354673.png)

**PC 程序计数器**

> 存放指令位置
>
> 虚拟机的运行，类似于这样的循环：
>
> while( not end ) {
>
> ​	取PC中的位置，找到对应位置的指令；
>
> ​	执行该指令；
>
> ​	PC ++;
>
> }

**JVM Stack**

1. Frame - 每个方法对应一个栈帧
   1. Local Variable Table
   
   2. Operand Stack
      对于long的处理（store and load），多数虚拟机的实现都是原子的
      jls 17.7，没必要加volatile
      
   3. Dynamic Linking
       https://blog.csdn.net/qq_41813060/article/details/88379473 
      jvms 2.6.3
      
   4. return address
      a() -> b()，方法a调用了方法b, b方法的返回值放在什么地方
      
      <img src="/assets/img/Jvm/JVM-RuntimeDataArea/image-20210815191958912.png" alt="image-20210815191958912" style="zoom:50%;" />
      
      <img src="/assets/img/Jvm/JVM-RuntimeDataArea/image-20210815191818443.png" alt="image-20210815191818443" style="zoom:50%;" />

**Heap**   

> 所有线程共享同一个堆空间。
> 堆空间是用来存放所有类实例和数组空间分配的运行时数据区。

**Method Area**   所有线程共享同一个方法区，方法区用来存放 per-class structors

1. Perm Space (<1.8)
   字符串常量位于PermSpace
   FGC不会清理
   大小启动的时候指定，不能变
2. Meta Space (>=1.8)
   字符串常量位于堆
   会触发FGC清理
   不设定的话，最大就是物理内存

**Runtime Constant Pool**

<img src="/assets/img/Jvm/JVM-RuntimeDataArea/image-20210815192113154.png" alt="image-20210815192113154" style="zoom: 80%;" />

**Native Method Stack**  

<img src="/assets/img/Jvm/JVM-RuntimeDataArea/image-20210815192153671.png" alt="image-20210815192153671" style="zoom:80%;" />

**Direct Memory**  直接内存，JVM可以直接访问内核空间的内存（OS管理的内存），零拷贝（不需要拷贝），NIO用到了，提高效率

> JVM可以直接访问的内核空间的内存 (OS 管理的内存)
>
> NIO ， 提高效率，实现zero copy



<img src="/assets/img/Jvm/JVM-RuntimeDataArea/image-20210815192205755.png" alt="image-20210815192205755" style="zoom:80%;" />

思考：

> 如何证明1.7字符串常量位于Perm，而1.8位于Heap？
>
> 提示：结合GC， 一直创建字符串常量，观察堆，和Metaspace

# 面试题

- 理解局部变量表

- 理解操作数栈

- 理解一些常用的指令

  ```java
  package com.mashibing.jvm.c4_RuntimeDataAreaAndInstructionSet;
  
  public class TestIPulsPlus {
      public static void main(String[] args) {
          int i = 8;
          //i = i++;
          i = ++i;
          System.out.println(i);
      }
  }
  ```

<img src="/assets/img/Jvm/JVM-RuntimeDataArea/image-20210815193307018.png" alt="image-20210815193307018" style="zoom:67%;" />



# 指令集分类

1. 基于寄存器的指令集

2. 基于栈的指令集
   Hotspot中的Local Variable Table = JVM中的寄存器

   <img src="/assets/img/Jvm/JVM-RuntimeDataArea/image-20210815193352944.png" alt="image-20210815193352944" style="zoom:67%;" />

   <img src="/assets/img/Jvm/JVM-RuntimeDataArea/image-20210815193602774.png" alt="image-20210815193602774" style="zoom:50%;" />

   DCL 单例为什么要加 volitile？因为你看下面的第一条指令，我们知道，刚new出来对象是半初始化的对象，只是赋一个默认值，而involespecial才是调用构造方法，给变量赋初始值，而这两条指令之间是可能会发生指令重排的。

   <img src="/assets/img/Jvm/JVM-RuntimeDataArea/image-20210815193648309.png" alt="image-20210815193648309" style="zoom:67%;" />



## 递归的调用

<img src="/assets/img/Jvm/JVM-RuntimeDataArea/image-20210815193753986.png" alt="image-20210815193753986" style="zoom:80%;" />

# 常用指令

store

load

pop

mul

sub

invoke

1. InvokeStatic 调用一个静态方法
2. InvokeVirtual  new一个对象，调用一个非静态方法
3. InvokeInterface 调用接口方法
4. InovkeSpecial
   可以直接定位，不需要多态的方法
   private 方法 ， 构造方法
5. InvokeDynamic
   JVM最难的指令
   lambda表达式或者反射或者其他动态语言scala kotlin，或者CGLib ASM，动态产生的class，会用到的指令

```java
package com.mashibing.jvm.c4_RuntimeDataAreaAndInstructionSet;

public class T05_InvokeDynamic {
    public static void main(String[] args) {


        I i = C::n;
        I i2 = C::n;
        I i3 = C::n;
        I i4 = () -> {
            C.n();
        };
        System.out.println(i.getClass());
        System.out.println(i2.getClass());
        System.out.println(i3.getClass());

        //for(;;) {I j = C::n;} //MethodArea <1.8 Perm Space (FGC不回收)
    }

    @FunctionalInterface
    public interface I {
        void m();
    }

    public static class C {
        static void n() {
            System.out.println("hello");
        }
    }
}
```

<img src="/assets/img/Jvm/JVM-RuntimeDataArea/image-20210815231029556.png" alt="image-20210815231029556" style="zoom:50%;" />
