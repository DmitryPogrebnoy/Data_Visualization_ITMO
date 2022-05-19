import {createAndRunBars} from "./bars/bars.js";

d3.select("body").append("button")
    .text("Repeat")
    .on("click", async function () {
        d3.select("body").select("svg").remove();
        await createAndRunBars();
    })

await createAndRunBars();
