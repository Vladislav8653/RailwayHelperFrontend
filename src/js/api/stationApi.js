const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchStations(query) {
    if (!query) return [];
    
    const url = `${BASE_URL}/search?name=${encodeURIComponent(query)}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Ошибка при получении станций: ${response.status}`);
    }

    return await response.json(); 
}

export async function fetchPlaceInfo(params) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${BASE_URL}/place?${queryString}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Ошибка при проверке места: ${response.status}`);
    }

    return await response.json();
}