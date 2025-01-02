/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "@/styles/main.scss";

// Composables
import {createVuetify, IconProps} from "vuetify"
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'

// Icons
import { aliases, custom } from './custom_icons'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
    theme: {
        variations: {
            colors: ['primary'],
            lighten: 5,
            darken: 5
        },
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
    },
    icons: {
        defaultSet: 'mdi',
        sets: {
            custom
        },
        aliases
    },
    components: {
        ...components,
        ...labsComponents
    }
})
