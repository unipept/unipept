import {toCSVString, downloadDataByForm} from "../utils.js";


/**
 * @typedef {Object} AmountTableSettings
 * @property {D3.selection}  el
 *     The target container
 * @property {string}   title
 *     A string naming the table (used for export name)
 * @property {any[]}    data
 *     array of data to display (values are shown in order)
 * @property {AmountTableColSpec[]} contents
 *     An array of settings for each column (see above)
 * @property {Number} [limit=Infinity]
 *     The number of rows to show in collapsed state
 * @property {Number} [initialLimit=Infinity] Internal
 * @property {function(any, HTMLTableCellElement): any} [more]
 *     function that fills the expanded infoContainer. (Only called once)
 * @property {function(any): string} tooltip
 *     A function specifying the tooltip content given a datarow
 * @property {string}   tooltipID
 *     A CSS selector of an existing tooltip element.
 * @property {Number} [tooltipDelay=500]
 *     Number of ms to wait before showing the tooltip
 */


const DEFAULTS = {
    title: null,
    data: [],
    more: null,
    contents: null,
    limit: Infinity,
    initialLimit: Infinity,
    tooltip: null,
    tooltipDelay: 500,
    tooltipID: null,
};


/**
 * @typedef {Object} AmountTableColSpec
 * @property {string} [title=""]
 *           The title of the collumn
 * @property {function(D3.selection): any} [builder=null]
 *           Function that builds the cells content using D3.
 *           The argument is a cell that has the data about the row.
 *           (Builder is only used when rendering the table and is preferred over html)
 * @property {function(any): string} [html=null]
 *           Function that generates the HTML content of the cell
 *           (text is used if not supplied)
 * @property {function(any): string} [text=null]
 *           Function that generates the text content of the cell
 *           (html is preferred over text in when rendering a table, text is
 *           preferred when exporting to csv)
 * @property {boolean} [exported=true]
 *           if this column should be included in CSV export
 * @property {function(any): number} [shade=false]
 *           Function that calculates the amount the shader is filled for cells
 *           in this column. Should be in [0,100]
 * @property {Object.<String,any>} [style=null]
 *           object whose keys will be transformed to CSS properties of the
 *           cells in the column
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
    constructor(settings) {
        /** @type {AmountTableSettings} */
        this.settings = Object.assign({}, DEFAULTS, settings);

        this.table = null;

        this.header = this.settings.contents.map(({title = ""}) => title);
        if (this.settings.more !== null) {
            this.header.push("");
        }

        // No collapse row if it would show "1 row left"
        if (this.settings.data.length === this.settings.limit + 1) this.settings.limit++;
        this.settings.initialLimit = this.settings.limit;

        if (this.settings.tooltip !== null) {
            if (this.settings.tooltipID === null) {
                this.createTooltip();
            } else {
                this.tooltip = d3.select(this.settings.tooltipID);
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
        if (this.settings.data.length !== 0) {
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
     * @return {D3.selection}  Table head and table body
     */
    buildTable() {
        if (this.table === null) {
            this.table = this.settings.el.append("table").attr("class", "table table-condensed table-amounttable");
        }
        this.table.html(""); // empty the tables HTML
        const thead = this.table.append("thead");
        const tbody = this.table.append("tbody");
        const tfoot = this.table.append("tfoot");
        return [thead, tbody, tfoot];
    }

    /**
     * Make the table header
     * @param {D3.selection} thead  table header
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
            .html("<span class=\"glyphicon glyphicon-download down\"></span> Save table as CSV")
            .on("click", () => this.downloadCSV());
    }

    /**
     * Add rows to the table tbody
     * @param {D3.selection} tbody table body
     */
    buildRow(tbody) {
        const rows = tbody.selectAll("tr").data(this.settings.data.slice(0, this.settings.limit));

        rows.exit().remove(); // remove rows that are no longer needed

        const row = rows.enter().append("tr");
        for (const colSpec of this.settings.contents) {
            const {html = null, text = null, builder = null, style = null, shade = false} = colSpec;
            const cell = row.append("td");

            if (shade !== false) {
                cell.style("background-image", d => {
                    const prec = shade(d);
                    return `linear-gradient(to right, #dddddd ${prec}%, transparent ${prec}%)`;
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
        if (this.settings.more !== null) {
            const cheveron = row.append("td");
            cheveron.classed("glyphicon glyphicon-inline amounttable-chevron", true);
            cheveron.text(" ");
        }


        this.addTooltips(row);
        this.addExpandListener(row);
    }

    /**
     * Add a row that to toggle collapsing
     * @param {D3.selection} tfoot the body to add the row to
     * @param {D3.selection} tbody the body of the table (for content)
     */
    addCollapseRow(tfoot, tbody) {
        const leftText = () => {
            return ` Showing ${this.settings.limit} of ${this.settings.data.length} rows`;
        };

        let numleft = Math.max(0, this.settings.data.length - this.settings.limit);
        if (numleft <= 0) return; // No collapse row if all rows shown
        const collapseRow = tfoot.append("tr").attr("class", "collapse-row");
        const collapseCell = collapseRow.append("td")
            .attr("colspan", this.header.length)
            .attr("tabindex", "0")
            .attr("role", "button")
            .html(`<span class="glyphicon glyphicon-chevron-down"></span>${leftText()} — show ${Math.min(numleft, 10)} more`);

        let numClick = 0;


        // Add more rows
        const toggleDown = () => {
            toggler(d3.event.shiftKey ? 100 : 10);
        };

        // Collapse rows, and scrol table back in to view if needed
        const toggleUp = () => {
            d3.event.stopPropagation();
            toggler(false);
            this.table.node().scrollIntoView();
        };

        // Collapse on click or on enter or on space (role button)
        const toggler = delta => {
            numClick++;
            if (delta === false) {
                this.settings.limit = this.settings.initialLimit;
                numClick = 0;
            } else {
                this.settings.limit = Math.max(0, Math.min(this.settings.limit + delta, this.settings.data.length + delta));
            }
            numleft = Math.max(0, this.settings.data.length - this.settings.limit);
            if (numleft > 0) {
                let cellHtml = `<span class="glyphicon glyphicon-chevron-down"></span>${leftText()} — `;
                if (numClick >= 2 && numleft > 10) {
                    cellHtml += "<kbd>SHIFT+click</kbd> to show 100 more</span>";
                } else {
                    cellHtml += `show ${Math.min(numleft, 10)} more`;
                }
                collapseCell.html(cellHtml);
            } else {
                collapseCell.html("Showing all");
            }


            if (this.settings.limit > this.settings.initialLimit) {
                collapseCell
                    .append("span")
                    .classed("glyphicon glyphicon-chevron-up btn-icon pull-right", true)
                    .attr("title", "Collapse row")
                    .attr("tabindex", "0")
                    .attr("role", "button")
                    .on("click", toggleUp)
                    .on("keydown", () => {
                        if (d3.event.key === "Enter" || d3.event.key === " ") {
                            toggleUp();
                        }
                    });
            }

            this.showTooltip(false);
            this.buildRow(tbody);
            this.showTooltip(false);
        };

        collapseRow.on("click", toggleDown);
        collapseRow.on("keydown", () => {
            if (d3.event.key === "Enter" || d3.event.key === " ") {
                toggleDown();
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
        const result = [this.settings.contents.filter(({exported = true}) => exported).map(({title = ""}) => title)];
        const htmlHelperSpan = document.createElement("span");
        for (const entry of this.settings.data) {
            const values = [];
            for (const colSpec of this.settings.contents) {
                const {html = null, text = null, exported = true} = colSpec;
                if (!exported) continue; // skip non-exported cols
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
        if (this.settings.title !== null) {
            filename = `${this.settings.title.replace(/[^a-zA-Z -_]/gi, "").replace(/  *-  */g, "-").replace(/ /g, "_")}-export.csv`;
        }
        downloadDataByForm(this.toCSV(), filename, "text/csv");
    }

    /**
     * Setup expand on click, if needed
     *
     * The expanded row should act as a button, and should be reachable via tab.
     *
     * @param {D3.selection} row the rows to add the tooltip to.
     */
    addExpandListener(row) {
        if (this.settings.more !== null) {
            row.style("cursor", "pointer");
            row.attr("aria-expanded", false);
            row.attr("tabindex", "0");
            row.attr("role", "button");

            const that = this;
            const toggler = function (d) {
                if (this.amountTableExpandRow) {
                    this.classList.toggle("amounttable-expanded");
                    this.attributes["aria-expanded"].nodeValue = this.classList.contains("amounttable-expanded");
                } else {
                    const tr = document.createElement("tr");
                    tr.style.display = "";
                    tr.classList.add("amounttable-expandrow");

                    const td = tr.insertCell();
                    td.colSpan = that.header.length;

                    const tdContainer = document.createElement("div");
                    td.appendChild(tdContainer);
                    tdContainer.classList.add("amounttable-expandrow-content");

                    this.classList.add("amounttable-expanded");
                    this.attributes["aria-expanded"].nodeValue = "true";

                    this.amountTableExpandRow = tr;
                    that.settings.more.call(tdContainer, d, tdContainer);

                    this.parentNode.insertBefore(tr, this.nextSibling);
                }
            };

            row.on("click", toggler);
            row.on("keydown", function (d) {
                if (d3.event.key === "Enter" || d3.event.key === " ") {
                    d3.event.preventDefault();
                    toggler.call(this, d);
                }
            });
        }
    }

    /**
     * Setup tooltips
     * @param {D3.selection} row the rows to add the tooltip to.
     */
    addTooltips(row) {
        if (this.tooltip !== null) {
            row.on("mouseenter", d => {
                this.tooltip.html(this.settings.tooltip(d));
                this.positionTooltip(d3.event.pageX, d3.event.pageY);
                this.showTooltip(true);
            });
            row.on("mousemove", d => {
                this.positionTooltip(d3.event.pageX, d3.event.pageY);
            });
            row.on("mouseleave", d => {
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

            console.log("POSITION TOOLTIP!");
            console.log(this.tooltip);

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
     * @param {boolean} show show the tooltip
     */
    showTooltip(show) {
        const doShow = () => {
            this.tooltip
                .style("visibility", "visible");
        };

        if (this.tooltip !== null) {
            if (show) {
                tooltipTimeout = setTimeout(doShow, this.settings.tooltipDelay);
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
