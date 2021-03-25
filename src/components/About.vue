<template>
    <section>
        <navigation></navigation>
        <div class="container">
            <div class="section">
                <h5 class="center"><b>Datenquellen</b></h5>
                <p>
                    Die COVID-19-Infektionsdaten des Dashboards stammen von verschiedenen Quellen,
                    um die aktuelle Infektionslage bestmöglich abzubilden.
                    Darunter fallen:
                </p>
                <div class="row">
                    <div class="col s12 m8 l6 offset-m2 offset-l3">
                        <div class="collection">
                            <a href="https://corona.rki.de" class="collection-item blue-text text-darken-1">Robert-Koch-Institut
                                (RKI)</a>
                            <a href="https://www.zeit.de/wissen/gesundheit/corona-zahlen-deutschland-neuinfektionen-inzidenz-aktuelle-karte"
                               class="collection-item blue-text text-darken-1">ZEIT Online (zur Infektionslage)</a>
                            <a href="https://www.zeit.de/wissen/gesundheit/corona-impfungen-deutschland-impfquote-impffortschritt-aktuelle-karte"
                               class="collection-item blue-text text-darken-1">ZEIT Online (zur Impfstatistik)</a>
                            <a href="https://ourworldindata.org/coronavirus"
                               class="collection-item blue-text text-darken-1">Our World in Data (weltweite
                                Infektionslage)</a>
                        </div>
                    </div>
                </div>
                <p>
                    Zum Zugriff auf die Daten des RKI werden sowohl die <a
                    href="https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/dd4580c810204019a7b8eb3e0b329dd6_0">offizielle
                    API</a> als auch der <a href="https://github.com/marlon360/rki-covid-api">Proxy von Marlon
                    Lückert</a> genutzt.
                </p>

                <h5 class="center" style="margin-top: 30px;"><b>Darstellung</b></h5>
                <p>
                    Insbesondere werden neben den offiziellen Meldezahlen des Robert-Koch-Instituts die Daten von ZEIT
                    Online für die Darstellung genutzt, da diese (<a
                    href="https://www.zeit.de/wissen/gesundheit/corona-zahlen-deutschland-neuinfektionen-inzidenz-aktuelle-karte#corona-karte-methodik-1-tab">laut
                    eigenen Angaben von ZEIT Online</a>) direkt von den Gesundheitsämtern der Landkreise und
                    Bundesländer bezogen werden, und somit weniger von langsamen Meldeketten betroffen sind.
                    Das RKI liefert so nicht unbedingt immer ein tagesaktuelles Bild des Infektionsgeschehens im
                    Inland, und die Zahlen von ZEIT Online zeigen Tendenzen in der Entwicklung der Inzidenzen
                    möglicherweise früher auf.
                    Dadurch kann es natürlich auch sein, dass behördliche Grenzwerte in den Daten von ZEIT Online früher
                    überschritten werden, als das in den Zahlen des RKI geschieht. Für die Einleitung von (örtlichen)
                    Gegenmaßnahmen sind allerdings natürlich <b>immer die offiziellen</b>, wenn auch etwas trägeren,
                    <b>Meldeinzidenzen relevant</b>.
                    In Bezug auf die konkrete Maßnahmenlage ist demnach immer ein Blick auf die <b>rechtsverbindlichen
                    Angaben der
                    zuständigen örtlichen Gesundheitsbehörde wichtig</b>.
                    Auf diesem Dashboard soll lediglich ein Überblick zur Verfügung gestellt werden.
                </p>

                <p>
                    Alle Daten in den folgenden Karten sind <b>fiktiv</b> und dienen <b>nur zur Veranschaulichung</b>.
                </p>

                <div class="row">
                    <div class="col s12 m12 l6 offset-l3">
                        <div class="card pink darken-3" style="height: 210px">
                            <div class="card-content white-text">
                                 <span class="card-title activator">Deutschland<i
                                     class="material-icons right">info_outline</i></span>
                                <div class="row">
                                    <div class="col">
                                        <h3 id="infected_yesterday">1.234</h3>
                                        <b class="hide-on-med-and-down"><a class="oncard"
                                                                           href="https://www.zeit.de/wissen/gesundheit/coronavirus-echtzeit-karte-deutschland-landkreise-infektionen-ausbreitung">Neuinfektionen
                                            gestern</a></b>
                                        <b class="hide-on-large-only"><a class="oncard"
                                                                         href="https://www.zeit.de/wissen/gesundheit/coronavirus-echtzeit-karte-deutschland-landkreise-infektionen-ausbreitung">Neuinf.
                                            gestern</a></b>
                                    </div>
                                    <div class="col">
                                        <h3 id="infected_7day">5.6</h3>
                                        <b><a class="oncard"
                                              href="https://www.zeit.de/wissen/gesundheit/coronavirus-echtzeit-karte-deutschland-landkreise-infektionen-ausbreitung">7-Tage-Inzidenz</a></b>
                                    </div>
                                </div>
                            </div>
                            <div class="card-reveal">
                                <span class="card-title">Deutschland<i class="material-icons right">close</i></span>
                                <div style="text-align: center;">
                                    <h3>1.00</h3>
                                    <b>4-Tage-R-Wert</b> (fiktiver Wert!)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <p>
                    Die landesweiten Angaben zu den <b>Neuinfektionen</b> (sowie der Historie für den Graph der
                    Neuinfektionen) und der <b>7-Tage-Inzidenz</b> werden von ZEIT
                    Online bezogen,
                    die Angaben zum aktuellen <b>4-Tage-R-Wert</b> stammen vom Robert-Koch-Institut.
                </p>

                <p>
                    Für jeden ausgewählten Landkreis und jede ausgewählte kreisfreie Stadt werden zur besseren
                    Vergleichbarkeit sowohl die <b>Inzidenzen</b> des RKI als auch die
                    von ZEIT Online angezeigt.
                    Im inneren der Karte befindet sich auch ein Graph, der die Inzidenzen in der letzten Woche nach den
                    Daten von ZEIT Online aufzeigt.
                </p>

                <div class="row">
                    <div class="col s12 m12 l4 offset-l4">
                        <div class="card orange darken-2">
                            <div class="card-content white-text">
                        <span class="card-title activator white-text">Atlantis<i
                            class="material-icons right">show_chart</i></span>
                                <div class="row">
                                    <div class="col">
                                        <h3>23.4</h3>
                                        <b><a class="oncard" href="https://corona.rki.de">RKI</a></b>
                                    </div>
                                    <div class="col">
                                        <h3>56.7</h3>
                                        <b><a class="oncard"
                                              href="https://www.zeit.de/wissen/gesundheit/coronavirus-echtzeit-karte-deutschland-landkreise-infektionen-ausbreitung">ZEIT
                                            Online</a></b>
                                    </div>
                                </div>
                            </div>
                            <div class="card-reveal">
                        <span class="card-title">Atlantis<i
                            class="material-icons right">close</i></span>
                                <div class="center" style="width: inherit; height: 70%; position: relative;">
                                    <canvas id="chart_demo_atlantis"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <p>
                    Die Farbe der Landkreiskarte wird dabei von der <b>höheren der beiden Inzidenzen</b> bestimmt und
                    geht nach
                    der folgenden Farbskala:
                </p>

                <div class="row">
                    <div class="col s4 m2 l2 offset-l1 offset-m1">
                        <div class="card-panel green darken-2 white-text">
                            <div style="text-align: center; font-weight: bold; font-size: 12pt">
                                < 35
                            </div>
                        </div>
                    </div>
                    <div class="col s4 m2 l2">
                        <div class="card-panel amber darken-2 white-text">
                            <div style="text-align: center; font-weight: bold; font-size: 12pt">
                                < 50
                            </div>
                        </div>
                    </div>
                    <div class="col s4 m2 l2">
                        <div class="card-panel orange darken-2 white-text">
                            <div style="text-align: center; font-weight: bold; font-size: 12pt">
                                < 100
                            </div>
                        </div>
                    </div>
                    <div class="col s4 m2 l2">
                        <div class="card-panel deep-orange darken-2 white-text">
                            <div style="text-align: center; font-weight: bold; font-size: 12pt">
                                < 200
                            </div>
                        </div>
                    </div>
                    <div class="col s4 m2 l2">
                        <div class="card-panel red darken-2 white-text">
                            <div style="text-align: center; font-weight: bold; font-size: 12pt">
                                > 200
                            </div>
                        </div>
                    </div>
                </div>

                <p>
                    Die Impfstatistik nutzt ebenfalls die von ZEIT Online zur Verfügung gestellten Daten.
                    Es gilt hier wieder: die in folgender Karte dargestellten Daten sind <b>fiktiv</b>!
                </p>

                <div class="row">
                    <div class="col s12 m12 l6 offset-l3">
                        <div class="card light-green darken-1" style="height: 210px">
                            <div class="card-content white-text">
                                <span class="card-title activator">Landesweit<i
                                    class="material-icons right">timer</i></span>
                                <div class="row">
                                    <div class="col">
                                        <h3 id="vaccinated_preliminary">4.56 %</h3>
                                        <b><a class="oncard"
                                              href="https://www.zeit.de/wissen/gesundheit/2021-01/corona-impfung-deutschland-anzahl-impfquote-aktuelle-zahlen-karte">
                                            Geimpfte
                                        </a></b>
                                    </div>
                                    <div class="col">
                                        <h3 id="vaccinated_protected">1.23 %</h3>
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
                                <div style="text-align: center;">
                                    <h4 id="herd_immunity_timer">2 Jahre, 10 Monate</h4>
                                    bei der Geschwindigkeit der letzten 21 Tage.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <p>
                    Hierbei bezeichnet <b>Geimpfte</b> den Anteil der Bevölkerung, der <b>mindestens eine Dosis</b>
                    eines Impfstoffs gegen COVID-19 verabreicht bekommen hat.
                    Dahingegen bezeichnet <b>voller Impfschutz</b> den Anteil der Bevölkerung, der durch die Impfung
                    vollständig gegen COVID-19 immunisiert wurde.
                    Dies kann durch eine zweite Impfung passiert sein (z.B. AstraZeneca, Biontech, Moderna) oder einen
                    Impfstoff, der nur auf eine Dosis ausgelegt ist (z.B. Johnson & Johnson).
                    Nachdem jede vollständig immunisierte Person mindestens eine Impfdosis erhalten hat, inkludiert die
                    Zahl der geimpften also alle Personen, die den vollständigen Schutz genießen.
                    Die hier beschriebenen Statistiken werden auch als Graphik visualisiert.
                </p>

                <p>
                    Zuletzt werden (auch nach Daten von ZEIT Online) noch die Klinikauslastung in Form der <b>belegten
                    Intensivbetten</b> sowie der <b>Toten seit Pandemiebeginn</b> in Zahlen sowie graphisch dargestellt.
                </p>

                <!--todo: elaborate on vaccination timer-->
                <!--todo: elaborate on remaining components-->
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
import {renderDemo} from "../js/render";
import {DEFAULT_DISTRICTS, getFromStorage, saveToStorage} from "../js/store";


export default {
    data() {
        return {};
    },
    computed: {},
    components: {
        navigation
    },
    mounted() {
        renderDemo(this);
    },
    created() {

    },
    methods: {}
};
</script>
