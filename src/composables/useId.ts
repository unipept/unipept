import { v4 as uuid4 } from "uuid";

export default function useId() {
    const id = () => uuid4();

    return { id };
}
