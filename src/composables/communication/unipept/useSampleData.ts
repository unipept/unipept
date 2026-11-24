import {ref} from "vue";
import {DEFAULT_API_BASE_URL} from "@/logic/Constants";
import NetworkUtils from "@/logic/communicators/NetworkUtils";

export interface SampleData {
    id: number
    environment: string
    reference: string
    url: string
    datasets: SampleDataset[]
}

export interface SampleDataset {
    name: string
    order: number
    data: string[]
}

export default function useSampleData(
    baseUrl = DEFAULT_API_BASE_URL,
) {
    const samples = ref<SampleData[]>([]);

    const process = async () => {
        const response = await NetworkUtils.postJSON(`${baseUrl}/datasets/sampledata`);

        samples.value = response.sample_data;
    }

    return {
        samples,
        process
    }
}
