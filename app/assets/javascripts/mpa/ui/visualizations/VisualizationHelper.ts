export function tooltipContent(d): string {
    return "<b>" + d.name + "</b> (" + d.rank + ")<br/>" +
        (!d.data.self_count ? "0" : d.data.self_count) +
        (d.data.self_count && d.data.self_count === 1 ? " sequence" : " sequences") + " specific to this level<br/>" +
        (!d.data.count ? "0" : d.data.count) +
        (d.data.count && d.data.count === 1 ? " sequence" : " sequences") + " specific to this level or lower";
}
