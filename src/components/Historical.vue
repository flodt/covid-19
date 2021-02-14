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
                    <h5 class="center"><b>Historisch</b></h5>
                    <p class="center">Dies ist ein Test.</p>
                </div>
            </div>
        </div>

        <footer>
            <div class="grey-text text-darken-2" style="text-align: center;">Stand (RKI): <span
                id="state_rki">{{ state.rki }}</span>
            </div>
            <div class="grey-text text-darken-2" style="text-align: center;">Stand (ZEIT Online): <span id="state_zeit">{{
                    state.zeit
                }}</span>
            </div>
            <div class="grey-text text-darken-2" style="text-align: center;">Stand (ZEIT Online Impfstatistik): <span
                id="state_vaccine">{{ state.vaccine }}</span>
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

export default {
    data() {
        return {
            state: {
                zeit: "Inzidenzen werden geladen...",
                rki: "Inzidenzen werden geladen...",
                vaccine: "Inzidenzen werden geladen...",
                zeitAvail: false,
                rkiAvail: false,
                vaccAvail: false,
                ready: false,
                error: false,
                loading: true
            }
        };
    },
    components: {
        navigation
    },
    mounted() {
        //call the APIs?
    },
    created() {

    },
    methods: {}
};
</script>
