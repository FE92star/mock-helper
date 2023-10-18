# mock-helper
* 一款基于yapi平台mock服务器的vscode插件

<a href="https://marketplace.visualstudio.com/items?itemName=fe92star.yapi-mock-server" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/fe92star.yapi-mock-server.svg?color=blue&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>


## 启动和发布
```bash
nr dev
nr release
```

## TODO

- [x] 开发工程搭建
- [x] 知识准备—熟悉掌握vscode插件开发流程、mock服务器开发原理
- [x] 梳理并罗列插件功能点
- [x] 整理yapi的开放API

## 技术方案

[mock-helper技术方案](https://www.yuque.com/heiwohenhao/se0vo5/rwk16v5a9m606x7f)

## 插件功能点

1. 通过项目本地`json`数据实现可配置化
2. 自动创建接口本地`mock/json`文件，实现本地数据的mock
3. 可以自由切换mock数据源
4. 提供根据接口名称完成搜索功能

## 参考资料

1. [vscode插件官方开发文档](https://code.visualstudio.com/api)
2. [yapi开放API文档](https://hellosean1025.github.io/yapi/openapi.html)
