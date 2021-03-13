<template>
    <section>
        <navigation></navigation>
        <div class="container">
            <div class="section">
                <div class="row">
                    <h5 class="center"><b>Einstellungen</b></h5>

                    <div class="col s12 m8 l6 offset-l3 offset-m2">
                        <ul class="collection">
                            <li v-for="chk in checkedDistricts"
                                class="collection-item"><b>{{ getAnnotatedName(chk, getDetails(chk).name) }}</b> ({{ getDetails(chk).stateShort }})</li>
                        </ul>

                        <div class="row">
                            <div class="col">
                                <a class="waves-effect waves-light btn" @click="save"><i class="material-icons left">save</i>Speichern</a>
                            </div>
                            <div class="col">
                                <a class="waves-effect waves-light btn" @click="reset"><i class="material-icons left">delete</i>Verwerfen</a>
                            </div>
                            <div class="col">
                                <a class="waves-effect waves-light btn" @click="toDefault"><i class="material-icons left">undo</i>Zurücksetzen</a>
                            </div>
                        </div>
                    </div>

                    <div class="col s12 m12 l12">
                        <table class="striped">
                            <thead>
                            <tr>
                                <th></th>
                                <th>Landkreis</th>
                                <th>Bundesland</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="dist in allDistricts">
                                <td>
                                    <label>
                                        <input type="checkbox" :value="dist.ags" :id="dist.ags"
                                               v-model="checkedDistricts"
                                               class="filled-in">
                                        <span>&nbsp;</span>
                                    </label>
                                </td>
                                <td><b>{{ getAnnotatedName(dist.ags, dist.name) }}</b></td>
                                <td>{{ dist.state }}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <footer>
            <div class="container">
                <br/>
                <div class="grey-text text-darken-2" style="text-align: center;">Icons made by Freepik from
                    flaticon.com.
                </div>
                <br/>
                <br/>
            </div>
        </footer>
    </section>
</template>

<script>
import navigation from "@/components/NavBar.vue";
import firebase from "firebase";
import M from 'materialize-css';
import {requestSingle} from "@/js/api.js";
import {requestData} from "../js/api";
import {getAnnotatedName} from "../js/render";

/**
 * This is the data source for all the districts in germany, complete with their AGSs the lookup is based on.
 * This works for every district, except for Berlin.
 * Because for some inexplicable reason the RKI lists 'null' for the AGS of the city - something the system
 * cannot handle in the state it is in right now.
 * This is, apparently, not due to there being no AGS for Berlin - this list:
 * https://www.riserid.eu/data/user_upload/downloads/info-pdf.s/Diverses/Liste-Amtlicher-Gemeindeschluessel-AGS-2015.pdf
 * gives the value 11000000, (being the complete AGS, the first 5 chars of that are the district key).
 * However, since I get the district names from the RKI, Berlin cannot be rendered in this website right now, as
 * the selected districts are stored by storing the AGS.
 * Thus, this dashboard will have to make due without being able to display the infection statistics in the
 * country's capital city :)
 */
const staticDistricts = require("../../static/districts.json");

export default {
    data() {
        return {
            checkedDistricts: [],
            allDistricts: []
        };
    },
    components: {
        navigation
    },
    mounted() {
        this.allDistricts = staticDistricts.map(d => {
            if (d.prefix === "SK") d.type = "Stadt";
            else if (d.prefix === "LK") d.type = "LK";
            return d;
        }).sort((a, b) => a.name > b.name ? 1 : -1);
    },
    created() {

    },
    methods: {
        /*
        * todo:
        *  - update the saved settings every time a tick is changed
        *  - fix checklist so that selected items are checked on load
        *  - fix loading of non-existant list in storage
        */
        getDetails: function(ags) {
            return staticDistricts.filter(d => d.ags === ags)[0];
        },
        save() {
            localStorage.setItem("selectedDistricts", JSON.stringify(this.checkedDistricts));
            M.toast({html: 'Einstellungen wurden gespeichert.'});
        },
        reset() {
            M.toast({html: 'Auswahl wurde zurückgesetzt.'});
        },
        toDefault() {
            localStorage.setItem("selectedDistricts", JSON.stringify(
                ["09778", "09162", "09179", "09762", "09777", "09188", "09178", "09175", "09772"]
            ));
            M.toast({html: 'Standardlandkreise wurden ausgewählt.'});
        },
        getAnnotatedName: getAnnotatedName
    }
};
</script>
