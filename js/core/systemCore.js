// Núcleo del sistema: coordina dataStore y eventBus.
// Versión inicial: sin dependencias de HTML ni módulos concretos.

(function (global) {
    const NAMESPACE = 'SGECore';

    const root = global || (typeof window !== 'undefined' ? window : {});
    root[NAMESPACE] = root[NAMESPACE] || {};

    const systemCore = {
        _initialized: false,
        _modules: {},

        init() {
            if (this._initialized) {
                return;
            }

            const ns = root[NAMESPACE];
            if (!ns.dataStore) {
                console.warn('[systemCore] dataStore no está disponible todavía');
            }
            if (!ns.eventBus) {
                console.warn('[systemCore] eventBus no está disponible todavía');
            }

            this._initialized = true;
        },

        isInitialized() {
            return this._initialized;
        },

        registerModule(name, config) {
            if (!name) {
                console.warn('[systemCore] registerModule: nombre inválido');
                return;
            }
            this._modules[name] = config || {};
        },

        getModule(name) {
            return this._modules[name] || null;
        },

        listModules() {
            return Object.keys(this._modules);
        }
    };

    root[NAMESPACE].systemCore = systemCore;

})(typeof window !== 'undefined' ? window : this);

