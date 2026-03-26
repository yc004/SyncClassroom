// ========================================================
// Category: 样式系统
// ========================================================

const stylingKnowledge = [
    {
        id: 'tailwind-css',
        title: 'Tailwind CSS 样式系统',
        category: '样式系统',
        tags: ['Tailwind', 'CSS', '样式', '布局'],
        content: '萤火课件编辑器内置 Tailwind CSS，可以直接使用所有工具类。\n\n常用布局类：\n- flex: Flex 布局\n- items-center: 垂直居中\n- justify-center: 水平居中\n- w-full: 宽度 100%\n- h-full: 高度 100%\n- p-8: 内边距 2rem\n\n常用样式类：\n- bg-blue-500: 蓝色背景\n- text-white: 白色文字\n- rounded-xl: 圆角\n- shadow-xl: 阴影\n- font-bold: 粗体\n\n渐变色：\n- bg-gradient-to-br: 从左上到右下渐变\n- from-blue-500 to-indigo-600: 蓝色到靛蓝\n\n使用示例：\n```tsx\n<div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-2xl shadow-2xl">\n    <h2 className="text-3xl font-bold text-white">标题</h2>\n</div>\n```',
        isBuiltin: true
    }
];

if (typeof window !== 'undefined') {
    window.stylingKnowledge = stylingKnowledge;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = stylingKnowledge;
}
