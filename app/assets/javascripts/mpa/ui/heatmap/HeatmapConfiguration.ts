import {Normalizer} from "../../heatmap/Normalizer";
import DataSource from "../../datasource/DataSource";
import Element from "../../datasource/Element";

export default class HeatmapConfiguration {
    public normalizer: Normalizer;
    public horizontalDataSource: DataSource;
    public verticalDataSource: DataSource;

    public horizontalSelectedItems: Element[] = [];
    public verticalSelectedItems: Element[] = [];
}
