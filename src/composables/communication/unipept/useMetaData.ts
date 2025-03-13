import {ref} from "vue";

export default function useMetaData(
    baseUrl = "https://api.unipept.ugent.be",
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
