declare module "*.md" {
    import type { DefineComponent } from "vue";

    export interface MarkdownHeader {
        level: number;
        title: string;
        slug: string;
        link: string;
        children: MarkdownHeader[];
    }

    export const frontmatter: Record<string, unknown>;
    export const headers: MarkdownHeader[];
    export const title: string;

    const component: DefineComponent;
    export default component;
}
