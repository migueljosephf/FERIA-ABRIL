// Core Data Store for SGE - almacenamiento central temporal
// No depende del DOM, solo maneja estado en memoria y notificaciones de cambio.

(function (global) {
    const NAMESPACE = 'SGECore';

    const DATA_KEYS = [
        'asistenciaDocentes',
        'reportesPsicologia',
        'reportesEnfermeria',
        'datosComedor',
        'reportesCafeteria',
        'registrosOdontologia',
        'pedidosPapeleria'
    ];

    const _data = {};
    const _subscribers = {};

    DATA_KEYS.forEach((key) => {
        _data[key] = [];
        _subscribers[key] = [];
    });

    function clone(value) {
        if (value === null || typeof value !== 'object') return value;
        return JSON.parse(JSON.stringify(value));
    }

    function notify(key) {
        const listeners = _subscribers[key] || [];
        const snapshot = clone(_data[key]);
        listeners.forEach((listener) => {
            try {
                listener(snapshot);
            } catch (error) {
                console.error('[dataStore] Error en suscriptor para', key, error);
            }
        });
    }

    const dataStore = {
        keys: DATA_KEYS.slice(),

        getAll(key) {
            if (!_data.hasOwnProperty(key)) {
                console.warn('[dataStore] getAll: clave desconocida', key);
                return [];
            }
            return clone(_data[key]);
        },

        setAll(key, items) {
            if (!_data.hasOwnProperty(key)) {
                console.warn('[dataStore] setAll: clave desconocida', key);
                return;
            }
            _data[key] = Array.isArray(items) ? clone(items) : [];
            notify(key);
        },

        add(key, item) {
            if (!_data.hasOwnProperty(key)) {
                console.warn('[dataStore] add: clave desconocida', key);
                return;
            }
            _data[key].push(clone(item));
            notify(key);
        },

        update(key, predicate, updater) {
            if (!_data.hasOwnProperty(key)) {
                console.warn('[dataStore] update: clave desconocida', key);
                return;
            }
            if (typeof predicate !== 'function' || typeof updater !== 'function') {
                console.warn('[dataStore] update: predicate/updater inválidos');
                return;
            }
            let changed = false;
            _data[key] = _data[key].map((item) => {
                if (!predicate(item)) return item;
                changed = true;
                const updated = updater(clone(item));
                return updated == null ? item : updated;
            });
            if (changed) {
                notify(key);
            }
        },

        clear(key) {
            if (!_data.hasOwnProperty(key)) {
                console.warn('[dataStore] clear: clave desconocida', key);
                return;
            }
            _data[key] = [];
            notify(key);
        },

        subscribe(key, listener) {
            if (!_subscribers.hasOwnProperty(key)) {
                console.warn('[dataStore] subscribe: clave desconocida', key);
                return function () {};
            }
            if (typeof listener !== 'function') {
                console.warn('[dataStore] subscribe: listener no es función');
                return function () {};
            }
            _subscribers[key].push(listener);
            try {
                listener(clone(_data[key]));
            } catch (error) {
                console.error('[dataStore] Error al notificar estado inicial de', key, error);
            }
            return function unsubscribe() {
                const list = _subscribers[key];
                const index = list.indexOf(listener);
                if (index >= 0) {
                    list.splice(index, 1);
                }
            };
        }
    };

    const root = global || (typeof window !== 'undefined' ? window : {});
    root[NAMESPACE] = root[NAMESPACE] || {};
    root[NAMESPACE].dataStore = dataStore;

})(typeof window !== 'undefined' ? window : this);

