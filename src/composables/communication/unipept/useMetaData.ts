import {ref} from "vue";
import {DEFAULT_API_BASE_URL} from "@/logic/Constants";

export default function useMetaData(
    baseUrl = DEFAULT_API_BASE_URL,
) {
    const databaseVersion = ref<string>("");

    const process = async () => {
        const response = await fetch(`${baseUrl}/private_api/metadata`).then(r => r.json());
        databaseVersion.value = response.db_version;
    }

    return {
        databaseVersion,
        process
    }
}
