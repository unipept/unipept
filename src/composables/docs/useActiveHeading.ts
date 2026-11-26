import { onMounted, ref, watch, type Ref } from "vue";
import { useEventListener } from "@vueuse/core";
import { activeHeading } from "@/logic/docs/DocsHeadings";

/**
 * The slug of the heading that the reader is at, out of `slugs`, updated on scroll. A heading counts as reached at
 * its `scroll-margin-top`, where a link to it scrolls to.
 */
export default function useActiveHeading(slugs: Ref<string[]>) {
    const active = ref<string>();
    let frame = 0;

    const update = () => {
        frame = 0;
        const tops = slugs.value.map(slug => {
            const heading = document.getElementById(slug);
            return heading
                ? heading.getBoundingClientRect().top - (parseFloat(getComputedStyle(heading).scrollMarginTop) || 0)
                : Infinity;
        });
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
        // One pixel of slack for rounding after a scroll to the heading.
        const index = activeHeading(tops, 1, atBottom);
        active.value = index < 0 ? undefined : slugs.value[index];
    };

    const schedule = () => {
        frame ||= requestAnimationFrame(update);
    };

    useEventListener("scroll", schedule, { passive: true });
    useEventListener("resize", schedule, { passive: true });
    onMounted(schedule);
    watch(slugs, schedule);

    return active;
}
