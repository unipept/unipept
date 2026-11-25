import type { Ref } from "vue";
import { useRouter } from "vue-router";
import { useEventListener } from "@vueuse/core";
import { copyableText, docsLinkTarget } from "@/logic/docs/DocsContent";

/** How long the copy button shows whether it copied, in milliseconds. */
const feedbackDuration = 2000;

/**
 * Makes the rendered Markdown in `root` work: the copy buttons of code blocks, the tabs of code groups, and links
 * to other pages of the app, which go through the router instead of reloading the app.
 */
export default function useDocsContent(root: Ref<HTMLElement | undefined>) {
    const router = useRouter();

    const copy = (button: HTMLElement) => {
        const block = button.parentElement;
        const code = block?.querySelector("pre")?.textContent;
        if (!block || code == null) {
            return;
        }
        const feedback = (state: "copied" | "failed") => {
            button.classList.add(state);
            setTimeout(() => button.classList.remove(state), feedbackDuration);
        };
        navigator.clipboard.writeText(copyableText(block.className, code))
            .then(() => feedback("copied"), () => feedback("failed"));
    };

    const follow = (event: MouseEvent, link: HTMLAnchorElement) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
            || link.target || link.hasAttribute("download")) {
            return;
        }
        const path = docsLinkTarget(new URL(link.href), window.location.origin, import.meta.env.BASE_URL);
        if (path !== undefined && router.resolve(path).matched.length > 0) {
            event.preventDefault();
            router.push(path);
        }
    };

    useEventListener(root, "click", (event: MouseEvent) => {
        const target = event.target as Element;
        const button = target.closest<HTMLElement>("button.copy");
        const link = target.closest<HTMLAnchorElement>("a[href]");
        if (button) {
            copy(button);
        } else if (link) {
            follow(event, link);
        }
    });

    useEventListener(root, "change", (event: Event) => {
        const input = event.target as HTMLInputElement;
        const group = input.closest(".vp-code-group");
        if (!group) {
            return;
        }
        const index = [...group.querySelectorAll(".tabs input")].indexOf(input);
        [...group.querySelector(".blocks")?.children ?? []].forEach((block, i) => block.classList.toggle("active", i === index));
    });
}
