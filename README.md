PageBuilder 介绍

一：简介
PageBuilder 是一个用于组合各种页面功能模块的工具。使用简单，适用于新项目，也可以对旧项目经过简单改造实现组合功能。可以是项目基于业务进行模块拆分组合，或者是组合子系统为新的系统。也可以引用外网第三方系统模块资源。

二：使用方法
在 HTML 文件头里面引入 pageBuilder.js。然后在业务 JS 文件里面按照规范实现即可。

三：规范
引入文件后，会在 window 暴露全局变量 window.PageBuilder。所有 API 通过该变量调用。
组件通过 PageBuilder.define 进行定义，通过 PageBuilder.register 进行注册，通过 PageBuilder.load 进行加载，通过 PageBuilder.clear 进行卸载。
其中 register 过程需要在业务模块代码里面进行。

四： 实例
请参考 test 目录下的 index.html 文件使用。

五：License
pageBuilder.js is available under the terms of the MIT License.
