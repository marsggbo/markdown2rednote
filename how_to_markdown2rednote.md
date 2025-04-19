


# 使用 Node.js 将 Markdown 转换为 HTML 并截图为小红书风格长图

在撰写笔记、教程或技术总结时，我们常常使用 Markdown 来写作，并希望将其发布到社交平台，如小红书、公众号、知乎等。但这些平台往往不支持直接粘贴 Markdown，因此将 Markdown 渲染为图片成为一种通用且视觉友好的方式。

本文介绍一种基于 `Node.js` 的自动化方案：**将 Markdown 转换成 HTML，再用浏览器截图为多张图片，适配小红书的阅读体验。**

---

## ✨ 应用场景

- 在本地撰写 Markdown，输出高质量截图用于小红书/知乎/公众号；
- 保留公式、代码块、标题等 Markdown 特性；
- 支持语法高亮（highlight.js）和数学公式（KaTeX）；
- 自动分段截图，适配移动端阅读体验。

---

## 🧰 技术方案简介

整个流程包括：

1. 使用 `marked` 将 Markdown 转为 HTML；
2. 使用 `highlight.js` 实现代码高亮；
3. 使用 `KaTeX` 渲染数学公式；
4. 使用 `puppeteer` 启动 Chromium，加载 HTML 并截图；
5. 自动将长文分割成多段图片，适配小红书标准尺寸（如 1250px 高度）。

---

## ⚙️ 依赖项

请确保你已安装：

- Node.js（推荐版本 ≥ 16）
- npm（Node.js 自带）
- macOS/Linux 系统（Windows 需要额外处理字体路径）

### 项目使用的 NPM 库：

```bash
npm install marked puppeteer highlight.js katex minimist
```


⸻

🚀 快速开始

1. 克隆项目
```bash
git clone https://github.com/marsggbo/markdown2rednote.git
cd markdown2rednote
```
2. 准备你的 Markdown 文件

例如：`how_to_markdown2rednote..md`

3. 运行转换脚本

赋予脚本权限并执行：
```bash
chmod +x ./md2xhs.sh
./md2xhs.sh how_to_markdown2rednote..md
```
4. 输出结果

脚本会自动：
- 分析并分段渲染 Markdown 内容；
- 在 how_to_markdown2rednote./ 目录下生成截图：
- 01.png, 02.png, …, 每段对应一张图；
- 每张图高度自动适配，默认最大为 1250px（小红书推荐尺寸）；
- 最终显示完成提示 ✅。

⸻

📦 输出示例

你的输出目录结构类似：

```bash
how_to_markdown2rednote./
├── 01.png
├── 02.png
├── 03.png
```
Markdown 中使用的图片、代码块、公式都将被正确渲染。

⸻

💡 常见问题

1. 没有显示代码高亮？

请确保你已正确引入 highlight.js 样式：
- 示例用的是 monokai-sublime 主题；
- 可以替换为其他风格（如 atom-one-dark, github, 等）。

2. 数学公式不显示？

确保你写的是 $E = mc^2$ 或 $$f(x) = \int_{a}^{b} x^2dx$$ 这类标准格式，并启用了 KaTeX。

⸻

✅ 总结

这种基于 Puppeteer 的截图方案，可以无缝地将 Markdown 转换成清晰、高质量、排版友好的图文内容。尤其适合将技术类笔记、写作内容发布到图文平台，避免重新排版或丢失语义结构。

⸻

📎 推荐扩展
- 支持图片圆角和水印；
- 多语言语法高亮支持；
- 微信公众号图文样式模板；
- zip 打包生成所有图片一键分享。

⸻

📮 项目地址

👉 GitHub：marsggbo/markdown2rednote

欢迎 Star / Fork / 提 Issue / PR 😄
