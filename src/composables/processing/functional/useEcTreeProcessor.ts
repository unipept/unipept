import {ref} from "vue";
import CountTable from "@/logic/processors/CountTable";
import { DataNodeLike } from "unipept-visualizations";

export default function useEcTreeProcessor() {
    const root = ref<DataNodeLike>();

    const process = (
        countTable: CountTable<string>,
    ) => {
        root.value = undefined;

        const nodes = new Map<string, any>();

        nodes.set("root", {
            name: "-.-.-.-",
            count: 0,
            selfCount: 0,
            children: []
        });

        for (const [code, count] of sortAnnotations([...countTable.counts.entries()])) {
            nodes.get("root").count += count;

            const levels = code.substring(3).split(".");
            for (let i = 0; i < levels.length; i++) {
                if (levels[i] === "-") {
                    continue;
                }

                const key = levels.slice(0, i + 1).join(".");
                if (!nodes.has(key)) {
                    nodes.set(key, {
                        name: `EC:${key}`,
                        count: 0,
                        selfCount: 0,
                        children: []
                    });
                }
                nodes.get(key).count += count;

                // Update the self count if this is the last valid level
                if (i === levels.length - 1 || levels[i + 1] === "-") {
                    nodes.get(key).selfCount = count;
                }

                // Add the child to its parent if it doesn't exist yet
                const parentKey = i === 0 ? "root" : levels.slice(0, i).join(".");
                if (!nodes.get(parentKey).children.includes(nodes.get(key))) {
                    nodes.get(parentKey).children.push(nodes.get(key));
                }
            }
        }

        root.value = nodes.get("root");
    }

    const sortAnnotations = (annotations: [string, number][]): [string, number][] => {
        return annotations
            .sort(([s1, c1], [s2, c2]) =>
                // Step 1: Split the EC number into 4 parts (1.2.2.31 -> [1, 2, 2, 31])
                // Step 2: Convert every part to a 4 digit string ([1, 2, 2, 31] -> [0001, 0002, 0002, 0031])
                // Step 3: Join the strings with a dot ([0001, 0002, 0002, 0031] -> 0001.0002.0002.0031)
                // Step 4: Use String compare to sort these fixed length strings
                s1.split(".").map(s => `0000${s}`.slice(-4)).join(".").localeCompare(
                    s2.split(".").map(s => `0000${s}`.slice(-4)).join(".")
                )
            );
    }

    return {
        root,
        process
    }
}
