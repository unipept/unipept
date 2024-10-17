import {useWebWorker} from "@vueuse/core";

export default function useAsyncWebWorker(workerPath: string) {
    const post = async (data: object) => {
        const { post, worker, terminate } = useWebWorker(workerPath, {
            type: 'module'
        });

        return await new Promise((resolve, reject) => {
            worker.value.onmessage = (event) => {
                terminate();
                resolve(event.data);
            };

            worker.value.onerror = (error) => {
                terminate();
                reject(error.message);
            };

            post(data);
        });
    };

    return {
        post
    };
}