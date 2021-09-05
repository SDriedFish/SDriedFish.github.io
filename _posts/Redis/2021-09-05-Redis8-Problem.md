---
layout: post
title: Redis8-常见问题及java客户端
categories: Redis
tags: Redis
keywords: Redis8-常见问题及java客户端
date: 2021-09-05
---
# 击穿

缓存击穿是指缓存中没有但数据库中有的数据，当大量并发来找这个 key 的时候，这时候客户端去直接请求数据库，这就是**击穿**。

> key 超过了过期时间
> key 被 LRU LFU 清掉了

 **解决方案：**

加互斥锁，只有获得锁的人才能去数据库查，没释放锁之前，其他并行进入的线程会等待sleep，再重新去缓存取数据。

**方案缺陷：**

1. 如果第一个人挂了？：可以设置锁的过期时间
2. 拿到锁的人没挂，但是可能由于网络拥塞或者数据库拥塞，锁超时了，又有一个人拿到这个锁，又去数据库取：多线程，一个线程取DB，一个线程监控是否取回来。更新锁时间

![image-20210828232835121](/assets/img/Redis/Redis8-Problem/image-20210828232835121.png)

# 穿透

 缓存穿透是指缓存和数据库中都没有的数据，并且查不到数据，没法写缓存，所以下一次同样会打到数据库上。

 **解决方案：**

使用布隆过滤器：使用布隆过滤器存储所有可能访问的 key，不存在的 key 直接被过滤，存在的 key 则再进一步查询缓存和数据库。

**布隆过滤器的缺点**：只能增加，不能删除，如果你的业务删除了数据库中的某条数据，无法在布隆过滤器中删除这个key

![image-20210828232745079](/assets/img/Redis/Redis8-Problem/image-20210828232745079.png)

# 雪崩

大量的热点 key 设置了相同的过期时间，导在缓存在同一时刻全部失效，造成瞬时数据库请求量大、压力骤增，引起雪崩，甚至导致数据库被打挂。

**解决方案**：

1. 缓存数据的过期时间设置随机，防止同一时间大量数据过期现象发生。

2. 加互斥锁。该方式和缓存击穿一样。

   > 例如每天零点要刷新缓存。这时候可以依赖击穿的解决方案。如果是零点就延时，随机sleep几秒，这样不会把流量一大波流量同时放过来。

![image-20210828232727171](/assets/img/Redis/Redis8-Problem/image-20210828232727171.png)

# 分布式锁

1. setnx
2. 过期时间
3. 多线程（守护线程）延长过期时间


- 基于 Redis 实现分布式锁。 redisson 

- 基于 Zookeeper 实现分布式锁      虽然zookeeper没有redis快，但是比redis能够加强准确性。

  ```java
  RLock lock = redisson.getLock("myLock");
  
  // traditional lock method
  lock.lock();
  
  // or acquire lock and automatically unlock it after 10 seconds
  lock.lock(10, TimeUnit.SECONDS);
  
  // or wait for lock aquisition up to 100 seconds 
  // and automatically unlock it after 10 seconds
  boolean res = lock.tryLock(100, 10, TimeUnit.SECONDS);
  if (res) {
     try {
       ...
     } finally {
         lock.unlock();
     }
  }
  ```

https://github.com/redisson/redisson/wiki/8.-Distributed-locks-and-synchronizers

# Jedis

https://github.com/redis/jedis

# lettuce

https://github.com/lettuce-io/lettuce-core

# Spring Data Redis

https://docs.spring.io/spring-data/redis/docs/2.5.4/reference/html/#reference

https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/spring-boot-features.html#boot-features-connecting-to-redis

`CONFIG set protected-mode no`  设置容许客户端连接

```JAVA
//高级API
//        stringRedisTemplate.opsForValue().set("hello01","china");
//
//        System.out.println(stringRedisTemplate.opsForValue().get("hello01"));

        //低级API
        RedisConnection conn = redisTemplate.getConnectionFactory().getConnection();

        conn.set("hello02".getBytes(), "mashibing".getBytes());
        System.out.println(new String(conn.get("hello02".getBytes())));
```

