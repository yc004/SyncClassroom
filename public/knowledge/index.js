// ========================================================
// 萤火课件编辑器 - 知识库向量存储（RAG 格式）
// ========================================================
// 遵循标准 RAG 系统的设计：
// 1. 知识分块（chunk）：将长文本按主题分割成小块
// 2. 元数据（metadata）：每块包含 id、title、category、tags
// 3. 相似度检索（retrieval）：基于关键词匹配最相关的知识块

const builtinKnowledgeBase = [
    // ========================================================
    // Category: 系统API - 基础架构
    // ========================================================
    {
        id: 'basic-structure',
        title: '萤火课件基本结构',
        category: '系统API',
        tags: ['基本结构', 'CourseData', 'slides', '导出格式'],
        content: '萤火课件编辑器使用 React + TypeScript 开发课件。\n\n基本代码结构：\n```typescript\nwindow.CourseData = {\n    id: "unique-id",           // 课件唯一标识\n    title: "课件标题",         // 课件名称\n    icon: "📚",                // 课件图标（emoji）\n    desc: "课件描述",          // 简短描述\n    color: "from-blue-500 to-indigo-600",  // 渐变色\n    slides: [                  // 幻灯片数组\n        {\n            title: "第一页标题",\n            component: <div>页面内容</div>\n        }\n    ]\n};\n```\n\n重要规则：\n1. 必须导出 window.CourseData 对象\n2. slides 数组至少包含一个幻灯片\n3. 每个 slide 必须有 title 和 component\n4. component 必须是 JSX 元素\n5. 支持所有 React 组件和 Hooks'
    },
    {
        id: 'sync-vars-intro',
        title: '师生同步交互概述',
        category: '系统API',
        tags: ['同步', 'useSyncVar', 'useLocalVar', '师生交互'],
        content: '萤火课件支持教师端与学生端的实时同步交互，通过同步变量和本地变量实现。\n\n## useSyncVar - 同步变量（教师→学生）\n\n教师端的操作会自动同步到所有学生端。\n\n**使用格式：**\n```tsx\nconst [value, setValue] = window.CourseGlobalContext.useSyncVar(key, initialValue, options);\n```\n\n**参数说明：**\n- `key`：唯一标识符，建议格式为 `slide-id:variable-name`\n- `initialValue`：初始值（字符串、数字、布尔值、对象、数组）\n- `options`：可选配置，`onChange` 回调函数\n\n## useLocalVar - 本地变量（仅本地）\n\n仅在本地变化，**不会同步**到学生端。'
    },
    {
        id: 'sync-vars-examples',
        title: '同步变量使用示例',
        category: '系统API',
        tags: ['useSyncVar', 'useLocalVar', '示例', '代码'],
        content: '## useSyncVar 示例\n\n```tsx\nconst { useSyncVar } = window.CourseGlobalContext;\n\n// KNN 算法的 K 值选择\nconst [kValue, setKValue] = useSyncVar("knn:k-value", 3);\n\n// 拖拽排序的项列表\nconst [dragItems, setDragItems] = useSyncVar("drag:items", [\n    { id: 1, label: "选项A" },\n    { id: 2, label: "选项B" }\n]);\n\n// 带变化回调\nconst [selectedAnswer, setSelectedAnswer] = useSyncVar("quiz:answer", null, {\n    onChange: (newValue) => {\n        console.log("答案已改变:", newValue);\n    }\n});\n```\n\n## useLocalVar 示例\n\n```tsx\nconst { useLocalVar } = window.CourseGlobalContext;\n\n// 菜单展开/折叠状态\nconst [menuOpen, setMenuOpen] = useLocalVar("menu:open", false);\n\n// 工具提示显示状态\nconst [showTooltip, setShowTooltip] = useLocalVar("tooltip:visible", false);\n\n// 设置面板状态\nconst [showSettings, setShowSettings] = useLocalVar("settings:visible", true);\n```'
    },
    {
        id: 'sync-vars-guide',
        title: '变量类型选择指南',
        category: '系统API',
        tags: ['useSyncVar', 'useLocalVar', 'useState', '选择指南'],
        content: '## 使用 useSyncVar 的情况\n\n需要学生看到的互动结果\n- K 值选择、答题状态、实验参数、拖拽排序结果\n\n## 使用 useLocalVar 的情况\n\n仅教师端显示的 UI 状态\n- 菜单展开/折叠、工具提示、模态框显示、设置面板\n\n## 使用 useState 的情况\n\n临时计算变量，仅用于内部逻辑\n- 中间计算结果、DOM 引用、动画计时器\n\n## 重要规则\n\n1. 同步变量会触发网络通信，避免频繁更新\n2. 本地变量不会产生网络开销，适合高频更新\n3. 命名格式：`slide-id:variable-name`'
    },

    // ========================================================
    // Category: 互动组件
    // ========================================================
    {
        id: 'quiz-component',
        title: '选择题组件',
        category: '互动组件',
        tags: ['选择题', '单选', '多选', 'onClick'],
        content: '选择题组件用于创建单选或多选互动题。\n\n使用示例：\n```tsx\n<div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-8">\n    <h2 className="text-2xl font-bold text-slate-800 mb-8">题目：地球是圆的吗？</h2>\n    <div className="space-y-3 w-full max-w-md">\n        {["是的", "不是", "其他形状"].map((option, index) => (\n            <button\n                key={index}\n                className="w-full p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-left text-lg font-medium text-slate-700 hover:bg-blue-50"\n                onClick={() => console.log("选择了:", option)}\n            >\n                {option}\n            </button>\n        ))}\n    </div>\n</div>\n```\n\n提示：使用 onClick 处理用户选择，可以通过状态管理记录用户答案'
    },
    {
        id: 'fill-blank-component',
        title: '填空题组件',
        category: '互动组件',
        tags: ['填空题', 'input', '表单'],
        content: '填空题组件用于创建需要输入答案的题目。\n\n使用示例：\n```tsx\n<div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-green-50 to-teal-100 p-8">\n    <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">\n        1 + 1 = <span className="text-4xl text-blue-600">？</span>\n    </h2>\n    <input\n        type="text"\n        placeholder="请输入答案"\n        className="w-64 p-4 text-2xl text-center border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none"\n    />\n    <button\n        className="mt-8 px-8 py-3 bg-green-600 text-white rounded-full text-xl font-bold hover:bg-green-500 transition-colors"\n        onClick={() => console.log("提交答案")}\n    >\n        提交答案\n    </button>\n</div>\n```\n\n提示：使用 placeholder 提供提示，可以通过获取 input 的 value 来验证答案'
    },
    {
        id: 'drag-sort-component',
        title: '拖拽排序组件',
        category: '互动组件',
        tags: ['拖拽', '排序', 'draggable', 'onDragStart', 'onDrop'],
        content: '拖拽排序组件允许学生拖动元素进行排序。\n\n使用示例：\n```tsx\n<div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-purple-50 to-pink-100 p-8">\n    <h2 className="text-2xl font-bold text-slate-800 mb-6">按大小排序</h2>\n    <div className="space-y-3 w-full max-w-md">\n        {["大象", "猫", "老鼠", "狗"].map((animal, index) => (\n            <div\n                key={index}\n                className="p-4 bg-white rounded-xl shadow-md cursor-move text-lg font-medium text-slate-700 hover:scale-105 transition-transform"\n                draggable={true}\n                onDragStart={() => console.log("开始拖拽:", animal)}\n                onDrop={() => console.log("放置:", animal)}\n            >\n                {animal}\n            </div>\n        ))}\n    </div>\n</div>\n```\n\n提示：draggable={true} 使元素可拖拽，可以结合状态管理实现完整的排序逻辑'
    },

    // ========================================================
    // Category: 系统API - 高级功能
    // ========================================================
    {
        id: 'camera-api',
        title: '摄像头管理 API',
        category: '系统API',
        tags: ['摄像头', 'getCamera', 'unregisterCamera', 'video'],
        content: '萤火课件支持调用学生摄像头进行互动。\n\n## getCamera - 获取摄像头视频流\n\n```tsx\nconst onStream = (stream) => {\n    if (videoRef.current) {\n        videoRef.current.srcObject = stream;\n    }\n};\nwindow.CourseGlobalContext.getCamera(onStream);\n```\n\n## unregisterCamera - 注销摄像头\n\n```tsx\nwindow.CourseGlobalContext.unregisterCamera(onStream);\n```\n\n## 完整示例\n\n```tsx\nconst { useRef, useEffect } = React;\n\nfunction CameraSlide() {\n    const videoRef = useRef(null);\n    const onStream = (stream) => {\n        if (videoRef.current) {\n            videoRef.current.srcObject = stream;\n        }\n    };\n\n    useEffect(() => {\n        window.CourseGlobalContext.getCamera(onStream);\n        return () => {\n            window.CourseGlobalContext.unregisterCamera(onStream);\n            if (videoRef.current) {\n                videoRef.current.srcObject = null;\n            }\n        };\n    }, []);\n\n    return (\n        <div className="flex flex-col items-center justify-center h-full bg-slate-900">\n            <video ref={videoRef} autoPlay playsInline className="rounded-xl shadow-2xl" width={640} height={480} />\n        </div>\n    );\n}\n```\n\n提示：组件卸载时必须调用 unregisterCamera，避免资源泄露'
    },
    {
        id: 'submit-api',
        title: '学生端提交 API',
        category: '系统API',
        tags: ['提交', 'submitContent', '学生端', '文件上传'],
        content: '学生端可以向教师端提交内容（答题结果、问卷、图片等）。\n\n## submitContent - 提交内容\n\n```tsx\nawait window.CourseGlobalContext.submitContent(options);\n```\n\n参数：\n- `content`: 要提交的内容（字符串、对象、数组）\n- `fileName`: 文件名（默认 "submission.txt"）\n- `mergeFile`: 是否合并到同一个 CSV 文件（默认 false）\n\n## 使用示例\n\n### 提交答题结果\n```tsx\nawait window.CourseGlobalContext.submitContent({\n    content: {\n        type: "quiz-answer",\n        question: "地球是圆的吗？",\n        answer: selectedAnswer,\n        submittedAt: new Date().toISOString()\n    },\n    fileName: "quiz-result.txt"\n});\n```\n\n### 提交图片（Base64）\n```tsx\nconst imageDataUrl = canvasRef.current.toDataURL("image/png");\nawait window.CourseGlobalContext.submitContent({\n    content: { type: "image-drawing", data: imageDataUrl },\n    fileName: "drawing.png"\n});\n```\n\n提示：仅学生端可用，必须使用 await 等待提交完成'
    },
    {
        id: 'canvas-api',
        title: '画布坐标转换 API',
        category: '系统API',
        tags: ['画布', 'getCanvasPoint', '坐标转换', '缩放'],
        content: '萤火课件的画布可能被 scale() 缩放，需要使用专用 API 转换坐标。\n\n## getCanvasPoint - 转换鼠标坐标\n\n```tsx\nconst p = window.CourseGlobalContext?.canvas?.getCanvasPoint(event, canvasElement);\nif (p) {\n    console.log("真实逻辑坐标:", p.x, p.y);\n}\n```\n\n## 使用示例：在 Canvas 上绘制\n\n```tsx\nconst canvasRef = useRef(null);\n\nconst handleClick = (e) => {\n    const p = window.CourseGlobalContext?.canvas?.getCanvasPoint(e, canvasRef.current);\n    if (p) {\n        const ctx = canvasRef.current.getContext("2d");\n        ctx.fillStyle = "red";\n        ctx.beginPath();\n        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);\n        ctx.fill();\n    }\n};\n\nreturn (\n    <canvas ref={canvasRef} onClick={handleClick} width={640} height={480} className="border border-slate-300 rounded-xl" />\n);\n```\n\n提示：必须使用 getCanvasPoint，否则在不同缩放比例下坐标会错位'
    },

    // ========================================================
    // Category: 动画效果
    // ========================================================
    {
        id: 'animation-basic',
        title: '基础动画效果',
        category: '动画效果',
        tags: ['动画', 'CSS动画', 'keyframes', 'transition'],
        content: '使用 CSS 和 React 实现基础动画效果。\n\n使用示例：\n```tsx\n<div className="flex flex-col items-center justify-center h-full bg-slate-900">\n    <div\n        className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-2xl"\n        style={{\n            animation: "bounce 2s infinite",\n            animationDelay: "0s"\n        }}\n    />\n    <style>{`\n        @keyframes bounce {\n            0%, 100% { transform: translateY(0); }\n            50% { transform: translateY(-100px); }\n        }\n    `}</style>\n</div>\n```\n\n常用动画类（Tailwind）：\n- animate-pulse: 脉冲效果\n- animate-spin: 旋转效果\n- animate-bounce: 弹跳效果\n- animate-ping: 扩散效果\n\n提示：可以使用 style 标签定义自定义 keyframes，结合 setTimeout 实现延时动画'
    },

    // ========================================================
    // Category: 样式系统
    // ========================================================
    {
        id: 'tailwind-css',
        title: 'Tailwind CSS 样式系统',
        category: '样式系统',
        tags: ['Tailwind', 'CSS', '样式', '布局'],
        content: '萤火课件编辑器内置 Tailwind CSS，可以直接使用所有工具类。\n\n常用布局类：\n- flex: Flex 布局\n- items-center: 垂直居中\n- justify-center: 水平居中\n- w-full: 宽度 100%\n- h-full: 高度 100%\n- p-8: 内边距 2rem\n\n常用样式类：\n- bg-blue-500: 蓝色背景\n- text-white: 白色文字\n- rounded-xl: 圆角\n- shadow-xl: 阴影\n- font-bold: 粗体\n\n渐变色：\n- bg-gradient-to-br: 从左上到右下渐变\n- from-blue-500 to-indigo-600: 蓝色到靛蓝\n\n使用示例：\n```tsx\n<div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-2xl shadow-2xl">\n    <h2 className="text-3xl font-bold text-white">标题</h2>\n</div>\n```'
    },

    // ========================================================
    // Category: 状态管理
    // ========================================================
    {
        id: 'react-hooks',
        title: 'React Hooks 状态管理',
        category: '状态管理',
        tags: ['Hooks', 'useState', 'useEffect', 'useRef'],
        content: '在课件组件中使用 React Hooks 管理状态。\n\n可用的 Hooks：\n- useState: 管理组件状态\n- useEffect: 处理副作用\n- useRef: 访问 DOM 元素\n- useCallback: 缓存回调函数\n- useMemo: 缓存计算结果\n\n使用示例：\n```tsx\n{\n    title: "互动计数器",\n    component: (() => {\n        return function InteractiveCounter() {\n            const [count, setCount] = React.useState(0);\n\n            return (\n                <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100">\n                    <h2 className="text-4xl font-bold text-slate-800 mb-8">{count}</h2>\n                    <div className="flex gap-4">\n                        <button className="px-6 py-3 bg-red-500 text-white rounded-xl text-xl font-bold hover:bg-red-400" onClick={() => setCount(c => c - 1)}>-1</button>\n                        <button className="px-6 py-3 bg-green-500 text-white rounded-xl text-xl font-bold hover:bg-green-400" onClick={() => setCount(c => c + 1)}>+1</button>\n                    </div>\n                </div>\n            );\n        };\n    })()\n}\n```\n\n提示：复杂的组件需要用工厂函数包裹，避免在组件外部使用 useState'
    },

    // ========================================================
    // Category: 多媒体
    // ========================================================
    {
        id: 'media-images',
        title: '图片和视频媒体',
        category: '多媒体',
        tags: ['图片', '视频', 'img', 'video', '媒体'],
        content: '在课件中添加图片和视频内容。\n\n图片使用示例：\n```tsx\n<div className="flex flex-col items-center justify-center h-full bg-white p-8">\n    <img\n        src="https://example.com/image.jpg"\n        alt="示例图片"\n        className="max-w-full max-h-96 object-contain rounded-xl shadow-xl"\n    />\n</div>\n```\n\n视频使用示例：\n```tsx\n<div className="flex flex-col items-center justify-center h-full bg-slate-900 p-8">\n    <video\n        src="https://example.com/video.mp4"\n        controls\n        className="max-w-full max-h-96 rounded-xl shadow-2xl"\n    >\n        您的浏览器不支持视频播放\n    </video>\n</div>\n```\n\n提示：\n- max-w-full 和 max-h-96 限制最大尺寸\n- object-contain 保持图片比例\n- controls 属性启用视频控制条'
    },

    // ========================================================
    // Category: 最佳实践
    // ========================================================
    {
        id: 'performance-optimization',
        title: '性能优化最佳实践',
        category: '最佳实践',
        tags: ['性能', '优化', '最佳实践'],
        content: '编写高性能课件的最佳实践。\n\n1. **代码简洁**\n   - 避免不必要的嵌套\n   - 使用语义化组件\n   - 合理拆分复杂组件\n\n2. **样式优化**\n   - 优先使用 Tailwind 内置类\n   - 避免过度使用 !important\n   - 合理使用渐变和阴影（影响性能）\n\n3. **交互优化**\n   - 使用 debounce/throttle 处理频繁事件\n   - 避免在 render 中创建新函数\n   - 合理使用 useCallback 和 useMemo\n\n4. **状态管理**\n   - 保持状态最小化\n   - 避免不必要的状态更新\n   - 使用 key 帮助 React 识别列表项\n\n5. **动画优化**\n   - 优先使用 CSS 动画\n   - 避免复杂的 JavaScript 动画\n   - 使用 transform 和 opacity 进行动画\n\n6. **资源加载**\n   - 图片使用合适尺寸\n   - 视频使用流媒体格式\n   - 第三方库按需加载\n\n示例代码：\n```tsx\n// 好的做法\nconst items = ["A", "B", "C"];\n{items.map(item => (\n    <div key={item}>{item}</div>\n))}\n\n// 不好的做法\n{["A", "B", "C"].map((item, index) => (\n    <div key={index}>{item}</div>\n))}\n```'
    }
];

// ========================================================
// RAG 知识检索函数
// ========================================================

/**
 * 将查询转换为关键词（移除标点，保留中文和英文单词）
 */
function extractKeywords(query) {
    return query
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5]+/g, ' ')
        .split(' ')
        .filter(k => k.length > 0);
}

/**
 * 计算文本相似度（基于关键词匹配）
 */
function calculateSimilarity(text, keywords) {
    const lowerText = text.toLowerCase();
    let matchCount = 0;
    let totalScore = 0;

    keywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
            matchCount += matches.length;
            totalScore += matches.length * (keyword.length > 2 ? 1.5 : 1); // 长关键词权重更高
        }
    });

    return {
        matchCount,
        totalScore,
        normalizedScore: totalScore / (keywords.length * 2 || 1)
    };
}

/**
 * RAG 检索：根据查询返回最相关的知识块
 * @param {string} query - 用户查询
 * @param {number} topK - 返回前 K 个结果（默认 3）
 * @param {string} category - 可选，按分类过滤
 * @returns {Array} 相关知识块列表
 */
function retrieveKnowledge(query, topK = 3, category = null) {
    const keywords = extractKeywords(query);

    // 计算每条知识的相似度分数
    const scoredItems = builtinKnowledgeBase.map(item => {
        const titleScore = calculateSimilarity(item.title + ' ' + (item.tags || []).join(' '), keywords);
        const contentScore = calculateSimilarity(item.content, keywords);

        return {
            ...item,
            scores: {
                title: titleScore,
                content: contentScore
            },
            totalScore: titleScore.totalScore * 2 + contentScore.totalScore // 标题匹配权重更高
        };
    });

    // 过滤分类（如果指定）
    let filteredItems = scoredItems;
    if (category) {
        filteredItems = scoredItems.filter(item => item.category === category);
    }

    // 排序并返回前 topK 个结果
    return filteredItems
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, topK)
        .map(({ scores, ...rest }) => rest); // 移除分数字段
}

// ========================================================
// 导出知识库和检索函数
// ========================================================

// 在浏览器环境中导出
if (typeof window !== 'undefined') {
    window.builtinKnowledgeBase = builtinKnowledgeBase;
    window.retrieveKnowledge = retrieveKnowledge;
    console.log('[知识库 RAG] 已加载知识:', builtinKnowledgeBase.length, '条');
}

// 在 Node.js 环境中导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        builtinKnowledgeBase,
        retrieveKnowledge,
        extractKeywords,
        calculateSimilarity
    };
}
