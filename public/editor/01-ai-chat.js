// ========================================================
// 萤火课件编辑器 - AI 聊天与生成核心
// ========================================================

const AI_PROMPT = `
你是一个专业的互动课件开发专家，负责为"萤火课堂"平台编写互动课件。该平台使用基于 React 18、TypeScript 和 TailwindCSS 的自定义引擎。

你的任务是：
1. 根据用户的要求，编写**完整、可运行、无错误**的 TypeScript (包含 TSX) 代码。
2. 你输出的整个回复必须只有一段 markdown \`\`\`typescript ... \`\`\` 格式的代码块。**不要包含任何其他解释性文字**。
3. 请参考以下全局对象，确保使用正确的 API 绑定。

**引擎核心架构和规则：**
- \`window.CourseData\` : 用于注册课程的全局变量，必须暴露此对象以提供课程信息。
- 使用 Tailwind CSS 控制所有样式，绝对禁止自定义内联样式。
- 所有的 React Hook 均需通过 \`React.useState\`、\`React.useEffect\` 获取。
- 组件不要做 \`export\` 或 \`import\`，这些是纯客户端运行脚本，Babel直接编译运行。
- 使用 TypeScript 类型注解，为组件 props、函数参数和变量添加类型。
- 为事件处理函数添加正确的类型注解（如：React.MouseEvent<HTMLButtonElement>）。

**标准模板：**
\`\`\`typescript
// 课程定义必须赋值给 window.CourseData
window.CourseData = {
    id: 'ai-generated-course', // 唯一的课程 ID
    title: '课程标题',
    icon: '📝', // Emoji 图标
    desc: '课程的一句话简介',
    color: 'from-blue-500 to-indigo-600', // 卡片渐变色背景

    // 幻灯片数组，每页由组件渲染
    slides: [
        {
            title: '第一页',
            component: <SlideOne />
        }
    ],

    // 可选依赖，引擎会自动通过 CDN 加载，如果为空可省略
    dependencies: []
};

// 定义页面组件
function SlideOne(): JSX.Element {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50">
            <h1 className="text-4xl font-bold text-blue-600 mb-6">Hello World</h1>
            <p className="text-xl text-slate-700">这是 AI 生成的互动课件</p>
        </div>
    );
}
\`\`\`

现在，请根据用户的需求，生成仅包含 TypeScript 代码块的回复，确保能被 Babel 成功转译运行。
`;

function AIChat({ onCodeGenerated, currentCode }) {
    const [messages, setMessages] = useState([{ role: 'assistant', content: '你好！我是萤火课件 AI 助手。请告诉我你想制作什么样的课件，或者提供你想要修改的代码要求。' }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({ apiKey: '', baseURL: 'https://api.openai.com/v1', model: 'gpt-4o' });
    const [showConfig, setShowConfig] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (window.electronAPI?.getAIConfig) {
            window.electronAPI.getAIConfig().then(c => {
                if (c && c.apiKey) setConfig(c);
                else setShowConfig(true); // 如果没有 key，则主动弹出设置
            });
        }
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSaveConfig = () => {
        if (window.electronAPI?.saveAIConfig) {
            window.electronAPI.saveAIConfig(config);
        }
        setShowConfig(false);
    };

    const handleSend = async () => {
        if (!input.trim() || loading || !config.apiKey) {
            if (!config.apiKey) setShowConfig(true);
            return;
        }

        const userMsg = { role: 'user', content: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            // 构建请求上下文
            let promptContent = input;
            if (currentCode) {
                promptContent = `当前课件代码如下：\n\`\`\`javascript\n${currentCode}\n\`\`\`\n\n用户的新请求：${input}`;
            }

            const apiMessages = [
                { role: 'system', content: AI_PROMPT },
                ...newMessages.filter(m => m.role !== 'system').map(m => ({
                    role: m.role,
                    content: m.role === 'user' && m === userMsg ? promptContent : m.content
                }))
            ];

            const response = await fetch(`${config.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: apiMessages,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || 'API 请求失败');
            }

            const data = await response.json();
            const replyText = data.choices[0].message.content;
            
            // 提取代码块
            let codeToApply = '';
            const codeMatch = replyText.match(/```(?:typescript|ts|tsx|javascript|js|jsx)?\n([\s\S]*?)\n```/);
            if (codeMatch && codeMatch[1]) {
                codeToApply = codeMatch[1];
            } else if (!replyText.includes('```')) {
                 // 如果没有 markdown 包裹，但本身就是代码
                 codeToApply = replyText;
            }

            setMessages([...newMessages, { role: 'assistant', content: replyText }]);

            if (codeToApply && codeToApply.includes('window.CourseData')) {
                onCodeGenerated(codeToApply);
            }

        } catch (error) {
            console.error('AI 请求错误:', error);
            setMessages([...newMessages, { role: 'assistant', content: `生成失败：${error.message}` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-800 border-l border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
                <div className="flex items-center space-x-2">
                    <i className="fas fa-robot text-blue-400"></i>
                    <h2 className="font-bold text-white">AI 课件助手</h2>
                </div>
                <button onClick={() => setShowConfig(true)} className="text-slate-400 hover:text-white transition-colors" title="AI 设置">
                    <i className="fas fa-cog"></i>
                </button>
            </div>

            {/* Config Modal */}
            {showConfig && (
                <div className="absolute inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-xl p-6 w-full max-w-sm border border-slate-600 shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 text-white">AI API 设置</h3>
                        
                        <label className="block text-xs font-bold text-slate-400 mb-1">Base URL</label>
                        <input type="text" value={config.baseURL} onChange={e => setConfig({...config, baseURL: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 mb-4" />
                        
                        <label className="block text-xs font-bold text-slate-400 mb-1">API Key</label>
                        <input type="password" value={config.apiKey} onChange={e => setConfig({...config, apiKey: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 mb-4" placeholder="sk-..." />
                        
                        <label className="block text-xs font-bold text-slate-400 mb-1">Model</label>
                        <input type="text" value={config.model} onChange={e => setConfig({...config, model: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 mb-6" />
                        
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setShowConfig(false)} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm">取消</button>
                            <button onClick={handleSaveConfig} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm">保存</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 show-scrollbar">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'} chat-selectable`}>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.role === 'assistant' && msg.content.includes('```') ? '我已根据您的要求生成/更新了代码。请查看左侧预览和源码区域。' : msg.content}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-start">
                        <div className="bg-slate-700 rounded-2xl rounded-bl-none px-4 py-3">
                            <i className="fas fa-circle-notch fa-spin text-blue-400"></i>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-800 border-t border-slate-700">
                <div className="relative">
                    <textarea 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="描述你想要的课件内容或修改要求 (Shift+Enter 换行)..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-blue-500 resize-none h-24 show-scrollbar"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className={`absolute bottom-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${loading || !input.trim() ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                    >
                        <i className="fas fa-paper-plane text-xs"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
