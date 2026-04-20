#!/bin/bash

# SSH登录脚本，用于连接到Nas Docker虚拟开发环境
echo "正在连接到Nas Docker虚拟开发环境..."

# 尝试SSH连接到指定IP地址
ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null sunny@192.168.2.71 << 'ENDSSH'

# 输出环境信息
echo "=== 登录成功 ==="
echo "主机名: $(hostname)"
echo "当前时间: $(date)"
echo "用户: $(whoami)"
echo "工作目录: $(pwd)"
echo "系统信息: $(uname -a)"

# 查看项目目录
echo ""
echo "=== 项目目录结构 ==="
ls -la /home/sunny/

# 查看是否有与前端相关的目录
echo ""
echo "=== 搜索前端相关目录 ==="
find /home/sunny -type d -name "*frontend*" -o -name "*web*" -o -name "*client*" 2>/dev/null | head -10

# 查看是否有与团购系统相关的目录
echo ""
echo "=== 搜索团购系统相关目录 ==="
find /home/sunny -type d -name "*group*" -o -name "*buy*" -o -name "*sunny*" 2>/dev/null | grep -i -E "(group|buy|sunny)" | head -10

# 查看是否有Docker相关配置
echo ""
echo "=== Docker相关信息 ==="
docker ps -a 2>/dev/null || echo "Docker未安装或未运行"

# 查看当前运行的服务
echo ""
echo "=== 当前监听端口 ==="
netstat -tuln 2>/dev/null | grep -E "(80|443|3000|8080|8000)" || ss -tuln 2>/dev/null | grep -E "(80|443|3000|8080|8000)" || echo "无法获取端口信息"

# 退出SSH会话
exit

ENDSSH

if [ $? -eq 0 ]; then
    echo "SSH连接已断开"
else
    echo "SSH连接失败，请检查网络连接和目标主机状态"
fi