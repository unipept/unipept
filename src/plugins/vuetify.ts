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
import {VCard} from "vuetify/components/VCard";

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
    aliases: {
        VUnipeptCard: VCard
    },
    defaults: {
        VTooltip: {
            openDelay: 500,
            location: "bottom"
        },
        VDialog: {
            maxWidth: 1000
        },
        VUnipeptCard: {
            style: {
                borderRadius: '12px',
                padding: '4px',
                textAlign: 'left',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                background: 'white',
                display: 'flex',
                flexDirection: 'column'
            }
        }
    },
    icons: {
        defaultSet: 'mdi',
        sets: {
            unipept: unipeptIcons
        },
        // @ts-ignore (custom icons are not in the type provided by Vuetify)
        unipeptIconsAliases
    },
    components: {
        ...components,
        ...labsComponents
    }
})
