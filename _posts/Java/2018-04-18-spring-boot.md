---
layout: post
title: spring-boot入门笔记
categories: Java
tags: Java
keywords: spring-boot入门笔记
date: 2018-04-18 
---
# 部署
idea旗舰版安装spring initailzr,选择spring-boot的web模块，自动生成main入口和pom文件

# 启动 
三种方法
1. idea的run启动
2. 命令 mvn spring-boot:run
3. mvn install 打包，然后用java命令启动 ```java -jar manager-0.0.1-SNAPSHOT.jar```

# 属性配置
可以用.properties或者.yarm文件配置
```yml
server:
  port: 8081 
  servlet.context-path: /manager #url路径前缀
content: "port is ${server.port}"
```
* @Value("${server.port}")注解配置
* 可以用注解@Component&@ConfigurationProperties(prefix = "person")实例化配置类
* 开发与生成环境切换配置
>```java -jar manager-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev```

# Controller
* @RestController 等同于@Controller与@ResponseBody组合
* @RequestMapping("/hh") 可以整个control配置control的url映射
* @RequestMapping(value = {"/hello","/hi"}, method = RequestMethod.GET) 配置多个映射 与@GetMapping()等价，推荐后者少写代码
* @RequestParam("id") 获取/hi?id=1 url参数
* @RequestMapping(value = "/hello/{id}", method = RequestMethod.GET)  **@PathVariable("id")** 获取/hi/1 url路径参数

# 数据库
使用**JPA**
```yml
  jpa:
    hibernate:
      ddl-auto: create #create每次运行会重新创建update第一次运行创建表，再次运行保留数据
```yml

jps使用
```java
personRepository.findAll();
personRepository.save(person);
```