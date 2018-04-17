import {toCSVString, downloadDataByForm} from "../utils.js";


/**
 * @typedef {Object} AmountTableSettings
 * @property {d3.selection[]}  el        The target container
 * @property {string}   title     A string naming the table (used for export name)
 * @property {string[]} header    An array of column names
 * @property {Any[]}    data      array of data to display (values are shown in order)
 * @property {AmountTableColSpec[]} contents  An array of settings for each column (see above)
 * @property {Number} [limit=Infinity]  The number of rows to show in collapsed state
 * @property {function(data: Any): string} tooltip  A function specifying the tooltip content given a datarow
 * @property {string}   tooltipID   A CSS selector of an existing tooltip element.
 * @property {Number} [tooltipDelay=500]  Number of ms to wait before showing the tooltip
 */

/**
 * @typedef {Object} AmountTableColSpec
 * @property {function(cell: d3.selection[]): string} [builder=null]
 *           Function that builds the cells content using D3.
 *           The argument is a cell that has the data about the row.
 *           (Builder is only used when rendering the table and is preferred over html)
 * @property {function(data: Any): string} [html=null]
 *           Function that generates the HTML content of the cell
 *           (text is used if not supplied)
 * @property {function(data: Any): string} [text=null]
 *           Function that generates the text content of the cell
 *           (html is preferred over text in when rendering a table, text is
 *           preferred when exporting to csv)
 * @property {object} [style=null]
 *           object whose keys will be transformed to CSS properties of the
 *           cells in the column
 * @property {function(data: Any): number} [shade=false]
 *           Function that calculates the amount the shader is filled for cells
 *           in this column. Should be in [0,100]
 */

// Holds a timout to show the tooltip
let tooltipTimeout = null;

/**
 * A table representation of data
 */
class AmountTable {
    /**
     * Constructor of an AmountTable
     *
     * Pro tip: use `style: {"background-color": "red"}` to change the shader
     * fill color. Do not use `background` on a shaded cell.
     *
     * @param {AmountTableSettings} settings
     */
    constructor({el, title = null, header = null, data, contents = null, limit = Infinity, tooltip = null, tooltipID = null, tooltipDelay = 500}) {
        this.el = el;
        this.title = title;
        this.header = header;
        this.data = data || [];
        this.table = null;
        this.limit = limit;
        this.collapsed = true;
        this.contents = contents;
        this.makeTooltip = tooltip;
        this.tooltipDelay = tooltipDelay;
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
     * @todo Make general code for creation of tooltips
     */
    createTooltip() {
        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tip")
            .style("visibility", "hidden");
    }

    /**
     * Make the table visualization
     */
    draw() {
        const [thead, tbody, tfoot] = this.buildTable();
        this.buildHeader(thead);
        if (this.data.length !== 0) {
            this.buildRow(tbody);
            this.addCollapseRow(tfoot, tbody);
        } else {
            // fallback in case there is no data
            tbody.append("tr").append("td")
                .attr("colspan", this.header.length)
                .style("text-align", "center")
                .text("No data");
        }
    }

    /**
     * Create a table in the target element (without creating it first)
     * @return {d3.selection[]}  Table head and table body
     */
    buildTable() {
        if (this.table === null) {
            this.table = this.el.append("table").attr("class", "table table-condensed table-amounttable");
        }
        this.table.html(""); // empty the tables HTML
        const thead = this.table.append("thead");
        const tbody = this.table.append("tbody");
        const tfoot = this.table.append("tfoot");
        return [thead, tbody, tfoot];
    }

    /**
     * Make the table header
     * @param {d3.selection} thead  table header
     */
    buildHeader(thead) {
        const headerCells = thead.append("tr")
            .selectAll("th")
            .data(this.header)
            .enter()
            .append("th")
            .attr("scope", "col")
            .text(d => d);
        const lastCell = d3.select(headerCells[0][headerCells.size() - 1]);
        lastCell
            .append("button")
            .classed("btn btn-default btn-xs btn-animate amounttable-download", true)
            .html("<span class=\"glyphicon glyphicon-download down\"></span> Save CSV")
            .on("click", () => this.downloadCSV());
    }

    /**
     * Add rows to the table tbody
     * @param {d3.selection} tbody table body
     */
    buildRow(tbody) {
        const rows = tbody.selectAll("tr")
            .data(this.collapsed ? this.data.slice(0, this.limit) : this.data);

        rows.exit().remove(); // remove rows that are no longer needed

        const row = rows.enter().append("tr");
        for (const colSpec of this.contents) {
            const {html = null, text = null, builder = null, style = null, shade = false} = colSpec;
            const cell = row.append("td");

            if (shade !== false) {
                cell.style("background-image", d => {
                    const prec = shade(d);
                    return `linear-gradient(to right, transparent ${prec}%, white ${prec}%)`;
                });
                cell.classed("shaded-cell", true);
            }

            if (style !== null) {
                for (const [property, value] of Object.entries(style)) {
                    cell.style(property, value);
                }
            }

            if (builder != null) {
                builder(cell);
            } else {
                if (html !== null) {
                    cell.html(d => html(d));
                } else {
                    if (text !== null) {
                        cell.text(d => text(d));
                    } else {
                        throw new Error("No text, html or builder given for column" + JSON.stringify(colSpec));
                    }
                }
            }
        }


        this.addTooltips(row);
    }

    /**
     * Add a row that to toggle collapsing
     * @param {d3.selection} tfoot the body to add the row to
     * @param {d3.selection} tbody the body of the table (for content)
     */
    addCollapseRow(tfoot, tbody) {
        let numleft = Math.max(0, this.data.length - this.limit);
        if (numleft <= 0) return; // No collapse row if all rows shown
        const collapseRow = tfoot.append("tr").attr("class", "collapse-row");
        const collapseCell = collapseRow.append("td")
            .attr("colspan", this.header.length)
            .attr("tabindex", "0")
            .attr("aria-expanded", !this.collapsed)
            .attr("aria-pressed", !this.collapsed)
            .attr("role", "button")
            .html(`<span class="glyphicon glyphicon-chevron-down"></span> Show ${Math.min(numleft, 10)} more rows (${numleft} left)`);

        let numClick = 0;

        // Collapse on click or on enter or on space (role button)
        const toggler = delta => {
            this.limit = Math.max(0, Math.min( this.limit + delta, this.data.length+delta));
            numleft = Math.max(0, this.data.length - this.limit);
            if (numleft > 0) {
                let cellHtml = `<span class="glyphicon glyphicon-chevron-down"></span> Show ${Math.min(numleft, 10)} more rows (${numleft} left)`;
                if (numClick >= 3 && numleft > 100) {
                    cellHtml += "<span style='float:right; opacity:.7;'><kbd>SHIFT+click</kbd> for 100</span>";
                }
                collapseCell.html(cellHtml);
            } else {
                collapseRow.remove();
            }
            this.showTooltip(false);
            this.buildRow(tbody);
            this.showTooltip(false);
            numClick++;
        };

        const togglerDo = () => {
            toggler(d3.event.shiftKey ? 100 : 10);
        };

        collapseRow.on("click", togglerDo);
        collapseRow.on("keydown", () => {
            if (d3.event.key === "Enter" || d3.event.key === " ") {
                togglerDo();
            }
        });
    }


    /**
     * Creates a CSV representation of the amount table
     *
     * prefers text() over html(), in the second case only the textContent is
     * kept
     *
     * @return {string} the CSV version of the table
     */
    toCSV() {
        const result = [this.header];
        const htmlHelperSpan = document.createElement("span");
        for (const entry of this.data) {
            const values = [];
            for (const colSpec of this.contents) {
                const {html = null, text = null} = colSpec;
                if (text !== null) {
                    values.push(text(entry));
                } else {
                    if (html !== null) {
                        htmlHelperSpan.innerHTML = html(entry);
                        values.push(htmlHelperSpan.textContent);
                    } else {
                        throw new Error("Neither text nor html given for column" + JSON.stringify(colSpec));
                    }
                }
            }
            result.push(values);
        }
        const csv = toCSVString(result); // todo: put in next line
        return csv;
    }

    /**
     * Trigger a download of the tables CSV
     */
    downloadCSV() {
        let filename = "export.csv";
        if (this.title !== null) {
            filename = `${this.title.replace(/[^a-zA-Z -_]/gi, "").replace(/  *-  */g, "-").replace(/ /g, "_")}-export.csv`;
        }
        downloadDataByForm(this.toCSV(), filename, "text/csv");
    }


    /**
     * Setup tooltips
     * @param {d3.selection} row the rows to add the tooltip to.
     */
    addTooltips(row) {
        if (this.tooltip !== null) {
            row.on("mouseover", d => {
                this.tooltip.html(this.makeTooltip(d));
                this.positionTooltip(d3.event.pageX, d3.event.pageY);
                this.showTooltip(true);
            });
            row.on("mousemove", d => {
                this.positionTooltip(d3.event.pageX, d3.event.pageY);
            });
            row.on("mouseout", d => {
                this.showTooltip(false);
            });
        }
    }

    /**
     * Position the tooltip at the given coordinate. position it 3px form right
     * if it overflows the page.
     * @param {number} x The x position of the cursor
     * @param {number} y The y position of the cursor
     */
    positionTooltip(x, y) {
        if (this.tooltip !== null) {
            this.tooltip
                .style("top", (y + 10) + "px")
                .style("left", (x + 15) + "px")
                .style("display", "block")
                .style("right", "auto");

            // Reposition if needed
            if (window.innerWidth - x - 25 - this.tooltip.node().offsetWidth < 0) {
                this.tooltip
                    .style("right", "3px")
                    .style("left", "auto");
            }
        }
    }

    /**
     * Show/Hide the tooltip (first wait tooltipDelay ms)
     * @param {bool} show show the tooltip
     */
    showTooltip(show) {
        const doShow = ()=>{
            this.tooltip
                .style("visibility", "visible");
        };

        if (this.tooltip !== null) {
            if (show) {
                tooltipTimeout = setTimeout(doShow, this.tooltipDelay);
            } else {
                clearTimeout(tooltipTimeout);
                this.tooltip
                    .style("top", 0)
                    .style("left", 0)
                    .style("right", "auto")
                    .style("visibility", "hidden");
            }
        }
    }
}


export {AmountTable};
