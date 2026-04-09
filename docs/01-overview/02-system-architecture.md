# 02 系统架构

## 1. 总体结构

当前系统采用“教师端持有内容，核心提供运行时能力”的边界划分：

```text
Teacher Desktop
  -> Teacher Server
     -> course/files/layout/submissions API
     -> runtime-control
     -> render-engine

Student Desktop
  -> connects to teacher server
  -> receives course state and resource URLs

Core Repo
  -> standalone runtime-only service
  -> protocol and runtime extraction layer

Editor Plugin
  -> local .lume preview only
```

## 2. 仓库边界

### `repos/core`

负责：

- Socket 会话控制
- 课堂状态同步
- 投票、标注、提交等事件转发
- 渲染引擎静态托管

不负责：

- 课程扫描
- 课件文件读写
- 布局保存
- 提交落盘

### `repos/teacher`

负责：

- 教师端 Electron 应用
- 教师端内置 HTTP 服务
- 课程扫描与目录管理
- 课件资源托管
- 座位表和布局管理
- 学生提交保存、浏览、打包下载
- 课堂主控制链路

### `repos/student`

负责：

- 学生端 Electron 应用
- 教师地址配置
- 同步展示课件
- 投票、互动、提交
- 断线重连和全屏控制

### `repos/editor-plugin`

负责：

- `.lume` 文件本地预览
- 编辑器侧调试和辅助开发

## 3. 当前实际运行模式

从当前代码实现看，正式课堂的主链路由教师端承担：

- 教师端启动后会拉起本地教师服务。
- 学生端连接的是教师端地址，例如 `http://教师机IP:3000`。
- 教师端既负责数据面，也负责课堂主运行时。
- `core` 仓保留独立运行时实现，主要用于内核演进、协议稳定和独立部署准备。

## 4. 数据面与控制面

数据面由教师端负责：

- 课程列表
- 目录结构
- 课件静态内容
- 组件清单
- 布局数据
- 提交文件

控制面由运行时负责：

- 当前课程与页码
- 课堂开始与结束
- 学生在线状态
- 投票状态
- 标注同步
- 互动同步

## 5. 关键结论

- 课件和业务文件不属于 `core`。
- 学生端依赖教师端，不依赖独立的核心数据面服务。
- `core` 是运行时内核仓，不是内容仓。

建议继续阅读：

- [仓库地图](./03-repository-map.md)
- [课堂同步机制](../06-runtime-and-interaction/01-classroom-sync.md)
