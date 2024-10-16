import {ref} from "vue";

export default function useAsync<T>() {
    const isExecuting = ref<boolean>(false);
    const asyncCount = ref(0);

    const performIfLast = async (
        asyncResult: () => Promise<T>,
        mutation: (result: T) => void
    ): Promise<void> => {
        isExecuting.value = true;
        asyncCount.value++;
        const count = asyncCount.value;

        const result = await asyncResult();

        if (count === asyncCount.value) {
            mutation(result);
            isExecuting.value = false;
        }
    }

    return {
        isExecuting,
        performIfLast,
    };
}
