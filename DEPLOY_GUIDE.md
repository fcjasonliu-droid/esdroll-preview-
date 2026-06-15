# EDAR New Site — Deployment Guide

## 部署包
- 文件：`/tmp/esdroll-new-site-v1.zip` (3.5MB, 88 文件)
- 来源：`/Users/jason/Projects/esdroll/`
- 创建时间：2026-06-15

## 部署步骤（Hostinger hPanel）

### Step 1: 登录 hPanel
- URL: `https://hpanel.hostinger.com`
- 账号：`modanna0712@gmail.com`
- 密码：尝试 `LN276037.` / `Ln276730.` / `Ln276730`

### Step 2: 备份 WordPress（必须！）

**2.1 文件备份：**
1. hPanel → **File Manager** → 进入 `public_html/`
2. 选中所有文件 → 右键 **Compress** → 选 `.zip`
3. 下载 zip 到本地电脑

**2.2 数据库备份：**
1. hPanel → **Databases** → 找到 esdroll.com 数据库
2. 点击 **"Manage" / "phpMyAdmin"**
3. 选中数据库 → **Export** → 选 **SQL** → **Go**
4. 保存 .sql 文件

### Step 3: 删除 WordPress 文件
1. File Manager → `public_html/`
2. **删除所有文件**（保留 `.well-known` 目录如果存在）
3. ⚠️ 备份完成前不要执行此步

### Step 4: 上传新站
1. 下载 `/tmp/esdroll-new-site-v1.zip` 到电脑
2. hPanel → File Manager → `public_html/`
3. 拖拽 zip 上传（如果上传限制用 FTP）
4. 右键 zip → **Extract**
5. 删除 zip

### Step 5: 配置 HTTPS
1. hPanel → **Security** → **SSL**
2. 启用 **Let's Encrypt** (免费)
3. 开启 **Force HTTPS** 重定向

### Step 6: 验证
访问 https://esdroll.com 看新站
- 检查 12 个页面都能访问
- 检查 logo 图片加载
- 检查 EN/ZH 切换
- 检查 WhatsApp 链接

## 注意事项
- 旧 WP 数据库保留在 Hostinger（30 天可恢复）
- 阿里云企业邮箱 (mx1.qiye.aliyun.com) 不受影响
- 旧 WP 文件备份 zip 保留至少 30 天

## 文件清单（88 个文件）
- 12 HTML 页面
- assets/css/style.css (≈900 行)
- assets/js/main.js (≈300 行)
- assets/i18n/{en,zh}.json + index.json + 4 空 i18n
- assets/img/ (2.9MB, 15 文件)
- assets/users/ (8 logo + 2 svg)
- assets/cert/ (5 认证 logo)
- data/specs.json (4 QC 流程)
- robots.txt, sitemap.xml

## 已知待优化 (5%)
- RoHS 绿叶 SVG 可更精细（手绘版能用）
- 6 评价文字可更真实（有真实客户后替换）
- 06 支柱"全球物流"服务细节可更具体
