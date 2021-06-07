import M from "materialize-css";

export const DEFAULT_DISTRICTS = ["09778", "09162", "09179", "09762", "09777", "09188", "09178", "09175", "09772"];
export const COLOR_DEFAULT = "1";
export const COLOR_PRIDE = "2";
export const COLOR_COLORFUL_MAP = "3";
export const COLOR_ZEIT = "4";
export const COLOR_EARTHY = "5";
export const DEFAULT_COLOR_SCHEME = COLOR_DEFAULT;

export function getFromStorage() {
    const selected = localStorage.getItem("selectedDistricts");

    if (selected === null || selected === "null") {
        //if we have no selected districts, save and return the defaults
        localStorage.setItem("selectedDistricts", JSON.stringify(DEFAULT_DISTRICTS));
        return DEFAULT_DISTRICTS;
    } else {
        //else return what we got
        return JSON.parse(selected);
    }
}

export function saveToStorage(agss) {
    localStorage.setItem("selectedDistricts", JSON.stringify(agss));
}

export function getColorScheme() {
    const colorScheme = localStorage.getItem("colorScheme");

    if (colorScheme === null || colorScheme === "null" || colorScheme === undefined) {
        //set to default color scheme
        localStorage.setItem("colorScheme", DEFAULT_COLOR_SCHEME);
        return DEFAULT_COLOR_SCHEME;
    } else {
        return colorScheme;
    }
}

export function saveColorScheme(scheme) {
    localStorage.setItem("colorScheme", scheme);
}

export function shouldShowPrideInfoBanner() {
    const hasShownBanner = localStorage.getItem("hasSeenPrideBanner");

    if (hasShownBanner === null || hasShownBanner === "null" || hasShownBanner === undefined || hasShownBanner === false) {
        //show the banner, set the color scheme to pride
        localStorage.setItem("colorScheme", COLOR_PRIDE);
        localStorage.setItem("hasSeenPrideBanner", "true");
        return true;
    } else {
        return false;
    }
}

export function dismissPrideInfoBanner(vm) {
    localStorage.setItem("hasSeenPrideBanner", "true");
    vm.state.showPrideBanner = false;
}
