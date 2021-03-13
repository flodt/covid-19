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
                            <span class="card-title"><i class="material-icons left">warning</i>
                                <b>Beim Laden der Corona-Zahlen ist ein Fehler aufgetreten.</b>
                            </span>
                            <p>
                                Es stehen leider nicht alle Daten zur Verfügung.
                                <br/>
                                Wir bitten, diese Unannehmlichkeiten zu entschuldigen.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="row" v-if="state.ready" id="row_country">
                    <div class="col s12 m12 l6">
                        <div class="card pink darken-3" style="height: 210px">
                            <div class="card-content white-text">
                                 <span class="card-title activator">Deutschland<i
                                     class="material-icons right">info_outline</i></span>
                                <div class="row">
                                    <div class="col">
                                        <h3 id="infected_yesterday">{{ germany.yesterday.toLocaleString("de-de") }}</h3>
                                        <b><a class="oncard"
                                              href="https://www.zeit.de/wissen/gesundheit/coronavirus-echtzeit-karte-deutschland-landkreise-infektionen-ausbreitung">Neuinfektionen
                                            gestern</a></b>
                                    </div>
                                    <div class="col">
                                        <h3 id="infected_7day">{{ germany.sevenDayIncidence.toFixed(1) }}</h3>
                                        <b><a class="oncard"
                                              href="https://www.zeit.de/wissen/gesundheit/coronavirus-echtzeit-karte-deutschland-landkreise-infektionen-ausbreitung">7-Tage-Inzidenz</a></b>
                                    </div>
                                </div>
                            </div>
                            <div class="card-reveal">
                                <span class="card-title">Deutschland<i class="material-icons right">close</i></span>
                                <div style="text-align: center;">
                                    <h3>{{ germany.rValue }}</h3>
                                    <b>7-Tage-R-Wert</b> ({{ state.rValue }})
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col s12 m12 l6">
                        <div class="card" style="height: 210px">
                            <div class="card-content white-text">
                                <div style="width: inherit; height: inherit; position: relative;">
                                    <canvas id="chart_germany"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="center" id="header_counties" v-if="state.ready">
                    <h5><b>Landkreise</b></h5>
                </div>

                <div class="row" id="card_space">
                    <div class="col s12 m12 l4" v-for="card in districts">
                        <div class="card" :class="card.cardColor">
                            <div class="card-content" :class="card.textColor">
                        <span class="card-title activator" :class="card.textColor">{{ card.name }}<i
                            class="material-icons right">show_chart</i></span>
                                <div class="row">
                                    <div class="col">
                                        <h3>{{ card.rki.toFixed(1) }}</h3>
                                        <b><a class="oncard" href="https://corona.rki.de">RKI</a></b>
                                    </div>
                                    <div class="col">
                                        <h3>{{ card.zeit.toFixed(1) }}</h3>
                                        <b><a class="oncard" href="https://www.zeit.de/wissen/gesundheit/coronavirus-echtzeit-karte-deutschland-landkreise-infektionen-ausbreitung">ZEIT
                                            Online</a></b>
                                    </div>
                                </div>
                            </div>
                            <div class="card-reveal">
                        <span class="card-title">{{ card.name }}<i
                            class="material-icons right">close</i></span>
                                <div class="center" style="width: inherit; height: 70%; position: relative;">
                                    <canvas v-bind:id="card.chartId"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="state.vaccAvail" class="center" id="header_vaccine">
                    <h5><b>Impfung</b></h5>
                </div>

                <div v-if="state.vaccAvail" class="row" id="row_vaccine">
                    <div class="col s12 m12 l6">
                        <div class="card light-green darken-1" style="height: 210px">
                            <div class="card-content white-text">
                                <span class="card-title activator">Landesweit<i
                                    class="material-icons right">timer</i></span>
                                <div class="row">
                                    <div class="col">
                                        <h3 id="vaccinated_preliminary">{{ germany.vaccinated }}</h3>
                                        <b><a class="oncard"
                                              href="https://www.zeit.de/wissen/gesundheit/2021-01/corona-impfung-deutschland-anzahl-impfquote-aktuelle-zahlen-karte">
                                            Geimpfte
                                        </a></b>
                                    </div>
                                    <div class="col">
                                        <h3 id="vaccinated_protected">{{ germany.fullyVaccinated }}</h3>
                                        <b><a class="oncard"
                                              href="https://www.zeit.de/wissen/gesundheit/2021-01/corona-impfung-deutschland-anzahl-impfquote-aktuelle-zahlen-karte">
                                            voller Impfschutz
                                        </a></b>
                                    </div>
                                </div>
                            </div>
                            <div class="card-reveal">
                                <span class="card-title">Impfstatistik<i class="material-icons right">close</i></span>
                                <b>Zeit bis zur Herdenimmunität (70 %):</b>
                                <a class="modal-trigger" href="#modal-herd">(Woher kommt das?)</a>
                                <div style="text-align: center;">
                                    <h4 id="herd_immunity_timer">{{ germany.herdImmunityTimer }}</h4>
                                    bei der Geschwindigkeit der letzten 21 Tage.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col s12 m12 l6">
                        <div class="card" style="height: 210px">
                            <div class="card-content white-text">
                                <div style="width: inherit; height: inherit; position: relative;">
                                    <canvas id="chart_vaccine"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col s12 m12 l6">
                        <div class="card blue" style="height: 210px">
                            <div class="card-content white-text">
                                <span class="card-title">Bayern</span>
                                <div class="row">
                                    <div class="col">
                                        <h3 id="vaccinated_preliminary_bavaria">{{ bavaria.vaccinated }}</h3>
                                        <b><a class="oncard"
                                              href="https://www.zeit.de/wissen/gesundheit/2021-01/corona-impfung-deutschland-anzahl-impfquote-aktuelle-zahlen-karte">
                                            Geimpfte
                                        </a></b>
                                    </div>
                                    <div class="col">
                                        <h3 id="vaccinated_protected_bavaria">{{ bavaria.fullyVaccinated }}</h3>
                                        <b><a class="oncard"
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
                                <div style="width: inherit; height: inherit; position: relative;">
                                    <canvas id="chart_vaccine_bavaria"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="center" id="header_hospital" v-if="state.zeitAvail">
                    <h5><b>Todeszahlen</b></h5>
                </div>

                <div class="row" id="row_hospital" v-if="state.zeitAvail">
                    <div class="col s12 m12 l6">
                        <div class="card grey darken-4" style="height: 210px">
                            <div class="card-content white-text">
                                <span class="card-title">Klinikauslastung</span>
                                <div class="row">
                                    <div class="col">
                                        <h3 id="deaths">{{ germany.deaths.toLocaleString("de-de") }}</h3>
                                        <b><a class="oncard"
                                              href="https://www.zeit.de/wissen/gesundheit/2021-01/corona-impfung-deutschland-anzahl-impfquote-aktuelle-zahlen-karte">
                                            Tode seit Pandemiebeginn
                                        </a></b>
                                    </div>
                                    <div class="col">
                                        <h3 id="beds_occupied">{{ germany.clinicPatients.toLocaleString("de-de") }}</h3>
                                        <b><a class="oncard"
                                              href="https://www.zeit.de/wissen/gesundheit/2021-01/corona-impfung-deutschland-anzahl-impfquote-aktuelle-zahlen-karte">
                                            Intensivpatienten
                                        </a></b>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col s12 m12 l6">
                        <div class="card" style="height: 210px">
                            <div class="card-content white-text">
                                <div style="width: inherit; height: inherit; position: relative;">
                                    <canvas id="chart_beds"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!--Modals-->
        <div id="modal-herd" class="modal">
            <div class="modal-content">
                <h4>Herdenimmunitätstimer</h4>
                <p>TL;DR: Die Zahl hat nicht wirklich viel zu sagen.</p>
                <p>
                    Hier wird die Impfgeschwindigkeit der letzten 21 Tage als gleitender Durchschnitt bestimmt.
                    Mit dieser wird die Zeit extrapoliert, die bei der aktuellen Geschwindigkeit vergeht, bis
                    70&nbsp;% der Bevölkerung durchgeimpft sind, und damit die Herdenimmunität erreicht ist.
                    Die Zahl dient eher zur Unterhaltung und Beobachtung der Impfgeschwindigkeit als zu irgendetwas
                    sinnvollem;
                    weder ist die Herdenimmunität erst schlagartig bei 70&nbsp;% erreicht (fließender Effekt), noch
                    ist eine Wirkung nicht vorher bereits zu erwarten. Keine Panik :)
                </p>
            </div>
            <div class="modal-footer">
                <a href="#" class="modal-close waves-effect waves-red btn-flat">Schließen</a>
            </div>
        </div>

        <footer>
            <div class="grey-text text-darken-2" style="text-align: center;">Stand (RKI): <span id="state_rki">{{ state.rki }}</span>
            </div>
            <div class="grey-text text-darken-2" style="text-align: center;">Stand (ZEIT Online): <span id="state_zeit">{{ state.zeit }}</span>
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
import {requestData} from "@/js/api.js"
import {renderData} from "../js/render";

export default {
    data() {
        return {
            germany: {
                yesterday: 0,
                sevenDayIncidence: 0,
                vaccinated: "0.00 %",
                fullyVaccinated: "0.00 %",
                herdImmunityTimer: "Unbekannt",
                deaths: 0,
                clinicPatients: 0,
                rValue: "Laden..."
            },
            bavaria: {
                vaccinated: "0.00 %",
                fullyVaccinated: "0.00 %"
            },
            state: {
                zeit: "Inzidenzen werden geladen...",
                rki: "Inzidenzen werden geladen...",
                vaccine: "Inzidenzen werden geladen...",
                rValue: "Laden...",
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
        //call the APIs
        requestData(this, renderData);
    },
    created() {

    },
    methods: {}
};
</script>
