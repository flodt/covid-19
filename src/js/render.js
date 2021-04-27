import {getCountryCode} from "../js/countryCodes.js";
import {renderWorldwideIncidenceMap, renderWorldwideVaccMap, renderWorldwideSecondVaccMap, renderWorldwideDeathMap} from "../js/map.js";
import {getFromStorage} from "./store";

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

export function colorsForIncidences() {
    const max = Math.max(...arguments);
    let color, chartColor, textColor;

    if (max < 35) {
        color = "green darken-2";
        chartColor = "rgb(56, 142, 60)";
        textColor = "white-text";
    } else if (max >= 35 && max < 50) {
        color = "amber darken-2";
        chartColor = "rgb(255, 160, 0)";
        textColor = "white-text";
    } else if (max >= 50 && max < 100) {
        color = "orange darken-2";
        chartColor = "rgb(245, 124, 0)";
        textColor = "white-text";
    } else if (max >= 100 && max < 200) {
        color = "deep-orange darken-2";
        chartColor = "rgb(230, 74, 25)";
        textColor = "white-text";
    } else {
        color = "red darken-2";
        chartColor = "rgb(211, 47, 47)";
        textColor = "white-text";
    }

    return {
        color: color,
        chartColor: chartColor,
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
    if(num === 0) {
        return 0;
    }

    const d = Math.ceil(Math.log10(num < 0 ? -num: num));
    const power = n - d;

    const magnitude = Math.pow(10, power);
    const shifted = Math.round(num*magnitude);
    return shifted/magnitude;
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
        const vaccState = new Date(vacc.lastUpdate);
        vm.state.vaccine = vaccState.toLocaleString("de-de");
    } else {
        vm.state.vaccine = "Nicht verfügbar";
    }
}


function renderHistogram(vm, id, name) {
    //draw chart
    setTimeout(function () {
        const districtColors = [10, 40, 75, 150, 300].map(i => colorsForIncidences(i).chartColor);

        //render charts
        const ctx = document.getElementById(id).getContext('2d');
        const chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'bar',

            // The data for our dataset
            data: {
                labels: ["0-35", "35-50", "50-100", "100-200", "200+"],
                datasets: [{
                    label: name,
                    backgroundColor: districtColors,
                    borderColor: districtColors,
                    data: [vm.stat.below35, vm.stat.at3550, vm.stat.at50100, vm.stat.at100200, vm.stat.above200],
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
    vm.stat.above200 = hotspots.filter(h => h.incidence > 200).length;

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
                casesTotal: d.cases
            }
        });

    vm.overview = overview;
    renderHistogram(vm, "chart_district_count", "Landkreise");
}


export function renderVaccHistorical(vm, data) {
    //prepare chart labels (for the last 5 weeks)
    const labels = data.germany.historical
        .map(i => new Date(i.date))
        .map(d => {
            const str = d.toLocaleString("de-de");
            return str.slice(0, str.lastIndexOf(".") + 1);
        })
        .reverse();

    //gather historical vaccination data and sum up for speed
    const vaccinated = data.germany.historical.map(i => i.peopleVaccinated).reverse();
    const fullyVaccinated = data.germany.historical.map(i => i.peopleFullyVaccinated).reverse();
    const dailyVaccinations = vaccinated
        .map((v, idx) => v + fullyVaccinated[idx])
        .map((v, idx, arr) => v - arr[idx - 1]);
    dailyVaccinations[0] = 0;
    const weekAverageVaccinations = vaccinated
        .map((v, idx) => v + fullyVaccinated[idx])
        .map((v, idx, arr) => {
            const period = 7;
            const ago = (arr[idx - period] === undefined) ? 0 : arr[idx - period];
            return +((v - ago) / period).toFixed(0);
        })
        .map(v => (v < 0) ? 0 : v);

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
                    backgroundColor: "rgb(76, 175, 80)",
                    borderColor: "rgb(76, 175, 80)",
                    data: vaccinated,
                    fill: false,
                    pointRadius: 0
                },
                    {
                        label: 'voller Impfschutz',
                        backgroundColor: "rgb(33, 150, 243)",
                        borderColor: "rgb(33, 150, 243)",
                        data: fullyVaccinated,
                        fill: false,
                        pointRadius: 0
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

    setTimeout(function () {
        //render charts
        const ctx = document.getElementById("chart_historical_vaccination_speed").getContext('2d');
        const chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: labels,
                datasets: [{
                    label: 'tägl. Impfungen',
                    backgroundColor: "#26a69a",
                    borderColor: "#26a69a",
                    data: dailyVaccinations,
                    fill: false,
                    pointRadius: 0
                },
                    {
                        label: 'Schnitt',
                        backgroundColor: "rgb(158,158,158)",
                        borderColor: "rgb(158,158,158)",
                        borderDash: [5, 5],
                        pointRadius: 0,
                        data: weekAverageVaccinations,
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


export function renderData(vm, agss, rki, zeit, vacc, rval) {
    const POPULATION_GERMANY = 83190556;
    const POPULATION_BAVARIA = 13124737;

    showErrorBox(vm, agss, rki, zeit, vacc);
    const rkiAvail = rki !== null && rki.features !== undefined;
    const zeitAvail = zeit !== null;
    const vaccAvail = vacc !== null;
    const rValAvail = rval !== null && rval.error === undefined;

    //show the r value and deaths yesterday
    vm.state.rValAvail = rValAvail;
    if (rValAvail) {
        vm.germany.rValue = rval.r.value;
        vm.state.rValue = new Date(rval.r.date).toLocaleDateString("de-de");
        vm.germany.deaths = rval.delta.deaths;
    } else {
        //special case handling for broken rValue data
        vm.germany.rValue = "Fehler";
        vm.state.rValue = "Nicht verfügbar!";
        vm.state.error = true;

        //fallback to all deaths
        if (zeitAvail) {
            vm.germany.deaths = zeit.currentStats.dead;
        }
    }

    //show the country-wide stats and draw that graph
    if (zeitAvail) {
        vm.germany.yesterday = zeit.yesterdayCount;
        vm.germany.sevenDayIncidence = zeit
            .sevenDayStats
            .count * 100000 / POPULATION_GERMANY;

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
            const newInf = zeit.sixWeeksStats
                .map(s => s.newInf)
                .slice(-daysPast);

            const averageNewInf = zeit.sixWeeksStats.map(s => s.avg).slice(-daysPast);

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
                    },
                        {
                            label: 'Durchschnitt',
                            backgroundColor: "rgb(158,158,158)",
                            borderColor: "rgb(158,158,158)",
                            borderDash: [5, 5],
                            pointRadius: 0,
                            data: averageNewInf,
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

        let zeitIncidence = zeitAvail ? (zeit.kreise.items
            .filter(k => k.ags === ags.replace(/^0+/, ''))[0]
            .sevenDayStats.count * 100000 / population) : 0;

        let color;
        let textColor;
        let chartColor;

        //if rki is null, we don't have population information, so we cannot color-code
        if (rkiAvail) {
            const cfi = colorsForIncidences(rkiIncidence, zeitIncidence);
            color = cfi.color;
            textColor = cfi.textColor;
            chartColor = cfi.chartColor;
        } else {
            color = "grey";
            chartColor = "rgb(158, 158, 158)";
            textColor = "white-text";
        }

        if (zeitAvail) {
            setTimeout(function () {
                //prepare chart labels (for the last 7 days)
                const labels = [0, 1, 2, 3, 4, 5, 6, 7]
                    .map(i => new Date(Date.now() - i * 24 * 60 * 60 * 1000).getDay())
                    .map(d => ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d])
                    .reverse();

                //gather ZEIT sparkbars
                const bars = zeit.kreise.items
                    .filter(k => k.ags === ags.replace(/^0+/, ''))[0]
                    .sparkbars
                    .slice(-8)
                    .map(i => i * 100000 / population)
                    .map(i => i.toFixed(1));

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
            zeit: zeitIncidence,
            rki: rkiIncidence,
            chartId: canvasId,
            cardColor: color,
            textColor: textColor,
            chartColor: chartColor
        };
    });

    //show the vaccine data (compute percentages and update fields)
    if (vaccAvail) {
        const prelim = vacc.germany.historical[0].peopleVaccinated;
        const fully = vacc.germany.historical[0].peopleFullyVaccinated;
        vm.germany.vaccinated =
            (prelim / POPULATION_GERMANY * 100).toFixed(2) + " %";
        vm.germany.fullyVaccinated =
            (fully / POPULATION_GERMANY * 100).toFixed(2) + " %";

        const prelimBavaria = vacc.bundeslaender.filter(b => b.id === "Bayern")[0].historical[0].peopleVaccinated;
        const fullyBavaria = vacc.bundeslaender.filter(b => b.id === "Bayern")[0].historical[0].peopleFullyVaccinated;
        vm.bavaria.vaccinated =
            (prelimBavaria / POPULATION_BAVARIA * 100).toFixed(2) + " %";
        vm.bavaria.fullyVaccinated =
            (fullyBavaria / POPULATION_BAVARIA * 100).toFixed(2) + " %";

        //compute the herd immunity counter (set at 70 %)
        /**
         * This is very definitely only meant for entertainment purposes.
         * There is no hard science behind this - I simply take the average vaccination speed
         * over the last 21 days (in order to avoid issues with the slow vaccination start
         * affecting the overall average), and extrapolate to compute the time to herd immunity.
         * Do with that figure what you want.
         */
        const herdImmunity = 0.70 * POPULATION_GERMANY - prelim;
        const threeWeeks = vacc.germany.historical[21].peopleVaccinated;
        const daysToHerdImmunity = herdImmunity / ((prelim - threeWeeks) / 21.0);
        vm.germany.herdImmunityTimer = formatInterval(daysToHerdImmunity);

        //display the block
        vm.state.vaccAvail = true;

        //show the vaccinated pie chart
        setTimeout(function () {
            //draw the germany graph
            const countryWide = document.getElementById("chart_vaccine").getContext('2d');
            new Chart(countryWide, {
                type: 'pie',
                data: {
                    datasets: [{
                        data: [
                            prelim - fully,
                            fully,
                            POPULATION_GERMANY - (prelim + fully)
                        ],
                        backgroundColor: [
                            'rgb(221, 0, 0)',
                            'rgb(255, 206, 0)',
                            'rgb(33, 33, 33)'
                        ],
                        label: 'Impffortschritt (landesweit)'
                    }],
                    labels: [
                        'Erstimpfung',
                        'voller Impfschutz',
                        'Ungeimpft'
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
                            prelimBavaria - fullyBavaria,
                            fullyBavaria,
                            POPULATION_BAVARIA - (prelimBavaria + fullyBavaria)
                        ],
                        backgroundColor: [
                            'rgb(76, 175, 80)',
                            'rgb(33, 150, 243)',
                            'rgb(189, 189, 189)'
                        ],
                        label: 'Impffortschritt (Bayern)'
                    }],
                    labels: [
                        'Erstimpfung',
                        'voller Impfschutz',
                        'Ungeimpft'
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
    if (zeitAvail) {
        vm.germany.clinicPatients = zeit.clinicStats.covid19;

        //draw the hospital graph
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
            const newInf = zeit.sixWeeksStats
                .map(s => s.covid19Patients)
                .slice(-daysPast);

            //render charts
            const ctx = document.getElementById("chart_beds").getContext('2d');
            const chart = new Chart(ctx, {
                // The type of chart we want to create
                type: 'line',

                // The data for our dataset
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Intensivbetten',
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
    vm.stat.above200 = table.filter(h => h.incidence > 200).length;
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

        const bars = [78.0,80.0,75.0,40.0,30.0,40.0,60.0,56.7];

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
