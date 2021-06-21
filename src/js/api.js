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

    //todo: switch vaccination data over to RKI
    const URL_RKI = "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=RS,AGS,GEN,EWZ,death_rate,cases,deaths,cases_per_100k,cases_per_population,BL,county,last_update,cases7_per_100k,recovered,cases7_bl,death7_bl,cases7_lk,death7_lk,cases7_per_100k_txt&returnGeometry=false&outSR=4326&f=json";
    const URL_ZEIT = "https://interactive.zeit.de/cronjobs/2020/corona/germany-dashboard-v2.json";
    const URL_VACC = "https://api.corona-zahlen.org/vaccinations";
    const URL_RVALUE = "https://api.corona-zahlen.org/germany";

    //show loading indicator
    vm.state.loading = true;

    //do API calls and handle data when present
    let rkiData, zeitData, vaccData, rvalData;
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

        //render data
        vm.state.loading = false;
        if (zeitData !== null && rkiData !== null && vaccData !== null && rvalData !== null) {
            vm.state.error = false;
        }
        vm.state.ready = true;
        callback(vm, agss, rkiData, zeitData, vaccData, rvalData);
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
