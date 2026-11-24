import * as d3 from "d3";

export const pathwayGroups = [
    "Global and overview maps",
    "Carbohydrate metabolism",
    "Energy metabolism",
    "Lipid metabolism",
    "Nucleotide metabolism",
    "Amino acid metabolism",
    "Metabolism of other amino acids",
    "Glycan biosynthesis and metabolism",
    "Metabolism of cofactors and vitamins",
    "Metabolism of terpenoids and polyketides",
    "Biosynthesis of other secondary metabolites",
    "Xenobiotics biodegradation and metabolism",
    "Chemical structure transformation maps",
    "Others"
];

export const groupColors: d3.HSLColor[] = pathwayGroups.map((_group, i) => {
    return d3.hsl(1.9 + i * 360 / pathwayGroups.length, 0.721, 0.747);
});
groupColors[groupColors.length - 1] = d3.hsl(0, 0, 0.5);
