# SyncClassroom / 萤火课堂

根仓库是整套系统的总入口，用于统一说明系统架构、运行方式、仓库边界和跨仓协作方式。

当前代码组织方式不是“一个单体仓库”，而是“一个总览仓库 + 四个真实子仓库”：

- `repos/core`：核心运行时仓库，负责连接控制、课堂状态同步、Socket 事件总线和渲染运行时
- `repos/teacher`：教师端仓库，负责课件与文件管理、教师端桌面程序、教师侧 HTTP/API 服务
- `repos/student`：学生端仓库，负责连接课堂、接收同步状态、渲染课件、提交互动结果
- `repos/editor-plugin`：编辑器插件仓库，负责本地 `.lume` 预览和编辑辅助

对应远端仓库：

- [LumeSync-Core](https://github.com/yc004/LumeSync-Core)
- [LumeSync-Teacher](https://github.com/yc004/LumeSync-Teacher)
- [LumeSync-Student](https://github.com/yc004/LumeSync-Student)
- [LumeSync-Editor-Plugin](https://github.com/yc004/LumeSync-Editor-Plugin)

## 系统定位

系统采用“教师端持有内容，核心只负责运行时”的边界：

- 教师端是内容真源：管理课程文件、目录、布局、提交、导入导出
- 学生端只消费教师端提供的资源地址和课堂同步状态
- 核心运行时只负责连接控制、状态同步和渲染能力，不承担业务文件管理
- 编辑器插件只负责本地预览，不参与正式课堂的数据面

当前主链路是：

1. 教师端启动本地服务
2. 教师端管理课程、布局、提交目录和课堂状态
3. 学生端连接教师端地址
4. 教师端通过运行时事件同步选课、翻页、互动、投票、标注等状态
5. 学生提交回传到教师端，由教师端负责持久化

## 文档入口

完整文档已经整理为“说明书式”结构，入口在：

- [文档总览](docs/README.md)

推荐阅读顺序：

- 先看 [系统总览](docs/01-overview/01-system-overview.md)
- 再看 [系统架构](docs/01-overview/02-system-architecture.md)
- 然后看 [快速开始](docs/02-operations/01-quick-start.md)
- 根据角色继续阅读 [教师端手册](docs/03-teacher-guide/01-teacher-desktop.md) 或 [学生端手册](docs/04-student-guide/01-student-desktop.md)
- 做课件开发时看 [课件开发章节](docs/05-course-development/01-course-authoring.md)
- 查接口和事件时看 [参考资料](docs/07-reference/01-api-reference.md)

## 根目录启动

首次克隆：

```bash
git clone --recurse-submodules https://github.com/yc004/SyncClassroom.git
cd SyncClassroom
npm run repos:init
```

可以直接在根目录启动指定端：

```bash
npm run start:core
npm run start:teacher
npm run start:teacher-server
npm run start:student
```

说明：

- `start:teacher`：启动教师端桌面程序，内部会拉起教师服务
- `start:teacher-server`：只启动教师服务，适合联调 API 和运行时
- `start:student`：启动学生端桌面程序
- `start:core`：启动独立核心运行时服务

## 开发与提交

业务代码应在对应子仓库内修改并直接提交：

```bash
cd repos/teacher
git add .
git commit -m "feat: ..."
git push
```

其他子仓同理：

- `repos/core`
- `repos/student`
- `repos/editor-plugin`

如果子仓库提交更新后，需要在根仓记录新的子模块指针：

```bash
git add repos
git commit -m "chore: update submodule pointers"
git push
```

## 根仓职责

根仓库只承担以下职责：

- 系统级文档
- 跨仓导航
- 根级启动脚本
- 子模块初始化和更新

根仓库不再承担以下职责：

- 承载实际业务主代码
- 通过导出脚本同步到子仓
- 维护与云端不一致的本地镜像目录
