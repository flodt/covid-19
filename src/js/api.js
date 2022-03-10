import M from "materialize-css";
import { renderData } from "@/js/render.js"
import {getFromStorage} from "./store";

export function requestData(vm, callback) {
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
    let agss = getFromStorage();

    const URL_RKI = "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=RS,AGS,GEN,EWZ,death_rate,cases,deaths,cases_per_100k,cases_per_population,BL,county,last_update,cases7_per_100k,recovered,cases7_bl,death7_bl,cases7_lk,death7_lk,cases7_per_100k_txt&returnGeometry=false&outSR=4326&f=json";
    const URL_HISTORY = "https://api.corona-zahlen.org/germany/history/cases/35";
    const URL_SPARKBARS = "https://api.corona-zahlen.org/districts/history/incidence/8";
    const URL_VACC = "https://api.corona-zahlen.org/vaccinations";
    const URL_RVALUE = "https://api.corona-zahlen.org/germany";
    const URL_HOSPITAL = "https://api.corona-zahlen.org/germany/history/hospitalization";

    //show loading indicator
    vm.state.loading = true;

    //do API calls and handle data when present
    let rkiData, historyData, vaccData, rvalData, sparkData, hospitalData;
    fetch(URL_RKI).then(rkiResponse => {
        if (rkiResponse.ok) {
            return rkiResponse.json();
        } else {
            M.toast({html: 'Laden der RKI-Daten fehlgeschlagen...'});
            vm.state.error = true;
            return Promise.resolve(null);
        }
    }).then(rkiJson => {
        rkiData = rkiJson;
        return fetch(URL_HISTORY);
    }).then(historyResponse => {
        if (historyResponse.ok) {
            return historyResponse.json();
        } else {
            M.toast({html: 'Laden der Verlaufsdaten fehlgeschlagen...'});
            vm.state.error = true;
            return Promise.resolve(null);
        }
    }).then(historyJson => {
        historyData = historyJson;
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
        return fetch(URL_RVALUE);
    }).then(rvalResponse => {
        if (rvalResponse.ok) {
            return rvalResponse.json();
        } else {
            M.toast({html: 'Laden des R-Werts fehlgeschlagen...'});
            return Promise.resolve(null);
        }
    }).then(rvalJson => {
        rvalData = rvalJson;

        return fetch(URL_SPARKBARS);
    }).then(sparkResponse => {
        if (sparkResponse.ok) {
            return sparkResponse.json();
        } else {
            M.toast({html: 'Laden der Sparkbars fehlgeschlagen...'});
            return Promise.resolve(null);
        }
    }).then(sparkJson => {
        sparkData = sparkJson;

        return fetch(URL_HOSPITAL);
    }).then(hospitalResponse => {
        if (hospitalResponse.ok) {
            return hospitalResponse.json();
        } else {
            M.toast({html: 'Laden der Hospitalisierungsdaten fehlgeschlagen...'});
            return Promise.resolve(null);
        }
    }).then(hospitalJson => {
        hospitalData = hospitalJson;

        //render data
        vm.state.loading = false;
        if (historyData !== null && rkiData !== null && vaccData !== null && rvalData !== null && sparkData !== null && hospitalData !== null) {
            vm.state.error = false;
        }
        vm.state.ready = true;
        callback(vm, agss, rkiData, historyData, vaccData, rvalData, sparkData, hospitalData);
    });
}

export function requestSingle(vm, url, callback) {
    //show loading indicator
    vm.state.loading = true;
    fetch(url).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            M.toast({html: 'Laden der Daten fehlgeschlagen...'});
            vm.state.error = true;
            return Promise.resolve(null);
        }
    }).then(json => {
        //render data
        vm.state.loading = false;
        if (json !== null) {
            vm.state.error = false;
        }
        vm.state.ready = true;
        callback(vm, json);
    });
}

export function requestHistorical(vm, callback) {
    const URL_RKI = "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=RS,AGS,GEN,EWZ,death_rate,cases,deaths,cases_per_100k,cases_per_population,BL,county,last_update,cases7_per_100k,recovered,cases7_bl,death7_bl,cases7_lk,death7_lk,cases7_per_100k_txt&returnGeometry=false&outSR=4326&f=json";
    const URL_ZEIT = "https://interactive.zeit.de/cronjobs/2020/corona/germany.json";

    //show loading indicator
    vm.state.loading = true;

    //do API calls and handle data when present
    let rkiData, zeitData;
    fetch(URL_RKI).then(rkiResponse => {
        if (rkiResponse.ok) {
            return rkiResponse.json();
        } else {
            M.toast({html: 'Laden der RKI-Daten fehlgeschlagen...'});
            vm.state.error = true;
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
            vm.state.error = true;
            return Promise.resolve(null);
        }
    }).then(zeitJson => {
        //render data
        vm.state.loading = false;
        if (zeitData !== null && rkiData !== null) {
            vm.state.error = false;
        }
        vm.state.ready = true;
        callback(vm, rkiData, zeitJson);
    });
}
