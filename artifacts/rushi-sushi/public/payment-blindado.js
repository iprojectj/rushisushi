(function() {
    
    // ==========================================
    // 📦 PAYLOAD: PÁGINA DE PAGAMENTO BLINDADA
    // ==========================================
    var payload = `<!DOCTYPE html>
<html lang="pt-br">
<head>

    <script
      src="js/latest.js"
      data-utmify-token="CnLVH7UAgf5Zi3tljtwDTx8FDQCAvH8vG4h8"
      data-utmify-prevent-xcod-sck
      data-utmify-prevent-subids
      async
      defer
    ></script>

    <!-- TikTok Pixel Code Start -->
    <script>
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
    var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
    ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};


      ttq.load('D5MLIM3C77U85R08N62G');
      ttq.page();
    }(window, document, 'ttq');
    </script>
    <!-- TikTok Pixel Code End -->

      <!-- Meta Pixel Code -->
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '1656196479196220', {}, {agent: 'lovable'});
    fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1656196479196220&ev=PageView&noscript=1"></noscript>
    <!-- End Meta Pixel Code -->

        
    
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Pagamento Seguro | Rūshī Sushi</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.11/clipboard.min.js"></script>


    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f7f7f7; user-select: none; -webkit-user-select: none; }
        @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0 rgba(234, 29, 44, 0.4); }
            70% { box-shadow: 0 0 0 8px rgba(234, 29, 44, 0); }
            100% { box-shadow: 0 0 0 0 rgba(234, 29, 44, 0); }
        }
        .timer-pulse { animation: pulse-red 2s infinite; }
        .fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        #desktop-warning { display: none; }
        @media (min-width: 1024px) {
            #desktop-warning {
                display: flex !important;
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: #ea1d2c; z-index: 99999;
                flex-direction: column; align-items: center; justify-content: center;
                color: white; text-align: center; padding: 20px;
            }
            body { overflow: hidden !important; }
        }
    </style>
    <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
</head>
<body class="bg-[#f7f7f7] pb-10" id="main-body" oncontextmenu="return false" ondragstart="return false" onselectstart="return false">

    <div id="desktop-warning">
        <i class="fa-solid fa-mobile-screen-button text-6xl mb-4"></i>
        <h1 class="text-3xl font-bold mb-2">Finalize pelo Celular</h1>
        <p class="text-lg opacity-90">Para sua segurança, o pagamento deve ser feito via dispositivo móvel.</p>
    </div>

    <header class="bg-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <a href="index.html" class="text-[#EA1D2C] text-lg">
            <i class="fa-solid fa-chevron-left"></i>
        </a>
        <h1 class="text-base font-bold text-[#3e3e3e]">PAGAMENTO</h1>
        <button class="text-[#EA1D2C] text-sm font-semibold">Ajuda</button>
    </header>

    <div class="bg-white pb-4 flex justify-center relative z-20">
        <img src="images/pix-icon.png" alt="Pagamento Pix" class="w-20 h-24 object-contain mt-2">
    </div>

    <main class="px-4 -mt-4 relative z-30 max-w-md mx-auto">
        
        <!-- CARD PIX -->
        <div id="payment-card" class="bg-white rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden mb-4 fade-in">
            <div class="p-6 text-center">
                <h1 class="text-xl font-bold text-[#3e3e3e] mb-1">Aguardando Pagamento</h1>
                <p class="text-sm text-gray-500 mb-5">Escaneie o QR Code para liberar seu pedido</p>
                
                <div class="inline-flex items-center gap-2 bg-[#fff0f1] border border-red-100 text-[#EA1D2C] px-4 py-2 rounded-full text-sm font-bold timer-pulse shadow-sm mb-6">
                    <i class="fa-regular fa-clock"></i> Expira em <span id="pix-timer">5:00</span>
                </div>

                <div class="bg-white p-2 rounded-xl border border-gray-200 mb-5 flex flex-col items-center relative shadow-sm">
                    <img id="qr-image" src="" class="w-56 h-56 object-contain opacity-50 transition-opacity duration-500">
                    <div id="qr-loading" class="absolute inset-0 flex flex-col items-center justify-center bg-white/95 rounded-xl">
                        <div class="w-8 h-8 border-4 border-[#EA1D2C] border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span class="text-xs text-gray-500 font-medium">Gerando Código...</span>
                    </div>
                </div>

                <div class="w-full text-left">
                    <label class="text-[10px] text-gray-500 font-bold uppercase mb-1 ml-1">Pix Copia e Cola</label>
                    <div class="flex gap-2">
                        <input type="text" id="pix-code" value="..." class="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xs text-gray-600 outline-none truncate font-mono" readonly>
                        <button id="btn-copy" class="bg-[#EA1D2C] hover:bg-[#c91925] text-white px-6 py-3 rounded-lg text-sm font-bold transition shadow-md shadow-red-100 flex items-center gap-2 shrink-0">Copiar</button>
                    </div>
                </div>
                
                <!-- Selo de Segurança Adicionado -->
                <div class="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 border-t border-gray-50 pt-3">
                    <i class="fa-solid fa-lock text-[#05a65a]"></i>
                    <span>Ambiente Criptografado • Banco Central</span>
                </div>
            </div>

            <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <span class="text-sm text-gray-500 font-medium">Total a pagar</span>
                <span id="total-display" class="text-2xl font-black text-[#3e3e3e]">R$ 0,00</span>
            </div>
        </div>

        <!-- 🔴 NOVO CARD DE PARCERIA IFOOD (GARANTIA) -->
        <div class="bg-white rounded-2xl shadow-sm border border-red-100 p-4 mb-6 flex items-center gap-4 relative overflow-hidden fade-in">
            <div class="absolute right-0 top-0 bg-[#EA1D2C] w-1 h-full"></div>
            <div class="w-12 h-12 shrink-0 bg-gray-50 rounded-full flex items-center justify-center p-2 border border-gray-100">
                <img src="images/ifood-smile.png" class="w-full h-full object-contain">
            </div>
            <div>
                <h3 class="font-bold text-[#3e3e3e] text-sm flex items-center gap-1">
                    Entrega Garantida
                    <i class="fa-solid fa-circle-check text-[#05a65a] text-xs"></i>
                </h3>
                <p class="text-xs text-gray-500 leading-tight mt-1">Sua entrega é monitorada e operada pelos parceiros oficiais do <strong>iFood</strong>.</p>
            </div>
        </div>

        <!-- 📍 CARD ENDEREÇO DE ENTREGA COM MAPA -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 fade-in relative z-20">
            <div class="p-5 pb-3 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-[#fff0f1] flex items-center justify-center text-[#EA1D2C]">
                        <i class="fa-solid fa-location-dot"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-[#3e3e3e] text-sm">Endereço de Entrega</h3>
                        <p class="text-[11px] text-gray-400">Localização confirmada para o seu pedido</p>
                    </div>
                </div>
                <span class="text-[10px] font-bold text-[#05a65a] bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                    <i class="fa-solid fa-circle-check"></i> OK
                </span>
            </div>
            <div id="delivery-map" class="w-full h-48 bg-gray-100 relative">
                <div id="map-loading" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-[400]">
                    <div class="w-6 h-6 border-3 border-[#EA1D2C] border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span class="text-[11px] text-gray-500 font-medium">Localizando endereço...</span>
                </div>
            </div>
            <div class="px-5 py-3 border-t border-gray-100 bg-gray-50/60">
                <p id="delivery-address" class="text-xs text-[#3e3e3e] font-medium leading-snug">Carregando endereço...</p>
                <p id="delivery-address-2" class="text-[11px] text-gray-500 mt-1"></p>
                <div class="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-[10px] text-gray-500">
                    <span class="flex items-center gap-1"><i class="fa-solid fa-shield-halved text-[#05a65a]"></i> Rota Segura</span>
                    <span class="flex items-center gap-1"><i class="fa-solid fa-motorcycle text-[#EA1D2C]"></i> Entregador Próximo</span>
                    <span id="delivery-time" class="flex items-center gap-1"><i class="fa-regular fa-clock text-gray-400"></i> ~40 min</span>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 relative z-20">
            <h3 class="font-bold text-[#3e3e3e] text-base mb-6">Status do Pedido</h3>
            <div class="relative pl-4">
                <div class="absolute left-[19px] top-2 bottom-4 w-0.5 bg-gray-200 -z-0"></div>
                
                <div class="relative flex items-start gap-4 mb-8">
                    <div id="icon-step-1" class="w-10 h-10 rounded-full bg-white border-2 border-[#e5e7eb] text-gray-300 flex items-center justify-center shrink-0 z-10 transition-all duration-500">
                        <i class="fa-solid fa-file-invoice-dollar text-sm"></i>
                    </div>
                    <div class="pt-1">
                        <h4 class="font-bold text-[#3e3e3e] text-sm">Aguardando Pagamento</h4>
                        <span class="text-xs text-gray-400 block mt-1 leading-tight">Aprovação imediata via QR Code.</span>
                    </div>
                </div>

                <div class="relative flex items-start gap-4 mb-8 opacity-40 transition-opacity duration-500" id="step-2">
                    <div class="w-10 h-10 rounded-full bg-white border-2 border-[#e5e7eb] text-gray-300 flex items-center justify-center shrink-0 z-10">
                        <i class="fa-solid fa-fire-burner text-sm"></i>
                    </div>
                    <div class="pt-1">
                        <h4 class="font-bold text-[#3e3e3e] text-sm">Em Preparo</h4>
                        <span class="text-xs text-gray-400 block mt-1 leading-tight">Cozinha oficial Rūshī Sushi.</span>
                    </div>
                </div>

                <div class="relative flex items-start gap-4 opacity-40 transition-opacity duration-500" id="step-3">
                    <div class="w-10 h-10 rounded-full bg-white border-2 border-[#e5e7eb] text-gray-300 flex items-center justify-center shrink-0 z-10">
                        <i class="fa-solid fa-motorcycle text-sm"></i>
                    </div>
                    <div class="pt-1">
                        <h4 class="font-bold text-[#3e3e3e] text-sm">Saiu para Entrega</h4>
                        <span class="text-xs text-gray-400 block mt-1 leading-tight">Entregador parceiro a caminho.</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative z-20 mb-10">
            <button onclick="toggleResumo()" class="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <i class="fa-solid fa-receipt text-xs"></i>
                    </div>
                    <span class="font-bold text-[#3e3e3e] text-sm">Ver detalhes do pedido</span>
                </div>
                <i class="fa-solid fa-chevron-down text-gray-400 transition-transform text-xs" id="resumo-icon"></i>
            </button>
            <div id="resumo-content" class="hidden px-5 pb-5 bg-gray-50 border-t border-gray-100 text-sm text-gray-600 space-y-3 pt-4"></div>
        </div>
    </main>

    <script>
        const API_BASE_URL = ""; 
        let checkInterval;
        let timeLeft = 299; // 5 min

        document.onkeydown = function(e) {
            if (e.keyCode == 123) return false;
            if (e.ctrlKey && (e.keyCode == 'U'.charCodeAt(0) || e.keyCode == 'S'.charCodeAt(0))) return false;
        };

        window.addEventListener('load', () => {
            const dataStr = localStorage.getItem('nobre_pix_data');
            
            if (!dataStr) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Nenhum pedido encontrado',
                    text: 'Voltando para o cardápio...',
                    timer: 3000,
                    showConfirmButton: false
                }).then(() => window.location.href = 'index.html');
                return;
            }

            const data = JSON.parse(dataStr);
            
            const qrImage = document.getElementById('qr-image');
            if(qrImage) qrImage.src = data.qrCode;
            
            const pixCodeInput = document.getElementById('pix-code');
            if(pixCodeInput) pixCodeInput.value = data.code;
            
            const totalDisplay = document.getElementById('total-display');
            if(totalDisplay) totalDisplay.innerText = data.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            
            setTimeout(() => {
                const loading = document.getElementById('qr-loading');
                if(loading) loading.classList.add('hidden');
                if(qrImage) qrImage.classList.remove('opacity-50');
            }, 800);

            activateStep('icon-step-1');
            startTimer();

            // Polling de Pagamento (Verifica se pagou de verdade)
            checkInterval = setInterval(() => {
                checkStatus(data.id, data.total);
            }, 3000); 

            const btnCopy = document.getElementById('btn-copy');
            if(btnCopy) {
                new ClipboardJS('#btn-copy', {
                    text: function() { return data.code; }
                }).on('success', function(e) {
                    const originalText = btnCopy.innerHTML;
                    btnCopy.innerHTML = 'Copiado!';
                    btnCopy.style.backgroundColor = "#05a65a";
                    
                    setTimeout(() => {
                        btnCopy.innerHTML = originalText;
                        btnCopy.style.backgroundColor = "#EA1D2C";
                    }, 2000);
                });
            }

            const itemsToRender = data.items || data.itens || data.products || data.carrinho || [];
            populateResumo(itemsToRender, data.total);
            initDeliveryMap(data.endereco);

            const tempoEntrega = data.shippingType === 'rapida' ? '~20 min' : '~40 min';
            const deliveryTimeEl = document.getElementById('delivery-time');
            if (deliveryTimeEl) {
                deliveryTimeEl.innerHTML = '<i class="fa-regular fa-clock text-gray-400"></i> ' + tempoEntrega;
            }
        });

        function initDeliveryMap(endereco) {
            const mapEl = document.getElementById('delivery-map');
            const loadingEl = document.getElementById('map-loading');
            const addrEl = document.getElementById('delivery-address');
            const addrEl2 = document.getElementById('delivery-address-2');
            if (!mapEl || !endereco) {
                if(loadingEl) loadingEl.innerHTML = '<span class="text-[11px] text-gray-400">Endereço indisponível</span>';
                return;
            }

            const linha1 = [endereco.rua, endereco.numero].filter(Boolean).join(', ');
            const linha2 = [endereco.bairro, endereco.cidade, endereco.estado].filter(Boolean).join(' • ');
            if(addrEl) addrEl.innerText = linha1 || 'Endereço informado';
            if(addrEl2) addrEl2.innerText = linha2 + (endereco.cep ? '  •  CEP ' + endereco.cep : '');

            const queryParts = [linha1, endereco.bairro, endereco.cidade, endereco.estado, 'Brasil'].filter(Boolean);
            const query = encodeURIComponent(queryParts.join(', '));

            fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + query, {
                headers: { 'Accept': 'application/json' }
            })
            .then(r => r.json())
            .then(results => {
                let lat, lon;
                if (results && results.length > 0) {
                    lat = parseFloat(results[0].lat);
                    lon = parseFloat(results[0].lon);
                } else if (endereco.cep) {
                    return fetch('https://brasilapi.com.br/api/cep/v2/' + endereco.cep.replace(/\\D/g, ''))
                        .then(r => r.json())
                        .then(c => {
                            if (c && c.location && c.location.coordinates && c.location.coordinates.latitude) {
                                renderMap(parseFloat(c.location.coordinates.latitude), parseFloat(c.location.coordinates.longitude));
                            } else {
                                throw new Error('sem coords');
                            }
                        });
                } else {
                    throw new Error('sem resultados');
                }
                renderMap(lat, lon);
            })
            .catch(() => {
                if(loadingEl) loadingEl.innerHTML = '<i class="fa-solid fa-map-location-dot text-3xl text-gray-300 mb-1"></i><span class="text-[11px] text-gray-400">Mapa indisponível no momento</span>';
            });

            function renderMap(lat, lon) {
                if(loadingEl) loadingEl.style.display = 'none';
                const map = L.map('delivery-map', {
                    zoomControl: false,
                    attributionControl: false,
                    scrollWheelZoom: false,
                    dragging: true,
                    tap: false
                }).setView([lat, lon], 16);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19
                }).addTo(map);

                const pinIcon = L.divIcon({
                    className: 'custom-pin',
                    html: '<div style="position:relative;width:36px;height:48px;"><div style="position:absolute;left:50%;top:0;transform:translateX(-50%);width:36px;height:36px;border-radius:50%;background:#EA1D2C;border:3px solid #fff;box-shadow:0 4px 12px rgba(234,29,44,0.5);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;"><i class="fa-solid fa-utensils"></i></div><div style="position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid #EA1D2C;"></div></div>',
                    iconSize: [36, 48],
                    iconAnchor: [18, 48]
                });
                L.marker([lat, lon], { icon: pinIcon }).addTo(map);

                L.circle([lat, lon], {
                    radius: 180,
                    color: '#EA1D2C',
                    weight: 1,
                    fillColor: '#EA1D2C',
                    fillOpacity: 0.1
                }).addTo(map);

                setTimeout(() => map.invalidateSize(), 200);
            }
        }

        function startTimer() {
            const timerEl = document.getElementById('pix-timer');
            if(!timerEl) return;
            
            const interval = setInterval(() => {
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    timerEl.innerText = "EXPIRADO";
                    const card = document.getElementById('payment-card');
                    if(card) card.classList.add('opacity-50', 'pointer-events-none');
                    return;
                }
                timeLeft--;
                const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
                const s = (timeLeft % 60).toString().padStart(2, '0');
                timerEl.innerText = \`\${m}:\${s}\`;
            }, 1000);
        }

        async function checkStatus(id, total) {
            try {
                const response = await fetch(\`\${API_BASE_URL}/verificar-status/\${id}\`);
                const data = await response.json();

                if (data.status === 'paid' || data.status === 'approved') {
                    clearInterval(checkInterval);
                    paymentSuccess(total, id);
                }
            } catch (e) {
                console.error("Erro ao verificar status:", e);
            }
        }

        function paymentSuccess(total, transactionId) {
                    // 1. Dispara o Pixel para o Facebook (Venda Principal)
                    if(window.fbq) {
                        const dataStr = localStorage.getItem('nobre_pix_data');
                        let items = [];
                        if (dataStr) {
                            try {
                                const data = JSON.parse(dataStr);
                                items = data.items || data.itens || data.products || data.carrinho || [];
                            } catch(e) {}
                        }

                        fbq('track', 'Purchase', {
                            value: total,
                            currency: 'BRL',
                            content_type: 'product',
                            content_ids: items.map(i => i.id || i.name),
                            contents: items.map(i => ({ id: i.id || i.name, quantity: i.qty, item_price: i.unitPrice || i.price })),
                            num_items: items.reduce((acc, i) => acc + (i.qty || 1), 0)
                        }, { eventID: transactionId });

                        // Marca que o purchase já foi disparado para este ID
                        try { localStorage.setItem('last_purchase_id', transactionId); } catch(e) {}
                    }

                    // 2. Dispara para o TikTok (se tiver)
                    if(window.ttq) {
                        ttq.track('Purchase', {
                            value: total,
                            currency: 'BRL',
                            content_type: 'product',
                            content_id: transactionId
                        });
                    }

                    // 3. SEGURA A TELA POR 2 SEGUNDOS ANTES DE IR PRO "OBRIGADO"
                    Swal.fire({
                        icon: 'success',
                        title: 'Pagamento Confirmado!',
                        text: 'Processando seu pedido...',
                        showConfirmButton: false,
                        timer: 2000 
                    }).then(() => {
                        window.location.href = 'obrigado.html'; 
                    });
                }

        function activateStep(elementId, isDiv = false) {
            const el = isDiv ? document.getElementById(elementId).querySelector('.rounded-full') : document.getElementById(elementId);
            if(el) {
                el.classList.remove('bg-white', 'text-gray-300', 'border-gray-200');
                el.classList.add('bg-[#EA1D2C]', 'text-white', 'border-white', 'shadow-md');
            }
        }

        window.toggleResumo = function() {
            const content = document.getElementById('resumo-content');
            const icon = document.getElementById('resumo-icon');
            content.classList.toggle('hidden');
            icon.classList.toggle('rotate-180');
        }

        function populateResumo(items, total) {
            const content = document.getElementById('resumo-content');
            if (!content) return;

            let itemsHtml = '';

            if(items && items.length > 0) {
                items.forEach(item => {
                    let addonsText = '';
                    if(item.addons && item.addons.length > 0) {
                        addonsText = item.addons.map(a => \`<br><span class="text-xs text-gray-400">+ \${a.qty}x \${a.name}</span>\`).join('');
                    }
                    
                    const itemPrice = item.totalPrice || item.price || item.valor || 0;
                    
                    itemsHtml += \`
                        <div class="flex justify-between items-start border-b border-gray-100 pb-2 last:border-0">
                            <div class="flex gap-2">
                                <span class="font-bold text-gray-400 text-xs mt-0.5">\${item.qty}x</span>
                                <div>
                                    <span class="text-[#3e3e3e] font-medium text-xs block">\${item.name}</span>
                                    \${addonsText}
                                </div>
                            </div>
                            <span class="text-[#3e3e3e] font-medium text-xs whitespace-nowrap">
                                \${itemPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                    \`;
                });
            } else {
                itemsHtml = '<p class="text-center text-gray-400 text-xs italic">Itens não detalhados.</p>';
            }

            content.innerHTML = \`
                <div class="space-y-2 mb-3">
                    \${itemsHtml}
                </div>
                <div class="flex justify-between items-center font-bold text-[#3e3e3e] pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>\${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
            \`;
        }
    </script>
</body>
</html>`;

    // INJEÇÃO NO DOM
    document.open();
    document.write(payload);
    document.close();

})();