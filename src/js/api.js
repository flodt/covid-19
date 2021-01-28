import M from "materialize-css";
import { renderData } from "@/js/render.js"

export function requestData() {
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
    const URL_VACC = "https://interactive.zeit.de/cronjobs/2020/corona/impfzahlenAutomatisch.json";

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
}
