export function useNumberFormatter() {
    const formatNumber = (value: number): string => {
        // Use thin space (U+2009) as thousand separator
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
    };

    return {
        formatNumber
    };
}