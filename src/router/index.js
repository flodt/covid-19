import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Hotspots from '@/components/Hotspots'
import Curfew from '@/components/Curfew'
import States from '@/components/States'
import Historical from '@/components/Historical'

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
        },
        {
            path: '/curfew',
            name: 'Ausgangssperren',
            component: Curfew
        },
        {
            path: '/states',
            name: 'Bundesländer',
            component: States
        },
        {
            path: '/historical',
            name: 'Verlauf',
            component: Historical
        }
    ]
})
