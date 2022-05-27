// Размеры элемента с картой.
const width = 1000;
const height = 600;

// Необходимые параметры для отображения карты.
const projection = d3.geoEqualEarth();
const path = d3.geoPath(projection);
const outline = ({ type: "Sphere" });
const world = JSON.parse(worldmap);
const countries = topojson.feature(world, world.objects.countries);

// Диапазон допустимых значений (в данном случае - случаев заражения),
// именно в этом диапазоне будет применяться закрашивание 
// с соответствующим цветом для минимального, максимального и промежуточных значений.
// (работает с помощью встроенной функции d3 для интерполяции).

// на данный момент для максимального значения взято число 1 000 000
// TODO: нужно подобрать более подходящее и соответствующую цветовую гамму.
const domain = [0, 100000];
const minColor = "#e8776f";
const maxColor = "#730c05";

// Функция для закрашивания стран на карте.
const color = d3.scaleSequential()
    .domain(domain)
    .interpolator(d3.interpolateRgb(minColor, maxColor))
    .unknown("#ccc")

/**
 * Функция отвечает за отображение карты.
 * 
 * TODO: Многое нуждается в доработке
 */
export function showMap(svg, keyframe) {
    svg.attr("id", "map").attr("viewBox", [0, 0, width, height]);

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
        // tooltip
        .append("title")
        .text(d => `${d.properties.name}`);

    // draw borders
    g.append("path")
        .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path);

    return svg.node();
}
