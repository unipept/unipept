import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import type { TreeviewItem } from '@/logic/utils/TreeviewItem';
import usePathwayPilotMappingStore from '@/store/PathwayPilotMappingStore';
import { buildEcTree, numberEcIds } from '@/logic/pathway/EcTree';

export function useEcNumbers(ecIds: MaybeRefOrGetter<string[]>) {
    const mappingStore = usePathwayPilotMappingStore();

    // Stable numeric ID per EC string (leaf nodes)
    const ecToNumericId = computed<Map<string, number>>(() => numberEcIds(toValue(ecIds)));

    const numericIdToEc = computed<Map<number, string>>(() =>
        new Map([...ecToNumericId.value.entries()].map(([ec, id]) => [id, ec]))
    );

    const ecClasses = computed<TreeviewItem[]>(() =>
        buildEcTree(toValue(ecIds), ecToNumericId.value, ecId => mappingStore.ecMapping?.get(ecId)?.names?.[0])
    );

    return { ecToNumericId, numericIdToEc, ecClasses };
}
