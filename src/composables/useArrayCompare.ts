export default function useArrayCompare() {
    const compareNumberOrStringArrays = (a: number[] | string[], b: number[] | string[]) => {
        if (a.length !== b.length) return false;

        const aSorted = a.slice().sort();
        const bSorted = b.slice().sort();

        return aSorted.every((value, index) => value === bSorted[index]);
    }

    return {
        compareNumberOrStringArrays
    }
}
