 (function () {
    var constructBarchart = function constructBarchart(element, data) {

        // transform to array of arrays
        var ecArray = []
        for (var key in data) {
            ecArray.push([key,data[key][1]])
        }

        // sort the array of arrays
        function Comparator(a,b){
            if (a[1] < b[1]) return -1;
            if (a[1] > b[1]) return 1;
            return 0;
        }

        ecArray = ecArray.sort(Comparator).reverse().slice(0,10);

        var yValues = ecArray.map( function (d) { return d[0] });
        var oyValues = jQuery.extend(true, [], yValues);
            yValues.unshift("")

        var xValues = ecArray.map( function (d) { return d[1] });

        var colors = ['#0094ff'];

        var xscale = d3.scale.linear()
                        .domain([0,d3.max(xValues)])
                        .range([0,730]);

        var yscale = d3.scale.linear()
                        .domain([0,yValues.length])
                        .range([0,480]);

        var colorScale = d3.scale.quantize()
                        .domain([0,yValues.length])
                        .range(colors);

        var canvas = d3.select(element)
                        .append('svg')
                        .attr({'width':900,'height':550});

        var xAxis = d3.svg.axis();
            xAxis
                .orient('bottom')
                .scale(xscale)

        var yAxis = d3.svg.axis();
            yAxis
                .orient('left')
                .scale(yscale)
                .tickSize(1)
                .tickFormat(function(d,i){ return yValues[i]; })
                .tickValues(d3.range(yValues.length));

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
                            .data(xValues)
                            .enter()
                            .append('rect')
                            .attr('height',40)
                            .attr({'x':0,'y':function(d,i){ return yscale(i)+30; }})
                            .style('fill',function(d,i){ return colorScale(i); })
                            .attr('width',function(d){ return xscale(d); });

        var transitext = d3.select('#bars')
                            .selectAll('text')
                            .data(xValues)
                            .enter()
                            .append('text')
                            .attr({'x':function(d) {return 5; },'y':function(d,i){ return yscale(i)+52; }})
                            .text(function(d,i) { return data[oyValues[i]][0];}).style({'fill':'#000','font-size':'12px'});

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
