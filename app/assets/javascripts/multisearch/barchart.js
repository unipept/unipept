 (function () {
    var constructBarchart = function constructBarchart(element, args) {

        // options
        var that = {}, 
            multi = args.multi,
            data = args.data

        // variables
        var limit = 10,
            yValues = []

        data.sort(function(a, b){
          return a.count - b.count;
        }).reverse();

        var colors = ['#0094ff'];

        var xscale = d3.scale.linear()
                        .domain([0,11])
                        .range([0,730]);

        var yscale = d3.scale.linear()
                        .domain([0,limit+1])
                        .range([0,480]);

        var colorScale = d3.scale.quantize()
                        .domain([0,limit+1])
                        .range(colors);

        var canvas = d3.select(element)
                        .append('svg')
                        .attr({'width':900,'height':550});

        var xAxis = d3.svg.axis();
            xAxis
                .orient('bottom')
                .scale(xscale)

        function getYAxis(data){
          var i = 0
          while (i < limit) {
            yValues.push(data[i]["name"])
            i++
          }
          console.log(yValues)
          return yValues
        };
        getYAxis(data).unshift("")

        var yAxis = d3.svg.axis();
            yAxis
                .orient('left')
                .scale(yscale)
                .tickSize(1)
                .tickFormat(function(d,i){ if (i < (limit+1)) return yValues[d]; })
                .tickValues(d3.range(limit+1));

        var y_xis = canvas.append('g')
                          .attr("transform", "translate(100,20)")
                          .attr('id','yaxis')
                          .call(yAxis);

        var x_xis = canvas.append('g')
                          .attr("transform", "translate(100,480)")
                          .attr('id','xaxis')
                          .call(xAxis);

        var y_label = canvas.append("text")
                          .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                          .attr("transform", "translate("+ (70/2) +","+(480/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
                          .text("EC numbers");

        var y_label = canvas.append("text")
                          .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                          .attr("transform", "translate("+ (900/2) +","+(550-(70/3))+")")  // text is drawn off the screen top left, move down and out and rotate
                          .text("Amount");

        var chart = canvas.append('g')
                            .attr("transform", "translate(100,15)")
                            .attr('id','bars')
                            .selectAll('rect')
                            .data(data)
                            .enter()
                            .append('rect')
                            .attr('height',40)
                            .attr({'x':0,'y':function(d,i){ if (i < limit) return yscale(i)+30; }})
                            .style('fill',function(d,i){ if (i < limit) return colorScale(i); })
                            .attr('width',function(d, i){ if (i < limit) return xscale(d.count); })
                            .on("mouseover", function (d) { multi.tooltipInChart(d, tooltip); })
                            .on("mousemove", function () { multi.tooltipMove(tooltip); })
                            .on("mouseout", function () { multi.tooltipOut(tooltip); });

        var transitext = d3.select('#bars')
                            .selectAll('text')
                            .data(data)
                            .enter()
                            .append('text')
                            .attr({'x':function(d) {return 5; },'y':function(d,i){ if (i < limit) return yscale(i)+52; }})
                            .text(function(d,i) { if (i < limit) return d.function;}).style({'fill':'#000','font-size':'12px'});

    }

    function Plugin(option) {
      var dt = Object  
      var plug = this.each(function () {
          var $this = $(this);
          var data = $this.data('vis.barchart');
          var options = $.extend({}, $this.data(), typeof option === 'object' && option);

          if (!data) {
              data = new constructBarchart(this, options);
              dt = data;
              $this.data('vis.barchart', (data));
          }
          if (typeof option === 'string') {
              data[option]();
          }
      });
      return dt
    }

  $.fn.barchart = Plugin;
  $.fn.barchart.Constructor = constructBarchart;
})();
