const base = "https://api.unipept.ugent.be/api/v2/";
const privateBase = "https://api.unipept.ugent.be/private_api/"

export default class UnipeptCommunicator {
    public async pept2prot(input: string[], equate_il = true, extra = false): Promise<string[]> {
        const params = new URLSearchParams({
            equate_il: equate_il.toString(),
            extra: extra.toString()
        });

        for(const inp of input) {
            params.append("input[]", inp);
        }

        return await fetch(this.prepareURL(base, "pept2prot.json", params)).then(r => r.json());
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

        return await fetch(this.prepareURL(base, "pept2taxa.json", params)).then(r => r.json());
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

        return await fetch(this.prepareURL(base, "pept2lca.json", params)).then(r => r.json());
    }

    public async pept2ec(input: string[], equate_il = true, extra = false): Promise<string[]> {
        const params = new URLSearchParams({
            equate_il: equate_il.toString(),
            extra: extra.toString()
        });

        for(const inp of input) {
            params.append("input[]", inp);
        }

        return await fetch(this.prepareURL(base, "pept2ec.json", params)).then(r => r.json());
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

        return await fetch(this.prepareURL(base, "pept2go.json", params)).then(r => r.json());
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

        return await fetch(this.prepareURL(base, "pept2interpro.json", params)).then(r => r.json());
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

        return await fetch(this.prepareURL(base, "pept2funct.json", params)).then(r => r.json());
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

        return await fetch(this.prepareURL(base, "peptinfo.json", params)).then(r => r.json());
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

        return await fetch(this.prepareURL(base, "protinfo.json", params)).then(r => r.json());
    }

    public async taxa2lca(input: string[], extra = false, names = false): Promise<string[]> {
        const params = new URLSearchParams({
            extra: extra.toString(),
            names: names.toString()
        });

        for(const inp of input) {
            params.append("input[]", inp);
        }

        return await fetch(this.prepareURL(base, "taxa2lca.json", params)).then(r => r.json());
    }

    public async taxa2tree(input: string[], link = false): Promise<string[]> {
        const params = new URLSearchParams({
            link: link.toString()
        });

        for(const inp of input) {
            params.append("input[]", inp);
        }

        return await fetch(this.prepareURL(base, "taxa2tree.json", params)).then(r => r.json());
    }

    public async taxa2treeCounts(counts: Record<string, number>, link = false): Promise<string[]> {
        return await fetch(base + "taxa2tree.json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ counts, link })
        }).then(r => r.json());
    }

    public async taxonomy(input: string[], extra = false, names = false): Promise<string[]> {
        const params = new URLSearchParams({
            extra: extra.toString(),
            names: names.toString()
        });

        for(const inp of input) {
            params.append("input[]", inp);
        }

        return await fetch(this.prepareURL(base, "taxonomy.json", params)).then(r => r.json());
    }

    public async uniprotVersion(): Promise<string> {
        const response = await fetch(this.prepareURL(privateBase, "metadata", new URLSearchParams())).then(r => r.json());
        return response.db_version;
    }

    private prepareURL(base: string, extra: string, parameters: URLSearchParams): string {
        return base + extra + "?" + parameters;
    }
}
