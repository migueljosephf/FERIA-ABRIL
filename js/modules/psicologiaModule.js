// Módulo de Psicología - SGECore
// Registra casos, gestiona seguimiento y envío a Dirección.
// No ejecuta lógica automática al cargar; solo expone funciones.

(function (global) {
    const root = global || (typeof window !== 'undefined' ? window : {});
    root.SGECore = root.SGECore || {};
    const ns = root.SGECore;

    ns.modules = ns.modules || {};
    const dataStore = ns.dataStore;
    const eventBus = ns.eventBus;

    const KEY = 'reportesPsicologia';
    const TIPOS_CASO = [
        'conflicto_estudiantes',
        'conducta',
        'emocional',
        'academico',
        'familiar',
        'otro'
    ];

    function safeGetAll() {
        if (!dataStore || typeof dataStore.getAll !== 'function') {
            console.warn('[psicologiaModule] dataStore no disponible');
            return [];
        }
        return dataStore.getAll(KEY) || [];
    }

    function safeAdd(payload) {
        if (!dataStore || typeof dataStore.add !== 'function') {
            console.warn('[psicologiaModule] dataStore no disponible para agregar');
            return;
        }
        dataStore.add(KEY, payload);
    }

    function safeUpdate(predicate, updater) {
        if (!dataStore || typeof dataStore.update !== 'function') {
            console.warn('[psicologiaModule] dataStore.update no disponible');
            return;
        }
        dataStore.update(KEY, predicate, updater);
    }

    function safeEmit(eventName, payload) {
        if (!eventBus || typeof eventBus.emit !== 'function') {
            console.warn('[psicologiaModule] eventBus no disponible para', eventName);
            return;
        }
        eventBus.emit(eventName, payload);
    }

    function generarId() {
        return 'PSI-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    }

    function normalizarCaso(datos, origen) {
        const id = datos.id || generarId();
        return {
            id,
            fecha: datos.fecha || new Date().toISOString().split('T')[0],
            estudiante: datos.estudiante || '',
            grado: datos.grado || '',
            padrePresente: !!datos.padrePresente,
            tipoCaso: datos.tipoCaso || 'otro',
            descripcion: datos.descripcion || '',
            acciones: datos.acciones || '',
            enviadoDireccion: !!datos.enviadoDireccion,
            psicologaResponsable: datos.psicologaResponsable || '',
            estado: datos.estado || 'abierto',
            origen: datos.origen || origen || 'manual'
        };
    }

    const api = {
        TIPOS_CASO,

        registrarCaso(datos) {
            const caso = normalizarCaso(datos, 'manual');
            safeAdd(caso);
            safeEmit('psicologia_registra_caso', caso);
            if (caso.enviadoDireccion) {
                safeEmit('psicologia_envia_reporte', caso);
            }
            return caso.id;
        },

        actualizarCaso(id, datos) {
            safeUpdate(
                (item) => item.id === id,
                (item) => ({ ...item, ...datos, id })
            );
        },

        cerrarCaso(id) {
            safeUpdate(
                (item) => item.id === id,
                (item) => ({ ...item, estado: 'cerrado' })
            );
        },

        obtenerCasos(filtro) {
            const todos = safeGetAll();
            if (!filtro) return todos;
            if (filtro === 'abiertos') return todos.filter((c) => c.estado === 'abierto');
            if (filtro === 'cerrados') return todos.filter((c) => c.estado === 'cerrado');
            if (filtro === 'enviados_direccion') return todos.filter((c) => c.enviadoDireccion === true);
            return todos;
        },

        enviarReporteDireccion(id) {
            const todos = safeGetAll();
            const caso = todos.find((c) => c.id === id);
            if (!caso) {
                console.warn('[psicologiaModule] Caso no encontrado:', id);
                return;
            }
            safeUpdate(
                (item) => item.id === id,
                (item) => ({ ...item, enviadoDireccion: true })
            );
            const actualizado = { ...caso, enviadoDireccion: true };
            safeEmit('psicologia_envia_reporte', actualizado);
        },

        suscribirCasosDeDocentes() {
            if (!eventBus || typeof eventBus.on !== 'function') {
                console.warn('[psicologiaModule] eventBus no disponible para suscribir');
                return function () {};
            }
            return eventBus.on('docente_envia_caso_psicologia', (payload) => {
                const caso = normalizarCaso(payload || {}, 'docente');
                safeAdd(caso);
                safeEmit('psicologia_registra_caso', caso);
                if (caso.enviadoDireccion) {
                    safeEmit('psicologia_envia_reporte', caso);
                }
            });
        },

        onCasoRegistrado(handler) {
            if (!eventBus || typeof eventBus.on !== 'function') return function () {};
            return eventBus.on('psicologia_registra_caso', handler);
        },

        onReporteEnviado(handler) {
            if (!eventBus || typeof eventBus.on !== 'function') return function () {};
            return eventBus.on('psicologia_envia_reporte', handler);
        },

        subscribeReportes(listener) {
            if (!dataStore || typeof dataStore.subscribe !== 'function') return function () {};
            return dataStore.subscribe(KEY, listener);
        }
    };

    ns.psicologia = api;
    ns.modules.psicologia = api;

    if (ns.systemCore && typeof ns.systemCore.registerModule === 'function') {
        ns.systemCore.registerModule('psicologia', { type: 'producer_consumer', area: 'Psicología' });
    }

})(typeof window !== 'undefined' ? window : this);
