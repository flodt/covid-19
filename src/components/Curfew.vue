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

                    <div class="row" v-if="state.ready && districts.length === 0">
                        <div class="col s12 m12 l12">
                            <div class="card-panel pink darken-3 white-text">
                                <div><i class="material-icons">info</i></div>
                                <b>Es wurden keine Landkreise in Bayern ausgewählt.</b>
                                <br/>
                                In den Einstellungen können die Landkreise ausgewählt werden, die hier angezeigt werden.
                                <br/>
                                <br/>
                                <router-link to="/settings">
                                    <a class="waves-effect btn white black-text">
                                        <i class="material-icons left">settings</i>
                                        Zu den Einstellungen
                                    </a>
                                </router-link>
                            </div>
                        </div>
                    </div>

                    <div class="section row" v-if="districts.length > 0">
                        <div class="col l8 m12 s12 offset-l2">
                            <div class="card-panel pink darken-3 white-text">
                                <b>Achtung:</b>
                                <br/>
                                Verlassen Sie sich nicht ausschließlich auf die hiesigen Angaben. Diese beziehen sich
                                lediglich
                                auf die vorliegenden Inzidenzen und gehen von einer exakten Umsetzung des Beschlusses
                                aus.
                                <br/>
                                In Einzelfällen kann die Umsetzung der Ausgangssperre je nach Landkreis abweichen.
                                <br/>
                                Orientieren Sie sich immer auch über die <a class="oncard"
                                                                            style="text-decoration: underline"
                                                                            href="https://www.corona-katastrophenschutz.bayern.de/hotspotregionen/index.php">offizielle
                                und
                                rechtsverbindliche Liste der Landkreise
                                mit Ausgangsbeschränkungen</a> sowie über die Angaben Ihres Landratsamts.
                            </div>
                        </div>
                    </div>

                    <div class="col s12 m6 l4" v-for="card in districts">
                        <div class="card" :class="card.color">
                            <div class="card-content white-text">
                                <span class="card-title truncate">{{ card.name }}</span>
                                <div class="center" v-if="card.hasCurfew">
                                    <h4>Ausgangssperre</h4>
                                    <b>von 22-5 Uhr (Inzidenz war {{ card.maxIncidence.toFixed(1) }})</b>
                                </div>
                                <div class="center" v-if="!card.hasCurfew && !card.isClose">
                                    <h4>unbeschränkt</h4>
                                    <b>7-Tage-Inzidenz unter 100</b>
                                </div>
                                <div class="center" v-if="!card.hasCurfew && card.isClose">
                                    <h4>Achtung</h4>
                                    <b>hohe 7-Tage-Inzidenz (ist {{ card.lastIncidence.toFixed(1) }})</b>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer>
            <div class="container">
                <div class="grey-text text-darken-2" style="text-align: center;">Stand (RKI): <span
                    id="state_rki">{{ state.rki }}</span>
                </div>
                <div class="grey-text text-darken-2" style="text-align: center;">
                    Angaben gelten <b>nur für Bayern</b>.
                    <br/>
                    Landkreise zeigen 7-Tage-Inzidenzen pro
                    100.000 Einwohner und richten sich nach den offiziellen Werten des RKI.
                    <br/>
                    Eine Ausgangssperre besteht, wenn die 7-Tage-Inzidenz an drei aufeinanderfolgenden Tagen den Wert
                    von 100 überschritten hat. Zwei Tage nach dem dritten Tag der Überschreitung tritt die Maßnahme ein.
                    Sie wird aufgehoben, wenn die 7-Tage-Inzidenz an sieben aufeinanderfolgenden Tagen unter 100
                    gefallen ist.
                    <br/>
                    Die offizielle und rechtsverbindliche Liste der Regionen mit Ausgangssperre befindet sich <a
                    href="https://www.corona-katastrophenschutz.bayern.de/hotspotregionen/index.php">hier</a>, die
                    Angaben hier beziehen sich lediglich auf die berechneten Inzidenzen und kann durch uneindeutige
                    Handhabung der Vorgaben von den hiesigen Angaben abweichen.
                </div>
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
import {getAnnotatedName} from "../js/render";
import {getFromStorage} from "../js/store";

const BAVARIA_DISTRICTS = ['09161', '09162', '09163', '09171', '09172', '09173', '09174', '09175', '09176', '09177', '09178', '09179', '09180', '09181', '09182', '09183', '09184', '09185', '09186', '09187', '09188', '09189', '09190', '09261', '09262', '09263', '09271', '09272', '09273', '09274', '09275', '09276', '09277', '09278', '09279', '09361', '09362', '09363', '09371', '09372', '09373', '09374', '09375', '09376', '09377', '09461', '09462', '09463', '09464', '09471', '09472', '09473', '09474', '09475', '09476', '09477', '09478', '09479', '09561', '09562', '09563', '09564', '09565', '09571', '09572', '09573', '09574', '09575', '09576', '09577', '09661', '09662', '09663', '09671', '09672', '09673', '09674', '09675', '09676', '09677', '09678', '09679', '09761', '09762', '09763', '09764', '09771', '09772', '09773', '09774', '09775', '09776', '09777', '09778', '09779', '09780'];

export default {
    data() {
        return {
            state: {
                rki: "Inzidenzen werden geladen...",
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
        let agss = getFromStorage();
        const URL = "https://api.corona-zahlen.org/districts/history/incidence/14";
        requestSingle(this, URL, (vm, data) => {
            vm.districts = agss
                .filter(ags => BAVARIA_DISTRICTS.includes(ags))
                .map(ags => {
                    let name = data.data[ags].name;
                    name = getAnnotatedName(ags, name);

                    const incidences = data.data[ags].history.map(h => h.weekIncidence);

                    /**
                     * The district has a curfew if there are 3 consecutive days where the 7-day-incidence is
                     * over 100. The curfew is in place on the second day after the third consecutive day over 100.
                     * The curfew is lifted if the 7-day-incidence is stable < 100 for 7 consecutive days.
                     */
                    let startingDay = 2;
                    let evaluated = false;
                    let has = false;
                    const max = Math.max.apply(Math, incidences);

                    //skip evaluation if we had below 100 in the last 7 days
                    if (!incidences.slice(-7).some(i => i >= 100)) evaluated = true;

                    while (!evaluated) {
                        let sequence = 0;
                        for (let i = startingDay - 2; i < 14; i++) {
                            //check if we have a day > 100, increment the counter accordingly
                            if (incidences[i] < 100) {
                                sequence = 0;
                            } else {
                                sequence++;
                            }

                            //if we have a 3-day consecutive sequence, curfew starts the second day after the third
                            if (sequence >= 3) {
                                startingDay = i + 2;
                                break;
                            }
                        }

                        //now check if we have 7 consecutive days < 100 after the starting day - if not: curfew
                        let consecutive = 0;
                        for (let i = startingDay; i < 14; i++) {
                            if (incidences[i] < 100) {
                                consecutive++;
                            } else {
                                consecutive = 0;
                            }
                        }

                        if (startingDay >= 14) {
                            //we have overflowed the area of interest - no curfew (yet)
                            has = false;
                            evaluated = true;
                            break;
                        } else if (sequence >= 3 && consecutive < 7) {
                            has = true;
                            evaluated = true;
                            break;
                            //has curfew if we had 3 consecutive days over 100 and not 7 days below after two extra
                        } else {
                            //we haven't found a curfew, but advance our pattern matching to the next starting day
                            startingDay++;
                        }
                    }

                    let color, isClose;
                    if (has) {
                        color = "red darken-2";
                        isClose = false;
                    } else if (incidences[incidences.length - 1] > 85) {
                        color = "orange darken-2";
                        isClose = true;
                    } else {
                        color = "green darken-2";
                        isClose = false;
                    }

                    return {
                        name: name,
                        ags: ags,
                        hasCurfew: has,
                        maxIncidence: max,
                        color: color,
                        isClose: isClose,
                        lastIncidence: incidences[incidences.length - 1]
                    };
                });

            vm.state.rki = new Date(data.meta.lastUpdate).toLocaleString("de-de");
        });
    },
    created() {

    },
    methods: {}
};
</script>
