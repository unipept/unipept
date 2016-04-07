// visualization for interpro

(function () {
  var constructPiechart = function constructPiechart(element, args){

    // options
    var that = {},
        multi = args.multi
        pieId = element.id;

    // settings
    var color = d3.scale.ordinal()
        .range(["#f9f0ab", "#e8e596", "#f0e2a3", "#ede487", "#efd580", "#f1cb82", "#f1c298", "#e8b598", "#d5dda1", "#c9d2b5", "#aec1ad", "#a7b8a8", "#b49a3d", "#b28647", "#a97d32", "#b68334", "#d6a680", "#dfad70", "#a2765d", "#9f6652", "#b9763f", "#bf6e5d", "#af643c", "#9b4c3f", "#72659d", "#8a6e9e", "#8f5c85", "#934b8b", "#9d4e87", "#92538c", "#8b6397", "#716084", "#2e6093", "#3a5988", "#4a5072", "#393e64", "#aaa1cc", "#e0b5c9", "#e098b0", "#ee82a2", "#ef91ac", "#eda994", "#eeb798", "#ecc099", "#f6d5aa", "#f0d48a", "#efd95f", "#eee469", "#dbdc7f", "#dfd961", "#ebe378", "#f5e351"]);

    // layout    
    var width = 960,
        height = 500,
        radius = Math.min(width, height) / 2;

    // components
    var tooltip = d3.select("#tooltip"), // still has to be changed
        arc, // the arc function
        text; // all text nodes

    // data
    var data = [
                  { "name": "IPR000001", "function": "something 1", "amount": 12000},
                  { "name": "IPR000002", "function": "something 2", "amount": 2000},
                  { "name": "IPR000003", "function": "something 3", "amount": 17000},
                  { "name": "IPR000004", "function": "something 4", "amount": 15000},
                  { "name": "IPR000005", "function": "something 5", "amount": 14000},
                  { "name": "IPR000006", "function": "something 6", "amount": 17000},
                  { "name": "IPR000007", "function": "something 7", "amount": 1000},
                  { "name": "IPR000008", "function": "something 8", "amount": 100},
                  { "name": "IPR000009", "function": "something 9", "amount": 36000},
                  { "name": "IPR000010", "function": "something 10", "amount": 6000},
                  { "name": "IPR000011", "function": "something 11", "amount": 14000},
                  { "name": "IPR000012", "function": "something 12", "amount": 5000},
                  { "name": "IPR000013", "function": "something 13", "amount": 12345},
                  { "name": "IPR000014", "function": "something 14", "amount": 12345}
                ]

    // initialize functions
    function init() {

      draw();
      
    }

    /**
     * draws the piechart
     */
    function draw() {
      var vis, // the visualisation
          textEnter; // new text nodes

      // clear everything
      $("#"+pieId+" svg").remove();

      var arc = d3.svg.arc()
          .outerRadius(radius - 10)
          .innerRadius(0);

      var labelArc = d3.svg.arc()
          .outerRadius(radius - 40)
          .innerRadius(radius - 40);

      var pie = d3.layout.pie()
          .sort(null)
          .value(function(d) { return d.amount; }); // population has to be EC column name

      var svg = d3.select("#"+pieId).append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var g = svg.selectAll(".arc")
          .data(pie(data))
          .enter().append("g")
          .attr("class", "arc");

      g.append("path")
          .attr("d", arc)
          .style("fill", function(d) { return color(d.data.name); })
          .on("mouseover", function (d) { multi.tooltipInPieChart(d, tooltip); })
          .on("mousemove", function () { multi.tooltipMove(tooltip); })
          .on("mouseout", function () { multi.tooltipOut(tooltip); });

      //var text = g.append("text")
      //    .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
      //    .attr("dy", ".35em")
      //    .text(function(d) { return d.data.id; });
    }
    init();
  };

  function Plugin(option) {
      var dt = Object  
      var plug = this.each(function () {
          var $this = $(this);
          var data = $this.data('vis.piechart');
          var options = $.extend({}, $this.data(), typeof option === 'object' && option);

          if (!data) {
              data = new constructPiechart(this, options);
              dt = data;
              $this.data('vis.piechart', (data));
          }
          if (typeof option === 'string') {
              data[option]();
          }
      });
      return dt
  }

  $.fn.piechart = Plugin;
  $.fn.piechart.Constructor = constructPiechart;
})();
