export async function copyText(text, clipboard = navigator.clipboard) {
  await clipboard.writeText(text);
}

export function downloadSnapshot(
  snapshot,
  env = { document, URL, Blob, setTimeout: (callback, delay) => globalThis.setTimeout(callback, delay) },
) {
  const content = JSON.stringify(
    { ...snapshot, exportedAt: new Date().toISOString() },
    null,
    2,
  );
  const url = env.URL.createObjectURL(
    new env.Blob([content], { type: "application/json" }),
  );
  const link = env.document.createElement("a");
  try {
    link.href = url;
    link.download = `cratemate-${new Date().toISOString().slice(0, 10)}.json`;
    env.document.body.appendChild(link);
    link.click();
  } finally {
    link.remove();
    env.setTimeout(() => env.URL.revokeObjectURL(url), 1000);
  }
}
