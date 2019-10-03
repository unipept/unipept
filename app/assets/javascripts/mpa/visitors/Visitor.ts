import { MetaGenomicsAssay } from "../assay/MetaGenomicsAssay";
import { MetaProteomicsAssay } from "../assay/MetaProteomicsAssay";

export default interface Visitor
{
    visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void>;
    visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay) : Promise<void>;
}