// ========================================================
// 萤火课件编辑器 - 知识库文件处理器
// ========================================================
// 功能：将用户导入的知识文件自动切分成标准的RAG格式
// 支持格式：Markdown (.md), 文本文件 (.txt), JSON (.json)

class KnowledgeProcessor {
    constructor() {
        this.chunkSize = 800; // 默认分块大小（字符数）
        this.chunkOverlap = 100; // 分块重叠大小
        this.maxTitleLength = 50; // 标题最大长度
    }

    // ========================================================
    // 主入口：处理导入的文件
    // ========================================================
    async processFile(file, options = {}) {
        const {
            chunkSize = this.chunkSize,
            chunkOverlap = this.chunkOverlap,
            defaultCategory = '自定义',
            defaultTags = []
        } = options;

        this.chunkSize = chunkSize;
        this.chunkOverlap = chunkOverlap;

        const fileExtension = file.name.split('.').pop().toLowerCase();
        let content = '';

        try {
            // 读取文件内容
            content = await this.readFile(file, fileExtension);

            // 根据文件类型处理
            let chunks = [];
            switch (fileExtension) {
                case 'json':
                    chunks = this.processJson(content, defaultCategory, defaultTags);
                    break;
                case 'md':
                case 'markdown':
                    chunks = this.processMarkdown(content, defaultCategory, defaultTags);
                    break;
                case 'txt':
                default:
                    chunks = this.processText(content, defaultCategory, defaultTags);
            }

            console.log(`[知识处理器] 成功处理文件: ${file.name}, 生成 ${chunks.length} 个知识块`);
            return chunks;
        } catch (error) {
            console.error(`[知识处理器] 处理文件失败: ${file.name}`, error);
            throw new Error(`文件处理失败: ${error.message}`);
        }
    }

    // ========================================================
    // 文件读取
    // ========================================================
    readFile(file, fileExtension) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('文件读取失败'));
            reader.readAsText(file, 'utf-8');
        });
    }

    // ========================================================
    // 处理 JSON 文件
    // ========================================================
    processJson(content, defaultCategory, defaultTags) {
        try {
            const data = JSON.parse(content);
            const chunks = [];

            // 情况1：数组格式（直接是知识条目）
            if (Array.isArray(data)) {
                data.forEach((item, index) => {
                    const chunk = this.normalizeToRagFormat(
                        item.title || `知识块 ${index + 1}`,
                        item.content || item.description || '',
                        item.category || defaultCategory,
                        item.tags || defaultTags,
                        index
                    );
                    chunks.push(chunk);
                });
            }
            // 情况2：对象格式（单个知识条目）
            else if (typeof data === 'object') {
                const chunk = this.normalizeToRagFormat(
                    data.title || '导入的知识',
                    data.content || data.description || '',
                    data.category || defaultCategory,
                    data.tags || defaultTags,
                    0
                );
                chunks.push(chunk);
            }

            return chunks;
        } catch (error) {
            throw new Error(`JSON 解析失败: ${error.message}`);
        }
    }

    // ========================================================
    // 处理 Markdown 文件
    // ========================================================
    processMarkdown(content, defaultCategory, defaultTags) {
        const chunks = [];

        // 提取标题和内容
        const sections = this.parseMarkdownSections(content);

        sections.forEach((section, index) => {
            // 如果内容过长，进一步分块
            if (section.content.length > this.chunkSize) {
                const subChunks = this.splitTextIntoChunks(section.content, this.chunkSize, this.chunkOverlap);
                subChunks.forEach((subChunk, subIndex) => {
                    const chunk = this.normalizeToRagFormat(
                        subIndex === 0 ? section.title : `${section.title} (续 ${subIndex + 1})`,
                        subChunk,
                        defaultCategory,
                        [...defaultTags, 'markdown', section.category || ''],
                        index * 10 + subIndex
                    );
                    chunks.push(chunk);
                });
            } else {
                const chunk = this.normalizeToRagFormat(
                    section.title || `Markdown 章节 ${index + 1}`,
                    section.content,
                    defaultCategory,
                    [...defaultTags, 'markdown', section.category || ''],
                    index
                );
                chunks.push(chunk);
            }
        });

        return chunks;
    }

    // 解析 Markdown 的标题层级结构
    parseMarkdownSections(content) {
        const sections = [];
        const lines = content.split('\n');
        let currentSection = {
            title: '',
            content: '',
            level: 0,
            category: ''
        };

        for (let line of lines) {
            // 检测标题（# 开头）
            const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headerMatch) {
                // 保存当前章节
                if (currentSection.content.trim()) {
                    sections.push({ ...currentSection });
                }

                // 开始新章节
                const level = headerMatch[1].length;
                currentSection = {
                    title: headerMatch[2],
                    content: '',
                    level,
                    category: level === 1 ? headerMatch[2] : currentSection.category
                };
            } else {
                currentSection.content += line + '\n';
            }
        }

        // 保存最后一个章节
        if (currentSection.content.trim()) {
            sections.push(currentSection);
        }

        // 如果没有检测到标题，整个文件作为一个章节
        if (sections.length === 0) {
            sections.push({
                title: '导入的文档',
                content,
                level: 0,
                category: ''
            });
        }

        return sections;
    }

    // ========================================================
    // 处理纯文本文件
    // ========================================================
    processText(content, defaultCategory, defaultTags) {
        const chunks = [];
        const textChunks = this.splitTextIntoChunks(content, this.chunkSize, this.chunkOverlap);

        textChunks.forEach((chunk, index) => {
            const normalizedChunk = this.normalizeToRagFormat(
                `文本块 ${index + 1}`,
                chunk,
                defaultCategory,
                [...defaultTags, '文本'],
                index
            );
            chunks.push(normalizedChunk);
        });

        return chunks;
    }

    // ========================================================
    // 文本分块（按字符数分割，考虑句子边界）
    // ========================================================
    splitTextIntoChunks(text, chunkSize, chunkOverlap) {
        const chunks = [];
        let startIndex = 0;

        while (startIndex < text.length) {
            let endIndex = startIndex + chunkSize;

            // 如果不是最后一块，尝试在句子边界处分割
            if (endIndex < text.length) {
                // 寻找最近的句子结束符
                const sentenceEnders = ['。', '！', '？', '.', '!', '?', '\n'];
                let bestSplitIndex = -1;

                for (let i = endIndex; i > startIndex + chunkSize / 2; i--) {
                    if (sentenceEnders.includes(text[i])) {
                        bestSplitIndex = i + 1;
                        break;
                    }
                }

                if (bestSplitIndex !== -1) {
                    endIndex = bestSplitIndex;
                }
            }

            const chunk = text.slice(startIndex, endIndex).trim();
            if (chunk) {
                chunks.push(chunk);
            }

            startIndex = endIndex - chunkOverlap;
        }

        return chunks;
    }

    // ========================================================
    // 标准化为 RAG 格式
    // ========================================================
    normalizeToRagFormat(title, content, category, tags, index) {
        // 自动提取标签
        const autoTags = this.extractTags(content);

        return {
            id: `user-${Date.now()}-${index}`,
            title: this.truncateTitle(title),
            content: this.cleanContent(content),
            category: category || '自定义',
            tags: [...new Set([...tags, ...autoTags])], // 去重
            isBuiltin: false,
            createdAt: new Date().toISOString(),
            wordCount: this.countWords(content)
        };
    }

    // 截断标题
    truncateTitle(title) {
        if (title.length <= this.maxTitleLength) {
            return title;
        }
        return title.substring(0, this.maxTitleLength - 3) + '...';
    }

    // 清理内容（去除多余空白）
    cleanContent(content) {
        return content
            .replace(/\n{3,}/g, '\n\n') // 多个换行符替换为两个
            .replace(/[ \t]{2,}/g, ' ') // 多个空格替换为一个
            .trim();
    }

    // 提取标签（从内容中提取关键词）
    extractTags(content) {
        const tags = [];
        const keywords = [
            'API', '函数', '组件', '方法', '参数', '示例', '代码',
            '使用', '配置', '安装', '优化', '性能', '错误', '调试',
            '同步', '异步', '状态', '事件', '钩子', '样式', '动画',
            '画布', '视频', '图片', '音频', '媒体', '文件',
            'React', 'JavaScript', 'TypeScript', 'CSS', 'HTML',
            'useSyncVar', 'useLocalVar', 'useEffect', 'useState'
        ];

        const lowerContent = content.toLowerCase();
        keywords.forEach(keyword => {
            if (lowerContent.includes(keyword.toLowerCase())) {
                tags.push(keyword);
            }
        });

        return tags.slice(0, 5); // 最多返回5个标签
    }

    // 统计字数（中文字符 + 英文单词）
    countWords(content) {
        const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
        return chineseChars + englishWords;
    }

    // ========================================================
    // 批量处理多个文件
    // ========================================================
    async processMultipleFiles(files, options = {}) {
        const allChunks = [];
        const errors = [];

        for (let i = 0; i < files.length; i++) {
            try {
                const chunks = await this.processFile(files[i], options);
                chunks.forEach(chunk => {
                    chunk.sourceFile = files[i].name;
                });
                allChunks.push(...chunks);
            } catch (error) {
                console.error(`处理文件 ${files[i].name} 失败:`, error);
                errors.push({ file: files[i].name, error: error.message });
            }
        }

        return {
            chunks: allChunks,
            errors,
            successCount: allChunks.length,
            errorCount: errors.length
        };
    }

    // ========================================================
    // 验证知识块格式
    // ========================================================
    validateKnowledgeChunk(chunk) {
        const required = ['id', 'title', 'content', 'category'];
        const missing = required.filter(field => !chunk[field]);

        if (missing.length > 0) {
            return {
                valid: false,
                errors: [`缺少必填字段: ${missing.join(', ')}`]
            };
        }

        if (chunk.title.length > 100) {
            return {
                valid: false,
                errors: ['标题过长（最多100字符）']
            };
        }

        if (chunk.content.length < 10) {
            return {
                valid: false,
                errors: ['内容过短（至少10字符）']
            };
        }

        return { valid: true, errors: [] };
    }
}

// ========================================================
// 导出
// ========================================================
if (typeof window !== 'undefined') {
    window.KnowledgeProcessor = KnowledgeProcessor;
    console.log('[知识处理器] 已加载 KnowledgeProcessor');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = KnowledgeProcessor;
}
