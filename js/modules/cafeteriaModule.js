// Módulo de integración para Cafetería con el núcleo SGECore.
// Maneja registro de ventas y reportes; no toca el DOM.

(function (global) {
    const root = global || (typeof window !== 'undefined' ? window : {});
    root.SGECore = root.SGECore || {};
    const ns = root.SGECore;

    ns.modules = ns.modules || {};

    const dataStore = ns.dataStore;
    const eventBus = ns.eventBus;

    function safeAdd(key, payload) {
        if (!dataStore || typeof dataStore.add !== 'function') {
            console.warn('[cafeteriaModule] dataStore no disponible para', key);
            return;
        }
        dataStore.add(key, payload);
    }

    function safeEmit(eventName, payload) {
        if (!eventBus || typeof eventBus.emit !== 'function') {
            console.warn('[cafeteriaModule] eventBus no disponible para', eventName);
            return;
        }
        eventBus.emit(eventName, payload);
    }

    const api = {
        registrarVenta(payload) {
            safeAdd('reportesCafeteria', payload);
            safeEmit('cafeteria_registra_venta', payload);
        },

        registrarCierreCaja(payload) {
            safeAdd('reportesCafeteria', payload);
            safeEmit('cafeteria_cierre_caja', payload);
        },

        onVentaRegistrada(handler) {
            if (!eventBus || typeof eventBus.on !== 'function') return function () {};
            return eventBus.on('cafeteria_registra_venta', handler);
        },

        onCierreCaja(handler) {
            if (!eventBus || typeof eventBus.on !== 'function') return function () {};
            return eventBus.on('cafeteria_cierre_caja', handler);
        },

        subscribeReportes(listener) {
            if (!dataStore || typeof dataStore.subscribe !== 'function') return function () {};
            return dataStore.subscribe('reportesCafeteria', listener);
        }
    };

    ns.modules.cafeteria = api;

    if (ns.systemCore && typeof ns.systemCore.registerModule === 'function') {
        ns.systemCore.registerModule('cafeteria', { type: 'producer', area: 'Cafetería' });
    }

})(typeof window !== 'undefined' ? window : this);

