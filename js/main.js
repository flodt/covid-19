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
    let agss = ["09778", "09162", "09179", "09777", "09188", "09178"];
    const URL_RKI = "https://v2.rki.marlon-lueckert.de/districts/";
    const URL_ZEIT = "https://interactive.zeit.de/cronjobs/2020/corona/germany-dashboard-v2.json";

    //show loading indicator
    document.getElementById("preloader_container").style.display = "block";

    //do API calls and handle data when present
    let rkiData, zeitData;
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

        //render data
        document.getElementById("preloader_container").style.display = "none";
        if (zeitData !== null && rkiData !== null) {
            document.getElementById("error_container").style.display = "none";
        }
        renderData(agss, rkiData, zeitData);
    });
});

function renderData(agss, rki, zeit) {
    console.log("Rendering data...");
    console.log(rki);
    console.log(zeit);

    //update the state fields
    if (rki !== null) {
        const rkiState = new Date(rki.meta.lastUpdate);
        document.getElementById("state_rki").innerText = rkiState.toLocaleString("de-de");
    } else {
        document.getElementById("state_rki").innerText = "Nicht verfügbar";
    }

    if (zeit !== null) {
        const zeitState = new Date(zeit.lastUpdate);
        document.getElementById("state_zeit").innerText = zeitState.toLocaleString("de-de");
    } else {
        document.getElementById("state_zeit").innerText = "Nicht verfügbar";
    }

    //show the incidences
    agss.forEach(ags => {
        const name = (rki !== null) ? rki.data[ags].name : "Nicht verfügbar";
        const population = (rki !== null) ? rki.data[ags].population : 100_000;

        const rkiIncidence = (rki !== null) ? rki.data[ags].weekIncidence : 0;
        let zeitIncidence = (zeit !== null) ? (zeit.kreise.items
            .filter(k => k.ags === ags.replace(/^0+/, ''))[0]
            .sevenDayStats.count * 100000 / population) : 0;
        console.log(name + ": " + rkiIncidence + "/" + zeitIncidence);

        const max = (rkiIncidence >= zeitIncidence) ? rkiIncidence : zeitIncidence;
        let color;
        let textColor;

        //if rki is null, we don't have population information, so we cannot color-code
        if (rki !== null) {
            if (max < 35) {
                color = "green";
                textColor = "white-text";
            } else if (max >= 35 && max < 50) {
                color = "amber darken-2";
                textColor = "white-text";
            } else if (max >= 50 && max < 100) {
                color = "orange darken-1";
                textColor = "white-text";
            } else if (max >= 100 && max < 200) {
                color = "deep-orange darken-1";
                textColor = "white-text";
            } else {
                color = "red darken-2";
                textColor = "white-text";
            }
        } else {
            color = "grey";
            textColor = "white-text";
        }

        const card = `<div class="col s12 m12 l4">
                <div class="card ${color}">
                    <div class="card-content ${textColor}">
                        <span class="card-title">${name}</span>
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
                </div>
            </div>`;

        document.getElementById("card_space").innerHTML += card;
    });
}