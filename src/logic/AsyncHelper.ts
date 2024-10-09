import {ref, Ref} from "vue";

/**
 * This class is a helper utility for async operations. It provides a method that can be used if multiple async
 * requests can be made simultaneously, but only the last result should actually be used.
 */
export default class AsyncHelper<T> {
    private asyncCount: number = 0;
    private executing: Ref<boolean> = ref(false);

    /**
     * Use this method if a specific async operation could be executed more than once, but only the result of the final
     * call should be retained and used. Note that the final call is defined as the one that was last called by this
     * method, it is not necessarily the one that finishes last.
     *
     * @param asyncResult The function that can be executed multiple times and for which only the results of the final
     * evocation should be retained.
     * @param mutation A mutation that should be performed upon receiving the results of the async function. This will
     * only be executed if the results of the final invocation of this method are available.
     */
    public async performIfLast(
        asyncResult: () => Promise<T>,
        mutation: (result: T) => void
    ): Promise<void> {
        this.executing = true;
        this.asyncCount++;
        const count = this.asyncCount;

        const result = await asyncResult();

        if (count === this.asyncCount) {
            mutation(result);
            this.executing = false;
        }
    }

    /**
     * Is this helper currently waiting for a call to finish or not?
     */
    public isExecuting(): Ref<boolean> {
        return this.executing;
    }
}
