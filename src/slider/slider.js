var formatDateUnderTicker = d3.timeFormat("%b %y");
var formatDateLabel = d3.timeFormat("%d %b %Y");

// First and last dates in the dataset
var startDate = new Date("2020-01-22"),
    endDate = new Date("2021-05-29");

var margin = {right:50, left:50},
    width = 585 - margin.left - margin.right,
    height = 70;

// Number of keyframes (of dates in dataset)
var maxRangeValue = 493;


var slider;
var handle;
var label;
var x;

export function createSlider(slider_panel, update_func) {
    var svg = slider_panel
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height);

    x = d3.scaleTime()
        .domain([startDate, endDate])
        .range([0, maxRangeValue])
        .clamp(true);

    slider = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + height/2 + ")");

    slider.append("line")
        .style("stroke-linecap", "round")
        .style("stroke", "#000")
        .style("stroke-opacity", "0.3")
        .style("stroke-width", "10px")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .style("stroke-linecap", "round")
        .style("stroke", "#dcdcdc")
        .style("stroke-width", " 8px")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .style("stroke-linecap", "round")
        .style("pointer-events", "stroke")
        .style("stroke-width", "50px")
        .style("stroke", "transparent")
        .style("cursor", "pointer")
        .call(d3.drag()
            .on("start.interrupt", function() {
                slider.interrupt();
            })
            .on("start drag", function(e) {
                let new_x = Math.round(e.x);
                if (new_x < 0) {
                    new_x = 0
                } else if (new_x > maxRangeValue) {
                    new_x = maxRangeValue
                }

                handle.attr("cx",new_x);
                label.attr("x", new_x)
                    .text(formatDateLabel(x.invert(new_x)));
                update_func(new_x)
            })
        );

    slider.insert("g", ".track-overlay")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(x.ticks(8))
        .enter()
        .append("text")
        .attr("x", x)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatDateUnderTicker(d); });

    handle = slider.insert("circle", ".track-overlay")
        .attr("r", 9);

    label = slider.append("text")
        .attr("text-anchor", "middle")
        .text(formatDateLabel(startDate))
        .attr("transform", "translate(0," + (-13) + ")")
}

export function updateSliderDot(new_x) {
    handle.attr("cx",new_x);
    label.attr("x", new_x)
        .text(formatDateLabel(x.invert(new_x)));
}




