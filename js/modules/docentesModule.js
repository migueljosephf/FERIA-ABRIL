// Módulo de integración para Docentes con el núcleo SGECore.
// No modifica el DOM ni ejecuta lógica automáticamente.

(function (global) {
    const root = global || (typeof window !== 'undefined' ? window : {});
    root.SGECore = root.SGECore || {};
    const ns = root.SGECore;

    ns.modules = ns.modules || {};

    const dataStore = ns.dataStore;
    const eventBus = ns.eventBus;

    function safeAdd(key, payload) {
        if (!dataStore || typeof dataStore.add !== 'function') {
            console.warn('[docentesModule] dataStore no disponible para', key);
            return;
        }
        dataStore.add(key, payload);
    }

    function safeEmit(eventName, payload) {
        if (!eventBus || typeof eventBus.emit !== 'function') {
            console.warn('[docentesModule] eventBus no disponible para', eventName);
            return;
        }
        eventBus.emit(eventName, payload);
    }

    const api = {
        sendAsistencia(payload) {
            safeAdd('asistenciaDocentes', payload);
            safeEmit('docente_envia_asistencia', payload);
        },

        sendCasoPsicologia(payload) {
            safeAdd('reportesPsicologia', payload);
            safeEmit('docente_envia_caso_psicologia', payload);
        },

        sendAlertaMedica(payload) {
            safeAdd('reportesEnfermeria', payload);
            safeEmit('docente_envia_alerta_medica', payload);
        },

        onAsistenciaEnviada(handler) {
            if (!eventBus || typeof eventBus.on !== 'function') return function () {};
            return eventBus.on('docente_envia_asistencia', handler);
        },

        onCasoPsicologia(handler) {
            if (!eventBus || typeof eventBus.on !== 'function') return function () {};
            return eventBus.on('docente_envia_caso_psicologia', handler);
        },

        onAlertaMedica(handler) {
            if (!eventBus || typeof eventBus.on !== 'function') return function () {};
            return eventBus.on('docente_envia_alerta_medica', handler);
        },

        subscribeAsistencia(listener) {
            if (!dataStore || typeof dataStore.subscribe !== 'function') return function () {};
            return dataStore.subscribe('asistenciaDocentes', listener);
        }
    };

    ns.modules.docentes = api;

    if (ns.systemCore && typeof ns.systemCore.registerModule === 'function') {
        ns.systemCore.registerModule('docentes', { type: 'producer', area: 'Docentes' });
    }

})(typeof window !== 'undefined' ? window : this);

