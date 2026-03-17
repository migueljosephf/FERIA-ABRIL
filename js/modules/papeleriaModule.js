// Módulo de integración para Papelería con el núcleo SGECore.
// Maneja pedidos de uniformes y papelería; sin tocar el DOM.

(function (global) {
    const root = global || (typeof window !== 'undefined' ? window : {});
    root.SGECore = root.SGECore || {};
    const ns = root.SGECore;

    ns.modules = ns.modules || {};

    const dataStore = ns.dataStore;
    const eventBus = ns.eventBus;

    function safeAdd(key, payload) {
        if (!dataStore || typeof dataStore.add !== 'function') {
            console.warn('[papeleriaModule] dataStore no disponible para', key);
            return;
        }
        dataStore.add(key, payload);
    }

    function safeEmit(eventName, payload) {
        if (!eventBus || typeof eventBus.emit !== 'function') {
            console.warn('[papeleriaModule] eventBus no disponible para', eventName);
            return;
        }
        eventBus.emit(eventName, payload);
    }

    const api = {
        registrarPedido(payload) {
            safeAdd('pedidosPapeleria', payload);
            safeEmit('papeleria_nuevo_pedido', payload);
        },

        actualizarEstadoPedido(predicate, updater) {
            if (!dataStore || typeof dataStore.update !== 'function') {
                console.warn('[papeleriaModule] dataStore.update no disponible');
                return;
            }
            dataStore.update('pedidosPapeleria', predicate, updater);
            safeEmit('papeleria_actualiza_pedido', null);
        },

        onNuevoPedido(handler) {
            if (!eventBus || typeof eventBus.on !== 'function') return function () {};
            return eventBus.on('papeleria_nuevo_pedido', handler);
        },

        onPedidosActualizados(handler) {
            if (!eventBus || typeof eventBus.on !== 'function') return function () {};
            return eventBus.on('papeleria_actualiza_pedido', handler);
        },

        subscribePedidos(listener) {
            if (!dataStore || typeof dataStore.subscribe !== 'function') return function () {};
            return dataStore.subscribe('pedidosPapeleria', listener);
        }
    };

    ns.modules.papeleria = api;

    if (ns.systemCore && typeof ns.systemCore.registerModule === 'function') {
        ns.systemCore.registerModule('papeleria', { type: 'producer_consumer', area: 'Papelería' });
    }

})(typeof window !== 'undefined' ? window : this);

