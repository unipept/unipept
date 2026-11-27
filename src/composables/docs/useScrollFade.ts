import { computed, type MaybeRefOrGetter, type Ref } from "vue";
import { useResizeObserver, useScroll } from "@vueuse/core";

/**
 * Classes for an element that scrolls without a scrollbar (`docs-scroll-fade` in docs.css): the top or bottom edge
 * fades out while there is more content past that edge. Call `update` when the content changes size.
 */
export default function useScrollFade(element: MaybeRefOrGetter<HTMLElement | null | undefined>): {
    classes: Ref<Record<string, boolean>>;
    update: () => void;
} {
    const { arrivedState, measure } = useScroll(element, { offset: { top: 2, bottom: 2 } });
    useResizeObserver(element, () => measure());

    const classes = computed(() => ({
        "docs-scroll-fade": true,
        "docs-scroll-fade--top": !arrivedState.top,
        "docs-scroll-fade--bottom": !arrivedState.bottom
    }));

    return { classes, update: measure };
}
