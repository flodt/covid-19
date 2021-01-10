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
    fetch(URL_RKI).then(rkiResponse => {
        rkiResponse.json().then(rkiJson => {
            fetch(URL_ZEIT).then(zeitResponse => {
                zeitResponse.json().then(zeitJson => {
                    //dismiss loading indicator
                    document.getElementById("preloader_container").style.display = "none";
                    renderData(agss, rkiJson, zeitJson);
                })
            })
        })
    }).catch(err => {
        console.log(err);
        M.toast({html: 'An error occurred while fetching data.'});
        document.getElementById("preloader_container").style.display = "none";
    });
});

function renderData(agss, rki, zeit) {
    console.log("Rendering data...");

    //update the state fields
    const rkiState = new Date(rki.meta.lastUpdate);
    const zeitState = new Date(zeit.lastUpdate);
    console.log("RKI: " + rkiState.toLocaleString("de-de"));
    console.log("Zeit: " + zeitState.toLocaleString("de-de"));
    document.getElementById("state_rki").innerText = rkiState.toLocaleString("de-de");
    document.getElementById("state_zeit").innerText = zeitState.toLocaleString("de-de");

    //show the incidences
    agss.forEach(ags => {
        const name = rki.data[ags].name;
        const population = rki.data[ags].population;

        const rkiIncidence = rki.data[ags].weekIncidence;
        let zeitIncidence = (zeit.kreise.items
            .filter(k => k.ags === ags.replace(/^0+/, ''))[0]
            .sevenDayStats.count * 100000 / population);
        console.log(name + ": " + rkiIncidence + "/" + zeitIncidence);

        const max = (rkiIncidence >= zeitIncidence) ? rkiIncidence : zeitIncidence;
        let color;
        let textColor;

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
    })
}