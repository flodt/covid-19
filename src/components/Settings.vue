<template>
    <section>
        <navigation></navigation>
        <div class="container">
            <div class="section">
                <div class="row">
                    <h5 class="center"><b>Einstellungen</b></h5>

                    <h6 class="center"><b>Farbschema</b></h6>
                    <div class="row">
                        <select v-model="colorScheme" @change="update"
                                class="browser-default col s12 m8 l6 offset-l3 offset-m2">
                            <option value="1">Standard</option>
                            <option value="2">Pride</option>
                            <option value="3">Standard (farbige Karten)</option>
                            <option value="4">ZEIT Online</option>
                            <option value="5">Erdtöne</option>
                            <option value="6">Pink Unicorn</option>
                            <option value="7">Graustufen</option>
                            <option value="8">Pastellfarben</option>
                        </select>
                    </div>

                    <h6 class="center"><b>Landkreise</b></h6>
                    <p class="center">
                        Landkreise auswählen, die auf der Seite angezeigt werden.
                        <br/>
                        Zum Umordnen der Landkreise Drag-And-Drop verwenden!
                    </p>

                    <div class="col s12 m8 l6 offset-l3 offset-m2">
                        <ul class="collection" v-if="checkedDistricts.length > 0">
                            <draggable v-model="checkedDistricts" @start="drag=true" @end="drag=false; update()">
                                <li v-for="chk in checkedDistricts"
                                    :key="chk.ags"
                                    class="collection-item">
                                    <div>
                                        <b>{{ getAnnotatedName(chk, getDetails(chk).name) }}</b>
                                        ({{ getDetails(chk).stateShort }})
                                        <span class="secondary-content grey-text text-darken-2">
                                        <i class="material-icons">reorder</i>
                                    </span>
                                    </div>
                                </li>
                            </draggable>
                        </ul>

                        <div class="center-align">
                            <a class="waves-effect waves-light btn" @click="clear" style="margin-top: 10px">
                                <i class="material-icons left">delete</i>
                                Löschen
                            </a>
                            <a class="waves-effect waves-light btn" @click="toDefault" style="margin-top: 10px">
                                <i class="material-icons left">undo</i>
                                Standard auswählen
                            </a>
                            <a class="waves-effect waves-light btn" @click="all" style="margin-top: 10px">
                                <i class="material-icons left">all_inclusive</i>
                                Alle auswählen
                            </a>
                        </div>
                    </div>

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
                                <th>Landkreis</th>
                                <th>Bundesland</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="dist in filteredDistricts">
                                <td>
                                    <label>
                                        <input type="checkbox" :value="dist.ags" :id="dist.ags"
                                               v-model="checkedDistricts"
                                               class="filled-in"
                                               @click="update">
                                        <span class="black-text"><b>{{
                                                getAnnotatedName(dist.ags, dist.name)
                                            }}</b></span>
                                    </label>
                                </td>
                                <td>{{ dist.state }}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <footer>
            <div class="container">
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
import {getAnnotatedName} from "../js/render";
import {DEFAULT_DISTRICTS, getColorScheme, getFromStorage, saveColorScheme, saveToStorage} from "../js/store";
import draggable from 'vuedraggable';

/**
 * This is the data source for all the districts in germany, complete with their AGSs the lookup is based on.
 * This works for every district, except for Berlin.
 * Because for some inexplicable reason the RKI lists 'null' for the AGS of the city - something the system
 * cannot handle in the state it is in right now.
 * This is, apparently, not due to there being no AGS for Berlin - this list:
 * https://www.riserid.eu/data/user_upload/downloads/info-pdf.s/Diverses/Liste-Amtlicher-Gemeindeschluessel-AGS-2015.pdf
 * gives the value 11000000, (being the complete AGS, the first 5 chars of that are the district key).
 * However, since I get the district names from the RKI, Berlin cannot be rendered in this website right now, as
 * the selected districts are stored by storing the AGS.
 * Thus, this dashboard will have to make due without being able to display the infection statistics in the
 * country's capital city :)
 */
const staticDistricts = require("../../static/districts.json");

export default {
    data() {
        return {
            checkedDistricts: [],
            allDistricts: [],
            filterText: "",
            colorScheme: "1"
        };
    },
    computed: {
        filteredDistricts() {
            return this.allDistricts.filter(item => {
                const districtMatch = item.name.toLowerCase().indexOf(this.filterText.toLowerCase()) > -1;
                const stateMatch = item.state.toLowerCase().indexOf(this.filterText.toLowerCase()) > -1;
                return districtMatch || stateMatch;
            })
        }
    },
    components: {
        navigation,
        draggable
    },
    mounted() {
        const selects = document.querySelectorAll('select');
        const instances = M.FormSelect.init(selects, {});

        //update the model with the selected districts
        this.checkedDistricts = getFromStorage();
        this.allDistricts = staticDistricts.sort((a, b) => a.name > b.name ? 1 : -1);
        this.colorScheme = getColorScheme();
    },
    created() {

    },
    methods: {
        getDetails: function (ags) {
            return staticDistricts.filter(d => d.ags === ags)[0];
        },
        update() {
            setTimeout(() => {
                saveToStorage(this.checkedDistricts);
                saveColorScheme(this.colorScheme);
            }, 0);
        },
        toDefault() {
            this.checkedDistricts = DEFAULT_DISTRICTS;
            saveToStorage(DEFAULT_DISTRICTS);
            M.toast({html: 'Standardlandkreise wurden ausgewählt.'});
        },
        clear() {
            this.checkedDistricts = [];
            saveToStorage([]);
            M.toast({html: 'Landkreisauswahl gelöscht.'});
        },
        all() {
            const allFromFilter = this.filteredDistricts.map(d => d.ags);
            this.checkedDistricts = allFromFilter;
            saveToStorage(allFromFilter);
            M.toast({html: 'Alle ausgewählt.'});
        },
        ignore() {
        },
        getAnnotatedName: getAnnotatedName
    }
};
</script>
