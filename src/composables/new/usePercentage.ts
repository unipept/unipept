export default function usePercentage() {
    const displayPercentage = (value: number) => {
        return `${(value * 100).toFixed(2)}%`;
    };

    return {
        displayPercentage,
    };
}
