import { toRaw } from 'vue';
import { TransferableState } from 'shared-memory-datastructures';
import useCsvDownload from '@/composables/useCsvDownload';
import useAsyncWebWorker from '@/composables/useAsyncWebWorker';
import { SingleAnalysisStore } from '@/store/SingleAnalysisStore';
import { GroupAnalysisStore } from '@/store/GroupAnalysisStore';
import usePathwayPilotMappingStore from '@/store/PathwayPilotMappingStore';
import { PathwayInfo } from '@/logic/communicators/PathwayPilotCommunicator';
import PathwayCsvExportWorker from '@/composables/processing/workers/pathwayCsvExportProcessor.worker.ts?worker';

export interface PathwayNcbiNode {
    name: string;
    rank: string;
}

export interface PathwayAnalysisInput {
    peptideCountsTransferable: TransferableState;
    ecToPeptides: Map<string, string[]>;
    peptideToLca: Map<string, number>;
    ncbiNodes: Map<number, PathwayNcbiNode>;
    ecToPathways: Map<string, string[]>;
    pathwayMapping: Map<string, PathwayInfo>;
    analysisName: string;
    groupName: string;
}

export interface PathwayCsvExportData {
    analyses: PathwayAnalysisInput[];
    header: string[];
    delimiter: string;
}

const PATHWAY_CSV_HEADER = ['peptide', 'peptide_count', 'taxon_id', 'taxon_rank', 'taxon_name', 'pathways', 'pathway_names'];
const COMPARATIVE_CSV_HEADER = ['group', 'sample', ...PATHWAY_CSV_HEADER];

const buildAnalysisInput = (
    analysis: SingleAnalysisStore,
    mappingStore: ReturnType<typeof usePathwayPilotMappingStore>,
    analysisName: string,
    groupName: string
): PathwayAnalysisInput => {
    const rawEcToPeptides = toRaw(analysis.ecToPeptides!);

    const ncbiNodes = new Map<number, PathwayNcbiNode>();
    for (const [id, node] of toRaw(analysis.ncbiTreeNodes!).entries()) {
        ncbiNodes.set(id, { name: node.name, rank: node.extra?.rank ?? 'no rank' });
    }

    const ecToPathways = new Map<string, string[]>();
    for (const [rawEc] of rawEcToPeptides.entries()) {
        const ecId = rawEc.startsWith('EC:') ? rawEc.substring(3) : rawEc;
        ecToPathways.set(ecId, [...analysis.pathwayPilotStore.pathwaysForEc(ecId)]);
    }

    return {
        peptideCountsTransferable: toRaw(analysis.peptidesTable!).counts.toTransferableState(),
        ecToPeptides: rawEcToPeptides,
        peptideToLca: toRaw(analysis.peptideToLca!),
        ncbiNodes,
        ecToPathways,
        pathwayMapping: toRaw(mappingStore.pathwayMapping!),
        analysisName,
        groupName,
    };
};

export function usePathwayCsvExport() {
    const { download: csvDownload } = useCsvDownload();
    const mappingStore = usePathwayPilotMappingStore();

    const download = async (rows: string[][], delimiter: string) => {
        const extension = delimiter === '\t' ? 'tsv' : 'csv';
        await csvDownload(rows, `pathwaypilot_export.${extension}`, delimiter);
    };

    const { post } = useAsyncWebWorker<PathwayCsvExportData, string[][]>(
        () => new PathwayCsvExportWorker()
    );

    const exportSingleAnalysis = async (
        analysis: SingleAnalysisStore,
        delimiter: string
    ): Promise<void> => {
        if (!analysis.peptidesTable || !analysis.ecToPeptides) return;

        const workerInput: PathwayCsvExportData = {
            analyses: [buildAnalysisInput(analysis, mappingStore, analysis.name, '')],
            header: PATHWAY_CSV_HEADER,
            delimiter,
        };

        const rows = await post(workerInput);
        await download(rows, delimiter);
    };

    const exportComparativeAnalysis = async (
        analyses: SingleAnalysisStore[],
        groups: GroupAnalysisStore[],
        delimiter: string
    ): Promise<void> => {
        const inputs: PathwayAnalysisInput[] = [];

        for (const analysis of analyses) {
            if (!analysis.peptidesTable || !analysis.ecToPeptides) continue;

            const groupName = groups.find(g =>
                (g.analyses as SingleAnalysisStore[]).some(a => a.id === analysis.id)
            )?.name ?? '';

            inputs.push(buildAnalysisInput(analysis, mappingStore, analysis.name, groupName));
        }

        const workerInput: PathwayCsvExportData = {
            analyses: inputs,
            header: COMPARATIVE_CSV_HEADER,
            delimiter,
        };

        const rows = await post(workerInput);
        await download(rows, delimiter);
    };

    return { exportSingleAnalysis, exportComparativeAnalysis };
}
