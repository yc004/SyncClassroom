# System Architecture

本文档用于从根仓完整说明萤火课堂整套系统的结构、运行方式和端间交互。

## 1. 架构目标

系统拆分后的核心原则是：

- 教师端持有课件与文件管理能力。
- 核心只负责运行时控制与渲染能力。
- 学生端只消费课堂同步状态和教师端提供的资源。
- 编辑器插件只负责本地预览，不耦合正式课堂部署。

## 2. 仓库边界

### `repos/core`

核心仓包含：

- 运行时控制模块
- Socket 事件总线
- 课堂状态同步
- 渲染引擎静态托管

核心仓不包含：

- 课程扫描
- 课件目录管理
- 布局持久化
- 学生提交落盘
- 教学文件下载与导出

### `repos/teacher`

教师仓包含：

- 教师端 Electron 桌面应用
- 教师端内置 HTTP 服务
- 课程扫描与目录管理
- 课件静态资源托管
- 座位表与布局管理
- 学生提交保存、浏览、下载
- 教师侧课堂控制能力

### `repos/student`

学生仓包含：

- 学生端 Electron 桌面应用
- 教师地址配置
- 课堂内容展示
- 跟随翻页、课堂状态同步
- 投票、互动、提交等课堂参与逻辑

### `repos/editor-plugin`

插件仓包含：

- VS Code 插件入口
- 本地 `.lume` 文件预览链路
- 渲染相关本地能力

插件仓不承担：

- 正式课堂会话控制
- 教师端文件管理
- 学生端在线课堂同步

## 3. 当前运行拓扑

当前推荐运行方式是教师端独立提供课堂主服务。

```text
Teacher Desktop
  -> embedded teacher server
  -> file/data APIs
  -> runtime socket events
  -> render static resources

Student Desktop
  -> connects to teacher server
  -> loads teacher-hosted content
  -> sends back interaction / vote / submission events

Editor Plugin
  -> local preview only

Core Repo
  -> standalone runtime-only service
  -> reserved for independent deployment and runtime evolution
```

注意：

- 从当前代码实际行为看，学生端连接的是教师端地址，而不是独立 core 服务。
- 教师端已经内置运行时控制能力，所以课堂闭环可以只靠教师端完成。
- `core` 当前仍然是独立仓，但更偏向运行时内核和协议层。

## 4. HTTP 与资源职责

教师端服务负责数据面：

- `/api/courses`
- `/api/course-status`
- `/api/refresh-courses`
- `/api/components-manifest`
- `/api/course-folders/*`
- `/api/classroom-layout`
- `/api/save-classroom-layout`
- `/api/save-submission`
- `/api/submissions/*`
- `/api/submission-config`

教师端还负责：

- 课件静态文件
- 组件清单
- 依赖缓存资源
- 图片、字体、权重等运行资源代理

核心仓负责运行时面：

- 连接控制
- 运行时状态
- 渲染引擎静态输出

## 5. Socket 交互方式

当前运行时已经覆盖以下交互类型：

- 教师选课
- 教师翻页同步
- 教师设置同步
- 学生在线状态同步
- 教师互动同步
- 学生提交事件转发与确认
- 投票开始、投票提交、投票结束
- 标注增量、整页清空、标注状态读取
- 课程结束与状态重置

### 典型事件方向

教师端 -> 学生端：

- `select-course`
- `sync-slide`
- `host-settings`
- `interaction:sync`
- `vote:start`
- `vote:end`
- `annotation:*`

学生端 -> 教师端：

- `student:submit`
- `vote:submit`
- `student-alert`
- `request-sync-state`

运行时广播：

- `course-changed`
- `course-ended`
- `student-status`
- `vote:result`

## 6. 课堂全链路

### 选课与上课

1. 教师端启动本地服务。
2. 教师端扫描课程目录并生成课程清单。
3. 教师在 UI 中选择课件。
4. 服务更新当前课程与当前页状态。
5. 学生端收到课程变化并进入对应课件。

### 翻页与互动

1. 教师端切换页面。
2. 教师服务更新当前页索引。
3. 运行时向学生端广播翻页事件。
4. 学生端按同步设置决定是否跟随。

### 投票

1. 教师端发起投票并定义选项。
2. 运行时创建内存态投票会话。
3. 学生端提交投票结果。
4. 运行时实时汇总并向教师端回推统计。
5. 教师结束投票或超时结束。

### 标注

1. 教师端发送标注增量。
2. 运行时将标注按 `courseId + slideIndex` 记入内存。
3. 学生端接收并回放标注。
4. 清空时按页清理状态。

### 学生提交

1. 学生端提交作业或课堂结果。
2. 运行时将事件转发给教师端。
3. 教师端负责保存到提交目录。
4. 教师端后续可按课程批量下载或查看。

## 7. 根仓运行方式

根仓提供统一命令入口：

```bash
npm run repos:init
npm run repos:update
npm run start:core
npm run start:teacher
npm run start:teacher-server
npm run start:student
```

推荐课堂运行：

1. 启动 `npm run start:teacher`
2. 在学生机启动 `npm run start:student`
3. 学生端连接教师机地址

推荐调试方式：

- 调试运行时边界：`npm run start:core`
- 调试教师服务 API：`npm run start:teacher-server`
- 调试正式课堂主链路：`npm run start:teacher` + `npm run start:student`

## 8. 开发协作方式

根仓负责：

- 统一文档
- 子模块管理
- 运行入口聚合

业务开发在各子仓进行：

- `repos/core`
- `repos/teacher`
- `repos/student`
- `repos/editor-plugin`

子仓推送后，如需让根仓记录最新提交，需要更新子模块指针。
