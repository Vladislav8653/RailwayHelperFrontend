export class Carriage {
    constructor() {
        this.from = "";        // stationId 
        this.to = "";          // stationId 
        this.trainNumber = ""; // Номер поезда
        this.date = "";        // Дата отправления
        this.carType = "";     // Тип вагона
        this.carNumber = "";   // Номер вагона
        this.placeNumber = ""; // Номер места
    }

    toApiFormat() {
        return {
            from: this.from,
            to: this.to,
            number: this.trainNumber,
            date: this.date,
            "car-type": this.carType,
            "car-number": this.carNumber,
            placeNumber: this.placeNumber,
        };
    }
}