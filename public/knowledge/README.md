# 知识库管理说明

## 概述

萤火课件编辑器的知识库系统现在统一在 `/public/knowledge/` 文件夹中管理。

## 文件结构

```
public/knowledge/
├── index.js          # 知识库主文件，包含所有内置知识
└── README.md         # 本说明文件
```

## 如何添加新知识

1. 打开 `/public/knowledge/index.js` 文件

2. 在 `builtinKnowledgeBase` 数组中添加新的知识对象：

```javascript
{
    id: 'builtin-11',                    // 唯一ID
    title: '你的知识标题',                 // 知识标题
    category: '分类名称',                  // 分类
    isBuiltin: true,                      // 标记为内置知识
    content: `你的知识内容...`             // 支持 Markdown
}
```

3. 保存文件，刷新编辑器即可生效

## 知识格式

每个知识对象包含以下字段：

- `id`: 唯一标识符（推荐格式：`builtin-{数字}`）
- `title`: 知识标题
- `category`: 分类名称（如：系统API、互动组件、样式系统等）
- `isBuiltin`: 是否为内置知识（固定为 `true`）
- `content`: 知识内容（支持 Markdown 格式）

## 使用场景

知识库中的内容会被 RAG（检索增强生成）系统自动检索，当用户询问相关问题时，AI 会自动引用相关知识来生成课件代码。

## 加载机制

- 内置知识：通过 `editor.html` 中的 `<script src="knowledge/index.js"></script>` 标签加载到 `window.builtinKnowledgeBase`
- 用户自定义知识：通过 Electron API 从 `userData/knowledge-base.json` 加载
- 两者合并后提供给 AI 聊天和知识库管理组件使用

## 现有知识分类

1. 系统API
2. 互动组件
3. 动画效果
4. 数学公式
5. 样式系统
6. 状态管理
7. 多媒体
8. 最佳实践

## 注意事项

- 内置知识（`isBuiltin: true`）不允许在知识库界面中编辑或删除
- 用户自定义知识存储在本地文件中，可以自由编辑
- 知识内容支持 Markdown，建议使用代码块来展示示例代码
