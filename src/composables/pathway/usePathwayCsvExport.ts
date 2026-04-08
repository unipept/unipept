import useCsvDownload from '@/composables/useCsvDownload';
import { SingleAnalysisStore } from '@/store/SingleAnalysisStore';
import { GroupAnalysisStore } from '@/store/GroupAnalysisStore';
import usePathwayPilotMappingStore from '@/store/PathwayPilotMappingStore';

const buildPeptideRows = (
    analysis: SingleAnalysisStore,
    mappingStore: ReturnType<typeof usePathwayPilotMappingStore>
): string[][] => {
    if (!analysis.peptidesTable || !analysis.ecToPeptides) return [];

    const peptideToEcs = new Map<string, string[]>();
    for (const [rawEc, peptides] of analysis.ecToPeptides.entries()) {
        const ecId = rawEc.startsWith('EC:') ? rawEc.substring(3) : rawEc;
        for (const peptide of peptides) {
            if (!peptideToEcs.has(peptide)) peptideToEcs.set(peptide, []);
            peptideToEcs.get(peptide)!.push(ecId);
        }
    }

    const rows: string[][] = [];
    for (const [peptide, count] of analysis.peptidesTable.counts.entries()) {
        const taxonId = analysis.peptideToLca?.get(peptide);
        const taxonNode = taxonId != null ? analysis.ncbiTreeNodes?.get(taxonId) : undefined;
        const rank = taxonNode?.extra?.rank ?? 'no rank';
        const name = rank === 'no rank' ? 'root' : (taxonNode?.name ?? '');

        const ecIds = peptideToEcs.get(peptide) ?? [];
        const pathwayIdSet = new Set<string>();
        for (const ec of ecIds) {
            for (const p of analysis.pathwayPilotStore.pathwaysForEc(ec)) {
                pathwayIdSet.add(p);
            }
        }

        const sortedPathways = Array.from(pathwayIdSet).sort();
        const pathwayNames = sortedPathways.map(id => mappingStore.pathwayMapping?.get(id)?.name ?? '').join(';');

        rows.push([
            peptide,
            String(count),
            taxonId != null ? String(taxonId) : '',
            rank,
            name,
            sortedPathways.join(';'),
            pathwayNames,
        ]);
    }
    return rows;
};

const PATHWAY_CSV_HEADER = ['peptide', 'peptide_count', 'taxon_id', 'taxon_rank', 'taxon_name', 'pathways', 'pathway_names'];
const COMPARATIVE_CSV_HEADER = ['group', 'sample', ...PATHWAY_CSV_HEADER];

export function usePathwayCsvExport() {
    const { download: csvDownload } = useCsvDownload();
    const mappingStore = usePathwayPilotMappingStore();

    const download = async (rows: string[][], delimiter: string) => {
        const extension = delimiter === '\t' ? 'tsv' : 'csv';
        await csvDownload(rows, `pathwaypilot_export.${extension}`, delimiter);
    }

    const exportSingleAnalysis = async (
        analysis: SingleAnalysisStore,
        delimiter: string
    ): Promise<void> => {
        const rows = [PATHWAY_CSV_HEADER, ...buildPeptideRows(analysis, mappingStore)];
        await download(rows, delimiter);
    };

    const exportComparativeAnalysis = async (
        analyses: SingleAnalysisStore[],
        groups: GroupAnalysisStore[],
        delimiter: string
    ): Promise<void> => {
        const rows: string[][] = [COMPARATIVE_CSV_HEADER];

        for (const analysis of analyses) {
            if (!analysis.peptidesTable || !analysis.ecToPeptides) continue;

            const groupName = groups.find(g =>
                (g.analyses as SingleAnalysisStore[]).some(a => a.id === analysis.id)
            )?.name ?? '';

            for (const row of buildPeptideRows(analysis, mappingStore)) {
                rows.push([groupName, analysis.name, ...row]);
            }
        }

        await download(rows, delimiter);
    };

    return { exportSingleAnalysis, exportComparativeAnalysis };
}
