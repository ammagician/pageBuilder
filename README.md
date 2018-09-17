PageBuilder介绍

一：简介
	PageBuilder是一个用于组合各种页面功能模块的工具。使用简单，适用于新项目，也可以对旧项目经过简单改造实现组合功能。可以是项目基于业务进行模块拆分组合，或者是组合子系统为新的系统。也可以引用外网第三方系统模块资源。

二：使用方法
	在HTML文件头里面引入pageBuilder.js。然后在业务JS文件里面按照规范实现即可。

三：规范
	引入文件后，会在window暴露全局变量window.PageBuilder。所有API通过该变量调用。
	组件通过PageBuilder .define进行定义，通过PageBuilder .register进行注册，通过PageBuilder .load进行加载，通过PageBuilder .clear进行卸载。
	其中register过程需要在模块代码里面进行。
  
四： 实例
	请参考test目录下的index.html文件使用。

五：License
pageBuilder.js is available under the terms of the MIT License.
