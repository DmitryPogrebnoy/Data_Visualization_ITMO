import { prepareBarData, buildBarFrame, showBars } from "./src/bars/bars.js";
import { showMap } from './src/map/map.js';
import { showLegend } from "./src/map/legend.js";
import { loadData } from "./src/common/loadData.js";
import { computeFrames } from './src/common/handleKeyFrames.js'

// Load data
const data = await loadData();
const keyframes = computeFrames(data);

const BARS_MODE = 'bars';
const MAP_MODE = 'map';

let mode = 'bars';

let timer;
let currentFrameNumber = 0;

function displayVisualizationByMode() {
    switch (mode) {
        case BARS_MODE:
            showBars(svg, currentFrameNumber, keyframes);
            break;

        case MAP_MODE:
            showMap(svg, keyframes[currentFrameNumber]);
            break;
    }
}


const body = d3.select("body");
const head = body.append("div").attr("id", "head").attr("align", "center")
head.append("h1").text("Covid-19 Country Spread")
    .attr("class", "head")
    .style("font-family", "Montserrat")
    .style("font", "bold")
    .style("font-size", `50px`);

const main_button_panel = body.append("div").attr("id", "main_button_panel").attr("align", "center")
const mapChartButton = main_button_panel
    .append("button")
    .attr("id", "map_button")
    .text("Map Chart")
    .style("font-family", "Montserrat")
    .style("margin-right", "4em")
    .on("click", function () {
        mode = MAP_MODE;

        // TODO: Разобраться с легендой и корректно её вывести.
        //let legendSvg = main_panel.append("svg");

        // TODO: Разобраться со стартом/стопом, 
        // на данный момент некоррректно работает старт/стоп при переключении между визуализациями
        /*
        if (timer !== undefined) {
            timer.stop();
        }
        */

        slider_panel.select("button").text("Start")

        svg.remove();
        svg = main_panel.append("svg");

        showMap(svg, keyframes[currentFrameNumber]);
    })

const barChartButton = main_button_panel
    .append("button")
    .attr("id", "bar_button")
    .text("Bar Chart")
    .style("font-family", "Montserrat")
    .on("click", function () {
        mode = BARS_MODE;

        // TODO: Разобраться со стартом/стопом, 
        // на данный момент некоррректно работает старт/стоп при переключении между визуализациями
        /*
        if (timer !== undefined) {
            timer.stop();
        }
        */

        d3.selectAll("*").interrupt();
        slider_panel.select("#start_button").text("Start");
        svg.selectAll("*").remove();
        buildBarFrame(svg, keyframes);
        showBars(svg, currentFrameNumber, keyframes);
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
    .attr("id", "start_button")
    .text("Start")
    .style("margin-left", "2em")
    .on("click", function () {
        let button = d3.select(this)
        if (button.text() === "Start") {
            button.text("Stop")
            timer = d3.interval(() => {
                currentFrameNumber += 1;
                displayVisualizationByMode();
            }, 500)
        } else {
            button.text("Start")
            timer.stop()
        }
    })

const main_panel = body.append("div").attr("id", "main_panel");

var svg = main_panel.append("svg");

prepareBarData(data, keyframes);
buildBarFrame(svg, keyframes);
showBars(svg, 0, keyframes);
