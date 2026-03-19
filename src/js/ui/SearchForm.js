import {Carriage} from "../models/Carriage.js";
import {fetchStations} from "../api/stationApi.js";
import {StationMapper} from "../utils/StationMapper.js";
import {AutocompleteStations} from "./AutocompleteStations.js";

export class SearchForm {
    constructor(formId, onSearch) {
        this.form = document.getElementById(formId);
        this.dateInput = document.getElementById("date");
        this.checkBtn = document.getElementById("check-btn");
        this.progressBlock = document.getElementById("progress-block");
        this.resultCard = document.getElementById("result-card");

        this.onSearch = onSearch;
        this.carriageState = new Carriage();
        
        this.init();
    }
    
    init() {
        this.initDefaultDate();
        this.initAutocompletes();
        this.form.addEventListener("input", (e) => this.handleInputChange(e));
        this.form.onsubmit = (e) => this.handleSubmit(e);
    }

    initDefaultDate() {
        if (this.dateInput) {
            const today = new Date().toISOString().split('T')[0];
            this.dateInput.value = today;
            this.carriageState.date = today; 
        }
    }

    initAutocompletes() {
        this.departureAutocomplete = new AutocompleteStations({
            input: document.getElementById("station-departure"),
            listContainer: document.querySelector('[data-for="station-departure"]'),
            searchProvider: this.searchStation,
            onStationChosen: (station) => {
                this.carriageState.from = station.stationId;
            }
        });

        this.arrivalAutocomplete = new AutocompleteStations({
            input: document.getElementById("station-arrival"),
            listContainer: document.querySelector('[data-for="station-arrival"]'),
            searchProvider: this.searchStation,
            onStationChosen: (station) => {
                this.carriageState.to = station.stationId;
            }
        });
    }

    handleInputChange(e) {
        const {name, value} = e.target;
        if (name in this.carriageState) {
            this.carriageState[name] = value;
        }
    }

    searchStation = async (text) => {
        const dtos = await fetchStations(text);
        return StationMapper.toModelList(dtos);
    };

    async handleSubmit(e) {
        e.preventDefault();
        this.toggleProgress(true);
        
        await this.onSearch(this.carriageState.toApiFormat());

        this.toggleProgress(false);
        this.showResult();
    }
    
    toggleProgress(show) {
        this.progressBlock.classList.toggle("progress-block-visible", show);
        this.checkBtn.disabled = show;
        if (show) this.resultCard.classList.remove("result-card-visible");
    }

    showResult() {
        this.resultCard.classList.add("result-card-visible");
    }
   
}