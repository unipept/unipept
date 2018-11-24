export default class SearchSettings {
    private equateIl: boolean;
    private duplicates: boolean;
    private missingCleavage: boolean;

    constructor(equateIl: boolean, duplicates: boolean, missingCleavage: boolean) {
        this.equateIl = equateIl;
        this.duplicates = duplicates;
        this.missingCleavage = missingCleavage;
    }

    isEquateIl(): boolean {
        return this.equateIl;
    }

    isFilterDuplicates(): boolean {
        return this.duplicates;
    }

    isHandleMissingCleavage(): boolean {
        return this.missingCleavage;
    }
}
