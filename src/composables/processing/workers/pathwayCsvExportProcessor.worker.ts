import { ShareableMap } from "shared-memory-datastructures";
import { PathwayCsvExportData } from "@/composables/pathway/usePathwayCsvExport";

self.onunhandledrejection = (event) => {
    throw event.reason;
};

self.onmessage = async (event) => {
    self.postMessage(await process(event.data));
};

const process = async ({ analyses, header, delimiter }: PathwayCsvExportData): Promise<string[][]> => {
    const rows: string[][] = [header];

    for (const analysis of analyses) {
        const {
            peptideCountsTransferable,
            ecToPeptides,
            peptideToLca,
            ncbiNodes,
            ecToPathways,
            pathwayMapping,
            analysisName,
            groupName
        } = analysis;

        const peptideCounts = ShareableMap.fromTransferableState<string, number>(peptideCountsTransferable);

        const peptideToEcs = new Map<string, string[]>();
        for (const [rawEc, peptides] of ecToPeptides.entries()) {
            const ecId = rawEc.startsWith('EC:') ? rawEc.substring(3) : rawEc;
            for (const peptide of peptides) {
                if (!peptideToEcs.has(peptide)) peptideToEcs.set(peptide, []);
                peptideToEcs.get(peptide)!.push(ecId);
            }
        }

        for (const [peptide, count] of peptideCounts.entries()) {
            const taxonId = peptideToLca.get(peptide);
            const taxonNode = taxonId != null ? ncbiNodes.get(taxonId) : undefined;
            const rank = taxonNode?.rank ?? 'no rank';
            const name = rank === 'no rank' ? 'root' : (taxonNode?.name ?? '');

            const ecIds = peptideToEcs.get(peptide) ?? [];
            const pathwayIdSet = new Set<string>();
            for (const ec of ecIds) {
                for (const p of ecToPathways.get(ec) ?? []) {
                    pathwayIdSet.add(p);
                }
            }

            const sortedPathways = Array.from(pathwayIdSet).sort();
            const pathwayNames = sortedPathways.map(id => pathwayMapping.get(id)?.name ?? '').join(';');

            const dataRow = [
                peptide,
                String(count),
                taxonId != null ? String(taxonId) : '',
                rank,
                name,
                sortedPathways.join(';'),
                pathwayNames,
            ];

            rows.push(groupName !== '' ? [groupName, analysisName, ...dataRow] : dataRow);
        }
    }

    return rows;
};
