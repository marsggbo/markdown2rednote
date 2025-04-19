#!/bin/bash

# 设置错误终止
set -e

# 检查参数
if [ $# -lt 1 ]; then
    echo "用法: $0 <markdown文件.md> [宽度] [样式文件]"
    echo "例如: $0 overleaf_pdf.md 700 xiaohongshu.css"
    exit 1
fi

# 设置变量
mdfile="$1"
width="${2:-700}"
style="${3:-xiaohongshu.css}"

# 从 Markdown 文件名创建输出目录
filename=$(basename "$mdfile")
output_dir="${filename%.md}_images"
output_prefix="${output_dir}/"

# 创建输出目录
mkdir -p "$output_dir"
echo "将保存图片到: $output_dir/"

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未安装 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "错误: 未安装 npm，请先安装 npm"
    exit 1
fi

# 创建 package.json（如果不存在）
if [ ! -f package.json ]; then
    echo "创建 package.json..."
    cat > package.json << EOF
{
  "name": "md2xhs",
  "version": "1.0.0",
  "description": "将 Markdown 转换为小红书风格图片",
  "main": "md2img_browser.js",
  "dependencies": {
    "puppeteer": "^22.8.2",
    "marked": "^9.0.0",
    "minimist": "^1.2.8"
  }
}
EOF
fi

# 确保依赖正确安装
echo "安装必要的依赖..."
npm install puppeteer marked minimist --save

# 检查依赖是否安装成功
if [ ! -d "node_modules/puppeteer" ] || [ ! -d "node_modules/marked" ] || [ ! -d "node_modules/minimist" ]; then
    echo "依赖安装失败，尝试使用 npm ci..."
    rm -rf node_modules package-lock.json
    npm ci
    
    # 再次检查
    if [ ! -d "node_modules/puppeteer" ] || [ ! -d "node_modules/marked" ] || [ ! -d "node_modules/minimist" ]; then
        echo "依赖安装失败，请手动安装依赖："
        echo "npm install puppeteer marked minimist --save"
        exit 1
    fi
fi

# 检查样式文件是否存在
if [ ! -f "$style" ] && [ "$style" != "none" ]; then
    echo "警告: 样式文件 $style 不存在，将使用默认样式"
    style="none"
fi

# 执行 Node.js 脚本
echo "将 Markdown 转换为小红书风格图片..."
if [ "$style" != "none" ]; then
    node md2img_browser.js "$mdfile" --output "$output_prefix" --width "$width" --style "$style"
else
    node md2img_browser.js "$mdfile" --output "$output_prefix" --width "$width"
fi

echo "✅ 完成! 图片已保存到 $output_dir/ 目录"