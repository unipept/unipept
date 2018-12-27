export function tooltipContent(d): string {
    return "<b>" + d.name + "</b> (" + d.rank + ")<br/>" +
        (!d.data.self_count ? "0" : d.data.self_count) +
        (d.data.self_count && d.data.self_count === 1 ? " sequence" : " sequences") + " specific to this level<br/>" +
        (!d.data.count ? "0" : d.data.count) +
        (d.data.count && d.data.count === 1 ? " sequence" : " sequences") + " specific to this level or lower";
}

// TODO what to do with search?
// export function search(id, searchTerm, timeout = 500) {
//     let localTerm = searchTerm;
//     if (localTerm === "Organism") {
//         localTerm = "";
//     }
//     setTimeout(() => this.searchTree.search(localTerm), timeout);
//     this.redoFAcalculations(searchTerm, id, timeout);
// }
