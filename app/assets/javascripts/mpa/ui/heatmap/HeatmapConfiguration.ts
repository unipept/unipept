import {Normalizer} from "../../heatmap/Normalizer";
import DataSource from "../../DataSource";
import TaxaDataSource from "../../TaxaDataSource";
import GoDataSource from "../../GoDataSource";
import AllNormalizer from "../../heatmap/AllNormalizer";

export default class HeatmapConfiguration {
    public normalizer: Normalizer;
    public horizontalDataSource: DataSource;
    public verticalDataSource: DataSource;
}
