<template>
    <section>
        <navigation></navigation>
        <br/>
        <div class="container">
            <div class="section">
                <div class="row" id="preloader_container" style="display: none">
                    <div class="col s12 m12 l4">
                        <div class="card-panel">
                            <div class="progress">
                                <div class="indeterminate" id="apiProgressBar"></div>
                            </div>
                            <div style="text-align: center; font-weight: bold; display: block" id="apiProgressText">
                                Inzidenzen werden geladen...
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row" id="error_container" style="display: none">
                    <div class="col s12 m12 l12">
                        <div class="card-panel red darken-3 white-text">
                            <div><i class="material-icons">warning</i></div>
                            <b>Beim Laden der Inzidenzen ist ein Fehler aufgetreten.</b>
                            <br/>
                            <b>Es stehen nicht alle Daten zur Verfügung.</b>
                            <br/>
                            <p>
                                Ohne RKI können nur <b>absolute</b> Fallzahlen angezeigt werden.
                                Landkreisdaten (Name/Bevölkerung) zur Normierung stehen nicht zur Verfügung.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="row" style="display: none" id="row_country">
                    <div class="col s12 m12 l6">
                        <div class="card red darken-1" style="height: 210px">
                            <div class="card-content white-text">
                                <span class="card-title">Deutschland</span>
                                <div class="row">
                                    <div class="col">
                                        <h3 id="infected_yesterday">0</h3>
                                        <b><a
                                            href="https://www.zeit.de/wissen/gesundheit/coronavirus-echtzeit-karte-deutschland-landkreise-infektionen-ausbreitung">Neuinfektionen
                                            gestern</a></b>
                                    </div>
                                    <div class="col">
                                        <h3 id="infected_7day">0</h3>
                                        <b><a
                                            href="https://www.zeit.de/wissen/gesundheit/coronavirus-echtzeit-karte-deutschland-landkreise-infektionen-ausbreitung">7-Tage-Inzidenz</a></b>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col s12 m12 l6">
                        <div class="card" style="height: 210px">
                            <div class="card-content white-text">
                                <div style="width: 305px; margin: auto;">
                                    <canvas id="chart_germany"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="center" id="header_counties" style="display: none;">
                    <h5><b>Landkreise</b></h5>
                </div>

                <!-- CARD TEMPLATES
                <div class="row">
                    <div class="col s12 m12 l4">
                        <div class="card orange darken-2">
                            <div class="card-content white-text">
                                <span class="card-title activator white-text">Landkreisname<i
                                        class="material-icons right">show_chart</i></span>
                                <div class="row">
                                    <div class="col">
                                        <h3>100</h3>
                                        <b><a href="https://corona.rki.de">RKI</a></b>
                                    </div>
                                    <div class="col">
                                        <h3>100</h3>
                                        <b><a href="https://www.zeit.de/wissen/gesundheit/coronavirus-echtzeit-karte-deutschland-landkreise-infektionen-ausbreitung">ZEIT
                                            Online</a></b>
                                    </div>
                                </div>
                            </div>
                            <div class="card-reveal">
                                <span class="card-title">Landkreisname<i
                                        class="material-icons right">close</i></span>
                                <canvas id="myChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                -->

                <div class="row" id="card_space">
                    <!--<div class="col s12 m6 l4">
                        <div class="card red darken-1">
                            <div class="card-content white-text">
                                <span class="card-title">Beispiel</span>
                                <h1>203</h1>
                            </div>
                        </div>
                    </div>-->
                    <!--
                    <div class="col">
                                        <h3>456</h3>
                                        <b><a href="https://www.lgl.bayern.de/gesundheit/infektionsschutz/infektionskrankheiten_a_z/coronavirus/karte_coronavirus/">LGL
                                            Bayern</a></b>
                                    </div>
                    -->

                    <!--<div class="col s12 m12 l4">
                        <div class="card red darken-1">
                            <div class="card-content white-text">
                                <span class="card-title">Beispiel</span>
                                <div class="row">
                                    <div class="col">
                                        <h3>123</h3>
                                        <b><a href="https://github.com/marlon360/rki-covid-api">RKI</a></b>
                                    </div>
                                    <div class="col">
                                        <h3>203</h3>
                                        <b><a href="https://www.zeit.de/wissen/gesundheit/coronavirus-echtzeit-karte-deutschland-landkreise-infektionen-ausbreitung">ZEIT
                                            Online</a></b>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>-->
                </div>

                <div class="center" id="header_vaccine" style="display: none;">
                    <h5><b>Impfung</b></h5>
                </div>

                <div class="row" style="display: none" id="row_vaccine">
                    <div class="col s12 m12 l6">
                        <div class="card blue darken-1" style="height: 210px">
                            <div class="card-content white-text">
                                <span class="card-title">Impfstatistik</span>
                                <div class="row">
                                    <div class="col">
                                        <h3 id="vaccinated_preliminary">0</h3>
                                        <b><a
                                            href="https://www.zeit.de/wissen/gesundheit/2021-01/corona-impfung-deutschland-anzahl-impfquote-aktuelle-zahlen-karte">
                                            Geimpfte
                                        </a></b>
                                    </div>
                                    <div class="col">
                                        <h3 id="vaccinated_protected">0,00 %</h3>
                                        <b><a
                                            href="https://www.zeit.de/wissen/gesundheit/2021-01/corona-impfung-deutschland-anzahl-impfquote-aktuelle-zahlen-karte">
                                            voller Impfschutz
                                        </a></b>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col s12 m12 l6">
                        <div class="card" style="height: 210px">
                            <div class="card-content white-text">
                                <div style="width: 305px; margin: auto;">
                                    <canvas id="chart_vaccine"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer>
            <div class="grey-text text-darken-2" style="text-align: center;">Stand (RKI): <span id="state_rki">Inzidenzen werden geladen...</span>
            </div>
            <div class="grey-text text-darken-2" style="text-align: center;">Stand (ZEIT Online): <span id="state_zeit">Inzidenzen werden geladen...</span>
            </div>
            <div class="grey-text text-darken-2" style="text-align: center;">Stand (ZEIT Online Impfstatistik): <span
                id="state_vaccine">Statistik wird geladen...</span>
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
import { requestData } from "@/js/api.js"

export default {
    data() {
        return {};
    },
    components: {
        navigation
    },
    mounted() {
        //call the APIs
        requestData();
    },
    created() {

    },
    methods: {}
};
</script>
