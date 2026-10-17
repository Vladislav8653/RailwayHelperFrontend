import { BASE_URL } from "./stationApi.js";

async function getJson(path) {
    const response = await fetch(`${BASE_URL}${path}`);
    if (!response.ok) {
        throw new Error(`Ошибка ${response.status} при запросе ${path}`);
    }
    return await response.json();
}

export const fetchMetrics = () => getJson("/dev/metrics");

export function fetchLogs({ limit = 100, statusFrom, search } = {}) {
    const params = new URLSearchParams({ limit });
    if (statusFrom) params.set("statusFrom", statusFrom);
    if (search) params.set("search", search);
    return getJson(`/dev/logs?${params}`);
}
