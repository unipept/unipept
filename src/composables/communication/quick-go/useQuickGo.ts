import QuickGoWorker from "./quickGo.worker.ts?worker&inline";
import useAsyncWebWorker from "@/composables/useAsyncWebWorker";

export default function useQuickGo() {
    const { post } = useAsyncWebWorker<{ imageUrl: string }, { blob: Blob }>(() => new QuickGoWorker());

    const process = async (
        imageUrl: string
    ): Promise<Blob> => {
        const { blob } = await post({ imageUrl });

        return blob;
    }

    return {
        process
    }
}