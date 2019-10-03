import { Assay } from "./Assay";
import PeptideContainer from "../PeptideContainer";

export class MetaProteomicsAssay extends Assay
{
    private _peptideContainer: PeptideContainer;

    async initDataRepository() 
    {
        throw new Error("Method not implemented.");
    }
}