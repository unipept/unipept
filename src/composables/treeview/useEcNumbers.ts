import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import type { TreeviewItem } from '@/components/visualization/treeview/Treeview.vue';
import usePathwayPilotMappingStore from '@/store/PathwayPilotMappingStore';

export const EC_CLASSES = [
    { prefix: '1', label: 'Oxidoreductases' },
    { prefix: '2', label: 'Transferases' },
    { prefix: '3', label: 'Hydrolases' },
    { prefix: '4', label: 'Lyases' },
    { prefix: '5', label: 'Isomerases' },
    { prefix: '6', label: 'Ligases' },
    { prefix: '7', label: 'Translocases' },
];

// Chip colors per EC class (EC 1–7)
export const EC_CLASS_CHIP_COLORS = [
    '#e53935', // EC 1 - Oxidoreductases
    '#1e88e5', // EC 2 - Transferases
    '#43a047', // EC 3 - Hydrolases
    '#fb8c00', // EC 4 - Lyases
    '#8e24aa', // EC 5 - Isomerases
    '#00897b', // EC 6 - Ligases
    '#f9a825', // EC 7 - Translocases
];

// Sort map entries numerically by key (handles '-' as last)
export const numericKeySort = (a: [string, unknown], b: [string, unknown]) =>
    a[0] === '-' ? 1 : b[0] === '-' ? -1 : parseInt(a[0]) - parseInt(b[0]);

export const ecChipColor = (ecName: string): string => {
    const classIdx = parseInt(ecName.charAt(0)) - 1;
    return classIdx >= 0 && classIdx < EC_CLASS_CHIP_COLORS.length
        ? EC_CLASS_CHIP_COLORS[classIdx]
        : '#888888';
};

export function useEcNumbers(ecIds: MaybeRefOrGetter<string[]>) {
    const mappingStore = usePathwayPilotMappingStore();

    // Stable numeric ID per EC string (leaf nodes)
    const ecToNumericId = computed<Map<string, number>>(() => {
        const sorted = [...toValue(ecIds)].sort();
        const map = new Map<string, number>();
        sorted.forEach((ecId, i) => map.set(ecId, 100 + i));
        return map;
    });

    const numericIdToEc = computed<Map<number, string>>(() =>
        new Map([...ecToNumericId.value.entries()].map(([ec, id]) => [id, ec]))
    );

    const ecClasses = computed<TreeviewItem[]>(() => {
        let intermediateId = 100_000;

        return EC_CLASSES.map((cls, i) => {
            const classEcIds = toValue(ecIds)
                .filter(id => id.startsWith(cls.prefix + '.'))
                .sort();

            if (classEcIds.length === 0) return null;

            const subclassMap = new Map<string, string[]>();
            for (const ecId of classEcIds) {
                const parts = ecId.split('.');
                const sub = parts[1] ?? '-';
                if (!subclassMap.has(sub)) subclassMap.set(sub, []);
                subclassMap.get(sub)!.push(ecId);
            }

            const subclassItems: TreeviewItem[] = [];
            for (const [sub, subEcIds] of [...subclassMap.entries()].sort(numericKeySort)) {
                const subSubMap = new Map<string, string[]>();
                for (const ecId of subEcIds) {
                    const parts = ecId.split('.');
                    const subSub = parts[2] ?? '-';
                    if (!subSubMap.has(subSub)) subSubMap.set(subSub, []);
                    subSubMap.get(subSub)!.push(ecId);
                }

                const subSubItems: TreeviewItem[] = [];
                for (const [subSub, leafEcIds] of [...subSubMap.entries()].sort(numericKeySort)) {
                    const leafItems: TreeviewItem[] = leafEcIds.sort().map(ecId => ({
                        id: ecToNumericId.value.get(ecId)!,
                        name: ecId,
                        nameExtra: mappingStore.ecMapping?.get(ecId)?.names?.[0] ?? 'Unknown',
                        children: [],
                    }));

                    subSubItems.push({
                        id: intermediateId++,
                        name: `${cls.prefix}.${sub}.${subSub}.-`,
                        children: leafItems,
                    });
                }

                subclassItems.push({
                    id: intermediateId++,
                    name: `${cls.prefix}.${sub}.-.-`,
                    children: subSubItems,
                });
            }

            return {
                id: i + 1,
                name: `EC ${cls.prefix}`,
                nameExtra: cls.label,
                children: subclassItems,
            } as TreeviewItem;
        }).filter((x): x is TreeviewItem => x !== null);
    });

    return { ecToNumericId, numericIdToEc, ecClasses };
}
