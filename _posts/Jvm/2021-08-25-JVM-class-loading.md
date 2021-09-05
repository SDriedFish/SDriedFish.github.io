---
layout: post
title: JVM2-Class加载
categories: Jvm
tags: Jvm
keywords: JVM2-Class加载
date: 2021-08-25
---
# 类加载流程

`class` 是怎么从硬盘中加载到内存中：编译 加载 初始化

![class加载](/assets/img/Jvm/JVM-class-loading/class-loading.png)


## Loading

1. 双亲委派，主要出于安全来考虑

   <img src="/assets/img/Jvm/JVM-class-loading/loading.png" alt="类加载器" style="zoom: 50%;" />

   <img src="/assets/img/Jvm/JVM-class-loading/progress.png" alt="类加载过程" style="zoom: 50%;" />

   ```java
   package com.mashibing.jvm.c2_classloader;
   
   public class T004_ParentAndChild {
       public static void main(String[] args) {
           System.out.println(T004_ParentAndChild.class.getClassLoader());
           System.out.println(T004_ParentAndChild.class.getClassLoader().getClass().getClassLoader());
           System.out.println(T004_ParentAndChild.class.getClassLoader().getParent());
           System.out.println(T004_ParentAndChild.class.getClassLoader().getParent().getParent());
           //System.out.println(T004_ParentAndChild.class.getClassLoader().getParent().getParent().getParent());
   
       }
   }
   ```

2. LazyLoading 五种情况

   1. –new getstatic putstatic invokestatic指令，访问final变量除外

      –java.lang.reflect对类进行反射调用时

      –初始化子类的时候，父类首先初始化

      –虚拟机启动时，被执行的主类必须初始化

      –动态语言支持java.lang.invoke.MethodHandle解析的结果为REF_getstatic REF_putstatic REF_invokestatic的方法句柄时，该类必须初始化
      
      ```java
      package com.mashibing.jvm.c2_classloader;
      
      public class T008_LazyLoading { //严格讲应该叫lazy initialzing，因为java虚拟机规范并没有严格规定什么时候必须loading,但严格规定了什么时候initialzing
          public static void main(String[] args) throws Exception {
              //P p;
              //X x = new X();
              //System.out.println(P.i);
              //System.out.println(P.j);
              Class.forName("com.mashibing.jvm.c2_classloader.T008_LazyLoading$P");
      
          }
      
          public static class P {
              final static int i = 8;
              static int j = 9;
              static {
                  System.out.println("P");
              }
          }
      
          public static class X extends P {
              static {
                  System.out.println("X");
              }
          }
      }
      ```

3. ClassLoader的源码

      findInCache -> parent.loadClass -> findClass()

   ```java
   protected Class<?> loadClass(String name, boolean resolve)
       throws ClassNotFoundException
   {
       synchronized (getClassLoadingLock(name)) {
           // First, check if the class has already been loaded
           Class<?> c = findLoadedClass(name);
           if (c == null) {
               long t0 = System.nanoTime();
               try {
                   if (parent != null) {
                       c = parent.loadClass(name, false);
                   } else {
                       c = findBootstrapClassOrNull(name);
                   }
               } catch (ClassNotFoundException e) {
                   // ClassNotFoundException thrown if class not found
                   // from the non-null parent class loader
               }
   
               if (c == null) {
                   // If still not found, then invoke findClass in order
                   // to find the class.
                   long t1 = System.nanoTime();
                   c = findClass(name);
   
                   // this is the defining class loader; record the stats
                   sun.misc.PerfCounter.getParentDelegationTime().addTime(t1 - t0);
                   sun.misc.PerfCounter.getFindClassTime().addElapsedTimeFrom(t1);
                   sun.misc.PerfCounter.getFindClasses().increment();
               }
           }
           if (resolve) {
               resolveClass(c);
           }
           return c;
       }
   }
   ```

   

4. 自定义类加载器

   1. extends ClassLoader
   2. overwrite findClass() -> defineClass(byte[] -> Class clazz)
   3. 可以实现加密
   4. <font color=red>parent是如何指定的，打破双亲委派，学生问题桌面图片</font>
      1. 用super(parent)指定
      2. 双亲委派的打破
         1. 如何打破：重写loadClass（）
         2. 何时打破过？
            1. JDK1.2之前，自定义ClassLoader都必须重写loadClass()
            2. ThreadContextClassLoader可以实现基础类调用实现类代码，通过thread.setContextClassLoader指定
            3. 热启动，热部署
               1. osgi tomcat 都有自己的模块指定classloader（可以加载同一类库的不同版本）

```java
package com.mashibing.jvm.c2_classloader;

import com.mashibing.jvm.Hello;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;

public class T007_MSBClassLoaderWithEncription extends ClassLoader {

    public static int seed = 0B10110110;

    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        File f = new File("c:/test/", name.replace('.', '/').concat(".msbclass"));

        try {
            FileInputStream fis = new FileInputStream(f);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            int b = 0;

            while ((b=fis.read()) !=0) {
                baos.write(b ^ seed);
            }

            byte[] bytes = baos.toByteArray();
            baos.close();
            fis.close();//可以写的更加严谨

            return defineClass(name, bytes, 0, bytes.length);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return super.findClass(name); //throws ClassNotFoundException
    }

    public static void main(String[] args) throws Exception {

        encFile("com.mashibing.jvm.hello");

        ClassLoader l = new T007_MSBClassLoaderWithEncription();
        Class clazz = l.loadClass("com.mashibing.jvm.Hello");
        Hello h = (Hello)clazz.newInstance();
        h.m();

        System.out.println(l.getClass().getClassLoader());
        System.out.println(l.getParent());
    }

    private static void encFile(String name) throws Exception {
        File f = new File("c:/test/", name.replace('.', '/').concat(".class"));
        FileInputStream fis = new FileInputStream(f);
        FileOutputStream fos = new FileOutputStream(new File("c:/test/", name.replaceAll(".", "/").concat(".msbclass")));
        int b = 0;

        while((b = fis.read()) != -1) {
            fos.write(b ^ seed);
        }

        fis.close();
        fos.close();
    }
}

```

1. 混合执行 编译执行 解释执行

   1. 检测热点代码：-XX:CompileThreshold = 10000

      <img src="/assets/img/Jvm/JVM-class-loading/mixed.png" alt="混合模式" style="zoom:67%;" />

```java
package com.mashibing.jvm.c2_classloader;

public class T009_WayToRun {
    public static void main(String[] args) {
        for(int i=0; i<10_0000; i++)
            m();

        long start = System.currentTimeMillis();
        for(int i=0; i<10_0000; i++) {
            m();
        }
        long end = System.currentTimeMillis();
        System.out.println(end - start);
    }

    public static void m() {
        for(long i=0; i<10_0000L; i++) {
            long j = i%3;
        }
    }
}
```

```
//混合模式
2928

Process finished with exit code 0
```



```
//解释模式 使用-Xint
2928

Process finished with exit code 0
```



## Linking 

1. Verification
   1. 验证文件是否符合JVM规定
2. Preparation
   1. 静态成员变量赋默认值
3. Resolution
   1. 将类、方法、属性等符号引用解析为直接引用
      常量池中的各种符号引用解析为指针、偏移量等内存地址的直接引用

## Initializing

调用类初始化代码 <clinit>，给静态成员变量赋初始值

```java
package com.mashibing.jvm.c2_classloader;

public class T001_ClassLoadingProcedure {
    public static void main(String[] args) {
        System.out.println(T.count);
    }
}

class T {
    public static T t = new T(); // null
    public static int count = 2; //0

    //private int m = 8;

    private T() {
        count ++;
        //System.out.println("--" + count);
    }
}
```

输出结果为2. 如果交换10 11行，输出结果为3
