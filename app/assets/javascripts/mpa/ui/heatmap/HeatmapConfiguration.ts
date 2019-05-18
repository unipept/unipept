import {Normalizer} from "../../heatmap/Normalizer";
import DataSource from "../../datasource/DataSource";
import TaxaDataSource from "../../datasource/TaxaDataSource";
import GoDataSource from "../../datasource/GoDataSource";
import AllNormalizer from "../../heatmap/AllNormalizer";
import DataElement from "../../datasource/DataElement";

export default class HeatmapConfiguration {
    public normalizer: Normalizer;
    public horizontalDataSource: DataSource;
    public verticalDataSource: DataSource;

    public horizontalSelectedItems: DataElement[];
    public verticalSelectedItems: DataElement[];
}
