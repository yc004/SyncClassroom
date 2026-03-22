/**
 * AI 连接测试脚本
 * 
 * 用法: node test-ai.js <API_KEY> [BASE_URL] [MODEL]
 * 示例: node test-ai.js sk-xxx https://api.siliconflow.cn/v1 deepseek-ai/DeepSeek-V3
 */

const apiKey = process.argv[2];
const baseURL = process.argv[3] || 'https://api.openai.com/v1';
const model = process.argv[4] || 'gpt-4o';

if (!apiKey) {
    console.error('错误: 请提供 API Key');
    console.log('用法: node test-ai.js <API_KEY> [BASE_URL] [MODEL]');
    process.exit(1);
}

const endpoint = `${baseURL.replace(/\/+$/, '')}/chat/completions`;

async function testAI() {
    console.log(`\n正在测试连接...`);
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Model:    ${model}\n`);
    console.log('-'.repeat(40));
    console.log('AI 回答:\n');

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'text/event-stream'
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: '你好，请写一句简短的问候语。' }],
                temperature: 0.7,
                stream: true
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed === ': keep-alive') continue;

                if (trimmed.startsWith('data:')) {
                    const payload = trimmed.slice(5).trim();
                    if (payload === '[DONE]') continue;

                    try {
                        const json = JSON.parse(payload);
                        const delta = json.choices?.[0]?.delta?.content || json.choices?.[0]?.delta?.reasoning_content || '';
                        if (delta) {
                            process.stdout.write(delta); // 实时打印
                            fullText += delta;
                        }
                    } catch (e) {
                        // 忽略解析失败
                    }
                }
            }
        }

        console.log('\n\n' + '-'.repeat(40));
        console.log('\n测试完成！流式解析正常。');

    } catch (error) {
        console.error('\n\n测试失败!');
        console.error('原因:', error.message);
    }
}

testAI();
