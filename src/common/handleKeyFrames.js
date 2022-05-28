// Frame {name, value, rank}
function buildFrame(names, value) {
    const data = Array.from(names, name => ({
        name,
        value: value(name)[0]['confirmed'],
        deaths: value(name)[0]['deaths'],
        recovered: value(name)[0]['recovered']
    }));
    data.sort((a, b) => d3.descending(a.value, b.value));
    for (let i = 0; i < data.length; ++i) {
        data[i].rank = Math.min(10, i);
    }
    return data;
}

export function computeFrames(data) {
    const countryNames = new Set(data.map((d) => d.country));
    const rollupedData = d3.rollup(
        data,
        ([d]) => [{
            'confirmed': d.confirmed,
            'deaths': d.deaths,
            'recovered': d.recovered
        }],
        (d) => d.date,
        (d) => d.country
    );
    const dateValues = Array.from(rollupedData).sort(([a], [b]) => d3.ascending(a.key, b.key));

    let keyframes = [];
    let ka, a;
    for ([ka, a] of dateValues) {
        keyframes.push([
            new Date(ka),
            buildFrame(countryNames, country => (a.get(country) || 0))
        ]);
    }

    return keyframes;
}