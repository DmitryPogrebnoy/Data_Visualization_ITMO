const margin = {
    top: 80,
    right: 6,
    bottom: 6,
    left: 6
};

// Number of bars
const n = 10;
// Bar size
const barSize = 48;

//Set height and width for svg view
const height = margin.top + barSize * n + margin.bottom;
const width = 1300;

const duration = 500;

// Define y scale
const y = d3.scaleBand()
    .domain(d3.range(n + 1))
    .rangeRound([margin.top, margin.top + barSize * (n + 1)])
    .padding(0.1);
// Define x scale
const x = d3.scaleLinear([0, 1], [margin.left, width - margin.right]);


function bars(svg, prev, next, color) {
    // Create bars
    let bar = svg.append("g").selectAll("rect");

    // Return function for update
    return ([date, data], transition) => bar = bar
        .data(data.slice(0, n), d => d.name)
        .join(
            enter => enter.append("rect")
                .attr("fill", color)
                .attr("height", y.bandwidth())
                .attr("x", x(0))
                .attr("y", d => y((prev.get(d) || d).rank))
                .attr("width", d => x((prev.get(d) || d).value) - x(0)),
            update => update,
            exit => exit.transition(transition).remove()
                .attr("y", d => y((next.get(d) || d).rank))
                .attr("width", d => x((next.get(d) || d).value) - x(0))
        )
        .call(bar => bar.transition(transition)
            .attr("y", d => y(d.rank))
            .attr("width", d => x(d.value) - x(0)));
}

function labels(svg, prev, next) {
    // Create labels
    let label = svg.append("g")
        .style("font", "12px Montserrat")
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "end")
        .selectAll("text");

    let is_enough_space_for_label = d => x(d.value) > 120;

    // Return function for update
    return ([date, data], transition) => label = label
        .data(data.slice(0, n), d => d.name)
        .join(
            enter => enter.append("text")
                .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
                .attr("y", y.bandwidth() / 2)
                .attr("x", -6)
                .attr("dy", "-0.25em")
                .text(d => d.name)
                .call(text => text.append("tspan")
                    .attr("fill-opacity", 1)
                    .attr("font-weight", "bold")
                    .attr("x", -6)
                    .attr("dy", "1.15em")),
            update => update,
            exit => exit.transition(transition).remove()
                .attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
                .call(g => g.select("tspan").tween("text", d => textTween(d.value, (next.get(d) || d).value)))
        )
        .call(bar => bar.transition(transition)
            .attr("text-anchor", d => {
                if (is_enough_space_for_label(d)) {
                    return "end"
                } else {
                    return "start"
                }
            })
            .attr("transform", d => {
                if (is_enough_space_for_label(d)) {
                    return `translate(${x(d.value)},${y(d.rank)})`
                } else {
                    return `translate(${x(d.value) + 10},${y(d.rank)})`
                }
            })
            .call(g => g.select("tspan").tween("text", d => textTween((prev.get(d) || d).value, d.value))))
}

function textTween(a, b) {
    const formatNumber = d3.format(",d")

    const i = d3.interpolateNumber(a, b);
    return function (t) {
        this.textContent = formatNumber(i(t));
    };
}


function axis(svg) {
    const g = svg.append("g")
        .attr("transform", `translate(0,${margin.top})`);

    const axis = d3.axisTop(x)
        .ticks(width / 100)
        .tickSizeOuter(0)
        .tickSizeInner(-barSize * (n + y.padding()));

    return (_, transition) => {
        g.transition(transition).call(axis);
        g.select(".tick:first-of-type text").remove();
        g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
        g.select(".domain").remove();
    };
}


function ticker(svg, keyframes) {
    const formatDate = d3.utcFormat("%d %B %Y")

    const now = svg.append("text")
        .style("font", "bold Montserrat")
        .style("font-size", `${barSize / 2}px`)
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "end")
        .attr("x", width - 20)
        .attr("y", margin.top + barSize * (n - 0.45))
        .attr("dy", "0.32em")
        .text(formatDate(keyframes[0][0]));

    return ([date], transition) => {
        transition.end().then(() => now.text(formatDate(date)));
    };
}

function createColorLegend(svg, category, color) {
    // Add one dot in the legend for each name.
    const size = 20
    svg.selectAll("mydots")
        .data(category)
        .enter()
        .append("rect")
        .attr("x", (d, i) => 10 + Math.floor(i / 2) * 100)
        .attr("y", (d, i) => 10 + (i % 2) * (size + 5))
        .attr("width", size)
        .attr("height", size)
        .style("fill", (d) => color(d))

    // Add one dot in the legend for each name.
    svg.selectAll("mylabels")
        .data(category)
        .enter()
        .append("text")
        .attr("x", (d, i) => 10 + Math.floor(i / 2) * 100 + size * 1.2)
        .attr("y", (d, i) => 10 + (i % 2) * (size + 5) + (size / 2)) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", (d) => color(d))
        .text((d) => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
}


let keyframes;
let nameToFrames;
let prevFrames;
let nextFrames;

const colorScale = d3.scaleOrdinal(d3.schemeTableau10);
let categoryByName;

let updateBars;
let updateAxis;
let updateLabels;
let updateTicker;

export function prepareBarData(data, keyframes) {
    if (nameToFrames === undefined) {
        nameToFrames = d3.groups(keyframes.flatMap(([, data]) => data), d => d.name);
    }
    if (prevFrames === undefined) {
        prevFrames = new Map(nameToFrames.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])));
    }
    if (nextFrames === undefined) {
        nextFrames = new Map(nameToFrames.flatMap(([, data]) => d3.pairs(data)));
    }
    if (categoryByName === undefined) {
        categoryByName = new Map(data.map(d => [d.country, d.region]))
        colorScale.domain(Array.from(categoryByName.values()));
    }
}


export function buildBarFrame(svg, keyframes) {
    svg.attr("id", "bars").attr("viewBox", [0, 0, width, height]);

    const updateColor = d => colorScale(categoryByName.get(d.name));
    updateBars = bars(svg, prevFrames, nextFrames, updateColor);
    updateAxis = axis(svg);
    updateLabels = labels(svg, prevFrames, nextFrames);
    updateTicker = ticker(svg, keyframes);

    const categorySet = Array.from(new Set(categoryByName.values())).sort((a, b) => d3.ascending(a, b))
    createColorLegend(svg, categorySet, colorScale)
}

export function showBars(svg, currentFrameNumber, keyframes) {
    let keyframe = keyframes[currentFrameNumber]
    // Extract the top bar’s value.
    x.domain([0, keyframe[1][0].value]);

    const transition = svg.transition()
        .duration(duration)
        .ease(d3.easeLinear);

    updateAxis(keyframe, transition);
    updateBars(keyframe, transition);
    updateLabels(keyframe, transition);
    updateTicker(keyframe, svg.transition().duration(1).ease(d3.easeLinear));
}