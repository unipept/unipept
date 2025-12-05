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
    taxa: number[]
};

export default PeptideDataResponse;
