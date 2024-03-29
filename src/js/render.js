import {getCountryCode} from "../js/countryCodes.js";
import {
    renderWorldwideIncidenceMap,
    renderWorldwideVaccMap,
    renderWorldwideSecondVaccMap,
    renderWorldwideDeathMap
} from "../js/map.js";
import {
    COLOR_COLORFUL_MAP,
    COLOR_DEFAULT,
    COLOR_EARTHY, COLOR_GRAYSCALE, COLOR_PASTEL, COLOR_PINK_UNICORN,
    COLOR_PRIDE,
    COLOR_ZEIT,
    getColorScheme,
    getFromStorage
} from "./store";

let colorSequence = 0;

function formatInterval(daysToHerdImmunity) {
    if (daysToHerdImmunity === 0) return "Ziel erreicht!";

    let years = Math.floor(daysToHerdImmunity / 365);
    let months = Math.ceil((daysToHerdImmunity % 365) / 30);

    /*
        Fix for that 2 years 12 months bug.
        As not every month has 30 days, this can overflow and display 12 months
        without rounding it up to full years. We take care of that here.
     */
    if (months >= 12) {
        months = 0;
        years++;
    }

    let str = "";
    if (years > 0) str += `${years} Jahr${years > 1 ? "e" : ""}` + ((months > 0) ? ", " : "");
    if (months > 0) str += `${months} Monat${months > 1 ? "e" : ""}`;
    return str;
}

function getTextColor(hex){
    hex = hex.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 180) ? '#212121' : '#ffffff';
}

export function colorsForHospital() {
    const max = Math.max(...arguments);
    const colors = [
        "#388e3c",
        "#ffa000",
        "#e64a19",
        "#5f0d0d"
    ];

    let color, textColor;

    if (max < 3) {
        color = colors[0];
    } else if (max >= 3 && max < 6) {
        color = colors[1];
    } else if (max >= 6 && max < 9) {
        color = colors[2];
    } else {
        color = colors[3];
    }

    textColor = getTextColor(color);
    return {
        color: color,
        textColor: textColor
    };
}

export function colorsForIncidences() {
    const max = Math.max(...arguments);
    let color, chartColor, mapColor, textColor, sequence, mapSequence;

    /*
        Define the color sequences we use later.
     */
    const classical = [
        "#388e3c",
        "#ffa000",
        "#f57c00",
        "#e64a19",
        "#d32f2f",
        "#5f0d0d"
    ];
    const zeit = [
        "#cccccf",
        "#e6a345",
        "#da4733",
        "#bf152a",
        "#78121e",
        "#3d080a"
    ];
    const earthy = [
        "#33691e",
        "#ffc400",
        "#e65100",
        "#b71c1c",
        "#880e4f",
        "#50082c"
    ];
    const grayscale = [
        "#eeeeee",
        "#bdbdbd",
        "#757575",
        "#616161",
        "#313131",
        "#000000"
    ];
    const unicorn = [
        "#ffbbd0",
        "#f06292",
        "#e91e63",
        "#d500f9",
        "#8e24aa",
        "#441152"
    ];
    const pastel = [
        "#ffbbd0",
        "#fff9c4",
        "#ccff90",
        "#bbdeff",
        "#e1bee7",
        "#9b7aa0"
    ];
    const rainbow = [
        "#e53935",
        "#fb8c00",
        "#ffb300",
        "#7cb342",
        "#1e88e5",
        "#9c27b0"
    ];

    //sequence selection logic
    const colorScheme = getColorScheme();
    const pride = colorScheme === COLOR_PRIDE;

    if (colorScheme === COLOR_DEFAULT) {
        sequence = classical;
        mapSequence = zeit;
    } else if (colorScheme === COLOR_ZEIT) {
        sequence = zeit;
        mapSequence = zeit;
    } else if (colorScheme === COLOR_COLORFUL_MAP) {
        sequence = classical;
        mapSequence = classical;
    } else if (colorScheme === COLOR_EARTHY) {
        sequence = earthy;
        mapSequence = earthy;
    } else if (colorScheme === COLOR_PINK_UNICORN) {
        sequence = unicorn;
        mapSequence = unicorn;
    } else if (colorScheme === COLOR_GRAYSCALE) {
        sequence = grayscale;
        mapSequence = grayscale;
    } else if (colorScheme === COLOR_PASTEL) {
        sequence = pastel;
        mapSequence = pastel;
    }

    if (!pride) {
        if (max < 35) {
            color = sequence[0];
            chartColor = color;
            mapColor = mapSequence[0];
            textColor = getTextColor(color);
        } else if (max >= 35 && max < 50) {
            color = sequence[1];
            chartColor = color;
            mapColor = mapSequence[1];
            textColor = getTextColor(color);
        } else if (max >= 50 && max < 100) {
            color = sequence[2];
            chartColor = color;
            mapColor = mapSequence[2];
            textColor = getTextColor(color);
        } else if (max >= 100 && max < 200) {
            color = sequence[3];
            chartColor = color;
            mapColor = mapSequence[3];
            textColor = getTextColor(color);
        } else if (max >= 200 && max < 1000) {
            color = sequence[4];
            chartColor = color;
            mapColor = mapSequence[4];
            textColor = getTextColor(color);
        } else {
            color = sequence[5];
            chartColor = color;
            mapColor = mapSequence[5];
            textColor = getTextColor(color);
        }
    } else {
        color = rainbow[colorSequence % rainbow.length];
        chartColor = color;
        mapColor = color;
        textColor = "#ffffff";
        colorSequence++;
    }

    return {
        color: color,
        chartColor: chartColor,
        mapColor: mapColor,
        textColor: textColor
    };
}

function shortState(state) {
    switch (state) {
        case "Bayern":
            return "BY";
        case "Baden-Württemberg":
            return "BW";
        case "Berlin":
            return "BE";
        case "Brandenburg":
            return "BB";
        case "Bremen":
            return "HB";
        case "Hamburg":
            return "HH";
        case "Hessen":
            return "HE";
        case "Mecklenburg-Vorpommern":
            return "MV";
        case "Niedersachsen":
            return "NI";
        case "Nordrhein-Westfalen":
            return "NW";
        case "Rheinland-Pfalz":
            return "RP";
        case "Saarland":
            return "SL";
        case "Sachsen":
            return "SN";
        case "Sachsen-Anhalt":
            return "ST";
        case "Schleswig-Holstein":
            return "SH";
        case "Thüringen":
            return "TH";
        default:
            return state;
    }
}

export function getAnnotatedName(ags, name) {
    //these are the AGSs of the districts that have both a city and a county with the same name
    const CITY = ['09661', '14713', '09261', '13003', '08212', '09563', '08121', '09362', '03404', '09662', '07312', '09561', '09464', '06611', '09761', '09462', '09663', '09461', '09163', '09463', '09262', '09162'];
    const COUNTY = ['09375', '09187', '09471', '08215', '09274', '13072', '09571', '09671', '09679', '14729', '06633', '08125', '07335', '09184', '03459', '09772', '09573', '09473', '09475', '09275', '09472', '09678'];

    //lookup in either the city our county list
    if (CITY.includes(ags)) {
        return `${name} (Stadt)`;
    } else if (COUNTY.includes(ags)) {
        return `${name} (Land)`;
    } else {
        return name;
    }

}

function roundToSignificantFigures(num, n) {
    if (num === 0) {
        return 0;
    }

    const d = Math.ceil(Math.log10(num < 0 ? -num : num));
    const power = n - d;

    const magnitude = Math.pow(10, power);
    const shifted = Math.round(num * magnitude);
    return shifted / magnitude;
}

function showErrorBox(vm, agss, rki, zeit, vacc) {
    const rkiAvail = rki !== null && rki.features !== undefined;
    const zeitAvail = zeit !== null;
    const vaccAvail = vacc !== null;
    vm.state.rkiAvail = rkiAvail;
    vm.state.zeitAvail = zeitAvail;
    vm.state.error = !rkiAvail || !zeitAvail;

    //update the state fields
    if (rkiAvail) {
        vm.state.rki = rki.features[0].attributes.last_update;
    } else {
        vm.state.rki = "Nicht verfügbar";
    }

    if (zeitAvail) {
        const zeitState = new Date(zeit.lastUpdate);
        vm.state.zeit = zeitState.toLocaleString("de-de");
    } else {
        vm.state.zeit = "Nicht verfügbar";
    }

    if (vaccAvail) {
        const vaccState = new Date(vacc.meta.lastUpdate);
        vm.state.vaccine = vaccState.toLocaleString("de-de");
    } else {
        vm.state.vaccine = "Nicht verfügbar";
    }
}


function renderHistogram(vm, id, name) {
    //draw chart
    setTimeout(function () {
        const districtColors = [10, 40, 75, 150, 300, 1100].map(i => colorsForIncidences(i).chartColor);

        //render charts
        const ctx = document.getElementById(id).getContext('2d');
        const chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'bar',

            // The data for our dataset
            data: {
                labels: ["0-35", "35-50", "50-100", "100-200", "200-1000", "1000+"],
                datasets: [{
                    label: name,
                    backgroundColor: districtColors,
                    borderColor: districtColors,
                    data: [vm.stat.below35, vm.stat.at3550, vm.stat.at50100, vm.stat.at100200, vm.stat.at2001000, vm.stat.above1000],
                    fill: false
                }
                ]
            },

            // Configuration options go here
            options: {
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                            //suggestedMin: 0,
                            //suggestedMax: 32500
                        }
                    }]
                },
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        });
    }, 0);
}

export function renderHotspots(vm, agss, rki, zeit, vacc) {
    showErrorBox(vm, agss, rki, zeit, vacc);

    //extract data from RKI
    const hotspots = rki
        .features
        .map(f => f.attributes)
        .sort((a, b) => a.cases7_per_100k > b.cases7_per_100k ? -1 : 1)
        .map((d, idx) => {
            return {
                name: getAnnotatedName(d.AGS, d.GEN),
                incidence: d.cases7_per_100k,
                state: shortState(d.BL),
                color: colorsForIncidences(d.cases7_per_100k).color,
                textColor: colorsForIncidences(d.cases7_per_100k).textColor,
                index: idx + 1
            }
        });

    vm.hotspots = hotspots.slice(0, 5);
    vm.coldspots = hotspots.slice(-5).reverse().map((d, idx) => {
        d.index = idx + 1;
        return d;
    })
    vm.stat.below35 = hotspots.filter(h => h.incidence < 35).length;
    vm.stat.at3550 = hotspots.filter(h => h.incidence >= 35 && h.incidence < 50).length;
    vm.stat.at50100 = hotspots.filter(h => h.incidence >= 50 && h.incidence < 100).length;
    vm.stat.at100200 = hotspots.filter(h => h.incidence >= 100 && h.incidence < 200).length;
    vm.stat.at2001000 = hotspots.filter(h => h.incidence >= 200 && h.incidence < 1000).length;
    vm.stat.above1000 = hotspots.filter(h => h.incidence >= 1000).length;

    //gather "all" data
    const overview = rki
        .features
        .map(f => f.attributes)
        .sort((a, b) => a.cases7_per_100k > b.cases7_per_100k ? -1 : 1)
        .map((d, idx) => {
            return {
                name: getAnnotatedName(d.AGS, d.GEN) + " (" + shortState(d.BL) + ")",
                incidence: d.cases7_per_100k,
                color: colorsForIncidences(d.cases7_per_100k).chartColor,
                index: idx + 1,
                casesTotal: d.cases,
                selected: getFromStorage().includes(d.AGS)
            }
        });

    vm.overview = overview;
    renderHistogram(vm, "chart_district_count", "Landkreise");
}


export function renderVaccHistorical(vm, data) {
    //prepare chart labels
    const labels = data.data.history
        .map(i => new Date(i.date))
        .map(d => {
            const str = d.toLocaleString("de-de");
            return str.slice(0, str.lastIndexOf(".") + 1);
        });

    //gather the historical data and sum up for speed
    const dailyFirstVaccination = data.data.history.map(i => i.firstVaccination);
    const dailySecondVaccination = data.data.history.map(i => i.secondVaccination);
    const dailyBoosterVaccination = data.data.history.map(i => i.boosterVaccination);

    //https://stackoverflow.com/questions/55258925/how-to-make-a-list-of-partial-sums-using-foreach/55259065#55259065
    //cumulate the values for our plot below
    const cumulativeSum1 = (sum => value => sum += value)(0);
    const cumulativeSum2 = (sum => value => sum += value)(0);
    const cumulativeSum3 = (sum => value => sum += value)(0);
    const cumFirstVaccination = dailyFirstVaccination.map((sum => value => sum += value)(0));
    const cumSecondVaccination = dailySecondVaccination.map((sum => value => sum += value)(0));
    const cumBoosterVaccination = dailyBoosterVaccination.map((sum => value => sum += value)(0));

    setTimeout(function () {
        //render charts
        const ctx = document.getElementById("chart_historical_vaccinations").getContext('2d');
        const chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: labels,
                datasets: [{
                    label: 'Erstimpfung',
                    backgroundColor: "#4caf50",
                    borderColor: "#4caf50",
                    data: cumFirstVaccination,
                    fill: false,
                    pointRadius: 0
                },
                    {
                        label: 'Zweitimpfung',
                        backgroundColor: "#2196f3",
                        borderColor: "#2196f3",
                        data: cumSecondVaccination,
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: 'Booster',
                        backgroundColor: "#a921f3",
                        borderColor: "#a921f3",
                        data: cumBoosterVaccination,
                        fill: false,
                        pointRadius: 0
                    }
                    ]
            },

            // Configuration options go here
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                            //suggestedMin: 0,
                            //suggestedMax: 32500
                        }
                    }]
                },
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        });
    }, 0);

    setTimeout(function () {
        //render charts
        const ctx = document.getElementById("chart_historical_vaccination_speed").getContext('2d');
        const chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'bar',

            // The data for our dataset
            data: {
                labels: labels,
                datasets: [{
                    label: 'Erstimpfung',
                    backgroundColor: "#4caf50",
                    borderColor: "#4caf50",
                    data: dailyFirstVaccination,
                    fill: false
                },
                    {
                        label: 'Zweitimpfung',
                        backgroundColor: "#2196f3",
                        borderColor: "#2196f3",
                        data: dailySecondVaccination,
                        fill: false
                    },
                    {
                        label: 'Booster',
                        backgroundColor: "#a921f3",
                        borderColor: "#a921f3",
                        data: dailyBoosterVaccination,
                        fill: false
                    }
                ]
            },

            // Configuration options go here
            options: {
                scales: {
                    xAxes: [{stacked: true}],
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            beginAtZero: true
                            //suggestedMin: 0,
                            //suggestedMax: 32500
                        }
                    }]
                },
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        });
    }, 0);
}


export function renderData(vm, agss, rki, history, vacc, rval, spark, hospital) {
    const POPULATION_GERMANY = 83190556;
    const POPULATION_BAVARIA = 13124737;

    showErrorBox(vm, agss, rki, history, vacc);
    const rkiAvail = rki !== null && rki.features !== undefined;
    const historyAvail = history !== null;
    const vaccAvail = vacc !== null && vacc.error === undefined;
    const rValAvail = rval !== null && rval.error === undefined;
    const sparkAvail = spark !== null && spark.error === undefined;
    const hospitalAvail = hospital !== null && hospital.error === undefined;

    //show the r value and deaths yesterday
    vm.state.rValAvail = rValAvail;
    if (rValAvail) {
        vm.germany.rValue = rval.r.rValue7Days.value.toFixed(2);
        vm.state.rValue = new Date(rval.r.rValue7Days.date).toLocaleDateString("de-de");
        vm.germany.deaths = rval.delta.deaths;
        vm.germany.hospitalIncidence = rval.hospitalization.incidence7Days;
        vm.germany.yesterday = rval.delta.cases;
        vm.germany.sevenDayIncidence = rval.weekIncidence;
    } else {
        //special case handling for broken rValue data
        vm.germany.rValue = "Fehler";
        vm.state.rValue = "Nicht verfügbar!";
        vm.state.error = true;
        vm.germany.deaths = 0;
        vm.germany.yesterday = 0;
        vm.germany.sevenDayIncidence = 0;
    }

    //show the country-wide stats and draw that graph
    if (historyAvail) {
        setTimeout(function () {
            //prepare chart labels (for the last 5 weeks)
            const daysPast = 5 * 7;
            const labels = [...Array(daysPast).keys()]
                .map(i => new Date(Date.now() - i * 24 * 60 * 60 * 1000))
                .map(d => {
                    const str = d.toLocaleString("de-de");
                    return str.slice(0, str.lastIndexOf(".") + 1);
                })
                .reverse();

            //gather ZEIT data for the last 5 weeks
            const newInf = history.data
                .map(s => s.cases);

            //render charts
            const ctx = document.getElementById("chart_germany").getContext('2d');
            const chart = new Chart(ctx, {
                // The type of chart we want to create
                type: 'line',

                // The data for our dataset
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Neuinfektionen',
                        backgroundColor: "rgb(173, 20, 87)",
                        borderColor: "rgb(173, 20, 87)",
                        data: newInf,
                        fill: false
                    }]
                },

                // Configuration options go here
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                                //suggestedMin: 0,
                                //suggestedMax: 32500
                            }
                        }]
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    tooltips: {
                        mode: 'nearest',
                        intersect: false
                    }
                }
            });
        }, 0);
    }

    //show the incidences
    vm.districts = agss.map(ags => {
        let name = rkiAvail
            ? rki.features.filter(f => f.attributes.AGS === ags)[0].attributes.GEN
            : "Nicht verfügbar";
        name = getAnnotatedName(ags, name);

        const canvasId = `chart_${ags}`;

        const population = rkiAvail
            ? rki.features.filter(f => f.attributes.AGS === ags)[0].attributes.EWZ
            : 100000;

        const rkiIncidence = rkiAvail
            ? rki.features.filter(f => f.attributes.AGS === ags)[0].attributes.cases7_per_100k
            : 0;

        let color;
        let textColor;
        let chartColor;

        //if rki is null, we don't have population information, so we cannot color-code
        if (rkiAvail) {
            const cfi = colorsForIncidences(rkiIncidence);
            color = cfi.color;
            textColor = cfi.textColor;
            chartColor = cfi.chartColor;
        } else {
            color = "rgb(158, 158, 158)";
            chartColor = "rgb(158, 158, 158)";
            textColor = "white-text";
        }

        if (sparkAvail) {
            setTimeout(function () {
                //prepare chart labels (for the last 7 days)
                const labels = [0, 1, 2, 3, 4, 5, 6, 7]
                    .map(i => new Date(Date.now() - i * 24 * 60 * 60 * 1000).getDay())
                    .map(d => ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d])
                    .reverse();

                //gather ZEIT sparkbars
                const bars = spark.data[ags].history.map(i => i.weekIncidence.toFixed(1));

                //render charts
                const ctx = document.getElementById(canvasId).getContext('2d');
                const chart = new Chart(ctx, {
                    // The type of chart we want to create
                    type: 'line',

                    // The data for our dataset
                    data: {
                        labels: labels,
                        datasets: [{
                            label: '7-Tage-Inzidenz',
                            backgroundColor: chartColor,
                            borderColor: chartColor,
                            data: bars,
                            fill: false
                        }]
                    },

                    // Configuration options go here
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    suggestedMin: 0,
                                    suggestedMax: 300
                                }
                            }]
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                        tooltips: {
                            mode: 'nearest',
                            intersect: false
                        }
                    }
                });
            }, 0);
        }

        return {
            name: name,
            rki: rkiIncidence,
            chartId: canvasId,
            cardColor: color,
            textColor: textColor,
            chartColor: chartColor
        };
    });

    //show the vaccine data (compute percentages and update fields)
    if (vaccAvail) {
        const prelim = vacc.data.vaccinated;
        const fully = vacc.data.secondVaccination.vaccinated;
        const boost = vacc.data.boosterVaccination.vaccinated;
        vm.germany.vaccinated =
            (prelim / POPULATION_GERMANY * 100).toFixed(2) + " %";
        vm.germany.fullyVaccinated =
            (fully / POPULATION_GERMANY * 100).toFixed(2) + " %";
        vm.germany.boosterVaccinated =
            (boost / POPULATION_GERMANY * 100).toFixed(2) + " %";

        const prelimBavaria = vacc.data.states.BY.vaccinated;
        const fullyBavaria = vacc.data.states.BY.secondVaccination.vaccinated;
        const boostBavaria = vacc.data.states.BY.boosterVaccination.vaccinated;
        vm.bavaria.vaccinated =
            (prelimBavaria / POPULATION_BAVARIA * 100).toFixed(2) + " %";
        vm.bavaria.fullyVaccinated =
            (fullyBavaria / POPULATION_BAVARIA * 100).toFixed(2) + " %";
        vm.bavaria.boosterVaccinated =
            (boostBavaria / POPULATION_BAVARIA * 100).toFixed(2) + " %";

        //display the block
        vm.state.vaccAvail = true;

        //show the vaccinated pie chart
        setTimeout(function () {
            //draw the germany graph
            const countryWide = document.getElementById("chart_vaccine").getContext('2d');
            new Chart(countryWide, {
                type: 'pie',
                data: { // DIAGRAM
                    datasets: [{
                        data: [
                            POPULATION_GERMANY - prelim,
                            prelim - fully,
                            fully - boost,
                            boost
                        ],
                        backgroundColor: [
                            '#545454',
                            '#4caf50',
                            '#2196f3',
                            '#a921f3'
                        ],
                        label: 'Impffortschritt (landesweit)'
                    }],
                    labels: [
                        'Ungeimpft',
                        'Erstgeimpft',
                        'Zweitgeimpft',
                        'Geboostert'
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                }
            });

            //draw the bavaria graph
            const bavaria = document.getElementById("chart_vaccine_bavaria").getContext('2d');
            new Chart(bavaria, {
                type: 'pie',
                data: {
                    datasets: [{
                        data: [
                            POPULATION_BAVARIA - prelimBavaria,
                            prelimBavaria - fullyBavaria,
                            fullyBavaria - boostBavaria,
                            boostBavaria
                        ],
                        backgroundColor: [
                            '#545454',
                            '#4caf50',
                            '#2196f3',
                            '#a921f3'
                        ],
                        label: 'Impffortschritt (Bayern)'
                    }],
                    labels: [
                        'Ungeimpft',
                        'Erstgeimpft',
                        'Zweitgeimpft',
                        'Geboostert'
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                }
            });
        }, 0);
    }

    //show the clinic data
    if (hospitalAvail) {
        //draw the hospital graph
        setTimeout(function () {
            //prepare chart labels (for the last 5 weeks)
            const labels = [...Array(hospital.data.length).keys()]
                .map(i => new Date(Date.now() - i * 24 * 60 * 60 * 1000))
                .map(d => {
                    const str = d.toLocaleString("de-de");
                    return str.slice(0, str.lastIndexOf(".") + 1);
                })
                .reverse();

            //gather ZEIT data for the last 5 weeks
            const newInf = hospital.data
                .map(s => s.incidence7Days);

            //render charts
            const ctx = document.getElementById("chart_beds").getContext('2d');
            const chart = new Chart(ctx, {
                // The type of chart we want to create
                type: 'bar',

                // The data for our dataset
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Klinikinzidenz',
                        backgroundColor: "rgb(33,33,33)",
                        borderColor: "rgb(33,33,33)",
                        data: newInf,
                        fill: false
                    }]
                },

                // Configuration options go here
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                                //suggestedMin: 0,
                                //suggestedMax: 32500
                            }
                        }]
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    tooltips: {
                        mode: 'nearest',
                        intersect: false
                    }
                }
            });
        }, 0);

        //show the fields
        vm.state.zeitAvail = true;
    }
}

export function renderHistorical(vm, rki, zeit) {
    //show last updated date
    let agss = getFromStorage();
    vm.state.zeit = new Date(zeit.lastUpdate).toLocaleString("de-de");
    vm.state.rki = rki.features[0].attributes.last_update;

    vm.districts = agss.map(ags => {
        let name = rki.features.filter(f => f.attributes.AGS === ags)[0].attributes.GEN;
        name = getAnnotatedName(ags, name);

        const chartId = `chart_historical_${ags}`;

        const population = rki.features.filter(f => f.attributes.AGS === ags)[0].attributes.EWZ;
        const history = zeit
            .kreise
            .items
            .filter(k => k.ags === ags.replace(/^0+/, ''))[0]
            .historicalStats
            .count;

        const deaths = zeit
            .kreise
            .items
            .filter(k => k.ags === ags.replace(/^0+/, ''))[0]
            .historicalStats
            .dead;

        //gather incidence data
        const weekIncidences = history.map((h, idx, arr) => {
            //get delta between today and 7 days ago, normalized to the population
            const today = h;
            const preWeek = arr[idx - 7];
            return +((today - preWeek) * 100000 / population).toFixed(1);
        }).map(i => (i < 0 || isNaN(i)) ? 0 : i);

        //render the graphs
        setTimeout(function () {
            //show chart labels
            const labels = [...Array(history.length).keys()]
                .map(i => new Date(Date.now() - i * 24 * 60 * 60 * 1000))
                .map(d => {
                    const str = d.toLocaleString("de-de");
                    return str.slice(0, str.lastIndexOf(".") + 1);
                })
                .reverse();

            const chartColor = colorsForIncidences(weekIncidences[weekIncidences.length - 2]).chartColor;

            //render charts
            const ctx = document.getElementById(chartId).getContext('2d');
            const chart = new Chart(ctx, {
                // The type of chart we want to create
                type: 'bar',

                // The data for our dataset
                data: {
                    labels: labels,
                    datasets: [{
                        label: '7-Tage-Inzidenz',
                        backgroundColor: chartColor,
                        borderColor: chartColor,
                        data: weekIncidences,
                        fill: false
                    }
                    ]
                },

                // Configuration options go here
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                                //suggestedMin: 0,
                                //suggestedMax: 32500
                            }
                        }]
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    tooltips: {
                        mode: 'nearest',
                        intersect: false
                    }
                }
            });
        }, 0);

        //in the morning when there has not yet been any data reported, the last entry is null...
        const offset = (history[history.length - 1] === null) ? 1 : 0;
        const offsetDeaths = (deaths[deaths.length - 1] === null) ? 1 : 0;
        const offsetIncidence = (weekIncidences[weekIncidences.length - 1] === 0) ? 2 : 1;

        return {
            name: name,
            chartId: chartId,
            yesterday: history[history.length - 1 - offset] - history[history.length - 2 - offset],
            total: history[history.length - 1 - offset],
            week: history[history.length - 1 - offset] - history[history.length - 8 - offset],
            deaths: deaths[deaths.length - 1 - offsetDeaths],
            population: roundToSignificantFigures(population, 3),
            incidence: weekIncidences[weekIncidences.length - offsetIncidence]
        };
    });

    //sum up for country-wide statistics graph
    const POPULATION_GERMANY = 83190556;
    const sum = (r, a) => r.map((b, i) => a[i] + b);

    const weekIncidences = zeit
        .kreise
        .items
        .map(k => k.historicalStats.count)
        .reduce(sum)
        .map((h, idx, arr) => {
            //get delta between today and 7 days ago, normalized to the population
            const today = h;
            const preWeek = arr[idx - 7];
            return +((today - preWeek) * 100000 / POPULATION_GERMANY).toFixed(1);
        })
        .map(i => (i < 0 || isNaN(i)) ? 0 : i);

    const countryDeaths = zeit
        .kreise
        .items
        .map(k => k.historicalStats.dead)
        .reduce(sum)
        .map((d, idx, arr) => +((d - arr[idx - 7]) / 7).toFixed(1))
        .map(i => (i < 0 || isNaN(i)) ? 0 : i);

    //show chart labels
    const labels = [...Array(weekIncidences.length).keys()]
        .map(i => new Date(Date.now() - i * 24 * 60 * 60 * 1000))
        .map(d => {
            const str = d.toLocaleString("de-de");
            return str.slice(0, str.lastIndexOf(".") + 1);
        })
        .reverse();

    setTimeout(function () {
        //render charts
        const ctx = document.getElementById("chart_historical_germany").getContext('2d');
        const chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'bar',

            // The data for our dataset
            data: {
                labels: labels,
                datasets: [{
                    label: '7-Tage-Inzidenz',
                    backgroundColor: "rgb(173, 20, 87)",
                    borderColor: "rgb(173, 20, 87)",
                    data: weekIncidences,
                    fill: false
                }
                ]
            },

            // Configuration options go here
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                            //suggestedMin: 0,
                            //suggestedMax: 32500
                        }
                    }]
                },
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        });
    }, 0);

    setTimeout(function () {
        //render charts
        const ctx = document.getElementById("chart_historical_deaths_germany").getContext('2d');
        const chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'bar',

            // The data for our dataset
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tote (7-Tage-Schnitt)',
                    backgroundColor: "rgb(0, 0, 0)",
                    borderColor: "rgb(0, 0, 0)",
                    data: countryDeaths,
                    fill: false
                }
                ]
            },

            // Configuration options go here
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                            //suggestedMin: 0,
                            //suggestedMax: 32500
                        }
                    }]
                },
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        });
    }, 0);
}

export function renderWorldwide(vm, data) {
    vm.state.owid = new Date(data.DEU.last_updated_date).toLocaleDateString("de-de");

    //add countries to the list
    let table = [];

    for (const c in data) {
        const ctry = data[c];
        if (c === "OWID_INT") continue;

        const incidence = ctry.new_cases_smoothed * 7 * 100000 / ctry.population;
        const deathsPerPop = ctry.total_deaths * 100000 / ctry.population;

        if (incidence < 0 || isNaN(incidence)) continue;

        table.push({
            name: ctry.location,
            code: getCountryCode(c),
            codeAlpha3: c,
            hasFlag: getCountryCode(c) !== undefined,
            incidence: incidence,
            deathIncidence: deathsPerPop,
            hasVaccData: ctry.people_vaccinated !== null && isFinite(ctry.people_vaccinated),
            vaccinated: ctry.people_vaccinated * 100 / ctry.population,
            fullyVaccinated: ctry.people_fully_vaccinated * 100 / ctry.population,
            color: colorsForIncidences(incidence).chartColor
        });
    }

    vm.countries = table.sort((a, b) => (a.incidence < b.incidence) ? 1 : -1);

    vm.stat.below35 = table.filter(h => h.incidence < 35).length;
    vm.stat.at3550 = table.filter(h => h.incidence >= 35 && h.incidence < 50).length;
    vm.stat.at50100 = table.filter(h => h.incidence >= 50 && h.incidence < 100).length;
    vm.stat.at100200 = table.filter(h => h.incidence >= 100 && h.incidence < 200).length;
    vm.stat.at2001000 = table.filter(h => h.incidence >= 200 && h.incidence < 1000).length;
    vm.stat.above1000 = table.filter(h => h.incidence >= 1000).length;
    renderHistogram(vm, "chart_country_count", "Länder");

    renderWorldwideIncidenceMap(vm);
    renderWorldwideVaccMap(vm);
    renderWorldwideSecondVaccMap(vm);
    renderWorldwideDeathMap(vm);
}

export function renderDemo(vm) {
    setTimeout(function () {
        //prepare chart labels (for the last 7 days)
        const labels = [0, 1, 2, 3, 4, 5, 6, 7]
            .map(i => new Date(Date.now() - i * 24 * 60 * 60 * 1000).getDay())
            .map(d => ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d])
            .reverse();

        const bars = [78.0, 80.0, 75.0, 40.0, 30.0, 40.0, 60.0, 56.7];

        //render charts
        const ctx = document.getElementById("chart_demo_atlantis").getContext('2d');
        const chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: labels,
                datasets: [{
                    label: '7-Tage-Inzidenz',
                    backgroundColor: "rgb(245, 124, 0)",
                    borderColor: "rgb(245, 124, 0)",
                    data: bars,
                    fill: false
                }]
            },

            // Configuration options go here
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            suggestedMin: 0,
                            suggestedMax: 300
                        }
                    }]
                },
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        });
    }, 0);
}

export function renderTesting(vm, testing) {
    const testingAvail = testing !== null && testing.error === undefined;

    const labels = testing.data.history.map(w => {
        if (w.calendarWeek === "until CW10, 2020") {
            return "10/2020";
        } else {
            return w.calendarWeek;
        }
    });
    const negatives = testing.data.history.map(w => w.performedTests - w.positiveTests);
    const positives = testing.data.history.map(w => w.positiveTests);
    const rate = testing.data.history.map(w => w.positivityRate);

    setTimeout(function () {
        //render charts
        const ctx = document.getElementById("chart_testing_history").getContext('2d');
        const chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'bar',

            // The data for our dataset
            data: {
                labels: labels,
                datasets: [{
                    label: 'positive PCR-Tests',
                    backgroundColor: "#c62828",
                    borderColor: "#c62828",
                    data: positives,
                    fill: false
                },
                    {
                        label: 'negative PCR-Tests',
                        backgroundColor: "#43a047",
                        borderColor: "#43a047",
                        data: negatives,
                        fill: false
                    }
                ]
            },

            // Configuration options go here
            options: {
                scales: {
                    xAxes: [{stacked: true}],
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            beginAtZero: true
                            //suggestedMin: 0,
                            //suggestedMax: 32500
                        }
                    }]
                },
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        });
    }, 0);

    setTimeout(function () {
        //render charts
        const ctx = document.getElementById("chart_testing_positivity").getContext('2d');
        const chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: labels.slice(1),
                datasets: [{
                    label: 'Testpositivenrate',
                    backgroundColor: "#c62828",
                    borderColor: "#c62828",
                    data: rate.slice(1),
                    fill: false,
                    pointRadius: 0
                }]
            },

            // Configuration options go here
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            callback: function (value) {
                                return (value * 100).toFixed(0) + '%';
                            }
                            //suggestedMin: 0,
                            //suggestedMax: 32500
                        }
                    }]
                },
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    mode: 'nearest',
                    intersect: false,
                    callbacks: {
                        label: function(tooltipItem, data) {
                            return (tooltipItem.yLabel * 100).toFixed(2) + "%";
                        }
                    }
                }
            }
        });
    }, 0);
}
