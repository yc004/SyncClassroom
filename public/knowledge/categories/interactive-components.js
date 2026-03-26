// ========================================================
// Category: 互动组件
// ========================================================

const interactiveComponentsKnowledge = [
    {
        id: 'quiz-component',
        title: '选择题组件',
        category: '互动组件',
        tags: ['选择题', '单选', '多选', 'onClick'],
        content: '选择题组件用于创建单选或多选互动题。\n\n使用示例：\n```tsx\n<div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-8">\n    <h2 className="text-2xl font-bold text-slate-800 mb-8">题目：地球是圆的吗？</h2>\n    <div className="space-y-3 w-full max-w-md">\n        {["是的", "不是", "其他形状"].map((option, index) => (\n            <button\n                key={index}\n                className="w-full p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-left text-lg font-medium text-slate-700 hover:bg-blue-50"\n                onClick={() => console.log("选择了:", option)}\n            >\n                {option}\n            </button>\n        ))}\n    </div>\n</div>\n```\n\n提示：使用 onClick 处理用户选择，可以通过状态管理记录用户答案',
        isBuiltin: true
    },
    {
        id: 'fill-blank-component',
        title: '填空题组件',
        category: '互动组件',
        tags: ['填空题', 'input', '表单'],
        content: '填空题组件用于创建需要输入答案的题目。\n\n使用示例：\n```tsx\n<div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-green-50 to-teal-100 p-8">\n    <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">\n        1 + 1 = <span className="text-4xl text-blue-600">？</span>\n    </h2>\n    <input\n        type="text"\n        placeholder="请输入答案"\n        className="w-64 p-4 text-2xl text-center border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none"\n    />\n    <button\n        className="mt-8 px-8 py-3 bg-green-600 text-white rounded-full text-xl font-bold hover:bg-green-500 transition-colors"\n        onClick={() => console.log("提交答案")}\n    >\n        提交答案\n    </button>\n</div>\n```\n\n提示：使用 placeholder 提供提示，可以通过获取 input 的 value 来验证答案',
        isBuiltin: true
    },
    {
        id: 'drag-sort-component',
        title: '拖拽排序组件',
        category: '互动组件',
        tags: ['拖拽', '排序', 'draggable', 'onDragStart', 'onDrop'],
        content: '拖拽排序组件允许学生拖动元素进行排序。\n\n使用示例：\n```tsx\n<div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-purple-50 to-pink-100 p-8">\n    <h2 className="text-2xl font-bold text-slate-800 mb-6">按大小排序</h2>\n    <div className="space-y-3 w-full max-w-md">\n        {["大象", "猫", "老鼠", "狗"].map((animal, index) => (\n            <div\n                key={index}\n                className="p-4 bg-white rounded-xl shadow-md cursor-move text-lg font-medium text-slate-700 hover:scale-105 transition-transform"\n                draggable={true}\n                onDragStart={() => console.log("开始拖拽:", animal)}\n                onDrop={() => console.log("放置:", animal)}\n            >\n                {animal}\n            </div>\n        ))}\n    </div>\n</div>\n```\n\n提示：draggable={true} 使元素可拖拽，可以结合状态管理实现完整的排序逻辑',
        isBuiltin: true
    }
];

if (typeof window !== 'undefined') {
    window.interactiveComponentsKnowledge = interactiveComponentsKnowledge;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = interactiveComponentsKnowledge;
}
