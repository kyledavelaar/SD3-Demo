(function () {
  let socket = io.connect();

  //set initial SVG params
  let margin = { top: 25, right: 20, bottom: 50, left: 50 };
  let width, height;
  let currData = [];
  let settings;
  //draw initial blank graph placeholder
  // drawAxis(
  //   d3.scaleLinear().domain([0, 20]).range([0, width]),
  //   d3.scaleLinear().domain([0, 40]).range([height, 0]),
  //   [{
  //     setWidth: 700,
  //     setHeight: 500,
  //     xTicks: 10,
  //     yTicks: 10,
  //     xLabel_text: '',
  //     yLabel_text: '',
  //   }]
  // );

  socket.on('sendLineData', (allData) => {
    if(allData.length === 0) currData = [];
    //if data is not empty or data is new...
    if (allData.length > 0 || (currData.length > 0 && allData[allData.length - 1].xScale !== currData[currData.length - 1].xScale)) {

      if (!settings) settings = drawGrid(allData);

      currData = allData;
      drawContent(settings, allData);
    };
  })

  function drawGrid(allData) {
    width = allData[0].setWidth - margin.left - margin.right;
    height = allData[0].setHeight - margin.top - margin.bottom;

    let yScale = d3.scaleLinear()
      .domain([allData[0].yDomainLower, allData[0].yDomainUpper])
      .range([height, 0]);

    d3.select('#lineSVG').remove();

    svg = d3.select('#line-chart')
      .append('svg')
      .attr('id', 'lineSVG')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('class', 'mount')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg
      .append('g')
      .attr('class', 'yAxis')
      .call(d3.axisLeft(yScale).ticks(allData[0].yTicks));

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", 0)
    .attr("dy", "1em")
    .style("text-anchor", "end")
    .style('font-family', 'sans-serif')
    .style('font-size', '13px')
    .text(allData[0].yLabel_text);

    let settings = {
      svg,
      yScale
    }

    return settings;
  }

  function drawContent(settings, allData) {
    let svg = settings.svg;
    let yScale = settings.yScale;

    let line = d3.line()
      .x(d => xScale(d.xScale))
      .y(d => yScale(d.yScale))

    let xScale;

    if (allData[0].shiftXAxis) {
      xScale = d3.scaleLinear()
        .domain([
          d3.min(allData, d => d.xScale),
          Math.max(allData[0].xDomainUpper, d3.max(allData, d => d.xScale))
        ])
        .range([0, width]);

    } else {
      xScale = d3.scaleLinear()
        .domain([allData[0].xDomainLower, allData[0].xDomainUpper])
        .range([0, width]);
    }

    svg.select('#xAxis-line').remove();

    svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .attr('id', 'xAxis-line')
      .call(d3.axisBottom(xScale).ticks(allData[0].xTicks));
    
    svg.select('#xAxis-label').remove();

    svg.append("text")
      .attr('transform', 'translate(' + (width) + ' ,' + (height + margin.bottom - 5) + ')')
      .attr('id', 'xAxis-label')
      .style('text-anchor', 'end')
      .style('font-family', 'sans-serif')
      .style('font-size', '13px')
      .text(allData[0].xLabel_text);

    let renderedLine = svg
      .selectAll('.line')
      .data(allData)

    renderedLine.exit().remove().transition(300).attr('opacity', 1);

    let newLine = renderedLine
      .enter()
      .append('path')
      .transition()
      .duration(1000)
      .attr("opacity", 1)
      .attr('class', 'line')
      .attr('d', d => line(allData))
      .style('stroke', '#5176B6')
      .style('stroke-width', 1)
      .style('fill', 'none')
      .style('stroke-linejoin', 'round');

    renderedLine.transition()
      .duration(1000)
      .attr('d', d => line(allData));

    let dots = svg.selectAll('.dot')
      .data(allData);
    
    dots.exit().remove();

    let newDots = dots
      .enter()
      .append('circle')
      .transition()
      .duration(1000)
      .attr("opacity", 1)
      .attr('class', 'dot')
      .attr('cx', line.x())
      .attr('cy', line.y())
      .attr('r', 3)
      .style('fill', 'white')
      .style('stroke-width', 1.5)
      .style('stroke', 'DodgerBlue');
      //TOOL TIP OPTION
//     .on("mouseover", function(d) {
//        div.transition()
//          .duration(200)
//          .style("opacity", .9);
//        div.html("<h1>hello</h1>" /*allData[0].yScale*/)
//          .style("left", (d3.event.pageX) + "px")
//          .style("top", (d3.event.pageY) + "px");
//        })
//      .on("mouseout", function(d) {
//        div.transition()
//          .duration(500)
//          .style("opacity", 0);
//        });
    dots.transition()
      .duration(1000)
      .attr('cx', line.x())
      .attr('cy', line.y())
  }
})();
