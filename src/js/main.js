import { ScreenManager } from './ui/ScreenManager.js';
import {SearchForm} from "./ui/SearchForm.js";
import {fetchPlaceInfo, fetchStations} from "./api/stationApi.js";

const screens = new ScreenManager();

document.getElementById("start-btn").onclick = () => screens.show("search");
document.getElementById("back-btn").onclick = () => screens.show("welcome");

const searchForm = new SearchForm("main-form", async (params) => {
    console.log("Отправка DTO на сервер:", params);
    const result = await fetchPlaceInfo(params);

    console.log("Результат от сервера:", result);

    return result;
});