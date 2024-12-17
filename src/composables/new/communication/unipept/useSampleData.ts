import {ref} from "vue";

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
    baseUrl = "https://api.unipept.ugent.be",
) {
    const samples = ref<SampleData[]>([]);

    const process = async () => {
        const response = await fetch(`${baseUrl}/datasets/sampledata`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }).then(r => r.json());

        console.log(response);

        samples.value = response.sample_data;
    }

    return {
        samples,
        process
    }
}
