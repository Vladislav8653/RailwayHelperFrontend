import { fetchLogs, fetchMetrics } from "../api/devApi.js";

const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function prettyBody(body) {
    if (!body) return "—";
    try {
        return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
        return body;
    }
}

function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h ? `${h}ч ${m}м` : `${m}м ${seconds % 60}с`;
}

const statusClass = (code) => (code >= 500 ? "dev-s-5xx" : code >= 400 ? "dev-s-4xx" : "dev-s-ok");

export class DevTools {
    constructor() {
        this.btn = document.getElementById("dev-btn");
        this.menu = document.getElementById("dev-menu");
        this.panel = document.getElementById("dev-panel");
        this.content = document.getElementById("dev-content");
        this.status = document.getElementById("dev-panel-status");
        this.filters = document.getElementById("dev-filters");
        this.search = document.getElementById("dev-search");
        this.errorsOnly = document.getElementById("dev-errors-only");
        this.auto = document.getElementById("dev-auto");
        this.tab = "metrics";
        this.timer = null;
        this.openLogs = new Set();

        this.btn.onclick = (e) => {
            e.stopPropagation();
            this.toggleMenu();
        };
        document.addEventListener("click", (e) => {
            if (!this.menu.contains(e.target)) this.toggleMenu(false);
        });
        this.menu.querySelector('[data-action="logs"]').onclick = () => {
            this.toggleMenu(false);
            this.openPanel();
        };
        document.getElementById("dev-panel-close").onclick = () => this.closePanel();
        document.getElementById("dev-refresh").onclick = () => this.refresh();
        this.panel.querySelectorAll(".dev-tab").forEach((t) => {
            t.onclick = () => this.setTab(t.dataset.tab);
        });
        this.search.oninput = () => {
            clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.refresh(), 300);
        };
        this.errorsOnly.onchange = () => this.refresh();
        this.auto.onchange = () => this.updateTimer();
        this.content.addEventListener("toggle", (e) => {
            const id = e.target.dataset?.id;
            if (id) e.target.open ? this.openLogs.add(id) : this.openLogs.delete(id);
        }, true);
    }

    toggleMenu(force) {
        const open = force ?? this.menu.hidden;
        this.menu.hidden = !open;
        this.btn.setAttribute("aria-expanded", String(open));
    }

    openPanel() {
        this.panel.hidden = false;
        this.refresh();
        this.updateTimer();
    }

    closePanel() {
        this.panel.hidden = true;
        this.updateTimer();
    }

    setTab(tab) {
        this.tab = tab;
        this.panel.querySelectorAll(".dev-tab").forEach((t) => t.classList.toggle("dev-tab-active", t.dataset.tab === tab));
        this.filters.hidden = tab !== "logs";
        this.refresh();
    }

    updateTimer() {
        clearInterval(this.timer);
        this.timer = null;
        if (!this.panel.hidden && this.auto.checked) {
            this.timer = setInterval(() => this.refresh(), 3000);
        }
    }

    async refresh() {
        try {
            if (this.tab === "metrics") {
                this.renderMetrics(await fetchMetrics());
            } else {
                const logs = await fetchLogs({
                    limit: 100,
                    statusFrom: this.errorsOnly.checked ? 400 : undefined,
                    search: this.search.value.trim() || undefined,
                });
                this.renderLogs(logs);
            }
            this.status.textContent = `Обновлено ${new Date().toLocaleTimeString()}`;
        } catch (err) {
            this.status.textContent = "Ошибка загрузки";
            this.content.innerHTML = `<div class="dev-error">${escapeHtml(err.message)}</div>`;
        }
    }

    renderMetrics(m) {
        const tile = (label, value) => `<div class="dev-tile"><div class="dev-tile-value">${escapeHtml(value)}</div><div class="dev-tile-label">${label}</div></div>`;
        const codes = Object.entries(m.statusCodes)
            .map(([code, n]) => `<span class="dev-chip ${statusClass(+code)}">${code} × ${n}</span>`).join("") || "—";
        const rows = m.endpoints.map((e) => `
            <tr><td>${escapeHtml(e.endpoint)}</td><td>${e.count}</td><td>${e.errors}</td><td>${e.avgMs}</td><td>${e.maxMs}</td></tr>`).join("");

        this.content.innerHTML = `
            <div class="dev-tiles">
                ${tile("Всего запросов", m.totalRequests)}
                ${tile("За минуту", m.requestsLastMinute)}
                ${tile("4xx", m.errors4xx)}
                ${tile("5xx", m.errors5xx)}
                ${tile("Avg, мс", m.latencyMs.avg)}
                ${tile("p95, мс", m.latencyMs.p95)}
                ${tile("Max, мс", m.latencyMs.max)}
                ${tile("Память, МБ", m.process.memoryMb)}
                ${tile("Uptime", formatUptime(m.uptimeSeconds))}
                ${tile("Потоки", m.process.threads)}
            </div>
            <h3 class="dev-h">Статусы (последние ${m.bufferedLogs})</h3>
            <div class="dev-chips">${codes}</div>
            <h3 class="dev-h">Эндпоинты</h3>
            <div class="dev-table-wrap">
                <table class="dev-table">
                    <thead><tr><th>Endpoint</th><th>Кол-во</th><th>Ошибок</th><th>Avg</th><th>Max</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="5">Запросов пока нет</td></tr>'}</tbody>
                </table>
            </div>`;
    }

    renderLogs(logs) {
        if (!logs.length) {
            this.content.innerHTML = '<div class="dev-empty">Логов пока нет</div>';
            return;
        }
        this.content.innerHTML = logs.map((l) => {
            const kv = (obj) => Object.entries(obj ?? {}).map(([k, v]) => `${escapeHtml(k)}: ${escapeHtml(v)}`).join("\n") || "—";
            return `
            <details class="dev-log" data-id="${l.id}" ${this.openLogs.has(String(l.id)) ? "open" : ""}>
                <summary>
                    <span class="dev-chip ${statusClass(l.statusCode)}">${l.statusCode}</span>
                    <span class="dev-method">${escapeHtml(l.method)}</span>
                    <span class="dev-path">${escapeHtml(l.path)}${escapeHtml(l.queryString ?? "")}</span>
                    <span class="dev-ms">${l.durationMs} мс</span>
                </summary>
                <div class="dev-log-body">
                    <div class="dev-meta">${new Date(l.timestampUtc).toLocaleString()} · ${escapeHtml(l.clientIp)} · ${escapeHtml(l.userAgent || "—")}</div>
                    <h4>Query</h4><pre>${kv(l.query)}</pre>
                    <h4>Request headers</h4><pre>${kv(l.requestHeaders)}</pre>
                    <h4>Request body</h4><pre>${escapeHtml(prettyBody(l.requestBody))}</pre>
                    <h4>Response headers</h4><pre>${kv(l.responseHeaders)}</pre>
                    <h4>Response body</h4><pre>${escapeHtml(prettyBody(l.responseBody))}</pre>
                    ${l.exception ? `<h4>Exception</h4><pre>${escapeHtml(l.exception)}</pre>` : ""}
                </div>
            </details>`;
        }).join("");
    }
}
