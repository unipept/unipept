// Formats a whole number with a thin space (U+2009) as thousands separator.
export function formatNumber(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
}

// Formats a fraction as a percentage, for example 0.1 as "10.00%". Infinity as number of digits keeps all digits.
export function displayPercentage(value: number, fractionDigits = 2): string {
    if (fractionDigits === Infinity) {
        return `${(value * 100)}%`;
    }

    return `${(value * 100).toFixed(fractionDigits)}%`;
}

// Writes a number of seconds as hours, minutes and seconds, for example "1 hour and 2 minutes and 3 seconds".
export function convertDurationToString(seconds: number): string {
    if (seconds < 0) throw new Error("Duration cannot be negative.");

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const parts: string[] = [];

    if (hours > 0) {
        parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
    }
    if (minutes > 0) {
        parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
    }
    if (remainingSeconds > 0 || parts.length === 0) {
        parts.push(`${remainingSeconds} second${remainingSeconds === 1 ? "" : "s"}`);
    }

    return parts.join(" and ");
}
