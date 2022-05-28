// Function to position the tooltip
export const hover = (tip, pos, text) => {
    const side_padding = 10;
    const vertical_padding = 5;
    const vertical_offset = 15;

    // Empty it out
    tip.selectAll("*").remove();

    // Append the text
    tip
        .style("text-anchor", "middle")
        .style("pointer-events", "none")
        .attr("transform", `translate(${pos[0]}, ${pos[1] + 7})`)
        .selectAll("text")
        .data(text)
        .join("text")
        .style("dominant-baseline", "ideographic")
        .text((d) => d)
        .attr("y", (d, i) => (i - (text.length - 1)) * 15 - vertical_offset)
        .style("font-weight", (d, i) => (i === 0 ? "bold" : "normal"));

    const bbox = tip.node().getBBox();

    // Add a rectangle (as background)
    tip
        .append("rect")
        .attr("y", bbox.y - vertical_padding)
        .attr("x", bbox.x - side_padding)
        .attr("width", bbox.width + side_padding * 2)
        .attr("height", bbox.height + vertical_padding * 2)
        .style("fill", "white")
        .style("stroke", "#d3d3d3")
        .lower();
}


