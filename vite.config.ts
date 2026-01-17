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
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp"
        }
    },
    test: {
        exclude: [...configDefaults.exclude, 'tests/e2e/**']
    }
})
