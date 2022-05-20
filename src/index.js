import {createAndRunBars} from "./bars/bars.js";
import {loadData} from "./common/loadData.js";

// Load data
const data = await loadData();

d3.select("body").append("button")
    .text("Repeat")
    .on("click", async function () {
        d3.select("body").select("svg").remove();
        await createAndRunBars(data);
    })

await createAndRunBars(data);
