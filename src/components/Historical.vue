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
                    <div class="col s12 m12 l12">
                        <div class="card">
                            <div class="card-content">
                                <span class="card-title">Deutschland</span>
                                <div style="width: inherit; height: inherit; position: relative;">
                                    <canvas id="chart_historical_germany"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col s12 m12 l12">
                        <div class="card">
                            <div class="card-content">
                                <span class="card-title">Todeszahlen</span>
                                <div style="width: inherit; height: inherit; position: relative;">
                                    <canvas id="chart_historical_deaths_germany"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row" v-if="state.ready && districts.length > 0">
                    <h5 class="center"><b>Landkreise</b></h5>

                    <div class="col s12 m12 l6" v-for="card in districts">
                        <div class="card">
                            <!--todo: add tabs for the different graphs-->
                            <div class="card-content">
                                <span class="card-title">{{ card.name }}</span>
                                <div class="row">
                                    <div class="col s6">
                                        <b>Bevölkerung:</b> {{ card.population.toLocaleString("de-de") }}
                                    </div>
                                    <div class="col s6">
                                        <b>Inzidenz:</b> {{ card.incidence }}
                                    </div>
                                    <div class="col s6">
                                        <b>Fälle:</b> {{ card.total }}
                                    </div>
                                    <div class="col s6">
                                        <b>Tote:</b> {{ card.deaths }} ({{ (card.deaths / card.total * 100).toFixed(1) }} %)
                                    </div>
                                    <div class="col s6">
                                        <b>Neuinf. gestern:</b> {{ card.yesterday }}
                                    </div>
                                    <div class="col s6">
                                        <b>... akt. Woche:</b> {{ card.week }}
                                    </div>
                                </div>
                                <div style="width: inherit; height: inherit; position: relative;">
                                    <canvas :id="card.chartId"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row" v-if="state.ready">
                    <h5 class="center"><b>Impfzahlen</b></h5>

                    <div class="col s12 m12 l6">
                        <div class="card">
                            <div class="card-content">
                                <span class="card-title">Impffortschritt</span>
                                <div style="width: inherit; height: inherit; position: relative;">
                                    <canvas id="chart_historical_vaccinations"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col s12 m12 l6">
                        <div class="card">
                            <div class="card-content">
                                <span class="card-title">Impfgeschwindigkeit</span>
                                <div style="width: inherit; height: inherit; position: relative;">
                                    <canvas id="chart_historical_vaccination_speed"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row" v-if="state.ready">
                    <h5 class="center"><b>Testungen</b></h5>

                    <div class="col s12 m12 l6">
                        <div class="card">
                            <div class="card-content">
                                <span class="card-title">PCR-Tests</span>
                                <div style="width: inherit; height: inherit; position: relative;">
                                    <canvas id="chart_testing_history"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col s12 m12 l6">
                        <div class="card">
                            <div class="card-content">
                                <span class="card-title">Testpositivenrate</span>
                                <div style="width: inherit; height: inherit; position: relative;">
                                    <canvas id="chart_testing_positivity"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer>
            <div class="grey-text text-darken-2" style="text-align: center;">Daten stammen von ZEIT Online und RKI.</div>
            <div class="grey-text text-darken-2" style="text-align: center;">Stand (RKI): <span id="state_rki">{{ state.rki }}</span>
            </div>
            <div class="grey-text text-darken-2" style="text-align: center;">Stand (ZEIT Online): <span id="state_zeit">{{ state.zeit }}</span>
            </div>
            <div class="grey-text text-darken-2" style="text-align: center;">Landkreise zeigen 7-Tage-Inzidenzen pro
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
import {renderHistorical, renderVaccHistorical, renderTesting} from "@/js/render.js";
import {requestHistorical} from "../js/api";

export default {
    data() {
        return {
            state: {
                rki: "Inzidenzen werden geladen...",
                zeit: "Inzidenzen werden geladen...",
                ready: false,
                error: false,
                loading: true
            },
            districts: []
        };
    },
    components: {
        navigation
    },
    mounted() {
        requestHistorical(this, renderHistorical);

        const VACCINATIONS = "https://api.corona-zahlen.org/vaccinations/history";
        requestSingle(this, VACCINATIONS, renderVaccHistorical);

        const TESTING = "https://api.corona-zahlen.org/testing/history";
        requestSingle(this, TESTING, renderTesting)
    },
    created() {

    },
    methods: {}
};
</script>
