import { Assay } from "./Assay";
import PeptideContainer from "../PeptideContainer";
import Visitor from "../visitors/Visitor";

export class MetaProteomicsAssay extends Assay
{
    public peptideContainer: PeptideContainer = new PeptideContainer();

    async initDataRepository(mpaConfig: MPAConfig) 
    {
        throw new Error("Method not implemented.");
    }

    async visit(visitor: Visitor): Promise<void> 
    {
        await visitor.visitMetaProteomicsAssay(this);
    }
}