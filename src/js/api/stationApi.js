const BASE_URL = "http://localhost:5196";

export async function fetchStations(query) {
    if (!query || query.length < 3) return [];

    const url = `${BASE_URL}/search?name=${encodeURIComponent(query)}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
    }

    return await response.json(); 
}