@echo off
setlocal enabledelayedexpansion

:: Check parameters
if "%~1"=="" (
    echo Usage: %0 ^<markdown_file.md^> [width] [style_file]
    echo Example: %0 overleaf_pdf.md 700 xiaohongshu.css
    exit /b 1
)

:: Set variables
set "mdfile=%~1"
set "width=%~2"
if "!width!"=="" set "width=700"
set "style=%~3"
if "!style!"=="" set "style=xiaohongshu.css"

echo Processing file: !mdfile!
echo Width: !width!
echo Style: !style!

:: Create output directory from Markdown filename
for %%I in ("%mdfile%") do (
    set "filename=%%~nxI"
    set "output_dir=%%~nI_images"
    set "output_prefix=!output_dir!\"
)

:: Create output directory
if not exist "!output_dir!" (
    echo Creating directory: !output_dir!
    mkdir "!output_dir!"
) else (
    echo Directory already exists: !output_dir!
)

echo Will save images to: !output_dir!\

:: Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    exit /b 1
)
echo Node.js found.

:: Check if npm is installed
echo Checking npm installation...
call npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not working properly
    exit /b 1
)
echo npm found.

:: Check if markdown file exists
if not exist "!mdfile!" (
    echo ERROR: Markdown file "!mdfile!" does not exist
    exit /b 1
)
echo Markdown file exists.

:: Check if md2img_browser.js exists
if not exist "md2img_browser.js" (
    echo ERROR: md2img_browser.js file not found!
    exit /b 1
)
echo md2img_browser.js found.

:: Check dependencies
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install puppeteer@23.10.4 marked@14.0.0 minimist@1.2.8 --save --no-fund --no-audit
) else (
    echo Dependencies already installed.
)

:: 修复参数传递问题 - 使用正斜杠和正确的路径格式
set "output_prefix_fixed=!output_dir!/"

:: 检查样式文件是否存在
if "!style!" neq "none" (
    if not exist "!style!" (
        echo WARNING: Style file !style! does not exist, will use default style
        set "style=none"
    )
)

:: Execute Node.js script with fixed parameters
echo Converting Markdown to Xiaohongshu style images...

if "!style!"=="none" (
    echo Command: node md2img_browser.js "!mdfile!" --output "!output_prefix_fixed!" --width "!width!"
    node md2img_browser.js "!mdfile!" --output "!output_prefix_fixed!" --width "!width!"
) else (
    echo Command: node md2img_browser.js "!mdfile!" --output "!output_prefix_fixed!" --width "!width!" --style "!style!"
    node md2img_browser.js "!mdfile!" --output "!output_prefix_fixed!" --width "!width!" --style "!style!"
)

if errorlevel 1 (
    echo ERROR: Node.js script failed with error code !errorlevel!
    
    :: 尝试替代方法：使用JSON配置文件
    echo Trying alternative method with config file...
    
    :: 创建临时配置文件
    (
    echo {
    echo   "inputFile": "!mdfile!",
    echo   "outputDir": "!output_dir!",
    echo   "width": !width!,
    echo   "styleFile": "!style!"
    echo }
    ) > temp_config.json
    
    echo Using config file: node md2img_browser.js --config temp_config.json
    node md2img_browser.js --config temp_config.json
    
    :: 清理临时文件
    if exist "temp_config.json" del "temp_config.json"
    
    if errorlevel 1 (
        echo ERROR: All conversion attempts failed.
        exit /b 1
    )
)

echo Complete! Images saved to !output_dir!\ directory
echo.
echo Summary:
echo - Input file: !mdfile!
echo - Output directory: !output_dir!\
echo - Width: !width!
echo - Style: !style!

endlocal
