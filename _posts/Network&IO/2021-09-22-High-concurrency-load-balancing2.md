---
layout: post
title: 高并发负载均衡2-LVS的DRTUNNAT模型推导
categories: Network和IO
tags: Network和IO
keywords: 高并发负载均衡2-LVS的DRTUNNAT模型推导
date: 2021-09-22
---
## ARP协议

http://c.biancheng.net/view/6388.html

https://www.cnblogs.com/csguo/p/7542944.html

在网络访问层中，同一局域网中的一台主机要和另一台主机进行通信，需要通过 MAC 地址进行定位，然后才能进行数据包的发送。而在网络层和传输层中，计算机之间是通过 IP 地址定位目标主机，对应的数据报文只包含目标主机的 IP 地址，而没有 MAC 地址。因此，在发送之前需要根据 IP 地址获取 MAC 地址，然后才能将数据包发送到正确的目标主机，而这个获取过程是通过 ARP 协议完成的。

### ARP协议工作原理

1. 每个主机都会在自己的 ARP 缓冲区中建立一个 ARP 列表，以表示 IP 地址和 MAC 地址之间的对应关系。
2. 主机（网络接口）**新加入网络时**（也可能只是mac地址发生变化，接口重启等）， 会发送免费ARP报文把**自己IP地址与Mac地址的映射关系广播给其他主机。**
3. 网络上的主机接收到免费ARP报文时，会更新自己的ARP缓冲区。将新的映射关系更新到自己的ARP表中。
4. 某个主机需要发送报文时，首先检查 ARP 列表中是否有对应 IP 地址的目的主机的 MAC 地址，如果有，则直接发送数据，如果没有，就向本网段的所有主机发送 ARP 数据包，该数据包包括的内容有：源主机 IP 地址，源主机 MAC 地址，目的主机的 IP 地址等。
5. 当本网络的所有主机收到该 ARP 数据包时：

​       **（A）**首先检查数**据包中的 IP 地址是否是自己的 IP 地址**，如果**不是，则忽略该数据包。**

​      **（B）**如果是，**则首先从数据包中取出源主机的 IP 和 MAC 地址写入到 ARP 列表中，如果已经存在，则覆盖。**

​       **（C）**然后将自己的 MAC 地址写入 ARP 响应包中，告诉源主机自己是它想要找的 MAC 地址。

​     6.源主机收到 ARP 响应包后。将目的主机的 IP 和 MAC 地址写入 ARP 列表，并利用此信息发送数据。如果源主机一直没有收到 ARP 响应数据包，表示 ARP 查询失败。



### 例子

主机node11的IP地址是192.168.10.71，node11上添加了一个虚拟网卡192.168.88.88之后，要在node12上ping通这个新添加的网卡地址，需要手动配一下路由表条目，否则这个ping会被发送到网关192.168.10.2上，导致ping不通。


> 每次成功得到 ARP 响应以后，就会将 IP 地址对应的 MAC 地址添加到 ARP 缓存中。用户可以通过 arp 命令查看 ARP 缓存中的信息，并验证是否会将目标 IP 地址和 MAC 地址添加到 ARP 缓存中。

```markdown
# node11
[root@node11 ~]# ifconfig ens33:3 192.168.88.88/24
[root@node11 ~]# ifconfig|grep -A 100 ens33
ens33: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.10.71  netmask 255.255.255.0  broadcast 192.168.10.255
        inet6 fe80::f8e8:de3:6deb:57dd  prefixlen 64  scopeid 0x20<link>
        ether 00:0c:29:72:1e:ca  txqueuelen 1000  (Ethernet)
        RX packets 1937204  bytes 309036522 (294.7 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 21479178  bytes 31727910441 (29.5 GiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

ens33:3: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.88.88  netmask 255.255.255.0  broadcast 192.168.88.255
        ether 00:0c:29:72:1e:ca  txqueuelen 1000  (Ethernet)

```

![image-20210922231723246](/assets/img/Network&IO/High-concurrency-load-balancing2/image-20210922231723246.png)

## 网络包传输的过程

一个网络包在发送的过程中，每经过一跳，它的**目标mac地址、源mac地址**都要发生变化，而**源IP、目标IP**始终是不变的。源地址

192.168.1.4目标地址192.168.3.4

![image-20210922231751288](/assets/img/Network&IO/High-concurrency-load-balancing2/image-20210922231751288.png)

# 负载均衡

同一网络当中IP地址不能重复出现，否则会冲突，不知道应该发给谁。

![image-20210922231807303](/assets/img/Network&IO/High-concurrency-load-balancing2/image-20210922231807303.png)

## LVS

为什么Tomcat承受的并发少？

因为Tomcat是在协议的第7层，也就是应用层的软件，是整个网络通信过程中最末端的层次。况且Tomcat是Java开发的，它跑在JVM上，又要进行用户态内核态的切换，这样就更慢了。（Nginx也是在7层应用层，所以Nginx的带宽是有上限的，但是LVS是在4层的，可以承受更大的并发；socket可以看做是在第4层的，是一个规范的接口）
路由器只是三层的设备，只需要做转发。
现在我们从通信的角度考虑，如果有一个负载均衡服务器设备，可以根本不需要和客户端握手，收到数据包就直接转发出去，这样能够提高性能。这就是一种数据包级别的 四层负载均衡技术。

我们得到下面这样的拓扑模型，可以解决负载均衡的问题。

首先我们统一一下命名：
CIP：客户端client IP地址
VIP：负载均衡服务器的虚拟virtual IP
DIP：用于分发的dispacher IP
RIP：真实的服务器的real IP
![image-20210922231908936](/assets/img/Network&IO/High-concurrency-load-balancing2/image-20210922231908936.png)

### NAT 网路地址转换

NAT（Network Address Translation，网络地址转换）是1994年提出的。当在[专用网]内部的一些主机本来已经分配到了本地IP地址（即仅在本专用网内使用的专用地址），但又想和因特网上的主机通信（并不需要加密）时，可使用NAT方法。

https://baike.baidu.com/item/nat/320024?fr=aladdin

#### S-NAT：源地址替换协议

假设host1和host2都要访问百度,使用NAT网络地址转换，路由器自己维护一张转换表，把host1的`192.168.1.8:12121`和host2 `192.168.1.6:12121`分别转换成`6.6.6.6:123`和`6.6.6.6:321`，用不同的端口发送给百度，收到返回的数据包后，再按照自己记录的转换表，把网络包发送回给host1和host2。

![image-20210923000128458](/assets/img/Network&IO/High-concurrency-load-balancing2/image-20210923000128458.png)

#### D-NAT模式：目标地址转换协议，基于3层

可以用下图这种方式实现负载均衡：客户端发来的请求到负载均衡服务器，负载均衡服务器将请求分发到后面的server上，server将响应返回给负载均衡服务器，注意这之间需要多次源IP与目标IP的替换。

![image-20210923000108998](/assets/img/Network&IO/High-concurrency-load-balancing2/image-20210923000108998.png)

弊端：

- 非对称：客户端给服务端发送的请求数据量是很小的，但是服务端给客户端返回的数据量很大。下行的数据使服务器带宽成为瓶颈。

- 消耗算力(多次地址转换)

  

#### DR模型：直接路由模型，基于2层，替换的是MAC地址而不是IP地址

如果有这么一种技术：每一个server都能够配一个VIP，但是由于IP不能重复，这个VIP对外隐藏，只对内可见。两台server共同在负载均衡服务器上对外暴露同一个VIP，别人请求只能请求到这台负载均衡服务器上来，这样就能从server直接向客户端返回数据包，而不需要走负载均衡服务器了。
负载均衡服务器在转发数据包的时候，将封装的目标mac地址修改为real server的mac地址（mac地址是点到点的，代表的是一跳的距离，要保证负载均衡服务器与你的server在同一个网络中，不能下一跳跳到别的网络去。这种修改mac地址的模式是基于2层链路层的，没有修改3层网络层。

优势：速度快，成本低

缺点：不能跨网络，负载均衡服务器和真实服务器RS realserver要在同一个局域网。这是一个约束）。

![image-20210923225007009](/assets/img/Network&IO/High-concurrency-load-balancing2/image-20210923225007009.png)
