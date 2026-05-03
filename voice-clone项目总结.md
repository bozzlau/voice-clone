# Voice Clone 项目总结

## 前言

最近用 Next.js 搭了一个声音克隆网站，调用 Fish Audio 的 API 实现声音克隆和语音合成。整个过程从零开始，边学边做，折腾了好几天。这篇文章记录一下技术选型、开发流程和一些踩坑经验。

## 技术选型

### 为什么选 Next.js

选 Next.js 主要看中几点：

- **App Router** 是现在的主流方向，路由设计清晰，特别是 API 路由和页面路由放在一起，一个功能模块的代码都在一个目录里，维护起来很舒服
- **React Server Components** 虽然我这项目基本全是客户端组件，但 Next.js 的生态成熟，遇到问题好搜
- **Turbopack** 确实快，开发模式下热更新基本秒级

### Tailwind CSS v4 + shadcn/ui v4

Tailwind CSS v4 变化挺大，用了 CSS 原生的 `@import` 和 `@theme` 语法，不再是传统的配置文件方式了。shadcn/ui 也同步升到了 v4，底层从 Radix UI 换成了 `@base-ui/react`。

这个切换坑了我一把：`@base-ui` 的 `DialogTrigger` 没有 `asChild` 属性，`Select` 的 `onValueChange` 回调签名也从 `(value: string)` 变成了 `(value: string | null)`。如果是第一次接触 shadcn/ui v4，很容易在这些地方卡住。

### 数据库：Drizzle + better-sqlite3

单用户场景，没必要上 PostgreSQL，SQLite 足够了。

- **better-sqlite3** 是同步 API，写起来简单直接，不用 async/await 绕来绕去
- **Drizzle ORM** 的 schema 定义很直观，对 SQLite 支持也好
- 开启了 WAL 模式，并发读取性能还行

不过 SQLite 有个问题：JSON 列的支持比较原始。Drizzle 里要用 `{ mode: "json" }` 来标记，默认值得传 `[]` 而不是 `"[]"`（字符串），这个一开始写错了。

### API 数据流

Fish Audio 的 API key 存在 SQLite 里，前端永远拿不到完整 key。所有请求都通过 Next.js API 路由代理：

```
前端 → Next.js API 路由 → Fish Audio API
```

这样 key 只存在于服务端，安全上有保障。前端只知道自己有没有 key 和 key 的前 4 位。

## 开发流程

### 阶段一：规划和设计

一开始先用 context7 查了 Fish Audio 的 API 文档，整理了一份本地文档。然后跟用户一起梳理功能需求，确定了四个主要模块：

1. **TTS 生成** — 选声音模型 → 输文字 → 调参数 → 生成 → 播放/下载
2. **声音管理** — 上传音频训练声音模型、查看状态、删除
3. **历史记录** — 查看、回放、删除之前的生成
4. **设置** — API Key 输入和验证

功能确定后写了一份详细的 todo.md，把任务分成三组：安装依赖、后端开发、前端页面。

### 阶段二：后端先行

优先开发后端 API，前端只保证基本可用。13 个 API 路由涵盖了：

- settings 的增删改查和验证
- voices 的完整 CRUD + 状态刷新 + 预览 TTS
- TTS 生成 + 音频文件管理
- 历史记录的分页查询和删除

开发过程中碰到不少 Drizzle 的类型问题。最典型的是 Drizzle 的 schema 枚举类型和 API 返回的字符串类型对不上，得加运行时校验和类型断言。

### 阶段三：前后端联调

后端开发完后再写前端页面。用的都是 shadcn/ui 的基础组件：Card、Select、Dialog、Button 这些。页面没有做复杂设计，用户说后续会自己优化 UI，所以先保证功能完整。

联调阶段暴露了不少问题：

- **`@base-ui/react` 的 Select 显示 value 而不是 label** — 选中一个声音模型，下拉框显示的是数字 ID 而不是模型名称。因为 `@base-ui` 的 `SelectValue` 渲染的是 `value` 属性，要手动查表显示名称。
- **页面切换后状态丢失** — TTS 生成的音频 URL 存在 React 的 `useState` 里，切页面回来就没了。后面加了个自动加载最近历史记录的功能。
- **shadcn/ui v4 的 DialogTrigger 没有 `asChild`** — 原有的 Button 包裹写法报错，去掉就好了。

### 阶段四：代码审查和修复

build 通过后做了一次全面的 code review，发现了一些问题：

- `data/` 目录没加到 `.gitignore`，SQLite 数据库文件被提交到了 git
- 缺少 body size limit 配置，上传大音频会 413
- TTS 路由的 `historyId` 始终返回 null
- 多个内存泄漏和死代码

逐一修复后 rerun build，全部通过。

### 阶段五：测试和迭代

启动 dev server 做了端到端测试：

- 所有页面返回 200，无明显错误
- API 错误边界正常（404、400、502）
- 空状态显示正确

用户反馈了一些问题：

1. **Settings 页面看不到已保存的 key** — 加了加密显示和添加时间
2. **TTS 下拉框显示数字** — 修复了 SelectValue 渲染逻辑
3. **生成的音频切换页面就没了** — 加了历史记录列表
4. **历史记录播放没反应** — 改成内联 audio，点击直接播放
5. **iPhone 的 m4a 文件上传不了** — 装了 ffmpeg，服务端自动转 wav
6. **历史记录需要分页** — 每页 10 条，加了翻页
7. **播放按钮要能暂停** — 改成 toggle 模式

每次修复后立刻 build 验证，确保不出新问题。

## 一些经验教训

### 关于 shadcn/ui v4

如果现在新建项目，shadcn/ui 默认安装的就是 v4 版本，底层是 `@base-ui/react`。和 v3（Radix UI）有几个关键区别：

- 没有 `asChild` 属性
- `Select` 的 `onValueChange` 回调带 `null`
- `SelectValue` 显示的是 item 的 `value`，不是 children

### 关于 Drizzle + SQLite

- JSON 列记得加 `{ mode: "json" }`
- 默认值传实际的 JS 值，不要传字符串
- `$type<T>()` 可以解决类型推断问题

### 关于 Fish Audio API

- 训练模型的音频文件通过 multipart/form-data 上传
- TTS 接口的 `model: s2-pro` 要放 header
- 参数名是 snake_case，在客户端做了自动转换
- 免费用户有额度限制，用完了可以切 Edge-TTS

### 关于 Next.js 16

- `better-sqlite3` 是原生模块，需要配置 `serverExternalPackages`
- `params` 在路由处理函数里变成了 Promise，要 `await`
- Turbopack 编译确实快，但偶发一些奇怪的 edge case

## 项目现状

目前项目功能完整，可以正常使用：

- 上传音频训练声音模型（支持 mp3/wav/m4a）
- 训练状态追踪（created → training → trained/failed）
- 文本转语音生成 + 参数调节
- TTS 历史记录管理（回放/下载/删除/分页）
- API Key 加密存储和验证

源代码在 GitHub，用的是 `git init` 初始化的本地仓库。后续计划包括 UI 重新设计和可能的 Edge-TTS 支持。

## 最后

这项目最大的收获是完整走了一遍 "需求分析 → 技术选型 → 后端开发 → 前端联调 → 测试迭代" 的全流程。用 AI 写代码确实快，但该踩的坑一个都不会少，特别是版本兼容性问题（shadcn/ui v4、Next.js 16、React 19），这些靠 AI 的知识库也覆盖不全，还是得实际跑起来才知道。
