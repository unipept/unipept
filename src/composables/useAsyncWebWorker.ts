export default function useAsyncWebWorker<In, Out>(workerFunction: () => Worker) {
    const post = async (data: In): Promise<Out> => {
        const worker = workerFunction();

        return await new Promise((resolve, reject) => {
            worker.onmessage = (event) => {
                worker.terminate();
                resolve(event.data);
            };

            worker.onerror = (error) => {
                console.error(error);
                worker.terminate();
                reject(error.message);
            };

            worker.postMessage(data);
        });
    };

    return {
        post
    };
}