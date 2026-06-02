/// <reference types="vitest/config" />

// Plugins
import vue from "@vitejs/plugin-vue"
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify"

// Utilities
import { defineConfig, configDefaults } from "vitest/config"
import { fileURLToPath, URL } from "node:url"

// If the app is being deployed by GitHub Actions, we need to set the base URL to /unipept.
const baseURL = process.env.CI ? "/unipept" : "/";

// https://vitejs.dev/config/
export default defineConfig({
    envPrefix: ['VITE_', 'MAX_PEPTONIZER_'],
    base: baseURL,
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern"
            }
        }
    },
    plugins: [
        vue({
            template: { transformAssetUrls }
        }),
        // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
        vuetify({
            autoImport: true,
            styles: {
                configFile: "./src/styles/settings.scss"
            }
        }),
    ],
    define: {
        "process.env": {},
        APP_VERSION: JSON.stringify(process.env.npm_package_version)
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url))
        },
        extensions: [
            ".js",
            ".json",
            ".jsx",
            ".mjs",
            ".ts",
            ".tsx",
            ".vue",
        ],
    },
    server: {
        port: 3000,
        // Prevents Vite 8 from eagerly warming up virtual Vuetify SASS modules
        // before vite-plugin-vuetify has populated its tempFiles map, which
        // causes spurious "Pre-transform error" warnings on startup.
        preTransformRequests: false,
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp"
        }
    },
    preview: {
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp"
        }
    },
    build: {
        chunkSizeWarningLimit: 1000,
        rolldownOptions: {
            // Suppress INVALID_ANNOTATION warnings from @vueuse/core — the library places
            // /* #__PURE__ */ comments in positions that Rolldown does not support; this is
            // a known upstream issue and does not affect runtime behaviour.
            onwarn(warning, warn) {
                if (warning.code === 'INVALID_ANNOTATION') return;
                warn(warning);
            },
            output: {
                // Keep Vue runtime and vueuse in the same vendor chunk to avoid a
                // Rolldown cross-chunk init ordering bug where init_runtime_dom_esm_bundler
                // is called in a lazy chunk before it is defined.
                manualChunks: (id: string) => {
                    if (
                        id.includes('/node_modules/vue/') ||
                        id.includes('/node_modules/@vue/') ||
                        id.includes('/node_modules/@vueuse/')
                    ) {
                        return 'vendor-vue';
                    }
                }
            }
        }
    },
    optimizeDeps: {
        exclude: ["vuetify"],
        include: [
            "d3",
            "localforage",
            "marked",
            "html-to-image"
        ]
    },
    test: {
        exclude: [...configDefaults.exclude, 'tests/e2e/**']
    }
})
