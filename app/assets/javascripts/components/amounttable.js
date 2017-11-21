/**
 * A table representaion of data
 * @todo complete doc
 */
class AmountTable {
    /**
     * Constructor
     * @param {Object} settings
     * @property {string}   el        A CSS selector of the target container
     * @property {string[]} header    An array of column names
     * @property {Any[]}    data      array of data to display (values are shown in order)
     * @property {Object[]} contents  An array of settings for each collum (see above)
     * @property {Number} [limit=Infinity]  The number of rows to show in collapsed state
     * @property {function(data: Any): string} tooltip  A function specifying the tooltip content given a datarow
     * @property {string}   tooltip   A CSS selector of an existing tooltip element.
     */
    constructor({el, header = null, data, contents=null, limit=Infinity, tooltip=null, tooltipID=null}) {
        this.el = el;
        this.header = header;
        this.data = data || [];
        this.table = null;
        this.limit = limit;
        this.collapsed = true;
        this.contents = contents;
        this.makeTooltip = tooltip;
        if (tooltip !== null) {
            if (tooltipID === null) {
                this.createTooltip();
            } else {
                this.tooltip = d3.select(tooltipID);
            }
        } else {
            this.tooltip = null;
        }
    }

    /**
     * Create a tooltip element of class "tip" do display tooltips
     */
    createTooltip() {
        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("padding", "2px")
            .style("border", "1px solid #dddddd")
            .style("border-radius", "3px;");
    }

    /**
     * Make the table visualisation
     */
    draw() {
        const [thead, tbody] = this.buildTable();
        this.buildHeader(thead);
        if (this.data.length != 0) {
            this.buildRow(tbody);
        } else {
            // fallback in case there is no data
            tbody.append("tr").append("td")
                .attr("colspan", this.header.length)
                .style("text-align", "center")
                .text("No data");
        }
    }

    /**
     * Create a table in the target element (withour emtieng it first)
     * @return {d3.selection}  Table head and table body
     */
    buildTable() {
        if (this.table === null) {
            this.table = this.el.append("table").attr("class", "table table-condensed table-amounttable");
        }
        this.table.html(); // empty the tables html
        const thead = this.table.append("thead");
        const tbody = this.table.append("tbody");
        return [thead, tbody];
    }

    /**
     * Make the table header
     * @param {d3.selection} thead  table header
     */
    buildHeader(thead) {
        thead.append("tr")
            .selectAll("th")
            .data(this.header)
            .enter()
            .append("th")
            .text(d => d);
    }

    /**
     * Add rows to the table tbody
     * @param {d3.selection} tbody table body
     */
    buildRow(tbody) {
        let rows = tbody.selectAll("tr")
            .data(this.collapsed ? this.data.slice(0, this.limit): this.data);

        rows.exit().remove(); // remove rows that are no longer needed

        let row = rows.enter().append("tr");
        for (let colSpec of this.contents) {
            let {html=null, text=null, style=null, shade=false} = colSpec;
            const cell = row.append("td");

            if (shade !== false) {
                cell.style("background-image", d => {
                    let prec = shade(d);
                    return `linear-gradient(to right, #FFCCCC ${prec}%, transparent ${prec}%)`;
                });
            }

            if (style !== null) {
                for (let [property, value] of Object.entries(style)) {
                    cell.style(property, value);
                }
            }

            if (text !== null) {
                cell.text(d => text(d));
            } else {
                if (html !== null) {
                    cell.html(d => html(d));
                } else {
                    throw new Error("Neither text nor html given for colunm"+ JSON.stringify(colSpec));
                }
            }
        }


        this.addTooltips(row);
        this.addColappseRow(tbody);
    }

    /**
     * Add a row that to toggle colapsing
     * @param {d3.selection} tbody the body to add the row to
     */
    addColappseRow(tbody) {
        let colapseRow = tbody.append("tr");
        let colapseCell = colapseRow.append("td")
            .attr("colspan", this.header.length);

        if (this.collapsed) {
            colapseCell.text(`Show ${this.data.length - this.limit} more rows`);
        } else {
            colapseCell.text(`Hide last ${this.data.length - this.limit} rows`);
        }

        colapseRow.on("click", () => {
            colapseRow.remove();
            this.collapsed = !this.collapsed;
            this.buildRow(tbody);
            this.showTooltip(false);
        });
    }

    /**
     * Setup tooltips
     * @param {d3.selection} row the rows to add the tooltip to.
     */
    addTooltips(row) {
        if (this.tooltip !== null) {
            row.on("mouseover", d => {
                this.showTooltip(true);
                this.positionTooltip(d3.event.pageX, d3.event.pageY);
                this.tooltip.html(this.makeTooltip(d));
            });
            row.on("mousemove", d => {
                this.positionTooltip(d3.event.pageX, d3.event.pageY);
            });
            row.on("mouseout", d => {this.showTooltip(false);});
        }
    }

    /** Show the tooltip */
    positionTooltip(x, y) {
        if (this.tooltip !== null) {
            this.tooltip
                .style("top", (y + 10) + "px")
                .style("left", (x + 15) + "px");
        }
    }

    /** Hide the tooltip */
    showTooltip(show) {
        if (this.tooltip !== null) {
            if (show) {
                this.tooltip
                    .style("visibility", "visible")
                    .style("display", "block");
            } else {
                this.tooltip
                    .style("visibility", "hidden")
                    .style("display", "none");
            }
        }
    }
}


export {AmountTable};
