import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import ColumnFileParserWebWorker from "./workers/columnFileParser.worker?worker";
import { ref, Ref } from "vue";
import { refDebounced } from '@vueuse/core'
import {ColumnFileParserWorkerOutput} from "@/components/sample/upload/ColumnFileParser";

export interface ColumnFileParserData {
    linesBuffer: Uint8Array
    useFirstRowAsHeader: boolean
    sanitizeSequenceColumn: boolean
    selectedSequenceColumn: string
    selectedIntensitiesColumn: string
    selectedFdrColumn: string,
    fdrThreshold: number
    delimiter: string
}

export default function useColumnFileParser() {
    const columns: Ref<string[]> = ref([]);
    const rows: Ref<string[][]> = ref([]);
    const validPeptides: Ref<boolean> = ref(true);
    const validIntensities: Ref<boolean> = ref(true);

    const disabledInputs = ref(false);

    const loading = ref(false);

    const totalRows = ref(0);
    const validRows = ref(0);

    const debounceMs: number = 300;

    const debouncedDisabledInputs: Ref<boolean> = refDebounced(disabledInputs, debounceMs);
    const debouncedValidPeptides: Ref<boolean> = refDebounced(validPeptides, debounceMs);
    const debouncedValidIntensities: Ref<boolean> = refDebounced(validIntensities, debounceMs);

    const { post } = useAsyncWebWorker<ColumnFileParserData, ColumnFileParserWorkerOutput>(
        () => new ColumnFileParserWebWorker()
    );

    const parse = async (
        linesBuffer: Uint8Array,
        useFirstRowAsHeader: boolean,
        sanitizeSequenceColumn: boolean,
        selectedSequenceColumn: string,
        selectedIntensitiesColumn: string,
        delimiter: string,
        selectedFdrColumn: string,
        fdrThreshold: number
    ) => {
        disabledInputs.value = true
        loading.value = true;

        const processed = await post({
            linesBuffer,
            useFirstRowAsHeader,
            sanitizeSequenceColumn,
            selectedSequenceColumn,
            selectedIntensitiesColumn,
            delimiter,
            selectedFdrColumn,
            fdrThreshold
        });

        columns.value = processed.columns;
        rows.value = processed.rows;
        validPeptides.value = processed.validPeptides;
        validIntensities.value = processed.validIntensities;


        totalRows.value = processed.totalRows || 0;
        validRows.value = processed.validRows || 0;

        loading.value = false;
        disabledInputs.value = false;

        return {
            rawPeptides: processed.rawPeptides,
            intensities: processed.intensities
        };
    }

    return {
        disabledInputs: debouncedDisabledInputs,
        loadingPreview: loading,
        columns,
        rows,
        validPeptides,
        validIntensities,
        totalRows,
        validRows,

        parse
    }
}
