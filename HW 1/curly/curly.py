#!/usr/bin/env python3
"""
curly - A curl-like HTTP client written in Python
GitHub: https://github.com/Micha1lyu/curly
"""

import argparse
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from base64 import b64encode


VERSION = "1.0.0"
BANNER = r"""
   ____  __  __  ____  __     _  _
  / ___|  \/  |/ ___||  |   \ \/ /
 | |   | |\/| |\___ \|  |    \  /
 | |___| |  | | ___) |  |___ /  \
  \____|_|  |_||____/|_____/_/\_\
  
  curly v{ver} - A curl-like HTTP client
  github.com/Micha1lyu/curly
""".format(ver=VERSION)


COLORS = {
    "reset":   "\033[0m",
    "bold":    "\033[1m",
    "dim":     "\033[2m",
    "cyan":    "\033[36m",
    "green":   "\033[32m",
    "yellow":  "\033[33m",
    "red":     "\033[31m",
    "magenta": "\033[35m",
    "blue":    "\033[34m",
    "white":   "\033[97m",
}


def c(color: str, text: str) -> str:
    """Wrap text in ANSI color codes."""
    try:
        return f"{COLORS[color]}{text}{COLORS['reset']}"
    except KeyError:
        return text


def status_color(code: int) -> str:
    if 200 <= code < 300:
        return c("green", str(code))
    elif 300 <= code < 400:
        return c("yellow", str(code))
    elif 400 <= code < 500:
        return c("red", str(code))
    elif 500 <= code < 600:
        return c("magenta", str(code))
    return str(code)


def parse_header(header_str: str) -> tuple:
    """Parse 'Key: Value' header string."""
    parts = header_str.split(":", 1)
    if len(parts) != 2:
        print(c("red", f"[!] Invalid header format: '{header_str}' (expected 'Key: Value')"))
        sys.exit(1)
    return parts[0].strip(), parts[1].strip()


def pretty_json(text: str) -> str:
    """Try to pretty-print JSON, fall back to raw text."""
    try:
        parsed = json.loads(text)
        return json.dumps(parsed, indent=2, ensure_ascii=False)
    except (json.JSONDecodeError, ValueError):
        return text


def build_request(url, method, headers, data, auth, form):
    """Construct a urllib Request object."""
    body = None

    # Basic auth
    if auth:
        encoded = b64encode(auth.encode()).decode()
        headers["Authorization"] = f"Basic {encoded}"

    # Form data (-F key=value)
    if form:
        form_data = urllib.parse.urlencode({
            k: v for item in form for k, v in [item.split("=", 1)]
        })
        body = form_data.encode()
        headers.setdefault("Content-Type", "application/x-www-form-urlencoded")

    # Raw body data (-d)
    elif data:
        stripped = data.strip()
        if stripped.startswith("{") or stripped.startswith("["):
            headers.setdefault("Content-Type", "application/json")
        body = data.encode()

    req = urllib.request.Request(url, data=body, headers=headers, method=method.upper())
    return req


def send_request(req, follow_redirects, max_redirects, verbose, timeout):
    """Send request and return (response, elapsed_seconds)."""
    if not follow_redirects:
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, req, fp, code, msg, headers, newurl):
                return None
        opener = urllib.request.build_opener(NoRedirect, urllib.request.HTTPSHandler())
    else:
        opener = urllib.request.build_opener(urllib.request.HTTPSHandler())

    if verbose:
        print(c("dim", f"\n> {req.get_method()} {req.full_url}"))
        for k, v in req.headers.items():
            print(c("dim", f"> {k}: {v}"))
        print()

    start = time.time()
    try:
        response = opener.open(req, timeout=timeout)
    except urllib.error.HTTPError as e:
        response = e
    except urllib.error.URLError as e:
        print(c("red", f"\n[x] Connection error: {e.reason}"))
        sys.exit(1)

    elapsed = time.time() - start
    return response, elapsed


def print_response(response, show_headers, verbose, output_file, pretty):
    """Print the HTTP response."""
    status = response.status if hasattr(response, "status") else response.code
    reason = response.reason if hasattr(response, "reason") else ""
    headers = response.headers

    print(c("bold", f"\n< HTTP/1.1 {status_color(status)} {reason}"))

    if show_headers or verbose:
        for key, val in headers.items():
            print(c("cyan", f"< {key}: {val}"))
        print()

    raw_body = response.read().decode("utf-8", errors="replace")

    if output_file:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(raw_body)
        print(c("green", f"[OK] Saved to: {output_file}"))
    else:
        body = pretty_json(raw_body) if pretty else raw_body
        print(body)


def main():
    # Enable ANSI colors on Windows
    if sys.platform == "win32":
        import os
        os.system("")

    parser = argparse.ArgumentParser(
        prog="curly",
        description="curly -- A curl-like HTTP client",
        formatter_class=argparse.RawTextHelpFormatter,
        epilog=(
            "Examples:\n"
            "  curly https://httpbin.org/get\n"
            "  curly -X POST -d '{\"name\":\"curly\"}' https://httpbin.org/post\n"
            "  curly -H 'Accept: application/json' -v https://httpbin.org/headers\n"
            "  curly -u user:pass https://httpbin.org/basic-auth/user/pass\n"
            "  curly -L https://httpbin.org/redirect/3\n"
            "  curly -o result.json https://httpbin.org/json\n"
        ),
    )

    parser.add_argument("url", help="Target URL")
    parser.add_argument("-X", "--method", default="GET", metavar="METHOD",
                        help="HTTP method (default: GET)")
    parser.add_argument("-H", "--header", action="append", default=[], metavar="'Key: Value'",
                        help="Add request header (repeatable)")
    parser.add_argument("-d", "--data", metavar="DATA",
                        help="Request body (JSON string or raw text)")
    parser.add_argument("-F", "--form", action="append", default=[], metavar="key=value",
                        help="Form field (repeatable)")
    parser.add_argument("-u", "--user", metavar="user:pass",
                        help="Basic authentication credentials")
    parser.add_argument("-L", "--location", action="store_true",
                        help="Follow redirects")
    parser.add_argument("--max-redirs", type=int, default=10, metavar="N",
                        help="Maximum redirects to follow (default: 10)")
    parser.add_argument("-o", "--output", metavar="FILE",
                        help="Write response body to file")
    parser.add_argument("-i", "--include", action="store_true",
                        help="Include response headers in output")
    parser.add_argument("-v", "--verbose", action="store_true",
                        help="Verbose mode (request + response details)")
    parser.add_argument("--no-pretty", action="store_true",
                        help="Disable JSON pretty-printing")
    parser.add_argument("--timeout", type=float, default=30.0, metavar="SECONDS",
                        help="Request timeout in seconds (default: 30)")
    parser.add_argument("--version", action="version", version=f"curly {VERSION}")

    args = parser.parse_args()

    # Auto POST if -d given with no explicit method
    method = args.method
    if args.data and method == "GET":
        method = "POST"

    # Build headers dict
    headers = {}
    headers["User-Agent"] = f"curly/{VERSION} (github.com/Micha1lyu/curly)"
    for h in args.header:
        k, v = parse_header(h)
        headers[k] = v

    if args.verbose:
        print(BANNER)

    req = build_request(
        url=args.url,
        method=method,
        headers=headers,
        data=args.data,
        auth=args.user,
        form=args.form or None,
    )

    response, elapsed = send_request(
        req=req,
        follow_redirects=args.location,
        max_redirects=args.max_redirs,
        verbose=args.verbose,
        timeout=args.timeout,
    )

    print_response(
        response=response,
        show_headers=args.include,
        verbose=args.verbose,
        output_file=args.output,
        pretty=not args.no_pretty,
    )

    print(c("dim", f"\n  {elapsed*1000:.1f}ms"))


if __name__ == "__main__":
    main()
