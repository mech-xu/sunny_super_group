#!/bin/bash

# SunnyNow团购自提系统 - 项目初始化脚本

echo "==================================="
echo "SunnyNow团购自提系统 - 项目初始化"
echo "适用于加拿大华人群体"
echo "==================================="

# 检查是否安装了node
if ! command -v node &> /dev/null; then
    echo "错误: 未检测到Node.js，请先安装Node.js"
    exit 1
fi

# 检查是否安装了npm
if ! command -v npm &> /dev/null; then
    echo "错误: 未检测到npm，请先安装npm"
    exit 1
fi

echo "Node.js版本: $(node --version)"
echo "npm版本: $(npm --version)"

# 进入项目目录
cd /Users/sunny/sunnynow_local/uniapp-client/src

# 检查package.json是否存在
if [ ! -f "package.json" ]; then
    echo "错误: package.json 文件不存在"
    exit 1
fi

echo "安装项目依赖..."
npm install --registry=https://registry.npmmirror.com

if [ $? -eq 0 ]; then
    echo "==================================="
    echo "依赖安装成功！"
    echo "==================================="
    echo "常用命令："
    echo "  npm run dev:mp-weixin    # 启动微信小程序开发"
    echo "  npm run dev:h5           # 启动H5开发"
    echo "  npm run build:mp-weixin  # 构建微信小程序"
    echo "  npm run build:h5         # 构建H5应用"
    echo "==================================="
else
    echo "依赖安装失败，请检查网络连接或配置"
    exit 1
fi