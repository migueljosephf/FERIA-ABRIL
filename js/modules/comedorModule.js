// Módulo de integración para Comedor con el núcleo SGECore.
// Solo define funciones para registrar y leer datos del comedor.

(function (global) {
    const root = global || (typeof window !== 'undefined' ? window : {});
    root.SGECore = root.SGECore || {};
    const ns = root.SGECore;

    ns.modules = ns.modules || {};

    const dataStore = ns.dataStore;
    const eventBus = ns.eventBus;

    function safeAdd(key, payload) {
        if (!dataStore || typeof dataStore.add !== 'function') {
            console.warn('[comedorModule] dataStore no disponible para', key);
            return;
        }
        dataStore.add(key, payload);
    }

    function safeEmit(eventName, payload) {
        if (!eventBus || typeof eventBus.emit !== 'function') {
            console.warn('[comedorModule] eventBus no disponible para', eventName);
            return;
        }
        eventBus.emit(eventName, payload);
    }

    const api = {
        registrarServicio(payload) {
            safeAdd('datosComedor', payload);
            safeEmit('comedor_actualiza_datos', payload);
        },

        onDatosActualizados(handler) {
            if (!eventBus || typeof eventBus.on !== 'function') return function () {};
            return eventBus.on('comedor_actualiza_datos', handler);
        },

        subscribeDatos(listener) {
            if (!dataStore || typeof dataStore.subscribe !== 'function') return function () {};
            return dataStore.subscribe('datosComedor', listener);
        }
    };

    ns.modules.comedor = api;

    if (ns.systemCore && typeof ns.systemCore.registerModule === 'function') {
        ns.systemCore.registerModule('comedor', { type: 'producer_consumer', area: 'Comedor' });
    }

})(typeof window !== 'undefined' ? window : this);

