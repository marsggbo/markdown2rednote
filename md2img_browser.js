const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const marked = require('marked');
const argv = require('minimist')(process.argv.slice(2));

// 帮助信息
if (argv.h || argv.help || !argv._[0]) {
  console.log(`
用法: node md2img_browser.js <markdown文件> [选项]

选项:
  --output, -o    输出图片路径前缀 (默认: <markdown文件名>_)
  --width, -w     浏览器视口宽度 (默认: 700)
  --style, -s     CSS 样式文件路径 (可选)
  --help, -h      显示帮助信息
  `);
  process.exit(0);
}

// 参数处理
const mdFilePath = argv._[0];
const outputPrefix = (argv.o || argv.output || mdFilePath.replace(/\.md$/, '_')) + '';
const viewportWidth = parseInt(argv.w || argv.width || 700);
const cssFilePath = argv.s || argv.style || '';

// 小红书最佳图片高度（按照9:16比例）
const XIAOHONGSHU_HEIGHT = 1250;

// 兼容性函数 - 等待指定的毫秒数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 将Markdown分割成几个部分，每个部分生成一张图片
function splitMarkdownContent(markdown) {
  // 按主要标题分割
  const sections = [];
  const lines = markdown.split('\n');
  
  let currentSection = [];
  let sectionCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    // 如果是主要标题 (# 或 ##)，考虑开始新部分
    if ((lines[i].startsWith('# ') || lines[i].startsWith('## ')) && currentSection.length > 0) {
      // 如果当前部分已经很长，添加到sections
      if (currentSection.length > 15) {
        sections.push(currentSection.join('\n'));
        currentSection = [];
        sectionCount++;
      }
    }
    
    currentSection.push(lines[i]);
    
    // 如果当前部分已经很长，开始新部分
    if (currentSection.length > 35) {
      sections.push(currentSection.join('\n'));
      currentSection = [];
      sectionCount++;
    }
  }
  
  // 添加最后一部分
  if (currentSection.length > 0) {
    sections.push(currentSection.join('\n'));
  }
  
  return sections;
}

async function convertMarkdownToImage() {
  try {
    // 读取 Markdown 文件
    const markdown = fs.readFileSync(mdFilePath, 'utf-8');
    
    // 读取自定义 CSS (如果提供)
    let customCSS = '';
    if (cssFilePath && fs.existsSync(cssFilePath)) {
      customCSS = fs.readFileSync(cssFilePath, 'utf-8');
      console.log(`已加载样式: ${cssFilePath}`);
    }

    // GitHub 风格的 CSS
    const githubCSS = `
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: 16px;
        line-height: 1.5;
        color: #24292e;
        background-color: #fff;
        max-width: ${viewportWidth}px;
        margin: 0 auto;
        padding: 20px;
      }
      h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
      h1 { font-size: 2em; padding-bottom: .3em; border-bottom: 1px solid #eaecef; }
      h2 { font-size: 1.5em; padding-bottom: .3em; border-bottom: 1px solid #eaecef; }
      h3 { font-size: 1.25em; }
      h4 { font-size: 1em; }
      p, blockquote, ul, ol, dl, table, pre { margin-top: 0; margin-bottom: 16px; }
      blockquote { padding: 0 1em; color: #6a737d; border-left: 0.25em solid #dfe2e5; }
      ul, ol { padding-left: 2em; }
      code { padding: 0.2em 0.4em; background-color: rgba(27,31,35,0.05); border-radius: 3px; }
      pre { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background-color: #f6f8fa; border-radius: 3px; word-wrap: break-word; white-space: pre-wrap; }
      pre code { padding: 0; background-color: transparent; }
      a { color: #0366d6; text-decoration: none; }
      a:hover { text-decoration: underline; }
      table { border-spacing: 0; border-collapse: collapse; }
      td, th { padding: 6px 13px; border: 1px solid #dfe2e5; }
      img { max-width: 100%; }
      
      /* KaTeX 相关样式 */
      .katex { font-size: 1.1em; }
      .katex-display { overflow-x: auto; overflow-y: hidden; margin: 1em 0; }
    `;
    
    // 分割Markdown内容
    const sections = splitMarkdownContent(markdown);
    console.log(`将Markdown分割成 ${sections.length} 个部分`);

    console.log('启动浏览器...');
    
    // 启动浏览器
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // 创建输出目录
    const outputDir = path.dirname(outputPrefix);
    if (!fs.existsSync(outputDir) && outputDir !== '.') {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const imageOutputs = [];
    
    // 为每个部分创建一张图片
    for (let i = 0; i < sections.length; i++) {
      console.log(`处理第 ${i + 1}/${sections.length} 部分...`);
      
      // 创建新页面
      const page = await browser.newPage();
      
      // 设置视口大小
      await page.setViewport({
        width: viewportWidth + 40,
        height: XIAOHONGSHU_HEIGHT,
        deviceScaleFactor: 2,
      });
      
      // 将当前部分转换为HTML
      const html = marked.parse(sections[i]);
      
      // 设置HTML内容
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <!-- KaTeX CSS -->
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
            <style>
              ${githubCSS}
              ${customCSS}
            </style>
          </head>
          <body>
            <div class="markdown-body">
              ${html}
            </div>
            
            <!-- KaTeX JS -->
            <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
            
            <!-- 渲染数学公式 -->
            <script>
              document.addEventListener("DOMContentLoaded", function() {
                renderMathInElement(document.body, {
                  delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "$", right: "$", display: false},
                    {left: "\\\\(", right: "\\\\)", display: false},
                    {left: "\\\\[", right: "\\\\]", display: true}
                  ],
                  throwOnError: false
                });
              });
              
              // 立即执行一次渲染
              renderMathInElement(document.body, {
                delimiters: [
                  {left: "$$", right: "$$", display: true},
                  {left: "$", right: "$", display: false},
                  {left: "\\\\(", right: "\\\\)", display: false},
                  {left: "\\\\[", right: "\\\\]", display: true}
                ],
                throwOnError: false
              });
            </script>
          </body>
        </html>
      `, { waitUntil: 'networkidle0' });
      
      // 等待内容加载完成
      await page.waitForSelector('.markdown-body');
      
      // 等待数学公式渲染完成
      await sleep(500);
      
      // 获取内容高度
      const pageHeight = await page.evaluate(() => {
        return document.body.scrollHeight;
      });
      
      // 调整视口高度，确保适合小红书
      const finalHeight = Math.min(pageHeight, XIAOHONGSHU_HEIGHT);
      
      // 截图
      const imagePath = `${outputPrefix}${(i + 1).toString().padStart(2, '0')}.png`;
      
      await page.screenshot({
        path: imagePath,
        clip: {
          x: 0,
          y: 0,
          width: viewportWidth + 40,
          height: finalHeight
        },
        omitBackground: false
      });
      
      imageOutputs.push(imagePath);
      console.log(`已生成第 ${i + 1} 张图片: ${imagePath} (高度: ${finalHeight}px)`);
      
      // 关闭此页面
      await page.close();
    }

    // 关闭浏览器
    await browser.close();
    
    console.log(`✅ 已将 Markdown 转换为 ${imageOutputs.length} 张图片`);
  } catch (error) {
    console.error('错误详情:', error);
    process.exit(1);
  }
}

// 执行转换
convertMarkdownToImage(); 