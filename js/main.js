window.addEventListener("load", function () {
    /**
     * Load and display all of the cards for the places of interest
     * Right now, we're loading the data based on the AGSs of the districts
     * to display. However, this can be easily expanded to browser-local
     * storage of the districts needed by the respective user.
     * This can also easily be transformed to pulling the data
     * for whole Germany and not just single districts, and then
     * extracting the incidence data from the entire set.
     * That overhead should be lower than calling for every value.
     */
    let agss = ["09778", "09162", "09179", "09762", "09777", "09188", "09178", "09175", "09772"];
    const URL_RKI = "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=RS,AGS,GEN,EWZ,death_rate,cases,deaths,cases_per_100k,cases_per_population,BL,county,last_update,cases7_per_100k,recovered,cases7_bl,death7_bl,cases7_lk,death7_lk,cases7_per_100k_txt&returnGeometry=false&outSR=4326&f=json";
    const URL_ZEIT = "https://interactive.zeit.de/cronjobs/2020/corona/germany-dashboard-v2.json";
    const URL_VACC = "https://interactive.zeit.de/cronjobs/2020/corona/impfzahlen.json";

    //show loading indicator
    document.getElementById("preloader_container").style.display = "block";

    //do API calls and handle data when present
    let rkiData, zeitData, vaccData;
    fetch(URL_RKI).then(rkiResponse => {
        if (rkiResponse.ok) {
            return rkiResponse.json();
        } else {
            M.toast({html: 'Laden der RKI-Daten fehlgeschlagen...'});
            document.getElementById("error_container").style.display = "block";
            return Promise.resolve(null);
        }
    }).then(rkiJson => {
        rkiData = rkiJson;
        return fetch(URL_ZEIT);
    }).then(zeitResponse => {
        if (zeitResponse.ok) {
            return zeitResponse.json();
        } else {
            M.toast({html: 'Laden der ZEIT-Daten fehlgeschlagen...'});
            document.getElementById("error_container").style.display = "block";
            return Promise.resolve(null);
        }
    }).then(zeitJson => {
        zeitData = zeitJson;
        return fetch(URL_VACC);
    }).then(vaccResponse => {
        if (vaccResponse.ok) {
            return vaccResponse.json();
        } else {
            M.toast({html: 'Laden der Impfungsdaten fehlgeschlagen...'});
            return Promise.resolve(null);
        }
    }).then(vaccJson => {
        vaccData = vaccJson;

        //render data
        document.getElementById("preloader_container").style.display = "none";
        if (zeitData !== null && rkiData !== null) {
            document.getElementById("error_container").style.display = "none";
        }
        document.getElementById("header_counties").style.display = "block";
        renderData(agss, rkiData, zeitData, vaccData);
    });
});

function renderData(agss, rki, zeit, vacc) {
    console.log("Rendering data...");
    console.log(rki);
    console.log(zeit);

    const POPULATION_GERMANY = 83_190_556;

    const rkiAvail = rki !== null && rki.features !== undefined;
    const zeitAvail = zeit !== null;
    const vaccAvail = vacc !== null;

    //show error box (need to do it here because of the error json value)
    if (!rkiAvail) {
        document.getElementById("error_container").style.display = "block";
    } else {
        document.getElementById("error_container").style.display = "none";
    }

    //update the state fields
    if (rkiAvail) {
        document.getElementById("state_rki").innerText = rki
            .features.filter(f => f.attributes.AGS === agss[0])[0].attributes.last_update;
    } else {
        document.getElementById("state_rki").innerText = "Nicht verfügbar";
    }

    if (zeitAvail) {
        const zeitState = new Date(zeit.lastUpdate);
        document.getElementById("state_zeit").innerText = zeitState.toLocaleString("de-de");
    } else {
        document.getElementById("state_zeit").innerText = "Nicht verfügbar";
    }

    if (vaccAvail) {
        const vaccState = new Date(vacc.lastUpdate);
        document.getElementById("state_vaccine").innerText = vaccState.toLocaleString("de-de");
    } else {
        document.getElementById("state_vaccine").innerText = "Nicht verfügbar";
    }

    //show the country-wide stats and draw that graph
    if (zeitAvail) {
        document.getElementById("infected_yesterday").innerText = zeit.yesterdayCount.toLocaleString("de-de");
        document.getElementById("infected_7day").innerText = (zeit
            .sevenDayStats
            .count * 100_000 / POPULATION_GERMANY)
            .toFixed(1);
        document.getElementById("row_country").style.display = "block";

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
            const bars = zeit.sixWeeksStats
                .map(s => s.newInf)
                .slice(-daysPast);

            console.log(labels);
            console.log(bars);

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
                        backgroundColor: "rgb(211, 47, 47)",
                        borderColor: "rgb(211, 47, 47)",
                        data: bars,
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
                    tooltips: {
                        mode: 'nearest',
                        intersect: false
                    }
                }
            });
        }, 0);
    }

    //show the incidences
    agss.forEach(ags => {
        let name = rkiAvail
            ? rki.features.filter(f => f.attributes.AGS === ags)[0].attributes.GEN
            : "Nicht verfügbar";

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
            : 100_000;

        const rkiIncidence = rkiAvail
            ? rki.features.filter(f => f.attributes.AGS === ags)[0].attributes.cases7_per_100k
            : 0;

        let zeitIncidence = zeitAvail ? (zeit.kreise.items
            .filter(k => k.ags === ags.replace(/^0+/, ''))[0]
            .sevenDayStats.count * 100000 / population) : 0;

        console.log(name + ": " + rkiIncidence + "/" + zeitIncidence);

        const max = (rkiIncidence >= zeitIncidence) ? rkiIncidence : zeitIncidence;
        let color;
        let textColor;
        let chartColor;

        //if rki is null, we don't have population information, so we cannot color-code
        if (rkiAvail) {
            if (max < 35) {
                color = "green";
                chartColor = "rgb(76, 175, 80)";
                textColor = "white-text";
            } else if (max >= 35 && max < 50) {
                color = "amber darken-2";
                chartColor = "rgb(255, 160, 0)";
                textColor = "white-text";
            } else if (max >= 50 && max < 100) {
                color = "orange darken-1";
                chartColor = "rgb(251, 140, 0)";
                textColor = "white-text";
            } else if (max >= 100 && max < 200) {
                color = "deep-orange darken-1";
                chartColor = "rgb(244, 81, 30)";
                textColor = "white-text";
            } else {
                color = "red darken-2";
                chartColor = "rgb(211, 47, 47)";
                textColor = "white-text";
            }
        } else {
            color = "grey";
            chartColor = "rgb(158, 158, 158)";
            textColor = "white-text";
        }

        const card = `<div class="col s12 m12 l4">
                <div class="card ${color}">
                    <div class="card-content ${textColor}">
                        <span class="card-title activator ${textColor}">${name}<i
                                class="material-icons right">show_chart</i></span>
                        <div class="row">
                            <div class="col">
                                <h3>${rkiIncidence.toFixed(1)}</h3>
                                <b><a href="https://corona.rki.de">RKI</a></b>
                            </div>
                            <div class="col">
                                <h3>${zeitIncidence.toFixed(1)}</h3>
                                <b><a href="https://www.zeit.de/wissen/gesundheit/coronavirus-echtzeit-karte-deutschland-landkreise-infektionen-ausbreitung">ZEIT
                                    Online</a></b>
                            </div>
                        </div>
                    </div>
                    <div class="card-reveal" id="card_reveal_${ags}">
                        <span class="card-title">${name}<i
                                class="material-icons right">close</i></span>
                        ${!zeitAvail ? "<p>Graphen sind nicht verfügbar.</p>" : ""}
                    </div>
                </div>
            </div>`;

        document.getElementById("card_space").innerHTML += card;

        //create the canvas dynamically
        const canvasDiv = document.createElement("div");
        canvasDiv.setAttribute("style", "width: 250px; margin: auto;");
        canvasDiv.classList.add("center");
        const canvasElem = document.createElement("canvas");
        const canvasId = `chart_${ags}`;
        canvasElem.setAttribute("id", canvasId);
        canvasDiv.appendChild(canvasElem);
        document.getElementById(`card_reveal_${ags}`).appendChild(canvasDiv);

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

                console.log(labels);
                console.log(bars);

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
                        tooltips: {
                            mode: 'nearest',
                            intersect: false
                        }
                    }
                });
            }, 0);
        }
    });

    //show the vaccine data (compute percentages and update fields)
    if (vaccAvail) {
        const prelim = vacc.germany.historical[0].peopleVaccinated;
        const fully = vacc.germany.historical[0].peopleFullyVaccinated;

        document.getElementById("vaccinated_preliminary").innerText =
            (prelim / POPULATION_GERMANY * 100).toFixed(2) + " %";
        document.getElementById("vaccinated_protected").innerText =
            (fully / POPULATION_GERMANY * 100).toFixed(2) + " %";

        //display the block
        document.getElementById("header_vaccine").style.display = "block";
        document.getElementById("row_vaccine").style.display = "block";

        //show the vaccinated pie chart
        setTimeout(function () {
            const ctx = document.getElementById("chart_vaccine").getContext('2d');
            const chart = new Chart(ctx, {
                type: 'pie',
                data: {
                    datasets: [{
                        data: [
                            prelim - fully,
                            fully,
                            POPULATION_GERMANY - (prelim + fully)
                        ],
                        backgroundColor: [
                            'rgb(76, 175, 80)',
                            'rgb(30, 136, 229)',
                            'rgb(189, 189, 189)'
                        ],
                        label: 'Impffortschritt (landesweit)'
                    }],
                    labels: [
                        'Geimpfte',
                        'mit vollem Impfschutz',
                        'Ungeimpft'
                    ]
                },
                options: {
                    responsive: true
                }
            });
        }, 0);
    }
}
