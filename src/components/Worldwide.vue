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

                <div class="row">
                    <div class="col s12 m12 l6">
                        <div class="card-panel center">
                            <div id="world_incidence_map" style="height: 570px; background: white"></div>
                        </div>
                    </div>
                    <div class="col s12 m12 l6">
                        <div class="card-panel center">
                            <div id="world_death_map" style="height: 570px; background: white"></div>
                        </div>
                    </div>
                    <div class="col s12 m12 l6">
                        <div class="card-panel center">
                            <div id="world_vacc_map" style="height: 570px; background: white"></div>
                        </div>
                    </div>
                    <div class="col s12 m12 l6">
                        <div class="card-panel center">
                            <div id="world_second_vacc_map" style="height: 570px; background: white"></div>
                        </div>
                    </div>
                </div>

                <div class="row center" v-if="state.ready">
                    <h5 class="center"><b>Übersicht</b></h5>

                    <form class="col s12" @submit="ignore">
                        <div class="row">
                            <div class="input-field col s12">
                                <i class="material-icons prefix">search</i>
                                <input id="icon_prefix" type="text" class="validate" v-model="input.searchText">
                                <label for="icon_prefix">Suchen...</label>
                            </div>
                        </div>
                        <b>Sortieren nach...</b>
                        <div class="row">
                            <p class="col">
                                <label>
                                    <input name="group1" :value="0" type="radio" checked v-model="input.sortBy"/>
                                    <span>Alphabetisch</span>
                                </label>
                            </p>
                            <p class="col">
                                <label>
                                    <input name="group1" :value="1" type="radio" v-model="input.sortBy"/>
                                    <span>Inzidenz</span>
                                </label>
                            </p>
                            <p class="col">
                                <label>
                                    <input name="group1" :value="2" type="radio"  v-model="input.sortBy"/>
                                    <span>Erstimpfung</span>
                                </label>
                            </p>
                            <p class="col">
                                <label>
                                    <input name="group1" :value="3" type="radio" v-model="input.sortBy"/>
                                    <span>Zweitimpfung</span>
                                </label>
                            </p>
                            <p class="col">
                                <label>
                                    <input name="group1" :value="4" type="radio" v-model="input.sortBy"/>
                                    <span>Tote / 100.000 EW</span>
                                </label>
                            </p>
                        </div>
                    </form>

                    <div class="col s12 m12 l12">
                        <table class="striped">
                            <thead>
                            <tr>
                                <th></th>
                                <th>Land</th>
                                <th>7-Tage-Inzidenz</th>
                                <th>Geimpfte (1./2.) %</th>
                                <th>Tote / 100.000 EW</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="country in filteredCountries">
                                <td v-if="country.hasFlag"><img :src="`https://www.countryflags.io/${country.code}/flat/64.png`" style="width: 38px"></td>
                                <td v-else></td>
                                <td><b>{{ country.name }}</b></td>
                                <td :style="{'color': country.color}"><b>{{ country.incidence.toFixed(1) }}</b></td>
                                <td v-if="country.hasVaccData">
                                    <b class="green-text text-darken-1">{{ country.vaccinated.toFixed(1) }}</b> / <b class="blue-text text-darken-1">{{ country.fullyVaccinated.toFixed(1) }}</b>
                                </td>
                                <td v-else>Keine Daten</td>
                                <td><b>{{ country.deathIncidence.toFixed(1) }}</b></td>
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
            input: {
                searchText: "",
                sortBy: 1
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
    computed: {
        filteredCountries() {
            //get the sorting comparator
            const SORTING = [
                (a, b) => a.name > b.name ? 1 : -1,
                (a, b) => a.incidence < b.incidence ? 1 : -1,
                (a, b) => a.vaccinated < b.vaccinated ? 1 : -1,
                (a, b) => a.fullyVaccinated < b.fullyVaccinated ? 1 : -1,
                (a, b) => a.deathIncidence < b.deathIncidence ? 1 : -1,
            ];

            const FILTERING = country => country.name.toLowerCase().indexOf(this.input.searchText.toLowerCase()) > -1;

            return this.countries
                .sort(SORTING[this.input.sortBy])
                .filter(FILTERING);
        }
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
    methods: {
        ignore() {}
    }
};
</script>
