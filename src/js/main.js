import { ScreenManager } from './ui/ScreenManager.js';
import {SearchForm} from "./ui/SearchForm.js";

const screens = new ScreenManager();

document.getElementById("start-btn").onclick = () => screens.show("search");
document.getElementById("back-btn").onclick = () => screens.show("welcome");

const searchForm = new SearchForm("main-form", async (dto) => {
    console.log("Отправка DTO на сервер:", dto);
    // Здесь будет fetch(url, { body: JSON.stringify(dto) ... })
    await new Promise(r => setTimeout(r, 1400));
});