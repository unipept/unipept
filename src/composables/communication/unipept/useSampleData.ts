import {ref} from "vue";
import {DEFAULT_API_BASE_URL} from "@/logic/Constants";

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
        const response = await fetch(`${baseUrl}/datasets/sampledata`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }).then(r => r.json());

        samples.value = response.sample_data;
    }

    return {
        samples,
        process
    }
}
