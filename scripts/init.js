function main() {
    // Init content for startup
    if (check_domain()) {
        if (document.getElementById(injected_flag)) {
            log('output', '', getLang('status_text_update'));
            exitContent(true);
        }
        workers['startup'] = setInterval(startup, cfg['startupTimer']['val']);

        perform_permission_check([]);
    }
}

var lang = {};
var locale = navigator.language;
var locale_iso = locale.split('-')[0];
var locale_default = chrome.runtime.getManifest().default_locale;
var locale_resources = chrome.runtime.getManifest().web_accessible_resources[0];
var locale_used = chrome.runtime.getURL((locale_resources.includes('_locales/' + locale_iso + '/messages.json') ? '_locales/' + locale_iso + '/messages.json' : '_locales/' + locale_default + '/messages.json' ));

// Load locale file available
try {
    $.ajax({
        // Configuration
        type: 'GET',
        timeout: 5000,
        url: locale_used,
        cache: false,
        async: true,
        crossDomain: false,
        dataType: 'json',
        global: true, // ajaxStart/ajaxStop
        // Data
        data: {},
        // Actions
        beforeSend: function() {},
        success: function(result, status, xhr) {
            // Initialize language list
            lang = result;

            // Initialize extension by calling main function
            load_configuration(function() {
                // To prevent problems in FireFox: TypeError: 'requestAnimationFrame' called on an object that does not implement interface Window.
                FontAwesome.config.mutateApproach = 'sync';

                if (cfg['simulateProduction']['val'] && cfg['simulateProduction']['access']) {
                    environment = 'production';
                    isDev = false;
                    isTest = false;
                    isProd = true;
                    isSimulated = true;

                    cfg = init_configuration();

                    load_configuration(function() {
                        main();
                    });
                } else {
                    main();
                }
            });
        },
        error: function(xhr, status, error) {
            error_detected = true;
            error_message = error;
            console.error('NETFLEX ERROR: Failed to load localisation data.');

            // Attempt self recovery
            console.info('%cNETFLEX INFO: Extension will attempt to recover itself in 5 seconds.', 'color: #4d88ff;');
            setTimeout(function () {
                chrome.runtime.sendMessage({
                    action: 'reloadExtension'
                }, function(response) { });
            }, 5000);
        },
        complete: function(xhr, status) {}
    });
} catch (e) {
    error_detected = true;
    error_message = e.stack;
}