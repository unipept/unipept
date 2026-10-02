export default class ExclusiveProcessorRunner<T> {
    private inProgress: Promise<T | undefined> | undefined;

    public async run(task: () => Promise<T | undefined>): Promise<T | undefined> {
        while (this.inProgress) {
            // An error of the previous task is reported to its own caller, not to the tasks that wait for it
            await this.inProgress.catch(() => undefined);
        }

        this.inProgress = task();

        try {
            return await this.inProgress;
        } finally {
            this.inProgress = undefined;
        }
    }
}