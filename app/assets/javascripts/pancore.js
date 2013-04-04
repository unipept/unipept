function init_pancore(genomes, pans, cores) {
  // set up vars
  var data = {};

  // add handlers to the form
  $("#load_sequences").click(function () {
    var id = $("#sequence_id").val();
    $.getJSON("/pancore/sequences/" + id + ".json", function (json_data) {
      data[id] = new JS.Set(json_data);
      console.log(data);
    });
    return false;
  });
  
    var data2 = new Array();
    for(i = 0; i < genomes.length; i++){
        data2[i] = new Array();
        data2[i]["name"] = genomes[i];
        data2[i]["pan"] = pans[i];
        data2[i]["core"] = cores[i];
    }

	// colors
	var panColor = "steelblue";
	var coreColor = "#ff7f0e";
	
	// size
    var margin = {top: 20, right: 20, bottom: 170, left: 60},
        width = 920 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;
	
	// scales
    var x = d3.scale.ordinal()
        .rangePoints([0, width], 1);
    var y = d3.scale.linear()
        .range([height, 0]);

	// mouse over width
	var mouseOverWidth = (width / data2.length) / 1.5;

	// axes
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    
	// graph lines helpers
    var panLine = d3.svg.line()
        .interpolate("linear")
        .x(function(d) { return x(d.name); })
        .y(function(d) { return y(d.pan); }); 
    var coreLine = d3.svg.line()
        .interpolate("linear")
        .x(function(d) { return x(d.name); })
        .y(function(d) { return y(d.core); });

	// create the svg
    var svg = d3.select("#pancore_graph")
	  .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// create the tooltip
    var tooltip = d3.select("#pancore_graph")
      .append("div")
    	.attr("class", "tip")
    	.style("position", "absolute")
    	.style("z-index", "10")
		.html ("test")
    	.style("visibility", "hidden");
    
    //dropshadow filter
    var temp = svg.append("svg:defs")
        .append("svg:filter")
            .attr("id", "dropshadow");
    temp.append("svg:feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 1);
    temp = temp.append("svg:feMerge");
    temp.append("svg:feMergeNode");
    temp.append("svg:feMergeNode")
            .attr("in", "SourceGraphic");

	// set the domains
    x.domain(data2.map(function(d) { return d.name; }));
    y.domain([0, d3.max(data2, function(d) { return d.pan; })]);

	// add the x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    // rotate the x-axis labels
    svg.selectAll(".x.axis text")
		.style("text-anchor", "end")
        .attr("transform", "translate(-5,0)rotate(-45)");
	
	// add the y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Number of peptides");

	// add legend
	var legend = svg.selectAll(".legend")
	      .data([{"name": "pan proteome", "color": panColor}, {"name": "core proteome", "color": coreColor}])
	    .enter().append("g")
	      .attr("class", "legend")
	      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
	  legend.append("rect")
	      .attr("x", 30)
	      .attr("width", 8)
	      .attr("height", 8)
	      .style("fill", function(d) { return d.color; });
	  legend.append("text")
	      .attr("x", 40)
	      .attr("y", 4)
	      .attr("dy", ".35em")
	      .style("text-anchor", "start")
	      .text(function(d) { return d.name; });
	
	// draw the lines
    svg.append("path")
        .datum(data2)
        .attr("class", "line pan")
        .attr("d", panLine);       
    svg.append("path")
        .datum(data2)
        .attr("class", "line core")
        .attr("d", coreLine);
		
	// draw the dots
    svg.selectAll(".dot.pan")
        .data(data2)
      .enter().append("circle")
        .attr("class", function(d, i) { return "dot pan _" + i; })
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.name); })
        .attr("cy", function(d) { return y(d.pan); })
        .attr("fill", panColor);
    svg.selectAll(".dot.core")
        .data(data2)
      .enter().append("circle")
        .attr("class", function(d, i) { return "dot core _" + i; })
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.name); })
        .attr("cy", function(d) { return y(d.core); })
        .attr("fill", coreColor);

	// mouseover rects
	svg.selectAll(".bar")
		.data(data2)
	.enter().append("rect")
        .attr("class", "bar pan")
		.style("fill-opacity", "0")
        .attr("x", function(d) { return x(d.name) - mouseOverWidth / 2; })
        .attr("width", mouseOverWidth)
        .attr("y", "0")
        .attr("height", height)
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut)
        .on("mousemove", mouseMove);
        
    // mouseover functions
    function mouseOver(d, i) {
        // add dropshadow to the dot
        svg.selectAll(".dot._" + i)
            .attr("filter", "url(#dropshadow)");
            
        // add gray hairlines
        svg.insert("line", ".dot")
            .attr("class", "hairline")
            .attr("x1", x(data2[Math.max(0, i-1)].name))
            .attr("x2", x(data2[Math.min(data2.length - 1, i+1)].name))
            .attr("y1", function(d) { return y(data2[i].core); })
            .attr("y2", function(d) { return y(data2[i].core); })
            .attr("stroke", "#cccccc")
            .attr("shape-rendering", "crispEdges");
        svg.insert("line", ".dot")
            .attr("class", "hairline")
            .attr("x1", x(data2[Math.max(0, i-1)].name))
            .attr("x2", x(data2[Math.min(data2.length - 1, i+1)].name))
            .attr("y1", function(d) { return y(data2[i].pan); })
            .attr("y2", function(d) { return y(data2[i].pan); })
            .attr("stroke", "#cccccc")
            .attr("shape-rendering", "crispEdges");
            
        // add axis marks
        svg.insert("line")
            .attr("class", "axisline")
            .attr("x1", "6")
            .attr("x2", "-6")
            .attr("y1", function(d) { return y(data2[i].pan); }) 
            .attr("y2", function(d) { return y(data2[i].pan); })
            .attr("stroke", panColor)
            .attr("stroke-width", "2")
            .attr("shape-rendering", "crispEdges");
        svg.insert("line")
            .attr("class", "axisline")
            .attr("x1", "6")
            .attr("x2", "-6")
            .attr("y1", function(d) { return y(data2[i].core); })
            .attr("y2", function(d) { return y(data2[i].core); })
            .attr("stroke", coreColor)
            .attr("stroke-width", "2")
            .attr("shape-rendering", "crispEdges");
		
		// show tooltip
		tooltip
			.style("visibility", "visible")
            .html("<b>" + d.name + "</b><br/>" + 
			"<span style='color: " + panColor + ";'>&#9632;</span> pan: <b>" + d3.format(",")(data2[i].pan) + "</b><br/>" +
			"<span style='color: " + coreColor + ";'>&#9632;</span> core: <b>" + d3.format(",")(data2[i].core) + "</b>");
    }
    function mouseOut(d, i) {
        svg.selectAll(".dot._" + i)
            .attr("filter", "");
        svg.selectAll(".hairline").remove();    
        svg.selectAll(".axisline").remove();
		tooltip.style("visibility", "hidden");
    }
	function mouseMove(d, i) {
		tooltip.style("top", (d3.event.pageY + 15) + "px").style("left", (d3.event.pageX + 15) + "px");
	}
}