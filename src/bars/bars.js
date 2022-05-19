import {loadData} from "../common/loadData.js";

const margin = {
    top: 32,
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
const width = 900;

// Define y scale
const y = d3.scaleBand()
    .domain(d3.range(n + 1))
    .rangeRound([margin.top, margin.top + barSize * (n + 1)])
    .padding(0.1);
// Define x scale
const x = d3.scaleLinear([0, 1], [margin.left, width - margin.right]);

// Load data promise
const dataPromise = loadData()


function rank(names, value) {
    const data = Array.from(names, name => ({name, value: value(name)}));
    data.sort((a, b) => d3.descending(a.value, b.value));
    for (let i = 0; i < data.length; ++i) {
        data[i].rank = Math.min(n, i);
    }
    return data;
}

// Number of frames per year
const k = 12

async function computeFrames() {
    const data = await dataPromise;
    const brandNames = new Set(data.map((d) => d.name));
    const rollupedData = d3.rollup(
        data, ([d]) => d.value, (d) => d.date, (d) => d.name
    );
    const dateValues =  Array.from(rollupedData).sort(([a], [b]) => d3.ascending(a, b))

    let keyframes = [];
    let ka, a, kb, b;
    for ([[ka, a], [kb, b]] of d3.pairs(dateValues)) {
        for (let i = 0; i < k; ++i) {
            const t = i / k;
            keyframes.push([
                new Date(ka * (1 - t) + kb * t),
                rank(await brandNames, name => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
            ]);
        }
    }
    keyframes.push([new Date(kb), rank(dateValues, name => b.get(name) || 0)]);

    return keyframes;
}


function bars(svg, prev, next) {
    let bar = svg.append("g")
        .attr("fill-opacity", 0.6)
        .selectAll("rect");

    return ([date, data], transition) => bar = bar
        .data(data.slice(0, n), d => d.name)
        .join(
            enter => enter.append("rect")
                .attr("fill", color(data))
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
    let label = svg.append("g")
        .style("font", "bold 12px var(--sans-serif)")
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "end")
        .selectAll("text");

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
            .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
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
    const formatDate = d3.utcFormat("%B %Y")

    const now = svg.append("text")
        .style("font", "bold var(--sans-serif)")
        .style("font-size", `${barSize/2}px`)
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

function color(data) {
    const scale = d3.scaleOrdinal(d3.schemeTableau10);
    if (data.some(d => d.category !== undefined)) {
        const categoryByName = new Map(data.map(d => [d.name, d.category]))
        scale.domain(Array.from(categoryByName.values()));
        return d => scale(categoryByName.get(d.name));
    }
    return d => scale(d.name);
}

async function createAndRunBars() {
    let duration = 500;
    let keyframes = await computeFrames();

    let nameFrames = d3.groups(keyframes.flatMap(([, data]) => data), d => d.name);
    let prevFrames = new Map(nameFrames.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])));
    let nextFrames = new Map(nameFrames.flatMap(([, data]) => d3.pairs(data)));

    const svg = d3.select("body").append("svg").attr("viewBox", [0, 0, width, height]);

    const updateBars = bars(svg, prevFrames, nextFrames);
    const updateAxis = axis(svg);
    const updateLabels = labels(svg, prevFrames, nextFrames);
    const updateTicker = ticker(svg, keyframes);

    for (const keyframe of keyframes) {
        if (!keyframe[1]) {
            continue
        }

        const transition = svg.transition()
            .duration(duration)
            .ease(d3.easeLinear);

        // Extract the top bar’s value.
        x.domain([0, keyframe[1][0].value]);

        updateAxis(keyframe, transition);
        updateBars(keyframe, transition);
        updateLabels(keyframe, transition);
        updateTicker(keyframe, transition);

        await transition.end();
    }
    svg.remove()
}

export { createAndRunBars };