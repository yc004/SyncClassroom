// ========================================================
// Category: 教学策略
// ========================================================

const teachingStrategiesKnowledge = [
    {
        id: 'teaching-preschool',
        title: '学前儿童（3-6岁）教学策略',
        category: '教学策略',
        tags: ['学前儿童', '3-6岁', '游戏化学习', '视觉刺激', '简单交互'],
        content: '## 认知特点\n- 注意力持续时间短（5-10分钟）\n- 以具体形象思维为主，抽象思维尚未发展\n- 语言表达能力有限，更依赖视觉和动作\n- 模仿能力强，喜欢重复和游戏\n\n## 知识展现形式\n- 使用鲜艳的图片、动画和Emoji表情\n- 文字尽量少，使用简单的短句（不超过10个字）\n- 采用故事化的场景引入知识\n- 使用儿歌、顺口溜等韵律形式\n\n## 交互手段\n- 点击、拖拽等简单手势操作\n- 即时反馈（音效、动画）\n- 游戏化元素（奖励、成就、星星）\n- 语音引导和提示\n- 多点触控支持\n\n## 技术实现建议\n```tsx\n// 使用大按钮，方便小手操作\n<button className="w-24 h-24 rounded-full text-2xl">点击</button>\n\n// 添加音效反馈\n<audio src="success.mp3" autoPlay />\n\n// 使用简单的动画\n<div className="animate-bounce">弹跳动画</div>\n\n// 星星奖励系统\n<div className="flex gap-2">\n  {[1,2,3].map(i => <i key={i} className="fas fa-star text-yellow-500" />)}\n</div>\n```',
        isBuiltin: true
    },
    {
        id: 'teaching-elementary-low',
        title: '低年级小学生（7-9岁）教学策略',
        category: '教学策略',
        tags: ['低年级', '小学低年级', '7-9岁', '图文结合', '逐步引导'],
        content: '## 认知特点\n- 注意力持续时间中等（10-15分钟）\n- 具象思维向抽象思维过渡\n- 开始具备逻辑思维能力\n- 好奇心强，喜欢探索\n- 需要明确的规则和步骤\n\n## 知识展现形式\n- 图文并茂，文字比例可适当增加\n- 使用示意图、流程图辅助理解\n- 采用分步骤的学习方式\n- 使用生活化的例子和类比\n- 颜色编码区分不同类型内容\n\n## 交互手段\n- 进阶式交互（从简单到复杂）\n- 选择题、判断题等基础题型\n- 拖拽排序、配对等游戏化任务\n- 实时进度显示（进度条、关卡）\n- 简单的填空题（自动提示）\n- 多人互动（小组任务）\n\n## 技术实现建议\n```tsx\n// 步骤引导\n<div className="flex items-center gap-2">\n  {[1,2,3,4].map(i => (\n    <div key={i} className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">\n      {i}\n    </div>\n  ))}\n</div>\n\n// 进度条\n<div className="w-full h-4 bg-gray-200 rounded-full">\n  <div className="h-full bg-green-500 rounded-full" style={{width: `${progress}%`}} />\n</div>\n\n// 配对游戏\n<div className="grid grid-cols-2 gap-4">\n  {items.map(item => <div key={item.id}>{item.content}</div>)}\n</div>\n\n// 颜色编码\n<div className="flex gap-2">\n  <span className="px-3 py-1 bg-red-100 text-red-600 rounded">重点</span>\n  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded">难点</span>\n</div>\n```',
        isBuiltin: true
    },
    {
        id: 'teaching-elementary-high',
        title: '高年级小学生（10-12岁）教学策略',
        category: '教学策略',
        tags: ['高年级', '小学高年级', '10-12岁', '逻辑推理', '自主学习'],
        content: '## 认知特点\n- 注意力持续时间较长（15-20分钟）\n- 抽象思维能力显著提升\n- 具备较强的逻辑推理能力\n- 开始培养自主学习能力\n- 对挑战性和成就感有需求\n\n## 知识展现形式\n- 文字内容可以更详细\n- 使用表格、图表展示数据关系\n- 引入概念图、思维导图\n- 使用案例分析的方法\n- 鼓励学生总结归纳\n\n## 交互手段\n- 复杂的多选题、填空题\n- 开放性问题（允许自由输入）\n- 闯关模式（解锁式学习）\n- 排行榜（激发竞争意识）\n- 小组协作任务\n- 创意展示（绘制、设计）\n\n## 技术实现建议\n```tsx\n// 思维导图节点\n<div className="flex flex-col items-center">\n  <div className="px-4 py-2 bg-blue-500 text-white rounded">中心主题</div>\n  <div className="flex gap-8 mt-4">\n    <div className="px-3 py-1 bg-green-500 text-white rounded">分支1</div>\n    <div className="px-3 py-1 bg-green-500 text-white rounded">分支2</div>\n  </div>\n</div>\n\n// 数据表格\n<table className="w-full border-collapse">\n  <thead>\n    <tr className="bg-gray-100">\n      <th className="p-2 border">项目</th>\n      <th className="p-2 border">数值</th>\n    </tr>\n  </thead>\n  <tbody>\n    {data.map(row => <tr key={row.id}>{/* 行内容 */}</tr>)}\n  </tbody>\n</table>\n\n// 排行榜\n<div className="space-y-2">\n  {rankings.map((item, i) => (\n    <div key={i} className="flex justify-between p-2 bg-gray-100 rounded">\n      <span>第{i+1}名: {item.name}</span>\n      <span>{item.score}分</span>\n    </div>\n  ))}\n</div>\n```',
        isBuiltin: true
    },
    {
        id: 'teaching-middle-school',
        title: '初中生（13-15岁）教学策略',
        category: '教学策略',
        tags: ['初中', '中学生', '13-15岁', '深度思考', '综合应用'],
        content: '## 认知特点\n- 抽象思维基本成熟\n- 批判性思维开始发展\n- 注重学习内容的实用性和意义\n- 逻辑推理能力强\n- 开始形成自己的观点和价值观\n\n## 知识展现形式\n- 可以使用纯文字内容\n- 重视原理的讲解和推导过程\n- 使用实验、案例、项目式学习\n- 强调知识之间的联系和体系\n- 引入实际应用场景\n\n## 交互手段\n- 编程、数据分析等高级任务\n- 虚拟实验和仿真\n- 辩论、讨论型题目\n- 项目式学习（长周期任务）\n- 自主探究（提供资源而非答案）\n- 同伴互评\n\n## 技术实现建议\n```tsx\n// 虚拟实验界面\n<div className="flex gap-4">\n  <div className="flex-1 p-4 bg-gray-900 rounded">\n    <canvas ref={canvasRef} width={400} height={300} />\n  </div>\n  <div className="w-64 p-4 bg-gray-100 rounded">\n    <h3>实验参数</h3>\n    <input type="range" min={0} max={100} value={param1} />\n    <input type="range" min={0} max={100} value={param2} />\n    <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">运行实验</button>\n  </div>\n</div>\n\n// 代码编辑器\n<textarea\n  value={code}\n  onChange={e => setCode(e.target.value)}\n  className="w-full h-64 font-mono bg-gray-900 text-green-400 p-4 rounded"\n  spellCheck={false}\n/>\n\n// 同伴互评\n<div className="space-y-4">\n  {peers.map(peer => (\n    <div key={peer.id} className="p-4 border rounded">\n      <h4>{peer.name}的作品</h4>\n      <div className="mt-2">{peer.content}</div>\n      <textarea placeholder="写下你的评价..." className="mt-2 w-full p-2 border rounded" />\n    </div>\n  ))}\n</div>\n```',
        isBuiltin: true
    },
    {
        id: 'teaching-high-school',
        title: '高中生（16-18岁）教学策略',
        category: '教学策略',
        tags: ['高中', '16-18岁', '探究学习', '复杂问题', '批判思维'],
        content: '## 认知特点\n- 抽象思维高度发达\n- 批判性思维成熟\n- 注重知识的深度和广度\n- 具备独立思考和研究能力\n- 对未来规划和职业选择有关注\n\n## 知识展现形式\n- 可以使用学术论文、研究报告的形式\n- 强调跨学科的综合性内容\n- 使用专业术语（适当解释）\n- 提供扩展阅读和参考资料\n- 引入前沿知识和研究进展\n\n## 交互手段\n- 研究型学习项目\n- 数据分析和可视化\n- 模拟仿真系统\n- 协作创作（多人在线文档）\n- 反思日志和学习总结\n- 知识图谱构建\n\n## 技术实现建议\n```tsx\n// 数据可视化\nimport { Line, Bar, Scatter } from 'react-chartjs-2';\n\n<Line\n  data={chartData}\n  options={{\n    responsive: true,\n    plugins: {\n      title: { display: true, text: '数据趋势图' }\n    }\n  }}\n/>\n\n// 知识图谱\n<div className="relative w-full h-96">\n  {nodes.map(node => (\n    <div\n      key={node.id}\n      className="absolute transform -translate-x-1/2 -translate-y-1/2"\n      style={{ left: node.x, top: node.y }}\n    >\n      <div className="px-3 py-1 bg-blue-500 text-white rounded text-sm">{node.label}</div>\n    </div>\n  ))}\n  {/* 连接线 */}\n  <svg className="absolute inset-0 w-full h-full">\n    {edges.map(edge => (\n      <line\n        key={edge.id}\n        x1={edge.from.x}\n        y1={edge.from.y}\n        x2={edge.to.x}\n        y2={edge.to.y}\n        stroke="#94a3b8"\n        strokeWidth={2}\n      />\n    ))}\n  </svg>\n</div>\n\n// 协作文档\n<div className="flex gap-4">\n  <textarea\n    value={content}\n    onChange={e => setContent(e.target.value)}\n    className="flex-1 h-96 p-4 border rounded font-mono"\n  />\n  <div className="w-64 p-4 bg-gray-100 rounded">\n    <h3>协作者</h3>\n    <ul>\n      {collaborators.map(c => (\n        <li key={c.id} className="flex items-center gap-2">\n          <div className="w-3 h-3 rounded-full bg-green-500" />\n          {c.name}\n        </li>\n      ))}\n    </ul>\n  </div>\n</div>\n```',
        isBuiltin: true
    },
    {
        id: 'teaching-principles',
        title: '通用教学设计原则',
        category: '教学策略',
        tags: ['教学设计', '通用原则', '学习体验', '可访问性'],
        content: '## 核心设计原则\n\n### 1. 渐进式学习\n- 从简单到复杂，循序渐进\n- 每个知识点建立在已有知识之上\n- 提供必要的脚手架（提示、示例）\n\n### 2. 多模态呈现\n- 结合视觉、听觉、触觉等多种感官\n- 适应不同学习风格（视觉型、听觉型、动觉型）\n- 提供多种内容格式（文本、图片、视频、音频）\n\n### 3. 即时反馈\n- 操作后立即给出反馈\n- 反馈信息清晰明确（对错、原因）\n- 提供改进建议和后续步骤\n\n### 4. 个性化支持\n- 根据学习水平调整难度\n- 允许跳过已掌握内容\n- 为困难内容提供额外帮助\n\n### 5. 情境化学习\n- 将知识融入实际情境\n- 使用真实世界的问题\n- 强调知识的实际应用价值\n\n### 6. 激励机制\n- 明确的学习目标和进度\n- 成就系统和奖励\n- 社交元素（分享、比较、协作）\n\n## 可访问性设计\n\n### 颜色使用\n- 避免仅依赖颜色传达信息\n- 使用高对比度（至少4.5:1）\n- 提供色盲友好的配色方案\n\n### 文字可读性\n- 字体大小不小于16px\n- 行高为字体大小的1.5-2倍\n- 段落间距充足\n\n### 交互设计\n- 支持键盘导航\n- 提供足够的点击目标（最小44x44px）\n- 明确的状态指示（焦点、悬停、激活）\n\n## 技术实现建议\n```tsx\n// 无障碍属性\n<button aria-label="关闭对话框" className="close-btn">\n  <i className="fas fa-times" />\n</button>\n\n// 高对比度模式\n<div className="bg-white text-gray-900" style={{colorContrast: 'high'}}>\n  {/* 内容 */}\n</div>\n\n// 焦点管理\n<input\n  ref={inputRef}\n  className="border-2 focus:border-blue-500 focus:outline-none"\n  aria-invalid={hasError}\n  aria-describedby={hasError ? "error-msg" : undefined}\n/>\n{hasError && <span id="error-msg" className="text-red-500">错误提示</span>}\n\n// 响应式设计\n<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">\n  {items.map(item => <Card key={item.id} {...item} />)}\n</div>\n```',
        isBuiltin: true
    }
];

if (typeof window !== 'undefined') {
    window.teachingStrategiesKnowledge = teachingStrategiesKnowledge;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = teachingStrategiesKnowledge;
}
