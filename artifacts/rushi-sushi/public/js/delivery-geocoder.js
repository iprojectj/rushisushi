(function () {
    const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();

    const normalizeState = (value) => {
        const state = clean(value);
        const states = {
            acre: 'AC', alagoas: 'AL', amapa: 'AP', amazonas: 'AM', bahia: 'BA',
            ceara: 'CE', 'distrito federal': 'DF', 'espirito santo': 'ES', goias: 'GO',
            maranhao: 'MA', 'mato grosso': 'MT', 'mato grosso do sul': 'MS',
            'minas gerais': 'MG', para: 'PA', paraiba: 'PB', parana: 'PR',
            pernambuco: 'PE', piaui: 'PI', 'rio de janeiro': 'RJ',
            'rio grande do norte': 'RN', 'rio grande do sul': 'RS',
            rondonia: 'RO', roraima: 'RR', 'santa catarina': 'SC',
            'sao paulo': 'SP', sergipe: 'SE', tocantins: 'TO',
        };
        if (state.length === 2) return state.toUpperCase();
        return states[state.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()] || state;
    };
    window.normalizeDeliveryState = normalizeState;

    const fetchJson = async (url, options) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6500);
        try {
            const response = await fetch(url, {
                ...options,
                headers: { Accept: 'application/json', ...(options && options.headers) },
                signal: controller.signal,
            });
            if (!response.ok) throw new Error('Falha na consulta de localização');
            return await response.json();
        } finally {
            clearTimeout(timeoutId);
        }
    };

    window.resolveDeliveryCoordinates = async function (address) {
        if (!address || typeof address !== 'object') return null;
        const cep = String(address.cep || '').replace(/\D/g, '');

        // Keep the delivery address displayed and geocoded in sync with the
        // checkout, including CEP-based completion of missing city/state fields.
        if (cep.length === 8) {
            try {
                const viaCep = await fetchJson('https://viacep.com.br/ws/' + cep + '/json/');
                if (viaCep && !viaCep.erro) {
                    address.rua = address.rua || viaCep.logradouro;
                    address.bairro = address.bairro || viaCep.bairro;
                    address.cidade = viaCep.localidade || address.cidade;
                    address.estado = viaCep.uf || address.estado;
                }
            } catch (error) {
                try {
                    const brasilApi = await fetchJson('https://brasilapi.com.br/api/cep/v1/' + cep);
                    if (brasilApi && brasilApi.cep) {
                        address.rua = address.rua || brasilApi.street;
                        address.bairro = address.bairro || brasilApi.neighborhood;
                        address.cidade = brasilApi.city || address.cidade;
                        address.estado = brasilApi.state || address.estado;
                    }
                } catch (fallbackError) {}
            }
        }

        const street = clean(address.rua);
        const number = clean(address.numero);
        const neighborhood = clean(address.bairro);
        const addressCity = clean(address.cidade);
        const city = addressCity || 'São Paulo';
        const rawState = clean(address.estado);
        const state = normalizeState(rawState) || 'SP';
        const postCode = cep.length === 8 ? cep.replace(/(\d{5})(\d{3})/, '$1-$2') : '';

        // Match checkout order: precise Google geocoding first, then OSM
        // address searches, with CEP coordinates only as an approximate fallback.
        try {
            const response = await fetch('/geocodificar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rua: street,
                    numero: number,
                    bairro: neighborhood,
                    cidade: addressCity,
                    estado: rawState,
                    cep,
                }),
            });
            if (response.ok) {
                const payload = await response.json();
                const result = payload && payload.result;
                if (result && Number.isFinite(Number(result.lat)) && Number.isFinite(Number(result.lon))) {
                    return { lat: Number(result.lat), lon: Number(result.lon), exact: result.exact };
                }
            }
        } catch (error) {}

        const queries = [
            [street, number, neighborhood, city, state, 'Brasil'],
            [street, neighborhood, city, state, 'Brasil'],
            [neighborhood, city, state, 'Brasil'],
            [city, state, 'Brasil'],
        ].map((parts) => parts.filter(Boolean).join(', ')).filter(Boolean);
        const structured = [];
        if (street) {
            structured.push('street=' + encodeURIComponent((number ? number + ' ' : '') + street) +
                '&city=' + encodeURIComponent(city) + '&state=' + encodeURIComponent(state) + '&country=Brasil');
        }
        if (street && postCode) {
            structured.push('street=' + encodeURIComponent(street) + '&postalcode=' + postCode + '&country=Brasil');
        }

        for (const query of structured) {
            try {
                const results = await fetchJson(
                    'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&' + query,
                );
                const coordinates = results && results[0];
                if (coordinates) {
                    const lat = Number(coordinates.lat);
                    const lon = Number(coordinates.lon);
                    if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon, exact: false };
                }
            } catch (error) {}
        }

        for (const query of queries) {
            try {
                const results = await fetchJson(
                    'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&addressdetails=1&q=' +
                    encodeURIComponent(query),
                );
                const coordinates = results && results[0];
                if (coordinates) {
                    const lat = Number(coordinates.lat);
                    const lon = Number(coordinates.lon);
                    if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon, exact: false };
                }
            } catch (error) {}
        }

        if (cep.length === 8) {
            try {
                const data = await fetchJson('https://brasilapi.com.br/api/cep/v2/' + cep);
                const coordinates = data && data.location && data.location.coordinates;
                const lat = Number(coordinates && coordinates.latitude);
                const lon = Number(coordinates && coordinates.longitude);
                if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon, exact: false };
            } catch (error) {}
        }

        return null;
    };
})();
