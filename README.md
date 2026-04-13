# SyncClassroom

SyncClassroom 是 LumeSync/互动课堂的工作区根仓库，用来统一管理多个子项目、启动脚本、构建脚本和跨仓库文档。

当前教师端和学生端都采用 **C++ 原生壳 + WebView2 + 本地 Node 服务/Web UI** 的形态；课件渲染能力由 `repos/core` 提供，端侧 UI 由各端本地管理。

## 仓库结构

```text
SyncClassroom/
├─ repos/
│  ├─ core/                 # 共享 core：课件渲染、运行时控制、服务能力
│  ├─ teacher/              # 教师端：C++ WebView2 壳、本地服务、教师端 UI、课件资源
│  ├─ student/              # 学生端：C++ WebView2 壳、守护/服务能力、学生端 UI
│  ├─ editor-plugin/        # .lume 课件编辑/预览插件
│  └─ ai-editor/            # AI 编辑器子项目
├─ docs/                    # 根仓库文档
├─ website/                 # 文档/站点相关内容
├─ types/                   # 共享类型定义
├─ submissions/             # 本地提交/收集产物目录
├─ package.json             # 根工作区脚本入口
├─ pnpm-workspace.yaml      # pnpm 工作区配置
└─ pnpm-lock.yaml           # pnpm 锁文件
```

## Core 结构

```text
repos/core/
└─ packages/
   ├─ engine/               # 课件渲染引擎源码
   │  └─ src/               # SyncClassroom、课件组件、资源加载、相机管理等
   ├─ render-engine/        # 渲染引擎路径/加载入口
   ├─ runtime-control/      # 课堂同步、身份、运行时控制能力
   └─ server/               # 独立 core server
```

约束：`core` 只负责课件渲染和共享运行时能力，不承载教师端/学生端完整外壳 UI。

## 教师端结构

```text
repos/teacher/
├─ native/                  # C++ WebView2 原生壳
│  ├─ shell/                # 教师端窗口、WebView2、native RPC、窗口控制
│  ├─ shared/               # C++ 共享配置、日志、URL、设置读写
│  └─ installer/            # 安装包相关脚本/资源
├─ server/                  # 教师端本地 Node/Express/socket.io 服务
│  └─ src/                  # API、课程扫描、代理缓存、提交、构建辅助脚本
├─ shared/
│  ├─ teacher-shell/        # 教师端本地 UI 源码
│  │  └─ src/
│  │     ├─ app.tsx
│  │     ├─ components/
│  │     ├─ panels/
│  │     └─ views/
│  ├─ public/               # 教师端 WebView 静态根目录
│  │  ├─ index.html         # 教师端入口页
│  │  ├─ teacher-app.js     # 由 teacher-shell 构建生成的教师端 UI bundle
│  │  ├─ render-engine.js   # 由 core engine 构建生成/引用的渲染 bundle
│  │  ├─ student.html       # 学生 Web 入口
│  │  ├─ student-app.js
│  │  ├─ courses/           # 课件文件
│  │  ├─ data/              # 课程目录、机房布局等本地数据
│  │  ├─ lib/               # React/Babel/Tailwind/FontAwesome 等本地基础库
│  │  ├─ weights/           # 本地模型权重
│  │  └─ webfonts/          # 本地图标字体
│  ├─ docs/
│  ├─ protocol/
│  ├─ assets/
│  └─ build/
├─ build/                   # CMake/MSBuild 输出
├─ dist/                    # 打包输出，例如 dist/teacher-native
└─ package.json
```

教师端 UI 源码在 `shared/teacher-shell/src`，构建后输出到 `shared/public/teacher-app.js`。不要把教师端 UI 写进 `repos/core`。

教师端课件渲染依赖 `repos/core/packages/engine/src`。教师端本地服务通过 core 路径解析动态链接项目级 core；如果需要覆盖 core 路径，可使用 `LUMESYNC_CORE_DIR` 或 `LUMESYNC_ENGINE_DIR`。

教师端窗口控制由 WebView 内 UI 触发，通过 native RPC 调用 C++ 壳实现最小化、最大化、关闭和拖动。教师端自身窗口固定从本机 `127.0.0.1:<port>` 加载 UI，`teacherIp` 只用于学生端发现/连接配置。

## 学生端结构

```text
repos/student/
├─ native/                  # C++ WebView2 原生壳与守护/服务能力
│  ├─ shell/
│  ├─ service/
│  ├─ shared/
│  └─ installer/
├─ shared/
│  ├─ assets/
│  ├─ build/
│  └─ protocol/
├─ ui/                      # 学生端 Web UI 相关源码/构建入口
├─ build/                   # CMake/MSBuild 输出
├─ dist/                    # 打包输出，例如 dist/student-native
└─ package.json
```

学生端 UI 由学生端本地管理，课堂内容渲染仍通过教师端提供的 core 渲染能力和课堂同步协议完成。

## 常用命令

根目录常用命令：

```bash
pnpm run repos:init
pnpm install
pnpm run start:teacher
pnpm run start:teacher-server
pnpm run start:student
pnpm run start:core
```

构建教师端：

```bash
pnpm --dir repos/teacher run build
```

构建学生端：

```bash
pnpm --dir repos/student run build
```

构建教师端安装包：

```bash
pnpm --dir repos/teacher run build:teacher-native-installer
```

构建学生端安装包：

```bash
pnpm --dir repos/student run build:student-native-installer
```

## 运行与打包输出

教师端打包输出：

```text
repos/teacher/dist/teacher-native/
```

学生端打包输出：

```text
repos/student/dist/student-native/
```

本地运行时数据和日志通常位于：

```text
C:\ProgramData\LumeSync Teacher\
```

## 开发约束

- `repos/core`：只放课件渲染、运行时控制和共享能力。
- `repos/teacher/shared/teacher-shell/src`：教师端本地 UI 源码。
- `repos/student/ui` 和 `repos/student/shared`：学生端本地 UI 与共享资源。
- 教师端/学生端不要复制一份新的 core；需要 core 能力时通过动态路径引用 `repos/core`。
- `shared/public/teacher-app.js`、`shared/public/render-engine.js` 属于构建产物，优先修改对应源码目录。
- 基础前端库优先使用 `shared/public/lib` 中的本地文件，避免教师端基础 UI 依赖公网 CDN。

## 文档入口

- [docs/README.md](docs/README.md)
- [QUICKSTART-FIXED.md](QUICKSTART-FIXED.md)

## 子模块提交流程

业务代码通常在对应子模块中提交：

```bash
cd repos/teacher
git add .
git commit -m "feat: ..."
git push
```

子模块提交后，回到根仓库更新子模块指针：

```bash
cd ../..
git add repos
git commit -m "chore: update submodule pointers"
git push
```
