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

        try {
            const data = await this.onSearch(this.carriageState.toApiFormat());
            this.toggleProgress(false);
            this.showResult(data); 
        } catch (error) {
            this.toggleProgress(false);
            console.error("Ошибка при поиске", error);
        }
    }
    
    toggleProgress(show) {
        this.progressBlock.classList.toggle("progress-block-visible", show);
        this.checkBtn.disabled = show;
        if (show) this.resultCard.classList.remove("result-card-visible");
    }
    
    showResult(data) {
        if (!this.resultCard) return;

        const resultText = this.form.querySelector("#result-text");
        const resultTitle = this.form.querySelector(".result-title");
        const resultBadge = this.form.querySelector(".result-badge");
        
        resultText.innerHTML = "";

        if (!data || data.length === 0) {
            // СЛУЧАЙ: Место занято
            this.resultCard.style.border = "1px solid rgba(239, 68, 68, 0.44)"; // Красная граница
            this.resultCard.style.background = "radial-gradient(circle at top left, #ef444433 0, #ef444406 55%), rgba(15, 23, 42, 0.95)";

            resultBadge.textContent = "Занято";
            resultBadge.style.background = "rgba(220, 38, 38, 0.14)";
            resultBadge.style.color = "#fca5a5";

            resultTitle.textContent = "Место выкуплено";
            resultText.textContent = "Место выкуплено на всем маршруте.";
        } else {
            // СЛУЧАЙ: Есть свободные сегменты
            this.resultCard.style.border = "1px solid rgba(34, 197, 94, 0.44)"; // Зеленая граница (дефолт)
            this.resultCard.style.background = ""; 

            resultBadge.textContent = "Свободно";
            resultBadge.style.background = "rgba(22, 163, 74, 0.14)";
            resultBadge.style.color = "#bbf7d0";

            resultTitle.textContent = "Место свободно:";
            
            const listHtml = data.map(segment => `
            <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span style="color: #22c55e;">●</span>
                <span>${segment.stationFrom.value} → ${segment.stationTo.value}</span>
            </div>
        `).join("");

            resultText.innerHTML = listHtml;
        }
        
        const meta = this.form.querySelector("#result-meta");
        meta.textContent = `${this.carriageState.trainNumber} · Вагон ${this.carriageState.carNumber} · Место ${this.carriageState.placeNumber}`;

        this.resultCard.classList.add("result-card-visible");
    }
   
}