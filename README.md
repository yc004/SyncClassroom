# SyncClassroom v2.0

局域网互动课堂框架，支持教师端全局控制、学生端实时同步、机房视图管理，提供 Windows 桌面应用安装包。

## 功能概览

- 教师端控制台：多课件选择、一键开课/结课、在线学生监控
- 学生端：自动跟随翻页、全屏锁定、断线自动重连
- 机房视图：座位网格/列表双视图，支持 CSV 批量导入，拖拽排列，实时在线状态
- 智能 CDN 缓存代理：首次从公网下载依赖后缓存到本地，后续完全离线
- JSX 热编译：课件为纯文本 `.tsx` 文件，无需构建工具
- Electron 桌面应用：教师端/学生端独立安装包，学生端卸载需管理员密码

## 快速开始（开发模式）

```bash
npm install
node server.js
```

- 教师端：http://localhost:3000
- 学生端：http://局域网IP:3000

## 桌面应用

### 下载安装包

前往 [Releases](../../releases) 下载最新版本：

| 文件 | 说明 |
|------|------|
| `SyncClassroom-教师端-Setup-*.exe` | 教师端，正常安装卸载 |
| `SyncClassroom-学生端-Setup-*.exe` | 学生端，卸载需管理员密码（默认 `admin123`） |

### 本地打包

环境要求：Node.js 18+、Python 3.x（含 Pillow）

```bash
# 一键打包（生成教师端 + 学生端安装包）
build\build.bat

# 或分步执行
python build/convert-icons.py       # 生成图标
npm run build:verify                # 打包密码验证工具
npm run build:teacher               # 教师端安装包 -> dist/teacher/
npm run build:student               # 学生端安装包 -> dist/student/
```

详见 [build/BUILD-README.md](build/BUILD-README.md)。

## 课件开发

课件为 `.tsx` 文件，放入 `public/courses/` 目录，刷新教师端即可识别。

```tsx
const { useState } = React;

function Slide1() {
    return (
        <div className="flex flex-col items-center justify-center min-h-full p-8">
            <h1 className="text-4xl font-bold">课程标题</h1>
        </div>
    );
}

window.CourseData = {
    title: "课程标题",
    icon: "📚",
    desc: "简短描述",
    color: "from-blue-500 to-indigo-600",
    dependencies: [
        // 外部依赖（服务器自动缓存，支持离线）
        // { localSrc: "/lib/chart.umd.min.js", publicSrc: "https://fastly.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js" }
    ],
    slides: [
        { id: 's1', component: <Slide1 /> }
    ]
};
```

详细模板和 API 参考见 `course-template.md`，可在教师端控制台点击"课件教程"在线查看，或点击"下载 Skill"获取 AI 辅助生成课件的 Skill 文件。

## 机房座位列表格式

在机房视图中点击"模板"可下载示例文件，格式为 CSV：

```
# ip,名称,行,列
192.168.1.101,A01,1,1
192.168.1.102,A02,1,2
192.168.1.201,B01,2,1
```

- 行列从 1 开始，左上角为 (1,1)
- `#` 开头为注释行
- 行列可省略，省略时自动排列到末尾

## 学生端说明

- 安装需要管理员权限
- 安装后自动注册为 Windows 服务（`SyncClassroomStudent`），开机自启，普通用户无法关闭
- 卸载时弹出密码验证，默认密码 `admin123`
- 管理员密码可在教师端"课堂设置"中修改并实时推送到所有在线学生端

## 项目结构

```
├── server.js                  后端服务（Express + Socket.io + CDN 代理）
├── public/
│   ├── index.html             入口页面
│   ├── SyncEngine.js          前端引擎（React 组件 + Socket 同步）
│   └── courses/               课件目录（.tsx 文件）
├── electron/
│   ├── main-teacher.js        教师端主进程
│   ├── main-student.js        学生端主进程
│   ├── preload.js             IPC 桥接
│   ├── config.js              配置读写
│   ├── admin.html             管理员设置页面
│   └── offline.html           离线提示页面
├── build/
│   ├── build.bat              一键打包脚本
│   ├── convert-icons.py       PNG 转 ICO
│   ├── verify-password.js     卸载密码验证工具
│   └── student-installer.nsh  NSIS 自定义安装脚本
├── electron-builder-teacher.json
├── electron-builder-student.json
└── .github/workflows/release.yml   打 tag 自动发布 Release
```

## License

MIT
