import assert from "node:assert/strict";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

// Render each branch using a test-only transform; application source stays unchanged.
const cases = [
  ["crate", false, "Discovery"],
  ["crate", true, "<form"],
  ["mixer", false, "DECK A"],
  ["hardware", false, "第一軸向低頻駐波頻率"],
  ["blueprint", false, "CrateMateSerializer"],
];

for (const [tab, showForm, expected] of cases) {
  const server = await createServer({
    cacheDir: "node_modules/.vite-smoke",
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false, watch: null },
    plugins: [
      {
        name: "smoke-initial-state",
        enforce: "pre",
        transform(code, id) {
          if (!id.replaceAll("\\", "/").endsWith("/src/App.jsx")) return;
          return code
            .replace(/useState\(['"]crate['"]\)/, `useState('${tab}')`)
            .replace(
              /const \[showAddModal, setShowAddModal\] = useState\(false\)/,
              `const [showAddModal, setShowAddModal] = useState(${showForm})`,
            );
        },
      },
    ],
  });
  try {
    const { default: App } = await server.ssrLoadModule("/src/App.jsx");
    const html = renderToString(createElement(App));
    assert.ok(html.includes(expected), `Missing content: ${expected}`);
    if (tab === "crate")
      assert.equal((html.match(/載入 Deck A/g) || []).length, 6);
    console.log(`PASS ${tab}${showForm ? " + add form" : ""}`);
  } finally {
    await server.close();
  }
}
