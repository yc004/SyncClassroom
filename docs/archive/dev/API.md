# 萤火课堂 课件 API 文档

本文档详细介绍萤火课堂课件开发中可用的 API 接口和全局对象。

## 目录

- [全局对象](#全局对象)
- [摄像头 API](#摄像头-api)
- [自动变量同步](#自动变量同步)
- [学生内容提交](#学生内容提交)
- [UI 组件（运行时）](#ui-组件运行时)
- [Canvas 交互与缩放](#canvas-交互与缩放)
- [课件事件](#课件事件)
- [外部依赖](#外部依赖)
- [完整示例](#完整示例)

---

## 全局对象

### React

React 及其 Hooks 可以直接使用，无需导入：

```tsx
const { useState, useEffect, useRef, useCallback, useMemo, useContext } = React;
```

### window.CourseData

课件必须导出此对象以供框架加载：

```tsx
window.CourseData = {
    title: string;              // 课程标题
    icon: string;              // 课程图标（emoji）
    desc: string;              // 课程描述
    color: string;             // 渐变色类名（如 "from-blue-500 to-indigo-600"）
    dependencies: Dependency[]; // 外部依赖声明
    slides: Slide[];           // 幻灯片数组
};
```

### 课件文件说明

- 课件文件使用 `.lume` 后缀（内容仍是 TSX/JSX/TS/JS 脚本文本），放在 `public/courses/`
- 引擎会按 TSX 语法编译 `.lume`（Babel presets: `react` + `typescript`），所以可直接写 JSX + TypeScript 类型注解

### window.CourseGlobalContext

课件运行时上下文，提供核心 API：

```tsx
window.CourseGlobalContext = {
    // 基础属性
    socket: Socket;            // Socket.io 实例
    isHost: boolean;           // 是否为教师端
    socketId: string;          // 当前客户端 socket ID

    // 状态管理
    currentSlide: number;      // 当前幻灯片索引（只读）
    classroomActive: boolean;  // 课堂是否激活

    // 提交内容 API（学生端专用）
    submitContent: (options: {
        content: any;         // 要提交的内容（可以是字符串、对象等）
        fileName?: string;     // 文件名（默认 "submission.txt"）
        mergeFile?: boolean;   // 是否合并到同一个文件（默认 false）
    }) => Promise<{ success: boolean }>;

    // 摄像头 API（回调模式）
    getCamera: (onStream: (stream: MediaStream) => void) => Promise<void>;
    unregisterCamera: (onStream: (stream: MediaStream) => void) => void;

    // 自动同步变量 Hook
    useSyncVar: (key: string, initialValue: any, options?: { onChange?: (newValue: any, oldValue: any) => void }) => [any, (value: any) => void];

    // 本地变量 Hook（不自动同步）
    useLocalVar: (key: string, initialValue: any, options?: { onChange?: (newValue: any, oldValue: any) => void }) => [any, (value: any) => void];

    // Canvas 相关
    canvas: {
        getCanvasPoint: (event: React.MouseEvent, element: HTMLElement) => { x: number; y: number; nx: number; ny: number } | null;
        useCanvasDims: (paddingLeft: number, paddingRight: number, paddingTop: number, paddingBottom: number) => { wrapRef: React.RefObject<HTMLDivElement>; dims: { cw: number; ch: number; width: number; height: number } };
        getHiDpiContext2d: (canvas: HTMLCanvasElement, logicalWidth: number, logicalHeight: number) => CanvasRenderingContext2D;
    };

    // 辅助方法
    log: (message: string, data?: any) => void;
    error: (message: string, error?: any) => void;
};
```

### window.CourseComponents（内置组件库）

引擎会在全局注册一组可复用组件，供课件直接使用（无需 import）。当前可用组件：

- `WebPageSlide`：将一个 URL  作为"纯网页页"嵌入到课件中，并提供"刷新 / 在新窗口打开"的兜底。
- `SurveySlide`：问卷组件，支持多种题型和数据收集。

---

## 摄像头 API

### getCamera(onStream) - 获取摄像头流

启动摄像头并通过回调函数接收视频流。

**语法：**

```tsx
window.CourseGlobalContext.getCamera(onStream: (stream: MediaStream) => void): Promise<void>
```

**参数：**

- `onStream`: 接收视频流的回调函数，当摄像头启动或切换设备时会自动调用

**返回值：**

- `Promise<void>`: 异步启动摄像头

**使用示例：**

```tsx
function CameraSlide() {
    const videoRef = useRef<HTMLVideoElement>(null);

    const onStream = (stream: MediaStream) => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    };

    useEffect(() => {
        // 组件挂载时启动摄像头
        window.CourseGlobalContext.getCamera(onStream).catch((err) => {
            console.error('摄像头启动失败:', err);
        });

        // 组件卸载时释放摄像头
        return () => {
            window.CourseGlobalContext.unregisterCamera(onStream);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, []);

    return (
        <div>
            <video ref={videoRef} autoPlay playsInline muted />
        </div>
    );
}
```

### unregisterCamera(onStream) - 释放摄像头

释放摄像头资源，必须在组件卸载时调用。

**语法：**

```tsx
window.CourseGlobalContext.unregisterCamera(onStream: (stream: MediaStream) => void): void
```

**注意事项：**

- ⚠️ **必须调用**：组件卸载时必须调用此方法，否则摄像头会被占用
- ✅ **自动处理**：切换摄像头设备时，旧设备会自动释放，无需手动调用
- 📱 **唯一性**：同一个回调函数只能注册一次，重复注册不会生效

### 完整示例

```tsx
function CameraEngineTestSlide() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [streamActive, setStreamActive] = useState(false);
    const [currentDevice, setCurrentDevice] = useState<string>('');

    const onStream = (stream: MediaStream) => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
        const track = stream.getVideoTracks()[0];
        const label = track?.label || '(unknown)';
        setStreamActive(true);
        setCurrentDevice(label);
        console.log('摄像头已启动:', label);
    };

    useEffect(() => {
        // 进入页面时自动启动摄像头
        window.CourseGlobalContext.getCamera(onStream).catch((err: Error) => {
            console.error('摄像头启动失败:', err.message);
        });

        // 离开页面时释放摄像头
        return () => {
            console.log('释放摄像头');
            window.CourseGlobalContext.unregisterCamera(onStream);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setStreamActive(false);
        };
    }, []);

    return (
        <div className="flex flex-col h-full p-6 bg-white">
            <h2 className="text-2xl font-bold mb-4">摄像头演示</h2>

            <div className="relative bg-black rounded-xl overflow-hidden flex-1">
                {!streamActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-400">等待摄像头...</span>
                    </div>
                )}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                />
                {streamActive && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-green-400 text-xs px-2 py-1 rounded">
                        <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1"></span>
                        {currentDevice.slice(0, 50)}{currentDevice.length > 50 ? '...' : ''}
                    </div>
                )}
            </div>

            <div className="mt-4 text-sm text-gray-600">
                <p>✅ 进入页面自动启动摄像头</p>
                <p>✅ 点击右下角摄像头按钮可切换设备</p>
                <p>✅ 离开页面自动释放摄像头</p>
            </div>
        </div>
    );
}
```

---

## 自动变量同步

### useSyncVar - 自动同步变量 Hook

注册一个会自动同步到所有学生端的变量。行为与 React 的 `useState` 非常相似。

**语法：**

```tsx
const [value, setValue] = window.CourseGlobalContext.useSyncVar(key, initialValue, options);
```

**参数：**

- `key` (string): 变量的唯一标识符
- `initialValue` (any): 变量的初始值
- `options` (object, 可选):
  - `onChange` (function): 变量变化时的回调函数，接收 `(newValue, oldValue)` 两个参数

**返回值：**

返回一个包含当前值和 setter 函数的数组，就像 `useState` 一样：

```tsx
[
    any,          // 当前值
    (value) => void // 设置新值的函数（教师端会自动同步到学生端）
]
```

**使用示例：**

**示例 1：选项选择同步**

```tsx
function QuizSlide() {
    // 使用自动同步的 Hook：当前选中的选项
    const [selectedOption, setSelectedOption] = window.CourseGlobalContext.useSyncVar('quiz:option', null, {
        onChange: (newValue, oldValue) => {
            console.log('选项已改变:', oldValue, '->', newValue);
        }
    });

    const handleOptionClick = (index) => {
        // 设置新值，引擎会自动同步到所有学生端并重新渲染组件
        setSelectedOption(index);
    };

    return (
        <div className="quiz-container">
            {['A', 'B', 'C', 'D'].map((opt, index) => (
                <button
                    key={index}
                    onClick={() => handleOptionClick(index)}
                    className={`option-btn ${selectedOption === index ? 'selected' : ''}`}
                >
                    {opt}
                </button>
            ))}
        </div>
    );
}
```

**示例 2：拖拽位置同步**

```tsx
function DragDropSlide() {
    // 使用同步 Hook
    const [item1Pos, setItem1Pos] = window.CourseGlobalContext.useSyncVar('item1:pos', { x: 0, y: 0 });
    const [item1Target, setItem1Target] = window.CourseGlobalContext.useSyncVar('item1:target', null);

    const handleDrop = (targetId) => {
        setItem1Target(targetId);
    };

    return (
        <div>
            <div style={{ left: item1Pos.x, top: item1Pos.y }}>
                拖拽我
            </div>
            <div onDrop={() => handleDrop('box1')}>目标区域1</div>
            <div onDrop={() => handleDrop('box2')}>目标区域2</div>
        </div>
    );
}
```

**示例 3：面板状态同步**

```tsx
function PanelSlide() {
    const [panelState, setPanelState] = window.CourseGlobalContext.useSyncVar('panel:visible', {
        panel1: false,
        panel2: false,
        panel3: false
    });

    const togglePanel = (panelId) => {
        setPanelState({
            ...panelState,
            [panelId]: !panelState[panelId]
        });
    };

    return (
        <div>
            <button onClick={() => togglePanel('panel1')}>切换面板1</button>
            {panelState.panel1 && <div>面板1内容</div>}
        </div>
    );
}
```

### useLocalVar - 普通变量 Hook（不自动同步）

如果某些变量不需要同步到学生端（例如本地 UI 状态），使用 `useLocalVar`，它的行为完全等同于 `useState`：

```tsx
function MySlide() {
    // 不同步的本地变量
    const [localMenuOpen, setLocalMenuOpen] = window.CourseGlobalContext.useLocalVar('local:menu', false);

    const toggleMenu = () => {
        setLocalMenuOpen(!localMenuOpen);
    };

    return (
        <div>
            <button onClick={toggleMenu}>打开菜单</button>
            {localMenuOpen && <div>菜单内容</div>}
        </div>
    );
}
```

### 自动同步 vs 本地变量对比

| 特性 | 自动同步 (`useSyncVar`) | 本地变量 (`useLocalVar`) |
|------|---------------------------|--------------------------|
| **使用复杂度** | 极低，就像 useState | 极低，就像 useState |
| **适用场景** | 需要同步到学生端的状态变量 | 本地UI状态（菜单、下拉框等） |
| **代码量** | 少 | 少 |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

### 最佳实践

1. **命名规范**：使用 `prefix:name` 格式，例如 `quiz:option`、`drag:position`
2. **变更回调**：利用 `onChange` 处理副作用（如播放动画）
3. **避免循环**：不要在 `onChange` 中再次修改同一个变量
4. **合理分组**：相关的变量使用相同前缀（如 `panel1:visible`、`panel1:content`）

### 注意事项

- 教师端只有在开启"同步教师交互"后，才会自动同步变量
- 学生端会自动接收并应用教师端的变量变化
- 变量仅在当前幻灯片内有效
- 复杂对象（数组、对象）会被完整同步

---

## 学生内容提交

学生端可以通过 `submitContent` API 将内容提交给教师端，教师端会自动保存到文件。

### 基本用法

```tsx
const handleSubmit = async () => {
    try {
        await window.CourseGlobalContext.submitContent({
            content: '学生的回答内容',
            fileName: 'answer.txt'
        });
        alert('提交成功！');
    } catch (err) {
        alert('提交失败：' + err.message);
    }
};
```

### 参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `content` | `any` | 必填 | 要提交的内容（字符串、对象、数组等） |
| `fileName` | `string` | `"submission.txt"` | 保存的文件名 |
| `mergeFile` | `boolean` | `false` | 是否合并所有学生提交到一个文件 |

### 存储模式

**分离模式（mergeFile = false，默认）**
- 每个学生的提交保存为独立文件
- 文件名格式：`学生名_文件名` 或 `IP_文件名`
- 示例：`张三_answer.txt` 或 `192-168-1-101_answer.txt`

**合并模式（mergeFile = true）**
- 所有学生提交合并到一个文件（CSV 格式）
- 文件名即为 `fileName` 指定的名称
- 格式：`Timestamp,IP,Content`
- **重要**：服务器会自动根据学生 IP 从座位表查询并填充学生姓名和学号
- 示例：
  ```
  提交时间,学生IP,学生姓名,学号,Content
  2024-03-24T10:30:00.000Z,192.168.1.101,张三,20230001,"学生的回答"
  2024-03-24T10:30:15.000Z,192.168.1.102,李四,20230002,"另一个回答"
  ```

### 重要说明

- ✅ **学生信息由服务器自动添加**：在合并模式下，学生的 IP、姓名、学号由服务器根据座位表自动填充
- ❌ **客户端不应添加学生信息**：课件代码中不应手动添加或修改学生信息字段
- ✅ **座位表配置**：教师需在机房视图中正确配置学生姓名和学号，否则这些字段将为空

### 完整示例

```tsx
function QuizSlide() {
    const [answer, setAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!answer.trim()) return;

        setIsSubmitting(true);
        try {
            await window.CourseGlobalContext.submitContent({
                content: {
                    question: '1+1=?',
                    answer: answer,
                    timestamp: new Date().toISOString()
                },
                fileName: 'quiz-result.json',
                mergeFile: false  // 每个学生一个文件
            });
            setSubmitted(true);
        } catch (err) {
            console.error('提交失败:', err);
            alert('提交失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-8">
            <h2 className="text-2xl font-bold mb-6">问题：1+1=?</h2>

            {!submitted ? (
                <div className="flex flex-col items-center gap-4">
                    <input
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="输入答案..."
                        className="px-4 py-2 border rounded-lg w-64"
                        disabled={isSubmitting}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !answer.trim()}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {isSubmitting ? '提交中...' : '提交答案'}
                    </button>
                </div>
            ) : (
                <div className="text-green-600 font-bold text-lg">
                    已提交答案：{answer}
                </div>
            )}
        </div>
    );
}
```

### 注意事项

1. **学生端专用**：此 API 仅在学生端可用，教师端调用将返回错误
2. **自动保存**：教师端会自动将内容保存到文件，无需手动下载
3. **默认路径**：文件默认保存在项目根目录的 `submissions` 文件夹中
4. **学生名称**：如果学生在机房视图中有命名，文件名会使用学生名称；否则使用 IP 地址
   - **多班级支持**：学生名称与当前选中的班级相关联，切换班级后学生端提交的文件名会使用新班级中对应的学生名称
5. **超时处理**：提交请求有 10 秒超时限制
6. **错误处理**：建议使用 try-catch 处理提交错误

---

## UI 组件（运行时）

### window.__LumeSyncUI

课堂运行时提供的 UI 组件集合，用于构建统一风格（液态玻璃）的侧边工具栏与弹窗。

```tsx
const { SideToolbar, styles } = window.__LumeSyncUI;
```

#### `styles`

| 字段 | 类型 | 说明 |
|------|------|------|
| `liquidGlassDark` | string | 深色液态玻璃样式类（适合深色工具栏/结果弹窗） |
| `liquidGlassLight` | string | 浅色液态玻璃样式类（适合浅色设置弹窗） |

#### `SideToolbar`（通用侧边栏）

支持两种模式：

1. **配置模式（推荐）**：只传按钮定义和弹窗渲染函数
2. **兼容模式**：继续传 `toolbar` / `panel` 自定义 JSX

##### 配置模式关键参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `visible` | boolean | 是否显示侧边栏 |
| `buttons` | array | 按钮定义列表（`id/title/iconClass/popupKey/onClick/...`） |
| `activePopupKey` | string \| null | 当前展开弹窗 key |
| `onActivePopupChange` | function | 切换当前弹窗 key |
| `renderPopupContent` | function | `renderPopupContent(popupKey)` 返回对应弹窗内容 |
| `toolbarPrefix` | ReactNode | 工具栏按钮区前置内容 |
| `toolbarSuffix` | ReactNode | 工具栏按钮区后置内容 |
| `side` | `'left' \| 'right'` | 停靠位置 |

##### 使用示例（配置模式）

```tsx
const [activePopupKey, setActivePopupKey] = useState(null);

const buttons = [
  { id: 'tools', title: '工具', iconClass: 'fa-pen', popupKey: 'tools' },
  { id: 'color', title: '颜色', iconClass: 'fa-palette', popupKey: 'color' },
  { id: 'clear', title: '清空', iconClass: 'fa-trash-can', onClick: () => clearAll() }
];

const renderPopupContent = (popupKey) => {
  if (popupKey === 'tools') return <div className={`w-64 ${styles.liquidGlassLight} rounded-2xl p-3`}>...</div>;
  if (popupKey === 'color') return <div className={`w-64 ${styles.liquidGlassLight} rounded-2xl p-3`}>...</div>;
  return null;
};

<window.__LumeSyncUI.SideToolbar
  visible={true}
  side="left"
  buttons={buttons}
  activePopupKey={activePopupKey}
  onActivePopupChange={setActivePopupKey}
  renderPopupContent={renderPopupContent}
/>;
```

### window.WebPageSlide（网页嵌入组件）

**网页嵌入组件**，用于在课件中嵌入外部网页，并提供刷新和新窗口打开功能。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | `string` | 必填 | 要嵌入的网页 URL |
| `title` | `string` | `'网页'` | 页面标题 |
| `openLabel` | `string` | `'打开网页'` | 新窗口打开按钮的文本 |
| `allow` | `string` | `'clipboard-read; clipboard-write'` | iframe 的 allow 权限 |
| `referrerPolicy` | `string` | `'no-referrer'` | iframe 的 referrerPolicy |

#### 基本用法

```tsx
function ExternalPageSlide() {
    return (
        <WebPageSlide
            url="https://example.com/survey"
            title="课后问卷"
            openLabel="打开问卷"
        />
    );
}
```

#### 注意事项

- 不是所有网站都允许被 iframe 内嵌（可能有 `X-Frame-Options` / `CSP frame-ancestors` 限制）
- 遇到内嵌限制时，可点击"打开"按钮在新窗口打开

---

## Canvas 交互与缩放

由于课件可能被引擎通过 `transform: scale()` 进行缩放显示，传统的 `getBoundingClientRect()` 或直接使用 `offsetX/Y` 会导致鼠标点击坐标计算错误。请使用引擎提供的专用 API：

### 获取准确的点击坐标

```tsx
const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // getCanvasPoint 会自动处理 CSS transform 缩放和 Canvas border 的影响
    const p = window.CourseGlobalContext?.canvas?.getCanvasPoint?.(e, e.currentTarget);
    if (!p) return;

    // p.x 和 p.y 即为映射到 Canvas 逻辑布局尺寸上的精确坐标
    console.log('点击逻辑坐标:', p.x, p.y);

    // 也可以使用相对比例 (0~1)
    console.log('相对坐标:', p.nx, p.ny);
};
```

### Canvas 响应式尺寸 Hook

```tsx
function SlideWithCanvas() {
    // 传入 padding (左,右,上,下)，返回 wrapper ref 和计算好的逻辑尺寸
    const { wrapRef, dims } = window.CourseGlobalContext.canvas.useCanvasDims(20, 20, 10, 10);

    // ...
    return (
        <div ref={wrapRef} className="flex-1 w-full h-full">
            <canvas width={dims.cw} height={dims.ch} />
        </div>
    );
}
```

### 获取支持 HiDPI 的 Context

```tsx
useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // 自动根据 devicePixelRatio 设置实际分辨率，并返回已经 scale 好的 context
    // 绘制时直接使用 dims.cw / dims.ch 的逻辑坐标即可，无需再乘 dpr
    const ctx = window.CourseGlobalContext.canvas.getHiDpiContext2d(canvas, dims.cw, dims.ch);
    // ...
}, [dims]);
```

---

## 课件事件

### 生命周期事件

#### onLoad

课件加载完成（可选）：

```tsx
window.onLoad = () => {
    console.log('Course loaded');
    // 初始化逻辑
};
```

#### onUnload

课件卸载（可选）：

```tsx
window.onUnload = () => {
    console.log('Course unloading');
    // 清理逻辑
};
```

### 幻灯片事件

#### onSlideEnter

进入幻灯片时触发（在组件中定义）：

```tsx
function Slide1() {
    useEffect(() => {
        // 幻灯片进入时执行
        console.log('Slide 1 entered');

        return () => {
            // 幻灯片离开时执行
            console.log('Slide 1 exited');
        };
    }, []);

    return <div>Slide 1</div>;
}
```

---

## 外部依赖

### 依赖声明

在 `window.CourseData.dependencies` 中声明需要的外部库：

```tsx
window.CourseData = {
    // ...
    dependencies: [
        {
            localSrc: "/lib/chart.umd.min.js",
            publicSrc: "https://fastly.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"
        },
        {
            localSrc: "/lib/katex.min.js",
            publicSrc: "https://fastly.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"
        }
    ],
    // ...
};
```

### 使用外部库

加载后通过 `window` 对象访问：

```tsx
function ChartSlide() {
    const chartRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (typeof Chart !== 'undefined' && chartRef.current) {
            new Chart(chartRef.current, {
                type: 'bar',
                data: {
                    labels: ['A', 'B', 'C'],
                    datasets: [{
                        label: 'Data',
                        data: [10, 20, 30]
                    }]
                }
            });
        }
    }, []);

    return <canvas ref={chartRef}></canvas>;
}
```

---

## 完整示例

以下是一个完整的课件示例，包含多种 API 的使用：

```tsx
// ========================================================
// 课程内容：互动演示
// ========================================================

const { useState, useEffect, useRef } = React;

// ================= SLIDE COMPONENTS =================

function Slide1() {
    return (
        <div className="flex flex-col items-center justify-center min-h-full text-center p-8 space-y-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="text-8xl">📊</div>
            <h1 className="text-5xl font-bold text-gray-800">互动演示课件</h1>
            <p className="text-xl text-gray-600 max-w-2xl">
                本课件演示了萤火课堂的主要 API 功能
            </p>
        </div>
    );
}

function Slide2() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [streamActive, setStreamActive] = useState(false);

    const onStream = (stream: MediaStream) => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
        setStreamActive(true);
        console.log('摄像头已启动');
    };

    useEffect(() => {
        window.CourseGlobalContext.getCamera(onStream).catch((err) => {
            console.error('摄像头启动失败:', err);
        });

        return () => {
            window.CourseGlobalContext.unregisterCamera(onStream);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setStreamActive(false);
        };
    }, []);

    return (
        <div className="flex flex-col h-full p-8 space-y-6">
            <h2 className="text-3xl font-bold">摄像头演示</h2>

            <div className="bg-white rounded-lg p-6 shadow flex-1">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain bg-black rounded-lg"
                />
            </div>

            <div className="text-sm text-gray-600">
                {streamActive ? '✅ 摄像头已启动' : '⏳ 等待摄像头启动'}
            </div>
        </div>
    );
}

function Slide3() {
    // 使用自动同步变量
    const [selectedOption, setSelectedOption] = window.CourseGlobalContext.useSyncVar('quiz:option', null);
    const [showPanel, setShowPanel] = window.CourseGlobalContext.useSyncVar('panel:info', false);

    // 使用本地变量（不同步）
    const [localMenuOpen, setLocalMenuOpen] = window.CourseGlobalContext.useLocalVar('local:menu', false);

    return (
        <div className="flex flex-col h-full p-8 space-y-6 bg-gradient-to-br from-green-50 via-white to-blue-50">
            <h2 className="text-3xl font-bold">自动同步演示</h2>

            {/* 选项选择 - 会同步到学生端 */}
            <div className="bg-white rounded-xl p-6 shadow">
                <h3 className="text-xl font-semibold mb-4">选项选择（自动同步）</h3>
                <div className="grid grid-cols-3 gap-4">
                    {['A', 'B', 'C'].map((opt, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedOption(index)}
                            className={`px-6 py-4 rounded-xl text-xl font-bold transition-all ${
                                selectedOption === index
                                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            选项 {opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => setShowPanel(!showPanel)}
                    className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${
                        showPanel
                            ? 'bg-purple-500 text-white shadow-lg'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                >
                    {showPanel ? '隐藏同步面板' : '显示同步面板'}
                </button>

                <button
                    onClick={() => setLocalMenuOpen(!localMenuOpen)}
                    className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${
                        localMenuOpen
                            ? 'bg-green-500 text-white shadow-lg'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                >
                    {localMenuOpen ? '隐藏本地菜单' : '显示本地菜单'}
                </button>
            </div>

            {/* 同步面板 - 会显示在学生端 */}
            {showPanel && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
                    <h3 className="text-xl font-bold mb-2">同步面板</h3>
                    <p className="text-sm">这个面板的状态会同步到所有学生端。</p>
                </div>
            )}

            {/* 本地菜单 - 只在当前端显示 */}
            {localMenuOpen && (
                <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-6 shadow-lg text-white">
                    <h3 className="text-xl font-bold mb-2">本地菜单</h3>
                    <p className="text-sm">这个菜单是本地的，不会同步到学生端。</p>
                </div>
            )}
        </div>
    );
}

// ================= COURSE DATA =================

window.CourseData = {
    title: "互动演示",
    icon: "📊",
    desc: "演示萤火课堂的主要 API 功能",
    color: "from-blue-500 to-indigo-600",
    dependencies: [],
    slides: [
        { id: 's1', component: <Slide1 /> },
        { id: 's2', component: <Slide2 /> },
        { id: 's3', component: <Slide3 /> }
    ]
};
```

---

## 常见问题

### Q: 如何判断当前是教师端还是学生端？

```tsx
if (window.CourseGlobalContext.isHost) {
    // 教师端逻辑
} else {
    // 学生端逻辑
}
```

### Q: 如何在幻灯片切换时执行清理操作？

```tsx
function MySlide() {
    useEffect(() => {
        // 进入幻灯片时执行

        return () => {
            // 离开幻灯片时执行清理
            // 例如：停止定时器、关闭摄像头等
        };
    }, []);
}
```

### Q: useSyncVar 和 useLocalVar 有什么区别？

- `useSyncVar`: 变量变化会自动同步到所有学生端，适合存储课件核心状态
- `useLocalVar`: 变量只在当前端变化，适合存储UI临时状态（如菜单展开、下拉框等）

### Q: 摄像头一定要在组件卸载时释放吗？

是的，必须调用 `unregisterCamera()` 释放摄像头，否则摄像头会被占用，其他页面无法使用。

```tsx
useEffect(() => {
    window.CourseGlobalContext.getCamera(onStream);

    return () => {
        window.CourseGlobalContext.unregisterCamera(onStream); // 必须！
    };
}, []);
```

### Q: 如何在教师端同步数据到学生端？

推荐使用 `useSyncVar` Hook，设置值时会自动同步：

```tsx
const [value, setValue] = window.CourseGlobalContext.useSyncVar('myKey', initialValue);

// 教师端设置值，自动同步到所有学生端
setValue(newValue);
```

---

## 相关文档

- [课件开发模板](./course-template.md)
- [交互同步规范](../interaction/interaction-sync-guide.md)
- [问卷组件指南](../components/survey-component-guide.md)
- [投票组件指南](../components/vote-component-guide.md)
- [AI 知识库指南](../ai/knowledge-base-guide.md)
