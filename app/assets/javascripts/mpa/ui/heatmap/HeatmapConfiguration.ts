import {Normalizer} from "../../heatmap/Normalizer";
import DataSource from "../../datasource/DataSource";
import Element from "../../datasource/Element";

export default class HeatmapConfiguration {
    public normalizer: Normalizer = null;
    public horizontalDataSource: DataSource = null;
    public horizontalLoading: boolean = false;
    public verticalDataSource: DataSource = null;
    public verticalLoading: boolean = false;

    public horizontalSelectedItems: Element[] = [];
    public verticalSelectedItems: Element[] = [];
}
