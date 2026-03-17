// Event Bus simple para comunicación entre módulos del sistema.
// No depende del DOM; solo gestiona eventos en memoria.

(function (global) {
    const NAMESPACE = 'SGECore';

    const listeners = {};

    function getListeners(eventName) {
        if (!listeners[eventName]) {
            listeners[eventName] = [];
        }
        return listeners[eventName];
    }

    const eventBus = {
        on(eventName, handler) {
            if (typeof handler !== 'function') {
                console.warn('[eventBus] on: handler no es una función para', eventName);
                return function () {};
            }
            const list = getListeners(eventName);
            list.push(handler);
            return function off() {
                const idx = list.indexOf(handler);
                if (idx >= 0) {
                    list.splice(idx, 1);
                }
            };
        },

        once(eventName, handler) {
            if (typeof handler !== 'function') {
                console.warn('[eventBus] once: handler no es una función para', eventName);
                return function () {};
            }
            const off = this.on(eventName, function wrapper(payload) {
                off();
                handler(payload);
            });
            return off;
        },

        off(eventName, handler) {
            const list = listeners[eventName];
            if (!list || !handler) return;
            const idx = list.indexOf(handler);
            if (idx >= 0) {
                list.splice(idx, 1);
            }
        },

        emit(eventName, payload) {
            const list = listeners[eventName];
            if (!list || list.length === 0) {
                return;
            }
            list.slice().forEach(function (handler) {
                try {
                    handler(payload);
                } catch (error) {
                    console.error('[eventBus] Error en handler para', eventName, error);
                }
            });
        },

        clearAll() {
            Object.keys(listeners).forEach(function (key) {
                listeners[key] = [];
            });
        }
    };

    const root = global || (typeof window !== 'undefined' ? window : {});
    root[NAMESPACE] = root[NAMESPACE] || {};
    root[NAMESPACE].eventBus = eventBus;

})(typeof window !== 'undefined' ? window : this);

