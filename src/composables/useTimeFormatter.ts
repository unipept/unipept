export default function useTimeFormatter() {
    /**
     * Convert an amount of seconds into a time string that makes it human-readable. The resulting string contains the
     * amount it takes in "hours", "minutes" and "seconds".
     *
     * @param seconds
     */
    const convertDurationToString = (seconds: number): string => {
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

    return {
        convertDurationToString
    }
}
