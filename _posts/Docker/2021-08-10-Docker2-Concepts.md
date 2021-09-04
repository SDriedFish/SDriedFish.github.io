---
layout: post
title: Docker2-基本概念
categories: Docker
tags: Docker
keywords: Docker2-基本概念
date: 2021-08-10
---
# 基本概念

## Docker是容器化平台

> Docker是提供应用打包,部署与运行应用的容器化平台  Docker Engine类似JVM

![image-20210829202424502](/assets/img/Docker/Docker2-Concepts/image-20210829202424502.png)

## Docker体系结构

docker使用C/S 架构，docker daemon 作为 server 端接受 client 的请求，并处理（创建、运
行、分发容器），他们可以运行在一个机器上，也通过socket或者RESTful API 通信

![image-20210829202606746](/assets/img/Docker/Docker2-Concepts/image-20210829202606746.png)

## 容器与镜像

- 镜像: 镜像是文件,是只读的,提供了运行程序完整的软硬件资源,是应用程序的"集装箱"
- 容器: 是镜像的实例,由Docker负责创建,容器之间彼此隔离

## Docker执行流程

Docker利用容器来运行应用，一个Docker容器包含了所有的某个应用运行所需要的环境。每一个Docker 容器都是从Docker 镜像创建的，是通过镜像创建的运行实例。Docker容器可以运行、开始、停止、移动和删除。每一个Docker容器都是独立和安全的应用平台，彼此相互隔离、互不见

![image-20210829203315786](/assets/img/Docker/Docker2-Concepts/image-20210829203315786.png)

# 常用命令

- `docker pull` 镜像名<:tags> - 从远程仓库抽取镜像 
- `docker images` 查看本地镜像
- `docker run` 镜像名<:tags> - 创建容器，启动应用
- `docker ps` 查看正在运行中的镜像
- `docker rm <-f>` 容器id - 删除容器
- `docker rmi <-f>` 镜像名:<tags> - 删除镜像

```shell
# 下载指定版本(不指定为latest 使用最多的版本)
docker pull tomcat:8.5.55-jdk8-openjdk
# 查看镜像
docker images  
# 创建容器
docker run tomcat
# 创建容器 -p 端口映射
docker run  -p 8000:8080  tomcat
# 查看端口监听
netstat -tulpn
# 创建容器 后台运行
docker run  -p 8000:8080  -d tomcat:8.5.55-jdk8-openjdk
# 查看容器信息
docker ps
# 停止容器
docker stop eb021d91d3bf
# 删除容器
docker rm eb021d91d3bf
# 强制删除容器
docker rm -f eb021d91d3bf
# 删除镜像
docker rmi tomcat:8.5.55-jdk8-openjdk
```

![image-20210829210315389](/assets/img/Docker/Docker2-Concepts/image-20210829210315389.png)

**宿主机与容器通信**

> 进行端口映射

![image-20210829205114773](/assets/img/Docker/Docker2-Concepts/image-20210829205114773.png)

# 容器内部结构

**Tomcat容器内部结构**

![image-20210829213055950](/assets/img/Docker/Docker2-Concepts/image-20210829213055950.png)

`docker exec [-it] 容器id`  命令

- exec 在对应容器中执行命令
-   -it 采用交互方式执行命令

```shell
# 进入容器
docker exec -it 8514093b6d5e /bin/sh
# 退出
exit
```

**容器默认存储路径**

![image-20210829213627924](/assets/img/Docker/Docker2-Concepts/image-20210829213627924.png)

# 容器生命周期



![image-20210829213725367](/assets/img/Docker/Docker2-Concepts/image-20210829213725367.png)

**生命周期状态切换**

![image-20210829214604468](/assets/img/Docker/Docker2-Concepts/image-20210829214604468.png)

