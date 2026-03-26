// ========================================================
// 萤火课件编辑器 - 知识库向量存储（RAG 格式）
// ========================================================
// 遵循标准 RAG 系统的设计：
// 1. 知识分块（chunk）：将长文本按主题分割成小块
// 2. 元数据（metadata）：每块包含 id、title、category、tags
// 3. 相似度检索（retrieval）：基于关键词匹配最相关的知识块
// 
// 知识库按分类拆分到 categories/ 目录下：
// - system-api.js: 系统API
// - interactive-components.js: 互动组件
// - teaching-strategies.js: 教学策略
// - animations.js: 动画效果
// - styling.js: 样式系统
// - state-management.js: 状态管理
// - multimedia.js: 多媒体
// - best-practices.js: 最佳实践

// ========================================================
// 加载所有分类知识
// ========================================================

let builtinKnowledgeBase = [];

// 加载函数（支持浏览器和 Node.js 环境）
function loadCategory(categoryName, globalVarName) {
    if (typeof window !== 'undefined') {
        // 浏览器环境：从全局变量获取
        return window[globalVarName] || [];
    } else if (typeof require !== 'undefined') {
        // Node.js 环境：动态加载模块
        try {
            return require(`./categories/${categoryName}.js`);
        } catch (e) {
            console.warn(`无法加载分类模块: ${categoryName}`, e.message);
            return [];
        }
    }
    return [];
}

// 合并所有分类
builtinKnowledgeBase = [
    ...loadCategory('system-api', 'systemAPIKnowledge'),
    ...loadCategory('interactive-components', 'interactiveComponentsKnowledge'),
    ...loadCategory('teaching-strategies', 'teachingStrategiesKnowledge'),
    ...loadCategory('animations', 'animationsKnowledge'),
    ...loadCategory('styling', 'stylingKnowledge'),
    ...loadCategory('state-management', 'stateManagementKnowledge'),
    ...loadCategory('multimedia', 'multimediaKnowledge'),
    ...loadCategory('best-practices', 'bestPracticesKnowledge')
];

// ========================================================
// RAG 知识检索函数
// ========================================================

/**
 * 将查询转换为关键词（移除标点，保留中文和英文单词）
 */
function extractKeywords(query) {
    return query
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5]+/g, ' ')
        .split(' ')
        .filter(k => k.length > 0);
}

/**
 * 计算文本相似度（基于关键词匹配）
 */
function calculateSimilarity(text, keywords) {
    const lowerText = text.toLowerCase();
    let matchCount = 0;
    let totalScore = 0;

    keywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
            matchCount += matches.length;
            totalScore += matches.length * (keyword.length > 2 ? 1.5 : 1); // 长关键词权重更高
        }
    });

    return {
        matchCount,
        totalScore,
        normalizedScore: totalScore / (keywords.length * 2 || 1)
    };
}

/**
 * RAG 检索：根据查询返回最相关的知识块
 * @param {string} query - 用户查询
 * @param {number} topK - 返回前 K 个结果（默认 3）
 * @param {string} category - 可选，按分类过滤
 * @returns {Array} 相关知识块列表
 */
function retrieveKnowledge(query, topK = 3, category = null) {
    const keywords = extractKeywords(query);

    // 计算每条知识的相似度分数
    const scoredItems = builtinKnowledgeBase.map(item => {
        const titleScore = calculateSimilarity(item.title + ' ' + (item.tags || []).join(' '), keywords);
        const contentScore = calculateSimilarity(item.content, keywords);

        return {
            ...item,
            scores: {
                title: titleScore,
                content: contentScore
            },
            totalScore: titleScore.totalScore * 2 + contentScore.totalScore // 标题匹配权重更高
        };
    });

    // 过滤分类（如果指定）
    let filteredItems = scoredItems;
    if (category) {
        filteredItems = scoredItems.filter(item => item.category === category);
    }

    // 排序并返回前 topK 个结果
    return filteredItems
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, topK)
        .map(({ scores, ...rest }) => rest); // 移除分数字段
}

/**
 * 按分类获取知识
 * @param {string} category - 分类名称
 * @returns {Array} 该分类下的所有知识
 */
function getKnowledgeByCategory(category) {
    return builtinKnowledgeBase.filter(item => item.category === category);
}

/**
 * 获取所有分类
 * @returns {Array} 分类列表
 */
function getAllCategories() {
    return [...new Set(builtinKnowledgeBase.map(item => item.category))].filter(Boolean);
}

/**
 * 重新加载知识库（用于动态更新）
 * @param {Object} options - 配置选项
 * @param {boolean} options.force - 是否强制重新加载
 */
function reloadKnowledgeBase(options = { force: false }) {
    if (options.force || builtinKnowledgeBase.length === 0) {
        builtinKnowledgeBase = [
            ...loadCategory('system-api', 'systemAPIKnowledge'),
            ...loadCategory('interactive-components', 'interactiveComponentsKnowledge'),
            ...loadCategory('teaching-strategies', 'teachingStrategiesKnowledge'),
            ...loadCategory('animations', 'animationsKnowledge'),
            ...loadCategory('styling', 'stylingKnowledge'),
            ...loadCategory('state-management', 'stateManagementKnowledge'),
            ...loadCategory('multimedia', 'multimediaKnowledge'),
            ...loadCategory('best-practices', 'bestPracticesKnowledge')
        ];
        console.log('[知识库 RAG] 重新加载完成:', builtinKnowledgeBase.length, '条');
    }
    return builtinKnowledgeBase;
}

// ========================================================
// 导出知识库和检索函数
// ========================================================

// 在浏览器环境中导出
if (typeof window !== 'undefined') {
    window.builtinKnowledgeBase = builtinKnowledgeBase;
    window.retrieveKnowledge = retrieveKnowledge;
    window.getKnowledgeByCategory = getKnowledgeByCategory;
    window.getAllCategories = getAllCategories;
    window.reloadKnowledgeBase = reloadKnowledgeBase;
    console.log('[知识库 RAG] 已加载知识:', builtinKnowledgeBase.length, '条');
}

// 在 Node.js 环境中导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        builtinKnowledgeBase,
        retrieveKnowledge,
        getKnowledgeByCategory,
        getAllCategories,
        reloadKnowledgeBase,
        extractKeywords,
        calculateSimilarity
    };
}
