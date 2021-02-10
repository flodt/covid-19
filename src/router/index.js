import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Hotspots from '@/components/Hotspots'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Startseite',
            component: Home
        },
        {
            path: '/hotspots',
            name: 'Hotspots',
            component: Hotspots
        }
    ]
})
