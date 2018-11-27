/**
 * This class manages the current settings for displaying stuff on the MPA analysis page.
 */
export default class DisplaySettings {
    private readonly onlyStarredFa: boolean;
    private readonly sortFa: any;

    constructor(onlyStarredFa: boolean) {
        this.onlyStarredFa = onlyStarredFa;
    }

    public isOnlyStarredFa(): boolean {
        return this.onlyStarredFa;
    }
}
