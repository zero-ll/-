# 更新日志 (Changelog)

记录项目的所有优化和改动内容。

---

## [v0.5.0] - 2025-12-26

### 📊 评估结果页面全面重构

#### 评估报告页面功能升级
**位置**：`pages/Evaluate/EvaluateDetail.tsx`

##### 1. 高级筛选系统重构

**数值筛选组件（5个）**：
- ✅ **质量评估**：支持大于/小于/介于三种条件
- ✅ **业务匹配度**：支持大于/小于/介于三种条件
- ✅ **均播**：支持大于/小于/介于三种条件
- ✅ **预估CPM**：支持大于/小于/介于三种条件
- ✅ **商单数量**：支持大于/小于/介于三种条件（提示：基于搜索任务输入的本品竞品搜索词匹配）

**多选下拉筛选（3个）**：
- 🏷️ **粉丝量级**：Mega / Top / Macro / Mid+ / Mid / Micro+ / Micro / Nano
- 🌍 **国家**：动态从数据中提取所有国家选项
- 📺 **红人类型**：动态从数据中提取所有频道类型

**筛选特性**：
- 默认无筛选条件
- 支持多条件组合筛选
- 响应式标签显示（maxTagCount="responsive"）
- 实时过滤数据，即时反馈结果

##### 2. 动态列配置功能

**列配置组件**：
- 📂 **新建文件**：`components/ColumnConfigDropdown.tsx`
- 🎯 **功能**：自定义表格显示字段

**全部字段（22个）**：
1. 红人头像（必选）
2. 名称（必选）
3. 粉丝量级（必选）
4. 国家（必选）
5. 红人类型
6. 红人质量评估（必选）
7. 红人业务匹配度（必选）
8. 近10条均播（必选）
9. 互动率（必选）
10. 商单数量
11. 预估CPM
12. 建议报价
13. 近3个月发布视频数
14. 近10条播放中位数
15. 近10条短视频数量
16. 近10条长视频数量
17. 商单均播
18. 商单中位数
19. 商单最高观看量
20. 商单最高互动率
21. 商单均播占比
22. 商单视频链接

**默认展示字段（11个）**：
- 红人头像、名称、粉丝量级、国家、红人类型
- 红人质量评估、红人业务匹配度
- 近10条均播、互动率
- 商单数量、预估CPM、建议报价

**配置特性**：
- ✅ 8个必选字段（灰色背景，禁止取消勾选）
- ✅ 14个可选字段（可自由添加/移除）
- ✅ 重置按钮：一键恢复默认11个字段
- ✅ localStorage持久化：记住用户配置
- ✅ 下拉菜单：SettingOutlined图标按钮
- ✅ 位于表格右上角

##### 3. 通用组件开发

**数值筛选组件**：
- 📂 **新建文件**：`components/NumberFilter.tsx`
- 🎯 **功能**：可复用的数值筛选组件

**组件特性**：
- ✅ 三种筛选条件：不筛选（none）/ 大于（gt）/ 小于（lt）/ 介于（between）
- ✅ 动态输入框：根据条件显示1个或2个InputNumber
- ✅ 可配置参数：min / max / step / precision / placeholder
- ✅ Space.Compact布局：Select + InputNumber紧凑排列
- ✅ TypeScript类型支持：NumberFilterValue接口

##### 4. 表格列定义升级

**动态列渲染**：
- ✅ allColumnsConfig对象：定义全部22个列的配置
- ✅ 根据visibleColumns动态生成Table columns
- ✅ 每列包含：title / dataIndex / key / width / sorter / render

**新增列渲染逻辑**：
- 📊 **粉丝量级**：Tag标签，8种颜色区分
- 🎯 **质量评估/业务匹配度**：ScoreTag组件（分数圆形徽章，颜色分级）
- 💰 **建议报价**：DollarOutlined图标 + 千分位格式化
- 📈 **互动率**：LineChartOutlined图标 + 百分比显示（保留2位小数）
- 🎥 **商单视频链接**：最多显示2个链接，超出显示"+N 更多"

**表格特性**：
- ✅ 固定左列（红人头像）：fixed: 'left'
- ✅ 横向滚动：scroll={{ x: 1600 }}
- ✅ 支持排序：所有数值列可点击排序
- ✅ 头像处理：placeholder图片显示彩色默认头像
- ✅ 可点击跳转：头像和名称点击打开YouTube频道

### 📦 Mock数据扩展

**评估结果数据**：`mock/evaluationResults.ts`

**新增字段（10个）**：
- 📊 median_views_last_10（近10条播放中位数）
- 🎬 short_videos_last_10（近10条短视频数量）
- 📹 long_videos_last_10（近10条长视频数量）
- 💼 sponsored_count（商单数量）
- 📈 sponsored_avg_views（商单均播）
- 📊 sponsored_median_views（商单中位数）
- 🚀 sponsored_max_views（商单最高观看量）
- ⭐ sponsored_max_engagement（商单最高互动率）
- 📊 sponsored_avg_views_ratio（商单均播占比）
- 🔗 sponsored_video_links（商单视频链接数组）

**数据特点**：
- ✅ 12条记录全部更新
- ✅ 商单数据范围合理（0-15个商单）
- ✅ 比例数据真实（商单均播占比1.06-1.20倍）
- ✅ 支持0商单情况（sponsored_count=0时所有商单字段为0）

### 🎨 用户体验优化

**筛选交互改进**：
- 🎯 清晰的筛选区域分隔（2行数值筛选 + 1行多选筛选）
- 📏 响应式布局：xs/sm/lg三档断点适配
- 🏷️ 统一的标签样式：text-xs + font-semibold + uppercase
- 📐 合理间距：Row gutter [16, 16] + mt-4

**列配置体验**：
- 🎨 灰色背景标识必选项
- 📝 "(必选)"文字标注
- 🔄 重置按钮位于右上角
- 📋 滚动列表：maxHeight 500px + overflowY auto
- ✅ Checkbox交互：hover背景变化

**表格展示优化**：
- 💡 Tooltip提示：商单数量带说明文案
- 🔗 链接样式：蓝色可点击，hover加深
- 🎨 Tag颜色系统：8级粉丝量级 + 国家标签
- 📱 响应式标签：自动折叠超出部分

### 📄 本次修改文件列表

**组件文件（2个）**：
- `components/NumberFilter.tsx` ✨ 新建
- `components/ColumnConfigDropdown.tsx` ✨ 新建

**页面文件（1个）**：
- `pages/Evaluate/EvaluateDetail.tsx` 🔧 重构

**Mock数据文件（1个）**：
- `mock/evaluationResults.ts` 🔧 扩展

### 🔧 技术亮点

**组件化设计**：
- NumberFilter：高度可复用的数值筛选组件
- ColumnConfigDropdown：独立的列配置管理组件
- 职责分离：过滤逻辑、列配置、表格渲染解耦

**性能优化**：
- useMemo缓存计算：countries / subscriberTiers / channelTypes / filteredData
- 动态列生成：避免重复定义静态列配置
- localStorage缓存：减少重复配置操作

**TypeScript增强**：
- NumberFilterValue接口：规范数值筛选值结构
- ColumnField接口：规范列字段定义
- Record<string, any>：allColumnsConfig类型约束

---

## [v0.4.0] - 2025-12-26

### 🔍 搜索结果页面优化

#### 搜索结果展示全面升级
**位置**：`pages/Search/TaskDetail.tsx`

##### 1. 头部筛选优化

**粉丝量级筛选改为下拉多选**：
- ✅ 将平铺的Checkbox改为Select下拉多选组件
- ✅ 量级从5个扩展到8个：
  - Mega (5000k-10000k)
  - Top (1000k-5000k)
  - Macro (500k-1000k)
  - Mid+ (200k-500k)
  - Mid (100k-200k)
  - Micro+ (50k-100k)
  - Micro (10K-50K)
  - Nano (0k-10k)
- ✅ 支持响应式标签显示 (maxTagCount="responsive")

##### 2. 红人头像优化

**默认头像与交互改进**：
- ✅ 无头像时显示彩色用户图标（主题色 #6C6C9C）
- ✅ 头像可点击跳转到频道主页
- ✅ 红人名称可点击跳转到频道主页
- ✅ 添加hover效果增强交互反馈

##### 3. 表头字段调整和新增

**字段改名**：
- "订阅数" → "粉丝数"
- "关键词" → "命中关键词"（带Tooltip说明）

**新增列**：
- 📊 **粉丝量级**：根据粉丝数自动计算，Tag标签展示（8种颜色区分）
- 🎥 **视频数**：红人频道视频总数
- 👁️ **总观看次数**：频道累计观看量
- 📝 **频道简介**：最多显示2行，超出显示省略号+Tooltip完整内容

**Tooltip提示**：
- 命中关键词列添加说明："通过行业/品牌/竞品关键词检索的红人才会呈现此结果"

##### 4. 移除默认文案

**优化显示逻辑**：
- ❌ 移除"内容创作者"默认文案
- ✅ `channel_type`为空时不显示任何内容

##### 5. 批量操作Bug修复

**问题**：选中一个红人，整个列表会变为全选

**根本原因**：Mock数据中所有记录的`uuid`字段值相同

**解决方案**：
- ✅ 为每条搜索结果分配唯一的UUID
- ✅ 确保Table的rowKey="uuid"能正确识别每一行

**修改文件**：`mock/searchResults.ts`

##### 6. 评估配置功能 - 新增

**新增评估配置弹窗组件**：
- 📂 **新建文件**：`components/EvaluateConfigModal.tsx`
- 🎯 **功能**：创建评估任务前配置红人画像需求

**弹窗特性**：
- ✅ 三个频道类型输入框（P0、P1、P2）
- ✅ 支持输入多个标签，回车生成
- ✅ P0必填，P1/P2选填
- ✅ 使用localStorage记住上次配置
- ✅ 自动回填上次输入结果

**集成到搜索结果页**：
- 点击"开始评估"按钮先弹出配置窗口
- 配置确认后再显示创建任务确认框
- 创建评估任务时传递`channelTypes`配置

### 📊 评估任务展示优化

#### 评估任务列表页面
**位置**：`pages/Evaluate/TaskList.tsx`

**新增"频道类型要求"列**：
- 🏷️ P0标签：红色
- 🏷️ P1标签：橙色
- 🏷️ P2标签：蓝色
- ✅ 支持多个标签横向排列
- ✅ 空值显示"-"

#### 评估报告页面
**位置**：`pages/Evaluate/EvaluateDetail.tsx`

**头部新增频道类型卡片**：
- 📌 在页面标题下方显示用户配置的频道类型要求
- 🎨 使用Card组件，带图标和分级标签
- ✅ 清晰展示P0/P1/P2三级要求
- ✅ 空配置时不显示卡片

### 📦 Mock数据更新

**搜索结果数据**：`mock/searchResults.ts`
- ✅ 为所有记录添加唯一UUID
- ✅ 新增`channel_description`字段（12条记录）
- ✅ 频道简介支持多语言（中文、英文、法语、西班牙语）

**评估任务数据**：`mock/evaluateTasks.ts`
- ✅ 新增`channelTypes`字段
- ✅ 包含p0、p1、p2三级配置
- ✅ 提供示例频道类型数据

### 📄 本次修改文件列表

**组件文件（1个）**：
- `components/EvaluateConfigModal.tsx` ✨ 新建

**页面文件（3个）**：
- `pages/Search/TaskDetail.tsx` 🔧 修改
- `pages/Evaluate/TaskList.tsx` 🔧 修改
- `pages/Evaluate/EvaluateDetail.tsx` 🔧 修改

**Mock数据文件（2个）**：
- `mock/searchResults.ts` 🔧 修改
- `mock/evaluateTasks.ts` 🔧 修改

---

## [v0.3.0] - 2025-12-26

### 📋 表单优化

#### 创建搜索任务表单重构
**位置**：`pages/Search/CreateTask.tsx`

##### 1. 关键词搜索表单优化

**必填项调整**：
- ✅ 行业关键词 - 必填
- ✅ 品牌关键词 - 必填（原来是可选）
- ✅ 竞品关键词 - 必填（原来是可选）
- ✅ 单个关键字搜索视频数 - 必填（原名"最大结果数"）

**新增非必填项**：
- 📊 **排序方式**：相关性、观看次数、发布时间（默认：相关性）
- 🌍 **国家偏好**：多选下拉框，新增加拿大、澳大利亚选项
- 🔍 **检索维度**：按视频 / 按网红（原名"搜索维度"）
- 👥 **最小粉丝数**：数字输入框，可选筛选条件

**布局改进**：
- 左列：行业关键词、品牌关键词、竞品关键词（三个必填项）
- 右列：单个关键字搜索视频数、排序方式、检索维度、国家偏好、最小粉丝数

##### 2. 按红人 ID 搜索表单（原"上传名单"）

**Tab 名称变更**：
- "上传名单" → "按红人 ID 搜索"
- 图标：FileExcelOutlined → IdcardOutlined

**关键词配置说明优化**：
- ❌ 移除醒目的 Alert 提示组件
- ✅ 改为小的灰色文字提示
- 📍 位置：紧贴在"行业关键词"输入框下方
- 🎨 样式：`text-xs text-gray-400`
- 💬 文案："以上关键词配置将用作红人评估时的'商单'识别依据"

**新增关键词配置区**：
- 三个必填字段横向排列：
  - 行业关键词（必填）
  - 品牌关键词（必填）
  - 竞品关键词（必填）

**Excel 模板下载功能**：
- ✅ 实现"下载模板"按钮功能
- 📥 点击后自动下载 Excel 文件
- 📊 模板包含表头：
  - 红人 id
  - 频道 id
- 📂 文件名：`红人名单导入模板.xlsx`
- 🔧 技术实现：使用 xlsx 库（第28行导入，第40-64行实现）

**批量添加方式优化**：
- 📁 **左侧**：上传红人名单（Excel 文件）
  - 缩小上传区域尺寸
  - 支持 .xlsx, .xls 格式
  - 提供可用的模板下载按钮

- ✍️ **右侧**：批量粘贴红人 ID（新增功能）
  - 8行高度的文本框
  - 等宽字体显示
  - 支持多种格式：
    - 每行一个 ID
    - 逗号分隔
    - 分号分隔
  - 示例占位符文本

**表单验证逻辑**（第60-73行）：
- ✅ 验证至少选择一种批量添加方式
- ❌ 禁止同时使用两种方式
- 错误提示：
  - "请上传文件或批量粘贴红人 ID"
  - "只能选择一种批量添加方式：上传文件或粘贴 ID"

**提交按钮文本**：
- "上传并搜索" → "创建任务"

### 🎨 用户体验改进
- 添加清晰的表单区域分隔提示
- 优化 tooltip 帮助文本
- 改进占位符文本的友好性
- 增强表单验证的即时反馈

---

## [v0.2.0] - 2025-12-26

### 🌐 国际化优化

#### 界面中文化
- **登录页面** (`pages/Login/index.tsx`)
  - 标题文本：Welcome Back → 欢迎回来
  - 表单字段：Username/Password → 用户名/密码
  - 按钮文本：Log in → 登录
  - 提示消息：登录成功/用户名或密码错误

- **项目选择页面** (`pages/Projects/index.tsx`)
  - 页面标题：Select Project → 选择项目
  - 描述文本：Choose a project to manage your campaigns → 选择一个项目来管理您的营销活动
  - 操作按钮：Enter Project → 进入项目、Logout → 退出登录

- **主布局和菜单** (`components/MainLayout.tsx`)
  - 菜单项翻译：
    - Search → 红人搜索
    - Evaluate → 红人评估
    - Pitch → 红人联络
    - Tracking → 数据追踪
  - 子菜单：Task List → 任务列表、Create Task → 创建任务
  - 用户菜单：Profile → 个人资料、Switch Project → 切换项目、Logout → 退出登录

- **搜索模块** (`pages/Search/`)
  - **任务列表** (`TaskList.tsx`)
    - 页面标题：Search Tasks → 搜索任务
    - 表格列名：Task Name → 任务名称、Method → 搜索方式、Status → 状态、Created At → 创建时间、Action → 操作
    - 状态标签：Completed → 已完成、Searching → 搜索中、Pending → 待处理、Failed → 失败
    - 标签文本：Keyword → 关键词、Upload → 上传
    - 操作按钮：Create Task → 创建任务、View Results → 查看结果

  - **创建任务** (`CreateTask.tsx`)
    - 页面标题：Create Search Task → 创建搜索任务
    - Tab 标签：Keyword Search → 关键词搜索、Upload List → 上传名单
    - 表单字段完整翻译：
      - Task Name → 任务名称
      - Industry Keywords → 行业关键词
      - Competitor Keywords → 竞品关键词
      - Brand Keywords → 品牌关键词
      - Search Dimension → 搜索维度
      - Max Results → 最大结果数
      - Target Countries → 目标国家
      - Video Content → 视频内容、Channel Name → 频道名称
    - 按钮：Start Search → 开始搜索、Upload & Search → 上传并搜索、Download Template → 下载模板
    - 提示消息：搜索任务已成功启动/文件已上传，开始处理/创建任务失败

  - **搜索结果详情** (`TaskDetail.tsx`)
    - 页面标题：Search Results → 搜索结果
    - 表格列名：Influencer → 红人、Subscribers → 订阅数、Avg Views → 平均观看、Country → 国家、Keywords → 关键词
    - 筛选器：Subscriber Tier → 订阅量级、Country → 国家
    - 量级标签：<10k → <1万、10k-50k → 1万-5万、50k-200k → 5万-20万、200k-1M → 20万-100万、>1M → >100万
    - 按钮：Export CSV → 导出 CSV、Start Evaluate → 开始评估
    - 选择提示：已选择 X 位红人
    - 对话框：开始评估/确定要为 X 位红人创建评估任务吗？

- **评估模块** (`pages/Evaluate/`)
  - **任务列表** (`TaskList.tsx`)
    - 页面标题：Evaluation Tasks → 评估任务
    - 表格列名：Task Name → 任务名称、Influencers → 红人数量、Status → 状态、Created At → 创建时间、Action → 操作
    - 状态标签：Completed → 已完成、Analyzing → 分析中、Queued → 待处理
    - 操作按钮：View Report → 查看报告

  - **评估详情** (`EvaluateDetail.tsx`)
    - 页面标题：Evaluation Report → 评估报告
    - 表格列名：
      - Influencer → 红人
      - Quality Score → 质量评分
      - Match Score → 匹配评分
      - Est. CPM → 预估 CPM
      - Suggested Price → 建议报价
      - Engagement → 互动率
    - 筛选器：Quality Score → 质量评分、Match Score → 匹配评分、Channel Category → 频道类别
    - 按钮：Add to Pitch List → 添加到联络列表
    - 选择提示：已选择 X 位候选人
    - 对话框：添加到联络列表/确定要将 X 位红人添加到联络候选列表吗？

- **联络模块** (`pages/Pitch/`)
  - **候选人列表** (`CandidateList.tsx`)
    - 页面标题：Pitch Candidate List → 联络候选列表
    - 表格列名：Channel Info → 频道信息、Contact Email → 联系邮箱、Price Estimate → 报价预估、Action → 操作
    - 邮箱状态：Fetching → 获取中、Verified → 已验证、Not Found → 未找到、Pending → 待处理
    - 订阅数单位：Subs → 订阅
    - 按钮：Export Excel → 导出 Excel、Start Outreach Campaign → 开始联络活动、Remove → 移除
    - 空状态：No candidates added yet → 还没有添加候选人、Go to Evaluation Tasks → 前往评估任务
    - Excel 导出：
      - 表头翻译：Channel Name → 频道名称、Channel URL → 频道链接、Subscribers → 订阅数、等
      - 工作表名称：Pitch List → 联络列表
      - 文件名：Pitch_List_日期.xlsx → 联络列表_日期.xlsx

### ⚙️ 功能优化

#### 项目切换功能修复
- **位置**：`components/MainLayout.tsx` (第150-157行)
- **问题**：顶部项目名称区域无法点击切换项目
- **解决方案**：
  - 将项目名称显示从静态 `<div>` 改为可交互的 `<Button>` 组件
  - 添加 `onClick={handleChangeProject}` 事件处理
  - 添加悬停效果样式：`hover:bg-gray-100 hover:border-[#6C6C9C]`
  - 添加过渡动画：`transition-all`
  - 保留图标和文本的原有样式
- **效果**：用户现在可以点击顶部的项目名称区域快速切换到项目选择页面

### 📝 文本内容更新
- 更新所有用户可见的中文文本
- 统一术语：红人（Influencer）、订阅数（Subscribers）、互动率（Engagement Rate）
- 优化提示消息的用户友好性

---

## [v0.1.0] - 初始版本

### ✨ 核心功能
- 用户登录认证
- 项目管理和选择
- 红人搜索功能（关键词搜索、上传名单）
- 红人评估系统
- 联络候选人管理
- 数据导出功能（Excel）

### 🎨 界面设计
- 采用 Ant Design 5.x 组件库
- 响应式布局设计
- 主题色：#6C6C9C
- 侧边栏导航
- 用户头像和菜单

### 🛠 技术栈
- React 18.2.0
- TypeScript
- React Router DOM 6.22.3
- Ant Design 5.16.1
- Zustand 4.5.2（状态管理）
- Recharts 2.12.3（图表）
- XLSX 0.18.5（Excel 导出）
- Vite 构建工具

---

## 待优化项目 (Todo)

- [ ] 添加国际化框架支持多语言切换
- [ ] 性能优化和代码分割
- [ ] 单元测试覆盖
- [ ] API 文档完善
