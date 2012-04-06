var w = 742,   // width
    h = w,     // height
    r = w / 2, // radius
    x = d3.scale.linear().range([0, 2 * Math.PI]), // use full circle
    y = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, r]), // higher levels get longer pieces, is exponent needed?
    p = 5,     // padding
    duration = 1000, // animation duration
    levels = 4, // levels to show
    currentMaxLevel = 4;

var div = d3.select("#sunburst");

var vis = div.append("svg")
    .attr("width", w + p * 2)
    .attr("height", h + p * 2)
    .append("g")
    .attr("transform", "translate(" + (r + p) + "," + (r + p) + ")"); // set origin to radius center

var partition = d3.layout.partition()               // creates a new partition layout
    .sort(null)                                     // don't sort,  use tree traversal order
    .value(function(d) { return d.data.$area; })    // set the size of the pieces
    .children(function(d){return d.data.level < 7 ? d.kids : null;}); //hack to only show 4 levels

// calculate arcs out of partition coordinates
var arc = d3.svg.arc()                              
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); }) // start between 0 and 2Pi
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); }) // stop between 0 and 2Pi
    .innerRadius(function(d) { return Math.max(0, Math.min(r,d.y ? y(d.y) : d.y)); }) // prevent y-calculation on 0
    .outerRadius(function(d) { return Math.max(0, Math.min(r,y(d.y + d.dy))); });
    
function initSunburst(data){
  // run the partition layout
  var nodes = partition.nodes(data); 

  var path = vis.selectAll("path").data(nodes);
  path.enter().append("path")                               // for every node, draw an arc
      .attr("id", function(d, i) { return "path-" + i; })   // id based on index
      .attr("d", arc)                                       // path data
      .attr("fill-rule", "evenodd")                         // fill rule
      .style("fill", colour)                                // call function for colour
      .on("click", click);                                  // call function on click
  
  // put labels on the nodes
  var text = vis.selectAll("text").data(nodes);
  var textEnter = text.enter().append("text")
      .style("opacity", 1)
      .style("fill", function(d) {
        return brightness(d3.rgb(colour(d))) < 125 ? "#eee" : "#000"; // calculate text color
      })
      .attr("text-anchor", function(d) {
        return x(d.x + d.dx / 2) > Math.PI ? "end" : "start"; // start text at center or outer side?
      })
      .attr("dy", ".2em")
      .attr("transform", function(d) { // multi line text
        var multiline = (d.name || "").split(" ").length > 1,
            angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
            rotate = angle + (multiline ? -.5 : 0);
        return "rotate(" + rotate + ")translate(" + (y(d.y) + p) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
      })
      .on("click", click);
  textEnter.append("tspan")
      .attr("x", 0)
      .text(function(d) { return d.depth ? d.name.split(" ")[0] : ""; });
  textEnter.append("tspan")
      .attr("x", 0)
      .attr("dy", "1em")
      .text(function(d) { return d.depth ? d.name.split(" ")[1] || "" : ""; });
      
  // set up start levels
  click(data);

  function click(d) {
    currentMaxLevel = d.depth + levels;
    path.transition()
      .duration(duration)
      .attrTween("d", arcTween(d));

    // Somewhat of a hack as we rely on arcTween updating the scales.
    // http://bl.ocks.org/1846692 <- text scale
    text
      .style("visibility", function(e) {
        return isParentOf(d, e) ? null : d3.select(this).style("visibility");
      })
      .transition().duration(duration)
      .attrTween("text-anchor", function(d) {
        return function() {
          return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
        };
      })
      .attrTween("transform", function(d) {
        var multiline = (d.name || "").split(" ").length > 1;
        return function() {
          var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
              rotate = angle + (multiline ? -.5 : 0);
          return "rotate(" + rotate + ")translate(" + (y(d.y) + p) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
        };
      })
      .style("opacity", function(e) { return isParentOf(d, e) ? 1 : 1e-6; })
      .each("end", function(e) {
        d3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden");
      });
  }
}
function isParentOf(p, c) {
  if (c.depth >= currentMaxLevel) return false;
  if (p === c) return true;
  if (p.children) {
    return p.children.some(function(d) {
      return isParentOf(d, c);
    });
  }
  return false;
}

function colour(d) {
  return d.data.$color || "#000";
}

// Interpolate the scales!
// Defines new scales based on the clicked item
function arcTween(d) {
  var my = Math.min(maxY(d), d.y + levels * d.dy),
      xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
      yd = d3.interpolate(y.domain(), [d.y, my]),
      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, r]);
  return function(d) {
    return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
  };
}

// calculate the max-y of the clicked item
function maxY(d) {
  return d.children ? Math.max.apply(Math, d.children.map(maxY)) : d.y + d.dy;
}

// http://www.w3.org/WAI/ER/WD-AERT/#color-contrast
function brightness(rgb) {
  return rgb.r * .299 + rgb.g * .587 + rgb.b * .114;
}

