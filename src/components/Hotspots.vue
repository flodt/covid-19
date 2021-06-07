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
                    <h5 class="center"><b>Statistiken</b></h5>
                    <!--
                    <div class="col s12 m8 l6 offset-m2">
                        <div class="card-panel">
                            <table class="centered">
                                <thead>
                                <tr>
                                    <th class="text-color green-text text-darken-2">0-35:</th>
                                    <th class="text-color amber-text text-darken-2">35-50:</th>
                                    <th class="text-color orange-text text-darken-2">50-100:</th>
                                    <th class="text-color deep-orange-text text-darken-2">100-200:</th>
                                    <th class="text-color red-text text-darken-2">200+:</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td class="text-color green-text text-darken-2"><h5>{{ stat.below35 }}</h5></td>
                                    <td class="text-color amber-text text-darken-2"><h5>{{ stat.at3550 }}</h5></td>
                                    <td class="text-color orange-text text-darken-2"><h5>{{ stat.at50100 }}</h5></td>
                                    <td class="text-color deep-orange-text text-darken-2"><h5>{{ stat.at100200 }}</h5>
                                    </td>
                                    <td class="text-color red-text text-darken-2"><h5>{{ stat.above200 }}</h5></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    -->
                    <div class="col s12 m8 l6 offset-m2 offset-l3">
                        <div class="card-panel">
                            <div style="width: inherit; height: inherit; position: relative;">
                                <canvas id="chart_district_count"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row" v-if="state.ready">
                    <div class="col l6 m12 s12">
                        <h5 class="center"><b>Hotspots</b></h5>
                        <div class="card-panel" v-for="card in hotspots" :style="`background-color: ${card.color}; color: ${card.textColor}`">
                            <h6><b>{{ card.index }}. {{ card.name }}</b> ({{ card.state }})<span
                                style="float: right;">{{ card.incidence.toFixed(1) }}</span></h6>
                        </div>
                    </div>
                    <div class="col l6 m12 s12">
                        <h5 class="center"><b>Coldspots</b></h5>
                        <div class="card-panel" v-for="card in coldspots" :style="`background-color: ${card.color}; color: ${card.textColor}`">
                            <h6><b>{{ card.index }}. {{ card.name }}</b> ({{ card.state }})<span
                                style="float: right;">{{ card.incidence.toFixed(1) }}</span></h6>
                        </div>
                    </div>
                </div>

                <div class="row center" v-if="state.ready">
                    <h5 class="center"><b>Übersicht</b></h5>

                    <form class="col s12" @submit="ignore">
                        <div class="row">
                            <div class="input-field col s12">
                                <i class="material-icons prefix">search</i>
                                <input id="icon_prefix" type="text" class="validate" v-model="filterText">
                                <label for="icon_prefix">Suchen...</label>
                            </div>
                        </div>
                    </form>

                    <div class="col s12 m12 l12">
                        <table class="striped">
                            <thead>
                            <tr>
                                <th>Index</th>
                                <th>Landkreis</th>
                                <th>7-Tage-Inzidenz</th>
                                <th>Fälle (gesamt)</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="dist in filteredDistricts">
                                <td>{{ dist.index }} <span class="blue-text">{{ dist.selected ? "&#9679;" : "" }}</span></td>
                                <td><b>{{ dist.name }}</b></td>
                                <td :style="{'color': dist.color}"><b>{{ dist.incidence.toFixed(1) }}</b></td>
                                <td>{{ dist.casesTotal }}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <footer>
            <div class="grey-text text-darken-2" style="text-align: center;">Hotspots zeigen Daten des RKI.</div>
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
import {requestData} from "@/js/api.js"
import {renderHotspots} from "../js/render";

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
            },
            hotspots: [],
            coldspots: [],
            overview: [],
            stat: {
                below35: 0,
                at3550: 0,
                at50100: 0,
                at100200: 0,
                above200: 0
            },
            filterText: ""
        };
    },
    computed: {
        filteredDistricts() {
            return this.overview.filter(item => {
                return item.name.toLowerCase().indexOf(this.filterText.toLowerCase()) > -1;
            })
        }
    },
    components: {
        navigation
    },
    mounted() {
        //call the APIs
        requestData(this, renderHotspots);
    },
    created() {

    },
    methods: {
        ignore() {}
    }
};
</script>
