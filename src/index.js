import {createAndRunBars} from "./bars/bars.js";
import {loadData} from "./common/loadData.js";

// Load data
const data = await loadData();

const body = d3.select("body");
const head = body.append("div").attr("id", "head").attr("align", "center")
head.append("h1").text("Covid-19 Country Spread")
    .attr("class", "head")
    .style("font-family", "Montserrat")
    .style("font", "bold")
    .style("font-size", `50px`);

// Fuck this radio button's labels!
const main_button_panel = body.append("div").attr("id", "main_button_panel").attr("align", "center")
main_button_panel.append("label")
    .text("Map Chart")
    .style("font-family", "Montserrat")
    .style("margin-right", "4em")
    .insert("input")
    .attr("id", "map_button")
    .attr("type", "radio")
    .attr("name", "chart_type")

main_button_panel.append("label")
    .text("Bar Chart")
    .style("font-family", "Montserrat")
    .insert("input")
    .attr("id", "bar_button")
    .attr("type", "radio")
    .attr("name", "chart_type")
    .attr("checked", "1");

const slider_panel = body.append("div")
    .attr("id", "slider_panel")
    .attr("align", "center")
    .style("margin-top", "2em");
slider_panel.append("input")
    .attr("type", "range")
    .attr("min", 10)
    .attr("max", 100);

const main_panel = body.append("div").attr("id", "main_panel");

var svg = main_panel.append("svg");

main_panel.append("button")
    .text("Repeat")
    .on("click", async function () {
        svg.remove();
        svg = main_panel.append("svg");
        await createAndRunBars(svg, data);
    })

await createAndRunBars(svg, data);
