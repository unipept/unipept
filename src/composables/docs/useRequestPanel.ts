import { inject, provide, ref, type InjectionKey, type Ref } from "vue";

/** The request panel of an API page, which is a drawer below 1488 px. */
export interface RequestPanel {
    /** Whether the drawer is open. */
    open: Ref<boolean>;
    close: () => void;
    /** The panel, which ApiReference registers. */
    element: Ref<HTMLElement | undefined>;
}

const requestPanelKey: InjectionKey<RequestPanel> = Symbol("docs request panel");

/** Provides the request panel to the page, for the docs layout, which closes it with `close`. */
export function provideRequestPanel(close: () => void): RequestPanel {
    const panel: RequestPanel = {
        open: ref(false),
        close,
        element: ref()
    };
    provide(requestPanelKey, panel);
    return panel;
}

/** The request panel of the docs layout. Outside the docs layout, the drawer never opens. */
export function useRequestPanel(): RequestPanel {
    return inject(requestPanelKey, () => {
        const open = ref(false);
        return { open, close: () => { open.value = false; }, element: ref() };
    }, true);
}
