// ========================================================
// Category: 最佳实践
// ========================================================

const bestPracticesKnowledge = [
    {
        id: 'performance-optimization',
        title: '性能优化最佳实践',
        category: '最佳实践',
        tags: ['性能', '优化', '最佳实践'],
        content: '编写高性能课件的最佳实践。\n\n1. **代码简洁**\n   - 避免不必要的嵌套\n   - 使用语义化组件\n   - 合理拆分复杂组件\n\n2. **样式优化**\n   - 优先使用 Tailwind 内置类\n   - 避免过度使用 !important\n   - 合理使用渐变和阴影（影响性能）\n\n3. **交互优化**\n   - 使用 debounce/throttle 处理频繁事件\n   - 避免在 render 中创建新函数\n   - 合理使用 useCallback 和 useMemo\n\n4. **状态管理**\n   - 保持状态最小化\n   - 避免不必要的状态更新\n   - 使用 key 帮助 React 识别列表项\n\n5. **动画优化**\n   - 优先使用 CSS 动画\n   - 避免复杂的 JavaScript 动画\n   - 使用 transform 和 opacity 进行动画\n\n6. **资源加载**\n   - 图片使用合适尺寸\n   - 视频使用流媒体格式\n   - 第三方库按需加载\n\n示例代码：\n```tsx\n// 好的做法\nconst items = ["A", "B", "C"];\n{items.map(item => (\n    <div key={item}>{item}</div>\n))}\n\n// 不好的做法\n{["A", "B", "C"].map((item, index) => (\n    <div key={index}>{item}</div>\n))}\n```',
        isBuiltin: true
    }
];

if (typeof window !== 'undefined') {
    window.bestPracticesKnowledge = bestPracticesKnowledge;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = bestPracticesKnowledge;
}
