# LLM 数据浏览器

专业的 JSON 数据可视化工具，专为 LLM 数据研究人员设计。支持多种数据类型的智能识别和渲染，包括文本、代码、数学公式、图片等。

## ✨ 特性

- 📊 **列视图（Column View）**：灵感来自 macOS Finder 和 [JSON Hero](https://github.com/triggerdotdev/jsonhero-web)，提供直观的多列浏览方式
- 📋 **详情面板**：实时显示选中项的详细信息、类型、大小等
- 🎯 **智能类型检测**：自动识别数据类型（代码、数学公式、图片、工具调用等）
- 💻 **代码高亮**：支持多种编程语言的语法高亮显示
- 📐 **数学公式渲染**：使用 KaTeX 渲染 LaTeX 数学公式
- 🖼️ **图片展示**：支持 URL 和 Base64 格式的图片查看和放大
- 🔧 **工具调用可视化**：清晰展示 LLM Agent 的工具调用过程
- 🔍 **全文搜索**：快速搜索 JSON 中的字段和内容
- 📊 **多视图模式**：列视图、智能视图、JSON 树、原始数据四种展示方式
- 🎨 **现代化 UI**：美观的界面设计，优秀的用户体验
- 📱 **响应式设计**：完美适配各种屏幕尺寸

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 即可使用。

### 构建生产版本

```bash
npm run build
```

## 📖 使用说明

### 1. 输入数据

你可以通过以下方式输入 JSON 数据：

- **直接粘贴**：在输入框中粘贴 JSON 数据
- **上传文件**：点击"上传文件"按钮选择 `.json` 文件
- **加载示例**：点击"加载示例"查看示例数据

### 2. 查看模式

工具提供四种查看模式：

- **列视图**（推荐）：macOS Finder 风格的多列浏览，配合详情面板实时预览
- **智能视图**：自动识别数据类型并使用专门的渲染器展示
- **JSON 树**：以树形结构展示 JSON 数据
- **原始数据**：显示格式化的原始 JSON 文本

### 3. 搜索功能

在搜索框中输入关键词，可以快速过滤和定位数据。

## 🎨 支持的数据类型

### 代码块

自动识别和高亮显示代码：

```json
{
  "code": {
    "language": "python",
    "content": "def hello():\n    print('Hello World')"
  }
}
```

### 数学公式

支持 LaTeX 格式的数学公式：

```json
{
  "formula": "求解方程 $x^2 + 5x + 6 = 0$"
}
```

### 图片

支持 URL 和 Base64 格式：

```json
{
  "image_url": "https://example.com/image.jpg",
  "image_base64": "data:image/png;base64,iVBORw0KG..."
}
```

### 工具调用

识别 LLM Agent 的工具调用：

```json
{
  "function": "calculate",
  "arguments": {
    "expression": "2+2"
  },
  "result": 4
}
```

### 推理过程

高亮显示推理内容：

```json
{
  "reasoning": "首先分析问题...",
  "thought": "根据已知条件..."
}
```

## 🛠️ 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **KaTeX** - 数学公式渲染
- **react-syntax-highlighter** - 代码高亮
- **react-json-view** - JSON 树形展示
- **Lucide React** - 图标库

## 🙏 致谢

本项目的列视图设计灵感来自优秀的开源项目 [JSON Hero](https://github.com/triggerdotdev/jsonhero-web)。

## 📦 项目结构

```bash
DataViewer/
├── src/
│   ├── components/
│   │   ├── DataViewer.tsx          # 主数据查看器
│   │   └── renderers/              # 各类型渲染器
│   │       ├── CodeRenderer.tsx
│   │       ├── MathRenderer.tsx
│   │       ├── ImageRenderer.tsx
│   │       ├── TextRenderer.tsx
│   │       └── ToolCallRenderer.tsx
│   ├── utils/
│   │   └── dataTypeDetector.ts     # 数据类型检测
│   ├── App.tsx                     # 主应用
│   └── main.tsx                    # 入口文件
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 👨‍💻 作者

**ChampionZhong**

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
