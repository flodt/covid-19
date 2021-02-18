function formatInterval(daysToHerdImmunity) {
    const years = Math.floor(daysToHerdImmunity / 365);
    const months = Math.ceil((daysToHerdImmunity - (years * 365)) / 30);

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

function truncate(str, n) {
    return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
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
        vm.state.rki = rki
            .features.filter(f => f.attributes.AGS === agss[0])[0].attributes.last_update;
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


export function renderHotspots(vm, agss, rki, zeit, vacc) {
    showErrorBox(vm, agss, rki, zeit, vacc);

    //extract data from RKI
    const hotspots = rki
        .features
        .map(f => f.attributes)
        .sort((a, b) => a.cases7_per_100k > b.cases7_per_100k ? -1 : 1)
        .map((d, idx) => {
            return {
                name: d.GEN,
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
                name: d.GEN + " (" + shortState(d.BL) + ")",
                incidence: d.cases7_per_100k,
                color: colorsForIncidences(d.cases7_per_100k).chartColor,
                index: idx + 1,
                casesTotal: d.cases
            }
        });

    vm.overview = overview;
}


export function renderVaccHistorical(vm, data) {
    setTimeout(function () {
        //prepare chart labels (for the last 5 weeks)
        const labels = data.germany.historical
            .map(i => new Date(i.date))
            .map(d => {
                const str = d.toLocaleString("de-de");
                return str.slice(0, str.lastIndexOf(".") + 1);
            })
            .reverse();

        //gather ZEIT data for the last 5 weeks
        const vaccinated = data.germany.historical.map(i => i.peopleVaccinated).reverse();
        const fullyVaccinated = data.germany.historical.map(i => i.peopleFullyVaccinated).reverse();

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
                    fill: false
                },
                    {
                        label: 'voller Impfschutz',
                        backgroundColor: "rgb(33, 150, 243)",
                        borderColor: "rgb(33, 150, 243)",
                        data: fullyVaccinated,
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


export function renderData(vm, agss, rki, zeit, vacc) {
    console.log("Rendering data...");
    const POPULATION_GERMANY = 83190556;
    const POPULATION_BAVARIA = 13124737;

    showErrorBox(vm, agss, rki, zeit, vacc);
    const rkiAvail = rki !== null && rki.features !== undefined;
    const zeitAvail = zeit !== null;
    const vaccAvail = vacc !== null;

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

        const canvasId = `chart_${ags}`;

        //unfortunately: special cases for München (Land/Stadt) and Augsburg (Land/Stadt)
        switch (ags) {
            case "09772":
                name = "Augsburg (Land)";
                break;
            case "09162":
                name = "München (Stadt)";
                break;
        }

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
        const herdImmunity = 0.70 * POPULATION_GERMANY;
        const threeWeeks = vacc.germany.historical[21].peopleFullyVaccinated;
        const daysToHerdImmunity = herdImmunity / ((fully - threeWeeks) / 21.0);
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
        vm.germany.deaths = zeit.currentStats.dead;
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
    let agss = ["09778", "09162", "09179", "09762", "09777", "09188", "09178", "09175", "09772"];
    vm.state.zeit = new Date(zeit.lastUpdate).toLocaleString("de-de");
    vm.state.rki = rki.features.filter(f => f.attributes.AGS === agss[0])[0].attributes.last_update;

    vm.districts = agss.map(ags => {
        let name = rki.features.filter(f => f.attributes.AGS === ags)[0].attributes.GEN;
        const chartId = `chart_historical_${ags}`;

        //unfortunately: special cases for München (Land/Stadt) and Augsburg (Land/Stadt)
        switch (ags) {
            case "09772":
                name = "Augsburg (Land)";
                break;
            case "09162":
                name = "München (Stadt)";
                break;
        }

        //render the graphs
        setTimeout(function () {
            const population = rki.features.filter(f => f.attributes.AGS === ags)[0].attributes.EWZ;
            const history = zeit
                .kreise
                .items
                .filter(k => k.ags === ags.replace(/^0+/, ''))[0]
                .historicalStats
                .count;

            //const everySnd = (_, idx) => idx % 2 === 0;

            //show chart labels
            const labels = [...Array(history.length).keys()]
                .map(i => new Date(Date.now() - i * 24 * 60 * 60 * 1000))
                .map(d => {
                    const str = d.toLocaleString("de-de");
                    return str.slice(0, str.lastIndexOf(".") + 1);
                })
                .reverse();

            //gather incidence data
            const weekIncidences = history.map((h, idx, arr) => {
                //get delta between today and 7 days ago, normalized to the population
                const today = h;
                const preWeek = arr[idx - 7];
                return +((today - preWeek) * 100000 / population).toFixed(1);
            }).map(i => (i < 0) ? 0 : i);

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

        return {
            name: name,
            chartId: chartId
        };
    });
}
