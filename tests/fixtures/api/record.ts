// Fetches the API responses that the unit tests use and saves them in this folder.
// Run with `yarn test:record`. The requests must match the ones that the communicator specs check.
import { writeFile } from "node:fs/promises";

const API = "https://api.unipept.ugent.be";

type Recording = { file: string; url: string; body?: unknown };

const recordings: Recording[] = [
    {
        file: "pept2lca.json",
        url: `${API}/api/v2/pept2lca.json?equate_il=true&extra=false&names=false&input[]=AALTER&input[]=MDGTEYIIVK`,
    },
    {
        file: "taxa2tree.json",
        url: `${API}/api/v2/taxa2tree.json`,
        body: { counts: { "1678": 2, "816": 1 }, link: false },
    },
    {
        file: "taxa2rank.json",
        url: `${API}/private_api/taxa2rank.json?`,
        body: { taxa: [[1678, 816]], rank: "genus" },
    },
    {
        file: "metadata.json",
        url: `${API}/private_api/metadata?`,
    },
    {
        file: "ecnumbers.json",
        url: `${API}/private_api/ecnumbers`,
        body: { ecnumbers: ["1.1.1.1", "2.7.11.1"] },
    },
    {
        file: "goterms.json",
        url: `${API}/private_api/goterms`,
        body: { goterms: ["GO:0005737", "GO:0016301"] },
    },
    {
        file: "interpros.json",
        url: `${API}/private_api/interpros`,
        body: { interpros: ["IPR000719", "IPR011009"] },
    },
    {
        file: "taxa.json",
        url: `${API}/private_api/taxa`,
        body: { taxids: [1678, 816] },
    },
    {
        file: "taxa-count.json",
        url: `${API}/private_api/taxa/count`,
        body: { filter: "bacteroides" },
    },
    {
        file: "taxa-filter.json",
        url: `${API}/private_api/taxa/filter`,
        body: { filter: "bacteroides", start: 0, end: 3, sort_by: "id", sort_descending: false },
    },
    {
        file: "taxonomy.json",
        url: `${API}/api/v2/taxonomy`,
        body: { input: [1680], descendants: true },
    },
];

for (const { file, url, body } of recordings) {
    const response = await fetch(url, body === undefined ? undefined : {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText} for ${url}`);
    }
    const data = await response.json();
    await writeFile(new URL(file, import.meta.url), JSON.stringify(data, null, 2) + "\n");
    console.log(`saved ${file}`);
}
