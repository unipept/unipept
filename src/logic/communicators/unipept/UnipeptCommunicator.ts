import NetworkUtils from "@/logic/communicators/NetworkUtils";
import { DEFAULT_API_BASE_URL } from "@/logic/Constants";

const base = `${DEFAULT_API_BASE_URL}/api/v2/`;
const privateBase = `${DEFAULT_API_BASE_URL}/private_api/`;

export default class UnipeptCommunicator {
    public async pept2prot(input: string[], equate_il = true, extra = false): Promise<string[]> {
        const params = new URLSearchParams({
            equate_il: equate_il.toString(),
            extra: extra.toString()
        });

        for(const inp of input) {
            params.append("input[]", inp);
        }

        return await NetworkUtils.getJSON(this.prepareURL(base, "pept2prot.json", params));
    }

    public async pept2taxa(input: string[], equate_il = true, extra = false, names = false): Promise<string[]> {
        const params = new URLSearchParams({
            equate_il: equate_il.toString(),
            extra: extra.toString(),
            names: names.toString()
        });

        for(const inp of input) {
            params.append("input[]", inp);
        }

        return await NetworkUtils.getJSON(this.prepareURL(base, "pept2taxa.json", params));
    }

    public async pept2lca(input: string[], equate_il = true, extra = false, names = false): Promise<string[]> {
        const params = new URLSearchParams({
            equate_il: equate_il.toString(),
            extra: extra.toString(),
            names: names.toString()
        });

        for(const inp of input) {
            params.append("input[]", inp);
        }

        return await NetworkUtils.getJSON(this.prepareURL(base, "pept2lca.json", params));
    }

    public async pept2ec(input: string[], equate_il = true, extra = false): Promise<string[]> {
        const params = new URLSearchParams({
            equate_il: equate_il.toString(),
            extra: extra.toString()
        });

        for(const inp of input) {
            params.append("input[]", inp);
        }

        return await NetworkUtils.getJSON(this.prepareURL(base, "pept2ec.json", params));
    }

    public async pept2go(input: string[], equate_il = true, extra = false, domains = false): Promise<string[]> {
        const params = new URLSearchParams({
            equate_il: equate_il.toString(),
            extra: extra.toString(),
            domains: domains.toString()
        });

        for(const inp of input) {
            params.append("input[]", inp);
        }

        return await NetworkUtils.getJSON(this.prepareURL(base, "pept2go.json", params));
    }

    public async pept2interpro(input: string[], equate_il = true, extra = false, domains = false): Promise<string[]> {
        const params = new URLSearchParams({
            equate_il: equate_il.toString(),
            extra: extra.toString(),
            domains: domains.toString()
        });

        for(const inp of input) {
            params.append("input[]", inp);
        }

        return await NetworkUtils.getJSON(this.prepareURL(base, "pept2interpro.json", params));
    }

    public async pept2funct(input: string[], equate_il = true, extra = false, domains = false): Promise<string[]> {
        const params = new URLSearchParams({
            equate_il: equate_il.toString(),
            extra: extra.toString(),
            domains: domains.toString()
        });

        for(const inp of input) {
            params.append("input[]", inp);
        }

        return await NetworkUtils.getJSON(this.prepareURL(base, "pept2funct.json", params));
    }

    public async peptinfo(input: string[], equate_il = true, extra = false, domains = false, names = false): Promise<string[]> {
        const params = new URLSearchParams({
            equate_il: equate_il.toString(),
            extra: extra.toString(),
            domains: domains.toString(),
            names: names.toString()
        });

        for(const inp of input) {
            params.append("input[]", inp);
        }

        return await NetworkUtils.getJSON(this.prepareURL(base, "peptinfo.json", params));
    }

    public async protinfo(input: string[], extra = false, domains = false, names = false): Promise<string[]> {
        const params = new URLSearchParams({
            extra: extra.toString(),
            domains: domains.toString(),
            names: names.toString()
        });

        for(const inp of input) {
            params.append("input[]", inp);
        }

        return await NetworkUtils.getJSON(this.prepareURL(base, "protinfo.json", params));
    }

    public async taxa2lca(input: string[], extra = false, names = false): Promise<string[]> {
        const params = new URLSearchParams({
            extra: extra.toString(),
            names: names.toString()
        });

        for(const inp of input) {
            params.append("input[]", inp);
        }

        return await NetworkUtils.getJSON(this.prepareURL(base, "taxa2lca.json", params));
    }

    public async taxa2tree(input: string[], link = false): Promise<string[]> {
        const params = new URLSearchParams({
            link: link.toString()
        });

        for(const inp of input) {
            params.append("input[]", inp);
        }

        return await NetworkUtils.getJSON(this.prepareURL(base, "taxa2tree.json", params));
    }

    public async taxa2treeCounts(counts: Record<string, number>, link = false): Promise<string[]> {
        return await NetworkUtils.postJSON(base + "taxa2tree.json", JSON.stringify({ counts, link }));
    }

    public async taxa2rank(taxa: number[][], rank: string): Promise<number[][]> {
        const response = await NetworkUtils.postJSON(
            this.prepareURL(privateBase, "taxa2rank.json", new URLSearchParams()),
            JSON.stringify({ taxa, rank })
        );

        return response.mapped_taxa;
    }

    public async taxonomy(input: string[], extra = false, names = false): Promise<string[]> {
        const params = new URLSearchParams({
            extra: extra.toString(),
            names: names.toString()
        });

        for(const inp of input) {
            params.append("input[]", inp);
        }

        return await NetworkUtils.getJSON(this.prepareURL(base, "taxonomy.json", params));
    }

    public async uniprotVersion(): Promise<string> {
        const response = await NetworkUtils.getJSON(this.prepareURL(privateBase, "metadata", new URLSearchParams()));
        return response.db_version;
    }

    private prepareURL(base: string, extra: string, parameters: URLSearchParams): string {
        return base + extra + "?" + parameters;
    }
}
