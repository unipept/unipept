// Returns true if both arrays contain the same values, in any order.
export function compareNumberOrStringArrays(a: number[] | string[], b: number[] | string[]): boolean {
    if (a.length !== b.length) return false;

    const aSorted = a.slice().sort();
    const bSorted = b.slice().sort();

    return aSorted.every((value, index) => value === bSorted[index]);
}
