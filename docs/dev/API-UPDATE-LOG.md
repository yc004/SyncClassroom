# API 文档更新记录

## 更新日期
2026年3月30日

## 更新内容

### 已移除的过时 API

1. **摄像头 Manager API** - 已完全移除
   - ❌ `window.CourseGlobalContext.cameraManager.start()`
   - ❌ `window.CourseGlobalContext.cameraManager.stop()`
   - ❌ `window.CourseGlobalContext.cameraManager.getStream()`
   - ❌ `window.CourseGlobalContext.cameraManager.isStarted()`

2. **旧版变量注册 API** - 已完全移除
   - ❌ `window.CourseGlobalContext.registerSyncVar()`
   - ❌ `window.CourseGlobalContext.registerVar()`

3. **手动同步 API** - 已移除文档（未在代码中找到实际使用）
   - ❌ `window.CourseGlobalContext.syncInteraction()`
   - ❌ `teacher-interaction` 事件监听

4. **窗口 API** - 已移除文档（在 Electron 环境中不再使用）
   - ❌ `window.openWindow()`
   - ❌ `window.closeWindow()`

### 已添加/更新的 API

1. **摄像头回调 API** - 新增
   - ✅ `window.CourseGlobalContext.getCamera(onStream)`
   - ✅ `window.CourseGlobalContext.unregisterCamera(onStream)`

2. **自动同步变量 Hooks** - 新增详细文档
   - ✅ `window.CourseGlobalContext.useSyncVar(key, initialValue, options)`
   - ✅ `window.CourseGlobalContext.useLocalVar(key, initialValue, options)`

3. **Canvas 交互与缩放** - 新增
   - ✅ `window.CourseGlobalContext.canvas.getCanvasPoint()`
   - ✅ `window.CourseGlobalContext.canvas.useCanvasDims()`
   - ✅ `window.CourseGlobalContext.canvas.getHiDpiContext2d()`

### 更新的文档

1. **docs/dev/API.md** - 完全重写
   - 移除了所有过时的 API 文档
   - 添加了新的摄像头回调 API 文档
   - 添加了完整的 `useSyncVar` 和 `useLocalVar` 文档
   - 添加了 Canvas 交互与缩放 API 文档
   - 保留了学生内容提交 API
   - 保留了外部依赖文档
   - 更新了完整示例代码

2. **docs/dev/create-course.md** - 已验证无需更新
   - 已经使用了正确的 `getCamera(onStream)` API
   - 已经使用了正确的 `useSyncVar` 和 `useLocalVar` Hooks
   - 没有提及任何过时的 API

3. **docs/dev/course-template.md** - 已验证无需更新
   - 已经使用了正确的 `getCamera(onStream)` API
   - 没有提及任何过时的 API

## 迁移指南

### 从旧版摄像头 API 迁移

**旧代码（已过时）：**
```tsx
const startCamera = async () => {
    await window.CourseGlobalContext.cameraManager.start();
    const stream = window.CourseGlobalContext.cameraManager.getStream();
    videoRef.current.srcObject = stream;
};

const stopCamera = () => {
    window.CourseGlobalContext.cameraManager.stop();
};
```

**新代码（推荐）：**
```tsx
const onStream = (stream: MediaStream) => {
    if (videoRef.current) {
        videoRef.current.srcObject = stream;
    }
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
    };
}, []);
```

### 从旧版变量 API 迁移

**旧代码（已过时）：**
```tsx
const counter = window.CourseGlobalContext.registerSyncVar('counter', 0);

function handleClick() {
    counter.set(counter.get() + 1);
}

return <div>Count: {counter.get()}</div>;
```

**新代码（推荐）：**
```tsx
const [count, setCount] = window.CourseGlobalContext.useSyncVar('counter', 0);

function handleClick() {
    setCount(c => c + 1);
}

return <div>Count: {count}</div>;
```

## 注意事项

1. **摄像头必须在组件卸载时释放**
   - 使用 `unregisterCamera(onStream)` 释放摄像头
   - 不调用会导致摄像头被占用

2. **变量同步前缀命名规范**
   - 使用 `slide-id:variable-name` 格式
   - 避免不同幻灯片之间的变量冲突

3. **Canvas 交互必须使用引擎提供的 API**
   - 使用 `getCanvasPoint()` 获取准确的点击坐标
   - 不要直接使用 `getBoundingClientRect()` 或 `offsetX/Y`

4. **Socket.io 事件文档已保留**
   - 虽然主要使用自动同步机制
   - 但底层 socket 事件（如 `class:start`, `slide:change`）仍然有效
   - 可用于高级自定义场景
