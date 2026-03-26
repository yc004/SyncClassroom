// ========================================================
// Category: 状态管理
// ========================================================

const stateManagementKnowledge = [
    {
        id: 'react-hooks',
        title: 'React Hooks 状态管理',
        category: '状态管理',
        tags: ['Hooks', 'useState', 'useEffect', 'useRef'],
        content: '在课件组件中使用 React Hooks 管理状态。\n\n可用的 Hooks：\n- useState: 管理组件状态\n- useEffect: 处理副作用\n- useRef: 访问 DOM 元素\n- useCallback: 缓存回调函数\n- useMemo: 缓存计算结果\n\n使用示例：\n```tsx\n{\n    title: "互动计数器",\n    component: (() => {\n        return function InteractiveCounter() {\n            const [count, setCount] = React.useState(0);\n\n            return (\n                <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100">\n                    <h2 className="text-4xl font-bold text-slate-800 mb-8">{count}</h2>\n                    <div className="flex gap-4">\n                        <button className="px-6 py-3 bg-red-500 text-white rounded-xl text-xl font-bold hover:bg-red-400" onClick={() => setCount(c => c - 1)}>-1</button>\n                        <button className="px-6 py-3 bg-green-500 text-white rounded-xl text-xl font-bold hover:bg-green-400" onClick={() => setCount(c => c + 1)}>+1</button>\n                    </div>\n                </div>\n            );\n        };\n    })()\n}\n```\n\n提示：复杂的组件需要用工厂函数包裹，避免在组件外部使用 useState',
        isBuiltin: true
    }
];

if (typeof window !== 'undefined') {
    window.stateManagementKnowledge = stateManagementKnowledge;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = stateManagementKnowledge;
}
