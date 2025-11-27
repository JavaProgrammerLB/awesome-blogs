#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 配置
AVATAR_DIR="/Users/bill/Program/awesome-blogs/src/assets/avatar"
BLOGS_JSON="/Users/bill/Program/awesome-blogs/src/assets/blogs.json"
UPLOAD_URL="http://137.184.23.220:8086/api/v1/upload-avatar"
MAPPING_FILE="/tmp/avatar_url_mapping.json"

# 检查必要的工具
command -v jq >/dev/null 2>&1 || { 
    echo -e "${RED}错误: 需要安装jq工具。请运行: brew install jq${NC}" >&2
    exit 1
}

command -v curl >/dev/null 2>&1 || { 
    echo -e "${RED}错误: 需要curl工具${NC}" >&2
    exit 1
}

# 检查目录是否存在
if [ ! -d "$AVATAR_DIR" ]; then
    echo -e "${RED}错误: avatar目录不存在: $AVATAR_DIR${NC}"
    exit 1
fi

# 检查blogs.json是否存在
if [ ! -f "$BLOGS_JSON" ]; then
    echo -e "${RED}错误: blogs.json文件不存在: $BLOGS_JSON${NC}"
    exit 1
fi

# 创建备份
BACKUP_FILE="${BLOGS_JSON}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$BLOGS_JSON" "$BACKUP_FILE"
echo -e "${GREEN}已创建备份: $BACKUP_FILE${NC}"

# 初始化映射文件
echo "{}" > "$MAPPING_FILE"

echo -e "${YELLOW}开始上传avatar文件...${NC}\n"

# 遍历avatar目录下的所有文件
uploaded_count=0
failed_count=0

for file in "$AVATAR_DIR"/*; do
    # 跳过目录
    if [ -d "$file" ]; then
        continue
    fi
    
    filename=$(basename "$file")
    
    # 检测文件类型
    extension="${filename##*.}"
    # 转小写，兼容 macOS/zsh
    extension_lc=$(echo "$extension" | tr '[:upper:]' '[:lower:]')
    case "$extension_lc" in
        jpg|jpeg)
            mime_type="image/jpg"
            ;;
        png)
            mime_type="image/png"
            ;;
        webp)
            mime_type="image/webp"
            ;;
        gif)
            mime_type="image/gif"
            ;;
        ico)
            mime_type="image/x-icon"
            ;;
        svg)
            mime_type="image/svg+xml"
            ;;
        *)
            echo -e "${YELLOW}跳过未知类型文件: $filename${NC}"
            continue
            ;;
    esac
    
    echo -e "${YELLOW}正在上传: $filename (${mime_type})${NC}"
    
    # 上传文件并捕获响应
    response=$(curl -s -X POST "$UPLOAD_URL" \
        -F "file=@${file};type=${mime_type}")
    
    # 检查响应是否成功
    if [ $? -eq 0 ]; then
        # 尝试从响应中提取URL（根据实际API响应格式调整）
        # 假设API返回JSON格式: {"url": "https://..."}
        new_url=$(echo "$response" | jq -r '.url // .data.url // .link // empty' 2>/dev/null)
        
        if [ -n "$new_url" ] && [ "$new_url" != "null" ]; then
            echo -e "${GREEN}✓ 上传成功: $new_url${NC}"
            
            # 保存映射关系
            old_path="avatar/$filename"
            jq --arg old "$old_path" --arg new "$new_url" \
                '. + {($old): $new}' "$MAPPING_FILE" > "${MAPPING_FILE}.tmp"
            mv "${MAPPING_FILE}.tmp" "$MAPPING_FILE"
            
            ((uploaded_count++))
        else
            echo -e "${RED}✗ 上传失败: 无法从响应中解析URL${NC}"
            echo -e "${RED}  响应内容: $response${NC}"
            ((failed_count++))
        fi
    else
        echo -e "${RED}✗ 上传失败: curl请求失败${NC}"
        ((failed_count++))
    fi
    
    echo ""
    # 添加小延迟避免请求过快
    sleep 0.5
done

echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}上传完成! 成功: $uploaded_count, 失败: $failed_count${NC}"
echo -e "${YELLOW}========================================${NC}\n"

# 如果有成功上传的文件，更新blogs.json
if [ $uploaded_count -gt 0 ]; then
    echo -e "${YELLOW}正在更新 blogs.json...${NC}"
    
    # 读取映射文件并更新blogs.json
    jq --slurpfile mapping "$MAPPING_FILE" '
        map(
            if .avatar and ($mapping[0][.avatar] // null) != null then
                .avatar = $mapping[0][.avatar]
            else
                .
            end
        )
    ' "$BLOGS_JSON" > "${BLOGS_JSON}.tmp"
    
    # 验证JSON是否有效
    if jq empty "${BLOGS_JSON}.tmp" 2>/dev/null; then
        mv "${BLOGS_JSON}.tmp" "$BLOGS_JSON"
        echo -e "${GREEN}✓ blogs.json 更新成功！${NC}"
        
        # 显示更新统计
        updated_count=$(jq --slurpfile mapping "$MAPPING_FILE" '
            map(select(.avatar and ($mapping[0][.avatar] // null) != null)) | length
        ' "$BLOGS_JSON")
        
        echo -e "${GREEN}共更新了 $updated_count 条记录${NC}"
    else
        echo -e "${RED}✗ 生成的JSON无效，保持原文件不变${NC}"
        rm "${BLOGS_JSON}.tmp"
        exit 1
    fi
    
    echo -e "\n${YELLOW}URL映射文件已保存至: $MAPPING_FILE${NC}"
    echo -e "${YELLOW}备份文件位置: $BACKUP_FILE${NC}"
else
    echo -e "${RED}没有成功上传的文件，不更新blogs.json${NC}"
    exit 1
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}所有操作完成！${NC}"
echo -e "${GREEN}========================================${NC}"
