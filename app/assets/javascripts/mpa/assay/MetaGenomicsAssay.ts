import { Assay } from "./Assay";
import { TaxaCountTable } from "../counts/TaxaCountTable";
import { GOCountTable } from "../counts/GOCountTable";
import { ECCountTable } from "../counts/ECCountTable";

export class MetaGenomicsAssay extends Assay
{
    private _taxaCountTable: TaxaCountTable;
    private _goCountTable: GOCountTable;
    private _ecCountTable: ECCountTable;

    async initDataRepository() 
    {
        throw new Error("Method not implemented.");
    }
}