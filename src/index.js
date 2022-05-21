import {runBars, stopBars, prepareBarData, buildBarFrame} from "./bars/bars.js";
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
const mapChartButton = main_button_panel
    .append("button")
    .attr("id", "map_button")
    .text("Map Chart")
    .style("font-family", "Montserrat")
    .style("margin-right", "4em").on("click", async function() {
        slider_panel.select("button").text("Start")
        await svg.exit();
        svg.remove();
        svg = main_panel.append("svg");
        // Then show map chart
    })

const barChartButton = main_button_panel
    .append("button")
    .attr("id", "bar_button")
    .text("Bar Chart")
    .style("font-family", "Montserrat")
    .on("click", function() {
        //WTF???
        slider_panel.select("button").transition().duration(1000).ease(d3.easeLinear).text("Start").end()
        //await svg.exit()
        //svg.selectAll("*").remove();
        buildBarFrame(svg).then();
    })

const slider_panel = body.append("div")
    .attr("id", "slider_panel")
    .attr("align", "center")
    .style("margin-top", "2em");
slider_panel.append("input")
    .attr("type", "range")
    .attr("min", 10)
    .attr("max", 100);

slider_panel.append("button")
    .text("Start")
    .style("margin-left", "2em")
    .on("click", async function() {
        let button = d3.select(this)
        if (button.text() === "Start") {
            button.text("Stop")
            await runBars(svg);
        } else {
            button.text("Start")
            stopBars()
        }
    })

const main_panel = body.append("div").attr("id", "main_panel");

var svg = main_panel.append("svg");


prepareBarData(data)