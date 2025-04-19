在写科研文稿时，我们经常需要插入结构图、模型图等 PDF 格式的矢量图。但在 Overleaf 中，我遇到了一个较难定位的问题：使用 `\includegraphics` 插入 PDF 图片时，**编译无报错，但无法显示图片甚至生成 PDF 文件失败**。提示如下信息

```latex
No PDF
This compile didn't produce a PDF. This can happen if:
There is an unrecoverable LaTeX error. If there are LaTeX errors shown below or in the raw logs, please try to fix them and compile again.
The document environment contains no content. If it's empty, please add some content and compile again.
This project contains a file called output.pdf. If that file exists, please rename it and compile again.
```

本文记录这一问题的背景、排查过程与最终解决方案，希望对遇到类似问题的用户有所帮助。

```python
import torch
torch.rand(10)

resnet = torch.sda()
```


# 1. 问题背景

文档中使用如下方式插入图像：

```latex
\usepackage{graphicx}
\graphicspath{{figures/.../}}

...

\begin{figure}
    \centering
    \includegraphics[width=\linewidth]{prune_structure.pdf}
    \caption{结构化剪枝示意图}
    \label{fig:pruning}
\end{figure}
```

其中 prune_structure.pdf 是一张矢量格式的图像，在本地查看没有问题,并没有损坏。


# 2. 问题现象

在 Overleaf 中：
- 使用 Fast Compile 模式时，文档可以编译成功，但图片显示为空白；
- 使用 Normal Compile 模式时，编译直接失败，并提示：

This compile didn't produce a PDF.

日志中没有明确的错误信息，定位困难。



# 3. 排查过程

以下是我尝试过的排插步骤：
- 1. 确认路径正确：
日志显示图像被正确找到：`File: figures/.../prune_structure.pdf Graphic file (type pdf)`

- 2. 注释图像代码：
注释掉 figure 环节后，PDF 成功生成，说明问题出在图像本身。

- 3. 确认 PDF 未损坏：
图片可以在本地打开，也可以在 Overleaf 文件预览中正常显示，说明文件不是损坏的。

- 4. 加入调试信息：
添加 `\listfiles`，确认使用的是 XeLaTeX，图像类型正确，依然无法定位问题。



**原因分析**

最后问 chatgpt 和上网查资料，终于找到这个诡异的问题的原因了，就是因为Overleaf 使用 XeLaTeX 编译时，某些 PDF 图像的边界框信息（bounding box / crop box）不规范，可能会导致渲染器加载失败。特别是使用某些工具导出的图（如绘图工具、Python 库等）经常出现这种兼容性问题。这个问题光靠肉眼去检查 PDF 根本不可能看出来。折腾了我一上午这破玩意。



# 4. 解决方案：使用 pdfcrop 清理边界信息

我用的是Macbook，所以好像自带 pdfcrop命令。使用如下命令重新生成裁剪后的 PDF：

```bash
pdfcrop -xetex prune_structure.pdf
mv prune_structure-crop.pdf prune_structure.pdf
```

这样处理后，重新上传至 Overleaf，即可成功插入图像并正常编译生成 PDF。


每次都这么敲键盘怪累的，我们可以自动化命令简化操作。只需要把下面的代码添加到 .bashrc 或 .zshrc，我用的是后者：

```bash
# ~/.zshrc
pdfclean() {
    if [ $# -ne 1 ]; then
        echo "Usage: pdfclean <filename.pdf>"
        return 1
    fi
    local input="$1"
    local base="${input%.pdf}"
    pdfcrop -xetex "$input" "${base}-crop.pdf" && mv "${base}-crop.pdf" "$input"
}
```

然后使用：
```bash
pdfclean prune_structure.pdf
```
即可一键清理图像并替换原文件。



# 5. 总结

当 Overleaf 中插入 PDF 图片后出现“无错误但无法显示”或“编译失败”的现象时，建议优先考虑图片的边界信息问题。使用 `pdfcrop -xetex` 是一个有效且高效的解决方案，能显著提高在线 LaTeX 平台对 PDF 图像的兼容性。


# 参考

- https://www.cnblogs.com/Undefined443/p/18191274



<footer style="color:white;;background-color:rgb(24,24,24);padding:10px;border-radius:10px;">
<h3 style="text-align:center;color:tomato;font-size:16px;" id="autoid-2-0-0">
<center>
<span>微信公众号：AutoML机器学习</span><br>
<img src="https://pic4.zhimg.com/80/v2-87083e55cd41dbef83cc840c142df48a_720w.jpeg" style="width:200px;height:200px">
</center>
<b>MARSGGBO</b><b style="color:white;"><span style="font-size:25px;">♥</span>原创</b><br>
<span>如有意合作或学术讨论欢迎私戳联系~<br>邮箱:marsggbo@foxmail.com</span>
<b style="color:white;"><br>
</b><p><b style="color:white;"></b>
</p></h3>
</footer>
