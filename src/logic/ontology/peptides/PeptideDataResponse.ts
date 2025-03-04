type PeptideDataResponse = {
    lca: number,
    lineage: number[],
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
        }
};

export default PeptideDataResponse;
