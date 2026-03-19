export class StationList {
    constructor(containerElement, onSelect) {
        this.container = containerElement; 
        this.onSelect = onSelect;           
    }
    
    render(stations) {
        this.clear();

        if (!stations || stations.length === 0) {
            this.container.classList.remove("station-suggestions-visible");
            return;
        }
        const fragment = document.createDocumentFragment();

        stations.forEach(station => {
            const item = document.createElement("div");
            item.className = "station-suggestion-item";

            item.innerHTML = `
                <span class="station-suggestion-name">${station.stationName}</span>
            `;
            
            item.addEventListener("mousedown", (e) => {
                e.preventDefault();
                this.handleSelect(station);
            });

            fragment.appendChild(item);
        });

        this.container.appendChild(fragment);
        this.container.classList.add("station-suggestions-visible");
    }

    handleSelect(station) {
        this.onSelect(station);
        this.clear();
    }

    clear() {
        this.container.innerHTML = "";
        this.container.classList.remove("station-suggestions-visible");
    }
}