// Fake processors and stores for the specs of the analysis stores, which use web workers, IndexedDB and WASM.
// Each fake adds a line to `calls` when it runs. A step named in `failing` throws, and a step in `gates` waits until
// its gate is opened.
import { ref, shallowRef } from "vue";
import { ShareableMap } from "shared-memory-datastructures";
import CountTable from "@/logic/processors/CountTable";
import PeptideDataSerializer from "@/logic/ontology/peptides/PeptideDataSerializer";
import PeptideData from "@/logic/ontology/peptides/PeptideData";

export const calls: string[] = [];
export const failing = new Set<string>();
export const gates = new Map<string, Promise<void>>();
// Opens every gate that is still closed
const gateOpeners: (() => void)[] = [];
// Number of fake score processors created since the last reset
let scoreProcessorCount = 0;
// Peptide data that the fake pept2filtered returns
export const pept2filteredData = new Map<string, PeptideData>();
// Proteins that the fake protein processor returns
export const proteinsToReturn: { id: string, taxonId: number }[] = [];
// Ids of the fake analyses that were disposed
export const disposedAnalyses: string[] = [];

export function resetFakes() {
    calls.length = 0;
    failing.clear();
    // The analysis queue is shared by all tests, so a gate that a failed test left closed would block every later analysis
    gateOpeners.forEach(open => open());
    gateOpeners.length = 0;
    gates.clear();
    scoreProcessorCount = 0;
    pept2filteredData.clear();
    proteinsToReturn.length = 0;
    disposedAnalyses.length = 0;
}

// Returns a function that opens the gate: the step waits there until the function is called
export function gate(step: string): () => void {
    let open!: () => void;
    gates.set(step, new Promise<void>(resolve => open = resolve));
    gateOpeners.push(open);
    return open;
}

// Keys from a ShareableMap do not keep their insertion order, so lists are logged sorted
const byValue = (a: unknown, b: unknown) => (a as number) < (b as number) ? -1 : (a as number) > (b as number) ? 1 : 0;
const sorted = (value: unknown) => Array.isArray(value) ? [...value].sort(byValue) : value;

const run = async (step: string, ...args: unknown[]) => {
    calls.push(args.length > 0 ? `${step} ${JSON.stringify(args.map(sorted))}` : step);
    await gates.get(step);
    if (failing.has(step)) {
        throw new Error(`${step} failed`);
    }
};

const table = <K>(counts: [K, number][]) => {
    const map = new ShareableMap<K, number>();
    counts.forEach(([key, count]) => map.set(key, count));
    return new CountTable(map);
};

export const fakePept2filtered = () => {
    const peptideData = shallowRef();
    const crapFilteredPeptides = shallowRef<string[]>([]);
    return {
        peptideData,
        crapFilteredPeptides,
        process: async (peptides: string[], equate: boolean, useCrap: boolean, filter: unknown) => {
            await run("pept2filtered", peptides, equate, useCrap, filter ?? null);
            const data = new ShareableMap<string, PeptideData>({ serializer: new PeptideDataSerializer() });
            pept2filteredData.forEach((value, key) => data.set(key, value));
            peptideData.value = data;
        },
    };
};

export const fakeMetaData = () => {
    const databaseVersion = ref("");
    return {
        databaseVersion,
        process: async () => {
            await run("metadata");
            databaseVersion.value = "2026.04";
        },
    };
};

export const fakePeptideProcessor = () => {
    const countTable = shallowRef<CountTable<string>>();
    return {
        countTable,
        process: async (peptides: string[], equate: boolean, filter: boolean) => {
            await run("peptides", peptides, equate, filter);
            countTable.value = table(peptides.map(p => [p, 1]));
        },
    };
};

export const fakePeptideTrustProcessor = () => ({
    trust: shallowRef(),
    process: () => {
        calls.push("trust");
    },
});

// Labels the peptidesFunctions map of each functional processor, so that a score processor can tell which map it gets
const functionLabels = new WeakMap<object, string>();

const fakeFunctionalProcessor = (step: string) => () => {
    const peptidesFunctions = new Map<string, string[]>();
    functionLabels.set(peptidesFunctions, step);
    const countTable = shallowRef<CountTable<string>>();
    return {
        countTable,
        trust: shallowRef(),
        ecToPeptides: shallowRef(new Map()),
        goToPeptides: shallowRef(new Map()),
        iprToPeptides: shallowRef(new Map()),
        peptidesFunctions: shallowRef(peptidesFunctions),
        process: async (peptideCounts: CountTable<string>, _data: unknown, percentage: number) => {
            await run(step, [...peptideCounts.counts.keys()], percentage);
            countTable.value = table([]);
        },
    };
};

export const fakeEcProcessor = fakeFunctionalProcessor("ec");
export const fakeGoProcessor = fakeFunctionalProcessor("go");
export const fakeInterproProcessor = fakeFunctionalProcessor("ipr");

// Taxon 2 has the peptides AAAAA and CCCCC. Its child 816 has DDDDD.
export const fakeTaxonomicProcessor = () => {
    const countTable = shallowRef<CountTable<number>>();
    return {
        countTable,
        lcaToPeptides: shallowRef(new Map([[2, ["AAAAA", "CCCCC"]], [816, ["DDDDD"]]])),
        peptideToLca: shallowRef(new Map()),
        process: async () => {
            await run("lca");
            countTable.value = table([[2, 2], [816, 1]]);
        },
    };
};

export const fakeNcbiTreeProcessor = () => {
    const child = { id: 816, children: [] };
    const root = { id: 1, children: [{ id: 2, children: [child] }] };
    return {
        root: shallowRef(root),
        nodes: shallowRef(new Map<number, unknown>([[1, root], [2, root.children[0]], [816, child]])),
        process: (countTable: CountTable<number>) => {
            calls.push(`ncbiTree ${JSON.stringify([...countTable.counts.entries()].sort((a, b) => byValue(a[0], b[0])))}`);
        },
    };
};

// The store creates its score processors in the order EC, GO, InterPro. Each run checks this against the map it gets.
export const fakePeptonizerScoreProcessor = () => {
    const step = ["ecScores", "goScores", "iprScores"][scoreProcessorCount++ % 3];
    const loading = ref(false);
    return {
        scores: shallowRef(),
        loading,
        error: ref(),
        process: (peptidesFunctions: Map<string, string[]>) => {
            const label = `${functionLabels.get(peptidesFunctions)}Scores`;
            if (label !== step) {
                throw new Error(`The ${step} processor got the ${label} input`);
            }
            calls.push(step);
            loading.value = true;
        },
        cancel: () => {
            calls.push(`cancel ${step}`);
            loading.value = false;
        },
    };
};

export const fakeOntologyStore = () => ({
    getGoDefinition: () => undefined,
    updateEcOntology: async (codes: string[]) => run("ecOntology", codes),
    updateGoOntology: async (codes: string[]) => run("goOntology", codes),
    updateIprOntology: async (codes: string[]) => run("iprOntology", codes),
    updateNcbiOntology: async (ids: number[]) => run("ncbiOntology", ids),
});

export const fakeSubStore = (name: string) => () => ({
    exportStore: () => ({ store: name }),
    setImportedData: (data: unknown) => {
        calls.push(`${name} import ${JSON.stringify(data)}`);
    },
});

export const fakeProteinProcessor = () => {
    const proteins = shallowRef<{ id: string, taxonId: number }[]>([]);
    return {
        proteins,
        process: async (peptide: string, equate: boolean) => {
            await run("proteins", peptide, equate);
            proteins.value = [...proteinsToReturn];
        },
    };
};

// Replaces the module of SingleAnalysisStore, for stores that contain analyses
const fakeAnalysis = (id: string, name: string) => ({
    id,
    name,
    dispose: () => disposedAnalyses.push(id),
    exportStore: () => ({ id, name }),
});

export const fakeSingleAnalysisStoreModule = {
    default: fakeAnalysis,
    useSingleAnalysisStoreImport: (storeImport: { id: string, name: string }) => fakeAnalysis(storeImport.id, storeImport.name),
};
