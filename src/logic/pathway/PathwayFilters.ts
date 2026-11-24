export interface FilterablePathwayItem {
    id: string;
    category: string;
    subCategory: string;
    name: string;
}

// Finds the pathways of an EC number or a compound, and lists all EC numbers
export interface PathwayLookups {
    pathwaysForEc: (ec: string) => Set<string>;
    pathwaysForCompound: (c: string) => Set<string>;
    allEcs: () => Iterable<string>;
}

// Keeps the pathways that match every given filter. A pathway matches the EC filter when it contains one of the EC
// numbers; a partial EC number such as 1.1.-.- matches all EC numbers below it. The same holds for compounds. A
// pathway matches the category filter on its subcategory, or on its category when it has no subcategory.
export function filterPathways<T extends FilterablePathwayItem>(
    items: T[],
    ecs: string[],
    compounds: string[],
    categories: string[],
    lookups: PathwayLookups
): T[] {
    if (ecs.length > 0) {
        const allowed = new Set<string>();
        for (const ec of ecs) {
            if (ec.endsWith('.-')) {
                const prefix = ec.replace(/(\.-)+$/, '');
                for (const storeEc of lookups.allEcs()) {
                    const storeEcStr = storeEc as string;
                    if (storeEcStr.startsWith(prefix + '.') || storeEcStr === prefix) {
                        for (const p of lookups.pathwaysForEc(storeEcStr)) allowed.add(p);
                    }
                }
            } else {
                for (const p of lookups.pathwaysForEc(ec)) allowed.add(p);
            }
        }
        items = items.filter(item => allowed.has(item.id));
    }

    if (compounds.length > 0) {
        const allowed = new Set<string>();
        for (const c of compounds) {
            for (const p of lookups.pathwaysForCompound(c)) allowed.add(p);
        }
        items = items.filter(item => allowed.has(item.id));
    }

    if (categories.length > 0) {
        const catSet = new Set(categories);
        items = items.filter(item => catSet.has(item.subCategory || item.category));
    }

    return items;
}

// Keeps the pathways whose id, name, category or subcategory contains the query, ignoring case. An empty query keeps
// all pathways.
export function searchPathways<T extends FilterablePathwayItem>(items: T[], query: string): T[] {
    if (!query) {
        return items;
    }

    const q = query.toLowerCase();
    return items.filter(item =>
        item.id.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.subCategory || '').toLowerCase().includes(q)
    );
}
