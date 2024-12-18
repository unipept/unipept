export default function useAsyncWebWorker(worker: Worker) {
    console.log(worker);
    const post = async (data: object) => {
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