import {ref} from "vue";
import {DEFAULT_API_BASE_URL} from "@/logic/Constants";
import NetworkUtils from "@/logic/communicators/NetworkUtils";

export default function useMetaData(
    baseUrl = DEFAULT_API_BASE_URL,
) {
    const databaseVersion = ref<string>("");

    const process = async () => {
        const response = await NetworkUtils.getJSON(`${baseUrl}/private_api/metadata`);
        databaseVersion.value = response.db_version;
    }

    return {
        databaseVersion,
        process
    }
}
