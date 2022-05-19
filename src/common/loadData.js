
// Load data
async function loadData() {
    // Data from notebook
    const dataText = fetch(
        "https://static.observableusercontent.com/files/aec3792837253d4c6168f9bbecdf495140a5f9bb1cdb12c7c8113cec26332634a71ad29b446a1e8236e0a45732ea5d0b4e86d9d1568ff5791412f093ec06f4f1?response-content-disposition=attachment%3Bfilename*%3DUTF-8%27%27category-brands.csv"
    ).then((response) => {
        return response.text();
    });
    return dataText.then((text) => {
        return d3.csvParse(text, d3.autoType);
    });
}

export { loadData }