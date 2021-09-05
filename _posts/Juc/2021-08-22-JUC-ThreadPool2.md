---
layout: post
title: 多线程与高并发八-线程池及源码
categories: Juc
tags: Juc
keywords: 多线程与高并发八-线程池及源码
date: 2021-08-22
---

# 几类线程池

ThreadPoolExecutor：我们通常所说的线程池。多个线程共享同一个任务队列。

- SingleThreadPool

 - CachedThreadPool

- FixedThreadPool

 - ScheduledPool

ForkJoinPoll：先将任务分解，最后再汇总。每个线程有自己的任务队列，适用CPU密集型


   - WorkStealingPool


## SingleThreadPool

SingleThreadPool 这个线程池里面只有一个线程。这样可以保证 **我们扔进去的任务是被顺序执行的**。

1. SingleThreadPool  为什么要有单线程的线程池？

> 线程池有任务队列   可以提供生命周期管理

```java
public static ExecutorService newSingleThreadExecutor() {
    return new FinalizableDelegatedExecutorService
        (new ThreadPoolExecutor(1, 1,
                                0L, TimeUnit.MILLISECONDS,
                                new LinkedBlockingQueue<Runnable>()));
}
```

## CachedThreadPool

```java
public static ExecutorService newCachedThreadPool() {
    return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                  60L, TimeUnit.SECONDS,
                                  new SynchronousQueue<Runnable>());
}
```
会根据任务数量创建相对应的线程数，不过CachedThreadPool的核心线程数默认为0，所以可想而知，这些创建出来的线程对应的都是最大线程数，这些线程会被缓存以试图能被重复使用，不过默认60秒没使用的话，就会被回收，所以这个类型的线程适合用于在短时间内**大量短生命周期的异步任务时（many short-lived asynchronous task）**。

**阿里不推荐使用该线程池**

```java
public class T08_CachedPool {
   public static void main(String[] args) throws InterruptedException {
      ExecutorService service = Executors.newCachedThreadPool();
      System.out.println(service);
      for (int i = 0; i < 2; i++) {
         service.execute(() -> {
            try {
               TimeUnit.MILLISECONDS.sleep(500);
            } catch (InterruptedException e) {
               e.printStackTrace();
            }
            System.out.println(Thread.currentThread().getName());
         });
      }
      System.out.println(service);
      
      TimeUnit.SECONDS.sleep(80);
      
      System.out.println(service);
      
      
   }
}
```

结果

```
java.util.concurrent.ThreadPoolExecutor@330bedb4[Running, pool size = 0, active threads = 0, queued tasks = 0, completed tasks = 0]
java.util.concurrent.ThreadPoolExecutor@330bedb4[Running, pool size = 2, active threads = 2, queued tasks = 0, completed tasks = 0]
pool-1-thread-2
pool-1-thread-1
java.util.concurrent.ThreadPoolExecutor@330bedb4[Running, pool size = 0, active threads = 0, queued tasks = 0, completed tasks = 2]

Process finished with exit code 0
```

## FixedThreadPool

corePoolSize和 maximumPoolSize是一样的。并且他的keepAliveTime=0， 也就是当线程池中的线程数大于corePoolSize， 多余的空闲线程会被**立即终止**

FixedThreadPool使用了LinkedBlockingQueue， 也就是无界队列（队列最大可容纳Integer.MAX_VALUE）， 因此会造成以下影响：

1. 线程池线程数到达corePoolSize后，任务会被存放在LinkedBlockingQueue中
2.  因为无界队列，运行中(未调用shutdown()或者shutdownNow()方法)的不会拒绝任务（队列无界，可以放入"无限"任务）


```java
public static ExecutorService newFixedThreadPool(int nThreads) {
    return new ThreadPoolExecutor(nThreads, nThreads,
                                  0L, TimeUnit.MILLISECONDS,
                                  new LinkedBlockingQueue<Runnable>());
}
```

**Concurrent vs parallel**
并发指任务提交，并行指任务执行；
并行是多个CPU同时处理，并发是多个任务同时过来；
并行是并发的子集

**CachedThreadPool vs FixedThreadPool**

| 特性     | FixedThreadPool                                              | CachedThreadPool                                             |
| :------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| 重用     | 能 重用就用，但不能随时建新的线程                            | 缓存型池子，先查看池中有没有以前建立的线程，如果有，就 重用；如果没有，就建一个新的线程加入池中 |
| 池大小   | 可指定 nThreads，固定数量                                    | 可增长，最大值 Integer.MAX_VALUE                             |
| 队列大小 | 无限制                                                       | 无限制                                                       |
| 超时     | 无 IDLE                                                      | 默认 60 秒 IDLE                                              |
| 使用场景 | 所以 FixedThreadPool 多数针对一些很稳定很固定的正规并发线程，多用于服务器 | 大量短生命周期的异步任务                                     |
| 结束     | 核心线程，不会自动销毁                                       | 注意，放入 CachedThreadPool 的线程不必担心其结束，超过 TIMEOUT 不活动，其会自动被终止。 |

![线程数](/assets/img/Juc/JUC-ThreadPool2/threadSize.png)

## ScheduledPool

```java
public ScheduledThreadPoolExecutor(int corePoolSize) {
    super(corePoolSize, Integer.MAX_VALUE, 0, NANOSECONDS,
          new DelayedWorkQueue());
}
```

定时任务线程池，可以延迟执行任务，也可以周期性执行任务，也可以用`quartz` `cron`

```java
ScheduledFuture scheduledFuture =
      scheduledExecutorService.schedule(new Callable() {
         public Object call() throws Exception {
            System.out.println("Executed!");
            return "Called!";
         }
      }, 5, TimeUnit.SECONDS);

System.out.println("result = " + scheduledFuture.get());
scheduledExecutorService.shutdown();
```

结果

```
Executed!
result = Called!
```

## ForkJoinPool

将一个大任务拆分成多个小任务后，使用fork可以将小任务分发给其他线程同时处理，使用join可以将多个线程处理的结果进行汇总；这实际上就是分治思想的并行版本。可以有返回值或无返回值。Java8中的parallelStream API就是基于ForkJoinPool实现的

```java
    this(Math.min(MAX_CAP, Runtime.getRuntime().availableProcessors()),
         defaultForkJoinWorkerThreadFactory, null, false);
}
```

```java
package com.mashibing.juc.c_026_01_ThreadPool;

import java.io.IOException;
import java.util.Arrays;
import java.util.Random;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.RecursiveAction;
import java.util.concurrent.RecursiveTask;

public class T12_ForkJoinPool {
   static int[] nums = new int[1000000];
   static final int MAX_NUM = 50000;
   static Random r = new Random();
   
   static {
      for(int i=0; i<nums.length; i++) {
         nums[i] = r.nextInt(100);
      }
      
      System.out.println("---" + Arrays.stream(nums).sum()); //stream api
   }   
   static class AddTaskRet extends RecursiveTask<Long> {
      
      private static final long serialVersionUID = 1L;
      int start, end;
      
      AddTaskRet(int s, int e) {
         start = s;
         end = e;
      }

      @Override
      protected Long compute() {
         
         if(end-start <= MAX_NUM) {
            long sum = 0L;
            for(int i=start; i<end; i++) sum += nums[i];
            return sum;
         } 
         
         int middle = start + (end-start)/2;
         
         AddTaskRet subTask1 = new AddTaskRet(start, middle);
         AddTaskRet subTask2 = new AddTaskRet(middle, end);
         subTask1.fork();
         subTask2.fork();
         
         return subTask1.join() + subTask2.join();
      }
      
   }
   
   public static void main(String[] args) throws IOException {
      /*ForkJoinPool fjp = new ForkJoinPool();
      AddTask task = new AddTask(0, nums.length);
      fjp.execute(task);*/

      T12_ForkJoinPool temp = new T12_ForkJoinPool();

      ForkJoinPool fjp = new ForkJoinPool();
      AddTaskRet task = new AddTaskRet(0, nums.length);
      fjp.execute(task);
      long result = task.join();
      System.out.println(result);
      
      //System.in.read();
      
   }
}
```

## WorkStealingPool

WorkStealingPool 偷任务的线程池：每一个线程都有自己独立的任务队列，如果某一个线程执行完自己的任务之后，要去别的线程那里偷任务，分担别的线程的任务。

WorkStealingPool 本质上还是一个 ForkJoinPool
![ForkJoinPool](/assets/img/Juc/JUC-ThreadPool2/ForkJoinPool-16289185807771.png)



## 自定义拒绝策略

```java
package com.mashibing.juc.c_026_01_ThreadPool;

import java.util.concurrent.*;

public class T14_MyRejectedHandler {
    public static void main(String[] args) {
        ExecutorService service = new ThreadPoolExecutor(4, 4,
                0, TimeUnit.SECONDS, new ArrayBlockingQueue<>(6),
                Executors.defaultThreadFactory(),
                new MyHandler());
    }

    static class MyHandler implements RejectedExecutionHandler {

        @Override
        public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
            //log("r rejected")
            //save r kafka mysql redis
            //try 3 times
            if(executor.getQueue().size() < 10000) {
                //try put again();
            }
        }
    }
}
```



# ThreadPoolExecutor源码解析

## 1、常用变量的解释

```java
// 1. `ctl`，可以看做一个int类型的数字，高3位表示线程池状态，低29位表示worker数量
private final AtomicInteger ctl = new AtomicInteger(ctlOf(RUNNING, 0));
// 2. `COUNT_BITS`，`Integer.SIZE`为32，所以`COUNT_BITS`为29
private static final int COUNT_BITS = Integer.SIZE - 3;
// 3. `CAPACITY`，线程池允许的最大线程数。1左移29位，然后减1，即为 2^29 - 1
private static final int CAPACITY   = (1 << COUNT_BITS) - 1;

// runState is stored in the high-order bits
// 4. 线程池有5种状态，按大小排序如下：RUNNING < SHUTDOWN < STOP < TIDYING < TERMINATED
private static final int RUNNING    = -1 << COUNT_BITS;
private static final int SHUTDOWN   =  0 << COUNT_BITS;
private static final int STOP       =  1 << COUNT_BITS;
private static final int TIDYING    =  2 << COUNT_BITS;
private static final int TERMINATED =  3 << COUNT_BITS;

// Packing and unpacking ctl
// 5. `runStateOf()`，获取线程池状态，通过按位与操作，低29位将全部变成0
private static int runStateOf(int c)     { return c & ~CAPACITY; }
// 6. `workerCountOf()`，获取线程池worker数量，通过按位与操作，高3位将全部变成0
private static int workerCountOf(int c)  { return c & CAPACITY; }
// 7. `ctlOf()`，根据线程池状态和线程池worker数量，生成ctl值
private static int ctlOf(int rs, int wc) { return rs | wc; }

/*
 * Bit field accessors that don't require unpacking ctl.
 * These depend on the bit layout and on workerCount being never negative.
 */
// 8. `runStateLessThan()`，线程池状态小于xx
private static boolean runStateLessThan(int c, int s) {
    return c < s;
}
// 9. `runStateAtLeast()`，线程池状态大于等于xx
private static boolean runStateAtLeast(int c, int s) {
    return c >= s;
}
```

## 2、构造方法

```java
public ThreadPoolExecutor(int corePoolSize,
                          int maximumPoolSize,
                          long keepAliveTime,
                          TimeUnit unit,
                          BlockingQueue<Runnable> workQueue,
                          ThreadFactory threadFactory,
                          RejectedExecutionHandler handler) {
    // 基本类型参数校验
    if (corePoolSize < 0 ||
        maximumPoolSize <= 0 ||
        maximumPoolSize < corePoolSize ||
        keepAliveTime < 0)
        throw new IllegalArgumentException();
    // 空指针校验
    if (workQueue == null || threadFactory == null || handler == null)
        throw new NullPointerException();
    this.corePoolSize = corePoolSize;
    this.maximumPoolSize = maximumPoolSize;
    this.workQueue = workQueue;
    // 根据传入参数`unit`和`keepAliveTime`，将存活时间转换为纳秒存到变量`keepAliveTime `中
    this.keepAliveTime = unit.toNanos(keepAliveTime);
    this.threadFactory = threadFactory;
    this.handler = handler;
}
```

## 3、提交执行task的过程

```java
public void execute(Runnable command) {
    if (command == null)
        throw new NullPointerException();
    /*
     * Proceed in 3 steps:
     *
     * 1. If fewer than corePoolSize threads are running, try to
     * start a new thread with the given command as its first
     * task.  The call to addWorker atomically checks runState and
     * workerCount, and so prevents false alarms that would add
     * threads when it shouldn't, by returning false.
     *
     * 2. If a task can be successfully queued, then we still need
     * to double-check whether we should have added a thread
     * (because existing ones died since last checking) or that
     * the pool shut down since entry into this method. So we
     * recheck state and if necessary roll back the enqueuing if
     * stopped, or start a new thread if there are none.
     *
     * 3. If we cannot queue task, then we try to add a new
     * thread.  If it fails, we know we are shut down or saturated
     * and so reject the task.
     */
    int c = ctl.get();
    // worker数量比核心线程数小，直接创建worker执行任务
    if (workerCountOf(c) < corePoolSize) {
        if (addWorker(command, true))
            return;
        c = ctl.get();
    }
    // worker数量超过核心线程数，任务直接进入队列
    if (isRunning(c) && workQueue.offer(command)) {
        int recheck = ctl.get();
        // 线程池状态不是RUNNING状态，说明执行过shutdown命令，需要对新加入的任务执行reject()操作。
        // 这儿为什么需要recheck，是因为任务入队列前后，线程池的状态可能会发生变化。
        if (! isRunning(recheck) && remove(command))
            reject(command);
        // 这儿为什么需要判断0值，主要是在线程池构造方法中，核心线程数允许为0
        else if (workerCountOf(recheck) == 0)
            addWorker(null, false);
    }
    // 如果线程池不是运行状态，或者任务进入队列失败，则尝试创建worker执行任务。
    // 这儿有3点需要注意：
    // 1. 线程池不是运行状态时，addWorker内部会判断线程池状态
    // 2. addWorker第2个参数表示是否创建核心线程
    // 3. addWorker返回false，则说明任务执行失败，需要执行reject操作
    else if (!addWorker(command, false))
        reject(command);
}
```

## 4、addworker源码解析

```java
private boolean addWorker(Runnable firstTask, boolean core) {
    retry:
    // 外层自旋
    for (;;) {
        int c = ctl.get();
        int rs = runStateOf(c);

        // 这个条件写得比较难懂，我对其进行了调整，和下面的条件等价
        // (rs > SHUTDOWN) || 
        // (rs == SHUTDOWN && firstTask != null) || 
        // (rs == SHUTDOWN && workQueue.isEmpty())
        // 1. 线程池状态大于SHUTDOWN时，直接返回false
        // 2. 线程池状态等于SHUTDOWN，且firstTask不为null，直接返回false
        // 3. 线程池状态等于SHUTDOWN，且队列为空，直接返回false
        // Check if queue empty only if necessary.
        if (rs >= SHUTDOWN &&
            ! (rs == SHUTDOWN &&
               firstTask == null &&
               ! workQueue.isEmpty()))
            return false;

        // 内层自旋
        for (;;) {
            int wc = workerCountOf(c);
            // worker数量超过容量，直接返回false
            if (wc >= CAPACITY ||
                wc >= (core ? corePoolSize : maximumPoolSize))
                return false;
            // 使用CAS的方式增加worker数量。
            // 若增加成功，则直接跳出外层循环进入到第二部分
            if (compareAndIncrementWorkerCount(c))
                break retry;
            c = ctl.get();  // Re-read ctl
            // 线程池状态发生变化，对外层循环进行自旋
            if (runStateOf(c) != rs)
                continue retry;
            // 其他情况，直接内层循环进行自旋即可
            // else CAS failed due to workerCount change; retry inner loop
        } 
    }
    boolean workerStarted = false;
    boolean workerAdded = false;
    Worker w = null;
    try {
        w = new Worker(firstTask);
        final Thread t = w.thread;
        if (t != null) {
            final ReentrantLock mainLock = this.mainLock;
            // worker的添加必须是串行的，因此需要加锁
            mainLock.lock();
            try {
                // Recheck while holding lock.
                // Back out on ThreadFactory failure or if
                // shut down before lock acquired.
                // 这儿需要重新检查线程池状态
                int rs = runStateOf(ctl.get());

                if (rs < SHUTDOWN ||
                    (rs == SHUTDOWN && firstTask == null)) {
                    // worker已经调用过了start()方法，则不再创建worker
                    if (t.isAlive()) // precheck that t is startable
                        throw new IllegalThreadStateException();
                    // worker创建并添加到workers成功
                    workers.add(w);
                    // 更新`largestPoolSize`变量
                    int s = workers.size();
                    if (s > largestPoolSize)
                        largestPoolSize = s;
                    workerAdded = true;
                }
            } finally {
                mainLock.unlock();
            }
            // 启动worker线程
            if (workerAdded) {
                t.start();
                workerStarted = true;
            }
        }
    } finally {
        // worker线程启动失败，说明线程池状态发生了变化（关闭操作被执行），需要进行shutdown相关操作
        if (! workerStarted)
            addWorkerFailed(w);
    }
    return workerStarted;
}
```

## 5、线程池worker任务单元

```java
private final class Worker
    extends AbstractQueuedSynchronizer
    implements Runnable
{
    /**
     * This class will never be serialized, but we provide a
     * serialVersionUID to suppress a javac warning.
     */
    private static final long serialVersionUID = 6138294804551838833L;

    /** Thread this worker is running in.  Null if factory fails. */
    final Thread thread;
    /** Initial task to run.  Possibly null. */
    Runnable firstTask;
    /** Per-thread task counter */
    volatile long completedTasks;

    /**
     * Creates with given first task and thread from ThreadFactory.
     * @param firstTask the first task (null if none)
     */
    Worker(Runnable firstTask) {
        setState(-1); // inhibit interrupts until runWorker
        this.firstTask = firstTask;
        // 这儿是Worker的关键所在，使用了线程工厂创建了一个线程。传入的参数为当前worker
        this.thread = getThreadFactory().newThread(this);
    }

    /** Delegates main run loop to outer runWorker  */
    public void run() {
        runWorker(this);
    }

    // 省略代码...
}
```

## 6、核心线程执行逻辑-runworker

```java
final void runWorker(Worker w) {
    Thread wt = Thread.currentThread();
    Runnable task = w.firstTask;
    w.firstTask = null;
    // 调用unlock()是为了让外部可以中断
    w.unlock(); // allow interrupts
    // 这个变量用于判断是否进入过自旋（while循环）
    boolean completedAbruptly = true;
    try {
        // 这儿是自旋
        // 1. 如果firstTask不为null，则执行firstTask；
        // 2. 如果firstTask为null，则调用getTask()从队列获取任务。
        // 3. 阻塞队列的特性就是：当队列为空时，当前线程会被阻塞等待
        while (task != null || (task = getTask()) != null) {
            // 这儿对worker进行加锁，是为了达到下面的目的
            // 1. 降低锁范围，提升性能
            // 2. 保证每个worker执行的任务是串行的
            w.lock();
            // If pool is stopping, ensure thread is interrupted;
            // if not, ensure thread is not interrupted.  This
            // requires a recheck in second case to deal with
            // shutdownNow race while clearing interrupt
            // 如果线程池正在停止，则对当前线程进行中断操作
            if ((runStateAtLeast(ctl.get(), STOP) ||
                 (Thread.interrupted() &&
                  runStateAtLeast(ctl.get(), STOP))) &&
                !wt.isInterrupted())
                wt.interrupt();
            // 执行任务，且在执行前后通过`beforeExecute()`和`afterExecute()`来扩展其功能。
            // 这两个方法在当前类里面为空实现。
            try {
                beforeExecute(wt, task);
                Throwable thrown = null;
                try {
                    task.run();
                } catch (RuntimeException x) {
                    thrown = x; throw x;
                } catch (Error x) {
                    thrown = x; throw x;
                } catch (Throwable x) {
                    thrown = x; throw new Error(x);
                } finally {
                    afterExecute(task, thrown);
                }
            } finally {
                // 帮助gc
                task = null;
                // 已完成任务数加一 
                w.completedTasks++;
                w.unlock();
            }
        }
        completedAbruptly = false;
    } finally {
        // 自旋操作被退出，说明线程池正在结束
        processWorkerExit(w, completedAbruptly);
    }
}
```

