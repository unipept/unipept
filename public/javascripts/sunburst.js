var w = 742,   // width
    h = w,     // height
    r = w / 2, // radius
    x = d3.scale.linear().range([0, 2 * Math.PI]), // use full circle
    y = d3.scale.linear().domain([0, 1]).range([0, r]),
    p = 5,     // padding
    duration = 2000, // animation duration
    levels = 4, // levels to show
    
     // don't change these
    currentMaxLevel = 4
    colors=["#f9f0ab", "#e8e596", "#f0e2a3", "#ede487", "#efd580", "#f1cb82", "#f1c298", "#e8b598", "#d5dda1", "#c9d2b5", "#aec1ad", "#a7b8a8", "#b49a3d", "#b28647", "#a97d32", "#b68334", "#d6a680", "#dfad70", "#a2765d", "#9f6652", "#b9763f", "#bf6e5d", "#af643c", "#9b4c3f", "#72659d", "#8a6e9e", "#8f5c85", "#934b8b", "#9d4e87", "#92538c", "#8b6397", "#716084", "#2e6093", "#3a5988", "#4a5072", "#393e64", "#aaa1cc", "#e0b5c9", "#e098b0", "#ee82a2", "#ef91ac", "#eda994", "#eeb798", "#ecc099", "#f6d5aa", "#f0d48a", "#efd95f", "#eee469", "#dbdc7f", "#dfd961", "#ebe378", "#f5e351"],
    colorCounter = 0;

var div = d3.select("#sunburst");

var vis = div.append("svg")
    .attr("width", w + p * 2)
    .attr("height", h + p * 2)
    .append("g")
    .attr("transform", "translate(" + (r + p) + "," + (r + p) + ")"); // set origin to radius center

var partition = d3.layout.partition()               // creates a new partition layout
    .sort(null)                                     // don't sort,  use tree traversal order
    .value(function(d) { return d.data.$area; })    // set the size of the pieces
    .children(function(d){return d.kids;});

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
      .attr("dy", ".2em")
      .on("click", click);
      
  textEnter.append("tspan")
      .attr("x", 0)
      .text(function(d) { return d.depth ? d.name.split(" ")[0] : ""; });
      
  textEnter.append("tspan")
      .attr("x", 0)
      .attr("dy", "1em")
      .text(function(d) { return d.depth ? d.name.split(" ")[1] || "" : ""; });
      
  textEnter.style("font-size", function(d) {return Math.min(((r / levels) / this.getComputedTextLength() * 10), 10) + "px"; })
      
  // set up start levels
  click(data);

  function click(d) {
    currentMaxLevel = d.depth + levels;
    path.transition()
      .duration(duration)
      .attrTween("d", arcTween(d));

    // Somewhat of a hack as we rely on arcTween updating the scales.
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

//returns true is label must be drawn
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
  if (d.children) {
    var colours = d.children.map(colour),
      a = d3.hsl(colours[0]),
      b = d3.hsl(colours[1]);
    // L*a*b* might be better here...
    //return d3.hsl((a.h + b.h) / 2, a.s * 1.2, a.l / 1.2);
    if(!colours[1])
        return colours[0];
    return d3.hsl((a.h + b.h) / 2, (a.s + b.s) / 2, (a.l + b.l) / 2);
  }
  if(!d.color)
    d.color = getColor();
  return d.color;
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

function getColor(){
    return colors[colorCounter++%52];
}

