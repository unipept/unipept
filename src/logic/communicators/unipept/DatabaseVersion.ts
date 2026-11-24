import NetworkUtils from "@/logic/communicators/NetworkUtils";
import {DEFAULT_API_BASE_URL} from "@/logic/Constants";

// The ontology lookups of one analysis all need the database version, so it is kept for a few minutes per API. After
// that it is requested again, so that an open page notices a new database release.
const CACHE_DURATION_MS = 5 * 60 * 1000;
const cache = new Map<string, { version: Promise<string>, time: number }>();

// Returns the version of the UniProt database that the Unipept API at the given base URL uses
export function fetchDatabaseVersion(baseUrl = DEFAULT_API_BASE_URL): Promise<string> {
    const cached = cache.get(baseUrl);
    if (cached && Date.now() - cached.time < CACHE_DURATION_MS) {
        return cached.version;
    }

    const version = NetworkUtils.getJSON(`${baseUrl}/private_api/metadata`).then(response => response.db_version as string);
    cache.set(baseUrl, { version, time: Date.now() });

    // A failed request is not kept, so that the next call tries again
    version.catch(() => {
        if (cache.get(baseUrl)?.version === version) {
            cache.delete(baseUrl);
        }
    });

    return version;
}

// Forgets all kept versions. Used by tests.
export function forgetDatabaseVersions(): void {
    cache.clear();
}
