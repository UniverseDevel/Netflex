function main() {
    // Generate video features access
    if (
           cfg['videoBrightness']['access']
        && cfg['videoContrast']['access']
        && cfg['videoGrayscale']['access']
        && cfg['videoHue']['access']
        && cfg['videoInvert']['access']
        && cfg['videoSaturation']['access']
        && cfg['videoSepia']['access']
    ) {
        video_filter_access = true;
    }

    // Init content for startup
    if (check_domain()) {
        if (document.getElementById(injected_flag)) {
            log('output', '', getLang('status_text_update'));
            exitContent(true);
        }
        workers['startup'] = setInterval(startup, cfg['startupTimer']['val']);
    }
}

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