import { Assay } from "./Assay";
import { TaxaCountTable } from "../counts/TaxaCountTable";
import { GOCountTable } from "../counts/GOCountTable";
import { ECCountTable } from "../counts/ECCountTable";

import Visitor from "../visitors/Visitor";

export class MetaGenomicsAssay extends Assay
{
    private _taxaCountTable: TaxaCountTable;
    private _goCountTable: GOCountTable;
    private _ecCountTable: ECCountTable;

    async initDataRepository(mpaConfig: MPAConfig) 
    {
        throw new Error("Method not implemented.");
    }

    async visit(visitor: Visitor): Promise<void> 
    {
        await visitor.visitMetaGenomicsAssay(this);
    }
}