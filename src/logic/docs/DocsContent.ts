const sessionLanguage = /\blanguage-(console|shellsession)\b/;

/**
 * Text that the copy button of a code block copies. For a terminal session (`console`), this is only the commands,
 * without the `$ ` prompt. A session without prompts is copied whole.
 *
 * @param className Class of the code block, such as `language-console`.
 */
export function copyableText(className: string, text: string): string {
    const code = text.replace(/\n$/, "");
    if (!sessionLanguage.test(className)) {
        return code;
    }
    const commands = code.split("\n").filter(line => line.startsWith("$ ")).map(line => line.slice(2));
    return commands.length > 0 ? commands.join("\n") : code;
}

/**
 * Router path for a link in a docs page, or undefined if the browser should follow the link itself: a link to
 * another site, or to a path outside the app's base.
 */
export function docsLinkTarget(url: URL, origin: string, base: string): string | undefined {
    const root = base.endsWith("/") ? base : `${base}/`;
    if (url.origin !== origin || !(url.pathname + "/").startsWith(root)) {
        return undefined;
    }
    return "/" + url.pathname.slice(root.length) + url.search + url.hash;
}
