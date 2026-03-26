// ========================================================
// 萤火课件编辑器 - 知识库管理组件
// ========================================================

    const KnowledgeBase = () => {
    const { useState, useEffect } = React;
    const [show, setShow] = useState(false);
    const [knowledgeItems, setKnowledgeItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ title: '', category: '', content: '' });
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [showUploadPanel, setShowUploadPanel] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [viewingItem, setViewingItem] = useState(null);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [batchMode, setBatchMode] = useState(false);
    const fileInputRef = React.useRef(null);

    // 从统一的知识库文件加载内置知识（通过 window.builtinKnowledgeBase）
    const loadBuiltinKnowledge = () => {
        const knowledge = window.builtinKnowledgeBase || [];
        console.log('[KnowledgeBase] 内置知识已加载:', knowledge.length, '条');
        return knowledge;
    };

    // 使用 RAG 检索相关知识
    const retrieveKnowledge = (query, topK = 5) => {
        if (!query || !knowledgeItems.length) return [];

        // 使用内置的检索函数（如果可用）
        if (typeof window.retrieveKnowledge === 'function') {
            return window.retrieveKnowledge(query, topK);
        }

        // 备用方案：简单关键词匹配
        const keywords = query
            .toLowerCase()
            .replace(/[^\w\u4e00-\u9fa5]+/g, ' ')
            .split(' ')
            .filter(k => k.length > 0);

        const scored = knowledgeItems.map(item => {
            const text = `${item.title} ${(item.tags || []).join(' ')} ${item.content}`.toLowerCase();
            let score = 0;
            keywords.forEach(keyword => {
                const matches = text.match(new RegExp(keyword, 'gi'));
                if (matches) score += matches.length;
            });
            return { ...item, score };
        });

        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, topK)
            .map(({ score, ...rest }) => rest);
    };

    // 从本地加载知识库
    const loadKnowledge = async () => {
        try {
            // 加载内置知识库（直接从 window 获取）
            const builtinData = loadBuiltinKnowledge();

            // 加载用户自定义知识库
            let userData = [];
            if (window.electronAPI?.loadKnowledgeBase) {
                userData = await window.electronAPI.loadKnowledgeBase();
            }

            // 合并内置知识和用户知识
            const allKnowledge = [...builtinData, ...(userData || [])];
            setKnowledgeItems(allKnowledge);
        } catch (error) {
            console.error('加载知识库失败:', error);
            // 如果加载失败，尝试至少加载内置知识
            const builtinData = loadBuiltinKnowledge();
            setKnowledgeItems(builtinData);
        }
    };

    // 保存知识库到本地（只保存用户知识）
    const saveKnowledge = async (items) => {
        try {
            if (window.electronAPI?.saveKnowledgeBase) {
                // 过滤掉内置知识，只保存用户知识
                const userKnowledge = items.filter(item => !item.isBuiltin);
                await window.electronAPI.saveKnowledgeBase(userKnowledge);
                const allKnowledge = [...loadBuiltinKnowledge(), ...userKnowledge];
                setKnowledgeItems(allKnowledge);
                filterItems(allKnowledge);
            }
        } catch (error) {
            console.error('保存知识库失败:', error);
            alert('保存失败: ' + error.message);
        }
    };

    useEffect(() => {
        loadKnowledge();
    }, []);

    // 过滤知识项
    useEffect(() => {
        filterItems(knowledgeItems);
    }, [searchQuery, selectedCategories, knowledgeItems]);

    const filterItems = (items) => {
        let filtered = items;

        // 使用 RAG 检索进行搜索（如果有查询词）
        if (searchQuery.trim()) {
            const retrieved = retrieveKnowledge(searchQuery, 50); // 获取更多结果

            if (selectedCategories.length > 0) {
                // 同时过滤分类
                filtered = retrieved.filter(item =>
                    selectedCategories.includes(item.category)
                );
            } else {
                filtered = retrieved;
            }
        } else {
            // 没有搜索词时按分类过滤
            if (selectedCategories.length > 0) {
                filtered = items.filter(item =>
                    selectedCategories.includes(item.category)
                );
            }
        }

        setFilteredItems(filtered);
    };

    // 获取所有分类
    const categories = [...new Set(knowledgeItems.map(item => item.category))].filter(Boolean);

    // 打开编辑/新建模态框
    const openEditor = (item = null) => {
        // 内置知识不允许编辑
        if (item && item.isBuiltin) {
            alert('内置知识由系统管理，不允许修改。如需自定义知识，请点击"添加知识"按钮。');
            return;
        }

        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                category: item.category,
                content: item.content
            });
        } else {
            setEditingItem(null);
            setFormData({ title: '', category: '', content: '' });
        }
    };

    // 保存知识项
    const handleSave = () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            alert('请填写标题和内容');
            return;
        }

        const newItem = {
            id: editingItem?.id || Date.now().toString(),
            title: formData.title.trim(),
            category: formData.category.trim() || '未分类',
            content: formData.content.trim(),
            updatedAt: new Date().toISOString()
        };

        let updatedItems;
        if (editingItem) {
            updatedItems = knowledgeItems.map(item =>
                item.id === editingItem.id ? newItem : item
            );
        } else {
            updatedItems = [...knowledgeItems, newItem];
        }

        saveKnowledge(updatedItems);
        setEditingItem(null);
        setFormData({ title: '', category: '', content: '' });
    };

    // 删除知识项
    const handleDelete = (id) => {
        const item = knowledgeItems.find(item => item.id === id);
        if (item && item.isBuiltin) {
            alert('内置知识由系统管理，不允许删除。');
            return;
        }

        if (!confirm('确定要删除这条知识吗？')) return;
        const updatedItems = knowledgeItems.filter(item => item.id !== id);
        saveKnowledge(updatedItems);
    };

    // 切换分类选择
    const toggleCategory = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    // 切换批量选择模式
    const toggleBatchMode = () => {
        setBatchMode(!batchMode);
        setSelectedItems(new Set());
    };

    // 切换选中状态
    const toggleItemSelection = (itemId) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    // 全选/取消全选
    const toggleSelectAll = () => {
        const userItems = filteredItems.filter(item => !item.isBuiltin);
        if (selectedItems.size === userItems.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(userItems.map(item => item.id)));
        }
    };

    // 批量删除选中项
    const handleBatchDelete = () => {
        if (selectedItems.size === 0) {
            alert('请先选择要删除的知识项');
            return;
        }

        if (!confirm(`确定要删除选中的 ${selectedItems.size} 条知识吗？`)) return;

        const updatedItems = knowledgeItems.filter(item => !selectedItems.has(item.id));
        saveKnowledge(updatedItems);
        setSelectedItems(new Set());
        setBatchMode(false);
    };

    // 处理文件上传（使用知识处理器）
    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (!files.length) return;

        // 检查文件大小（最大 10MB）
        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) {
                alert(`文件 ${file.name} 过大，请上传小于 10MB 的文件`);
                return;
            }
        }

        // 检查文件类型
        const validExtensions = ['.txt', '.md', '.markdown', '.json'];
        for (const file of files) {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            if (!validExtensions.includes(extension)) {
                alert(`文件 ${file.name} 格式不支持，仅支持上传文本文件、Markdown、JSON 等格式`);
                return;
            }
        }

        setUploading(true);

        try {
            // 确保知识处理器已加载
            let ProcessorClass = window.KnowledgeProcessor;
            if (!ProcessorClass) {
                console.log('[知识库] 动态加载知识处理器...');
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'knowledge/processor.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
                ProcessorClass = window.KnowledgeProcessor;
            }

            if (typeof ProcessorClass !== 'function') {
                throw new Error('知识处理器加载失败');
            }

            const processor = new ProcessorClass();

            // 处理文件
            const result = await processor.processMultipleFiles(files, {
                chunkSize: 800,
                chunkOverlap: 100,
                defaultCategory: '自定义',
                defaultTags: []
            });

            if (result.errors.length > 0) {
                console.warn('[知识库] 部分文件处理失败:', result.errors);
                const errorMessages = result.errors.map(e => `- ${e.file}: ${e.error}`).join('\n');
                alert(`部分文件处理成功，但以下文件失败：\n${errorMessages}`);
            }

            if (result.chunks.length === 0) {
                throw new Error('没有成功的知识块');
            }

            // 合并到现有知识库
            const updatedItems = [...knowledgeItems, ...result.chunks];
            saveKnowledge(updatedItems);

            console.log(`[知识库] 成功导入 ${result.chunks.length} 个知识块`);
            alert(`成功导入 ${result.chunks.length} 个知识块${result.errors.length > 0 ? `（${result.errors.length} 个文件失败）` : ''}`);

        } catch (error) {
            console.error('[知识库] 文件处理失败:', error);
            alert('文件处理失败: ' + error.message);
        } finally {
            setUploading(false);
            // 重置文件输入
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    // 格式化时间
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            {/* 触发按钮 */}
            <button
                onClick={() => setShow(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-700 text-slate-200 rounded hover:bg-slate-600 transition-colors text-xs font-bold"
                title="知识库"
            >
                <i className="fas fa-brain text-purple-400 text-xs"></i>
                <span>RAG 知识库</span>
                {knowledgeItems.length > 0 && (
                    <span className="bg-purple-600 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                        {knowledgeItems.length}
                    </span>
                )}
            </button>

            {/* 知识库主面板 */}
            {show && (
                <div className="fixed inset-0 z-50 bg-slate-900/90 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-2xl w-[1200px] h-[700px] flex flex-col border border-slate-700 shadow-2xl flex-shrink-0 overflow-hidden">
                        {/* 标题栏 */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
                            <div className="flex items-center gap-3">
                                <i className="fas fa-brain text-purple-400 text-xl"></i>
                                <h2 className="text-xl font-bold text-white">RAG 知识库</h2>
                                <span className="text-slate-400 text-sm">({knowledgeItems.length} 条知识)</span>
                            </div>
                            <button
                                onClick={() => setShow(false)}
                                className="w-8 h-8 rounded-full bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* 左侧：分类和搜索 */}
                            <div className="w-64 p-4 border-r border-slate-700 bg-slate-850 overflow-y-auto">
                                <div className="mb-4">
                                    <label className="text-xs font-bold text-slate-400 mb-2 block">搜索</label>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="搜索知识..."
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                {categories.length > 0 && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 mb-2 block">分类筛选</label>
                                        <div className="space-y-1">
                                            {categories.map(category => (
                                                <label key={category} className="flex items-center gap-2 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCategories.includes(category)}
                                                        onChange={() => toggleCategory(category)}
                                                        className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                                        {category}
                                                        <span className="text-slate-500 text-xs ml-1">
                                                            ({knowledgeItems.filter(i => i.category === category).length})
                                                        </span>
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* RAG 系统说明 */}
                                <div className="mt-4 p-3 bg-purple-900/20 border border-purple-700/50 rounded-lg">
                                    <div className="text-xs text-purple-300 font-bold mb-2 flex items-center gap-2">
                                        <i className="fas fa-info-circle"></i>
                                        RAG 智能检索系统
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        AI 会根据您的问题自动从知识库中检索相关内容。无需手动选择知识,系统会智能匹配并应用到生成过程中。
                                    </p>
                                </div>

                                {/* 知识操作按钮 */}
                                <div className="space-y-2 mt-4">
                                    <button
                                        onClick={() => setShowUploadPanel(true)}
                                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-sm font-bold flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-upload"></i>
                                        上传文件
                                    </button>
                                    <button
                                        onClick={toggleBatchMode}
                                        className={`w-full px-4 py-2 transition-colors text-sm font-bold flex items-center justify-center gap-2 ${
                                            batchMode
                                                ? 'bg-orange-600 hover:bg-orange-500 text-white'
                                                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                                        }`}
                                    >
                                        <i className="fas fa-tasks"></i>
                                        {batchMode ? '退出批量模式' : '批量管理'}
                                    </button>
                                    {batchMode && (
                                        <div className="space-y-2 pt-2 border-t border-slate-700">
                                            <button
                                                onClick={toggleSelectAll}
                                                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                                            >
                                                <i className="fas fa-check-double"></i>
                                                全选/取消
                                            </button>
                                            <button
                                                onClick={handleBatchDelete}
                                                disabled={selectedItems.size === 0}
                                                className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-bold flex items-center justify-center gap-2"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                                删除选中 ({selectedItems.size})
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 右侧：知识列表 */}
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {filteredItems.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                        <i className="fas fa-folder-open text-4xl mb-4"></i>
                                        <p>暂无知识</p>
                                        <button
                                            onClick={() => openEditor()}
                                            className="mt-4 text-blue-400 hover:text-blue-300"
                                        >
                                            添加第一条知识
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        {filteredItems.map(item => (
                                            <div
                                                key={item.id}
                                                className={`bg-slate-900 border rounded-xl p-4 transition-all ${
                                                    batchMode
                                                        ? selectedItems.has(item.id)
                                                            ? 'border-orange-500 bg-orange-900/10'
                                                            : 'border-slate-700'
                                                        : 'border-slate-700 hover:border-blue-500/50'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 cursor-pointer" onClick={() => setViewingItem(item)}>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {batchMode && !item.isBuiltin && (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedItems.has(item.id)}
                                                                    onChange={() => toggleItemSelection(item.id)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-orange-500 focus:ring-orange-500"
                                                                />
                                                            )}
                                                            <h3 className="font-bold text-white hover:text-blue-400 transition-colors">{item.title}</h3>
                                                            {item.isBuiltin && (
                                                                <span className="px-2 py-0.5 bg-amber-600/20 text-amber-400 text-xs rounded-full font-bold">
                                                                    内置
                                                                </span>
                                                            )}
                                                            {item.source === 'file' && (
                                                                <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded-full">
                                                                    文件
                                                                </span>
                                                            )}
                                                            {item.category && (
                                                                <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full">
                                                                    {item.category}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.tags && item.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mb-2">
                                                                {item.tags.slice(0, 3).map((tag, idx) => (
                                                                    <span key={idx} className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                                {item.tags.length > 3 && (
                                                                    <span className="text-xs text-slate-500">
                                                                        +{item.tags.length - 3}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                        <p className="text-sm text-slate-400 line-clamp-3 whitespace-pre-wrap">
                                                            {item.content}
                                                        </p>
                                                        <p className="text-xs text-blue-400 mt-1 hover:text-blue-300 flex items-center gap-1">
                                                            <i className="fas fa-eye"></i>
                                                            点击查看完整内容
                                                        </p>
                                                        {item.fileName && (
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <p className="text-xs text-green-400">
                                                                    <i className="fas fa-file-alt mr-1"></i>
                                                                    {item.fileName}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {!item.isBuiltin && (
                                                            <>
                                                                <button
                                                                    onClick={() => openEditor(item)}
                                                                    className="w-8 h-8 rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
                                                                    title="编辑"
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(item.id)}
                                                                    className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                                                                    title="删除"
                                                                >
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </>
                                                        )}
                                                        {item.isBuiltin && (
                                                            <button
                                                                disabled
                                                                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-500 cursor-not-allowed"
                                                                title="内置知识不可修改"
                                                            >
                                                                <i className="fas fa-lock"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 查看完整内容模态框 */}
                    {viewingItem && (
                        <div className="fixed inset-0 z-[65] bg-slate-900/80 flex items-center justify-center p-4">
                            <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] border border-slate-600 shadow-2xl flex flex-col">
                                <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
                                    <div className="flex items-center gap-3 flex-1">
                                        <i className="fas fa-book-open text-blue-400 text-xl"></i>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{viewingItem.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {viewingItem.isBuiltin && (
                                                    <span className="px-2 py-0.5 bg-amber-600/20 text-amber-400 text-xs rounded-full font-bold">
                                                        内置
                                                    </span>
                                                )}
                                                {viewingItem.source === 'file' && (
                                                    <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded-full">
                                                        文件
                                                    </span>
                                                )}
                                                {viewingItem.category && (
                                                    <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full">
                                                        {viewingItem.category}
                                                    </span>
                                                )}
                                                {viewingItem.fileName && (
                                                    <span className="text-xs text-green-400">
                                                        <i className="fas fa-file-alt mr-1"></i>
                                                        {viewingItem.fileName}
                                                    </span>
                                                )}
                                                {viewingItem.updatedAt && (
                                                    <span className="text-xs text-slate-500">
                                                        {formatDate(viewingItem.updatedAt)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setViewingItem(null)}
                                        className="w-8 h-8 rounded-full bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="prose prose-invert prose-slate max-w-none prose-sm">
                                        {window.marked ? (
                                            <div
                                                className="markdown-content"
                                                dangerouslySetInnerHTML={{
                                                    __html: window.marked.parse(viewingItem.content || '')
                                                }}
                                            />
                                        ) : (
                                            <pre className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                                {viewingItem.content}
                                            </pre>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 p-4 border-t border-slate-700 bg-slate-800">
                                    {!viewingItem.isBuiltin && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setViewingItem(null);
                                                    openEditor(viewingItem);
                                                }}
                                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                                            >
                                                <i className="fas fa-edit"></i>
                                                编辑
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setViewingItem(null)}
                                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                                    >
                                        关闭
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 编辑/新建模态框 */}
                    {editingItem !== null && (
                        <div className="fixed inset-0 z-[60] bg-slate-900/80 flex items-center justify-center p-4">
                            <div className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-600 shadow-2xl">
                                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                                    <h3 className="text-lg font-bold text-white">
                                        {editingItem ? '编辑知识' : '添加知识'}
                                    </h3>
                                    <button
                                        onClick={() => setEditingItem(null)}
                                        className="w-8 h-8 rounded-full bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>

                                <div className="p-4 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">标题 *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="输入知识标题"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">分类</label>
                                        <input
                                            type="text"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            placeholder="例如：教学技巧、课程设计、技术要点..."
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                            list="category-suggestions"
                                        />
                                        <datalist id="category-suggestions">
                                            {categories.map(cat => (
                                                <option key={cat} value={cat} />
                                            ))}
                                        </datalist>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">内容 *</label>
                                        <textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            placeholder="输入知识内容..."
                                            rows={8}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none show-scrollbar"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 p-4 border-t border-slate-700">
                                    <button
                                        onClick={() => setEditingItem(null)}
                                        className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm"
                                    >
                                        保存
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 文件上传面板 */}
                    {showUploadPanel && (
                        <div className="fixed inset-0 z-[70] bg-slate-900/80 flex items-center justify-center p-4">
                            <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-600 shadow-2xl">
                                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <i className="fas fa-upload text-green-400 text-xl"></i>
                                        <h2 className="text-lg font-bold text-white">上传文件</h2>
                                    </div>
                                    <button
                                        onClick={() => setShowUploadPanel(false)}
                                        className="w-8 h-8 rounded-full bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>

                                <div className="p-4">
                                    <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-green-500 transition-colors">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept=".txt,.md,.markdown,.json,.js,.ts,.jsx,.tsx"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
                                                <i className="fas fa-file-alt text-3xl text-slate-400"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold mb-2">点击或拖拽文件到此处上传</h3>
                                                <p className="text-slate-400 text-sm">支持 TXT、Markdown、JSON、JS、TS 等格式，最大 10MB，支持多文件</p>
                                            </div>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                                className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-bold flex items-center gap-2"
                                            >
                                                <i className={`fas ${uploading ? 'fa-spinner fa-spin' : 'fa-folder-open'}`}></i>
                                                {uploading ? '处理中...' : '选择文件'}
                                            </button>
                                        </div>
                                    </div>


                                    <div className="mt-4 p-3 bg-slate-900 rounded-lg">
                                        <h4 className="text-xs font-bold text-slate-400 mb-2">支持的文件格式：</h4>
                                        <ul className="text-xs text-slate-300 space-y-1">
                                            <li>• <strong>JSON：</strong>自动解析为知识条目或知识条目数组</li>
                                            <li>• <strong>Markdown：</strong>按标题层级自动切分为多个知识块</li>
                                            <li>• <strong>TXT：</strong>按段落自动切分为知识块（每块约800字）</li>
                                        </ul>
                                        <div className="mt-2 p-2 bg-blue-600/10 border border-blue-600/30 rounded">
                                            <p className="text-xs text-blue-400">
                                                <i className="fas fa-info-circle mr-1"></i>
                                                自动切分：长文档会按段落和句子边界自动分割为多个知识块
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end p-4 border-t border-slate-700">
                                    <button
                                        onClick={() => setShowUploadPanel(false)}
                                        className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
                                    >
                                        关闭
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

window.KnowledgeBase = KnowledgeBase;
