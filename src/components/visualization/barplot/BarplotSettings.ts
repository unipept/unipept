export interface VisualizationPadding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export class BarplotRenderSettings {
    // Padding around the actual "plot area" of the barplot
    padding: VisualizationPadding = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    };
}

export class BarplotLegendSettings {
    padding: VisualizationPadding = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    };

    // Size for the title of the legend
    titleFontSize: number = 24;

    // Size for the labels in the legend
    labelFontSize: number = 16;

    // Size in pixels of the colored square for each entry in the legend
    symbolSize: number = 16;

    // Amount of columns that should be used for the legend items
    columns: number = 4;

    // Maximum width of the legend (in pixels), when used in horizontal mode. The width of the complete visualization is
    // used when the barplot is rendered in vertical mode. The available width will be spread over the amount of desired
    // columns that are requested.
    width: number = 300;

    // Spacing (in pixels) between successive rows in the legend
    rowSpacing: number = 5;

    // Minimum amount of spacing (in pixels) between successive columns in the legend
    columnSpacing: number = 20;
}

export class BarplotSettings {
    width: number = 800;
    height: number = 600;

    // In horizontal mode, the legend will be displayed to the right of the barplot area. In vertical mode, the legend
    // will be placed below the actual plot.
    orientation: "horizontal" | "vertical" = "vertical";

    // Height of each bar in the visualization
    barHeight: number = 75;

    // Only shows the n largest items in the barplot and moves all the others into a single group "other"
    // The order of the items is determined by looking at values in the first bar. Pass undefined into this option to
    // display all items.
    maxItems: number = 15;

    // Which font for the titles and labels in the visualization
    font: string = "Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;";

    displayMode: "absolute" | "relative" = "relative";

    // Show the name of the dataset that's represented by a bar before the actual bar?
    showBarLabel: boolean = true;

    showValuesInBars: boolean = true;

    // Size (in pixels) of the values shown inside of the bars
    valuesFontSize: number = 12;

    // Padding around the whole visualization area (including both the actual plot area and legend area)
    padding: VisualizationPadding = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    };

    // Settings specifically for the actual plot area of the barplot visualization
    plot: BarplotRenderSettings = new BarplotRenderSettings();

    // Settings specifically for the legend area of the barplot visualization
    legend: BarplotLegendSettings = new BarplotLegendSettings();
}
