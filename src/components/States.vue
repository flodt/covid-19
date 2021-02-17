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
                                Die Daten können leider nicht angezeigt werden.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="row" v-if="state.ready">
                    <h5 class="center"><b>Bundesländer</b></h5>

                    <div class="col s6 m6 l3" v-for="card in states">
                        <div class="card" :class="card.cardColor">
                            <div class="card-content white-text">
                                <span class="card-title truncate">{{ card.name }}</span>
                                <div class="row">
                                    <div class="col">
                                        <h3>{{ card.incidence.toFixed(1) }}</h3>
                                        <b>7-Tage-Inzidenz</b>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row" v-if="state.ready && heatmap.avail">
                    <h5 class="center"><b>Heatmap</b></h5>

                    <div class="card-panel center">
                        <img class="responsive-img" style="max-width: 60%"
                             src="https://api.corona-zahlen.org/map/districts" alt="Logo">
                        <div class="row" style="margin-top: 20px">
                            <div class="col s6 m4 l2" v-for="range in heatmap.legend">
                                <div class="card-small" :class="getContrastYIQ(range.color)" :style="{'background-color': range.color}">
                                    {{ range.min }} - {{ range.max }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer>
            <div class="grey-text text-darken-2" style="text-align: center;">Stand (RKI): <span
                id="state_rki">{{ state.rki }}</span>
            </div>
            <div class="grey-text text-darken-2" style="text-align: center;">Daten zeigen 7-Tage-Inzidenzen pro
                100.000 Einwohner.
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
import {requestSingle} from "@/js/api.js";
import {colorsForIncidences} from "@/js/render.js";

export default {
    data() {
        return {
            state: {
                rki: "Inzidenzen werden geladen...",
                ready: false,
                error: false,
                loading: true
            },
            states: [],
            heatmap: {
                avail: true,
                url: "",
                legend: []
            }
        };
    },
    components: {
        navigation
    },
    mounted() {
        const URL = "https://api.corona-zahlen.org/states";
        const LEGEND = "https://api.corona-zahlen.org/map/districts/legend";

        requestSingle(this, URL, (vm, data) => {
            const states = [];

            for (const label in data.data) {
                const state = data.data[label];

                states.push({
                    name: state.name,
                    cardColor: colorsForIncidences(state.weekIncidence).color,
                    incidence: state.weekIncidence
                });
            }

            vm.states = states.sort((a, b) => a.name > b.name ? 1 : -1);
            vm.state.rki = new Date(data.meta.lastUpdate).toLocaleString("de-de");
        });

        requestSingle(this, LEGEND, (vm, data) => {
           vm.heatmap.legend = data.incidentRanges;
        });
    },
    created() {

    },
    methods: {
        /**
         * source: https://stackoverflow.com/a/11868398/4231365
         */
        getContrastYIQ(hex){
            hex = hex.replace("#", "");
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
            return (yiq >= 128) ? '' : 'white-text';
        }
    }
};
</script>
