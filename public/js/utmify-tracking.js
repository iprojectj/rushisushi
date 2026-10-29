/**
 * UTMify Tracking - Frontend Integration
 * Documentação: https://docs.google.com/document/d/1RVpbmUn8EaD7DcO4rNdAnG0T9VEI0qQeGzqTE8t2AAE/edit
 */

class UTMifyTracker {
    constructor() {
        this.trackingParams = this.getTrackingParams();
        this.orderId = null;
        this.customer = null;
        this.order = null;
        this.apiKey = 'CnLVH7UAgf5Zi3tljtwDTx8FDQCAvH8vG4h8';
    }
    
    /**
     * Capturar parâmetros UTM da URL
     */
    getTrackingParams() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            utm_source: urlParams.get('utm_source'),
            utm_medium: urlParams.get('utm_medium'),
            utm_campaign: urlParams.get('utm_campaign'),
            utm_content: urlParams.get('utm_content'),
            utm_term: urlParams.get('utm_term')
        };
    }
    
    /**
     * Salvar parâmetros UTM no localStorage
     */
    saveTrackingParams() {
        if (Object.values(this.trackingParams).some(param => param !== null)) {
            localStorage.setItem('utmify_tracking', JSON.stringify(this.trackingParams));
            console.log('UTMify: Parâmetros salvos:', this.trackingParams);
        }
    }
    
    /**
     * Recuperar parâmetros UTM do localStorage
     */
    getSavedTrackingParams() {
        const saved = localStorage.getItem('utmify_tracking');
        return saved ? JSON.parse(saved) : {};
    }
    
    /**
     * Enviar evento para tracking
     */
    async trackEvent(eventType, data = {}) {
        try {
            const trackingData = {
                event_type: eventType,
                order_id: this.orderId,
                customer: this.customer,
                order: this.order,
                utm_params: this.getSavedTrackingParams(),
                api_key: this.apiKey,
                ...data
            };
            
            console.log('UTMify: Enviando evento:', eventType, trackingData);
            
            // Verificar se estamos em ambiente local (file://) ou servidor
            const isLocal = window.location.protocol === 'file:';
            
            if (isLocal) {
                // Em ambiente local, apenas logar o evento
                console.log('UTMify: [MODO LOCAL] Evento registrado:', eventType, trackingData);
                return true;
            }
            
            const response = await fetch('utmify/track_event.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(trackingData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('UTMify: Evento registrado:', eventType);
            } else {
                console.error('UTMify: Erro ao registrar evento:', result.error);
            }
            
            return result.success;
            
        } catch (error) {
            // Em caso de erro, apenas logar em modo local
            const isLocal = window.location.protocol === 'file:';
            if (isLocal) {
                console.log('UTMify: [MODO LOCAL] Evento registrado (offline):', eventType);
                return true;
            }
            
            console.error('UTMify: Erro na requisição:', error);
            return false;
        }
    }
    
    /**
     * Definir dados do pedido
     */
    setOrderData(orderId, customer, order) {
        this.orderId = orderId;
        this.customer = customer;
        this.order = order;
    }
    
    /**
     * Tracking de visualização da página
     */
    trackPageView() {
        this.saveTrackingParams();
        this.trackEvent('page_view');
    }
    
    /**
     * Tracking de início do formulário
     */
    trackFormStart() {
        this.trackEvent('form_start');
    }
    
    /**
     * Tracking de formulário concluído
     */
    trackFormComplete() {
        this.trackEvent('form_complete');
    }
    
    /**
     * Tracking de PIX gerado
     */
    trackPixGenerated(orderId, customer, order) {
        this.setOrderData(orderId, customer, order);
        this.trackEvent('pix_generated');
    }
    
    /**
     * Tracking de pagamento aprovado
     */
    trackPaymentApproved(orderId, customer, order) {
        this.setOrderData(orderId, customer, order);
        this.trackEvent('payment_approved');
    }
    
    /**
     * Tracking de PIX expirado
     */
    trackPaymentExpired() {
        this.trackEvent('payment_expired');
    }
    
    /**
     * Tracking de cópia do PIX
     */
    trackCopyPix() {
        this.trackEvent('copy_pix');
    }
    
    /**
     * Tracking de compartilhamento
     */
    trackSharePayment() {
        this.trackEvent('share_payment');
    }
    
    /**
     * Testar conexão com UTMify
     */
    async testConnection() {
        try {
            // Verificar se estamos em ambiente local
            const isLocal = window.location.protocol === 'file:';
            
            if (isLocal) {
                console.log('UTMify: [MODO LOCAL] Teste de conexão simulado - OK');
                return true;
            }
            
            const response = await fetch('utmify/test_connection.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    api_key: this.apiKey
                })
            });
            
            const result = await response.json();
            console.log('UTMify: Teste de conexão:', result);
            return result.success;
            
        } catch (error) {
            // Em ambiente local, simular sucesso
            const isLocal = window.location.protocol === 'file:';
            if (isLocal) {
                console.log('UTMify: [MODO LOCAL] Teste de conexão simulado - OK (offline)');
                return true;
            }
            
            console.error('UTMify: Erro no teste de conexão:', error);
            return false;
        }
    }
}

// Instância global
window.utmifyTracker = new UTMifyTracker();

// Auto-inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Salvar parâmetros UTM ao carregar a página
    window.utmifyTracker.saveTrackingParams();
    
    // Tracking de visualização da página
    window.utmifyTracker.trackPageView();
    
    // Verificar ambiente
    const isLocal = window.location.protocol === 'file:';
    if (isLocal) {
        console.log('UTMify: [MODO LOCAL] Tracking inicializado - eventos serão logados no console');
        console.log('UTMify: [MODO LOCAL] Para tracking real, hospede o site em um servidor PHP');
    } else {
        console.log('UTMify: Tracking inicializado com credencial CnLVH7UAgf5Zi3tljtwDTx8FDQCAvH8vG4h8');
    }
});
