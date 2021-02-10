<template>
    <nav>
        <div class="nav-wrapper grey darken-4">
            <!-- <a href="#" class="brand-logo">Logo</a> -->
            <router-link to="/" class="brand-logo center" tag="a">
                <i class="material-icons left">home</i>
                COVID-19
            </router-link>

            <ul id="nav-mobile" class="right hide-on-small-and-down">
                <li>
                    <router-link to="/hotspots">
                        <i class="material-icons left">trending_up</i>
                        Hotspots
                    </router-link>
                </li>
            </ul>
            <a href="#" data-target="sidenav_mobile" class="sidenav-trigger left hide-on-med-and-up"><i class="material-icons">menu</i></a>

            <ul class="sidenav" id="sidenav_mobile">
                <li><div class="user-view">
                    <div class="background">
                        <img src="/static/gradient_nav.png" alt="Gradient">
                    </div>
                    <h4>COVID-19</h4>
                    <br/>
                </div></li>

                <li>
                    <router-link to="/" class="sidenav-close">
                        <i class="material-icons left">home</i>
                        Startseite
                    </router-link>
                </li>
                <li>
                    <a class="subheader">Statistik</a>
                </li>
                <li>
                    <router-link to="/hotspots" class="sidenav-close">
                        <i class="material-icons left">trending_up</i>
                        Hotspots
                    </router-link>
                </li>
            </ul>
        </div>
    </nav>
</template>

<script>
import firebase from "firebase";

export default {
    mounted() {
        const sidenavs = document.querySelectorAll('.sidenav');
        const sidenavs_init = M.Sidenav.init(sidenavs, {});
    }
};
</script>

