---
layout: post
title: Docker1-容器化技术介绍
categories: Docker
tags: Docker
keywords: Docker1-容器化技术介绍
date: 2021-08-09
---

# 历史的演化

物理机时代  ->  虚拟机时代  ->  容器化时代

## 物理机时代

![image-20210829191456163](/assets/img/Docker/Docker1-Introduction/image-20210829191456163.png)

## 虚拟化时代

![image-20210829191521729](/assets/img/Docker/Docker1-Introduction/image-20210829191521729.png)

## 容器化时代

**容器化技术比虚拟机更灵活,更小巧**

![image-20210829191619353](/assets/img/Docker/Docker1-Introduction/image-20210829191619353.png)

### 容器化解决的问题

**容器技术**:有效的将单个操作系统的资源划分到孤立的组中，以便更好的在孤立的组之间平衡有冲突的资源使用需求，这种技术就是容器技术。



![image-20210829192805236](/assets/img/Docker/Docker1-Introduction/image-20210829192805236.png)

**Docker** 将应用程序与该程序的依赖，打包在一个文件里面。运行这个文件，就会生成一个虚拟容器。程序在这个虚拟容器里运行，就好像在真实的物理机上运行一样。有了 Docker，就不用担心环境问题。

**标准化的应用打包**

![image-20210829193424039](/assets/img/Docker/Docker1-Introduction/image-20210829193424039.png)

### 应用场景

![image-20210829192325938](/assets/img/Docker/Docker1-Introduction/image-20210829192325938.png)

# Docker

- 开源的应用容器引擎，基于 Go 语言开发
- 容器是完全使用沙箱机制,容器开销极低
- Docker就是容器化技术的代名词	
- Docker也具备一定虚拟化职能

## Docker的发展

![image-20210829194130649](/assets/img/Docker/Docker1-Introduction/image-20210829194130649.png)

## Docker安装

```markdown
# 安装所需的软件包。yum-utils 提供了 yum-config-manager ，并且 device mapper 存储驱动程序需要 device-mapper-persistent-data 和 lvm2。
yum install -y yum-utils
# 设置稳定的阿里云仓库  -ce表示社区版
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
# 将软件包信息提前在本地索引缓存
yum makecache fast
# 安装最新版本的 Docker社区版
yum -y install docker-ce
# 启动服务及验证版本
service docker start
docker version 
# 拉取镜像
docker pull hello-world
# 容器内运行hello-world应用程序
docker run hello-world
```
<center class="half">
    <img src="/assets/img/Docker/Docker1-Introduction/image-20210829200006994.png" width="450"/>
    <img src="/assets/img/Docker/Docker1-Introduction/image-20210829200253106.png" width="450"/>
</center>

## Docker  镜像加速

国内从 DockerHub 拉取镜像有时会遇到困难，此时可以配置镜像加速器。

阿里云镜像获取地址：https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors 登陆后，左侧菜单选中镜像加速器就可以看到你的专属地址

![image-20210829201311244](/assets/img/Docker/Docker1-Introduction/image-20210829201311244.png)

`Centos`可以通过修改daemon配置文件~来使用加速器

```shell
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://******.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

**检查加速器是否生效**

在命令行执行 **docker info**

```yaml
 Insecure Registries:
  127.0.0.0/8
 Registry Mirrors:
  https://******.mirror.aliyuncs.com/
```

