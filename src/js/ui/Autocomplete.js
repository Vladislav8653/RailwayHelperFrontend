import { StationList } from './StationList.js';
import { debounce } from '../utils/debounce.js';

export class Autocomplete {
    constructor(config) {
        this.input = config.input;
        this.searchProvider = config.searchProvider;
        
        this.list = new StationList(config.listContainer, (station) => {
            this.input.value = station.stationName;
            config.onStationChosen(station);
        });

        this.debouncedHandle = debounce(this.performSearch.bind(this), 300);
        this.init();
    }

    init() {
        this.input.addEventListener("input", async (e) => {
            const value = e.target.value.trim();

            if (value.length < 3) {
                this.list.clear();
                return;
            }
            
            this.debouncedHandle(value);
        });

        this.input.addEventListener("blur", () => {
            setTimeout(() => this.list.clear(), 150);
        });
    }

    async performSearch(value) {
        try {
            const stations = await this.searchProvider(value);
            console.log('Данные получены:', stations); 
            this.list.render(stations);
        } catch (error) {
            console.error("Ошибка поиска:", error);
            this.list.clear();
        }
    }
}