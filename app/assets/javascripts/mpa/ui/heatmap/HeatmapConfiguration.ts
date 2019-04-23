import {NormalizationType} from "../../heatmap/NormalizationType";
import DataSource from "../../heatmap/DataSource";
import TaxaDataSource from "../../heatmap/TaxaDataSource";
import GoDataSource from "../../heatmap/GoDataSource";
import AllNormalizationType from "../../heatmap/AllNormalizationType";

export default class HeatmapConfiguration {
    public normalizationType: NormalizationType = new AllNormalizationType();
    public horizontalDataSource: DataSource = new TaxaDataSource();
    public verticalDataSource: DataSource = new TaxaDataSource();
}
