import {Normalizer} from "../../heatmap/Normalizer";
import DataSource from "../../heatmap/DataSource";
import TaxaDataSource from "../../heatmap/TaxaDataSource";
import GoDataSource from "../../heatmap/GoDataSource";
import AllNormalizer from "../../heatmap/AllNormalizer";

export default class HeatmapConfiguration {
    public normalizer: Normalizer = new AllNormalizer();
    public horizontalDataSource: DataSource = new TaxaDataSource();
    public verticalDataSource: DataSource = new TaxaDataSource();
}
