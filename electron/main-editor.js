// ========================================================
// 萤火课件编辑器 - 独立的 AI 课件创建平台
// ========================================================
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// 切换 Windows 控制台代码页为 UTF-8
if (process.platform === 'win32') {
    require('child_process').spawnSync('chcp', ['65001'], { shell: true, stdio: 'ignore' });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        title: '萤火课件编辑器',
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.setMenu(null);
    mainWindow.loadFile(path.join(__dirname, '..', 'public', 'editor.html'));

    mainWindow.on('maximize', () => mainWindow.webContents.send('window-maximized'));
    mainWindow.on('unmaximize', () => mainWindow.webContents.send('window-unmaximized'));

    // 打开开发者工具 (如果需要调试)
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// IPC: 窗口控制
ipcMain.on('minimize-window', () => mainWindow?.minimize());
ipcMain.on('maximize-window', () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize());
ipcMain.on('close-window', () => mainWindow?.close());
ipcMain.on('toggle-fullscreen', () => {
    if (!mainWindow) return;
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
});

// IPC: 文件读写 (已弃用 - 现在使用浏览器原生的 Blob API 导出文件)
// 保留此接口以保持向后兼容性
ipcMain.handle('save-course', async (event, { filename, content }) => {
    try {
        const coursesDir = path.join(__dirname, '..', 'public', 'courses');
        if (!fs.existsSync(coursesDir)) {
            fs.mkdirSync(coursesDir, { recursive: true });
        }
        const filepath = path.join(coursesDir, filename);
        fs.writeFileSync(filepath, content, 'utf-8');
        return { success: true, filepath };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// 读取 AI 配置
ipcMain.handle('get-ai-config', () => {
    const configPath = path.join(app.getPath('userData'), 'ai-config.json');
    try {
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        }
    } catch (e) { console.error(e); }
    return { apiKey: '', baseURL: 'https://api.openai.com/v1', model: 'gpt-4o' };
});

// 保存 AI 配置
ipcMain.handle('save-ai-config', (event, config) => {
    const configPath = path.join(app.getPath('userData'), 'ai-config.json');
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
});