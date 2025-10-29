#!/bin/bash

echo "🚀 LLM 数据浏览器 - 自动安装脚本"
echo "=================================="
echo ""

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

echo "📦 正在检测包管理器..."
echo ""

# 尝试使用 yarn
if command -v yarn &> /dev/null; then
    echo "✅ 检测到 yarn，使用 yarn 安装..."
    yarn install
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ 安装成功！"
        echo ""
        echo "🎉 运行以下命令启动项目："
        echo "   yarn dev"
        exit 0
    fi
fi

# 尝试使用 pnpm
if command -v pnpm &> /dev/null; then
    echo "✅ 检测到 pnpm，使用 pnpm 安装..."
    pnpm install
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ 安装成功！"
        echo ""
        echo "🎉 运行以下命令启动项目："
        echo "   pnpm dev"
        exit 0
    fi
fi

# 使用 npm
echo "📦 使用 npm 安装..."
echo ""

# 检查权限问题
if [ -d "$HOME/.npm" ] && [ ! -w "$HOME/.npm" ]; then
    echo "⚠️  检测到 npm 缓存权限问题"
    echo ""
    echo "请运行以下命令修复（需要管理员密码）："
    echo "   sudo chown -R $(id -u):$(id -g) \"$HOME/.npm\""
    echo ""
    read -p "是否现在修复？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo chown -R $(id -u):$(id -g) "$HOME/.npm"
    fi
fi

# 尝试安装
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 安装成功！"
    echo ""
    echo "🎉 运行以下命令启动项目："
    echo "   npm run dev"
    echo ""
    echo "然后在浏览器中打开：http://localhost:3000"
else
    echo ""
    echo "❌ 安装失败"
    echo ""
    echo "请尝试以下方法："
    echo "1. 修复 npm 权限："
    echo "   sudo chown -R $(id -u):$(id -g) \"$HOME/.npm\""
    echo ""
    echo "2. 或安装 yarn："
    echo "   npm install -g yarn"
    echo "   yarn install"
    echo ""
    echo "3. 或查看 安装指南.md 获取更多帮助"
fi

