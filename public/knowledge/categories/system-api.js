// ========================================================
// Category: 系统API - 基础架构
// ========================================================

const systemAPIKnowledge = [
    {
        id: 'basic-structure',
        title: '萤火课件基本结构',
        category: '系统API',
        tags: ['基本结构', 'CourseData', 'slides', '导出格式'],
        content: '萤火课件编辑器使用 React + TypeScript 开发课件。\n\n基本代码结构：\n```typescript\nwindow.CourseData = {\n    id: "unique-id",           // 课件唯一标识\n    title: "课件标题",         // 课件名称\n    icon: "📚",                // 课件图标（emoji）\n    desc: "课件描述",          // 简短描述\n    color: "from-blue-500 to-indigo-600",  // 渐变色\n    slides: [                  // 幻灯片数组\n        {\n            title: "第一页标题",\n            component: <div>页面内容</div>\n        }\n    ]\n};\n```\n\n重要规则：\n1. 必须导出 window.CourseData 对象\n2. slides 数组至少包含一个幻灯片\n3. 每个 slide 必须有 title 和 component\n4. component 必须是 JSX 元素\n5. 支持所有 React 组件和 Hooks',
        isBuiltin: true
    },
    {
        id: 'sync-vars-intro',
        title: '师生同步交互概述',
        category: '系统API',
        tags: ['同步', 'useSyncVar', 'useLocalVar', '师生交互'],
        content: '萤火课件支持教师端与学生端的实时同步交互，通过同步变量和本地变量实现。\n\n## useSyncVar - 同步变量（教师→学生）\n\n教师端的操作会自动同步到所有学生端。\n\n**使用格式：**\n```tsx\nconst [value, setValue] = window.CourseGlobalContext.useSyncVar(key, initialValue, options);\n```\n\n**参数说明：**\n- `key`：唯一标识符，建议格式为 `slide-id:variable-name`\n- `initialValue`：初始值（字符串、数字、布尔值、对象、数组）\n- `options`：可选配置，`onChange` 回调函数\n\n## useLocalVar - 本地变量（仅本地）\n\n仅在本地变化，**不会同步**到学生端。',
        isBuiltin: true
    },
    {
        id: 'sync-vars-examples',
        title: '同步变量使用示例',
        category: '系统API',
        tags: ['useSyncVar', 'useLocalVar', '示例', '代码'],
        content: '## useSyncVar 示例\n\n```tsx\nconst { useSyncVar } = window.CourseGlobalContext;\n\n// KNN 算法的 K 值选择\nconst [kValue, setKValue] = useSyncVar("knn:k-value", 3);\n\n// 拖拽排序的项列表\nconst [dragItems, setDragItems] = useSyncVar("drag:items", [\n    { id: 1, label: "选项A" },\n    { id: 2, label: "选项B" }\n]);\n\n// 带变化回调\nconst [selectedAnswer, setSelectedAnswer] = useSyncVar("quiz:answer", null, {\n    onChange: (newValue) => {\n        console.log("答案已改变:", newValue);\n    }\n});\n```\n\n## useLocalVar 示例\n\n```tsx\nconst { useLocalVar } = window.CourseGlobalContext;\n\n// 菜单展开/折叠状态\nconst [menuOpen, setMenuOpen] = useLocalVar("menu:open", false);\n\n// 工具提示显示状态\nconst [showTooltip, setShowTooltip] = useLocalVar("tooltip:visible", false);\n\n// 设置面板状态\nconst [showSettings, setShowSettings] = useLocalVar("settings:visible", true);\n```',
        isBuiltin: true
    },
    {
        id: 'sync-vars-guide',
        title: '变量类型选择指南',
        category: '系统API',
        tags: ['useSyncVar', 'useLocalVar', 'useState', '选择指南'],
        content: '## 使用 useSyncVar 的情况\n\n需要学生看到的互动结果\n- K 值选择、答题状态、实验参数、拖拽排序结果\n\n## 使用 useLocalVar 的情况\n\n仅教师端显示的 UI 状态\n- 菜单展开/折叠、工具提示、模态框显示、设置面板\n\n## 使用 useState 的情况\n\n临时计算变量，仅用于内部逻辑\n- 中间计算结果、DOM 引用、动画计时器\n\n## 重要规则\n\n1. 同步变量会触发网络通信，避免频繁更新\n2. 本地变量不会产生网络开销，适合高频更新\n3. 命名格式：`slide-id:variable-name`',
        isBuiltin: true
    },
    {
        id: 'camera-api',
        title: '摄像头管理 API',
        category: '系统API',
        tags: ['摄像头', 'getCamera', 'unregisterCamera', 'video'],
        content: '萤火课件支持调用学生摄像头进行互动。\n\n## getCamera - 获取摄像头视频流\n\n```tsx\nconst onStream = (stream) => {\n    if (videoRef.current) {\n        videoRef.current.srcObject = stream;\n    }\n};\nwindow.CourseGlobalContext.getCamera(onStream);\n```\n\n## unregisterCamera - 注销摄像头\n\n```tsx\nwindow.CourseGlobalContext.unregisterCamera(onStream);\n```\n\n## 完整示例\n\n```tsx\nconst { useRef, useEffect } = React;\n\nfunction CameraSlide() {\n    const videoRef = useRef(null);\n    const onStream = (stream) => {\n        if (videoRef.current) {\n            videoRef.current.srcObject = stream;\n        }\n    };\n\n    useEffect(() => {\n        window.CourseGlobalContext.getCamera(onStream);\n        return () => {\n            window.CourseGlobalContext.unregisterCamera(onStream);\n            if (videoRef.current) {\n                videoRef.current.srcObject = null;\n            }\n        };\n    }, []);\n\n    return (\n        <div className="flex flex-col items-center justify-center h-full bg-slate-900">\n            <video ref={videoRef} autoPlay playsInline className="rounded-xl shadow-2xl" width={640} height={480} />\n        </div>\n    );\n}\n```\n\n提示：组件卸载时必须调用 unregisterCamera，避免资源泄露',
        isBuiltin: true
    },
    {
        id: 'submit-api',
        title: '学生端提交 API',
        category: '系统API',
        tags: ['提交', 'submitContent', '学生端', '文件上传'],
        content: '学生端可以向教师端提交内容（答题结果、问卷、图片等）。\n\n## submitContent - 提交内容\n\n```tsx\nawait window.CourseGlobalContext.submitContent(options);\n```\n\n参数：\n- `content`: 要提交的内容（字符串、对象、数组）\n- `fileName`: 文件名（默认 "submission.txt"）\n- `mergeFile`: 是否合并到同一个 CSV 文件（默认 false）\n\n## 使用示例\n\n### 提交答题结果\n```tsx\nawait window.CourseGlobalContext.submitContent({\n    content: {\n        type: "quiz-answer",\n        question: "地球是圆的吗？",\n        answer: selectedAnswer,\n        submittedAt: new Date().toISOString()\n    },\n    fileName: "quiz-result.txt"\n});\n```\n\n### 提交图片（Base64）\n```tsx\nconst imageDataUrl = canvasRef.current.toDataURL("image/png");\nawait window.CourseGlobalContext.submitContent({\n    content: { type: "image-drawing", data: imageDataUrl },\n    fileName: "drawing.png"\n});\n```\n\n提示：仅学生端可用，必须使用 await 等待提交完成',
        isBuiltin: true
    },
    {
        id: 'canvas-api',
        title: '画布坐标转换 API',
        category: '系统API',
        tags: ['画布', 'getCanvasPoint', '坐标转换', '缩放'],
        content: '萤火课件的画布可能被 scale() 缩放，需要使用专用 API 转换坐标。\n\n## getCanvasPoint - 转换鼠标坐标\n\n```tsx\nconst p = window.CourseGlobalContext?.canvas?.getCanvasPoint(event, canvasElement);\nif (p) {\n    console.log("真实逻辑坐标:", p.x, p.y);\n}\n```\n\n## 使用示例：在 Canvas 上绘制\n\n```tsx\nconst canvasRef = useRef(null);\n\nconst handleClick = (e) => {\n    const p = window.CourseGlobalContext?.canvas?.getCanvasPoint(e, canvasRef.current);\n    if (p) {\n        const ctx = canvasRef.current.getContext("2d");\n        ctx.fillStyle = "red";\n        ctx.beginPath();\n        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);\n        ctx.fill();\n    }\n};\n\nreturn (\n    <canvas ref={canvasRef} onClick={handleClick} width={640} height={480} className="border border-slate-300 rounded-xl" />\n);\n```\n\n提示：必须使用 getCanvasPoint，否则在不同缩放比例下坐标会错位',
        isBuiltin: true
    }
];

if (typeof window !== 'undefined') {
    window.systemAPIKnowledge = systemAPIKnowledge;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = systemAPIKnowledge;
}
