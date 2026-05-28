import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

// Multi-page setup. Each HTML file at these locations is built as its own
// entry, mirroring the existing site structure so URLs stay stable:
//   /                  → index.html
//   /brief/            → brief/index.html
//   /privacy-policy/   → privacy-policy/index.html
export default defineConfig({
    appType: "mpa",
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(root, "index.html"),
                brief: resolve(root, "brief/index.html"),
                privacy: resolve(root, "privacy-policy/index.html"),
            },
        },
    },
});
