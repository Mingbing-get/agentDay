# Agent Daily

一个公开展示“AI 每天生成一个项目”的站点。

它做两件核心事情：

1. 把当天生成的项目挂到首页，作为今日主推项目展示。
2. 为每个项目保存完整的 AI 产物档案，包括架构图、设计文档、任务计划、代码摘要和测试报告。

当前项目基于 `Next.js + Prisma + SQLite`，采用“文件产物仓库 + 轻数据库索引”的结构：

- 重内容和 AI 产物保存在 `generated/projects/<date>-<slug>/`
- 首页列表、发布状态、项目索引保存在 `prisma/dev.db`

## 当前项目作用

这个仓库不是单纯的作品集页面，而是一个“每日 AI 项目发布系统”。

系统职责：

- 提供首页 `/`，展示今日项目和历史归档
- 提供项目档案页 `/projects/[slug]`
- 提供项目 demo 页 `/projects/[slug]/demo`
- 提供本地生成命令 `pnpm generate:daily`
- 把生成出的项目自动写入数据库索引并发布

## 当前目录结构

```text
src/
  app/
    page.tsx                      # 首页
    projects/[slug]/page.tsx      # 项目档案页
    projects/[slug]/demo/page.tsx # 项目 demo 页
  lib/
    generation/                   # 每日项目生成逻辑
    projects/                     # 项目读取与仓库逻辑
    db.ts                         # Prisma + SQLite 初始化

scripts/
  generate-daily.ts               # 每日生成命令

generated/
  projects/<date>-<slug>/         # 每日项目产物目录

prisma/
  schema.prisma                   # Prisma schema
  dev.db                          # SQLite 数据库
```

## 本地开发

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发环境

```bash
pnpm dev
```

默认访问：

- 首页: `http://localhost:3000`
- 项目档案: `http://localhost:3000/projects/<slug>`
- 项目 demo: `http://localhost:3000/projects/<slug>/demo`

## 生成新项目

基础命令：

```bash
pnpm generate:daily --date 2026-03-26 --topic "AI meeting copilot"
```

可选参数：

- `--date YYYY-MM-DD`
- `--topic "你的项目主题"`
- `--force`

示例：

```bash
pnpm generate:daily --date 2026-03-26 --topic "AI meeting copilot"
pnpm generate:daily --date 2026-03-26 --topic "AI meeting copilot" --force
```

生成成功后会返回：

- `slug`
- `route`
- `demoRoute`
- `projectDir`

## 后续生成新项目的规则

后续每天生成项目时，必须遵守下面这些规则。

### 1. 一天只允许一个项目

- 每个日期只允许一个项目
- 同一天重复生成默认拒绝
- 只有旧项目状态为 `draft` 或 `failed` 时，才允许使用 `--force` 覆盖
- 已经 `published` 的项目不能直接强制覆盖

### 2. 项目必须使用统一模板

v1 不允许自由技术栈生成，必须限制在以下三类 archetype：

- `landing`
- `tool`
- `dashboard`

目的：

- 保证 demo 页稳定可渲染
- 保证首页和 dossier 结构统一
- 降低生成失败率

### 3. 必须生成完整产物

每个项目目录必须包含以下文件，否则项目不得发布：

- `metadata.json`
- `brief.md`
- `design.md`
- `architecture.mmd`
- `architecture.svg`
- `plan.md`
- `code-summary.md`
- `test-report.json`
- `demo/config.json`

目录规范：

```text
generated/projects/<date>-<slug>/
```

### 4. 首页只展示已发布项目

- 首页今日项目永远取最新的 `published` 项目
- 历史列表按日期倒序排列
- 生成失败不会替换当前首页项目

### 5. 项目是“每日快照”，不是在线编辑 CMS

- 生成结果默认视为当天快照
- 不做站内人工编辑
- 若内容需要修正，优先重新生成，而不是手改线上内容

### 6. 新项目必须保持统一信息结构

每个项目至少要具备：

- 标题
- 一句话摘要
- 主题风格
- archetype
- demo 配置
- dossier 六个固定板块

固定 dossier 板块：

- `Overview`
- `Architecture`
- `Design Doc`
- `Task Plan`
- `Code Summary`
- `Test Report`

### 7. 推荐的生成主题写法

后续给 `--topic` 时，尽量用明确的产品方向，而不是模糊形容词。

推荐：

- `AI meeting copilot`
- `SaaS pricing experiment dashboard`
- `Personal finance planning tool`
- `Recruiting pipeline tracker`

不推荐：

- `cool AI thing`
- `some startup`
- `good tool`

## 数据与持久化

本项目有两个必须持久化的目录：

- `generated/`
- `prisma/`

原因：

- `generated/` 保存所有每日项目的文档和 demo 配置
- `prisma/` 保存 SQLite 数据库索引

如果这两个目录丢失，项目档案和发布记录就会丢失。

## Docker 一键部署

仓库已经提供：

- `Dockerfile`
- `docker-compose.yml`
- `scripts/docker-deploy.sh`

### 启动

```bash
./scripts/docker-deploy.sh
```

脚本会执行：

```bash
docker compose up -d --build
```

启动后访问：

- `http://localhost:3000`

### 停止

```bash
docker compose down
```

### 查看日志

```bash
docker compose logs -f app
```

### 在容器里生成当天项目

```bash
docker compose exec app pnpm generate:daily --date 2026-03-26 --topic "AI meeting copilot"
```

生成成功后刷新首页即可看到新项目。

## 生产部署建议

如果你要长期部署，建议遵守以下规则：

- 把 `generated/` 和 `prisma/` 挂载到宿主机目录
- 通过反向代理把 3000 端口暴露出去
- 不要把 SQLite 文件放临时目录
- 保留 `README` 里的生成规则，避免后续项目结构漂移

## 常用命令

```bash
pnpm dev
pnpm test
pnpm build
pnpm generate:daily --date 2026-03-26 --topic "AI meeting copilot"
docker compose up -d --build
docker compose exec app pnpm generate:daily --date 2026-03-26 --topic "AI meeting copilot"
```
