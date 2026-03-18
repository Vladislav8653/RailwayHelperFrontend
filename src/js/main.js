import { ScreenManager } from './ui/ScreenManager.js';
import { Autocomplete } from './ui/Autocomplete.js';
import { SearchForm } from './ui/SearchForm.js';
import { fetchStations } from './api/stationApi.js';
import { StationMapper } from './utils/stationMapper.js';
import { debounce } from './utils/debounce.js';


const screens = new ScreenManager();

const searchStation = async (text) => {
    const dtos = await fetchStations(text);
    return StationMapper.toModelList(dtos);
};

new SearchForm("main-form", async (formData) => {
    await new Promise(r => setTimeout(r, 1400));
});

document.getElementById("start-btn").onclick = () => screens.show("search");
document.getElementById("back-btn").onclick = () => screens.show("welcome");



let selectedDeparture = null;
let selectedArrival = null;

const departureAutocomplete = new Autocomplete({
    input: document.getElementById("station-departure"),
    listContainer: document.querySelector('[data-for="station-departure"]'),
    searchProvider: searchStation, 
    onStationChosen: (station) => {
        selectedDeparture = station;
        console.log("Сохранена станция отправления:", selectedDeparture);
    }
});

const arrivalAutocomplete = new Autocomplete({
    input: document.getElementById("station-arrival"),
    listContainer: document.querySelector('[data-for="station-arrival"]'),
    searchProvider: searchStation,
    onStationChosen: (station) => {
        selectedArrival = station;
        console.log("Сохранена станция прибытия:", selectedArrival);
    }
});