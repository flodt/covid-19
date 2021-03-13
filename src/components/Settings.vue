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
                                class="collection-item"><b>{{ getDetails(chk).name }}</b> ({{ getDetails(chk).stateShort }})</li>
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
                                <th>Art</th>
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
                                <td><b>{{ dist.name }}</b></td>
                                <td>{{ dist.state }}</td>
                                <td>{{ dist.type }}</td>
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
        *  - implement special handling for the districts with AGS collisions
        *  - implement special name handling for the districts with name collisions (build an AGS list)
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
        }
    }
};
</script>
