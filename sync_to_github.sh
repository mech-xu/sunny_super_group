#!/bin/bash

# 自动同步本地更改到GitHub仓库的脚本
# 使用方法: ./sync_to_github.sh "commit message"

set -e  # 遇到错误立即退出

echo "🚀 开始同步到GitHub仓库..."

# 检查是否有参数
if [ $# -eq 0 ]; then
    COMMIT_MESSAGE="Auto sync: $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MESSAGE="$1"
fi

echo "📝 Commit message: $COMMIT_MESSAGE"

# 添加所有更改
echo "📁 添加所有文件..."
git add .

# 检查是否有更改需要提交
if ! git diff --cached --quiet; then
    echo "💾 提交更改..."
    git commit -m "$COMMIT_MESSAGE"
    
    echo "📤 推送到GitHub..."
    git push origin main
    
    echo "✅ 同步完成！"
    echo "🔗 GitHub Actions CI/CD 流水线将自动触发"
else
    echo "ℹ️  没有检测到更改，无需同步"
fi

echo "📊 当前仓库状态:"
git status --short