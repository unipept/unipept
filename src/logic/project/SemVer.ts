export interface SemVerParts {
    major: number;
    minor: number;
    patch: number;
    preRelease?: string;
}

/**
 * Small utility for working with semantic version strings.
 *
 * Only the minimal functionality we need right now is implemented: parsing and
 * comparing whether one version is older than another.
 */
export class SemVer {
    public static parse(version: string): SemVerParts {
        const match = version.trim().match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/);

        if (!match) {
            throw new Error(`Invalid semantic version: ${version}`);
        }

        const [, major, minor, patch, preRelease] = match;

        return {
            major: Number(major),
            minor: Number(minor),
            patch: Number(patch),
            preRelease
        };
    }

    /**
     * Returns true if `a` is strictly older than `b`.
     */
    public static isOlder(a: string, b: string): boolean {
        return SemVer.compare(a, b) < 0;
    }

    /**
     * Compare two semantic versions.
     *
     * Returns:
     *   -1 if a < b
     *    0 if a == b
     *    1 if a > b
     */
    public static compare(a: string, b: string): number {
        const pa = SemVer.parse(a);
        const pb = SemVer.parse(b);

        if (pa.major !== pb.major) {
            return pa.major < pb.major ? -1 : 1;
        }

        if (pa.minor !== pb.minor) {
            return pa.minor < pb.minor ? -1 : 1;
        }

        if (pa.patch !== pb.patch) {
            return pa.patch < pb.patch ? -1 : 1;
        }

        // Handle pre-release tags according to SemVer rules:
        // - Absence of a pre-release tag has higher precedence
        // - Otherwise compare lexicographically
        if (pa.preRelease === pb.preRelease) {
            return 0;
        }

        if (pa.preRelease === undefined) {
            return 1;
        }

        if (pb.preRelease === undefined) {
            return -1;
        }

        if (pa.preRelease < pb.preRelease) {
            return -1;
        }

        if (pa.preRelease > pb.preRelease) {
            return 1;
        }

        return 0;
    }
}
