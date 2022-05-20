let memoizedData;
// Load data
async function loadData() {
    if (memoizedData !== undefined) {
        return memoizedData;
    }
    // Data from notebook
    memoizedData = await d3.csv(
        "https://raw.githubusercontent.com/DmitryPogrebnoy/Data_Visualization_ITMO/master/resources/augmented_covid_19.csv");

    return memoizedData
}

export { loadData }