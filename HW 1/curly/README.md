# curly 🌀

> A curl-like HTTP client written in pure Python — no external dependencies.

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue?logo=python)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-Micha1lyu-black?logo=github)](https://github.com/Micha1lyu)

## Features

| Flag | Description |
|------|-------------|
| `-X METHOD` | HTTP method (GET, POST, PUT, DELETE, PATCH…) |
| `-H 'Key: Value'` | Custom request header (repeatable) |
| `-d DATA` | Request body (auto-detects JSON) |
| `-F key=value` | Form data (sets `application/x-www-form-urlencoded`) |
| `-u user:pass` | Basic authentication |
| `-L` | Follow redirects |
| `--max-redirs N` | Max redirects to follow (default: 10) |
| `-o FILE` | Save response body to file |
| `-i` | Show response headers |
| `-v` | Verbose mode (request + response details) |
| `--no-pretty` | Disable JSON pretty-printing |
| `--timeout N` | Request timeout in seconds (default: 30) |

## Requirements

- Python 3.8+
- No external packages needed (uses stdlib only)

## Usage

```bash
# Simple GET
python curly.py https://httpbin.org/get

# POST with JSON body
python curly.py -X POST -d '{"name":"curly","cool":true}' https://httpbin.org/post

# Custom headers
python curly.py -H "Accept: application/json" -H "X-Token: secret" https://httpbin.org/headers

# Basic auth
python curly.py -u admin:password https://httpbin.org/basic-auth/admin/password

# Follow redirects verbosely
python curly.py -L -v https://httpbin.org/redirect/3

# Save to file
python curly.py -o output.json https://httpbin.org/json

# Show response headers
python curly.py -i https://httpbin.org/get

# Form data
python curly.py -F username=john -F password=secret https://httpbin.org/post
```

## Optional: Make it a global command

**Windows (PowerShell):**
```powershell
# Create a curly.bat in a folder that's in your PATH
echo '@python "%~dp0curly.py" %*' > curly.bat
```

**macOS / Linux:**
```bash
chmod +x curly.py
sudo ln -s $(pwd)/curly.py /usr/local/bin/curly
```

## License

MIT © [Micha1lyu](https://github.com/Micha1lyu)
