type PeptideDataResponse = {
    lca: number,
    lineage: (number | null)[],
    fa:
        {
            counts:
                {
                    all: number,
                    EC: number,
                    GO: number,
                    IPR: number
                },
            data: any
        },
    taxa: number[],
    cutoff_used: boolean,
    crap_filtered: boolean
};

export default PeptideDataResponse;
