function init_pancore(genomes, pans, cores) {
    var data = new Array();
    for(i = 0; i < genomes.length; i++){
        data[i] = new Array();
        data[i]["name"] = genomes[i];
        data[i]["pan"] = pans[i];
        data[i]["core"] = cores[i];
    }
    var margin = {top: 20, right: 20, bottom: 170, left: 60},
        width = 920 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        //.rangeRoundBands([0, width], .1);
        .rangePoints([0, width], 1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    
    var panLine = d3.svg.line()
        .interpolate("linear")
        .x(function(d) { return x(d.name); })
        .y(function(d) { return y(d.pan); });
    
    var coreLine = d3.svg.line()
        .interpolate("linear")
        .x(function(d) { return x(d.name); })
        .y(function(d) { return y(d.core); });

    var svg = d3.select("#pancore_graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
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

    x.domain(data.map(function(d) { return d.name; }));
    y.domain([0, d3.max(data, function(d) { return d.pan; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    
    svg.selectAll(".x.axis text")
		.style("text-anchor", "end")
        .attr("transform", "translate(-5,0)rotate(-45)");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Number of peptides");

   /* svg.selectAll(".bar.pan")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar pan")
        .attr("x", function(d) { return x(d.name); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.pan); })
        .attr("height", function(d) { return height - y(d.pan); });*/
      
 /*   svg.selectAll(".bar.core")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar core")
        .attr("x", function(d) { return x(d.name); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.core); })
        .attr("height", function(d) { return height - y(d.core); });*/

    svg.append("path")
        .datum(data)
        .attr("class", "line pan")
        .attr("d", panLine);
        
    svg.append("path")
        .datum(data)
        .attr("class", "line core")
        .attr("d", coreLine);

    svg.selectAll(".dot.pan")
        .data(data)
      .enter().append("circle")
        .attr("class", function(d, i) { return "dot pan _" + i; })
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.name); })
        .attr("cy", function(d) { return y(d.pan); })
        .attr("fill", "steelblue")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    svg.selectAll(".dot.core")
        .data(data)
      .enter().append("circle")
        .attr("class", function(d, i) { return "dot core _" + i; })
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.name); })
        .attr("cy", function(d) { return y(d.core); })
        .attr("fill", "#ff7f0e")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);
        
    // mouseover functions
    function mouseover(d, i) {
        // add dropshadow to the dot
        svg.selectAll(".dot._" + i)
            .attr("filter", "url(#dropshadow)");
            
        // add gray hairlines
        svg.insert("line", ".dot")
            .attr("class", "hairline")
            .attr("x1", x(data[Math.max(0, i-1)].name))
            .attr("x2", x(data[Math.min(data.length - 1, i+1)].name))
            .attr("y1", function(d) { return y(data[i].core); })
            .attr("y2", function(d) { return y(data[i].core); })
            .attr("stroke", "#cccccc")
            .attr("shape-rendering", "crispEdges");
        svg.insert("line", ".dot")
            .attr("class", "hairline")
            .attr("x1", x(data[Math.max(0, i-1)].name))
            .attr("x2", x(data[Math.min(data.length - 1, i+1)].name))
            .attr("y1", function(d) { return y(data[i].pan); })
            .attr("y2", function(d) { return y(data[i].pan); })
            .attr("stroke", "#cccccc")
            .attr("shape-rendering", "crispEdges");
            
        // add axis marks
        svg.insert("line")
            .attr("class", "axisline")
            .attr("x1", "6")
            .attr("x2", "-6")
            .attr("y1", function(d) { return y(data[i].pan); }) 
            .attr("y2", function(d) { return y(data[i].pan); })
            .attr("stroke", "steelblue")
            .attr("stroke-width", "2")
            .attr("shape-rendering", "crispEdges");
        svg.insert("line")
            .attr("class", "axisline")
            .attr("x1", "6")
            .attr("x2", "-6")
            .attr("y1", function(d) { return y(data[i].core); })
            .attr("y2", function(d) { return y(data[i].core); })
            .attr("stroke", "#ff7f0e")
            .attr("stroke-width", "2")
            .attr("shape-rendering", "crispEdges");
    }
    function mouseout(d, i) {
        svg.selectAll(".dot._" + i)
            .attr("filter", "");
        svg.selectAll(".hairline").remove();    
        svg.selectAll(".axisline").remove();
    }
}