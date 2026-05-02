# Voice Clone - 开发任务清单

> ✅ 已完成 | ⬜ 待开发 | 🔄 进行中

---

## 第一组：安装依赖

- [x] ✅ 1.1 使用 create-next-app 创建项目（TypeScript + Tailwind CSS v4 + App Router）
- [x] ✅ 1.2 初始化 shadcn/ui 配置
- [x] ✅ 1.3 安装 shadcn/ui 基础组件（button, input, card, select, slider, dialog, badge, progress, label, textarea, separator）
- [x] ✅ 1.4 安装 shadcn/ui 反馈组件（sonner, skeleton）
- [x] ✅ 1.5 安装 Drizzle ORM + better-sqlite3 + drizzle-kit + uuid
- [x] ✅ 1.6 创建 drizzle.config.ts + tsconfig.json 路径别名配置

---

## 第二组：后端功能开发 ✅

### 2.1 数据层
- [x] ✅ 2.1.1 创建 Drizzle schema 文件（voice_models 表）
- [x] ✅ 2.1.2 创建 Drizzle schema 文件（tts_history + settings 表）
- [x] ✅ 2.1.3 创建 Drizzle client 初始化 + data/ 目录自动创建
- [x] ✅ 2.1.4 创建 shared TypeScript 类型定义文件

### 2.2 Fish Audio Client
- [x] ✅ 2.2.1 创建 Fish Audio API client - 初始化 + createModel 方法
- [x] ✅ 2.2.2 创建 Fish Audio API client - getModel / listModels 方法
- [x] ✅ 2.2.3 创建 Fish Audio API client - deleteModel / generateTTS 方法

### 2.3 工具模块
- [x] ✅ 2.3.1 创建 audio-storage 工具（保存/读取/删除音频文件 + Content-Type 映射）

### 2.4 API 路由 - Settings
- [x] ✅ 2.4.1 实现 GET /api/settings（返回 API Key 是否存在和前缀）
- [x] ✅ 2.4.2 实现 PUT /api/settings（保存 API Key）
- [x] ✅ 2.4.3 实现 POST /api/settings/validate（验证 API Key 有效性）

### 2.5 API 路由 - Voice Management
- [x] ✅ 2.5.1 实现 GET /api/voices（从 DB 返回所有声音模型列表）
- [x] ✅ 2.5.2 实现 POST /api/voices（创建声音模型，代理 Fish Audio + 存入 DB）
- [x] ✅ 2.5.3 实现 GET /api/voices/[id]（单模型详情，支持 refresh 参数）
- [x] ✅ 2.5.4 实现 PATCH /api/voices/[id]（刷新训练状态）
- [x] ✅ 2.5.5 实现 DELETE /api/voices/[id]（删除模型，调用 Fish Audio + 删除 DB 记录）

### 2.6 API 路由 - TTS
- [x] ✅ 2.6.1 实现 POST /api/tts（生成 TTS + 保存音频文件 + 记录历史）
- [x] ✅ 2.6.2 实现 GET /api/audio/[filename]（提供音频文件访问）
- [x] ✅ 2.6.3 实现 POST /api/voices/[id]/tts（快速预览 TTS，返回音频流）

### 2.7 API 路由 - History
- [x] ✅ 2.7.1 实现 GET /api/tts-history（分页查询历史记录）
- [x] ✅ 2.7.2 实现 DELETE /api/tts-history/[id]（删除历史记录和音频文件）

---

## 第三组：网站页面开发 ✅

### 3.1 布局与导航
- [x] ✅ 3.1.1 创建根布局 layout.tsx（Sidebar + main 区域结构）
- [x] ✅ 3.1.2 创建 Sidebar 导航组件（导航链接 + API Key 状态指示）

### 3.2 Settings 页面
- [x] ✅ 3.2.1 创建 ApiKeyForm 组件（输入框 + 验证按钮 + 保存按钮）
- [x] ✅ 3.2.2 创建 /settings 页面

### 3.3 Voice 页面
- [x] ✅ 3.3.1 创建 VoiceCard 组件（模型名称、状态徽标、操作按钮）
- [x] ✅ 3.3.2 创建 VoiceList 组件（VoiceCard 网格布局）
- [x] ✅ 3.3.3 创建 /voices 列表页面
- [x] ✅ 3.3.4 创建 VoiceUploadForm 组件（文件上传 + 名称/描述输入）
- [x] ✅ 3.3.5 创建 /voices/new 创建页面

### 3.4 TTS 首页
- [x] ✅ 3.4.1 创建 VoiceSelector 组件（下拉选择声音模型）
- [x] ✅ 3.4.2 创建 ParameterControls 组件（语速/格式/温度调节）
- [x] ✅ 3.4.3 创建 AudioPlayer 组件（播放 + 下载）
- [x] ✅ 3.4.4 创建 TTSForm 组件（集成选择器 + 文本输入 + 参数 + 生成按钮）
- [x] ✅ 3.4.5 创建 / 首页

### 3.5 History 页面
- [x] ✅ 3.5.1 创建 HistoryItem 组件（单条历史记录展示）
- [x] ✅ 3.5.2 创建 HistoryList 组件（分页列表）
- [x] ✅ 3.5.3 创建 /history 页面
