---
layout: post
title: Docker3-Dockerfile
categories: Docker
tags: Docker
keywords: Docker3-Dockerfile
date: 2021-08-11
---
# Dockerfile构建镜像

Dockerfile是一个包含用于组合镜像的命令的文本文档

Docker通过读取Dockerfile中的指令按步自动生成镜像

`docker build -t 机构/镜像名<:tags> Dockerfile目录`

**Dockerfile自动部署Tomcat应用步骤**

1. 创建dockerfile

```dockerfile
FROM tomcat:latest
MAINTAINER ***.com
# 下面命令相当于markdir -p /usr/local/tomcat/webapps &cd /usr/local/tomcat/webapps
WORKDIR /usr/local/tomcat/webapps
# 复制目录下所有文档到容器目录
ADD docker-web ./docker-web
```
2. 使用`docker build`命令生成镜像

`docker build -t gary/mywebapp:1.0 .`

3. 使用`docker run`运行容器

`docker run -d -p 8001:8080 gary/mywebapp:1.0`

# 镜像分层

​	每个镜像都由多个镜像层组成，从下往上以栈的方式组合在一起形成容器的根文件系统，Docker的存储驱动用于管理这些镜像层，对外提供单一的文件系统

 	当容器启动时，Docker就会创建thin类型的可读写容器层，使用预分配存储空间，也就是开始时并不分配存储空间，当需要新建文件或修改文件时，才从存储池中分配一部分存储空间
 	
 	每个容器运行时都有自己的容器层，保存容器运行相关数据（所有文件变化数据），因为镜像层是只读的，所以多个容器可以共享同一个镜像

**最为典型的就是镜像的分层技术——aufs**

![image-20210829220747766](/assets/img/Docker/Docker3-Dockerfile/image-20210829220747766.png)

![image-20210829225709364](/assets/img/Docker/Docker3-Dockerfile/image-20210829225709364.png)

## 构建一个新的镜像过程

```dockerfile
FROM tomcat:latest
MAINTAINER gary
WORKDIR /usr/local/tomcat/webapps
ADD docker-web ./docker-web
```

<center class="half">
    <img src="/assets/img/Docker/Docker3-Dockerfile/image-20210829224222128.png" width="400"/>
    <img src="/assets/img/Docker/Docker3-Dockerfile/image-20210829224114795.png" width="500"/>
</center>


# DOckerfile指令

- FROM centos  #制作基准镜像(基于centos:lastest)
- FROM scratch   #不依赖任何基准镜像base image
- FROM tomcat: 9.0.22-jdk8-openjdk
> 尽量使用官方提供的Base Image

**LABEL & MAINTAINER - 说明信息**

```dockerfile
MAINTAINER gary.com
LABEL version = "1.0"
LABEL description = "web镜像"
```

**WORKDIR - 设置工作目录**

- WORKDIR /usr/local
- WORKDIR /usr/local/newdir #自动创建
> 尽量使用绝对路径

**ADD & COPY - 复制文件**

- ADD hello / #复制到根路径
- ADD test.tar.gz / #添加根目录并解压
- ADD 除了复制,还具备添加远程文件功能

**ENV - 设置环境常量**

- ENV JAVA_HOME /usr/local/openjdk8
- RUN ${JAVA_HOME}/bin/java -jar test.jar
> 尽量使用环境常量,可提高程序维护性

**EXPOSE - 暴露容器端口**

```dockerfile
# 将容器内部端口暴露给物理机  
EXPOSE 8080
# 然后做端口映射
docker run -p 8000:8080 tomcat
```

## 执行指令

**RUN & CMD & ENTRYPOINT**

- RUN  : 在Build构建时执行命令

- ENTRYPOINT : 容器启动时执行的命令

- CMD : 容器启动后执行默认的命令或参数

  **不同的执行时机**

![image-20210829222831977](/assets/img/Docker/Docker3-Dockerfile/image-20210829222831977.png)

**RUN-构建时运行**

```dockerfile
RUN yum install -y vim  #Shell 命令格式
RUN ["yum","install","-y","vim"] #Exec命令格式
```

为什么提供两种方式？

区别：是否创建子进程。推荐使用**Exec命令格式**

**Shell运行方式**

> 使用Shell执行时，当前shell是父进程，生成一个子shell进程
> 在子shell中执行脚本。脚本执行完毕，退出子shell，回到当前shell。

**Exec运行方式**

> 使用Exec方式，会用Exec进程替换当前进程，并且保持PID不变
> 执行完毕，直接退出，并不会退回之前的进程环境

**ENTRYPOINT启动命令**

- ENTRYPOINT(入口点)用于在容器启动时执行命令

- Dockerfile中只有最后一个ENTRYPOINT会被执行

- ENTRYPOINT ["ps"] #推荐使用Exec格式

  

**CMD默认命令**

- CMD用于设置默认执行的命令
- 如Dockerfile中出现多个CMD,则只有最后一个被执行
- 如容器启动时附加指令,则CMD被忽略
- CMD ["ps" , "-ef"] #推荐使用Exec格式



ps: **ENTRYPOINT一定会运行，CMD不一定**，ENTRYPOINT与CMD都使用，两行会合并执行

```dockerfile
FROM centos
RUN ["echo","image building!!!"]
ENTRYPOINT ["ps"]
CMD ["-ef"]
```

`docker run -d -p 8001:8080 gary/mywebapp:1.0 ls`  启动时附加指令 dockfile的**cmd**命令不会执行



# 部署redis

```dockerfile
FROM centos
RUN ["yum" , "install" , "-y" ,"gcc","gcc-c++","net-tools","make"]
WORKDIR /usr/local
ADD redis-4.0.14.tar.gz .
WORKDIR /usr/local/redis-4.0.14/src
RUN make && make install
WORKDIR /usr/local/redis-4.0.14
ADD redis-7000.conf .
EXPOSE 7000
CMD ["redis-server","redis-7000.conf"]
```

 `docker build -t gary/redis:1.0 .` 制作镜像

`docker run -p 7001:7000 gary/redis:1.0` 启动容器

 `redis-cli -p 7001` 验证
