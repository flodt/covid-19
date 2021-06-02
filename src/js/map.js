import {colorsForIncidences} from "./render";
const world = require("../../static/world.json");

export function renderHeatmap(vm, data) {
    vm.state.heatmapLoading = false;

    const bounds = new L.LatLngBounds(new L.LatLng(59.27585442576808, 1.4037055536285483), new L.LatLng(43.808344036871276, 19.555926093968022));
    const map = L.map("heatmap", {
        center: bounds.getCenter(),
        zoom: 5.5,
        maxBounds: bounds,
        maxBoundsViscosity: 0.75
    });
    let geoJson;
    const info = L.control();

    //color source: https://www.zeit.de/wissen/gesundheit/coronavirus-echtzeit-karte-deutschland-landkreise-infektionen-ausbreitung
    function colorScale(incidence) {
        return colorsForIncidences(incidence).mapColor;
    }

    //define map style depending on incidence
    function style(feature) {
        return {
            fillColor: colorScale(feature.properties.cases7_per_100k),
            weight: 1,
            opacity: 0.45,
            color: 'white',
            fillOpacity: 1
        }
    }

    //install feature listeners
    function highlightFeature(e) {
        const layer = e.target;

        layer.setStyle({
            weight: 1,
            color: 'white',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
        geoJson.resetStyle(e.target);
        info.update();
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight
        });
    }

    //register info
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    }

    info.update = function (props) {
        this._div.innerHTML = `<big class="grey-text text-darken-2"><b>7-Tage-Inzidenz</b></big><br/>${props ?
            '<b>' + props.GEN + '</b><br />' + props.cases7_per_100k.toFixed(1)
            : 'Landkreis auswählen'}`;
    };

    info.addTo(map);

    //add legend
    const legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        const div = L.DomUtil.create('div', 'info legend');
        const grades = [0, 35, 50, 100, 200];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                "<div style=\"background-color: " + colorScale(grades[i] + 1) + "\" class=\"" + getContrastYIQ(colorScale(grades[i] + 1)) + "\">" + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+') + "</div>";
        }

        return div;
    };

    legend.addTo(map);

    //add data to the map
    geoJson = L.geoJSON(data.features, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
}

/**
 * source: https://stackoverflow.com/a/11868398/4231365
 */
function getContrastYIQ(hex){
    hex = hex.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '' : 'white-text';
}

export function renderWorldwideIncidenceMap(vm) {
    const bounds = new L.LatLngBounds(new L.LatLng(84.84443124832553, -177.23421452876624), new L.LatLng(-70.79876307395632, 175.0314110667352));
    const map = L.map("world_incidence_map", {
        center: bounds.getCenter(),
        zoom: 1.40,
        maxBounds: bounds,
        maxBoundsViscosity: 0.75
    });

    let geoJson;
    const info = L.control();

    //color source: https://www.zeit.de/wissen/gesundheit/coronavirus-echtzeit-karte-deutschland-landkreise-infektionen-ausbreitung
    function colorScale(incidence) {
        return colorsForIncidences(incidence).mapColor;
    }

    //define map style depending on incidence
    function style(feature) {
        const backgroundData = vm.countries.filter(c => c.codeAlpha3 === feature.properties.iso_a3)[0];
        let color = (backgroundData === undefined) ? "#d0d0d0" : colorScale(backgroundData.incidence);

        return {
            fillColor: color,
            weight: 1,
            opacity: 0.45,
            color: 'white',
            fillOpacity: 1
        }
    }

    //install feature listeners
    function highlightFeature(e) {
        const layer = e.target;

        layer.setStyle({
            weight: 1,
            color: 'white',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
        geoJson.resetStyle(e.target);
        info.update();
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight
        });
    }

    //register info
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    }

    info.update = function (props) {
        const backgroundData = (props !== undefined) ? vm.countries.filter(c => c.codeAlpha3 === props.iso_a3)[0] : undefined;
        const name = (backgroundData !== undefined) ? backgroundData.name : "Keine Daten";
        const incidence = (backgroundData !== undefined) ? backgroundData.incidence.toFixed(1) : "Keine Daten";

        this._div.innerHTML = `<big class="grey-text text-darken-2"><b>7-Tage-Inzidenz</b></big><br/>${props ?
            '<b>' + name + '</b><br />' + incidence
            : 'Land auswählen'}`;
    };

    info.addTo(map);

    //add legend
    const legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        const div = L.DomUtil.create('div', 'info legend');
        const grades = [0, 35, 50, 100, 200];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                "<div style=\"background-color: " + colorScale(grades[i] + 1) + "\" class=\"" + getContrastYIQ(colorScale(grades[i] + 1)) + "\">" + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+') + "</div>";
        }

        return div;
    };

    legend.addTo(map);

    //add data to the map
    geoJson = L.geoJSON(world, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
}

export function renderWorldwideVaccMap(vm) {
    const bounds = new L.LatLngBounds(new L.LatLng(84.84443124832553, -177.23421452876624), new L.LatLng(-70.79876307395632, 175.0314110667352));
    const map = L.map("world_vacc_map", {
        center: bounds.getCenter(),
        zoom: 1.40,
        maxBounds: bounds,
        maxBoundsViscosity: 0.75
    });
    let geoJson;
    const info = L.control();

    //generate color scale dynamically
    const sum = vm.countries.map(c => c.vaccinated).reduce((a, b) => a + b, 0);
    const maxToScale = 2 * (sum / vm.countries.length) || 0;

    function colorScale(vaccinated, max) {
        const colors = ['#edf8e9','#c7e9c0','#a1d99b','#74c476','#31a354','#006d2c'];
        return colors[Math.min(Math.floor(vaccinated * 6 / maxToScale), 5)];
    }

    //define map style depending on incidence
    function style(feature) {
        const max = Math.max(...vm.countries.map(c => c.vaccinated));
        const backgroundData = vm.countries.filter(c => c.codeAlpha3 === feature.properties.iso_a3)[0];
        let color = (backgroundData === undefined) ? "#d0d0d0" : colorScale(backgroundData.vaccinated, max);

        return {
            fillColor: color,
            weight: 1,
            opacity: 0.45,
            color: 'white',
            fillOpacity: 1
        }
    }

    //install feature listeners
    function highlightFeature(e) {
        const layer = e.target;

        layer.setStyle({
            weight: 1,
            color: 'white',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
        geoJson.resetStyle(e.target);
        info.update();
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight
        });
    }

    //register info
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    }

    info.update = function (props) {
        const backgroundData = (props !== undefined) ? vm.countries.filter(c => c.codeAlpha3 === props.iso_a3)[0] : undefined;
        const name = (backgroundData !== undefined) ? backgroundData.name : "Keine Daten";
        const vaccinated = (backgroundData !== undefined) ? backgroundData.vaccinated.toFixed(1) : "Keine Daten";

        this._div.innerHTML = `<big class="grey-text text-darken-2"><b>Erstgeimpfte</b></big><br/>${props ?
            '<b>' + name + '</b><br />' + vaccinated + " %"
            : 'Land auswählen'}`;
    };

    info.addTo(map);

    //add legend
    const legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        const div = L.DomUtil.create('div', 'info legend');
        let grades = [];
        const step = maxToScale / 5;
        for (let i = 0; i < 6; i++) {
            grades.push(+(step * i).toFixed(1));
        }

        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                "<div style=\"background-color: " + colorScale(grades[i] + 1) + "\" class=\"" + getContrastYIQ(colorScale(grades[i] + 1)) + "\"> > " + grades[i] + " %</div>";
        }

        return div;
    };

    legend.addTo(map);

    //add data to the map
    geoJson = L.geoJSON(world, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
}

export function renderWorldwideDeathMap(vm) {
    const bounds = new L.LatLngBounds(new L.LatLng(84.84443124832553, -177.23421452876624), new L.LatLng(-70.79876307395632, 175.0314110667352));
    const map = L.map("world_death_map", {
        center: bounds.getCenter(),
        zoom: 1.40,
        maxBounds: bounds,
        maxBoundsViscosity: 0.75
    });
    let geoJson;
    const info = L.control();

    //generate color scale dynamically
    const sum = vm.countries.map(c => c.deathIncidence).reduce((a, b) => a + b, 0);
    const maxToScale = 2.5 * (sum / vm.countries.length) || 0;

    function colorScale(deaths, max) {
        const colors = ['#f7f7f7','#d9d9d9','#bdbdbd','#969696','#636363','#252525'];
        return colors[Math.min(Math.floor(deaths * 6 / maxToScale), 5)];
    }

    //define map style depending on incidence
    function style(feature) {
        const max = Math.max(...vm.countries.map(c => c.deathIncidence));
        const backgroundData = vm.countries.filter(c => c.codeAlpha3 === feature.properties.iso_a3)[0];
        let color = (backgroundData === undefined) ? "#d0d0d0" : colorScale(backgroundData.deathIncidence, max);

        return {
            fillColor: color,
            weight: 1,
            opacity: 0.45,
            color: 'white',
            fillOpacity: 1
        }
    }

    //install feature listeners
    function highlightFeature(e) {
        const layer = e.target;

        layer.setStyle({
            weight: 1,
            color: 'white',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
        geoJson.resetStyle(e.target);
        info.update();
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight
        });
    }

    //register info
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    }

    info.update = function (props) {
        const backgroundData = (props !== undefined) ? vm.countries.filter(c => c.codeAlpha3 === props.iso_a3)[0] : undefined;
        const name = (backgroundData !== undefined) ? backgroundData.name : "Keine Daten";
        const deathIncidence = (backgroundData !== undefined) ? backgroundData.deathIncidence.toFixed(1) : "Keine Daten";

        this._div.innerHTML = `<big class="grey-text text-darken-2"><b>Tote / 100.000 EW</b></big><br/>${props ?
            '<b>' + name + '</b><br />' + deathIncidence
            : 'Land auswählen'}`;
    };

    info.addTo(map);

    //add legend
    const legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        const div = L.DomUtil.create('div', 'info legend');
        let grades = [];
        const step = maxToScale / 5;
        for (let i = 0; i < 6; i++) {
            grades.push(+(step * i).toFixed(1));
        }

        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                "<div style=\"background-color: " + colorScale(grades[i] + 1) + "\" class=\"" + getContrastYIQ(colorScale(grades[i] + 1)) + "\"> > " + grades[i] + "</div>";
        }

        return div;
    };

    legend.addTo(map);

    //add data to the map
    geoJson = L.geoJSON(world, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
}

export function renderWorldwideSecondVaccMap(vm) {
    const bounds = new L.LatLngBounds(new L.LatLng(84.84443124832553, -177.23421452876624), new L.LatLng(-70.79876307395632, 175.0314110667352));
    const map = L.map("world_second_vacc_map", {
        center: bounds.getCenter(),
        zoom: 1.40,
        maxBounds: bounds,
        maxBoundsViscosity: 0.75
    });
    let geoJson;
    const info = L.control();

    //generate color scale dynamically
    const sum = vm.countries.map(c => c.fullyVaccinated).reduce((a, b) => a + b, 0);
    const maxToScale = 1.5 * (sum / vm.countries.length) || 0;

    function colorScale(vaccinated, max) {
        const colors = ['#eff3ff', '#c6dbef', '#9ecae1', '#6baed6', '#3182bd', '#08519c'];
        return colors[Math.min(Math.floor(vaccinated * 5 / maxToScale), 5)];
    }

    //define map style depending on incidence
    function style(feature) {
        const max = Math.max(...vm.countries.map(c => c.fullyVaccinated));
        const backgroundData = vm.countries.filter(c => c.codeAlpha3 === feature.properties.iso_a3)[0];
        let color = (backgroundData === undefined) ? "#d0d0d0" : colorScale(backgroundData.fullyVaccinated, max);

        return {
            fillColor: color,
            weight: 1,
            opacity: 0.45,
            color: 'white',
            fillOpacity: 1
        }
    }

    //install feature listeners
    function highlightFeature(e) {
        const layer = e.target;

        layer.setStyle({
            weight: 1,
            color: 'white',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
        geoJson.resetStyle(e.target);
        info.update();
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight
        });
    }

    //register info
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    }

    info.update = function (props) {
        const backgroundData = (props !== undefined) ? vm.countries.filter(c => c.codeAlpha3 === props.iso_a3)[0] : undefined;
        const name = (backgroundData !== undefined) ? backgroundData.name : "Keine Daten";
        const vaccinated = (backgroundData !== undefined) ? backgroundData.fullyVaccinated.toFixed(1) : "Keine Daten";

        this._div.innerHTML = `<big class="grey-text text-darken-2"><b>Zweitgeimpfte</b></big><br/>${props ?
            '<b>' + name + '</b><br />' + vaccinated + " %"
            : 'Land auswählen'}`;
    };

    info.addTo(map);

    //add legend
    const legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        const div = L.DomUtil.create('div', 'info legend');
        let grades = [];
        const step = maxToScale / 5;
        for (let i = 0; i < 6; i++) {
            grades.push(+(step * i).toFixed(1));
        }

        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                "<div style=\"background-color: " + colorScale(grades[i] + 1) + "\" class=\"" + getContrastYIQ(colorScale(grades[i] + 1)) + "\"> > " + grades[i] + " %</div>";
        }

        return div;
    };

    legend.addTo(map);

    //add data to the map
    geoJson = L.geoJSON(world, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
}
