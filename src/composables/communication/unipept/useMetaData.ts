import {ref} from "vue";
import {DEFAULT_API_BASE_URL} from "@/logic/Constants";
import {fetchDatabaseVersion} from "@/logic/communicators/unipept/DatabaseVersion";

export default function useMetaData(
    baseUrl = DEFAULT_API_BASE_URL,
) {
    const databaseVersion = ref<string>("");

    const process = async () => {
        databaseVersion.value = await fetchDatabaseVersion(baseUrl);
    }

    return {
        databaseVersion,
        process
    }
}
