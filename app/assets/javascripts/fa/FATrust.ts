export default class FATrust {
    public annotatedCount: number;
    public totalCount: number;
    public trustCount: number;

    constructor(annotatedCount: number, totalCount: number, trustCount: number) {
        this.annotatedCount = annotatedCount;
        this.totalCount = totalCount;
        this.trustCount = trustCount;
    }
}