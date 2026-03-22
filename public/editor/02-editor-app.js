// ========================================================
// 萤火课件编辑器 - 主应用程序
// ========================================================

// 简化的预览组件，用于编辑器中预览课件
function SimplePreview({ title, slides }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
    };

    const prevSlide = () => {
        if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
    };

    return (
        <div className="flex flex-col h-full bg-slate-900">
            {/* 简化顶栏 */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0">
                <div className="flex items-center space-x-3">
                    <i className="fas fa-microchip text-blue-500 text-xl"></i>
                    <h1 className="text-lg font-bold text-white">{title || '预览'}</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                        {slides.map((_, idx) => (
                            <div key={idx} className={`h-2 rounded-full transition-all ${idx === currentSlide ? 'w-6 bg-blue-500' : 'w-2 bg-slate-600'}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* 课件展示区 */}
            <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
                <div className="bg-white relative shadow-2xl flex flex-col rounded-xl w-full h-full max-w-4xl overflow-y-auto">
                    {slides[currentSlide] && slides[currentSlide].component}
                </div>
            </div>

            {/* 简化底栏 */}
            <div className="flex items-center justify-center gap-4 px-6 py-4 bg-slate-800 border-t border-slate-700 shrink-0">
                <button 
                    onClick={prevSlide} 
                    disabled={currentSlide === 0}
                    className={`flex items-center px-4 py-2 rounded-lg font-bold transition-all ${currentSlide === 0 ? 'text-slate-500 bg-slate-700 cursor-not-allowed' : 'text-white bg-blue-600 hover:bg-blue-500'}`}
                >
                    <i className="fas fa-chevron-left mr-2"></i>上一页
                </button>
                <span className="text-slate-400 font-bold bg-slate-700 px-4 py-2 rounded-lg">
                    {currentSlide + 1} / {slides.length}
                </span>
                <button 
                    onClick={nextSlide} 
                    disabled={currentSlide === slides.length - 1}
                    className={`flex items-center px-4 py-2 rounded-lg font-bold transition-all ${currentSlide === slides.length - 1 ? 'text-slate-500 bg-slate-700 cursor-not-allowed' : 'text-white bg-blue-600 hover:bg-blue-500'}`}
                >
                    下一页<i className="fas fa-chevron-right ml-2"></i>
                </button>
            </div>
        </div>
    );
}

// 提供一个简单的加载提示组件
function SimpleLoading() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-4 text-blue-500"></i>
            <p>正在编译并渲染课件...</p>
        </div>
    );
}

// 错误提示组件
function ErrorBoundary({ error }) {
    if (!error) return null;
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-red-400 bg-red-950/20">
            <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
            <h3 className="font-bold text-lg mb-2">编译或执行失败</h3>
            <pre className="bg-red-900/40 p-4 rounded-xl w-full max-w-2xl overflow-x-auto text-sm font-mono whitespace-pre-wrap show-scrollbar">{error.toString()}</pre>
        </div>
    );
}

function EditorApp() {
    const [code, setCode] = useState(`// 在此编写你的 TypeScript 课件代码，或者通过右侧 AI 助手自动生成
window.CourseData = {
    id: 'ai-demo',
    title: '示例课程',
    icon: '💡',
    desc: '在右侧和 AI 聊天，或者直接修改此处的代码。',
    color: 'from-blue-500 to-indigo-600',
    slides: [
        {
            title: '第一页',
            component: <div className="flex items-center justify-center h-full bg-slate-50 text-2xl font-bold text-blue-600">你好，我是萤火课堂！</div>
        }
    ]
};`);
    
    const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'code'
    const [compiledCourseData, setCompiledCourseData] = useState(null);
    const [compileError, setCompileError] = useState(null);
    const [isCompiling, setIsCompiling] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const fileInputRef = useRef(null);

    const runCode = (sourceCode) => {
        setIsCompiling(true);
        setCompileError(null);
        
        try {
            // 清理旧的全局状态
            window.CourseData = null;

            // Babel 编译
            const result = window.Babel.transform(sourceCode, { 
                presets: ['react', 'typescript'], 
                filename: 'course.tsx' 
            });

            // 执行代码
            const runFn = new Function(result.code);
            runFn();

            // 获取结果
            if (window.CourseData) {
                setCompiledCourseData(window.CourseData);
            } else {
                setCompileError(new Error("代码执行成功，但没有找到 window.CourseData 导出"));
            }
        } catch (err) {
            console.error("编译/执行错误:", err);
            setCompileError(err);
            setCompiledCourseData(null);
        } finally {
            setIsCompiling(false);
        }
    };

    // 初次加载和代码变更时尝试编译
    useEffect(() => {
        // 使用防抖避免频繁编译
        const timer = setTimeout(() => {
            if (viewMode === 'preview') {
                runCode(code);
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [code, viewMode]);

    const handleAIGeneratedCode = (newCode) => {
        setCode(newCode);
        setViewMode('preview');
        runCode(newCode); // 立即编译预览
    };

    const handleImport = (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            setCode(content);
            setViewMode('code');
            runCode(content); // 立即编译预览
            setSaveStatus(`已导入: ${file.name}`);
            setTimeout(() => setSaveStatus(''), 3000);
        };
        reader.readAsText(file, 'utf-8');
        // 重置 input 以便可以重复导入同一文件
        event.target.value = '';
    };

    const handleExport = async () => {
        // 尝试从代码中提取 id 作为文件名
        let defaultFilename = 'untitled.tsx';
        const idMatch = code.match(/id:\s*['"]([^'"]+)['"]/);
        if (idMatch && idMatch[1]) {
            defaultFilename = `${idMatch[1]}.tsx`;
        }

        setSaveStatus('导出中...');
        try {
            // 创建文件内容
            const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);

            // 创建临时下载链接
            const a = document.createElement('a');
            a.href = url;
            a.download = defaultFilename;
            a.click();

            // 清理
            URL.revokeObjectURL(url);

            setSaveStatus('导出成功: ' + defaultFilename);
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (e) {
            console.error('导出失败:', e);
            setSaveStatus('导出失败');
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    return (
        <div className="flex h-screen w-full bg-slate-900 text-slate-200 overflow-hidden font-sans">
            
            {/* 左侧主要区域 (预览 / 代码) */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                
                {/* 顶栏 */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0" style={{WebkitAppRegion:'drag'}}>
                    <div className="flex items-center space-x-3">
                        <i className="fas fa-wand-magic-sparkles text-amber-400 text-2xl"></i>
                        <h1 className="text-xl font-bold text-white tracking-wide">AI 课件编辑器</h1>
                    </div>
                    
                    <div className="flex items-center space-x-4" style={{WebkitAppRegion:'no-drag'}}>
                        {/* 视图切换 */}
                        <div className="bg-slate-900 rounded-lg p-1 flex shadow-inner border border-slate-700">
                            <button 
                                onClick={() => setViewMode('preview')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center ${viewMode === 'preview' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <i className="fas fa-eye mr-2"></i> 实时预览
                            </button>
                            <button 
                                onClick={() => setViewMode('code')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center ${viewMode === 'code' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <i className="fas fa-code mr-2"></i> 源码编辑
                            </button>
                        </div>

                        {/* 导出按钮 */}
                        <div className="flex items-center">
                            <span className="text-sm text-green-400 mr-4 font-bold">{saveStatus}</span>
                            <button onClick={handleExport} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-sm font-bold flex items-center shadow-md">
                                <i className="fas fa-download mr-2"></i>导出课件
                            </button>
                        </div>

                        {/* 窗口控制 */}
                        <WindowControls />
                    </div>
                </div>

                {/* 内容区域 */}
                <div className="flex-1 relative overflow-hidden bg-slate-950">
                    {/* 代码编辑器模式 */}
                    <div className={`absolute inset-0 transition-opacity duration-300 ${viewMode === 'code' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full bg-slate-900 text-slate-300 p-6 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50 show-scrollbar code-editor leading-relaxed"
                            spellCheck="false"
                        />
                    </div>

                    {/* 实时预览模式 */}
                    <div className={`absolute inset-0 transition-opacity duration-300 ${viewMode === 'preview' ? 'opacity-100 z-10 bg-slate-900' : 'opacity-0 z-0 pointer-events-none'}`}>
                        {isCompiling ? (
                            <SimpleLoading />
                        ) : compileError ? (
                            <ErrorBoundary error={compileError} />
                        ) : compiledCourseData ? (
                            // 使用简化的预览组件，避免 SyncClassroom 的复杂依赖
                            <SimplePreview 
                                title={compiledCourseData.title}
                                slides={compiledCourseData.slides}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">无课件数据</div>
                        )}
                    </div>
                </div>
            </div>

            {/* 右侧 AI 聊天面板 */}
            <div className="w-96 shrink-0 h-full flex flex-col border-l border-slate-700 bg-slate-800 shadow-xl relative z-20">
                <AIChat 
                    onCodeGenerated={handleAIGeneratedCode} 
                    currentCode={code}
                />
            </div>
            
        </div>
    );
}

// 启动渲染
const bootEditor = async () => {
    let rootElement = document.getElementById('root');
    let retries = 50;
    while (!rootElement && retries > 0) {
        await new Promise(r => setTimeout(r, 50));
        rootElement = document.getElementById('root');
        retries--;
    }
    if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(<EditorApp />);
    }
};

bootEditor();