---
layout: post
title: GO介绍
categories: GOLANG
tags: GOLANG
keywords: GO介绍
date: 2022-08-25
---

## 简介

Go（又称 Golang）是 Google 的 Robert Griesemer，Rob Pike 及 Ken Thompson 开发的一种计算机编程语言语言。

罗伯特·格瑞史莫（Robert Griesemer），罗勃·派克（Rob Pike）及肯·汤普逊（Ken Thompson）于2007年9月开始设计Go，稍后Ian Lance Taylor、Russ Cox加入项目。

2007年，谷歌工程师Rob Pike, Ken Thompson和Robert Grisemer开始设计一门全新的语言，这是Go语言的最初原型。
2009年11月，Google将Go语言以开放源代码的方式向全球发布。 
2015年8月，Go1.5版发布，本次更新中移除了"最后残余的c代码"   
2017年2月,Go语言Go 1.8版发布。
2017年8月，Go语言Go 1.9版发布。
2018年2月，Go语言Go1.10版发布。
2018年8月，Go语言Go1.11版发布。
2019年2月，Go语言Go1.12版发布。
2019年9月，Go语言Go1.13版发布。
2020年2月，Go语言Go1.14版发布。
2020年8月，Go语言Go1.15版发布。
....一直迭代

## 设计初衷

Go语言是谷歌推出的一种的编程语言，可以在不损失应用程序性能的情况下降低代码的复杂性。谷歌首席软件工程师罗布派克(Rob Pike)说：我们之所以开发Go，是因为过去10多年间软件开发的难度令人沮丧。派克表示，和今天的C++或C一样，Go是一种系统语言。他解释道，"使用它可以进行快速开发，同时它还是一个真正的编译语言，我们之所以现在将其开源，原因是我们认为它已经非常有用和强大。"

1)  计算机硬件技术更新频繁，性能提高很快。目前主流的编程语言发展明显落后于硬件，不能合理利用多核多CPU的优势提升软件系统性能。
2)  软件系统复杂度越来越高，维护成本越来越高，目前缺乏一个足够简洁高效的编程语言。
3)  企业运行维护很多c/c++的项目，c/c++程序运行速度虽然很快，但是编译速度确很慢，同时还存在内存泄漏的一系列的困扰需要解决。

## 应用领域

![image-20220821150148186](/assets/img/Go/GO-Introduction/image-20220821150148186.png)

## 开发环境

【1】搭建Go开发环境 - 安装和配置SDK
基本介绍:

1) SDK的全称(Software Development Kit 软件开发工具包)
2) SDK是提供给开发人员使用的，其中包含了对应开发语言的工具包。

【2】SDK下载
1) Go语言的官网为: golang.org ,无法访问，需要翻墙。
2) SDK下载地址 : Golang中文社区：https://studygolang.com/dl  

【3】安装SDK：
请注意：安装路径不要有中文或者特殊符号如空格等
SDK安装目录建议:一般我安装在d:/golang_sdk安装时 , 基本上是傻瓜式安装，解压就可以使用

配置环境变量 `path=E:\knowledge\go\bin`![image-20220821151032699](/assets/img/Go/GO-Introduction/image-20220821151032699.png)

## Helloworld

目录结构

![image-20220821151458777](/assets/img/Go/GO-Introduction/image-20220821151458777.png)

```go
package main  //声明文件所在的包,每个go文件必须归属的包

import "fmt"  //引入需要的包

func main()  {  //主函数

  fmt.Println("Hello world")

}
```

执行两种方式

1. 对源文件helloworld.go进行编译：go build, 执行操作 helloworld.exe

2. 通过go run直接可以帮我们编译 执行 源文件

   ![image-20220821152325185](/assets/img/Go/GO-Introduction/image-20220821152325185.png)

![image-20220821152312184](/assets/img/Go/GO-Introduction/image-20220821152312184.png)

![image-20220821152402602](/assets/img/Go/GO-Introduction/image-20220821152402602.png)

### 执行流程

![image-20220821152452688](/assets/img/Go/GO-Introduction/image-20220821152452688.png)

1)在编译时，编译器会将程序运行依赖的库文件包含在可执行文件中，所以，可执行文件变大了很多。
2)如果我们先编译生成了可执行女件，那么我们可以将该可执行文件拷贝到没有go开发环境的机器上，仍然可以运行
3)如果我们是直接go run go源代码，那么如果要在另外一个机器上这么运行，也需要go开发环境，否则无法执行。
4)go run运行时间明显要比第一种方式  长一点点

### 语法

（1）源文件以"go"为扩展名。
（2）程序的执行入口是main()函数。
（3）严格区分大小写。
（4）方法由一条条语句构成，每个语句后不需要分号(Go语言会在每行后自动加分号)，这也体现出Golang的简洁性。
（5）Go编译器是一行行进行编译的，因此我们一行就写一条语句，不能把多条语句写在同一个，否则报错
（6）定义的变量或者import的包如果没有使用到，代码不能编译通过。
（7）大括号都是成对出现的，缺一不可
（8）注释:用于注解说明解释程序的文字就是注释，注释提高了代码的阅读性;
> 	a. 行注释 //     VSCode快捷键：ctrl+/  再按一次取消注释
> 	b.块注释（多行注释） /**/        VSCode快捷键：shift+alt+a 再按一次取消注释

### 代码风格

【1】注意缩进
向后缩进：tab
向前取消缩进：shift+tab
`gofmt -w test.go` 完成格式化操作
【2】成对编程 {} （） “” ‘’ 
【3】运算符两边加空白
【4】注释：官方推荐行注释//
【5】go的设计者想要开发者有统一的代码风格，一个问题尽量只有一个解决方案是最好的
【6】行长约定：
一行最长不超过80个字符，超过的请使用换行展示，尽量保持格式优雅

### API

Golang中文网在线标准库文档: https://studygolang.com/pkgdoc

![image-20220821153905466](/assets/img/Go/GO-Introduction/image-20220821153905466.png)



## 语法

### 变量与基本数据类型

**变量的使用步骤**

1.声明	2.赋值	3.使用  

```go
package main
import "fmt"
func main()  {
	//1.变量的声明
	var age int
	//2.变量的赋值
	age = 18
	//3.变量的使用
	fmt.Println("age = ",age);

	//声明和赋值可以合成一句：
	var age2 int = 19
	fmt.Println("age2 = ",age2);
	// var age int = 20;
	// fmt.Println("age = ",age);
	/*变量的重复定义会报错：
			# command-line-arguments
			.\main.go:16:6: age redeclared in this block
							previous declaration at .\main.go:6:6
	*/
	//不可以在赋值的时候给与不匹配的类型
	var num int = 12.56 //float64
	fmt.Println("num = ",num);
}
```

**变量的4种使用方式**

第一种：变量的使用方式：指定变量的类型，并且赋值
第二种：指定变量的类型，但是不赋值，使用默认值 
第三种：如果没有写变量的类型，那么根据=后面的值进行判定变量的类型 （自动类型推断）
第四种：省略var，注意 := 不能写为 =

**声明多个变量**  `var n1,n2,n3 int`   `var n4,name,n5 = 10,"jack",7.8`   `n6,height := 6.9,100.6`

**全局变量** 
定义在函数外的变量

```go
var n7 = 100
var n8 = 9.7
```

设计者认为上面的全局变量的写法太麻烦了，可以一次性声明

```go
var (
        n9 = 500
        n10 = "netty"
)
```

**变量的数据类型**

![image-20220821160530937](/assets/img/Go/GO-Introduction/image-20220821160530937.png)

- 整数类型

![image-20220821161317586](/assets/img/Go/GO-Introduction/image-20220821161317586.png)

Golang程序中整型变量在使用时,遵守保小不保大的原则,即:在保证程序正确运行下,尽量使用占用空间小的数据类型

- 浮点类型

![image-20220821161724172](/assets/img/Go/GO-Introduction/image-20220821161724172.png)

- 字符类型

Golang中没有专门的字符类型，如果要存储单个字符(字母)，一般使用byte来保存，字符使用UTF-8编码

```go
package main
import "fmt"
func main(){
        //定义字符类型的数据：
        var c1 byte = 'a'
        fmt.Println(c1)//97
        var c2 byte = '6'
        fmt.Println(c2)//54
        var c3 byte = '('
        fmt.Println(c3 + 20)//40
        //字符类型，本质上就是一个整数，也可以直接参与运算，输出字符的时候，会将对应的码值做一个输出
        //字母，数字，标点等字符，底层是按照ASCII进行存储。
        var c4 int = '中'
        fmt.Println(c4)
        //汉字字符，底层对应的是Unicode码值
        //对应的码值为20013，byte类型溢出，能存储的范围：可以用int
        //总结：Golang的字符对应的使用的是UTF-8编码（Unicode是对应的字符集，UTF-8是Unicode的其中的一种编码方案）
        var c5 byte = 'A'
        //想显示对应的字符，必须采用格式化输出
        fmt.Printf("c5对应的具体的字符为：%c",c5)
}
```
- 布尔类型
  bool类型数据只允许取值true和false，占1个字节

- 字符串类型
  字符串就是一串固定长度的字符连接起来的字符序列

  

**基本类型默认值**
  ![image-20220821163047895](/assets/img/Go/GO-Introduction/image-20220821163047895.png)

**基本类型转换**

Go在不同类型的变量之间赋值时需要显式转换，并且只有显式转换(强制转换)。

> 表达式T(v)将值v转换为类型T
> T : 就是数据类型
> v : 就是需要转换的变量

基本类型转string类型
> 方式1:fmt.Sprintf("%参数",表达式)    ---》 重点练习这个，推荐方式
> 方式2:使用strconv包的函数  

string类型转基本类型
> 方式1:使用strconv包的函数  
> 方式2:使用Parse***包的函数   

### 复杂数据类型

#### 指针

![image-20220821164837213](/assets/img/Go/GO-Introduction/image-20220821164837213.png)

```go
package main
import(
        "fmt"
)
func main(){
        var age int = 18
        //&符号+变量 就可以获取这个变量内存的地址
        fmt.Println(&age) //0xc0000a2058
        //定义一个指针变量：
        //var代表要声明一个变量
        //ptr 指针变量的名字
        //ptr对应的类型是：*int 是一个指针类型 （可以理解为 指向int类型的指针）
        //&age就是一个地址，是ptr变量的具体的值
        var ptr *int = &age
        fmt.Println(ptr)
        fmt.Println("ptr本身这个存储空间的地址为：",&ptr)
        //想获取ptr这个指针或者这个地址指向的那个数据：
        fmt.Printf("ptr指向的数值为：%v",*ptr) //ptr指向的数值为：18
}
```

最重要的就是两个符号

> & 取内存地址
> *根据地址取值

**指针特性**

1. 可以通过指针改变指向值
2. 指针变量接收的一定是地址值
3. 针变量的地址不可以不匹配
4. 基本数据类型（又叫值类型），都有对应的指针类型,形式为*数据类型

```go
func main(){
        var num int = 10
        fmt.Println(num)
        var ptr *int = &num
        *ptr = 20
        fmt.Println(num)
}
```

### 标识符

变量，方法等,只要是起名字的地方,那个名字就是标识符 `var age int = 19   var price float64 = 9.8`

**标识符定义规则**

1. 三个可以（组成部分）：数字，字母，下划线_

2. 不可以以数字开头，严格区分大小写，不能包含空格，不可以使用Go中的保留关键字 

3. 见名知意：增加可读性

4. 下划线"_"本身在Go中是一个特殊的标识符，称为空标识符。可以代表任何其它的标识符，但是它对应的值会被忽略(比如:忽略某个返回值)。所以仅能被作为占位符使用，不能单独作为标识符使用。

   ![image-20220821165701986](/assets/img/Go/GO-Introduction/image-20220821165701986.png)

5. 可以用如下形式，但是不建议： `var int int = 10`  (int,float32,float64等不算是保留关键字，但是也尽量不要使用)

6. 长度无限制，但是不建议太长

7. 起名规则

   - 包名:尽量保持package的名字和目录保持一致，尽量采取有意义的包名，简短，有意义，和标准库不要冲突

   为什么之前在定义源文件的时候，一般我们都用package main 包 ？
   main包是一个程序的入口包，所以你main函数它所在的包建议定义为main包，如果不定义为main包，那么就不能得到可执行文件。

   - 尽量保持package的名字和目录保持一致

   - 和标准库不要冲突
   
   - 变量名、函数名、常量名 : 采用驼峰法
   
   - 如果变量名、函数名、常量名首字母大写，则可以被其他的包访问; 如果首字母小写，则只能在本包中使用  （利用首字母大写小写完成权限控制）
   
     **go导入包**https://www.h5w3.com/235505.html

### 关键字

![image-20220821165331989](/assets/img/Go/GO-Introduction/image-20220821165331989.png)

### 运算符

![image-20220821223139671](/assets/img/Go/GO-Introduction/image-20220821223139671.png)

![image-20220821223715943](/assets/img/Go/GO-Introduction/image-20220821223715943.png)

**在编程中，需要接收用户输入的数据，就可以使用键盘输入语句来获取。**

![image-20220821223755277](/assets/img/Go/GO-Introduction/image-20220821223755277.png)

### 流程控制

![image-20220821224216283](/assets/img/Go/GO-Introduction/image-20220821224216283.png)

**switch**

```go
switch 表达式 {
                        case 值1,值2,.….:
                                                        语句块1
                        case 值3,值4,...:
                                                        语句块2
                        ....
                        default:
                         语句块
}
```

（1）switch后是一个表达式(即:常量值、变量、一个有返回值的函数等都可以)
（2）case后面的值如果是常量值(字面量)，则要求不能重复
（3）case后的各个值的数据类型，必须和 switch 的表达式数据类型一致
（4）case后面可以带多个值，使用逗号间隔。比如 case 值1,值2...
（5）case后面不需要带break 
（6）default语句不是必须的，位置也是随意的。
（7）switch后也可以不带表达式，当做if分支来使用
![image-20220821224856692](/assets/img/Go/GO-Introduction/image-20220821224856692.png)
（8）switch后也可以直接声明/定义一个变量，分号结束，不推荐
![image-20220821224936085](/assets/img/Go/GO-Introduction/image-20220821224936085.png)

（9)switch穿透，利用fallthrough关键字，如果在case语句块后增加fallthrough ,则会继续执行下一个case,也叫switch穿透。

![image-20220821225024824](/assets/img/Go/GO-Introduction/image-20220821225024824.png)

**for循环**

```go
package main

import (
	"fmt"
)
func main()  {
         //利用for循环来解决问题：
         var sum int = 0
         for i := 1 ; i <= 5 ; i++ {
                 sum += i
         }
         //输出结果：
         fmt.Println(sum)       

        var str string = "hello golang你好"
        //方式1：普通for循环：按照字节进行遍历输出的 （暂时先不使用中文）
        // for i := 0;i < len(str);i++ {//i:理解为字符串的下标
        // 	fmt.Printf("%c \n",str[i])
        // }
        //方式2：for range
        for i , value := range str {
                fmt.Printf("索引为：%d,具体的值为：%c \n",i,value)
        }
        //死循环：
        // for {
        // 	fmt.Println("你好 Golang")
        // }
        i := 1

        for ; i <= 100; i++ {
                if i % 6 != 0 {
                        continue //结束本次循环，继续下一次循环
                }
                if i >= 80 {
                        //停止正在执行的这个循环：
                        break 
                }
                fmt.Println(i)
        }
        fmt.Println(i)
}
```

关键字  `break  continue  goto return`

break的作用结束离它最近的循环
continue的作用是结束离它近的那个循环，继续离它近的那个循环
return 结束当前的函数
goto 语句可以无条件地转移到程序中指定的行，一般不建议使用goto语句，以免造成程序流程的混乱。

### 函数

提高代码的复用型，减少代码的冗余，代码的维护性也提高了，定义：为完成某一功能的程序指令(语句)的集合,称为函数。

```go
func   函数名（形参列表)（返回值类型列表）{
                        执行语句..
                        return + 返回值列表
}
```

```go
package main
import "fmt"

//自定义函数：功能：两个数相加：
func cal (num1 int,num2 int) (int) { //如果返回值类型就一个的话，那么()是可以省略不写的
        var sum int = 0
        sum += num1
        sum += num2
        return sum
}
func main(){
        //功能：10 + 20
        //调用函数：
        sum := cal(10,20)
        fmt.Println(sum)

        //功能：30 + 50
        var num3 int = 30
        var num4 int = 50
        //调用函数：
        sum1 := cal(num3,num4)
        fmt.Println(sum1)

}
```

#### 函数名

遵循标识符命名规范:见名知意 addNum,驼峰命名addNum
首字母不能是数字     首字母大写该函数可以被本包文件和其它包文件使用(类似public)    首学母小写只能被本包文件使用，其它包文件不能使用(类似private)

#### 形参列表

形参列表：个数：可以是一个参数，可以是n个参数，可以是0个参数    形式参数列表：作用：接收外来的数据    实际参数：实际传入的数据

#### 返回值类型列表

函数的返回值对应的类型应该写在这个列表中   `返回值个数<1个可以不写`

![image-20220821231123414](/assets/img/Go/GO-Introduction/image-20220821231123414.png)

**内存分析**

```go
package main
import "fmt"
//自定义函数：功能：交换两个数
func exchangeNum (num1 int,num2 int){ 
        var t int
        t = num1
        num1 = num2
        num2 = t
}
func main(){	
        //调用函数：交换10和20
        var num1 int = 10
        var num2 int = 20
        fmt.Printf("交换前的两个数： num1 = %v,num2 = %v \n",num1,num2)
        exchangeNum(num1,num2)
        fmt.Printf("交换后的两个数： num1 = %v,num2 = %v \n",num1,num2)
}
```

![image-20220821231354437](/assets/img/Go/GO-Introduction/image-20220821231354437.png)

#### Golang中函数不支持重载

![image-20220821231958845](/assets/img/Go/GO-Introduction/image-20220821231958845.png)

#### Golang中支持可变参数

```go
//定义一个函数，函数的参数为：可变参数 ...  参数的数量可变
//args...int 可以传入任意多个数量的int类型的数据  传入0个，1个，，，，n个
func test (args...int){
        //函数内部处理可变参数的时候，将可变参数当做切片来处理
        //遍历可变参数：
        for i := 0; i < len(args); i++ {
                fmt.Println(args[i])
        }
}
```

#### 值拷贝

基本数据类型和数组默认都是值传递的，即进行值拷贝。在函数内修改，不会影响到原来的值。

![image-20220821232110598](/assets/img/Go/GO-Introduction/image-20220821232110598.png)

#### 类引用传递

以值传递方式的数据类型，如果希望在函数内的变量能修改函数外的变量，可以传入变量的地址&，函数内以指针的方式操作变量。从效果来看类似引用传递。

![image-20220821232224721](/assets/img/Go/GO-Introduction/image-20220821232224721.png)

#### 函数也是一种数据类型

在Go中，函数也是一种数据类型，可以赋值给一个变量，则该变量就是一个函数类型的变量了。通过该变量可以对函数调用。

#### 函数可以作为形参

函数既然是一种数据类型，因此在Go中，函数可以作为形参，并且调用（把函数本身当做一种数据类型）

#### 支持自定义数据类型

为了简化数据类型定义,Go支持自定义数据类型
基本语法: type 自定义数据类型名  数据类型 

```go
package main
import "fmt"
//定义一个函数：
func test(num int){
        fmt.Println(num)
}
//定义一个函数，把另一个函数作为形参：
func test02 (num1 int ,num2 float32, testFunc func(int)){
        fmt.Println("-----test02")
}
func main(){
        //函数也是一种数据类型，可以赋值给一个变量	
        a := test//变量就是一个函数类型的变量
        fmt.Printf("a的类型是：%T,test函数的类型是：%T \n",a,test)//a的类型是：func(int),test函数的类型是：func(int)
        //通过该变量可以对函数调用
        a(10) //等价于  test(10)
        //调用test02函数：
        test02(10,3.19,test)
        test02(10,3.19,a)

		type myInt int //自定义数据类型相当于起了一个别名
		var num1 myInt = 30
		fmt.Println("num1",num1)
		var num2 int
		num2 =int(num1)  //虽然是别名但是go编译器认为myInt和int类型不同
		fmt.Println("num2",num2)
}
```

#### 支持对函数返回值命名

对函数返回值命名，里面顺序就无所谓了，顺序不用对应

![image-20220821233128711](/assets/img/Go/GO-Introduction/image-20220821233128711.png)

### 包引入

我们不可能把所以的函数放在同一个源文件中，可以分门别类的把函数放在不同的源文件中

可以解决函数同名问题：两个人都想定义一个同名的函数，在同一个文件中是不可以定义相同名字的函数的。此时可以用包来区分

![image-20220821233740754](/assets/img/Go/GO-Introduction/image-20220821233740754.png)

项目的结构

![image-20220823222218561](/assets/img/Go/GO-Introduction/image-20220823222218561.png)

[GO引入自己的包运行时出现package 包路径 is not in GOROOT 问题](https://blog.csdn.net/weixin_51924047/article/details/123450842)

```go
//main.go
package main //1.package进行包的声明，建议：包的声明这个包和所在的文件夹同名
import (
	"fmt"
	"gocode/testproject1/demo01/crm/dbutils" //3.包名是从$GOPATH/src/后开始计算的，使用/进行分隔
	 test "gocode/testproject1/demo01/crm/calutils" //10. 可以给包取别名，取别名后，原来的包名就不能使用了
)
func main(){//2.main包是程序的入口包，一般main函数会放在这个包下
	fmt.Println("Hello ,这是main函数的执行")
	dbutils.GetConn()//4.在函数调用的时候前面要定位到所在的包
	test.Add()
}
//5.首字母大写，可以被其他包使用
//6.函数名，变量名首字母大写，函数，变量可以被其它包访问
//7.一个目录下不能有重复的函数
//8.包名和文件夹的名字，可以不一样
//9.个目录下的同级文件归属一个包同级别的源文件的包的声明必须一致
```

![image-20220823222843587](/assets/img/Go/GO-Introduction/image-20220823222843587.png)

### 特殊函数

#### init函数

【1】init函数：初始化函数，可以用来进行一些初始化的操作
每一个源文件都可以包含一个init函数，该函数会在main函数执行前，被Go运行框架调用。

【2】全局变量定义，init函数，main函数的执行流程？

【3】多个源文件都有init函数的时候，如何执行：

```go

package main 
import (
	"fmt"
	"gocode/testproject1/demo2/test"
)
var num int = test1()
func test1() int {
	fmt.Println("main.go这是test1函数的执行")
	return 10
}
func init(){
	fmt.Println("main.go这是int函数的执行")
}

func main(){
	fmt.Println("main.go这是main函数的执行")
	fmt.Println("Age=",test.Age)
}
```

![image-20220823225123134](/assets/img/Go/GO-Introduction/image-20220823225123134.png)

![image-20220823225326257](/assets/img/Go/GO-Introduction/image-20220823225326257.png)

#### 匿名函数

【1】Go支持匿名函数，如果我们某个函数只是希望使用一次，可以考虑使用匿名函数
【2】匿名函数使用方式：
（1）在定义匿名函数时就直接调用，这种方式匿名函数只能调用一次（用的多）
（2）将匿名函数赋给一个变量(该变量就是函数变量了)，再通过该变量来调用匿名函数（用的少）
【3】如何让一个匿名函数，可以在整个程序中有效呢?将匿名函数给一个全局变量就可以了

```go
package main 
import (
	"fmt"
)
var Func01 = func (num1 int,num2 int) int{
	return num1 * num2
}
func main(){
	result := func (num1 int,num2 int)  int{
		return num1 + num2
	}(10,20)
	fmt.Println("result=",result)
	//将匿名函数赋给一个变量，这个变量实际就是函数类型的变量
	//sub等价于匿名函数
	sub := func (num1 int,num2 int) int{
		return num1 - num2
	}
	result01 := sub(30,70)
	fmt.Println(result01)

	result02 := Func01(3,4)
	fmt.Println(result02)
}
```

#### 闭包

【1】什么是闭包：
闭包就是一个函数和与其相关的引用环境组合的一个整体
匿名函数中引用的那个变量会一直保存在内存中，可以一直使用
【2】闭包的本质：
闭包本质依旧是一个匿名函数，只是这个函数引入外界的变量/参数
匿名函数+引用的变量/参数 = 闭包
【3】特点：
（1）返回的是一个匿名函数，但是这个匿名函数引用到函数外的变量/参数 ,因此这个匿名函数就和变量/参数形成一个整体，构成闭包。
（2）闭包中使用的变量/参数会一直保存在内存中，所以会一直使用—》意味着闭包不可滥用（对内存消耗大）

```go
package main
import "fmt"

//函数功能：求和
//函数的名字：getSum参数为空
//getSum函数返回值为一个函数，这个函数的参数是一个int类型的参数，返回值也是int类型
func getSum() func (int) int {
	var sum int = 0
	return func (num int) int{
		sum = sum + num
		return sum
	}
}
//闭包，返回的匿名函数+匿名函数以外的变量num
func main(){
	f := getSum()
	fmt.Println(f(1)) //1
	fmt.Println(f(2))
	fmt.Println(f(3))
	fmt.Println(f(4))

	fmt.Println("---------------------")
	fmt.Println(getSum01(0,1))//1
	fmt.Println(getSum01(1,2))//3
	fmt.Println(getSum01(3,3))//6
	fmt.Println(getSum01(6,4))//10
}

func getSum01(sum int,num int) int{
	sum = sum + num
	return sum
//不使用闭包的时候：我想保留的值，不可以反复使用
//闭包应用场景：闭包可以保留上次引用的某个值，我们传入一次就可以反复使用了
}

```

#### 内置函数

Golang设计者为了编程方便，提供了一些函数，这些函数不用导包就可以直接使用，我们称之为Go的内置函数/内建函数。

这些函数调用的时候，不需要导包，直接用就可以了，通过api可以看到这些内置工具是在builtin这个包中的。

![image-20220823232242667](/assets/img/Go/GO-Introduction/image-20220823232242667.png)

```go
package main
import "fmt"

func main(){
	str := "golang"
	fmt.Println(len(str))

	//主要是用来分配内存的。其第一个实参为类型，而非值。其返回值为指向该类型的新分配的零值的指针。
	num := new(int)
	fmt.Printf("num的类型 %T, 值 %v 地址 %v  指针指向值 %v",num,num,&num,*num)
}
```

![image-20220823233023505](/assets/img/Go/GO-Introduction/image-20220823233023505.png)

make函数：
分配内存，主要用来分配引用类型（指针、slice切片、map、管道chan、interface 等）

#### 日期时间函数

时间类型

![image-20220825231707997](/assets/img/Go/GO-Introduction/image-20220825231707997.png)

```go
package main

import (
	"fmt"
	"time"
)
func main() {
	//当前时间
	t := time.Now()
	fmt.Println(t)
	fmt.Println("年", t.Year())
	fmt.Println("秒", t.Second())
	//日期格式化
	fmt.Println("当前时间", t.Format("2006-01-02 15:04:05"))

}
```

![image-20220825232715733](/assets/img/Go/GO-Introduction/image-20220825232715733.png)

### defer关键字

defer关键字的作用：
在函数中，程序员经常需要创建资源，为了在函数执行完毕后，及时的释放资源，Go的设计者提供defer关键字

```
package main
import "fmt"

func main(){
	fmt.Println(add(30,60))
}

func add(num1 int ,num2 int) int{
	//在Golang中，程序遇到defer关键字，不会立即执行defer后的语句，而是将defer后的语句压入一个栈中，然后继续执行函数后面的语句
	defer fmt.Println("num1=",num1)
	defer fmt.Println("num2=",num2)
	//栈的特点是：先进后出
	//在函数执行完毕以后，从栈中取除语句开始执行，安照先进后出的规则执行语句
	var sum int = num1 + num2
	fmt.Println("sum=",sum)
	return sum
}
```

![image-20220823231549323](/assets/img/Go/GO-Introduction/image-20220823231549323.png)

defer应用场景：
比如你想关闭某个使用的资源，在使用的时候直接随手defer，因为defer有延迟执行机制（函数执行完毕再执行defer压入栈的语句），
遇到defer关键字，会将后面的代码语句压入栈中，也会将**相关的值同时拷贝入栈中**，不会随着函数后面的变化而变化。

### string字符串

```go
package main

import (
	"fmt"
	"strconv"
	"strings"
)

func main() {
	var str string = "golang你好"
	fmt.Println(len(str))
	//遍历字符串
	for i, v := range str {
		fmt.Printf("索引 %d 值 %c \n", i, v)
	}
	//字符串转数字
	num, _ := strconv.Atoi("123")
	fmt.Println(num)
	//数字转字符串
	s := strconv.Itoa(3423)
	fmt.Println(s)
	//统计字符串有几个子串
	num1 := strings.Count("ADSDFDASGGDSAS", "DS")
	fmt.Println(num1)
	//不区分大小写
	b := strings.EqualFold("hello", "Hello")
	fmt.Println(b)
	//区分大小写
	fmt.Println("hello" == "Hello")
	//返回子串第一次出现位置
	num2 := strings.Index("ADSDFDASGGDSAS", "DS")
	fmt.Println(num2)

}
```

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	//字符串替换,n表示替换第几个，n=-1全部替换
	s := strings.Replace("adsfdsggffg", "sg", "==", -1)
	fmt.Println(s)
	//字符串切割
	s2 := strings.Split("12.23.456.45", ".")
	fmt.Println(s2)
	//大小写转换
	fmt.Println(strings.ToLower("Go"))
	fmt.Println(strings.ToUpper("Go"))
	//字符串空格去掉
	fmt.Println(strings.TrimSpace(" Go go   "))
	//字符串左右制定字符去掉
	fmt.Println(strings.Trim("~Go go~", "~"))
	//字符串是否字符串开头结尾
	fmt.Println(strings.HasPrefix("~Go go~", "~"))
	fmt.Println(strings.HasSuffix("~Go go~", "~"))
}
```

### 错误处理

```go
package main

import (
	"errors"
	"fmt"
)

func main() {
	err := test()
	if err != nil {
		fmt.Println("自定义错误", err)
		panic(err) //中断后续流程
	}
	fmt.Println("test结束")
}

func test() (err error) {
	//defer+recover进行异常捕获
	defer func() {
		//if the argument supplied to panic was nil, recover returns nil
		err := recover()
		if err != nil {
			fmt.Println("异常已经捕获")
			fmt.Println("错误是", err)
		}
	}()

	num1 := 10
	num2 := 0
	if num2 == 0 {
		//自定义错误
		return errors.New("除数不为0")
	}
	result := num1 / num2
	fmt.Println(result)
	return nil
}

```

![image-20220825234752575](/assets/img/Go/GO-Introduction/image-20220825234752575.png)
