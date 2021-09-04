---
layout: post
title: Docker4-通信与数据共享
categories: Docker
tags: Docker
keywords: Docker4-通信与数据共享
date: 2021-08-12
---
# 单向通信

容器间Link单向通信

容器IP易变化，使用**容器名称通信**

```shell
# 容器名web1
docker run -d --name web1 tomcat
# 容器名 database
docker run -d --name database -it centos /bin/sh
# 查询容器信息 可以查看容器网络信息
docker inspect f01543f58de1
# link database 可以ping通dababase
docker run -d --name web --link database tomcat
```

![image-20210830224148352](/assets/img/Docker/Docker4-Sharing/image-20210830224148352.png)

![image-20210830223122341](/assets/img/Docker/Docker4-Sharing/image-20210830223122341.png)

# 双向通信

> Bridge网桥双向通信，网桥是虚拟网卡

**自定义一个网桥，然后把容器绑定到该网桥上，属于该网桥的所有容器可以实现双向连接**

![image-20210830224315966](/assets/img/Docker/Docker4-Sharing/image-20210830224315966.png)

```shell
# 容器名web
docker run -d --name web tomcat
# 容器名 database
docker run -d --name database -it centos /bin/sh
# 查询docker网络服务明细
docker network ls
# 创建自定义网桥
docker network create -d bridge my-bridge
# 绑定容器
docker network connect  my-bridge  web
docker network connect  my-bridge  database
```

![image-20210830225041492](/assets/img/Docker/Docker4-Sharing/image-20210830225041492.png)

# 共享数据

Volume容器间共享数据

![image-20210830225235622](/assets/img/Docker/Docker4-Sharing/image-20210830225235622.png)

![image-20210830225314914](/assets/img/Docker/Docker4-Sharing/image-20210830225314914.png)

```shell
#两种方式-v和--volumes-from
# 设置-v挂载宿主机目录
# docker run --name 容器名  -v 宿主机路径:容器内挂载路径 镜像名
 docker run --name t1 -p 8000:8080 -d -v /home/java/docker/webapps/:/usr/local/tomcat/webapps tomcat
  docker run --name t2 -p 8001:8080 -d -v /home/java/docker/webapps/:/usr/local/tomcat/webapps tomcat
# --volumes-from 共享容器内挂载点
# 1.创建共享容器 2.共享容器挂载点
docker create --name webpage -v /home/java/docker/webapps/:/usr/local/tomcat/webapps tomcat /bin/true
docker run --name t3 -p 8002:8080 -d --volumes-from webpage tomcat

```

# Docker Compose

> 容器编排工具    Compose 是用于定义和运行多容器 Docker 应用程序的工具。通过 Compose，您可以使用 YML 文件来配置应用程序需要的所有服务。然后，使用一个命令，就可以从 YML 文件配置中创建并启动所有服务。

 **多容器部署的麻烦事**

  ![image-20210830230629467](/assets/img/Docker/Docker4-Sharing/image-20210830230629467.png)

- Docker Compose 单机多容器部署工具    集群级别要使用`docker swarm` 或`k8s`

- 通过yml文件定义多容器如何部署

- WIN/MAC默认提供Docker Compose,Linux需安装

## 安装

```shell
# 运行以下命令以下载 Docker Compose 的当前稳定版本
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
# 可执行权限应用于二进制文件
sudo chmod +x /usr/local/bin/docker-compose
# 查看版本
docker-compose -version
```

## 部署WordPress

https://docs.docker.com/samples/wordpress/

```yaml
# 1.Create a docker-compose.yml
# 2.docker-compose up -d(-d和docker run -d一样,后台运行)
version: "3.9"
    
services:
  db:
    image: mysql:5.7
    volumes:
      - db_data:/var/lib/mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: somewordpress
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
    
  wordpress:
    depends_on:
      - db
    image: wordpress:latest
    volumes:
      - wordpress_data:/var/www/html
    ports:
      - "8000:80"
    restart: always
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_NAME: wordpress
volumes:
  db_data: {}
  wordpress_data: {}
```

![image-20210830232420981](/assets/img/Docker/Docker4-Sharing/image-20210830232420981.png)

## 部署WEB应用

**app dockerfile**

```dockerfile
FROM openjdk:8u222-jre
WORKDIR /usr/local/b***j
ADD b***j.jar .
ADD application.yml .
ADD application-dev.yml .
EXPOSE 80
CMD ["java","-jar","b***j.jar"]
```

`docker build -t gary/web-app .`  创建基础镜像

`docker run gary/web-app`  启动(当前没有db服务不可用)

**db dockerfile**

https://hub.docker.com/_/mysql

```dockerfile
FROM mysql:5.7
# 当容器第一次启动时，将使用提供的配置变量创建和初始化具有指定名称的新数据库。此外，它会执行文件（可扩展）.sh，.sql并且.sql.gz是在发现/docker-entrypoint-initdb.d
WORKDIR /docker-entrypoint-initdb.d
ADD init-db.sql .
```

`docker build -t gary/web-db .`  创建基础镜像

`docker run  -e MYSQL_ROOT_PASSWORD=root -d gary/web-db` 启动

![image-20210830234021385](/assets/img/Docker/Docker4-Sharing/image-20210830234021385.png)

**docker-compose**

```yaml
version: '3.3'
services:
  db:
    build: ./bsbdj-db/
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
  app:
    build: ./bsbdj-app/
    depends_on:
      - db
    ports:
      - "80:80"
    restart: always
```

`docker-compose up -d`  后台运行

`docker-compose logs` 查看docker日志

`docker-compose down`删除容器

![image-20210831215204367](/assets/img/Docker/Docker4-Sharing/image-20210831215204367.png)