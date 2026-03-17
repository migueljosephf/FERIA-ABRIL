// Módulo de integración para Enfermería con el núcleo SGECore.
// No realiza operaciones automáticas ni modifica el DOM.

(function (global) {
    const root = global || (typeof window !== 'undefined' ? window : {});
    root.SGECore = root.SGECore || {};
    const ns = root.SGECore;

    ns.modules = ns.modules || {};

    const dataStore = ns.dataStore;
    const eventBus = ns.eventBus;

    function safeAdd(key, payload) {
        if (!dataStore || typeof dataStore.add !== 'function') {
            console.warn('[enfermeriaModule] dataStore no disponible para', key);
            return;
        }
        dataStore.add(key, payload);
    }

    function safeEmit(eventName, payload) {
        if (!eventBus || typeof eventBus.emit !== 'function') {
            console.warn('[enfermeriaModule] eventBus no disponible para', eventName);
            return;
        }
        eventBus.emit(eventName, payload);
    }

    const api = {
        registrarAlertaRecibida(payload) {
            safeAdd('reportesEnfermeria', payload);
            safeEmit('enfermeria_recibe_alerta', payload);
        },

        enviarReporteDireccion(payload) {
            safeAdd('reportesEnfermeria', payload);
            safeEmit('enfermeria_envia_reporte', payload);
        },

        onAlertaRecibida(handler) {
            if (!eventBus || typeof eventBus.on !== 'function') return function () {};
            return eventBus.on('enfermeria_recibe_alerta', handler);
        },

        onReporteEnviado(handler) {
            if (!eventBus || typeof eventBus.on !== 'function') return function () {};
            return eventBus.on('enfermeria_envia_reporte', handler);
        },

        subscribeReportes(listener) {
            if (!dataStore || typeof dataStore.subscribe !== 'function') return function () {};
            return dataStore.subscribe('reportesEnfermeria', listener);
        }
    };

    ns.modules.enfermeria = api;

    if (ns.systemCore && typeof ns.systemCore.registerModule === 'function') {
        ns.systemCore.registerModule('enfermeria', { type: 'producer_consumer', area: 'Enfermería' });
    }

})(typeof window !== 'undefined' ? window : this);

