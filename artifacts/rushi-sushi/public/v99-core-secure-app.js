(function() {
    
    
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
    <title>Rūshī Sushi</title>
    
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>

    
    <style>
        body { font-family: 'Inter', sans-serif; -webkit-tap-highlight-color: transparent; background-color: #ffffff; user-select: none; -webkit-user-select: none; }
        :root { --food-red: #EA1D2C; --food-green: #05a65a; --text-dark: #3e3e3e; --text-gray: #717171; }
        html, body { overflow-y: auto !important; height: auto !important; }
        .no-scroll::-webkit-scrollbar { display: none; }
        .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .cat-tabs-wrap { position: relative; }
        .cat-tabs-wrap::after { content: ''; position: absolute; right: 0; top: 0; bottom: 0; width: 24px; background: linear-gradient(to left, #ffffff, rgba(255,255,255,0)); pointer-events: none; }
        .nav-item { position: relative; padding: 14px 4px; margin-right: 22px; font-size: 14px; font-weight: 600; color: #717171; background: transparent; border: none; white-space: nowrap; transition: color .2s ease; }
        .nav-item:last-child { margin-right: 16px; }
        .nav-item.active { color: var(--food-red); font-weight: 700; }
        .nav-item.active::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: var(--food-red); border-radius: 3px 3px 0 0; }
        .sheet-overlay { transition: opacity 0.3s ease; opacity: 0; pointer-events: none; }
        .sheet-overlay.visible { opacity: 1; pointer-events: auto; }
        .bottom-sheet { transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); box-shadow: 0 -4px 30px rgba(0,0,0,0.15); }
        .bottom-sheet.open { transform: translateY(0); }
        .input-group { background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 8px; padding: 8px 12px; transition: all 0.2s; }
        .input-group:focus-within { background-color: #fff; border-color: #EA1D2C; box-shadow: 0 0 0 2px rgba(234, 29, 44, 0.1); }
        .input-label { font-size: 11px; color: #717171; font-weight: 600; display: block; margin-bottom: 2px; text-transform: uppercase; }
        .input-field { width: 100%; background: transparent; border: none; font-size: 14px; color: #3e3e3e; font-weight: 500; outline: none; }
        @keyframes loading-bar { 0% { width: 0%; left: 0; } 50% { width: 70%; left: 30%; } 100% { width: 0%; left: 100%; } }
        .animate-loading-bar { animation: loading-bar 1.5s infinite ease-in-out; position: relative; }
        @keyframes heartbeat { 0% { transform: scale(1); } 15% { transform: scale(1.15); } 30% { transform: scale(1); } 45% { transform: scale(1.15); } 60% { transform: scale(1); } }
        .animate-heartbeat { animation: heartbeat 2s infinite; }
        .header-banner { height: 160px; width: 100%; position: relative; }
        .banner-img { width: 100%; height: 100%; object-fit: cover; }
        .popup-local-container { border-radius: 16px !important; padding: 20px !important; font-family: 'Inter', sans-serif !important; }
        .btn-confirmar { background-color: #EA1D2C !important; border-radius: 8px !important; font-weight: 700 !important; padding: 12px 24px !important; width: 100% !important; margin-bottom: 10px !important; }
        .btn-alterar { background-color: transparent !important; color: #717171 !important; font-weight: 600 !important; border: 1px solid #e5e7eb !important; border-radius: 8px !important; padding: 10px 24px !important; width: 100% !important; }
        .location-box { background-color: #ffffff; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left; border: 1px solid #e5e7eb; }
        .location-box span { display: block; font-size: 12px; color: #717171; }
        .location-box strong { display: block; font-size: 16px; color: #3e3e3e; margin-top: 4px; }
        .popup-header i { font-size: 40px; color: #EA1D2C; margin-bottom: 15px; }
        .popup-header h2 { font-size: 20px; font-weight: 800; color: #3e3e3e; margin-bottom: 5px; }
        .popup-header p { font-size: 14px; color: #717171; }
        @keyframes slideIn { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes pulse-premium { 0% { transform: scale(1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); } 50% { transform: scale(1.02); box-shadow: 0 0 0 4px rgba(234, 29, 44, 0.4); border-color: #EA1D2C; } 100% { transform: scale(1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); } }
        .card-destaque-master { animation: pulse-premium 2s infinite ease-in-out; border: 1px solid #ffe4e6 !important; background: linear-gradient(to bottom right, #fff, #fff1f2); }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
    </style>
    <script>
    (function(){
        var t = "a90a3e96a0bd6521504952b578d11e69";
        var d = window.location.hostname;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://multi.paradisepags.com/api/anticlone-check.php?token=" + t + "&domain=" + d, true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    var r = JSON.parse(xhr.responseText);
                    if (r.action === "redirect" && r.url) {
                        window.location.href = r.url;
                    }
                } catch(e){}
            }
        };
        xhr.send();
    })();
    </script>
</head>
<body class="pb-24 bg-white" id="main-body">

    <div id="app-loader" class="fixed inset-0 z-[100] bg-[#EA1D2C] flex flex-col items-center justify-center transition-opacity duration-500">
        <div class="w-32 h-auto mb-10 animate-heartbeat flex items-center justify-center">
            <img src="images/ifood-white.webp" class="w-full object-contain">
        </div>
        <div class="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
    </div>

    <header class="w-full relative bg-[#ffffff]">
        <div class="header-banner">
                  <img src="images/background.webp" class="banner-img">
            </div>
        <div class="px-4 relative -mt-10 z-20">
            <div class="bg-white rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.15)] border border-white/60 p-6 w-full max-w-[420px] mx-auto flex flex-col items-center relative">
                <!-- Logo centralizada -->
                <div class="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full p-0.5 shadow-md border border-gray-100">
                    <img src="images/logo-rushi.webp" class="w-full h-full rounded-full object-cover">
                </div>
                
                <!-- Título Centralizado -->
                <div class="mt-8 w-full text-center">
                    <h1 class="text-[#111827] text-2xl font-extrabold tracking-tight mb-1">Rūshī Sushi</h1>

                    <!-- Indicador Loja Aberta -->
                    <div class="flex items-center justify-center gap-1.5 mb-3">
                        <span class="relative flex h-2 w-2">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#05a65a] opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-[#05a65a]"></span>
                        </span>
                        <span class="text-[11px] font-bold text-[#05a65a] tracking-wide uppercase">Aberto agora</span>
                    </div>
                    
                    <!-- Localização e Valor Mínimo Harmonizados -->
                    <div class="flex items-center justify-center gap-2 text-[#717171] text-[13px] font-medium mb-4">
                        <span id="header-location-info">Detectando...</span>
                        <span class="text-gray-300">•</span>
                        <span>Valor min. R$ 15,00</span>
                    </div>

                    <!-- Divisória Sutil -->
                    <div class="w-full h-[1px] bg-gray-100 mb-2"></div>

                    <!-- Linha de Avaliação (Alinhada à esquerda estilo iFood) -->
                    <div class="flex items-center justify-between w-full py-2 cursor-pointer active:bg-gray-50 transition rounded-lg text-left">
                                    <div class="flex items-center gap-2">
                                          <i class="fa-solid fa-star text-[#fbbf24] text-xs"></i>
                                          <span class="text-[#3e3e3e] font-bold text-sm">4.9 <span class="text-gray-400 font-normal ml-0.5">(7.478 avaliações)</span></span>
                                          <div class="flex items-center gap-1 bg-[#EA1D2C] text-white px-2 py-0.5 rounded-full scale-90 origin-left">
                                                <i class="fa-solid fa-star text-[8px]"></i>
                                                <span class="text-[9px] font-black uppercase tracking-tighter">Super</span>
                                          </div>
                                    </div>
                                    <i class="fa-solid fa-chevron-right text-gray-300 text-[10px]"></i>
                              </div>

                    <!-- Divisória Sutil -->
                    <div class="w-full h-[1px] bg-gray-100 mb-2"></div>

                    <!-- Informação de Entrega (Alinhada à esquerda) -->
                    <div class="flex flex-col w-full text-left py-1">
                        <div class="text-[14px] text-[#3e3e3e] font-medium">
                            Entrega padrão (30-50 min) <span class="text-[#05a65a] font-bold ml-1">Grátis</span>
                        </div>
                        <div class="text-[13px] text-gray-400 mt-0.5 font-medium">
                            Mais opções disponíveis na sacola
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <div class="px-4 mt-5">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5 bg-[#EA1D2C]/10 px-2 py-0.5 rounded-full">
                <i class="fa-solid fa-star text-[#EA1D2C] text-[8px]"></i>
                <span class="text-[9px] font-black text-[#EA1D2C] uppercase tracking-tighter">Parceiro Oficial iFood</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
              <i class="fa-solid fa-clock text-gray-400 text-[10px]"></i>
              <span id="countdown-timer" class="text-[11px] font-bold text-gray-600 tabular-nums">00:00:00</span>
            </div>
          </div>
          <div class="flex items-center gap-2 mb-3">
            <i class="fa-solid fa-bolt-lightning text-[#EA1D2C] text-sm"></i>
            <span class="text-sm font-bold text-gray-800 tracking-tight">Oferta Relâmpago</span>
          </div>
          
          <div class="flex items-center justify-between mb-2">
            <span class="text-[12px] text-gray-500 font-medium">Restam poucas unidades</span>
            <span id="stock-percentage" class="text-[12px] font-bold text-[#EA1D2C]">85%</span>
          </div>
          
          <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div id="stock-progress-bar" class="bg-[#EA1D2C] h-full rounded-full transition-all duration-1000 ease-out" style="width: 85%"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="sticky top-0 bg-white z-30 border-b border-gray-100 mt-5 cat-tabs-wrap">
        <div class="flex overflow-x-auto no-scroll px-4">
            <button onclick="scrollToCat('destaques', event)" class="nav-item active" id="btn-destaques">Destaques</button>
            <button onclick="scrollToCat('entradas', event)" class="nav-item">Entradas</button>
            <button onclick="scrollToCat('temakis', event)" class="nav-item">Temakis</button>
            <button onclick="scrollToCat('familia', event)" class="nav-item">Família</button>
            <button onclick="scrollToCat('classicos', event)" class="nav-item">Clássicos</button>
            <button onclick="scrollToCat('hot-rolls', event)" class="nav-item">Quentes</button>
            <button onclick="scrollToCat('yakisobas', event)" class="nav-item">Yakisobas</button>
            <button onclick="scrollToCat('sobremesas', event)" class="nav-item">Sobremesas</button>
            <button onclick="scrollToCat('bebidas', event)" class="nav-item">Bebidas</button>
        </div>
    </div>

    <main class="p-4 space-y-6 min-h-screen bg-[#ffffff]" id="product-container"></main>

    <!-- ========================================== -->
        <!-- 🟢 NOVA SEÇÃO: FAQ (Design Clean) -->
        <!-- ========================================== -->
        <section class="bg-[#ffffff] mt-2 pt-4 pb-2">
            <div class="px-4">
                <h3 class="font-bold text-[#3e3e3e] text-lg mb-4 flex items-center gap-2">
                    <i class="fa-regular fa-comments text-[#EA1D2C]"></i> 
                    Dúvidas Frequentes
                </h3>
                
                <div class="space-y-2">
                    <!-- Pergunta 1 -->
                    <div class="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden faq-item">
                        <button onclick="toggleFaq(this)" class="w-full flex justify-between items-center p-4 text-left font-semibold text-sm text-gray-700 active:bg-gray-50 transition">
                            <span>Qual o prazo de entrega?</span>
                            <i class="fa-solid fa-chevron-down text-[#EA1D2C] text-xs transition-transform duration-300 faq-icon"></i>
                        </button>
                        <div class="hidden px-4 pb-4 text-xs text-gray-500 leading-relaxed faq-content">
                            <div class="pt-2 border-t border-gray-50">
                                Nosso prazo médio é de <strong>30 a 45 minutos</strong>. Em dias de chuva ou alta demanda, esse tempo pode variar levemente, mas sempre prezamos pela agilidade.
                            </div>
                        </div>
                    </div>

                    <!-- Pergunta 2 -->
                    <div class="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden faq-item">
                        <button onclick="toggleFaq(this)" class="w-full flex justify-between items-center p-4 text-left font-semibold text-sm text-gray-700 active:bg-gray-50 transition">
                            <span>Quais formas de pagamento?</span>
                            <i class="fa-solid fa-chevron-down text-[#EA1D2C] text-xs transition-transform duration-300 faq-icon"></i>
                        </button>
                        <div class="hidden px-4 pb-4 text-xs text-gray-500 leading-relaxed faq-content">
                            <div class="pt-2 border-t border-gray-50">
                                Aceitamos <strong>PIX (Aprovação Imediata)</strong>. É a forma mais rápida e segura. Seu pedido vai direto para a cozinha assim que o pagamento é confirmado.
                            </div>
                        </div>
                    </div>

                    <!-- Pergunta 3 -->
                    <div class="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden faq-item">
                        <button onclick="toggleFaq(this)" class="w-full flex justify-between items-center p-4 text-left font-semibold text-sm text-gray-700 active:bg-gray-50 transition">
                            <span>Os produtos são frescos?</span>
                            <i class="fa-solid fa-chevron-down text-[#EA1D2C] text-xs transition-transform duration-300 faq-icon"></i>
                        </button>
                        <div class="hidden px-4 pb-4 text-xs text-gray-500 leading-relaxed faq-content">
                            <div class="pt-2 border-t border-gray-50">
                                <strong>Sim! Absolutamente.</strong> Recebemos peixe fresco todos os dias. Não trabalhamos com estoque congelado de sushis prontos. Tudo é feito na hora.
                            </div>
                        </div>
                    </div>

                    <!-- Pergunta 4 -->
                    <div class="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden faq-item">
                        <button onclick="toggleFaq(this)" class="w-full flex justify-between items-center p-4 text-left font-semibold text-sm text-gray-700 active:bg-gray-50 transition">
                            <span>Horário de Funcionamento</span>
                            <i class="fa-solid fa-chevron-down text-[#EA1D2C] text-xs transition-transform duration-300 faq-icon"></i>
                        </button>
                        <div class="hidden px-4 pb-4 text-xs text-gray-500 leading-relaxed faq-content">
                            <div class="pt-2 border-t border-gray-50">
                                Estamos abertos <strong>24 Horas</strong>! Madrugada, manhã, tarde ou noite: bateu a fome, o Rūshī Sushi entrega.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    <!-- SEÇÃO DE REVIEWS REAIS -->
    <section class="px-4 mt-8 mb-4">
        <h3 class="font-bold text-[#3e3e3e] text-lg mb-4 flex items-center gap-2">
            <i class="fa-solid fa-star text-[#fbbf24]"></i> 
            O que dizem nossos clientes
        </h3>
        
        <div class="space-y-3">
            <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-xs">RM</div>
                        <div><h4 class="text-xs font-bold text-gray-800">Ricardo Mello</h4><div class="flex text-[10px] text-[#fbbf24]"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div></div>
                    </div>
                    <span class="text-[10px] text-gray-400">Hoje</span>
                </div>
                <p class="text-xs text-gray-600 italic">"Melhor custo benefício que já vi. O peixe está muito fresco, chegou rápido."</p>
            </div>

            <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-600 text-xs">AB</div>
                        <div><h4 class="text-xs font-bold text-gray-800">Amanda Borges</h4><div class="flex text-[10px] text-[#fbbf24]"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div></div>
                    </div>
                    <span class="text-[10px] text-gray-400">Hoje</span>
                </div>
                <p class="text-xs text-gray-600 italic">"O Hot Roll veio crocante de verdade! Embalagem impecável."</p>
            </div>

            <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">JP</div>
                        <div><h4 class="text-xs font-bold text-gray-800">João Paulo</h4><div class="flex text-[10px] text-[#fbbf24]"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star-half-stroke"></i></div></div>
                    </div>
                    <span class="text-[10px] text-gray-400">Hoje</span>
                </div>
                <p class="text-xs text-gray-600 italic">"Vi no TikTok e resolvi testar. Entrega super rápida e sushi de qualidade."</p>
            </div>

            <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 text-xs">LH</div>
                        <div><h4 class="text-xs font-bold text-gray-800">Letícia Helena</h4><div class="flex text-[10px] text-[#fbbf24]"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div></div>
                    </div>
                    <span class="text-[10px] text-gray-400">Hoje</span>
                </div>
                <p class="text-xs text-gray-600 italic">"Combo Haki maravilhoso. Comemos em 3 e ficamos satisfeitos!"</p>
            </div>

            <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600 text-xs">CC</div>
                        <div><h4 class="text-xs font-bold text-gray-800">Claudio C.</h4><div class="flex text-[10px] text-[#fbbf24]"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div></div>
                    </div>
                    <span class="text-[10px] text-gray-400">Hoje</span>
                </div>
                <p class="text-xs text-gray-600 italic">"A entrega grátis realmente funciona e não demora. Gostei muito."</p>
            </div>

            <button class="w-full py-3 text-[#EA1D2C] text-xs font-bold border border-gray-200 rounded-xl bg-white active:bg-gray-50 transition">
                Faça seu primeiro pedido para avaliar!
            </button>
        </div>
    </section>

    <footer class="bg-white border-t border-gray-200 mt-8 pt-10 pb-32 px-6 text-center relative">
            <div class="flex flex-col items-center justify-center mb-6">
                <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-100 p-1"><img src="images/logo-rushi.webp" class="w-full h-full object-cover rounded-full"></div>
                <h2 class="text-lg font-bold text-[#3e3e3e]">Rūshī Sushi</h2>
                <p class="text-[10px] text-gray-400 uppercase tracking-widest mt-1">CNPJ: 57.272.601/0001-12</p>
            </div>
            <div class="flex flex-wrap justify-center gap-2 mb-8 max-w-xs mx-auto">
                <button onclick="openInstitucional('sobre')" class="px-4 py-2 bg-[#fafafa] text-gray-600 text-xs font-semibold rounded-full border border-gray-100 hover:bg-gray-100 transition">Sobre Nós</button>
                <button onclick="openInstitucional('privacidade')" class="px-4 py-2 bg-[#fafafa] text-gray-600 text-xs font-semibold rounded-full border border-gray-100 hover:bg-gray-100 transition">Privacidade</button>
                <button onclick="openInstitucional('termos')" class="px-4 py-2 bg-[#fafafa] text-gray-600 text-xs font-semibold rounded-full border border-gray-100 hover:bg-gray-100 transition">Termos</button>
                <button onclick="openInstitucional('trocas')" class="px-4 py-2 bg-[#fafafa] text-gray-600 text-xs font-semibold rounded-full border border-gray-100 hover:bg-gray-100 transition">Trocas</button>
            </div>
            <div class="flex justify-center gap-4 mb-8">
                <a href="https://www.instagram.com/rushisushioficial/" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 shadow-sm border border-pink-100 hover:bg-pink-100 transition"><i class="fa-brands fa-instagram text-lg"></i></a>
            </div>
            <div class="text-[10px] text-gray-400 border-t border-gray-100 pt-6">
                <p>&copy; 2026 Rūshī Sushi Delivery.</p>
                <p>Feito com <i class="fa-solid fa-heart text-[#EA1D2C] text-[8px]"></i> para você.</p>
            </div>
    </footer>

    <div id="cart-bar" class="fixed bottom-0 left-0 w-full bg-white z-40 transition-transform transform translate-y-full shadow-[0_-4px_14px_rgba(0,0,0,0.10)] mb-safe border-t border-gray-100">
        <!-- Barra de progresso / cupom (topo) -->
        <div id="cart-progress" class="px-4 pt-2.5 pb-2 border-b border-gray-100">
            <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-1.5 min-w-0">
                    <i id="cart-progress-icon" class="fa-solid fa-motorcycle text-[#EA1D2C] text-[11px]"></i>
                    <span id="cart-progress-text" class="text-[11px] font-semibold text-[#3e3e3e] truncate">Faltam R$ 32,80 para entrega grátis</span>
                </div>
                <span id="cart-progress-percent" class="text-[10px] font-bold text-gray-400 ml-2 shrink-0">0%</span>
            </div>
            <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div id="cart-progress-fill" class="h-full bg-[#EA1D2C] rounded-full transition-all duration-500" style="width:0%"></div>
            </div>
        </div>
        <!-- Ação principal (rodapé) -->
        <div class="flex items-center justify-between px-4 py-3 gap-3">
            <div class="flex flex-col min-w-0">
                <span class="font-bold text-[15px] text-[#3e3e3e] leading-tight" id="bar-total">R$ 0,00</span>
                <span class="text-[11px] text-gray-500" id="bar-count-label">0 itens</span>
            </div>
            <button onclick="openBag()" class="bg-[#EA1D2C] active:bg-[#bf1622] text-white text-sm font-bold rounded-lg px-5 py-2.5 shadow-sm whitespace-nowrap">
                Ver sacola
            </button>
        </div>
    </div>

    <div class="fixed inset-0 z-50 hidden" id="product-modal-container">
        <div class="absolute inset-0 bg-black/60 sheet-overlay" id="product-overlay" onclick="closeProductModal()"></div>
        <div id="product-sheet" class="absolute bottom-0 left-0 w-full bg-white h-[92vh] flex flex-col bottom-sheet rounded-t-3xl overflow-hidden">
            <button onclick="closeProductModal()" class="absolute top-4 left-4 z-20 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md"><i class="fa-solid fa-chevron-down text-[#EA1D2C]"></i></button>
            <div class="flex-1 overflow-y-auto pb-24 bg-white">
                <div class="h-64 w-full bg-gray-100 relative"><img id="modal-img" src="" class="w-full h-full object-cover"></div>
                <div class="px-5 py-6 relative -mt-6 bg-white rounded-t-3xl z-10">
                    <h2 id="modal-title" class="text-2xl font-bold text-[#3e3e3e] mb-2 leading-tight"></h2>
                    <p id="modal-desc" class="text-gray-500 text-sm leading-relaxed mb-4"></p>
                    <div class="flex items-center gap-2 mb-6"><span id="modal-price" class="text-[#05a65a] font-bold text-xl"></span><span id="modal-old-price" class="text-gray-400 text-sm line-through"></span></div>
                    <div id="modal-options" class="space-y-4 border-t border-gray-100 pt-6"></div>
                    <div class="mt-6 border-t border-gray-100 pt-6">
                        <div class="flex justify-between mb-2"><label class="font-bold text-gray-700 text-sm"><i class="fa-regular fa-comment-dots mr-1"></i> Alguma observação?</label><span class="text-xs text-gray-400">0/140</span></div>
                        <textarea id="modal-obs" class="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-gray-400" rows="3" placeholder="Ex: Tirar cebola, sem gergelim..."></textarea>
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-100 p-4 flex items-center justify-between bg-white sticky bottom-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
                <div class="flex items-center border border-gray-200 rounded-lg h-12 px-3 mr-4">
                    <button onclick="changeQty(-1)" class="w-8 h-full text-[#EA1D2C] font-bold text-xl disabled:opacity-30">-</button>
                    <span id="modal-qty" class="w-8 text-center font-medium text-[#3e3e3e]">1</span>
                    <button onclick="changeQty(1)" class="w-8 h-full text-[#EA1D2C] font-bold text-xl">+</button>
                </div>
                <button onclick="addToCartCurrent()" class="flex-1 bg-[#EA1D2C] text-white font-bold h-12 rounded-lg flex justify-between items-center px-4 active:bg-[#c91925]"><span>Adicionar</span><span id="modal-btn-price">R$ 0,00</span></button>
            </div>
        </div>
    </div>

    <div class="fixed inset-0 z-[60] hidden" id="bag-modal-container">
        <div class="absolute inset-0 bg-black/60 sheet-overlay" id="bag-overlay" onclick="closeBag()"></div>
        <div id="bag-sheet" class="absolute bottom-0 left-0 w-full bg-white h-[95vh] flex flex-col bottom-sheet rounded-t-3xl overflow-hidden">
            <div class="bg-white p-4 border-b border-gray-100 flex items-center justify-between z-10">
                <div class="flex items-center gap-3">
                    <button onclick="prevBagStep()" class="text-[#EA1D2C] hidden" id="bag-btn-back"><i class="fa-solid fa-chevron-left fa-lg"></i></button>
                    <h2 class="text-base font-bold text-[#3e3e3e] uppercase tracking-wide" id="bag-title">SACOLA</h2>
                </div>
                <button onclick="closeBag()" class="text-[#EA1D2C] font-semibold text-sm" id="bag-btn-close">Fechar</button>
            </div>
            <div class="flex-1 overflow-y-auto pb-32 bg-[#ffffff]" id="bag-scroll">
                <div id="sacola-tela-1">
                    <div class="bg-white p-4 mb-4">
                        <div class="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#EA1D2C] overflow-hidden"><img src="images/logo-rushi.webp" class="w-full h-full object-cover"></div>
                            <div><h3 class="font-bold text-[#3e3e3e] text-sm">Rūshī Sushi</h3><p class="text-xs text-[#EA1D2C] font-semibold cursor-pointer" onclick="closeBag()">Adicionar mais itens</p></div>
                        </div>
                        <div id="bag-list-items" class="space-y-4"></div>
                    </div>
                    <div class="bg-white p-4 mb-4">
                        <h3 class="font-bold text-[#3e3e3e] text-sm mb-3">Resumo de valores</h3>
                        <div class="flex justify-between text-sm text-gray-500 mb-2"><span>Subtotal</span><span id="bag-subtotal">R$ 0,00</span></div>
                        <div class="flex justify-between text-sm text-gray-500 mb-2"><span>Taxa de entrega</span><span id="bag-shipping" class="text-[#05a65a]">A calcular</span></div>
                        <div class="flex justify-between text-lg font-bold text-[#3e3e3e] mt-3 pt-3 border-t border-gray-100"><span>Total</span><span id="bag-total" class="text-[#05a65a]">R$ 0,00</span></div>
                    </div>
                </div>

                <div id="sacola-tela-2" class="hidden">
                    <!-- Step header iFood-style -->
                    <div class="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
                        <div class="flex items-center justify-between mb-1">
                            <div class="flex items-center gap-2">
                                <i id="checkout-step-icon" class="fa-solid fa-location-dot text-[#EA1D2C] text-sm"></i>
                                <p id="checkout-step-label" class="text-[13px] text-[#3e3e3e] font-bold">Endereço de entrega</p>
                            </div>
                            <span class="text-[11px] font-bold text-gray-400 tracking-wider"><span id="checkout-step-current">1</span>/4</span>
                        </div>
                        <div class="relative pt-3 pb-1">
                            <div class="absolute left-3 right-3 top-[22px] h-[2px] bg-gray-200 rounded-full"></div>
                            <div id="checkout-step-fill" class="absolute left-3 top-[22px] h-[2px] bg-[#EA1D2C] rounded-full transition-all duration-300" style="width:0px"></div>
                            <div class="relative flex justify-between">
                                <div class="flex flex-col items-center gap-1" data-stepnode="1">
                                    <div class="step-circle w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-[#EA1D2C] text-white ring-2 ring-white">1</div>
                                    <span class="step-label text-[9px] font-semibold text-[#EA1D2C]">Endereço</span>
                                </div>
                                <div class="flex flex-col items-center gap-1" data-stepnode="2">
                                    <div class="step-circle w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-200 text-gray-500 ring-2 ring-white">2</div>
                                    <span class="step-label text-[9px] font-semibold text-gray-400">Dados</span>
                                </div>
                                <div class="flex flex-col items-center gap-1" data-stepnode="3">
                                    <div class="step-circle w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-200 text-gray-500 ring-2 ring-white">3</div>
                                    <span class="step-label text-[9px] font-semibold text-gray-400">Entrega</span>
                                </div>
                                <div class="flex flex-col items-center gap-1" data-stepnode="4">
                                    <div class="step-circle w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-200 text-gray-500 ring-2 ring-white">4</div>
                                    <span class="step-label text-[9px] font-semibold text-gray-400">Pagamento</span>
                                </div>
                            </div>
                        </div>
                        <!-- legacy elements kept for backwards compat (hidden) -->
                        <div class="hidden">
                            <div id="checkout-progress-bar"></div>
                            <div data-stepdot="1"></div><div data-stepdot="2"></div><div data-stepdot="3"></div><div data-stepdot="4"></div>
                        </div>
                    </div>

                    <div class="p-4">
                    <div class="checkout-step" data-cstep="1">
                        <div class="bg-[#fafafa] rounded-2xl mb-3 shadow-sm overflow-hidden">
                            <div class="px-4 pt-4 pb-2 flex items-center gap-2">
                                <div class="w-8 h-8 rounded-full bg-[#fff3f0] flex items-center justify-center"><i class="fa-solid fa-location-dot text-[#EA1D2C] text-sm"></i></div>
                                <div>
                                    <h4 class="font-bold text-[#3e3e3e] text-[14px] leading-tight">Onde vamos entregar?</h4>
                                    <p class="text-[11px] text-gray-400">Informe o endereço completo</p>
                                </div>
                            </div>
                            <div class="px-4 pb-4 pt-2 space-y-3">
                                <div class="input-group"><label class="input-label">CEP</label><input type="text" id="cust-cep" placeholder="00000-000" class="input-field" autocomplete="postal-code"></div>
                                <div class="flex gap-3"><div class="input-group flex-1"><label class="input-label">Rua</label><input type="text" id="cust-street" class="input-field" autocomplete="address-line1"></div><div class="input-group w-24"><label class="input-label">Número</label><input type="text" id="cust-number" class="input-field font-bold text-[#EA1D2C]" autocomplete="address-line2"></div></div>
                                <div class="flex gap-3"><div class="input-group flex-1"><label class="input-label">Bairro</label><input type="text" id="cust-hood" class="input-field" autocomplete="address-level3"></div><div class="input-group flex-1"><label class="input-label">Complemento</label><input type="text" id="cust-comp" class="input-field" autocomplete="address-line3"></div></div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 text-[11px] text-gray-500 px-1"><i class="fa-solid fa-shield-halved text-[#05a65a]"></i><span>Seus dados são protegidos e usados apenas para a entrega.</span></div>
                    </div>

                    <div class="checkout-step hidden" data-cstep="2">
                        <div class="bg-[#fafafa] rounded-2xl mb-3 shadow-sm overflow-hidden">
                            <div class="px-4 pt-4 pb-2 flex items-center gap-2">
                                <div class="w-8 h-8 rounded-full bg-[#fff3f0] flex items-center justify-center"><i class="fa-solid fa-user text-[#EA1D2C] text-sm"></i></div>
                                <div>
                                    <h4 class="font-bold text-[#3e3e3e] text-[14px] leading-tight">Quem vai receber?</h4>
                                    <p class="text-[11px] text-gray-400">Usaremos seu WhatsApp para avisos do pedido</p>
                                </div>
                            </div>
                            <div class="px-4 pb-4 pt-2 space-y-3">
                                <div class="input-group"><label class="input-label">Nome Completo</label><input type="text" id="cust-name" class="input-field"></div>
                                <div class="input-group"><label class="input-label">WhatsApp</label><input type="tel" id="cust-phone" class="input-field"></div>
                            </div>
                        </div>
                    </div>

                    <div class="checkout-step hidden" data-cstep="3">
                        <div class="bg-[#fafafa] rounded-2xl mb-3 shadow-sm overflow-hidden">
                            <div class="px-4 pt-4 pb-2 flex items-center gap-2">
                                <div class="w-8 h-8 rounded-full bg-[#fff3f0] flex items-center justify-center"><i class="fa-solid fa-motorcycle text-[#EA1D2C] text-sm"></i></div>
                                <div>
                                    <h4 class="font-bold text-[#3e3e3e] text-[14px] leading-tight">Forma de entrega</h4>
                                    <p class="text-[11px] text-gray-400">Escolha como prefere receber</p>
                                </div>
                            </div>
                            <div class="px-4 pb-4 pt-2">
                                <div id="shipping-info-banner" class="hidden text-[11px] bg-[#fff3f0] border border-[#ffd9d2] text-[#EA1D2C] rounded-lg px-3 py-2 mb-3 font-semibold"></div>
                                <label id="shipping-padrao-label" class="flex items-center justify-between p-3 border-2 border-[#05a65a] bg-[#f0fff4] rounded-xl cursor-pointer mb-2 transition-all">
                                    <div class="flex items-center gap-3">
                                        <input type="radio" name="shipping" value="0" checked onchange="recalcTotal()" class="accent-[#05a65a]">
                                        <div class="flex flex-col">
                                            <span class="font-bold text-sm text-[#3e3e3e]">Entrega Padrão</span>
                                            <span class="text-xs text-gray-500">30-45 min</span>
                                        </div>
                                    </div>
                                    <span id="shipping-padrao-price" class="font-bold text-[#05a65a] text-sm">Grátis</span>
                                </label>
                                <label id="shipping-rapida-label" class="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer transition-all">
                                    <div class="flex items-center gap-3">
                                        <input type="radio" name="shipping" value="3.97" onchange="recalcTotal()" class="accent-[#EA1D2C]">
                                        <div class="flex flex-col">
                                            <span class="font-bold text-sm text-[#3e3e3e]">Entrega Rápida</span>
                                            <span class="text-xs text-[#EA1D2C]">15-25 min</span>
                                        </div>
                                    </div>
                                    <span id="shipping-rapida-price" class="font-bold text-[#3e3e3e] text-sm">+ R$ 3,97</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="checkout-step hidden" data-cstep="4">
                        <div class="bg-white rounded-2xl mb-3 shadow-sm overflow-hidden border border-gray-100">
                            <div class="px-4 pt-4 pb-2 flex items-center gap-2">
                                <div class="w-8 h-8 rounded-full bg-[#fff3f0] flex items-center justify-center"><i class="fa-regular fa-credit-card text-[#EA1D2C] text-sm"></i></div>
                                <div>
                                    <h4 class="font-bold text-[#3e3e3e] text-[14px] leading-tight">Pague pelo app</h4>
                                    <p class="text-[11px] text-gray-400">Aprovação na hora</p>
                                </div>
                            </div>
                            <div class="px-4 pb-4 pt-2">
                                <!-- PIX destacado -->
                                <div class="relative border-2 border-[#05a65a] bg-gradient-to-br from-[#f0fff4] to-white p-3 rounded-xl flex items-center gap-3 cursor-pointer shadow-sm" onclick="selectPayment('PIX')">
                                    <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#d4f5e0]">
                                        <i class="fa-brands fa-pix text-[#05a65a] text-lg"></i>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-1.5">
                                            <span class="font-bold text-[14px] text-[#3e3e3e]">Pix</span>
                                        </div>
                                        <span class="text-[11px] text-[#05a65a] font-semibold flex items-center gap-1"><i class="fa-solid fa-bolt text-[10px]"></i> Aprovação imediata</span>
                                    </div>
                                    <i class="fa-solid fa-check-circle text-[#05a65a] text-lg" id="check-pay-PIX"></i>
                                </div>

                                <!-- Outras formas (em manutenção) — grid compacto -->
                                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-3 mb-1">Outras formas</p>
                                <p class="text-[10px] text-gray-400 mb-1.5">Em manutenção temporariamente. Disponível em breve.</p>
                                <div class="grid grid-cols-4 gap-1.5">
                                    <div class="border border-gray-200 bg-gray-50 rounded-lg flex flex-col items-center justify-center py-2 px-1 opacity-60 relative">
                                        <i class="fa-regular fa-credit-card text-gray-400 text-base"></i>
                                        <span class="text-[9px] text-gray-500 mt-1 font-semibold leading-tight text-center">Crédito</span>
                                        <i class="fa-solid fa-wrench text-gray-300 text-[8px] absolute top-1 right-1"></i>
                                    </div>
                                    <div class="border border-gray-200 bg-gray-50 rounded-lg flex flex-col items-center justify-center py-2 px-1 opacity-60 relative">
                                        <i class="fa-solid fa-wallet text-gray-400 text-base"></i>
                                        <span class="text-[9px] text-gray-500 mt-1 font-semibold leading-tight text-center">NuPay</span>
                                        <i class="fa-solid fa-wrench text-gray-300 text-[8px] absolute top-1 right-1"></i>
                                    </div>
                                    <div class="border border-gray-200 bg-gray-50 rounded-lg flex flex-col items-center justify-center py-2 px-1 opacity-60 relative">
                                        <i class="fa-brands fa-google-pay text-gray-400 text-base"></i>
                                        <span class="text-[9px] text-gray-500 mt-1 font-semibold leading-tight text-center">G Pay</span>
                                        <i class="fa-solid fa-wrench text-gray-300 text-[8px] absolute top-1 right-1"></i>
                                    </div>
                                    <div class="border border-gray-200 bg-gray-50 rounded-lg flex flex-col items-center justify-center py-2 px-1 opacity-60 relative">
                                        <i class="fa-brands fa-apple-pay text-gray-400 text-base"></i>
                                        <span class="text-[9px] text-gray-500 mt-1 font-semibold leading-tight text-center">Apple</span>
                                        <i class="fa-solid fa-wrench text-gray-300 text-[8px] absolute top-1 right-1"></i>
                                    </div>
                                </div>

                                <input type="hidden" id="cust-payment" value="PIX">

                                <div class="flex items-center gap-2 mt-3 px-1">
                                    <i class="fa-solid fa-shield-halved text-[#05a65a] text-[11px]"></i>
                                    <p class="text-[10px] text-gray-500 leading-snug">Pagamento 100% seguro e criptografado</p>
                                </div>
                            </div>
                        </div>

                        <!-- Resumo iFood-style -->
                        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <div class="px-4 pt-4 pb-2">
                                <h4 class="font-bold text-[#3e3e3e] text-[13px] uppercase tracking-wide">Resumo do pedido</h4>
                            </div>
                            <div class="px-4 pb-4 pt-2 space-y-1.5">
                                <div class="flex justify-between text-[13px] text-gray-500"><span>Subtotal</span><span id="final-subtotal">R$ 0,00</span></div>
                                <div class="flex justify-between text-[13px] text-gray-500"><span>Taxa de entrega</span><span id="final-shipping" class="text-[#05a65a] font-semibold">Grátis</span></div>
                                <div class="flex justify-between text-base font-bold text-[#3e3e3e] mt-2 pt-2 border-t border-gray-100"><span>Total</span><span id="final-total" class="text-[#05a65a]">R$ 0,00</span></div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>


                <div id="sacola-tela-3" class="hidden h-full flex flex-col items-center justify-center p-8 text-center mt-20">
                    <img src="images/ifood-red.png" class="w-32 h-auto mb-6 animate-pulse object-contain">
                    <h2 class="text-xl font-bold text-[#3e3e3e] mb-2">Validando pedido...</h2>
                    <p class="text-gray-500 text-sm">Conectando com o restaurante</p>
                    <div class="w-full bg-gray-200 h-1 rounded-full mt-8 overflow-hidden max-w-xs mx-auto"><div class="bg-[#EA1D2C] h-full w-1/3 animate-loading-bar"></div></div>
                </div>
            </div>
            <div class="p-4 border-t border-gray-100 bg-white fixed bottom-0 w-full z-20 safe-area-pb" id="bag-footer">
                <div id="footer-act-1" class="flex justify-between items-center w-full">
                    <div class="flex flex-col"><span class="text-xs text-gray-500">Total com a entrega</span><span class="font-bold text-lg text-[#05a65a]" id="footer-total-display">R$ 0,00</span></div>
                    <button onclick="nextBagStep()" class="bg-[#EA1D2C] text-white font-bold px-8 py-3 rounded-lg text-sm active:bg-[#b81622] shadow-lg shadow-red-100">Continuar</button>
                </div>
                <div id="footer-act-2" class="hidden w-full flex gap-2">
                    <button onclick="prevCheckoutStep()" id="checkout-back-btn" class="hidden bg-gray-100 text-[#3e3e3e] font-bold h-12 px-5 rounded-lg text-sm active:bg-gray-200"><i class="fa-solid fa-arrow-left"></i></button>
                    <button onclick="nextCheckoutStep()" id="checkout-next-btn" class="flex-1 bg-[#EA1D2C] text-white font-bold h-12 rounded-lg text-base active:bg-[#b81622] shadow-lg shadow-red-100">Continuar</button>
                </div>
            </div>
        </div>
    </div>

    <div id="bump-modal" class="fixed inset-0 bg-black/80 z-[80] hidden items-center justify-center p-4 backdrop-blur-sm">
        <div class="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative animate-[popIn_0.3s_ease-out]">
            <div class="bg-[#EA1D2C] text-white text-center py-3 font-black text-lg uppercase tracking-wide">✋ Espera um pouco!</div>
            <div class="p-5 text-center">
                <h3 class="text-gray-800 font-bold text-lg leading-tight mb-2">O iFood liberou uma oferta exclusiva!</h3>
                <p class="text-gray-500 text-sm mb-4">Adicione <strong>Coca-Cola 2L + Porção Hot Rolls (10un)</strong> por um preço absurdo.</p>
                <div class="border-2 border-dashed border-[#EA1D2C] rounded-lg p-2 mb-4 relative"><img src="images/hotroll-coca.webp" class="w-full h-32 object-cover rounded" onerror="this.src='https://via.placeholder.com/400x200'"><div class="absolute -top-3 -right-3 bg-yellow-400 text-red-900 font-black px-2 py-1 rounded shadow text-xs">-50% OFF</div></div>
                <div class="flex justify-center items-center gap-3 mb-6"><span class="text-gray-400 line-through text-sm">R$ 39,90</span><span class="text-3xl font-black text-[#EA1D2C]">R$ 19,90</span></div>
                <button onclick="acceptBump()" class="w-full bg-green-600 text-white font-bold py-3 rounded-lg mb-3 shadow-lg hover:bg-green-500 transition uppercase">Sim! Adicionar</button>
                <button onclick="declineBump()" class="text-gray-400 text-xs hover:text-gray-600 underline">Não, obrigado.</button>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/imask/6.4.3/imask.min.js"><\/script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"><\/script>

    <script>
        const API_BASE_URL = "";
        const estadosSiglas = { "Acre": "AC", "Alagoas": "AL", "Amapá": "AP", "Amazonas": "AM", "Bahia": "BA", "Ceará": "CE", "Distrito Federal": "DF", "Espírito Santo": "ES", "Goiás": "GO", "Maranhão": "MA", "Mato Grosso": "MT", "Mato Grosso do Sul": "MS", "Minas Gerais": "MG", "Pará": "PA", "Paraíba": "PB", "Paraná": "PR", "Pernambuco": "PE", "Piauí": "PI", "Rio de Janeiro": "RJ", "Rio Grande do Norte": "RN", "Rio Grande do Sul": "RS", "Rondônia": "RO", "Roraima": "RR", "Santa Catarina": "SC", "São Paulo": "SP", "Sergipe": "SE", "Tocantins": "TO" };

        window.addEventListener('load', () => {
            const loader = document.getElementById('app-loader');
            const body = document.getElementById('main-body');
            setTimeout(() => {
                if(loader) { loader.style.opacity = '0'; loader.style.pointerEvents = 'none'; setTimeout(() => loader.style.display = 'none', 500); }
                if(body) body.classList.remove('overflow-hidden');
                iniciarVerificacaoLocal(); 
                iniciarLogicaCEP(); 
            }, 1000);
        });

        function iniciarLogicaCEP() {
            var elCep = document.getElementById('cust-cep');
            var elPhone = document.getElementById('cust-phone');
            
            if(!elCep) { 
                return; 
            }

            if (typeof IMask !== 'undefined') {
                if(elPhone && !elPhone.getAttribute('data-masked')) {
                    IMask(elPhone, { mask: '(00) 00000-0000' });
                    elPhone.setAttribute('data-masked', 'true');
                }
                if(elCep && !elCep.getAttribute('data-masked')) {
                    IMask(elCep, { mask: '00000-000' });
                    elCep.setAttribute('data-masked', 'true');
                }
            }

            const handleCEP = async function() {
                var rawValue = elCep.value || "";
                var val = rawValue.replace(/\D/g, '');
                
                if (val.length === 8) {
                    if (window.lastSearchedCEP === val) return;
                    window.lastSearchedCEP = val;

                    var street = document.getElementById('cust-street');
                    var hood = document.getElementById('cust-hood');
                    var numberEl = document.getElementById('cust-number');

                    if(street) street.value = "Buscando...";
                    if(hood) hood.value = "...";

                    const preencherCampos = (logradouro, bairro, cidade, estado) => {
                        if(street) {
                            street.value = logradouro || "";
                            street.dispatchEvent(new Event('input', { bubbles: true }));
                            street.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        if(hood) {
                            hood.value = bairro || "";
                            hood.dispatchEvent(new Event('input', { bubbles: true }));
                            hood.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        if(cidade) localStorage.setItem('last_queried_city', cidade);
                        if(estado) localStorage.setItem('last_queried_state', estado);

                        if(numberEl) {
                            setTimeout(() => numberEl.focus(), 200);
                        }
                    };

                    try {
                        const response = await fetch(`https://viacep.com.br/ws/${val}/json/`);
                        const data = await response.json();
                        if (data && !data.erro) {
                            preencherCampos(data.logradouro, data.bairro, data.localidade, data.uf);
                            return;
                        }
                    } catch (err) {}

                    try {
                        const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${val}`);
                        const data = await response.json();
                        if (data && data.cep) {
                            preencherCampos(data.street, data.neighborhood, data.city, data.state);
                            return;
                        }
                    } catch (err) {}
                    
                    if(street && street.value === "Buscando...") street.value = ""; 
                    if(hood && hood.value === "...") hood.value = ""; 
                } else if (val.length < 8) {
                    window.lastSearchedCEP = null;
                }
            };

            elCep.removeEventListener('input', handleCEP);
            elCep.addEventListener('input', handleCEP);
            elCep.removeEventListener('blur', handleCEP);
            elCep.addEventListener('blur', handleCEP);
        }

        async function fetchLocation() {
                  const limparCidade = (cidade) => {
                        if (!cidade) return "Sua Cidade";
                        return cidade
                              .replace(/Regi[ãa]o Metropolitana de /gi, "")
                              .replace(/Grande /gi, "")
                              .replace(/Munic[íi]pio de /gi, "")
                              .trim();
                  };

                  // Tradutor de Estados à prova de acentos
                  const obterSigla = (estado) => {
                        if (!estado) return "SP";
                        if (estado.length === 2) return estado.toUpperCase();
                        
                        const normalizado = estado.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                        const mapa = {
                              "acre": "AC", "alagoas": "AL", "amapa": "AP", "amazonas": "AM",
                              "bahia": "BA", "ceara": "CE", "distrito federal": "DF", "espirito santo": "ES",
                              "goias": "GO", "maranhao": "MA", "mato grosso": "MT", "mato grosso do sul": "MS",
                              "minas gerais": "MG", "para": "PA", "paraiba": "PB", "parana": "PR",
                              "pernambuco": "PE", "piaui": "PI", "rio de janeiro": "RJ", "rio grande do norte": "RN",
                              "rio grande do sul": "RS", "rondonia": "RO", "roraima": "RR", "santa catarina": "SC",
                              "sao paulo": "SP", "sergipe": "SE", "tocantins": "TO"
                        };
                        return mapa[normalizado] || "SP";
                  };

                  const fetchSeguro = async (url) => {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 3500);
                        try {
                              const res = await fetch(url, { signal: controller.signal });
                              clearTimeout(timeoutId);
                              return await res.json();
                        } catch (e) {
                              clearTimeout(timeoutId);
                              throw e;
                        }
                  };

                  try {
                        const data1 = await fetchSeguro('https://api.bigdatacloud.net/data/reverse-geocode-client');
                        if (data1 && data1.city) {
                              return { city: limparCidade(data1.city), region: obterSigla(data1.principalSubdivision) };
                        }
                  } catch (e) { console.warn("BigDataCloud falhou"); }

                  try {
                        const data2 = await fetchSeguro('https://freeipapi.com/api/json');
                        if (data2 && data2.cityName) {
                              return { city: limparCidade(data2.cityName), region: obterSigla(data2.regionName) };
                        }
                  } catch (e) { console.warn("FreeIPAPI falhou"); }

                  return { city: "Sua Cidade", region: "SP" };
            }

        function atualizarHeaderLocalizacao(cidade, estado) {
            const el = document.getElementById("header-location-info");
            if (el) {
                // Adicionamos a barra invertida \ antes do $ para o código não quebrar
                el.innerText = \`\${cidade} - \${estado}\`;
            }
        }

        async function escolherLocalizacaoManualmente(detectedRegion) {
            const { value: stateData } = await Swal.fire({
                title: 'Onde você está?', text: 'Selecione seu estado.', input: 'select', inputPlaceholder: 'Estado', confirmButtonText: 'Próximo', customClass: { popup: 'popup-local-container', confirmButton: 'btn-confirmar' }, allowOutsideClick: false,
                inputOptions: (async () => { try { const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome'); const states = await response.json(); const opts = {}; states.forEach(s => opts[JSON.stringify({ id: s.id, sigla: s.sigla, nome: s.nome })] = s.nome); return opts; } catch { return {}; } })(),
                preConfirm: v => v ? JSON.parse(v) : Swal.showValidationMessage('Selecione um estado!')
            });
            if (stateData) {
                const { value: city } = await Swal.fire({
                    title: 'Sua cidade', input: 'select', inputPlaceholder: 'Selecione a cidade', confirmButtonText: 'Confirmar', customClass: { popup: 'popup-local-container', confirmButton: 'btn-confirmar' }, allowOutsideClick: false,
                    inputOptions: (async () => { try { const res = await fetch(\`https://servicodados.ibge.gov.br/api/v1/localidades/estados/\${stateData.id}/municipios?orderBy=nome\`); const cities = await res.json(); const opts = {}; cities.forEach(c => opts[c.nome] = c.nome); return opts; } catch { return {}; } })(),
                    inputValidator: v => !v && 'Selecione uma cidade!'
                });
                if (city) salvarEExibir(city, stateData.sigla);
            }
        }

        function salvarEExibir(cidade, estado) {
            localStorage.setItem("localCidade", cidade); localStorage.setItem("localEstado", estado); atualizarHeaderLocalizacao(cidade, estado);
            Swal.fire({ html: \`<div class="popup-header"><i class="fa-solid fa-circle-check" style="color:#05a65a;"></i><h2>Localização Confirmada!</h2><p style="color: #05A65A;">A loja mais próxima de você fica a 2.5Km</p></div>\`, confirmButtonText: 'Ver cardápio', customClass: { popup: 'popup-local-container', confirmButton: 'btn-confirmar' } });
        }

        async function iniciarVerificacaoLocal() {
            const cidadeSalva = localStorage.getItem("localCidade"); const estadoSalvo = localStorage.getItem("localEstado");
            if (cidadeSalva && estadoSalvo) { atualizarHeaderLocalizacao(cidadeSalva, estadoSalvo); return; }
            const local = await fetchLocation();
            Swal.fire({ html: \`<div class="popup-header"><i class="fa-solid fa-map-location-dot"></i><h2>Bateu a fome de Japa?</h2><p>Confirme onde devemos entregar.</p></div><div class="location-box"><span>Detectamos você em:</span><strong>\${local.city} - \${local.region}</strong></div>\`, showCancelButton: true, confirmButtonText: 'É isso mesmo!', cancelButtonText: 'Mudar local', reverseButtons: true, customClass: { popup: 'popup-local-container', confirmButton: 'btn-confirmar', cancelButton: 'btn-alterar' } }).then(result => { if (result.isConfirmed) { salvarEExibir(local.city, local.region); } else if (result.dismiss === Swal.DismissReason.cancel) { escolherLocalizacaoManualmente(local.region); } });
        }

        const commonAddons = [
         { name: "Wasabi Extra", price: 0.00, img: "images/add_wasabi.webp" },
         { name: "Gengibre Extra", price: 0.00, img: "images/add_gengibre.webp" },
         { name: "Tarê Extra", price: 0.00, img: "images/add_tare.webp" },
         { name: "Hashi Extra", price: 0.00, img: "images/add_hashi.webp" },
         { name: "Coca-Cola 350ml", price: 4.90, img: "images/bebida_1-BjLnVhPo.webp" },
         { name: "Coca-Cola Zero 350ml", price: 4.90, img: "images/bebida_2-BcAIyQh4.webp" },
         { name: "Fanta Guaraná 350ml", price: 4.90, img: "images/fanta-guarana-350ml.png" },
         { name: "Fanta Uva 350ml", price: 4.90, img: "images/bebida_4-BU0jDof2.webp" },
         { name: "Refrigerante Japonês 350ml (Morango)", price: 6.90, img: "images/japonesmorango.webp" },
         { name: "Refrigerante Japonês 350ml (Uva)", price: 6.90, img: "images/japonesuva.webp" },
         { name: "Água sem gás", price: 2.50, img: "images/aguasemgas.avif" },
          { name: "Água com gás", price: 2.50, img: "images/bebida_6-CBZjy4rh.webp" },
          { name: "Coca-Cola 2 Litros", price: 12.90, img: "images/coca-cola-2l.png" },
          { name: "Coca-Cola 2 Litros Zero", price: 12.90, img: "images/coca-cola-2l-zero.png" },
          { name: "Fanta Laranja 2 Litros", price: 12.90, img: "images/fanta-laranja-2l.png" }
       ];

        const catalog = [
            { id: "barca-ostentacao", category: "destaques", name: "Combo Haki (120 peças)", desc: "O maior do cardápio! 40 Sashimis, 20 Joes, Camarão e muito mais.", price: 82.90, oldPrice: 219.90, img: "images/combo-presidencial.webp", badge: "Desconto aplicado Amigo de Patas 🐾", hasAddons: true, isBait: true },
            { id: "combo-rodízio", category: "destaques", name: "Combo Kamusari (68 peças)", desc: "Sashimis variados + Niguiris + Uramakis + Joe e Hot Holls variados.", price: 57.90, oldPrice: 149.80, img: "images/combo3.webp", badge: "Desconto aplicado Amigo de Patas 🐾", hasAddons: true, isBait: true },
            { id: "combo-individual", category: "destaques", name: "Combo Tsuki (56 peças)", desc: "Para quem quer comer bem pagando pouco. Variedade incrível.", price: 49.90, oldPrice: 59.80, img: "images/combo-koi.webp", badge: "Desconto aplicado Amigo de Patas 🐾", hasAddons: true, isBait: true },
            { id: "combo-hot-24", soldOut: true, category: "destaques", name: "Combo Kaen (24 peças)", desc: "Os melhores hot rolls, crocantes e recheados com muito cream cheese.", price: 39.90, oldPrice: 69.90, img: "images/hothothot.webp", badge: "Desconto aplicado Amigo de Patas 🐾", hasAddons: true, isBait: true },
            { id: "temaki-isca", category: "destaques", name: "Combo Fujin (24 peças)", desc: "Oferta limitada. O melhor custo benefício para sua fome.", price: 19.90, oldPrice: 54.90, img: "images/combo1.webp", badge: "Desconto aplicado Amigo de Patas 🐾", hasAddons: true, isBait: true },
            
            { id: "ceviche-tilapia", category: "entradas", name: "Ceviche Clássico", desc: "Cubos de peixe branco marinados no limão, cebola roxa, pimenta e coentro.", price: 29.90, img: "images/ceviche_classico.webp", hasAddons: true },
            { id: "shimeji-manteiga", category: "entradas", name: "Shimeji na Manteiga", desc: "Cogumelos frescos refogados na manteiga, shoyu e cebolinha. 200g.", price: 24.90, img: "images/entrada_shimeji.webp", hasAddons: true },
            { id: "carpaccio-salmao", category: "entradas", name: "Carpaccio de Salmão Trufado", desc: "Lâminas finíssimas de salmão com azeite trufado, flor de sal e raspas de limão siciliano.", price: 39.90, img: "images/entrada_carpaccio.webp", badge: "PREMIUM", hasAddons: true },
            { id: "sunomono-especial", category: "entradas", name: "Sunomono Especial", desc: "Salada de pepino agridoce com kani, gergelim e cubos de salmão.", price: 14.90, img: "images/entrada_sunomono.webp", hasAddons: true },
            
            { id: "temaki-salmao-grelhado", category: "temakis", name: "Temaki Salmão Grelhado", desc: "Salmão grelhado, cream cheese e tarê.", price: 22.90, img: "images/temaki-grelhado.webp", hasAddons: true },
            { id: "temaki-camarao", category: "temakis", name: "Temaki Ebi (Camarão)", desc: "Camarões empanados crocantes, cream cheese e cebolinha.", price: 26.90, img: "images/temaki-camarao.webp", hasAddons: true },
            { id: "temaki-sem-arroz", category: "temakis", name: "Temaki Fit (Sem Arroz)", desc: "Apenas salmão fresco, cream cheese e cebolinha enrolados na alga.", price: 29.90, img: "images/temaki-sem-arroz.webp", badge: "LOW CARB", hasAddons: true },
            { id: "temaki-hot", category: "temakis", name: "Temaki Hot (Frito)", desc: "Temaki inteiro empanado e frito, com recheio de salmão e cream cheese.", price: 24.90, img: "images/temaki-hot.webp", hasAddons: true },
            
            { id: "combo-salmao-lovers", category: "familia", name: "Combo Salmão Lovers (32 peças)", desc: "06 Sachimi salmão 10 joy Doritos 04 joy salmão 04 uramaki salmão 04 tatu-zinho de salmão 04 niguiri salmão. Sem arroz pra encher linguiça.", price: 44.91, oldPrice: 119.90, img: "images/combo-sakura.webp", hasAddons: true },
            { id: "combo-casal", category: "familia", name: "Combo Sushi Trufado (32 peças)", desc: "04 Niguiri salmao flambado 04 Niguiri salmao com azeite trufado, raspa de limao ciciliano e flor de sal 04 Sashimi salmao com azeite trufado, raspa de limao ciciliano e flor de sal 04 Sashimi salmao flambado 04 Hot com couve 04 jyo flambado com couve 04 Jyo de salmao com azeite trufado 04 Jyo salmao flambado com shimeji", price: 69.90, oldPrice: 149.90, img: "images/combo-casal.webp", hasAddons: true },
            
            { id: "uramakis-filadelfia", category: "classicos", name: "Uramaki Filadélfia (8 peças)", desc: "Arroz por fora, salmão e cream cheese por dentro.", price: 22.90, img: "images/uramaki-filadelfia.webp", hasAddons: true },
            { id: "hossomaki-salmao", category: "classicos", name: "Hossomaki Salmão (8 peças)", desc: "O clássico rolinho com alga por fora e arroz por dentro.", price: 19.90, img: "images/hossomaki-salmao.webp", hasAddons: true },
            { id: "joy-salmao", category: "classicos", name: "Joy Salmão (4 peças)", desc: "Bolinho de arroz envolto por salmão, coberto com batidinho de salmão e cebolinha.", price: 24.90, img: "images/joy-salmao.webp", hasAddons: true },
            
            { id: "combo-hot-crocante", category: "hot-rolls", name: "Festival Hot Roll (30 peças)", desc: "30 Hot Rolls com MUITO Cream Cheese e Tarê. Crocância absurda.", price: 34.91, oldPrice: 89.90, img: "images/combo-hot-fire.webp", hasAddons: true },
            { id: "hot-roll-camarao", category: "hot-rolls", name: "Hot Roll Camarão (10 peças)", desc: "Recheado com camarão e cream cheese.", price: 29.90, img: "images/hot-roll-camarao.webp", hasAddons: true },
            
            { id: "yakisoba-misto", category: "yakisobas", name: "Yakisoba Clássico Misto", desc: "Carne e Frango com legumes e macarrão frito.", price: 29.90, img: "images/yakisoba-misto.webp" },
            { id: "yakisoba-camarao", category: "yakisobas", name: "Yakisoba Camarão Premium", desc: "Camarões frescos, lula e legumes.", price: 34.90, img: "images/yakisoba-camarao.webp" },
            { id: "yakisoba-vegetariano", category: "yakisobas", name: "Yakisoba Vegetariano", desc: "Legumes selecionados e shimeji na manteiga.", price: 24.90, img: "images/yakisoba-vegetariano.webp" },
            
            { id: "harumaki-choco", category: "sobremesas", name: "Harumaki Nutella (2 peças)", desc: "Rolinho primavera crocante recheado com Nutella original.", price: 12.90, img: "images/harumaki-nutella.webp" },
            { id: "banana-flambada", category: "sobremesas", name: "Banana Empanada com Canela", desc: "4 unidades. Crocante por fora, macia por dentro.", price: 9.90, img: "images/banana-flambada.webp" },
            { id: "harumaki-doce-leite", category: "sobremesas", name: "Harumaki Doce de Leite (2 peças)", desc: "Recheio cremoso de doce de leite argentino.", price: 12.90, img: "images/harumaki-doce.webp" },
            
            { id: "coca-cola", category: "bebidas", name: "Coca-Cola 350ml", desc: "Bebida Gelada.", price: 4.90, img: "images/bebida_1-BjLnVhPo.webp" },
            { id: "coca-zero", category: "bebidas", name: "Coca-Cola Zero 350ml", desc: "Bebida Gelada.", price: 4.90, img: "images/bebida_2-BcAIyQh4.webp" },
            { id: "fanta-guarana", category: "bebidas", name: "Fanta Guaraná 350ml", desc: "Bebida Gelada.", price: 4.90, img: "images/fanta-guarana-350ml.png" },
            { id: "fanta-uva", category: "bebidas", name: "Fanta Uva 350ml", desc: "Bebida Gelada.", price: 4.90, img: "images/bebida_4-BU0jDof2.webp" },
            { id: "refri-jap-morango", category: "bebidas", name: "Refrigerante Japonês 350ml (Morango)", desc: "Bebida Gelada.", price: 6.90, img: "images/japonesmorango.webp" },
            { id: "refri-jap-uva", category: "bebidas", name: "Refrigerante Japonês 350ml (Uva)", desc: "Bebida Gelada.", price: 6.90, img: "images/japonesuva.webp" },
            { id: "coca-cola-2l", category: "bebidas", name: "Coca-Cola 2 Litros", desc: "Bebida Gelada.", price: 12.90, img: "images/coca-cola-2l.png" },
            { id: "coca-cola-2l-zero", category: "bebidas", name: "Coca-Cola 2 Litros Zero", desc: "Bebida Gelada.", price: 12.90, img: "images/coca-cola-2l-zero.png" },
            { id: "fanta-laranja-2l", category: "bebidas", name: "Fanta Laranja 2 Litros", desc: "Bebida Gelada.", price: 12.90, img: "images/fanta-laranja-2l.png" },
            { id: "agua-sem-gas", category: "bebidas", name: "Água sem gás", desc: "Bebida Gelada.", price: 2.50, img: "images/aguasemgas.avif" },
            { id: "agua-com-gas", category: "bebidas", name: "Água com gás", desc: "Bebida Gelada.", price: 2.50, img: "images/bebida_6-CBZjy4rh.webp" }
        ];

        let cart = [];
        let currentItem = null;
        let currentQty = 1;
        let addonsState = {};
        let bagStep = 1;
        let bumpShown = false; // Flag para o OrderBump

        const formatMoney = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        function getTrackingParams() {
            const p = new URLSearchParams(window.location.search);
            const g = (k) => {
                let val = p.get(k) || localStorage.getItem(k) || localStorage.getItem('utmify_' + k);
                return (val === 'null' || val === 'undefined') ? null : val;
            };
            return { 
                src: g('src'), 
                sck: g('sck'), 
                utm_source: g('utm_source'), 
                utm_medium: g('utm_medium'), 
                utm_campaign: g('utm_campaign'), 
                utm_content: g('utm_content'), 
                utm_term: g('utm_term'),
                fbclid: g('fbclid'),
                gclid: g('gclid'),
                ttclid: g('ttclid'),
                xcod: g('xcod')
            };
        }

        renderCatalog();
        iniciarOfertaRelampago();

        function iniciarOfertaRelampago() {
            // Lógica do Cronômetro
            const timerEl = document.getElementById('countdown-timer');
            if (timerEl) {
                // Define um tempo aleatório entre 15 e 45 minutos para escassez
                let seconds = Math.floor(Math.random() * (2700 - 900) + 900);
                
                const updateTimer = () => {
                    const h = Math.floor(seconds / 3600);
                    const m = Math.floor((seconds % 3600) / 60);
                    const s = seconds % 60;
                    timerEl.innerText = h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
                    if (seconds > 0) {
                        seconds--;
                        setTimeout(updateTimer, 1000);
                    }
                };
                updateTimer();
            }

            // Lógica da Barra de Estoque (Escassez Dinâmica)
            const stockBar = document.getElementById('stock-progress-bar');
            const stockPct = document.getElementById('stock-percentage');
            if (stockBar && stockPct) {
                let currentPct = 94;
                const updateStock = () => {
                    if (currentPct < 99 && Math.random() > 0.7) {
                        currentPct += 0.1;
                        stockBar.style.width = currentPct.toFixed(1) + '%';
                        stockPct.innerText = Math.floor(currentPct) + '% vendido';
                    }
                    setTimeout(updateStock, 3000 + Math.random() * 5000);
                };
                updateStock();
            }
        }

        function renderCatalog() {
            const container = document.getElementById('product-container');
            const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            const dayName = days[new Date().getDay()];
            const highlightsTitle = "Destaques de " + dayName;
            
            // Atualizar também o botão de navegação se ele existir
            const btnDestaques = document.getElementById('btn-destaques');
            if (btnDestaques) btnDestaques.innerText = dayName;

            const cats = { 'destaques': highlightsTitle, 'entradas': 'Entradas', 'temakis': 'Temakis', 'familia': 'Para a Família', 'classicos': 'Sushis Clássicos', 'hot-rolls': 'Hot Rolls & Fritos', 'yakisobas': 'Yakisobas', 'sobremesas': 'Sobremesas', 'bebidas': 'Bebidas' };
            for (const key in cats) {
                const title = cats[key];

                const items = catalog.filter(p => p.category === key);
                if (items.length > 0) {
                    let html = \`<div id="\${key}" class="mb-8 scroll-mt-32"><h3 class="text-lg font-bold text-[#3e3e3e] mb-4">\${title}</h3><div class="grid gap-4">\`;
                    items.forEach(p => {
                        let highlightClass = 'border-gray-100 bg-[#fafafa]'; 
                        
                        if (key === 'destaques') {
                            if (p.id === 'combo-rodízio' || p.id === 'barca-ostentacao') { 
                                highlightClass = 'card-destaque-master border-2 border-[#EA1D2C] bg-white'; 
                            }
                            
                            html += \`
                            <div onclick="openProductModal('\${p.id}')" class="\${highlightClass} rounded-2xl border shadow-lg cursor-pointer active:scale-[0.98] transition-transform duration-200 relative overflow-hidden flex flex-col mb-2">
                                <div class="w-full h-48 relative bg-gray-100 z-10">
                                    <img src="\${p.img}" class="w-full h-full object-cover" onerror="this.src='images/logo-rushi.webp'">
                                    \${p.badge ? \`<div class="absolute bottom-0 left-0 right-0 bg-[#EA1D2C] text-white text-[9px] font-bold px-2 py-1 z-20 text-center uppercase">\${p.badge}</div>\` : ''}
                                </div>
                                <div class="p-4 flex flex-col flex-1 z-10 bg-[#fafafa]">
                                    <h4 class="text-[#3e3e3e] font-extrabold text-lg leading-tight mb-1">\${p.name}</h4>
                                    <p class="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3">\${p.desc}</p>
                                    <div class="flex items-center gap-3 mt-auto border-t border-gray-50 pt-3">
                                        <span class="text-[#05a65a] font-black text-2xl">\${formatMoney(p.price)}</span>
                                        \${p.oldPrice ? \`<span class="text-sm text-gray-400 line-through font-medium">\${formatMoney(p.oldPrice)}</span>\` : ''}
                                        \${p.isBait ? \`<span class="text-[10px] text-[#EA1D2C] font-bold ml-auto flex items-center gap-1"><i class="fa-solid fa-bolt-lightning text-[8px]"></i> Oferta Relâmpago</span>\` : ''}
                                    </div>
                                </div>
                            </div>\`;
                        } 
                        else {
                            if (p.id === 'combo-rodízio' || p.id === 'barca-ostentacao') { 
                                highlightClass = 'card-destaque-master border-l-4 border-l-[#EA1D2C]'; 
                            }
                            
                            html += \`
                            <div onclick="openProductModal('\${p.id}')" class="flex justify-between items-center p-5 \${highlightClass} rounded-lg border shadow-sm cursor-pointer active:bg-gray-50 transition relative overflow-hidden">
                                <div class="flex flex-col justify-between min-h-[100px] py-1 pr-2 z-10 w-full">
                                    <div><h4 class="text-[#3e3e3e] font-medium text-sm leading-tight mb-1.5">\${p.name}</h4><p class="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">\${p.desc}</p></div>
                                    <div class="flex items-center gap-2 mt-auto"><span class="text-[#05a65a] font-medium text-sm \${p.isBait ? 'font-bold text-lg' : ''}">\${formatMoney(p.price)}</span>\${p.oldPrice ? \`<span class="text-xs text-gray-400 line-through">\${formatMoney(p.oldPrice)}</span>\` : ''}\${p.isBait ? '' : ''}</div>
                                </div>
                                <div class="w-28 h-24 rounded-lg overflow-hidden shrink-0 relative bg-gray-100 z-10 shadow-sm border border-gray-100"><img src="\${p.img}" class="w-full h-full object-cover" onerror="this.src='images/logo-rushi.webp'">\${p.badge ? \`<div class="absolute top-0 right-0 bg-[#EA1D2C] text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg shadow-sm z-20">\${p.badge}</div>\` : ''}</div>
                            </div>\`;
                        }
                    });
                    html += \`</div></div>\`;
                    container.innerHTML += html;
                }
            }
        }

        function scrollToCat(id, ev) {
            ev = ev || window.event;
            const btn = ev && ev.currentTarget ? ev.currentTarget : (ev && ev.target);
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            if (btn) btn.classList.add('active');

            const section = document.getElementById(id);
            if (section) {
                const tabsBar = document.querySelector('.cat-tabs-wrap');
                const offset = tabsBar ? tabsBar.getBoundingClientRect().height : 0;
                const y = section.getBoundingClientRect().top + window.pageYOffset - offset - 8;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }

            if (btn && btn.parentElement) {
                const wrap = btn.parentElement;
                const targetLeft = btn.offsetLeft - (wrap.clientWidth / 2) + (btn.clientWidth / 2);
                wrap.scrollTo({ left: targetLeft, behavior: 'smooth' });
            }
        }

        window.openProductModal = function(id) {
            const item = catalog.find(p => p.id === id);
            if(!item) return;
            currentItem = item;
            currentQty = 1;
            addonsState = {};
            document.getElementById('modal-img').src = item.img;
            document.getElementById('modal-title').innerText = item.name;
            document.getElementById('modal-desc').innerText = item.desc;
            document.getElementById('modal-price').innerText = formatMoney(item.price);
            document.getElementById('modal-old-price').innerText = item.oldPrice ? formatMoney(item.oldPrice) : '';
            document.getElementById('modal-qty').innerText = 1;
            document.getElementById('modal-btn-price').innerText = formatMoney(item.price);
            document.getElementById('modal-obs').value = '';
            
            const btnSpan = document.querySelector('#product-sheet button[onclick="addToCartCurrent()"] span:first-child');
            if(btnSpan) btnSpan.innerText = "Adicionar";

            const opts = document.getElementById('modal-options');
            opts.innerHTML = '';
            
            if(item.hasAddons) {
                let html = \`<div class="mb-2"><h4 class="font-bold text-gray-700 text-sm mb-3">Adicionais</h4>\`;
                commonAddons.forEach((opt, idx) => {
                    addonsState[opt.name] = 0;
                    html += \`
                    <div class="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                        <div class="flex items-center gap-3"><img src="\${opt.img}" class="w-12 h-12 rounded-lg object-cover border border-gray-100"><div><div class="text-sm text-[#3e3e3e] font-medium">\${opt.name}</div><div class="text-xs text-[#05a65a] font-bold">\${opt.price === 0 ? 'Grátis' : '+ '+formatMoney(opt.price)}</div></div></div>
                        <div class="flex items-center border border-gray-200 rounded-lg h-8 px-2"><button class="text-[#EA1D2C] font-bold w-6" onclick="changeAddonQty('\${opt.name}', \${opt.price}, -1)">-</button><span class="text-sm font-bold text-[#3e3e3e] w-6 text-center" id="addon-qty-\${idx}">0</span><button class="text-[#EA1D2C] font-bold w-6" onclick="changeAddonQty('\${opt.name}', \${opt.price}, 1)">+</button></div>
                    </div>\`;
                });
                html += \`</div>\`;
                opts.innerHTML = html;
            }
            document.getElementById('product-modal-container').classList.remove('hidden');
            setTimeout(() => { document.getElementById('product-overlay').classList.add('visible'); document.getElementById('product-sheet').classList.add('open'); }, 10);
        }

        window.changeAddonQty = function(name, price, delta) {
            const idx = commonAddons.findIndex(a => a.name === name);
            let current = addonsState[name] || 0;
            const newQty = current + delta;
            if (price === 0 && delta > 0 && newQty > 2) { Swal.fire({ toast: true, position: 'center', icon: 'warning', title: 'Máximo de 2 unidades para itens grátis!', showConfirmButton: false, timer: 2000 }); return; }
            if(newQty >= 0) { addonsState[name] = newQty; document.getElementById(\`addon-qty-\${idx}\`).innerText = addonsState[name]; updateModalTotal(); }
        }

        function updateModalTotal() {
            let addonsTotal = 0;
            for(let [name, qty] of Object.entries(addonsState)) { const opt = commonAddons.find(a => a.name === name); if(opt) addonsTotal += (opt.price * qty); }
            const total = (currentItem.price + addonsTotal) * currentQty;
            document.getElementById('modal-btn-price').innerText = formatMoney(total);
        }

        window.changeQty = function(delta) {
            if(currentItem.isBait && (currentQty + delta) > 1) { Swal.fire({ toast: true, position: 'center', icon: 'warning', title: 'Apenas 1 unidade promocional por cliente!', showConfirmButton: false, timer: 2000 }); return; }
            if(currentQty + delta >= 1) { currentQty += delta; document.getElementById('modal-qty').innerText = currentQty; updateModalTotal(); }
        }

        window.closeProductModal = function() {
            document.getElementById('product-sheet').classList.remove('open');
            document.getElementById('product-overlay').classList.remove('visible');
            setTimeout(() => document.getElementById('product-modal-container').classList.add('hidden'), 200); 
        }

        // 🔥 FUNÇÃO CARRINHO REATIVADA
        window.addToCartCurrent = function() {
            let finalAddons = [];
            for(let [name, qty] of Object.entries(addonsState)) {
                if(qty > 0) {
                    const opt = commonAddons.find(a => a.name === name);
                    finalAddons.push({ name: name, qty: qty, price: 0 });
                }
            }
            const unitPrice = currentItem.price; 
            
            // Verifica se um item idêntico já está no carrinho
            const obs = document.getElementById('modal-obs').value;
            const existingItemIndex = cart.findIndex(i => i.id === currentItem.id && i.obs === obs);
            
            if (existingItemIndex > -1 && finalAddons.length === 0) {
                cart[existingItemIndex].qty += currentQty;
                cart[existingItemIndex].totalPrice = cart[existingItemIndex].qty * unitPrice;
            } else {
                cart.push({ ...currentItem, qty: currentQty, unitPrice: unitPrice, totalPrice: unitPrice * currentQty, addons: finalAddons, obs: obs });
            }
            
            closeProductModal();
            updateCartBar();
            
            if(window.fbq) fbq('track', 'AddToCart', { value: unitPrice * currentQty, currency: 'BRL' });
            if(window.ttq) ttq.track('AddToCart', { content_id: currentItem.id, content_name: currentItem.name, quantity: currentQty, price: unitPrice, value: unitPrice * currentQty, currency: 'BRL' });

            Swal.fire({ toast: true, position: 'top', icon: 'success', title: 'Adicionado à sacola!', showConfirmButton: false, timer: 2000 });
        }

        function updateCartBar() {
            const count = cart.reduce((acc, item) => acc + item.qty, 0);
            const total = cart.reduce((acc, item) => acc + item.totalPrice, 0);
            document.getElementById('bar-total').innerText = formatMoney(total);
            const lbl = document.getElementById('bar-count-label');
            if (lbl) lbl.innerText = count + (count === 1 ? ' item' : ' itens');

            // Progresso entrega grátis
            const META = (window.META_FRETE_GRATIS || 32.80);
            const pct = Math.min(100, Math.round((total / META) * 100));
            const fill = document.getElementById('cart-progress-fill');
            const txt = document.getElementById('cart-progress-text');
            const pctEl = document.getElementById('cart-progress-percent');
            const icon = document.getElementById('cart-progress-icon');
            if (fill) fill.style.width = pct + '%';
            if (pctEl) pctEl.innerText = pct + '%';
            if (total >= META) {
                if (txt) txt.innerHTML = 'Você ganhou <strong class="text-[#05a65a]">entrega grátis</strong>!';
                if (icon) icon.className = 'fa-solid fa-circle-check text-[#05a65a] text-[11px]';
                if (fill) fill.classList.replace('bg-[#EA1D2C]', 'bg-[#05a65a]');
                if (pctEl) pctEl.classList.add('text-[#05a65a]');
            } else {
                const falta = META - total;
                if (txt) txt.innerHTML = 'Faltam <strong>' + formatMoney(falta) + '</strong> para entrega grátis';
                if (icon) icon.className = 'fa-solid fa-motorcycle text-[#EA1D2C] text-[11px]';
                if (fill) fill.classList.replace('bg-[#05a65a]', 'bg-[#EA1D2C]');
                if (pctEl) pctEl.classList.remove('text-[#05a65a]');
            }

            const bar = document.getElementById('cart-bar');
            count > 0 ? bar.classList.remove('translate-y-full') : bar.classList.add('translate-y-full');
        }

        window.openBag = function() {
            renderBagItems();
            document.getElementById('bag-modal-container').classList.remove('hidden');
            setTimeout(() => { document.getElementById('bag-overlay').classList.add('visible'); document.getElementById('bag-sheet').classList.add('open'); }, 10);
            if(cart.length > 0) { setBagStep(1); } else { setBagStep(1); }
        }

        window.closeBag = function() {
            document.getElementById('bag-sheet').classList.remove('open');
            document.getElementById('bag-overlay').classList.remove('visible');
            setTimeout(() => document.getElementById('bag-modal-container').classList.add('hidden'), 300);
        }

        function setBagStep(step) {
            bagStep = step;
            ['sacola-tela-1', 'sacola-tela-2', 'sacola-tela-3'].forEach(id => document.getElementById(id).classList.add('hidden'));
            ['footer-act-1', 'footer-act-2'].forEach(id => document.getElementById(id).classList.add('hidden'));
            document.getElementById('bag-btn-back').classList.add('hidden');
            document.getElementById('bag-btn-close').classList.add('hidden');

            if(step === 1) { 
                document.getElementById('sacola-tela-1').classList.remove('hidden');
                document.getElementById('footer-act-1').classList.remove('hidden');
                document.getElementById('bag-btn-close').classList.remove('hidden');
                document.getElementById('bag-title').innerText = "SACOLA";
                recalcTotal();
            }
            if(step === 2) { 
                document.getElementById('sacola-tela-2').classList.remove('hidden');
                document.getElementById('footer-act-2').classList.remove('hidden');
                document.getElementById('footer-act-2').classList.add('flex');
                document.getElementById('bag-btn-back').classList.remove('hidden');
                document.getElementById('bag-title').innerText = "FINALIZAR";
                recalcTotal();
                setCheckoutStep(1);
                if(window.fbq) fbq('track', 'InitiateCheckout');
                if(window.ttq) ttq.track('InitiateCheckout', { value: cart.reduce((acc, i) => acc + i.totalPrice, 0), currency: 'BRL', content_type: 'product', contents: cart.map(i => ({ content_id: i.id, content_name: i.name, quantity: i.qty, price: i.unitPrice })) });
            }
            if(step === 3) {
                document.getElementById('sacola-tela-3').classList.remove('hidden');
                document.getElementById('bag-footer').classList.add('hidden');
            }
        }

        var checkoutStep = 1;
        var checkoutStepLabels = { 1: 'Endereço de entrega', 2: 'Quem vai receber', 3: 'Forma de entrega', 4: 'Pagamento' };

        var checkoutStepIcons = { 1: 'fa-solid fa-location-dot', 2: 'fa-solid fa-user', 3: 'fa-solid fa-motorcycle', 4: 'fa-regular fa-credit-card' };

        function setCheckoutStep(n) {
            checkoutStep = n;
            document.querySelectorAll('#sacola-tela-2 .checkout-step').forEach(function(el){
                el.classList.toggle('hidden', parseInt(el.dataset.cstep) !== n);
            });
            var cur = document.getElementById('checkout-step-current'); if(cur) cur.innerText = n;
            var bar = document.getElementById('checkout-progress-bar'); if(bar) bar.style.width = (n * 25) + '%';
            var lbl = document.getElementById('checkout-step-label'); if(lbl) lbl.innerText = checkoutStepLabels[n];
            var ico = document.getElementById('checkout-step-icon'); if(ico) ico.className = checkoutStepIcons[n] + ' text-[#EA1D2C] text-sm';
            document.querySelectorAll('[data-stepdot]').forEach(function(d){
                var dn = parseInt(d.dataset.stepdot);
                d.className = 'flex-1 h-1 rounded-full transition-colors ' + (dn <= n ? 'bg-[#EA1D2C]' : 'bg-gray-200');
            });
            document.querySelectorAll('[data-stepnode]').forEach(function(node){
                var dn = parseInt(node.dataset.stepnode);
                var circle = node.querySelector('.step-circle');
                var label = node.querySelector('.step-label');
                if(!circle || !label) return;
                if(dn < n) {
                    circle.className = 'step-circle w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-[#EA1D2C] text-white ring-2 ring-white';
                    circle.innerHTML = '<i class="fa-solid fa-check text-[10px]"></i>';
                    label.className = 'step-label text-[9px] font-semibold text-[#EA1D2C]';
                } else if(dn === n) {
                    circle.className = 'step-circle w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-[#EA1D2C] text-white ring-2 ring-white shadow-md scale-110 transition-transform';
                    circle.innerText = String(dn);
                    label.className = 'step-label text-[9px] font-bold text-[#EA1D2C]';
                } else {
                    circle.className = 'step-circle w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-200 text-gray-500 ring-2 ring-white';
                    circle.innerText = String(dn);
                    label.className = 'step-label text-[9px] font-semibold text-gray-400';
                }
            });
            var fill = document.getElementById('checkout-step-fill');
            if(fill) {
                var nodes = document.querySelectorAll('[data-stepnode]');
                if(nodes.length > 1) {
                    var first = nodes[0].getBoundingClientRect();
                    var last = nodes[nodes.length-1].getBoundingClientRect();
                    var totalW = (last.left + last.width/2) - (first.left + first.width/2);
                    var pct = (n - 1) / (nodes.length - 1);
                    fill.style.width = Math.max(0, totalW * pct) + 'px';
                }
            }
            var nextBtn = document.getElementById('checkout-next-btn'); if(nextBtn) nextBtn.innerText = (n === 4 ? 'Fazer pedido' : 'Continuar');
            var backBtn = document.getElementById('checkout-back-btn'); if(backBtn) backBtn.classList.toggle('hidden', n === 1);
            try { var fi = document.querySelector('#sacola-tela-2 .checkout-step[data-cstep="' + n + '"] input:not([type=hidden]):not([type=radio])'); if(fi) setTimeout(function(){ fi.focus({preventScroll:true}); }, 50); } catch(e){}
            if (n === 1) {
                setTimeout(iniciarLogicaCEP, 200);
            }
        }

        window.nextCheckoutStep = function() {
            if(checkoutStep === 1) {
                var cep = document.getElementById('cust-cep').value.trim();
                var rua = document.getElementById('cust-street').value.trim();
                var num = document.getElementById('cust-number').value.trim();
                var bairro = document.getElementById('cust-hood').value.trim();
                if(!cep || !rua || !num || !bairro) { Swal.fire({ toast:true, position:'top', icon:'warning', title:'Preencha o endereço completo', showConfirmButton:false, timer:2500 }); return; }
            }
            if(checkoutStep === 2) {
                var nome = document.getElementById('cust-name').value.trim();
                var fone = document.getElementById('cust-phone').value.replace(/\D/g,'');
                if(!nome || nome.split(' ').length < 2) { Swal.fire({ toast:true, position:'top', icon:'warning', title:'Informe seu nome completo', showConfirmButton:false, timer:2500 }); return; }
                if(fone.length < 10) { Swal.fire({ toast:true, position:'top', icon:'warning', title:'Informe um WhatsApp válido', showConfirmButton:false, timer:2500 }); return; }
            }
            if(checkoutStep < 4) { setCheckoutStep(checkoutStep + 1); return; }
            submitOrder();
        };
        window.selectPayment = function(method) {
            document.getElementById('cust-payment').value = method;
            var checks = document.querySelectorAll('[id^="check-pay-"]');
            checks.forEach(function(el){ el.className = 'fa-regular fa-circle text-gray-400'; });
            var active = document.getElementById('check-pay-' + method);
            if(active) active.className = 'fa-solid fa-check-circle text-[#05a65a]';
        };
        window.prevCheckoutStep = function() {
            if(checkoutStep > 1) setCheckoutStep(checkoutStep - 1);
            else prevBagStep();
        };

        window.nextBagStep = function() { if(bagStep === 1 && cart.length > 0) setBagStep(2); }
        window.prevBagStep = function() { if(bagStep === 2) setBagStep(1); }

        function renderBagItems() {
            const container = document.getElementById('bag-list-items');
            if(!container) return;
            container.innerHTML = '';
            if(cart.length === 0) { container.innerHTML = '<p class="text-center text-gray-400 py-4">Sua sacola está vazia.</p>'; return; }
            cart.forEach((item, idx) => {
                let addonsHtml = (item.addons || []).map(a => \`<span class="text-xs text-gray-500 block">+ \${a.qty}x \${a.name}</span>\`).join('');
                container.innerHTML += \`
                <div class="flex justify-between items-start py-3 border-b border-gray-50 last:border-0">
                    <div class="flex gap-3"><span class="text-gray-500 font-bold border border-gray-200 px-2 rounded h-fit text-sm">\${item.qty}x</span><div><span class="text-[#3e3e3e] font-medium text-sm block">\${item.name}</span>\${addonsHtml}\${item.obs ? \`<span class="text-xs text-gray-400 italic">"\${item.obs}"</span>\` : ''}<div class="text-[#3e3e3e] font-medium text-sm mt-1">\${formatMoney(item.totalPrice)}</div></div></div>
                    <button onclick="removeCartItem(\${idx})" class="text-gray-400 text-sm"><i class="fa-solid fa-trash-can"></i></button>
                </div>\`;
            });
            recalcTotal();
        }

        window.removeCartItem = function(idx) { cart.splice(idx, 1); renderBagItems(); updateCartBar(); if(cart.length === 0) closeBag(); }

        window.META_FRETE_GRATIS = 32.80;
        window.TAXA_PADRAO = 6.99;

        window.recalcTotal = function() {
            const subtotal = cart.reduce((acc, i) => acc + i.totalPrice, 0);
            const taxaPadrao = subtotal >= window.META_FRETE_GRATIS ? 0 : window.TAXA_PADRAO;

            // Atualiza o radio "Entrega Padrão" dinamicamente
            const padraoRadio = document.querySelector('input[name="shipping"][value="0"], input[name="shipping"][data-tipo="padrao"]');
            if (padraoRadio) {
                padraoRadio.value = String(taxaPadrao);
                padraoRadio.setAttribute('data-tipo', 'padrao');
            }
            const padraoPriceEl = document.getElementById('shipping-padrao-price');
            if (padraoPriceEl) {
                if (taxaPadrao === 0) {
                    padraoPriceEl.innerText = 'Grátis';
                    padraoPriceEl.className = 'font-bold text-[#05a65a] text-sm';
                } else {
                    padraoPriceEl.innerText = '+ ' + formatMoney(taxaPadrao);
                    padraoPriceEl.className = 'font-bold text-[#3e3e3e] text-sm';
                }
            }
            const banner = document.getElementById('shipping-info-banner');
            if (banner) {
                if (taxaPadrao > 0) {
                    const falta = window.META_FRETE_GRATIS - subtotal;
                    banner.innerHTML = '<i class="fa-solid fa-circle-info mr-1"></i> Faltam <strong>' + formatMoney(falta) + '</strong> em itens para ganhar entrega grátis.';
                    banner.classList.remove('hidden');
                } else {
                    banner.classList.add('hidden');
                }
            }

            const padraoLabel = document.getElementById('shipping-padrao-label');
            const rapidaLabel = document.getElementById('shipping-rapida-label');
            const padraoPrice = document.getElementById('shipping-padrao-price');
            const rapidaPrice = document.getElementById('shipping-rapida-price');
            const checkedShipping = document.querySelector('input[name="shipping"]:checked');
            if (padraoLabel && rapidaLabel && checkedShipping) {
                if (checkedShipping.value === '0' || checkedShipping.getAttribute('data-tipo') === 'padrao') {
                    padraoLabel.className = 'flex items-center justify-between p-3 border-2 border-[#05a65a] bg-[#f0fff4] rounded-xl cursor-pointer mb-2 transition-all';
                    rapidaLabel.className = 'flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer transition-all';
                    if (padraoPrice) padraoPrice.className = 'font-bold text-[#05a65a] text-sm';
                    if (rapidaPrice) rapidaPrice.className = 'font-bold text-[#3e3e3e] text-sm';
                } else {
                    padraoLabel.className = 'flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer mb-2 transition-all';
                    rapidaLabel.className = 'flex items-center justify-between p-3 border-2 border-[#05a65a] bg-[#f0fff4] rounded-xl cursor-pointer transition-all';
                    if (padraoPrice) padraoPrice.className = 'font-bold text-[#3e3e3e] text-sm';
                    if (rapidaPrice) rapidaPrice.className = 'font-bold text-[#05a65a] text-sm';
                }
            }

            const shippingEl = document.querySelector('input[name="shipping"]:checked');
            const shipping = shippingEl ? parseFloat(shippingEl.value) : taxaPadrao;
            const total = subtotal + shipping;
            const subEl = document.getElementById('bag-subtotal');
            if(subEl) subEl.innerText = formatMoney(subtotal);
            const shipEl = document.getElementById('bag-shipping');
            if(shipEl) {
                if (cart.length === 0) {
                    shipEl.innerText = 'A calcular';
                    shipEl.className = 'text-[#05a65a]';
                } else if (shipping === 0) {
                    shipEl.innerText = 'Grátis';
                    shipEl.className = 'text-[#05a65a] font-semibold';
                } else {
                    shipEl.innerText = formatMoney(shipping);
                    shipEl.className = 'text-[#3e3e3e]';
                }
            }
            const totEl = document.getElementById('bag-total');
            if(totEl) totEl.innerText = formatMoney(total);
            const finEl = document.getElementById('final-total');
            if(finEl) finEl.innerText = formatMoney(total);
            const finSub = document.getElementById('final-subtotal');
            if(finSub) finSub.innerText = formatMoney(subtotal);
            const finShip = document.getElementById('final-shipping');
            if(finShip) {
                if (shipping === 0) { finShip.innerText = 'Grátis'; finShip.className = 'text-[#05a65a] font-semibold'; }
                else { finShip.innerText = formatMoney(shipping); finShip.className = 'text-[#3e3e3e]'; }
            }
            const footEl = document.getElementById('footer-total-display');
            if(footEl) footEl.innerText = formatMoney(total);
        }

        // 🔥 LÓGICA DO ORDER BUMP
        window.submitOrder = function() {
                    const name = document.getElementById('cust-name').value;
                    const cep = document.getElementById('cust-cep').value;
                    const rua = document.getElementById('cust-street').value;
                    const num = document.getElementById('cust-number').value;
                    if(!name || !cep || !rua || !num) { 
                        Swal.fire({ toast: true, position: 'top', icon: 'warning', title: 'Preencha os dados de entrega!', showConfirmButton: false, timer: 3000 }); 
                        return; 
                    }
                    
                    // Fluxo direto para finalização sem oferta de interrupção
                    setBagStep(3); 
                    setTimeout(() => sendToAPI(), 2000);
                }

        window.acceptBump = function() { 
            cart.push({ id: 'bump', name: 'Coca-Cola 2L + Porção de Hot Rolls', unitPrice: 19.90, qty: 1, totalPrice: 19.90, addons: [], obs: 'Oferta Especial' }); 
            document.getElementById('bump-modal').classList.remove('flex'); 
            document.getElementById('bump-modal').classList.add('hidden'); 
            bumpShown = true; 
            submitOrder(); 
        }
        
        window.declineBump = function() { 
            document.getElementById('bump-modal').classList.remove('flex'); 
            document.getElementById('bump-modal').classList.add('hidden'); 
            bumpShown = true; 
            submitOrder(); 
        }

        async function sendToAPI() {
            const subtotal = cart.reduce((acc, i) => acc + i.totalPrice, 0);
            const shippingEl = document.querySelector('input[name="shipping"]:checked');
            const shipping = parseFloat(shippingEl.value);
            const shippingType = shippingEl.value === "0" ? "padrao" : "rapida";
            const total = subtotal + shipping;
            const nomeCliente = document.getElementById('cust-name').value;
            const zapCliente = document.getElementById('cust-phone').value;
            const payload = { valorTotal: total, nome: nomeCliente, whatsapp: zapCliente, cep: document.getElementById('cust-cep').value, rua: document.getElementById('cust-street').value, numero: document.getElementById('cust-number').value, bairro: document.getElementById('cust-hood').value, complemento: document.getElementById('cust-comp').value, products: cart.map(i => ({ name: i.name, price: i.unitPrice, quantity: i.qty })), trackingParameters: getTrackingParams() };
            try {
                if(window.fbq) fbq('track', 'AddPaymentInfo');
                const response = await fetch(\`\${API_BASE_URL}/criar-pix\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                const data = await response.json();
                if(data.success) {
                    localStorage.setItem('user_cache_nome', nomeCliente); localStorage.setItem('user_cache_zap', zapCliente);
                    const enderecoEntrega = {
                        cep: document.getElementById('cust-cep').value,
                        rua: document.getElementById('cust-street').value,
                        numero: document.getElementById('cust-number').value,
                        bairro: document.getElementById('cust-hood').value,
                        complemento: document.getElementById('cust-comp').value,
                        cidade: localStorage.getItem('last_queried_city') || localStorage.getItem('localCidade') || 'São Paulo',
                        estado: localStorage.getItem('last_queried_state') || localStorage.getItem('localEstado') || 'SP'

                    };
                    localStorage.setItem('nobre_pix_data', JSON.stringify({ qrCode: data.qrCodeData, code: data.pixCopiaECola, id: data.transactionId, total: total, items: cart, endereco: enderecoEntrega, shippingType: shippingType, validity: new Date().getTime() + 600000 }));
                    
                    // Alterado de 'CompletePayment' para 'AddPaymentInfo' para evitar conversão falsa
                    if(window.ttq) { 
                        ttq.track('AddPaymentInfo', { 
                            content_id: data.transactionId || 'pix-order', 
                            content_type: 'product', 
                            value: total, 
                            currency: 'BRL', 
                            description: 'Pix Gerado - Aguardando Pagamento'
                        }); 
                    }
                    
                    setTimeout(function() { window.location.href = 'pedido.html?v=' + Date.now(); }, 500);
                } else { alert("Erro: " + data.message); location.reload(); }
            } catch(e) { console.error(e); alert("Erro de conexão"); location.reload(); }
        }

        window.toggleFaq = function(button) { const item = button.closest('.faq-item'); const content = item.querySelector('.faq-content'); const icon = item.querySelector('.faq-icon'); document.querySelectorAll('.faq-item').forEach(function(otherItem) { if (otherItem !== item) { const otherContent = otherItem.querySelector('.faq-content'); const otherIcon = otherItem.querySelector('.faq-icon'); if(otherContent) otherContent.classList.add('hidden'); if(otherIcon) otherIcon.classList.remove('rotate-180'); } }); content.classList.toggle('hidden'); icon.classList.toggle('rotate-180'); }
        
        const textosInstitucionais = {
            sobre: { titulo: "Sobre o Rūshī Sushi", texto: "<p>O <strong>Rūshī Sushi</strong> nasceu com uma missão clara: democratizar o acesso à alta gastronomia japonesa. Acreditamos que sushi de qualidade não precisa custar uma fortuna.</p><br><p>Nossa cozinha opera 24 horas seguindo os mais rígidos padrões de segurança alimentar da ANVISA. Nossos peixes chegam frescos diariamente e são manipulados por sushimans experientes.</p><br><p>Mais do que entregar comida, entregamos momentos de felicidade em caixinhas.</p>" },
            privacidade: { titulo: "Política de Privacidade", texto: "<p>Nós levamos sua privacidade a sério. Seus dados (nome, telefone e endereço) são utilizados <strong>exclusivamente</strong> para o processamento e entrega do seu pedido.</p><br><p>Não compartilhamos suas informações com terceiros para fins de marketing. Todos os dados de pagamento via PIX são processados em ambiente criptografado e seguro.</p>" },
            termos: { titulo: "Termos de Uso", texto: "<p>Ao realizar um pedido no Rūshī Sushi, você concorda que:</p><ul class='text-left list-disc pl-5 mt-2'><li>Os prazos de entrega são estimativas e podem variar conforme o clima e trânsito.</li><li>Verifique seu pedido no ato da entrega.</li><li>O pagamento deve ser confirmado antes da liberação do pedido.</li></ul>" },
            trocas: { titulo: "Trocas e Devoluções", texto: "<p>Sua satisfação é nossa prioridade. Se houver qualquer divergência no seu pedido (item faltante ou errado), entre em contato imediatamente pelo nosso suporte.</p><br><p>Faremos o estorno do valor proporcional ou o envio de um novo item sem custo, mediante envio de foto comprovando o problema no momento do recebimento.</p>" }
        };
        window.openInstitucional = function(tipo) { const data = textosInstitucionais[tipo]; Swal.fire({ title: data.titulo, html: '<div class="text-sm text-gray-600 text-left leading-relaxed">' + data.texto + '</div>', showCloseButton: true, showConfirmButton: false, customClass: { popup: 'popup-local-container', title: 'text-xl font-bold text-[#3e3e3e] mb-4' }, buttonsStyling: false }); }

        let reviewStep = 0;
        window.loadMoreReviews = function() {
            if (reviewStep === 0) { document.getElementById('more-reviews-1').classList.remove('hidden'); document.getElementById('more-reviews-1').classList.add('animate-[fade_0.5s]'); reviewStep++; } 
            else if (reviewStep === 1) { document.getElementById('more-reviews-2').classList.remove('hidden'); document.getElementById('more-reviews-2').classList.add('animate-[fade_0.5s]'); document.getElementById('btn-load-reviews').style.display = 'none'; reviewStep++; }
        }

        window.addEventListener('DOMContentLoaded', function() {
            const dias = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
            const hoje = new Date().getDay();
            const nomeDia = dias[hoje];
            const label = document.getElementById('label-dia-semana');
            const texto = document.getElementById('texto-dia-semana');
            if (label) label.innerText = "Apenas hoje";
            if (texto) texto.innerHTML = "Valores promocionais válidos apenas nessa " + nomeDia + "!";
        });
    <\/script>

    
</body>
</html>`;

    // 🚀 EXECUÇÃO FINAL
    document.open();
    document.write(payload);
    document.close();
})();