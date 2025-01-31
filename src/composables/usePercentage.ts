export default function usePercentage() {
    const displayPercentage = (value: number, fractionDigits = 2) => {
        if (fractionDigits === Infinity) {
            return `${(value * 100)}%`
        }

        return `${(value * 100).toFixed(fractionDigits)}%`;
    };

    return {
        displayPercentage,
    };
}
