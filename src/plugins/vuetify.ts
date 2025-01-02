/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "@/styles/main.scss";
import "@/styles/unipept-icons.css";

// Composables
import {createVuetify} from "vuetify"
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'

// Icons
import { unipeptIconsAliases, unipeptIcons } from './unipept-icons'

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
            unipept: unipeptIcons
        },
        unipeptIconsAliases
    },
    components: {
        ...components,
        ...labsComponents
    }
})
