---
layout: post
title: k8s-基本概念
categories: Docker
tags: Docker
keywords: k8s-基本概念
date: 2021-08-13
---
# 集群环境容器部署的困境

![image-20210831222158699](/assets/img/Docker/K8s-Concepts/image-20210831222158699.png)



**容器编排工具比较**
<center class="half">
    <img  src="/assets/img/Docker/K8s-Concepts/image-20210831223131748.png" width="300"/>
    <img  src="/assets/img/Docker/K8s-Concepts/image-20210831223142337.png" width="300"/>
    <img  src="/assets/img/Docker/K8s-Concepts/image-20210831223149317.png" width="300"/>
</center>

`Docker-Compose` 是用来管理你的容器的，Docker-Compose只能管理当前主机上的Docker

`Docker Swarm`管理多主机上的Docker容器的工具，可以负责帮你启动容器，监控容器状态，同时也提供服务之间的负载均衡，Swarm现在与Docker Engine完全集成，并使用标准API和网络。

`Kubernetes`它本身的角色定位是和Docker Swarm 是一样的，也就是说他们负责的工作在容器领域来说是相同的部分

# Kubernetes

## Kubernetes的职责

- 自动化容器的部署和复制
- 随时扩展或收缩容器规模
- 容器分组Group，并且提供容器间的负载均衡
- 实时监控, 即时故障发现, 自动替换

## Kubernetes基本概念

下图由 3 个宿主机形成一个集群。一台 master，两台 node，node可以是独立的物理机，也可以是虚拟机。每一个节点中，都有Pod，是k8s控制的最小单元。

<center class="half">
    <img  src="/assets/img/Docker/K8s-Concepts/image-20210831222438735.png" width="700"/>
    <img  src="/assets/img/Docker/K8s-Concepts/image-20210831222453899.png" width="200"/>
</center>


- label 相当于 pod 的别名
- replication controller 用来控制 pod 的数量
- kubelet 用来提供k8s相关命令的执行
- kube-proxy 是代理，提供跨容器（跨主机）的通信

**POD(豆荚)**
<center class="half">
    <img  src="/assets/img/Docker/K8s-Concepts/image-20210831223903780.png" width="300"/>
    <img  src="/assets/img/Docker/K8s-Concepts/image-20210831224510820.png" width="600"/>
</center>
- POD是”容器”的容器,可以包含多个”Container”
- POD是K8S最小可部署单元,一个POD就是一个进程
- POD内部容器网络互通,每个POD都有独立虚拟IP
- Pause的容器辅助其他业务容器的网络栈和Volume挂载卷，容器之间共享命名空间，`localhost:port` 就可以互相访问
- POD都是部署完整的应用或模块

## Kubernetes安装

**国内安装K8S的四种途径**

- 使用kubeadmin通过离线镜像安装(1.14)
- 使用阿里公有云平台k8s,钞能力
- 通过yum官方仓库安装,上古版本
- 二进制包的形式进行安装,kubeasz (github)
  **Kubeadmin快速部署**

  ```shell
   # 环境准备命令
   1.  设置主机名与时区
       timedatectl set-timezone Asia/Shanghai  #都要执行
       hostnamectl set-hostname node11   #71执行  master节点
       hostnamectl set-hostname node12    #72执行
       hostnamectl set-hostname node13    #73执行
   
   2.  添加hosts网络主机配置,三台虚拟机都要设置
       vim /etc/hosts
       192.168.10.71  node11
       192.168.10.72  node12
       192.168.10.73  node13
   
   3.  关闭防火墙，三台虚拟机都要设置，生产环境跳过这一步
       sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config  #关闭安全设置
       setenforce 0  #临时生效
       systemctl disable firewalld
       systemctl stop firewalld
  ```

   **master和node节点都要执行**

```shell
  1. 将镜像包上传至服务器每个节点
     mkdir /usr/local/k8s-install
     cd /usr/local/k8s-install
     XFTP上传安装文件
  
  2. 按每个Centos上安装Docker
     tar -zxvf docker-ce-18.09.tar.gz
     cd docker 
     yum localinstall -y *.rpm
     systemctl start docker & systemctl enable docker
  
  3. 确保从cgroups均在同一个从groupfs
     #cgroups是control groups的简称，它为Linux内核提供了一种任务聚集和划分的机制，通过一组参数集合将一些任务组织成一个或多个子系统。   
     #cgroups是实现IaaS虚拟化(kvm、lxc等)，PaaS容器沙箱(Docker等)的资源管理控制部分的底层基础。
     #子系统是根据cgroup对任务的划分功能将任务按照一种指定的属性划分成的一个组，主要用来实现资源的控制。
     #在cgroup中，划分成的任务组以层次结构的形式组织，多个子系统形成一个数据结构中类似多根树的结构。cgroup包含了多个孤立的子系统，每一个子系统代表单一的资源
  
  docker info | grep cgroup 
  
  如果不是groupfs,执行下列语句
  
  cat << EOF > /etc/docker/daemon.json
  {
    "exec-opts": ["native.cgroupdriver=cgroupfs"]
  }
  EOF
  systemctl daemon-reload && systemctl restart docker
  
  4. 安装kubeadm
  
  # kubeadm是集群部署工具
  
  cd /usr/local/k8s-install/kubernetes-1.14
  tar -zxvf kube114-rpm.tar.gz
  cd kube114-rpm
  yum localinstall -y *.rpm
  
  5. 关闭交换区
     swapoff -a
     vi /etc/fstab 
     #swap一行注释
  
  6. 配置网桥
  
  cat <<EOF >  /etc/sysctl.d/k8s.conf
  net.bridge.bridge-nf-call-ip6tables = 1
  net.bridge.bridge-nf-call-iptables = 1
  EOF
  sysctl --system
  
  7. 通过镜像安装k8s
  
  cd /usr/local/k8s-install/kubernetes-1.14
  docker load -i k8s-114-images.tar.gz 
  docker load -i flannel-dashboard.tar.gz
```

<center class="half">
    <img  src="/assets/img/Docker/K8s-Concepts/image-20210901200444581.png" width="400"/>
    <img  src="/assets/img/Docker/K8s-Concepts/image-20210901204549650.png" width="400"/>
</center>


# kubeadmin创建集群

环境准备

```markdown
  Centos 7 Master * 1
     - Master: 192.168.10.71
  Centos 7 Node * 2
     - Node1: 192.168.10.72  
  	 - Node2: 192.168.10.73
```



```shell
  1. master主服务器配置
     kubeadm init --kubernetes-version=v1.14.1 --pod-network-cidr=10.244.0.0/16
  
  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config
  

  kubectl get nodes
  
  #查看存在问题的pod
  kubectl get pod --all-namespaces

  #安装flannel网络组件 pod之间进行通信的协议
  kubectl create -f kube-flannel.yml
  
  
  
  2. 加入NODE节点
	kubeadm join 192.168.10.71:6443 --token lpk03h.t0w6nrcmbue0ea7w \
    --discovery-token-ca-cert-hash sha256:e62ee7b5fa628bc44d621d9b586f138fab44c4a0d8522fc41eff4acd0d391ac5
  
  如果忘记
  在master 上执行kubeadm token list 查看 ，在node上运行
  kubeadm join 192.168.163.132:6443 --token aoeout.9k0ybvrfy09q1jf6 --discovery-token-unsafe-skip-ca-verification
  
  kubectl get nodes
  
  3. Master开启仪表盘
     kubectl apply -f kubernetes-dashboard.yaml
     kubectl apply -f admin-role.yaml
     kubectl apply -f kubernetes-dashboard-admin.rbac.yaml
     kubectl -n kube-system get svc
     http://192.168.163.132:32000 访问
```

`coredns`服务一直PEDDING

 ![image-20210901212554706](/assets/img/Docker/K8s-Concepts/image-20210901212554706.png)

发现该节点是不可调度的。这是因为kubernetes出于安全考虑默认情况下无法在master节点上部署pod，于是用下面方法解决：

```shell
kubectl taint nodes --all node-role.kubernetes.io/master-
```

`k8s集群部署成功`

![image-20210901212854244](/assets/img/Docker/K8s-Concepts/image-20210901212854244.png)

![image-20210901213252028](/assets/img/Docker/K8s-Concepts/image-20210901213252028.png)

 **kubeadm/kubelet/kubectl区别**

- kubeadm是kubernetes集群快速构建工具
- kubelet运行在所有节点上,负责启动POD和容器,以系统服务形式出现
- kubectl:kubectl是kubenetes命令行工具,提供指令

**启动节点命令**

- 启动节点的K8S服务
- systemctl start kubelet
- 设置开机启动
- systemctl enable kubelet
