import { inject, provide, ref, type InjectionKey, type Ref } from "vue";
import { useMediaQuery } from "@vueuse/core";

/** The request panel of an API page, which is a drawer on a narrow screen. */
export interface RequestPanel {
    /** Whether the drawer is open. */
    open: Ref<boolean>;
    close: () => void;
    /** Whether the panel is a drawer: below 1488 px, the breakpoint in ApiReference.vue and DocsLayout.vue. */
    isDrawer: Ref<boolean>;
    /** The panel, which ApiReference registers. */
    element: Ref<HTMLElement | undefined>;
}

const requestPanelKey: InjectionKey<RequestPanel> = Symbol("docs request panel");

/** Provides the request panel to the page, for the docs layout, which closes it with `close`. */
export function provideRequestPanel(close: () => void): RequestPanel {
    const panel: RequestPanel = {
        open: ref(false),
        close,
        isDrawer: useMediaQuery("(max-width: 1487.98px)"),
        element: ref()
    };
    provide(requestPanelKey, panel);
    return panel;
}

/** The request panel of the docs layout. Outside the docs layout, it is never a drawer. */
export function useRequestPanel(): RequestPanel {
    return inject(requestPanelKey, () => {
        const open = ref(false);
        return { open, close: () => { open.value = false; }, isDrawer: ref(false), element: ref() };
    }, true);
}
