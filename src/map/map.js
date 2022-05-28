import { domain, minColor, maxColor } from './constants.js';
import { loadCountryData } from "../common/loadData.js";
import { hover } from './hover.js';

// Размеры элемента с картой.
const width = 1000;
const height = 600;

// Для даты.
const margin = {
    top: 80,
    right: 6,
    bottom: 6,
    left: 6
};

// Необходимые параметры для отображения карты.
const projection = d3.geoEqualEarth();
const path = d3.geoPath(projection);
const outline = ({ type: "Sphere" });
const world = await loadCountryData();
const countries = topojson.feature(world, world.objects.countries);


// Функция для закрашивания стран на карте.
const color = d3.scaleSequential()
    .domain(domain)
    .interpolator(d3.interpolateRgb(minColor, maxColor))
    .unknown("#ccc");

// Функция для вывода даты.
function ticker(svg, keyframe) {
    const formatDate = d3.utcFormat("%d %B %Y")

    const now = svg.append("text")
        .style("font", "bold Montserrat")
        .style("font-size", `${50 / 2}px`)
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "end")
        .attr("x", width - 20)
        .attr("y", margin.top + 50 * (10 - 0.45))
        .attr("dy", "0.32em")
        .text(formatDate(keyframe[0]));

    return ([date], transition) => {
        transition.end().then(() => now.text(formatDate(date)));
    };
}

/**
 * Функция отвечает за отображение карты.
 * 
 * TODO: Многое нуждается в доработке
 */
export function showMap(svg, keyframe) {
    svg.selectAll("*").remove();

    d3.select("map").remove();
    svg.attr("id", "map").attr("viewBox", [0, 0, width, height]);

    d3.select("defs").remove();
    const defs = svg.append("defs");

    // set up outline, clipping and background of map
    defs.append("path")
        .attr("id", "outline")
        .attr("d", path(outline));

    defs.append("clipPath")
        .attr("id", "clip")
        .append("use")
        .attr("xlink:href", new URL("#outline", location));

    const g = svg.append("g")
        .attr("clip-path", `url(${new URL("#clip", location)})`);

    g.append("use")
        .attr("xlink:href", new URL("#outline", location))
        .attr("fill", "white");

    var tip;

    // fill entities according to values
    g.append("g")
        .selectAll("path")
        .data(countries.features)
        .join("path")
        .filter(function (d) { return d.properties.name != "Antarctica"; })
        .attr("fill", d => {
            return color(keyframe[1]?.find(item => item.name === d.properties.name)?.value);
        })
        .attr("d", path)
        .on("mouseover mousemove", function (event, d) {
            const pointer = d3.pointer(event);
            const data =
                d.properties.name
                + "\n" +
                "Confirmed cases: " + keyframe[1]?.find(item => item.name === d.properties.name)?.value.toString()
                + "\n" +
                "Deaths: " + keyframe[1]?.find(item => item.name === d.properties.name)?.deaths.toString()
                + "\n" +
                "Recovered: " + keyframe[1]?.find(item => item.name === d.properties.name)?.recovered.toString();
            tip.call(hover, pointer, data.split("\n"))
        })
        .on("mouseout", function () {
            tip.call(hover, null);
        });

    // draw borders
    g.append("path")
        .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path);

    // Tooltip
    tip = g.append("g")
        .attr("transform", "translate(0, -10)")
        .selectAll(".hover")
        .data([""])
        .join("g") // This gets repositioned in hover()
        .attr("class", "hover")
        .style("pointer-events", "none")
        .style("text-anchor", "middle");

    ticker(svg, keyframe);

    return svg.node();
}
