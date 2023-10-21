# mock-helper
* 基于yapi平台，一键启动mock服务的vscode插件

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
- [x] yapi平台开放api获取服务
- [x] 创建本地json数据
- [x] 视图相关
- [x] 核心代理服务
- [x] 切换mock数据源
- [x] 注册command逻辑
- [x] 入口逻辑
- [ ] 本地调试
- [ ] 自动生成api的类型信息并创建打开vscode webview
- [ ] 补充完善文档

## 插件功能点

1. 通过项目本地`mock.config.json`数据实现可配置化
2. 自动创建接口本地`mock/json`文件，实现本地数据的mock
3. 可以自由切换mock数据源

## 参考资料

1. [vscode插件官方开发文档](https://code.visualstudio.com/api)
2. [yapi开放API文档](https://hellosean1025.github.io/yapi/openapi.html)
