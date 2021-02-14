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
                    <h5 class="center"><b>Ausgangssperren</b></h5>

                    <div class="col s12 m12 l4" v-for="card in districts">
                        <div class="card" style="height: 210px"
                             :class="(card.hasCurfew) ? 'red darken-2' : 'green darken-2'">
                            <div class="card-content white-text">
                                <span class="card-title">{{ card.name }}</span>
                                <div class="center" v-if="card.hasCurfew">
                                    <h3>Ausgangssperre</h3>
                                    <b>von 22-5 Uhr (7-Tage-Inzidenz war {{ card.maxIncidence.toFixed(1) }}).</b>
                                </div>
                                <div class="center" v-if="!card.hasCurfew">
                                    <h3>unbeschränkt</h3>
                                    <b>7-Tage-Inzidenz konstant unter 100</b>
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
import {requestCurfew} from "@/js/api.js"

export default {
    data() {
        return {
            state: {
                rki: "Inzidenzen werden geladen...",
                zeitAvail: false,
                rkiAvail: false,
                vaccAvail: false,
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
        //call the APIs?
        this.state.ready = true;

        requestCurfew(this, (vm, agss, data) => {
            vm.districts = agss.map(ags => {
                let name = data.data[ags].name;

                //unfortunately: special cases for München (Land/Stadt) and Augsburg (Land/Stadt)
                switch (ags) {
                    case "09772":
                        name = "Augsburg (Land)";
                        break;
                    case "09162":
                        name = "München (Stadt)";
                        break;
                }

                const incidences = data.data[ags].history.map(h => h.weekIncidence).slice(-7);
                const has = incidences.some(i => i >= 100);
                const max = Math.max.apply(Math, incidences);
                return {
                    name: name,
                    hasCurfew: has,
                    maxIncidence: max
                };
            });
        });
    },
    created() {

    },
    methods: {}
};
</script>
