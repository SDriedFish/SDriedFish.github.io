---
layout: post
title: 多线程与高并发五-ThreadLocal
categories: Juc
tags: Juc
keywords: 多线程与高并发五-ThreadLocal
date: 2021-08-19
---
# ThreadLocal

ThreadLocal 修饰的变量，是线程独有的

## ThreadLocal源码

### set方法

获取当前线程，并获取当前线程的ThreadLocalMap实例（从getMap(Thread t)中很容易看出来）。

如果获取到的map实例不为空，调用map.set()方法，否则调用构造函数 ThreadLocal.ThreadLocalMap(this, firstValue)实例化map。这里的this指的是`ThreadLocal`对象。

```java
/**
 * Sets the current thread's copy of this thread-local variable
 * to the specified value.  Most subclasses will have no need to
 * override this method, relying solely on the {@link #initialValue}
 * method to set the values of thread-locals.
 *
 * @param value the value to be stored in the current thread's copy of
 *        this thread-local.
 */
public void set(T value) {
    Thread t = Thread.currentThread();
    ThreadLocalMap map = getMap(t);
    if (map != null)
        map.set(this, value);
    else
        createMap(t, value);
}
```

```java
void createMap(Thread t, T firstValue) {
    t.threadLocals = new ThreadLocalMap(this, firstValue);
}
```

```java
ThreadLocalMap getMap(Thread t) {
    return t.threadLocals;
}
```

### get方法

get()方法和set()方法原理类似，也是先获取当前调用线程的ThreadLocalMap,再从map中获取value，并将ThreadLocal作为key

```java
/**
 * Returns the value in the current thread's copy of this
 * thread-local variable.  If the variable has no value for the
 * current thread, it is first initialized to the value returned
 * by an invocation of the {@link #initialValue} method.
 *
 * @return the current thread's value of this thread-local
 */
public T get() {
    Thread t = Thread.currentThread();
    ThreadLocalMap map = getMap(t);
    if (map != null) {
        ThreadLocalMap.Entry e = map.getEntry(this);
        if (e != null) {
            @SuppressWarnings("unchecked")
            T result = (T)e.value;
            return result;
        }
    }
    return setInitialValue();
}
```



为什么要有ThreadLocal？
Spring的声明式事务会用到。
Spring的声明式事务在一个线程里。
connection在连接池里，不同的connection之间怎么形成完整的事务？
把connection放在当先线程的ThreadLocal里面，以后拿的时候从ThreadLocal直接拿，不去线池里面拿。

![Threadlocal](/assets/img/Juc/JUC-ThreadLocal/Threadlocal.png)

# 强软弱虚四种引用

## 强引用

只要有一个应用指向这个对象，那么垃圾回收器一定不会回收它，这就是普通的引用，也就是强引用，为什么不会回收？因为有引用指向，所以不会回收，只有没有引用指向的时候才会回收。

```java
package com.mashibing.juc.c_022_RefTypeAndThreadLocal;

import java.io.IOException;

public class T01_NormalReference {
    public static void main(String[] args) throws IOException {
        M m = new M();
        m = null;
        System.gc(); //DisableExplicitGC

        System.in.read();
    }
}
```

## 软引用

当有一个对象(字节数组)被一个软引用所指向的时候，只有系统内存不够用的时候，才会回收它(字节数组)

```java
/**
 * 软引用
 * 软引用是用来描述一些还有用但并非必须的对象。
 * 对于软引用关联着的对象，在系统将要发生内存溢出异常之前，将会把这些对象列进回收范围进行第二次回收。
 * 如果这次回收还没有足够的内存，才会抛出内存溢出异常。
 * -Xmx20M
 */
package com.mashibing.juc.c_022_RefTypeAndThreadLocal;

import java.lang.ref.SoftReference;

public class T02_SoftReference {
    public static void main(String[] args) {
        SoftReference<byte[]> m = new SoftReference<>(new byte[1024*1024*10]);
        //m = null;
        System.out.println(m.get());
        System.gc();
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(m.get());

        //再分配一个数组，heap将装不下，这时候系统会垃圾回收，先回收一次，如果不够，会把软引用干掉
        byte[] b = new byte[1024*1024*15];
        System.out.println(m.get());
    }
}

//软引用非常适合缓存使用
```

## 弱引用

弱引用的意思是，只要遭遇到gc就会回收，刚才我们说到软引用的概念是，垃圾回收不一定回收它，只有空间不够了才会回收它，所以软引用的生存周期还是比较长的，我们接着说弱应用，弱引用就是说，只要垃圾回收看到这个引用是一个特别弱的引用指向的时候，就直接把它给干掉

```java
/**
 * 弱引用遭到gc就会回收
 *
 */
package com.mashibing.juc.c_022_RefTypeAndThreadLocal;

import java.lang.ref.WeakReference;

public class T03_WeakReference {
    public static void main(String[] args) {
        WeakReference<M> m = new WeakReference<>(new M());

        System.out.println(m.get());
        System.gc();
        System.out.println(m.get());


        ThreadLocal<M> tl = new ThreadLocal<>();
        tl.set(new M());
        tl.remove();

    }
}
```

弱引用最典型的一个应用ThreadLocal 

### ThreadLocal 弱引用

<img src="/assets/img/Juc/JUC-ThreadLocal/Threadlocal1.png" alt="Threadlocal 引用" style="zoom:67%;" />

注意事项：

1. Map里的key是通过一个弱引用指向了一个ThreadLocal对象，当这个强引用消失的时候这个弱引用是不是自动就会回收了，这也是为什么用WeakReference的原因。
2. 当tl这个强引用消失了，key的指向也被回收了，但是这个threadLocals的Map是永远存在的，但key指向了一个null值，访问不到了value，所以务必要**remove**掉，不然还会有内存泄漏。

## 虚引用

虚引用顾名思义，就是形同虚设，使用get也无法获取到虚引用的值。与其他几种引用都不同，虚引用并不会决定对象的生命周期。如果一个对象仅持有虚引用，那么它就和没有任何引用一样，在任何时候都可能被垃圾回收器回收。

虚引用与软引用和弱引用的一个区别在于：
虚引用必须和引用队列(ReferenceQueue)联合使用。
当垃圾回收器准备回收一个对象时，如果发现它还有虚引用，就会在回收对象的内存之前，把这个虚引用加入到与之关联的引用队列中。

<img src="/assets/img/Juc/JUC-ThreadLocal/PhantomReference.png" alt="虚引用" style="zoom:67%;" />

```java
/**
 *
 *
 *     一个对象是否有虚引用的存在，完全不会对其生存时间构成影响，
 *     也无法通过虚引用来获取一个对象的实例。
 *     为一个对象设置虚引用关联的唯一目的就是能在这个对象被收集器回收时收到一个系统通知。
 *     虚引用和弱引用对关联对象的回收都不会产生影响，如果只有虚引用活着弱引用关联着对象，
 *     那么这个对象就会被回收。它们的不同之处在于弱引用的get方法，虚引用的get方法始终返回null,
 *     弱引用可以使用ReferenceQueue,虚引用必须配合ReferenceQueue使用。
 *
 *     jdk中直接内存的回收就用到虚引用，由于jvm自动内存管理的范围是堆内存，
 *     而直接内存是在堆内存之外（其实是内存映射文件，自行去理解虚拟内存空间的相关概念），
 *     所以直接内存的分配和回收都是有Unsafe类去操作，java在申请一块直接内存之后，
 *     会在堆内存分配一个对象保存这个堆外内存的引用，
 *     这个对象被垃圾收集器管理，一旦这个对象被回收，
 *     相应的用户线程会收到通知并对直接内存进行清理工作。
 *
 *     事实上，虚引用有一个很重要的用途就是用来做堆外内存的释放，
 *     DirectByteBuffer就是通过虚引用来实现堆外内存的释放的。
 *
 */


package com.mashibing.juc.c_022_RefTypeAndThreadLocal;

import java.lang.ref.PhantomReference;
import java.lang.ref.Reference;
import java.lang.ref.ReferenceQueue;
import java.util.LinkedList;
import java.util.List;

public class T04_PhantomReference {
    private static final List<Object> LIST = new LinkedList<>();
    private static final ReferenceQueue<M> QUEUE = new ReferenceQueue<>();



    public static void main(String[] args) {


        PhantomReference<M> phantomReference = new PhantomReference<>(new M(), QUEUE);


        new Thread(() -> {
            while (true) {
                LIST.add(new byte[1024 * 1024]);
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                    Thread.currentThread().interrupt();
                }
                System.out.println(phantomReference.get());
            }
        }).start();

        new Thread(() -> {
            while (true) {
                Reference<? extends M> poll = QUEUE.poll();
                if (poll != null) {
                    System.out.println("--- 虚引用对象被jvm回收了 ---- " + poll);
                }
            }
        }).start();

        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

    }
}
```
