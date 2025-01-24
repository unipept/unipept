export default function useStringUtils() {
    /**
     * Convert a number to a percentage, 0.1 => "10%".
     */
    const numberToPercent = (n: number, digits = 0): string => {
        return (100 * n).toFixed(digits) + "%";
    }

    return {
        numberToPercent
    }
}
