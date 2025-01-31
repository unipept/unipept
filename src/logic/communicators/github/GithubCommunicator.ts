export interface GithubRelease {
    tag_name: string,
    published_at: string,
    html_url: string,
    prerelease: boolean,
    body: string
}

export const defaultGithubRelease = {
    tag_name: "",
    published_at: "",
    html_url: "",
    prerelease: false,
    body: ""
};

export class GithubCommunicator {
    public async releases(url: string, per_page = 100): Promise<GithubRelease[]> {
        return await fetch(`${url}?per_page=${per_page}`).then(r => r.json()).catch(() => []);
    }

    public async latestRelease(url: string): Promise<GithubRelease> {
        return await fetch(`${url}/latest`).then(r => {
            if (!r.ok) {
                return defaultGithubRelease;
            }

            return r.json()
        });
    }
}
