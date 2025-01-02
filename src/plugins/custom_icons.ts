import {IconProps} from "vuetify";
import {h} from "vue";

import fileLightningOutlineSvg from '@/assets/icons/file-lightning-outline.svg?raw';

const aliases: IconAliases = {
    fileLightningOutline: 'file-lightning-outline'
}

const custom: IconSet = {
    component: (props: IconProps) => {
        console.log(props);
        return h(props.tag, {
            ...props,
            innerHTML: fileLightningOutlineSvg,
        });
    }
}

export { aliases, custom }
