export default class NetworkUtils {
    /**
     * Fetches a URL and returns the parsed (JSON) body. Throws if the response is not OK.
     *
     * @param url The url to fetch.
     * @return A promise containing the parsed response data.
     */
    public static async getJSON(url: string): Promise<any> {
        const response = await fetch(url);
        NetworkUtils.checkResponse(response, url);
        return response.json();
    }

    /**
     * Fetches a URL and returns its body as plain text. Throws if the response is not OK.
     *
     * @param url The url to fetch.
     * @return A promise containing the response body as a string.
     */
    public static async getText(url: string): Promise<string> {
        const response = await fetch(url);
        NetworkUtils.checkResponse(response, url);
        return response.text();
    }

    /**
     * Posts data to a URL as JSON and returns a promise containing the parsed (JSON) response. Throws if the
     * response is not OK.
     *
     * @param url The url to which we want to send the request.
     * @param data The data to post in JSON format.
     * @return A promise containing the parsed response data.
     */
    public static async postJSON(url: string, data: any): Promise<any> {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: data
        });
        NetworkUtils.checkResponse(response, url);
        return response.json();
    }

    /**
     * This method should be used when a specific URL should be opened in a new browser window or tab.
     *
     * @param url The full url to which navigation should take place.
     */
    public static openInBrowser(url: string): void {
        window.open(url);
    }

    private static checkResponse(response: Response, url: string): void {
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status} ${response.statusText} (${url})`);
        }
    }
}
