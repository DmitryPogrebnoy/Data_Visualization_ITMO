let memoizedCovidData;
let memoizedCountryData

// Load data
async function loadData() {
    if (memoizedCovidData !== undefined) {
        return memoizedCovidData;
    }
    // Data from notebook
    memoizedCovidData = await d3.csv(
        "https://raw.githubusercontent.com/DmitryPogrebnoy/Data_Visualization_ITMO/master/resources/augmented_covid_19.csv", d3.autoType);

    return memoizedCovidData
}

async function loadCountryData() {
    if (memoizedCountryData !== undefined) {
        return memoizedCountryData;
    }
    // Data from topo-json
    memoizedCountryData = await d3.json(
        "https://raw.githubusercontent.com/DmitryPogrebnoy/Data_Visualization_ITMO/master/resources/countries-50m.json", d3.autoType);

    return memoizedCountryData
}

export { loadData, loadCountryData }