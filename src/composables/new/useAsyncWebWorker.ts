export default function useAsyncWebWorker(workerFunction: () => Worker) {
    const post = async (data: object) => {
        const worker = workerFunction();

        return await new Promise((resolve, reject) => {
            worker.onmessage = (event) => {
                worker.terminate();
                resolve(event.data);
            };

            worker.onerror = (error) => {
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