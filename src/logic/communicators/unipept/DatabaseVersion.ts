import NetworkUtils from "@/logic/communicators/NetworkUtils";
import {DEFAULT_API_BASE_URL} from "@/logic/Constants";

// Returns the version of the UniProt database that the Unipept API at the given base URL uses
export async function fetchDatabaseVersion(baseUrl = DEFAULT_API_BASE_URL): Promise<string> {
    const response = await NetworkUtils.getJSON(`${baseUrl}/private_api/metadata`);
    return response.db_version;
}
