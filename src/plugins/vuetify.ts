/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "@/styles/main.scss";

// Composables
import { createVuetify } from "vuetify"

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
    theme: {
        themes: {
            light: {
                colors: {
                    primary: "#2196F3",
                    secondary: "#FFC107"
                },
            },
        },
    },
    defaults: {
        VTooltip: {
            openDelay: 500,
            location: "bottom"
        },
        VDialog: {
            maxWidth: 1000
        }
    }
})
