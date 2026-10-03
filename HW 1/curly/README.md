# curly 🌀

> 用純 Python 打造的 curl-like HTTP 客戶端工具 — 不需要任何外部套件。

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue?logo=python)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-Micha1lyu-black?logo=github)](https://github.com/Micha1lyu)

## 功能特色
 
| 參數 | 說明 |
|------|------|
| `-X METHOD` | HTTP 方法（GET、POST、PUT、DELETE、PATCH…） |
| `-H '鍵: 值'` | 自訂請求標頭（可重複使用） |
| `-d DATA` | 請求內容主體（自動偵測 JSON 格式） |
| `-F key=value` | 表單資料（自動設定 `application/x-www-form-urlencoded`） |
| `-u user:pass` | Basic 驗證 |
| `-L` | 自動跟隨重新導向 |
| `--max-redirs N` | 最大重新導向次數（預設：10） |
| `-o FILE` | 將回應內容儲存至檔案 |
| `-i` | 顯示回應標頭 |
| `-v` | 詳細模式（顯示請求與回應完整資訊） |
| `--no-pretty` | 關閉 JSON 自動排版 |
| `--timeout N` | 請求逾時秒數（預設：30） |

## 環境需求

- Python 3.8 以上
- 不需要安裝任何外部套件（僅使用標準函式庫）

## 使用方式

```bash
# 基本 GET 請求
python curly.py https://httpbin.org/get

# POST 請求帶 JSON 主體
python curly.py -X POST -d '{"name":"curly","cool":true}' https://httpbin.org/post

# 自訂標頭
python curly.py -H "Accept: application/json" -H "X-Token: secret" https://httpbin.org/headers

# Basic 驗證
python curly.py -u admin:password https://httpbin.org/basic-auth/admin/password

# 跟隨重新導向並顯示詳細資訊
python curly.py -L -v https://httpbin.org/redirect/3

# 將結果儲存到檔案
python curly.py -o output.json https://httpbin.org/json

# 顯示回應標頭
python curly.py -i https://httpbin.org/get

# 表單資料
python curly.py -F username=john -F password=secret https://httpbin.org/post
```

## 設定成全域指令（選用）

**Windows（PowerShell）：**
```powershell
# 在 PATH 內的資料夾建立 curly.bat
echo '@python "%~dp0curly.py" %*' > curly.bat
```

**macOS / Linux：**
```bash
chmod +x curly.py
sudo ln -s $(pwd)/curly.py /usr/local/bin/curly
# 之後直接用：curly https://example.com
```

## 授權

MIT License © [Micha1lyu](https://github.com/Micha1lyu)
