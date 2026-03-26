// ========================================================
// Category: 多媒体
// ========================================================

const multimediaKnowledge = [
    {
        id: 'media-images',
        title: '图片和视频媒体',
        category: '多媒体',
        tags: ['图片', '视频', 'img', 'video', '媒体'],
        content: '在课件中添加图片和视频内容。\n\n图片使用示例：\n```tsx\n<div className="flex flex-col items-center justify-center h-full bg-white p-8">\n    <img\n        src="https://example.com/image.jpg"\n        alt="示例图片"\n        className="max-w-full max-h-96 object-contain rounded-xl shadow-xl"\n    />\n</div>\n```\n\n视频使用示例：\n```tsx\n<div className="flex flex-col items-center justify-center h-full bg-slate-900 p-8">\n    <video\n        src="https://example.com/video.mp4"\n        controls\n        className="max-w-full max-h-96 rounded-xl shadow-2xl"\n    >\n        您的浏览器不支持视频播放\n    </video>\n</div>\n```\n\n提示：\n- max-w-full 和 max-h-96 限制最大尺寸\n- object-contain 保持图片比例\n- controls 属性启用视频控制条',
        isBuiltin: true
    }
];

if (typeof window !== 'undefined') {
    window.multimediaKnowledge = multimediaKnowledge;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = multimediaKnowledge;
}
