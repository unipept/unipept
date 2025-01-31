import {IconProps, IconSet} from "vuetify";
import {h} from "vue";

const unipeptIconsAliases = {
    fileLightningOutline: 'unipept-file-lightning-outline'
}

const unipeptIcons: IconSet = {
    component: (props: IconProps) => h('i', {
        class: `unipept-icons unipept-icon-${props.icon}`,
    })
}

export { unipeptIconsAliases, unipeptIcons }
