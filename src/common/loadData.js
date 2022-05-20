let memoizedData;
// Load data
async function loadData() {
    if (memoizedData !== undefined) {
        return memoizedData;
    }
    // Data from notebook
    const dataText = await fetch(
        "https://raw.githubusercontent.com/DmitryPogrebnoy/Data_Visualization_ITMO/master/resources/augmented_covid_19.csv"
    ).then((response) => {
        return response.text();
    });

    memoizedData = d3.csvParse(dataText, d3.autoType);
    return memoizedData
}

export { loadData }