---
layout: post
title: 高并发负载均衡1-网络协议原理
categories: Network和IO
tags: Network和IO
keywords: 高并发负载均衡1-网络协议原理
date: 2021-09-21
---
# 背景

中国基础人群大，保守估计消费的活跃用户约2.4亿，硅谷的AI 建立亚太研究院 重视中国市场。

应该把钱花在哪里？营销上，而不是技术上。这样你赚得更多。

案例：百度买关键字排名，微博大V

于是在这个时代，高并发已经是每一家企业都要面临的。在web容器的日志里你要记录些什么？分析渠道的流量的质量，分析不同的渠道给我带来多少的访问量。每个渠道的转化率，购买力。这样就可以知道下一轮投资应该在什么渠道多投广告。

制造向服务行业转型

# 七层模型

软件“工程”学：有分层、解耦的概念，因此我们有**七层模型**。

![image-20210912234908630](/assets/img/Network&IO/High-concurrency-load-balancing1/image-20210912234908630.png)

# 网络协议

![image-20210912234934495](/assets/img/Network&IO/High-concurrency-load-balancing1/image-20210912234934495.png)

## TCP

TCP 是面向连接的，可靠的传输协议，是有确认的。

**三次握手**

![image-20210912235016347](/assets/img/Network&IO/High-concurrency-load-balancing1/image-20210912235016347.png)

**四次挥手**

![image-20210912235146614](/assets/img/Network&IO/High-concurrency-load-balancing1/image-20210912235146614.png)

**三次握手->数据传输->四次分手，这个过程称为一个最小粒度，不可被分割。**

![image-20210914233918406](/assets/img/Network&IO/High-concurrency-load-balancing1/image-20210914233918406.png)

**service mesh**  微服务的下一代    `微服务 中台 mesh`

### 模拟浏览器完成一侧网页访问的请求

第一步建立连接

第二步才是传送数据（http协议：规范标准）

最终给你演示的是一个应用层协议

![image-20210914233749179](/assets/img/Network&IO/High-concurrency-load-balancing1/image-20210914233749179.png)

## 网络查看

```markdown
[root@node12 ~]# cat /etc/sysconfig/network-scripts/ifcfg-ens33 
TYPE=Ethernet
PROXY_METHOD=none
BROWSER_ONLY=no
BOOTPROTO=static
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=yes
IPV6_AUTOCONF=yes
IPV6_DEFROUTE=yes
IPV6_FAILURE_FATAL=no
IPV6_ADDR_GEN_MODE=stable-privacy
NAME=ens33
DEVICE=ens33
ONBOOT=yes
GATEWAY=192.168.10.2
NETMASK=255.255.255.0
IPADDR=192.168.10.72
DNS1=8.8.8.8
DNS2=8.8.4.4
```

查看路由表

```
[root@node12 ~]# route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         192.168.10.2    0.0.0.0         UG    100    0        0 ens33
10.244.0.0      10.244.0.0      255.255.255.0   UG    0      0        0 flannel.1
10.244.2.0      10.244.2.0      255.255.255.0   UG    0      0        0 flannel.1
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 docker0
192.168.10.0    0.0.0.0         255.255.255.0   U     100    0        0 ens33
```

下一跳机制
基于下一跳机制：每一个互联网的设备，内存不需要存储全网的数据，只需要存储它周边一个网络当中的数据。
路由判定：通过按位与找到下一跳

链路层：在网络层的基础上，又封装了一层。在发送方发出的网络包去寻找接收方的整个过程中，ip地址和port不会发生变化，变化的是随着每一次发到下一跳的时候的mac地址的改变。
`arp -an`，查看同一局域网内，ip地址和硬件地址的映射

```
[root@node11 fd]# arp -an|grep ens33
? (192.168.10.1) at 00:50:56:c0:00:08 [ether] on ens33
? (192.168.10.73) at 00:0c:29:8e:8b:f7 [ether] on ens33
? (192.168.10.72) at 00:0c:29:57:cb:66 [ether] on ens33
? (192.168.10.2) at 00:50:56:fb:f6:f0 [ether] on ens33
? (192.168.10.74) at 00:0c:29:72:81:23 [ether] on ens33
```

