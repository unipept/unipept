import {FunctionalAnnotations} from "../../../fa/FunctionalAnnotations";
import {numberToPercent} from "../../../utils";

export default class FaSortSettings {
    public readonly format: (x: string) => string;
    public readonly formatData: (x: string) => string;
    public readonly field: string;
    public readonly shadeField: string;
    public readonly name: string;
    public readonly sortFunc: (a: FAInfo, b: FAInfo) => number;

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
