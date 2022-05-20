// Load data
async function loadData() {
    // Data from notebook
    const dataText = await fetch(
        "https://raw.githubusercontent.com/DmitryPogrebnoy/Data_Visualization_ITMO/master/resources/augmented_covid_19.csv"
    ).then((response) => {
        return response.text();
    });
    return d3.csvParse(dataText, d3.autoType).sort((a, b) => d3.ascending(a.date, b.date))
}

export { loadData }