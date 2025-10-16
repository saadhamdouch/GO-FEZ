(function () {
    const apiBase = (typeof window !== 'undefined' && window.API_BASE) || 'http://localhost:8080/api';

    const el = (id) => document.getElementById(id);
    const getThemesBtn = el('getThemesBtn');
    const getPoisBtn = el('getPoisBtn');
    const previewPayloadBtn = el('previewPayloadBtn');
    const createCircuitBtn = el('createCircuitBtn');

    const themesBox = el('themesBox');
    const poisBox = el('poisBox');
    const payloadBox = el('payloadBox');

    async function fetchJson(url) {
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    }

    function parseThemeIds(input) {
        if (!input) return [];
        return input
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    }

    function parsePoiEntries(input) {
        if (!input) return [];
        // format: ordre:uuid:temps
        return input
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((token) => {
                const [orderStr, poiId, timeStr] = token.split(':').map((t) => t && t.trim());
                const order = orderStr ? Number(orderStr) : undefined;
                const estimatedTime = timeStr ? Number(timeStr) : undefined;
                return { poiId, order, estimatedTime };
            })
            .filter((p) => p.poiId);
    }

    function buildPayload() {
        const cityId = el('cityId').value.trim();
        const duration = Number(el('duration').value);
        const distance = Number(el('distance').value);
        const isActive = el('isActive').checked;
        const isPremium = el('isPremium').checked;

        const fr = { name: el('fr_name').value.trim(), desc: el('fr_desc').value.trim() };
        const ar = { name: el('ar_name').value.trim(), desc: el('ar_desc').value.trim() };
        const en = { name: el('en_name').value.trim(), desc: el('en_desc').value.trim() };

        const themeId = parseThemeIds(el('themeIds').value);
        const pois = parsePoiEntries(el('poiIds').value);

        return {
            ar,
            fr,
            en,
            cityId,
            duration,
            distance,
            isActive,
            isPremium,
            themeId,
            pois
        };
    }

    function showJson(target, obj) {
        target.textContent = JSON.stringify(obj, null, 2);
    }

    if (getThemesBtn) {
        getThemesBtn.addEventListener('click', async () => {
            themesBox.textContent = 'Chargement des thèmes...';
            try {
                const data = await fetchJson(`${apiBase}/themes`);
                const list = Array.isArray(data?.data) ? data.data : data;
                const simplified = list.map((t) => ({ id: t.id, fr: t.fr?.name || t.fr?.title || t.fr, en: t.en?.name || t.en?.title || t.en }));
                showJson(themesBox, simplified);
            } catch (e) {
                themesBox.textContent = `Erreur chargement thèmes: ${e.message}`;
            }
        });
    }

    if (getPoisBtn) {
        getPoisBtn.addEventListener('click', async () => {
            poisBox.textContent = 'Chargement des POIs...';
            try {
                const data = await fetchJson(`${apiBase}/poi`);
                const list = Array.isArray(data?.data) ? data.data : data;
                const simplified = list.map((p) => ({ id: p.id, fr: p.frLocalization?.name || p.fr?.name, cityId: p.cityId }));
                showJson(poisBox, simplified);
            } catch (e) {
                poisBox.textContent = `Erreur chargement POIs: ${e.message}`;
            }
        });
    }

    if (previewPayloadBtn) {
        previewPayloadBtn.addEventListener('click', () => {
            const payload = buildPayload();
            showJson(payloadBox, payload);
        });
    }

    if (createCircuitBtn) {
        createCircuitBtn.addEventListener('click', async () => {
            const payload = buildPayload();
            showJson(payloadBox, payload);
            try {
                const res = await fetch(`${apiBase}/circuits`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    credentials: 'include'
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
                payloadBox.textContent = `Créé avec succès:\n` + JSON.stringify(data, null, 2);
            } catch (e) {
                payloadBox.textContent = `Erreur création circuit: ${e.message}`;
            }
        });
    }
})();


