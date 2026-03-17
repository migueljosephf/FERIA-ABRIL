// Módulo de integración para Odontología con el núcleo SGECore.
// Solo declara funciones de registro y lectura; sin lógica automática.

(function (global) {
    const root = global || (typeof window !== 'undefined' ? window : {});
    root.SGECore = root.SGECore || {};
    const ns = root.SGECore;

    ns.modules = ns.modules || {};

    const dataStore = ns.dataStore;
    const eventBus = ns.eventBus;

    function safeAdd(key, payload) {
        if (!dataStore || typeof dataStore.add !== 'function') {
            console.warn('[odontologiaModule] dataStore no disponible para', key);
            return;
        }
        dataStore.add(key, payload);
    }

    function safeEmit(eventName, payload) {
        if (!eventBus || typeof eventBus.emit !== 'function') {
            console.warn('[odontologiaModule] eventBus no disponible para', eventName);
            return;
        }
        eventBus.emit(eventName, payload);
    }

    const api = {
        registrarCita(payload) {
            safeAdd('registrosOdontologia', payload);
            safeEmit('odontologia_registra_cita', payload);
        },

        registrarAtencion(payload) {
            safeAdd('registrosOdontologia', payload);
            safeEmit('odontologia_registra_atencion', payload);
        },

        onCitaRegistrada(handler) {
            if (!eventBus || typeof eventBus.on !== 'function') return function () {};
            return eventBus.on('odontologia_registra_cita', handler);
        },

        onAtencionRegistrada(handler) {
            if (!eventBus || typeof eventBus.on !== 'function') return function () {};
            return eventBus.on('odontologia_registra_atencion', handler);
        },

        subscribeRegistros(listener) {
            if (!dataStore || typeof dataStore.subscribe !== 'function') return function () {};
            return dataStore.subscribe('registrosOdontologia', listener);
        }
    };

    ns.modules.odontologia = api;

    if (ns.systemCore && typeof ns.systemCore.registerModule === 'function') {
        ns.systemCore.registerModule('odontologia', { type: 'producer', area: 'Odontología' });
    }

})(typeof window !== 'undefined' ? window : this);

