import {FunctionalAnnotations} from "../../../fa/FunctionalAnnotations";
import {numberToPercent} from "../../../utils";

export default class FaSortSettings {
    public format: (x: string) => string;
    public formatData: (x: string) => string;
    public field: string;
    public shadeField: string;
    public name: string;
    public sortFunc: (a: FAInfo, b: FAInfo) => number;

    constructor(
        format: (x: string) => string,
        formatData: (x: string) => string,
        field: string,
        shadeField: string,
        name: string,
        sortFunc: (a: FAInfo, b: FAInfo) => number
    ) {
        this.format = format;
        this.formatData = formatData;
        this.field = field;
        this.shadeField = shadeField;
        this.name = name;
        this.sortFunc = sortFunc;
    }
}
