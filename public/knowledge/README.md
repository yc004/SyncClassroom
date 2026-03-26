# 知识库文件处理器

## 功能说明

知识库文件处理器（`KnowledgeProcessor`）用于将用户导入的知识文件自动切分成标准的RAG（Retrieval-Augmented Generation）格式，便于AI检索和使用。

## 支持的文件格式

### 1. JSON 文件
```json
// 单个知识条目
{
  "title": "萤火课件基本结构",
  "category": "系统API",
  "content": "萤火课件编辑器使用 React + TypeScript 开发...",
  "tags": ["React", "TypeScript", "课件"]
}

// 多个知识条目（数组格式）
[
  {
    "title": "标题1",
    "content": "内容1",
    "category": "分类1",
    "tags": ["标签1"]
  },
  {
    "title": "标题2",
    "content": "内容2",
    "category": "分类2",
    "tags": ["标签2"]
  }
]
```

### 2. Markdown 文件
```markdown
# 主标题

内容段落...

## 子标题

子内容...

### 更小标题

更详细的内容...
```

**处理规则：**
- 按标题层级自动切分为知识块
- 标题层级越深，切分的粒度越细
- 自动提取标题作为知识块的title
- 如果内容过长（>800字），继续按段落切分

### 3. TXT 文件
纯文本文件，按段落和句子边界自动切分。

**处理规则：**
- 每个知识块约800字符
- 在句子边界处分割（。！？.!? \n）
- 块之间有100字符的重叠，避免信息丢失

## 自动切分策略

### 文本分块
- **默认块大小**：800字符
- **重叠大小**：100字符
- **切分边界**：优先在句子结束符处切分

### 智能标签提取
处理器会自动从内容中提取关键词作为标签：
- API术语：API、函数、组件、方法、参数
- 框架相关：React、JavaScript、TypeScript、CSS、HTML
- 系统API：useSyncVar、useLocalVar、useEffect、useState
- 其他：使用、配置、安装、优化、性能等

## 输出格式

每个处理后的知识块都符合标准的RAG格式：

```javascript
{
  id: "user-1711234567890-0",           // 唯一标识
  title: "萤火课件基本结构",            // 标题（最多50字符）
  content: "萤火课件编辑器使用...",     // 清理后的内容
  category: "自定义",                    // 分类
  tags: ["React", "TypeScript", "API"], // 标签（自动提取+手动指定）
  isBuiltin: false,                     // 是否为内置知识
  createdAt: "2026-03-26T...",          // 创建时间
  wordCount: 156,                       // 字数统计
  sourceFile: "example.json"            // 源文件名
}
```

## 使用方法

### 通过UI界面上传
1. 打开知识库面板
2. 点击"上传文件"按钮
3. 选择一个或多个文件
4. 自动处理并添加到知识库

### 通过代码调用
```javascript
const processor = new KnowledgeProcessor();

// 处理单个文件
const chunks = await processor.processFile(file, {
  chunkSize: 800,        // 可选：自定义块大小
  chunkOverlap: 100,     // 可选：自定义重叠大小
  defaultCategory: '自定义',
  defaultTags: []
});

// 处理多个文件
const result = await processor.processMultipleFiles(files, options);
console.log(`成功导入 ${result.successCount} 个知识块`);
console.log(`失败 ${result.errorCount} 个文件`);

// 验证知识块格式
const validation = processor.validateKnowledgeChunk(chunk);
if (!validation.valid) {
  console.error(validation.errors);
}
```

## 处理流程

```
文件上传
  ↓
文件类型检测
  ↓
┌────────────────┬──────────────┬──────────────┐
│   JSON文件     │  Markdown文件 │   TXT文件    │
│  解析JSON      │  解析标题层级 │  纯文本读取  │
│  提取字段      │  按章节切分   │  按段落切分   │
└────────────────┴──────────────┴──────────────┘
  ↓
文本切分（如果内容过长）
  ↓
自动提取标签
  ↓
标准化为RAG格式
  ↓
添加到知识库
```

## 注意事项

1. **文件大小限制**：单个文件最大10MB
2. **字符编码**：仅支持UTF-8编码
3. **标题长度**：超过50字符会自动截断
4. **标签数量**：自动提取最多5个标签
5. **内置知识**：系统内置知识不会被覆盖或修改

## 错误处理

处理器会返回详细的错误信息：

```javascript
try {
  const result = await processor.processMultipleFiles(files);
  
  // 检查是否有部分失败
  if (result.errors.length > 0) {
    console.warn('部分文件处理失败:', result.errors);
    // 示例错误：
    // [{ file: "error.json", error: "JSON 解析失败: Unexpected token" }]
  }
  
  // 即使有部分失败，成功的知识块仍然会被添加
  if (result.chunks.length > 0) {
    console.log(`成功导入 ${result.chunks.length} 个知识块`);
  }
} catch (error) {
  console.error('文件处理失败:', error);
}
```

## 最佳实践

1. **编写清晰的文档**：
   - 使用Markdown格式编写文档
   - 合理使用标题层级组织内容
   - 标题应简洁明确

2. **JSON文件格式**：
   - 提供准确的title和category
   - tags可以手动指定，也可以自动提取
   - content可以是纯文本或Markdown格式

3. **大文件处理**：
   - 长文档会被自动切分，无需手动分割
   - 保持段落结构完整，有助于在句子边界处切分
   - 避免过长的段落（建议每段不超过300字）

4. **标签优化**：
   - 提供相关的关键词
   - 系统会自动补充相关标签
   - 标签有助于提高检索准确度
