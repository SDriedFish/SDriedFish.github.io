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
  
# Spring的java配置
Spring的Java配置方式是通过 @Configuration 和 @Bean 这两个注解实现的：
1. @Configuration 作用于类上，相当于一个xml配置文件
2. @Bean 作用于方法上，相当于xml配置中的<bean>
 
```java
@Configuration //通过该注解来表明该类是一个Spring的配置，相当于一个xml文件
@ComponentScan(basePackages = "cn.itcast.springboot.javaconfig") //配置扫描包
public class SpringConfig {
    
    @Bean // 通过该注解来表明是一个Bean对象，相当于xml中的<bean>
    public UserDAO getUserDAO(){
        return new UserDAO(); // 直接new对象做演示
    }
    
}
```
通过@PropertySource可以指定读取的配置文件，通过@Value注解获取值
* @PropertySource(value= {"classpath:jdbc.properties"}) 读取jdbc.properties配置文件

# Spring Boot的核心
Spring Boot的项目一般都会有*Application的入口类，入口类中会有main方法，这是一个标准的Java应用程序的入口方法。
@SpringBootApplication注解是Spring Boot的核心注解，主要目的是开启自动配置，它其实是一个组合注解。
```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration 
@EnableAutoConfiguration
@ComponentScan(
    excludeFilters = {@Filter(
    type = FilterType.CUSTOM,
    classes = {TypeExcludeFilter.class}
), @Filter(
    type = FilterType.CUSTOM,
    classes = {AutoConfigurationExcludeFilter.class}
)}
public @interface SpringBootApplication {
}
```

注解解释
1. @SpringBootConfiguration
> Spring Boot项目的配置注解,推荐使用@ SpringBootConfiguration替代@Configuration
2. @EnableAutoConfiguration
> 启用自动配置，该注解会使Spring Boot根据项目中依赖的jar包自动配置项目的配置项  
> 如我们添加了spring-boot-starter-web的依赖，项目中也就会引入SpringMVC的依赖，Spring Boot就会自动配置tomcat和SpringMVC
> 我们不需要Spring Boot自动配置，想关闭某一项的自动配置，该如何设置呢```@SpringBootApplication(exclude = RedisAutoConfiguration.class)```
3. @ComponentScan
> 默认扫描@SpringBootApplication所在类的同级目录以及它的子目录。

## Starter pom
> spring-boot-starter-web、spring-boot-starter-test等场景

## spring-boot 使用xml
> @ImportResource({"classpath:context.xml"})加载xml配置

## Spring Boot的自动配置的原理
Spring Boot在进行SpringApplication对象实例化时SpringFactoriesLoader会加载META-INF/spring.factories文件，将该配置文件中的配置载入到Spring容器。
RedisAutoConfiguration是Redis的自动配置。

## 属性配置
可以用.properties或者.yarm文件配置加载内容
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

## Controller
* @RestController 等同于@Controller与@ResponseBody组合
* @RequestMapping("/hh") 可以整个control配置control的url映射
* @RequestMapping(value = {"/hello","/hi"}, method = RequestMethod.GET) 配置多个映射 与@GetMapping()等价，推荐后者少写代码
* @RequestParam("id") 获取/hi?id=1 url参数
* @RequestMapping(value = "/hello/{id}", method = RequestMethod.GET)  **@PathVariable("id")** 获取/hi/1 url路径参数
* @Transactional处理事务

## 数据库JPA
```yml
  jpa:
    hibernate:
      ddl-auto: create #create每次运行会重新创建update第一次运行创建表，再次运行保留数据
```

jpa使用api操作数据库
```java
personRepository.findAll();
personRepository.save(person);
```
**JPA写语句**
JPQL语句与HQL(hibernate)类似
```java
   @Query("select t from person t where t.name = ?1")
   List<Person> findByPersonName(String myName);
```

# 自定义SpringMVC的配置
增加一个拦截器，这个时候就得通过继承WebMvcConfigurerAdapter然后重写父类中的方法进行扩展。

#集成mybatis
PageHelper可以实现分页查询