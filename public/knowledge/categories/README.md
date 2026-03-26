# 知识库分类管理说明

## 目录结构

```
knowledge/
├── categories/              # 知识分类目录
│   ├── system-api.js       # 系统API
│   ├── interactive-components.js  # 互动组件
│   ├── teaching-strategies.js     # 教学策略
│   ├── animations.js       # 动画效果
│   ├── styling.js          # 样式系统
│   ├── state-management.js # 状态管理
│   ├── multimedia.js       # 多媒体
│   └── best-practices.js   # 最佳实践
├── index.js               # 主索引文件（自动加载所有分类）
├── processor.js           # 知识处理器（文件导入）
└── example.json           # 示例文件
```

## 如何添加新知识

### 1. 选择分类文件

根据知识内容选择合适的分类文件：

- **system-api.js**: 萤火课件系统的API和接口
- **interactive-components.js**: 互动组件（选择题、拖拽、填空等）
- **teaching-strategies.js**: 教学策略（年龄段、教学方法、设计原则）
- **animations.js**: 动画效果和过渡
- **styling.js**: 样式系统（Tailwind CSS）
- **state-management.js**: 状态管理（React Hooks）
- **multimedia.js**: 多媒体（图片、视频）
- **best-practices.js**: 最佳实践（性能优化、代码规范）

### 2. 添加知识条目

在分类文件的数组中添加新的知识对象：

```javascript
{
    id: 'unique-id',              // 唯一标识符
    title: '知识标题',
    category: '分类名称',
    tags: ['标签1', '标签2', '标签3'],
    content: '知识内容（支持Markdown）',
    isBuiltin: true
}
```

### 3. 字段说明

- `id`: 必填，唯一标识符，建议使用 kebab-case 格式
- `title`: 必填，知识标题，应该简洁明了
- `category`: 必填，分类名称，需要与文件名对应
- `tags`: 选填，标签数组，用于搜索和过滤
- `content`: 必填，知识内容，支持 Markdown 格式
- `isBuiltin`: 必填，标记为内置知识

## 内容格式建议

### 使用 Markdown

```javascript
content: `## 二级标题

- 列表项1
- 列表项2

**加粗文本**

\`\`\`javascript
// 代码块
const x = 1;
\`\`\`
`
```

### 结构清晰

1. **概述**: 简要介绍知识点
2. **功能说明**: 详细说明功能或概念
3. **使用示例**: 提供实际代码示例
4. **注意事项**: 提示和警告信息

## 注意事项

1. **ID唯一性**: 确保 `id` 在整个知识库中是唯一的
2. **分类一致**: `category` 字段应该与所在文件名对应
3. **标签准确**: `tags` 应该包含相关的关键词，便于搜索
4. **内容完整**: `content` 应该包含足够的信息，帮助用户理解和使用

## 搜索优化

为了让知识更容易被检索到：

1. **标题包含关键词**: 标题应该包含主要关键词
2. **标签丰富**: 添加多个相关标签
3. **代码示例**: 提供实际的代码示例
4. **常见问题**: 在内容中回答常见问题

## 示例

### 添加一个新的互动组件知识

在 `interactive-components.js` 中添加：

```javascript
{
    id: 'custom-component',
    title: '自定义组件名称',
    category: '互动组件',
    tags: ['自定义', '组件', '交互'],
    content: `## 组件概述

这是一个自定义组件的说明。

## 使用示例

\`\`\`tsx
<div className="...">
    组件内容
</div>
\`\`\`

## 注意事项

- 注意点1
- 注意点2
`,
    isBuiltin: true
}
```

## 测试

添加或修改知识后：

1. 打开编辑器
2. 点击知识库按钮
3. 在搜索框中输入关键词
4. 确认新知识能够被检索到
5. 查看知识内容是否正确显示
