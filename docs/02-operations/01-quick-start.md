# 01 快速开始

## 1. 克隆项目

```bash
git clone --recurse-submodules https://github.com/yc004/SyncClassroom.git
cd SyncClassroom
npm run repos:init
```

## 2. 根目录可用命令

```bash
npm run start:core
npm run start:teacher
npm run start:teacher-server
npm run start:student
```

## 3. 最常见的启动方式

### 正式课堂

1. 在教师机执行 `npm run start:teacher`
2. 在学生机执行 `npm run start:student`
3. 学生端连接教师机 IP 地址

### 接口联调

1. 执行 `npm run start:teacher-server`
2. 用浏览器、前端页面或脚本访问教师服务接口

### 内核调试

1. 执行 `npm run start:core`
2. 用于独立调试运行时服务和协议层

## 4. 推荐排错顺序

- 先确认教师端服务是否已启动
- 再确认学生端连接的是教师机正确 IP
- 再检查局域网和端口
- 最后检查子模块是否正确初始化

继续阅读：

- [启动模式](./02-run-modes.md)
- [教师端使用说明](../03-teacher-guide/01-teacher-desktop.md)
