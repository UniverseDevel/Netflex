try {
    console.log('NETFLEX WORKER: Starting...');

    console.log('NETFLEX WORKER: Loading "distribution.js".');
    importScripts('scripts/distribution.js');

    console.log('NETFLEX WORKER: Loading "worker.js".');
    importScripts('scripts/worker.js');

    console.log('NETFLEX WORKER: Started!');
} catch (e) {
    console.error(e);
}