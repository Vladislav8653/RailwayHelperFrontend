export class ScreenManager {
    constructor() {
        this.welcomeScreen = document.getElementById("welcome-screen");
        this.searchScreen = document.getElementById("search-screen");
    }

    show(screenId) {
        if (screenId === "welcome") {
            this.welcomeScreen.classList.add("screen-active");
            this.searchScreen.classList.remove("screen-active");
        } else {
            this.searchScreen.classList.add("screen-active");
            this.welcomeScreen.classList.remove("screen-active");
        }
    }
}