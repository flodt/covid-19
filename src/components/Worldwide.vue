<template>
    <section>
        <navigation></navigation>
        <div class="container">
            <div class="section">
                <div class="row" id="preloader_container" v-if="state.loading">
                    <div class="col s12 m12 l4">
                        <div class="card-panel">
                            <div class="progress">
                                <div class="indeterminate" id="apiProgressBar"></div>
                            </div>
                            <div style="text-align: center; font-weight: bold;" id="apiProgressText">
                                Inzidenzen werden geladen...
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row" id="error_container" v-if="state.error">
                    <div class="col s12 m12 l12">
                        <div class="card-panel red darken-3 white-text">
                            <div><i class="material-icons">warning</i></div>
                            <b>Beim Laden der Inzidenzen ist ein Fehler aufgetreten.</b>
                            <br/>
                            <b>Es stehen keine Inzidenzzahlen zur Verfügung.</b>
                            <br/>
                            <p>
                                Die Hotspot-Statistiken können nicht angezeigt werden.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="row" v-if="state.ready">
                    <h5 class="center"><b>Weltweit</b></h5>
                    <div class="col s12 m8 l6 offset-m2 offset-l3">
                        <div class="card-panel">
                            <div style="width: inherit; height: inherit; position: relative;">
                                <canvas id="chart_country_count"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row center" v-if="state.ready">
                    <h5 class="center"><b>Übersicht</b></h5>
                    <div class="col s12 m12 l12">
                        <table class="striped">
                            <thead>
                            <tr>
                                <th></th>
                                <th>Land</th>
                                <th>7-Tage-Inzidenz</th>
                                <th>Geimpfte (1./2.) %</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="country in countries">
                                <td v-if="country.hasFlag"><img :src="`https://www.countryflags.io/${country.code}/flat/64.png`" style="width: 38px"></td>
                                <td v-else></td>
                                <td><b>{{ country.name }}</b></td>
                                <td :style="{'color': country.color}"><b>{{ country.incidence.toFixed(1) }}</b></td>
                                <td v-if="country.hasVaccData">
                                    <b class="green-text text-darken-1">{{ country.vaccinated.toFixed(1) }}</b> / <b class="blue-text text-darken-1">{{ country.fullyVaccinated.toFixed(1) }}</b>
                                </td>
                                <td v-else>Keine Daten</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <footer>
            <div class="grey-text text-darken-2" style="text-align: center;">Datenquelle: <a href="https://ourworldindata.org/coronavirus">Our World In Data</a></div>
            <div class="grey-text text-darken-2" style="text-align: center;">Stand: <span
                id="state_rki">{{ state.owid }}</span>
            </div>
            <br/>
            <div class="grey-text text-darken-2" style="text-align: center;">Icons made by Freepik from flaticon.com.
            </div>
            <br/>
            <br/>
        </footer>
    </section>
</template>

<script>
import navigation from "@/components/NavBar.vue";
import firebase from "firebase";
import M from 'materialize-css';
import {requestData} from "@/js/api.js"
import {renderWorldwide} from "../js/render";
import {requestSingle} from "../js/api";

export default {
    data() {
        return {
            state: {
                owid: "Daten werden geladen...",
                ready: false,
                error: false,
                loading: true
            },
            countries: [],
            stat: {
                below35: 0,
                at3550: 0,
                at50100: 0,
                at100200: 0,
                above200: 0
            }
        };
    },
    components: {
        navigation
    },
    mounted() {
        //call the APIs
        const WORLDWIDE = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/latest/owid-covid-latest.json";
        requestSingle(this, WORLDWIDE, renderWorldwide);
    },
    created() {

    },
    methods: {}
};
</script>
