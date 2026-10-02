export default class ExclusiveProcessorRunner<T> {
    private inProgress: Promise<T | undefined> | undefined;

    public async run(task: () => Promise<T | undefined>): Promise<T | undefined> {
        while (this.inProgress) {
            await this.inProgress;
        }

        this.inProgress = task();

        try {
            return await this.inProgress;
        } finally {
            this.inProgress = undefined;
        }
    }
}