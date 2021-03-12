<template>
    <section>
        <navigation></navigation>
        <div class="container">
            <div class="section">
                <div class="row">
                    <h5 class="center"><b>Einstellungen</b></h5>

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
                                <td><b>{{ dist.name }}</b></td>
                                <td>{{ dist.state }}</td>
                            </tr>
                            </tbody>
                        </table>

                        Checked districts: {{checkedDistricts}}
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

export default {
    data() {
        return {
            checkedDistricts: [],
            allDistricts: [{
                "name": "Flensburg",
                "prefix": "SK",
                "ags": "01001",
                "state": "Schleswig-Holstein",
                "stateShort": "SH",
                "population": 90164
            },
                {
                    "name": "Kiel",
                    "prefix": "SK",
                    "ags": "01002",
                    "state": "Schleswig-Holstein",
                    "stateShort": "SH",
                    "population": 246794
                },
                {
                    "name": "Lübeck",
                    "prefix": "SK",
                    "ags": "01003",
                    "state": "Schleswig-Holstein",
                    "stateShort": "SH",
                    "population": 216530
                },]
        };
    },
    components: {
        navigation
    },
    mounted() {

    },
    created() {

    },
    methods: {

    }
};
</script>
