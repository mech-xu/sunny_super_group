#!/bin/bash

# SunnyNow团购自提系统 - Chrome iPhone模拟测试脚本

echo "启动Chrome浏览器并打开SunnyNow团购自提系统..."
echo "请在浏览器中按F12打开开发者工具，然后点击设备模拟图标选择iPhone设备。"

# 获取当前用户的Chrome路径
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# 检查Chrome是否存在
if [ -f "$CHROME_PATH" ]; then
    echo "找到Chrome浏览器，正在启动..."
    open -a "Google Chrome" "http://localhost:5173"
else
    # 尝试使用默认浏览器打开
    echo "未找到Chrome，尝试使用默认浏览器..."
    open "http://localhost:5173"
fi

echo " "
echo "====================================="
echo "Chrome iPhone 模拟调试指南："
echo "1. 按 F12 键或右键选择 '检查' 打开开发者工具"
echo "2. 点击设备模拟图标 (手机/平板图标) 或按 Ctrl+Shift+M"
echo "3. 在设备列表中选择任意 iPhone 型号"
echo "4. 刷新页面以应用设备模拟"
echo "====================================="