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
                    <h5 class="center"><b>Heatmap</b></h5>

                    <div class="card-panel center">
                        <div class="preloader-wrapper active" v-if="state.heatmapLoading">
                            <div class="spinner-layer spinner-red-only">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div><div class="gap-patch">
                                <div class="circle"></div>
                            </div><div class="circle-clipper right">
                                <div class="circle"></div>
                            </div>
                            </div>
                        </div>

                        <div id="heatmap" style="height: 570px; background: white"></div>
                    </div>
                </div>

                <div class="row" v-if="state.ready">
                    <h5 class="center"><b>Bundesländer</b></h5>

                    <div class="col s6 m6 l3" v-for="card in states">
                        <div class="card" :style="`background-color: ${card.cardColor}`">
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
import {renderHeatmap} from "@/js/map";

export default {
    data() {
        return {
            state: {
                rki: "Inzidenzen werden geladen...",
                ready: false,
                error: false,
                loading: true,
                heatmapLoading: true
            },
            states: []
        };
    },
    components: {
        navigation
    },
    mounted() {
        const URL = "https://api.corona-zahlen.org/states";
        const GEODATA = "https://opendata.arcgis.com/datasets/917fc37a709542548cc3be077a786c17_0.geojson";

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

        //request and show heatmap
        requestSingle(this, GEODATA, renderHeatmap);
    },
    created() {

    },
    methods: {

    }
};
</script>
