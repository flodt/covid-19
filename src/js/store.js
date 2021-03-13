export const DEFAULT_DISTRICTS = ["09778", "09162", "09179", "09762", "09777", "09188", "09178", "09175", "09772"];

export function getFromStorage() {
    const selected = localStorage.getItem("selectedDistricts");

    if (selected === null) {
        //if we have no selected districts, save and return the defaults
        localStorage.setItem("selectedDistricts", JSON.stringify(DEFAULT_DISTRICTS));
        return defaults;
    } else {
        //else return what we got
        return JSON.parse(selected);
    }
}

export function saveToStorage(agss) {
    localStorage.setItem("selectedDistricts", JSON.stringify(agss));
}
