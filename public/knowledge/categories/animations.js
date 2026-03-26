// ========================================================
// Category: 动画效果
// ========================================================

const animationsKnowledge = [
    {
        id: 'animation-basic',
        title: '基础动画效果',
        category: '动画效果',
        tags: ['动画', 'CSS动画', 'keyframes', 'transition'],
        content: '使用 CSS 和 React 实现基础动画效果。\n\n使用示例：\n```tsx\n<div className="flex flex-col items-center justify-center h-full bg-slate-900">\n    <div\n        className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-2xl"\n        style={{\n            animation: "bounce 2s infinite",\n            animationDelay: "0s"\n        }}\n    />\n    <style>{`\n        @keyframes bounce {\n            0%, 100% { transform: translateY(0); }\n            50% { transform: translateY(-100px); }\n        }\n    `}</style>\n</div>\n```\n\n常用动画类（Tailwind）：\n- animate-pulse: 脉冲效果\n- animate-spin: 旋转效果\n- animate-bounce: 弹跳效果\n- animate-ping: 扩散效果\n\n提示：可以使用 style 标签定义自定义 keyframes，结合 setTimeout 实现延时动画',
        isBuiltin: true
    }
];

if (typeof window !== 'undefined') {
    window.animationsKnowledge = animationsKnowledge;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = animationsKnowledge;
}
