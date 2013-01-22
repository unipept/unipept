function init_pancore(genomes, pans, cores) {
    var data = new Array();
    for(i = 0; i < genomes.length; i++){
        data[i] = new Array();
        data[i]["name"] = genomes[i];
        data[i]["pan"] = pans[i];
        data[i]["core"] = cores[i];
    }
    var margin = {top: 20, right: 20, bottom: 70, left: 60},
        width = 920 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]).nice();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select("#pancore_graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function(d) { return d.name; }));
    y.domain([0, d3.max(data, function(d) { return d.pan; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    
    svg.selectAll(".x.axis text")
        .attr("transform", function(d) {
            //return "rotate(-45)translate(" + this.getBBox().height/2 + "," + this.getBBox().width/-2 + ")";
            return "rotate(-45)translate(-" + this.getBBox().width/2 + ",0)";
            //return "rotate(-45)translate(0,0)";
           });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Number of peptides");

    svg.selectAll(".bar.pan")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar pan")
        .attr("x", function(d) { return x(d.name); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.pan); })
        .attr("height", function(d) { return height - y(d.pan); });
      
    svg.selectAll(".bar.core")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar core")
        .attr("x", function(d) { return x(d.name); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.core); })
        .attr("height", function(d) { return height - y(d.core); });

}