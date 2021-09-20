function events_injector() {
    debug_overflow_entry('main_loop', 2);

    if (cfg['simulateProduction']['access']) {
        // Reload page when simulation is not in expected state
        reload_requests['env_simulation'] = false;
        if (cfg['simulateProduction']['val']) {
            if (!isSimulated) {
                // Set reload request for reload worker to pick up
                reload_requests['env_simulation'] = true;
            }
        } else {
            if (isSimulated) {
                // Set reload request for reload worker to pick up
                reload_requests['env_simulation'] = true;
            }
        }
    }

    if (!isOrphan) {
        log('group_start', 'main_loop', 'Main cycle');
        log('debug', 'main_loop', '# MAIN CYCLE START ###################################');
        // Update environment variables
        if (!workers['environment']) {
            workers['environment'] = setInterval(environment_update, cfg['environmentUpdateTimer']['val']);
        }
        log('debug', 'main_loop', 'events_injector');

        // Check if we are located on valid Netflix page and there is no error shown to start injecting and upsell dialog is not shown as well
        if (!check_error() && !check_upsell() && (check_watch() || check_browse() || check_latest() || check_title() || check_search())) {
            // Perform only when on specific pages
            if (check_watch() || check_browse() || check_latest() || check_title() || check_search()) {
                // If status update starts to lag behind interval it might be broken and we update it manually and restart the interval
                var status_update_limit = new Date(status_update_time).addMilliseconds(cfg['elementHandlerTimer']['val']);
                if (status_update_limit < new Date()) {
                    inject_styles();
                    element_handler();
                    stop_worker('elements');
                }

                if (!workers['controls']) {
                    workers['controls'] = setInterval(mouse_simulation, cfg['controlsSwitchTimer']['val']);
                }
                if (!workers['elements']) {
                    workers['elements'] = setInterval(element_handler, cfg['elementHandlerTimer']['val']);
                }
            } else {
                stop_worker('controls');
                stop_worker('elements');
            }

            // Perform on all Netflix tabs, assistant helps with features on all of them
            if (!workers['assistant']) {
                workers['assistant'] = setInterval(netflix_assistant, cfg['netflixAssistantTimer']['val']);
                netflix_assistant();
            } else {
                currentTime = new Date();
                var difference = (currentTime.getTime() - lastCall.getTime());

                // If last assistant call is too old, there might be a problem and
                // we try to restart assistant in next loop, when on non-watch page
                // this condition may be occurring due to tabs being suspended to
                // one second per interval/timeout
                var worker_delay_limit = 1500;
                if (difference > worker_delay_limit) {
                    log('error', 'core_errors', getLang('error_core_assistant_delay'), currentTime.getTime(), lastCall.getTime(), difference, worker_delay_limit);
                    stop_worker('assistant');
                    lastCall = new Date();
                }
            }

            // Perform on all visible Netflix tabs as even video can show ratings, if we have it
            if (visibleAPI) {
                if (!workers['ratings']) {
                    workers['ratings'] = setInterval(netflix_ratings, cfg['netflixRatingsTimer']['val']);
                }
            } else {
                stop_worker('ratings');
            }

            injected = true;
        } else {
            stop_worker('controls');
            stop_worker('elements');
            stop_worker('assistant');
            stop_worker('ratings');
            lastCall = new Date();
            injected = false;
        }

        if (error_message != '') {
            log('error', 'core_errors', getLang('error_core'), error_message);
        }
        log('debug', 'main_loop', '# MAIN CYCLE STOP ####################################');
        log('group_end', 'main_loop', '');
    } else {
        // Stop everything and allow new content be injected
        var flag = document.getElementById(injected_flag);
        if (flag) {
            if (flag.getAttribute('run-id')) {
                if (flag.getAttribute('run-id') == run_id.toString()) {
                    exitContent(true);
                }
            }
        }
    }

    debug_overflow_detection();
}

function page_reloader() {
    var reload_requested_before = reload_requested;
    reload_requested = false;
    forceReloadDifference = Math.floor(Math.round((cfg['forceReloadDelay']['val'] - ((new Date().getTime() - new Date(lastForceReload).getTime()) / 1000)) * 10) / 10);

    for (var requester in reload_requests) {
        if (reload_requests[requester]) {
            reload_requested = true;
        }
    }

    if (!reloading_page) {
        if (reload_requested) {
            if (forceReloadDifference <= 0) {
                reload_delay = false;
                log('output', '', getLang('page_reload'));
                log('output', '', reload_requests);
                // Mark forced reload to prevent account blocking
                localStorage.setItem('netflex_lastForceReload', JSON.stringify(new Date()));
                // Prevent any more reloads
                reloading_page = true;
                // Reload page - should be the only place where reload is called and requesters can be found by looking for "reload_requests" variable
                window.location.reload(false);
            } else {
                // Delay reload to prevent account blocking
                if (!reload_delay) {
                    log('output', '', getLang('page_reload_delay'), cfg['forceReloadDelay']['val'], getLang('seconds'));
                } else {
                    if (forceReloadDifference % 10 == 0 && forceReloadDifference > 0) {
                        log('output', '', getLang('page_reload_delay_info'), forceReloadDifference, ((forceReloadDifference == 1) ? getLang('second') : ((forceReloadDifference < 5) ? getLang('second_less5') : getLang('seconds'))));
                    }
                }
                reload_delay = true;
            }
        } else {
            reload_delay = false;
            if (reload_requested_before) {
                log('output', '', getLang('page_reload_cancelled'));
            }
        }
    }
}

function initContent() {
    if (!check_error() && (check_watch() || check_browse() || check_latest() || check_title() || check_search())) {
        // Initialize all events
        log('debug', 'init', 'initContent {0}', run_id);

        // Apply version specific changes
        version_consistency_changes();

        setInjected();

        workers['injector'] = setInterval(events_injector, cfg['injectorTimer']['val']);
        workers['reloader'] = setInterval(page_reloader, cfg['pageReloadTimer']['val']);

        if (localStorage.getItem('netflex_watchHistory') !== null) {
            watchHistory = JSON.parse(localStorage.getItem('netflex_watchHistory'), JSON.dateParser);
        }

        if (localStorage.getItem('netflex_lastForceReload') !== null) {
            lastForceReload = JSON.parse(localStorage.getItem('netflex_lastForceReload'), JSON.dateParser);
        }

        if (localStorage.getItem('netflex_ratingsDB') !== null) {
            ratingsDB = JSON.parse(localStorage.getItem('netflex_ratingsDB'));
        }

        if (localStorage.getItem('netflex_statistics') !== null) {
            stats_counter = JSON.parse(localStorage.getItem('netflex_statistics'));
        }

        bind_events();
    }
}

function stopWorkers() {
    stop_worker('local_storage_size');
    stop_worker('injector');
    stop_worker('reloader');
    stop_worker('controls');
    stop_worker('assistant');
    stop_worker('elements');
    stop_worker('ratings');
    stop_worker('environment');
    stop_worker('startup');
}

function exitContent(remove_icon) {
    // Remove all events
    log('debug', 'init', 'exitContent {0}', run_id);

    if (remove_icon) {
        remove_status_objects();
    }

    stopWorkers();

    unbind_events();

    removeInjected();
}

function startup() {
    //debug_overflow_entry('startup ' + run_id, 10);

    var exists = checkInjected();
    log('debug', 'startup', 'startup {0} exists {1}', run_id, exists);

    if (!exists) {
        //workers['local_storage_size'] = setTimeout(local_storage_total_size, 1);
        initContent();
    }
}

function stop_worker(worker) {
    if (workers[worker]) {
        try { clearInterval(workers[worker]); } catch (e) {}
        try { clearTimeout(workers[worker]); } catch (e) {}
        workers[worker] = false;
    }
}

function checkInjected() {
    var flag = document.getElementById(injected_flag);

    if (!flag) {
        return false;
    }
    return true;
}

function setInjected() {
    var flag = document.getElementById(injected_flag);

    if (!flag) {
        flag = document.createElement('SPAN');
        flag.setAttribute('id', injected_flag);
        flag.setAttribute('run-id', run_id);
        flag.setAttribute('startup-id', workers['startup']);
        flag.setAttribute('ping', JSON.stringify(new Date()).replace(/\"/gi, ''));
        netflix_body.appendChild(flag);
    } else {
        if (flag.getAttribute('run-id') != run_id.toString()) {
            debug_overflow_entry('run-id', 1);
            flag.setAttribute('run-id', run_id);
        }
        if (flag.getAttribute('startup-id').toString() != workers['startup'].toString()) {
            debug_overflow_entry('startup-id', 1);
            flag.setAttribute('startup-id', workers['startup']);
        }
        flag.setAttribute('ping', JSON.stringify(new Date()).replace(/\"/gi, ''));
    }
}

function removeInjected() {
    removeDOM(document.getElementById(injected_flag));
}

function reset_configuration() {
    try {
        var cfg_changes = [];
        for (var key in cfg) {
            if (cfg.hasOwnProperty(key)) {
                if (cfg[key]['def'] != cfg[key]['val']) {
                    cfg_changes.push({'key': key, 'value_new': cfg[key]['def'], 'value_old': cfg[key]['val']});
                }
            }
        }
        chrome.storage.local.clear();
        load_configuration(null, cfg_changes);
    } catch (e) {
        error_detected = true;
        error_message = 'reset_configuration: ' + e.stack;
    }
}

function reset_configuration_cat(type) {
    try {
        var cfg_changes = [];
        for (var key in cfg) {
            if (cfg.hasOwnProperty(key)) {
                if (cfg[key]['category'] == type) {
                    if (cfg[key]['def'] != cfg[key]['val']) {
                        cfg_changes.push({'key': key, 'value_new': cfg[key]['def'], 'value_old': cfg[key]['val']});
                    }
                    chrome.storage.local.remove(key, function() {});
                }
            }
        }
        load_configuration(null, cfg_changes);
    } catch (e) {
        error_detected = true;
        error_message = 'reset_configuration_cat: ' + e.stack;
    }
}

function reload_extension() {
    if (!isOrphan) {
        try {
            try {
                if (isChrome) {
                    isOrphan = true;
                    chrome.runtime.reload();
                    return;
                }
            } catch (e) {}

            chrome.runtime.sendMessage({
                    action: 'reloadExtension'
                }, function(response) {
                    try {
                        if (chrome.runtime.lastError) {
                            if (chrome.runtime.lastError.length() != 0) {
                                log('error', 'core_errors', 'Function reload_extension called sendMessage and returned reply error:');
                                log('error', 'core_errors', chrome.runtime.lastError);
                            }
                        }
                        if (response.status = 'OK') {
                            isOrphan = true;
                            try {
                                stop_worker('elements');
                                remove_status_objects();
                            } catch (e) {}
                        } else if (response.status = 'ERROR') {
                            if (response.message != '') {
                                log('error', '', 'Response message: ' + response.message);
                            }
                        } else {
                            log('debug', 'background', 'reload_extension()');
                            log('debug', 'background', 'request={0}', JSON.stringify(response.request));
                            log('debug', 'background', 'response={0}', JSON.stringify(response));
                        }
                    } catch (e) {}
            });
        } catch (e) {}
    }
}

function array_contains(arr,obj) {
    var i = arr.length;
    while (i--) {
        if (arr[i] === obj) {
            return true;
        }
    }
    return false;
}

function debug_overflow_entry(loop_name, loop_limit) {
    if (!overflowData.hasOwnProperty(loop_name)) {
        overflowData[loop_name] = {
            'loop_limit': loop_limit,
            'loop_count': 1,
            'loop_check': 0,
            'loop_difference': 0
        };
    } else {
        overflowData[loop_name]['loop_count']++;
    }
}

function debug_overflow_detection() {
    try {
        for (var key in overflowData) {
            if (overflowData.hasOwnProperty(key)) {
                overflowData[key]['loop_difference'] = overflowData[key]['loop_count'] - overflowData[key]['loop_check'];
                overflowData[key]['loop_check'] = overflowData[key]['loop_count'];
            }
        }

        if (cfg['debug']['val'].includes('overflow')) {
            for (var key in overflowData) {
                if (overflowData.hasOwnProperty(key)) {
                    if (overflowData[key]['loop_difference'] > overflowData[key]['loop_limit']) {
                        log('warn', 'overflow', getLang('loop_overflow'), key, overflowData[key]['loop_difference'], overflowData[key]['loop_limit']);
                    }
                }
            }
        }
    } catch (e) {}
}

function check_domain() {
    if (/^.*:\/\/(w{0}|w{3}\.){0,1}netflix\.com$/i.test(origin)) {
        return true;
    }

    return false;
}

function check_path(pattern) {
    if (check_domain()) {
        if (pattern == 'cast') {
            if (!check_watch() && object_handler('cast', null)) {
                return true;
            }
        } else if (pattern == 'error') {
            if (object_handler('error', null)) {
                return true;
            }
        } else if (pattern == 'empty') {
            if (path == '' || path == '/') {
                return true;
            }
        } else if (pattern == 'account') {
            if (object_handler('account', null)) {
                return true;
            }
        } else if (pattern == 'kids') {
            if (object_handler('kids', null) || check_path('Kids')) {
                return true;
            }
        } else if (pattern == 'profile') {
            if (object_handler('profile', null)) {
                return true;
            }
        } else if (pattern == 'pin') {
            if (object_handler('pin', null)) {
                return true;
            }
        } else {
            var regex = new RegExp('^\/(.*/){0,1}(' + pattern + ').*$', 'i');
            if (path.match(regex) && !check_profile()) {
                return true;
            }
        }
    }

    return false;
}

function check_empty() {
    return check_path('empty');
}

function check_error() {
    return check_path('error');
}

function check_login() {
    return check_path('login');
}

function check_logout() {
    return check_path('logout');
}

function check_account() {
    return check_path('account');
}

function check_pin() {
    return check_path('pin');
}

function check_profile() {
    return check_path('profile');
}

function check_general_profile() {
    return (netflix_profile == 'general');
}

function check_kids_profile() {
    checkProfile();
    return (netflix_profile == 'kids');
}

function check_watch() {
    return check_path('watch');
}

function check_browse() {
    return check_path('browse|Kids');
}

function check_latest() {
    return check_path('latest');
}

function check_title() {
    return check_path('title');
}

function check_kids() {
    return check_path('kids');
}

function check_search() {
    return check_path('search');
}

function check_cast() {
    return check_path('cast');
}

function check_upsell() {
    if (object_handler('upsell', null)) {
        return true;
    }

    return false;
}

function check_search_bar() {
    try {
        var search = object_handler('input_search', null);
        for (var i = 0; i < search.childNodes.length; i++) {
            if (search.childNodes[i].nodeName == 'INPUT' && document.activeElement == search.childNodes[i]) {
                return true;
            }
        }
    } catch (e) {}

    return false;
}

function check_problem_report() {
    if (object_handler('video_report_problem', null)) {
        return true;
    }

    return false;
}

function check_options() {
    var opt = document.getElementById('extension_options_integrated');
    if (opt) {
        if (opt.style.display == 'table-cell') {
            return true;
        }
    }

    return false;
}

function check_series() {
    if (object_handler('button_episodes_list', null)) {
        return true;
    }

    return false;
}

function extension_storage_size() {
    if (!isOrphan) {
        chrome.storage.local.getBytesInUse(null, function(used_bytes) {
            var max_bytes = chrome.storage.local.QUOTA_BYTES;
            var used_pct = Math.round((used_bytes / max_bytes * 100) * 1000) / 1000;

            storage_stats['extension'] = {
                'used_bytes': used_bytes,
                'max_bytes': max_bytes,
                'used_pct': used_pct,
                'limit_warn': ((used_pct >= 95) ? true : false)
            };
        });
    }
}

function local_storage_size() {
    var used_bytes = 0;
    var used_pct = 0;
    var max_bytes = local_storage_max_size;

    if (local_storage_max_size != 0) {
        for (var key in localStorage) {
            if (!localStorage.hasOwnProperty(key)) {
                continue;
            }
            used_bytes += ((localStorage[key].length + key.length) * 2);
        };
        used_pct = Math.round((used_bytes / max_bytes * 100) * 1000) / 1000;
    }

    storage_stats['local'] = {
        'used_bytes': used_bytes,
        'max_bytes': max_bytes,
        'used_pct': used_pct,
        'limit_warn': ((used_pct >= 95) ? true : false)
    };
}

function local_storage_total_size() {
    var size_chunk = (500 * 1024); // 500KB
    var aim_size = (10 * 1024 * 1024); // 10MB
    var fill = 'm'.padStart(size_chunk, 'm');

    localStorage.removeItem('netflex_storage_test');
    for (var i = 0, data = fill; i < Math.ceil(aim_size / size_chunk); i++) {
        try {
            localStorage.setItem('netflex_storage_test', data);
            data += fill;
        } catch(e) {
            local_storage_max_size = JSON.stringify(localStorage).length;
            break;
        }
    }
    localStorage.removeItem('netflex_storage_test');

    if (local_storage_max_size == 0) {
        local_storage_max_size = aim_size;
    }
}

function environment_update() {
    try {
        setInjected();

        inject_styles();

        //load_configuration();

        log('debug', 'environment', 'environment_update');

        remove_highlight();
        checkIfOrphan();
        checkVisibility();
        checkProfile();
        checkNews();
        url = window.location.href;
        origin = window.location.origin;
        try {ancestorOrigins = window.location.ancestorOrigins[0];} catch (e) {}
        path = window.location.pathname + window.location.search;
        title = window.title;
        full_url = window.location.origin + window.location.pathname;
        currentTime = new Date();
        try {cadmium_version = object_handler('cadmium_version', null);} catch (e) { }
        try {cadmium_version_normalized = normalize_version(cadmium_version, 6);} catch (e) { }
        try {extension_storage_size();} catch (e) { }
        try {local_storage_size();} catch (e) { }

        if (!isOrphan) {
            if (error_detected) {
                if (error_detected) {
                    log('error', '', error_message);
                }
                error_count++;
                if (error_count > 5) {
                    log('error', '', getLang('error_reload'));
                    error_reload = true;
                    exitContent(false);
                    // Try reloading extension with delay
                    setTimeout(reload_extension, cfg['errorExtensionReloadDelay']['val']);
                }
            }

            if (check_watch()) {
                // Check proactively if configuration for hideStatusIcon and allowKidsConfig did not change as this
                // configuration can be turned off on browser page and this has to be reflected on watch page immediately.
                chrome.storage.local.get(['hideStatusIcon'], function(result) {
                    if (result['hideStatusIcon'] !== undefined) {
                        var cfg_value = false;
                        if (typeof result['hideStatusIcon'] == 'boolean') {
                            cfg_value = result['hideStatusIcon'];
                        } else {
                            cfg_value = ((result['hideStatusIcon'] == 'true') ? true : false);
                        }

                        if (cfg_value != cfg['hideStatusIcon']['val']) {
                            cfg['hideStatusIcon']['val'] = cfg_value;
                        }
                    }
                });
                chrome.storage.local.get(['allowKidsConfig'], function(result) {
                    if (result['allowKidsConfig'] !== undefined) {
                        var cfg_value = false;
                        if (typeof result['allowKidsConfig'] == 'boolean') {
                            cfg_value = result['allowKidsConfig'];
                        } else {
                            cfg_value = ((result['allowKidsConfig'] == 'true') ? true : false);
                        }

                        if (cfg_value != cfg['allowKidsConfig']['val']) {
                            cfg['allowKidsConfig']['val'] = cfg_value;
                            if (!cfg['allowKidsConfig']['val'] && (check_kids() || check_kids_profile())) {
                                remove_status_objects();
                            }
                        }
                    }
                });
            }
        }

        // Define debug variable for Netflix Extension DevTools
        debug_variables['global'] = {};
        debug_variables['checks'] = {};
        debug_variables['timers'] = {};
        debug_variables['variables'] = {};
        debug_variables['assistant'] = {};
        debug_variables['rating'] = {};
        debug_variables['api'] = {};

        debug_variables['cfg'] = {};
        debug_variables['storage'] = {};
        debug_variables['lang'] = {};
        debug_variables['statistics'] = {};
        debug_variables['ratingsDB'] = {};
        debug_variables['overflowData'] = {};
        debug_variables['simulation_objects'] = {};

        debug_variables['global']['browser'] = browser;
        debug_variables['global']['isChrome'] = isChrome;
        debug_variables['global']['isEdgeChromium'] = isEdgeChromium;
        debug_variables['global']['isFirefox'] = isFirefox;
        debug_variables['global']['isOpera'] = isOpera;

        debug_variables['lang'] = lang;

        debug_variables['checks']['check_domain'] = check_domain();
        debug_variables['checks']['check_empty'] = check_empty();
        debug_variables['checks']['check_error'] = check_error();
        debug_variables['checks']['check_login'] = check_login();
        debug_variables['checks']['check_logout'] = check_logout();
        debug_variables['checks']['check_account'] = check_account();
        debug_variables['checks']['check_pin'] = check_pin();
        debug_variables['checks']['check_profile'] = check_profile();
        debug_variables['checks']['check_general_profile'] = check_general_profile();
        debug_variables['checks']['check_kids_profile'] = check_kids_profile();
        debug_variables['checks']['check_watch'] = check_watch();
        debug_variables['checks']['check_browse'] = check_browse();
        debug_variables['checks']['check_latest'] = check_latest();
        debug_variables['checks']['check_title'] = check_title();
        debug_variables['checks']['check_kids'] = check_kids();
        debug_variables['checks']['check_search'] = check_search();
        debug_variables['checks']['check_cast'] = check_cast();
        debug_variables['checks']['check_series'] = check_series();
        debug_variables['checks']['check_upsell'] = check_upsell();
        debug_variables['checks']['check_search_bar'] = check_search_bar();
        debug_variables['checks']['check_problem_report'] = check_problem_report();
        debug_variables['checks']['check_options'] = check_options();

        debug_variables['workers'] = workers;

        debug_variables['variables']['run_id'] = run_id;
        debug_variables['variables']['injected_flag'] = injected_flag;
        debug_variables['variables']['extension_version'] = extension_version;
        debug_variables['variables']['extension_version_normalized'] = extension_version_normalized;
        debug_variables['variables']['last_version'] = last_version;
        debug_variables['variables']['last_version_normalized'] = last_version_normalized;
        debug_variables['variables']['previous_version'] = previous_version;
        debug_variables['variables']['previous_version_normalized'] = previous_version_normalized;
        debug_variables['variables']['applied_version'] = applied_version;
        debug_variables['variables']['applied_version_normalized'] = applied_version_normalized;
        debug_variables['variables']['cadmium_version'] = cadmium_version;
        debug_variables['variables']['cadmium_version_normalized'] = cadmium_version_normalized;
        debug_variables['variables']['show_donation_link'] = show_donation_link;
        debug_variables['variables']['show_source_link'] = show_source_link;
        debug_variables['variables']['options_tab_selected'] = options_tab_selected;
        debug_variables['variables']['extension_id'] = extension_id;
        debug_variables['variables']['environment'] = environment;
        debug_variables['variables']['isDev'] = isDev;
        debug_variables['variables']['isTest'] = isTest;
        debug_variables['variables']['isProd'] = isProd;
        debug_variables['variables']['isOrphan'] = isOrphan;
        debug_variables['variables']['visibleAPI'] = visibleAPI;
        debug_variables['variables']['visibleWND'] = visibleWND;
        debug_variables['variables']['locale'] = locale;
        debug_variables['variables']['locale_iso'] = locale_iso;
        debug_variables['variables']['url'] = url;
        debug_variables['variables']['origin'] = origin;
        debug_variables['variables']['full_url'] = full_url;
        debug_variables['variables']['full_url_old'] = full_url_old;
        debug_variables['variables']['ancestorOrigins'] = ancestorOrigins;
        debug_variables['variables']['path'] = path;
        debug_variables['variables']['title'] = title;
        debug_variables['variables']['injected'] = injected;
        debug_variables['variables']['movement_offset'] = movement_offset;
        debug_variables['variables']['error_detected'] = error_detected;
        debug_variables['variables']['error_message'] = error_message;
        debug_variables['variables']['error_count'] = error_count;
        debug_variables['variables']['netflix_profile'] = netflix_profile;
        debug_variables['variables']['reload_requests'] = reload_requests;
        debug_variables['variables']['reload_requested'] = reload_requested;
        debug_variables['variables']['api_keys'] = api_keys;
        debug_variables['variables']['donation_urls'] = donation_urls;
        debug_variables['variables']['stores_urls'] = stores_urls;
        debug_variables['variables']['source_urls'] = source_urls;
        debug_variables['variables']['news_urls'] = news_urls;
        debug_variables['variables']['status_bubble_opened'] = status_bubble_opened;
        debug_variables['variables']['news_opened'] = news_opened;
        debug_variables['variables']['options_opened'] = options_opened;
        debug_variables['variables']['features_opened'] = features_opened;

        debug_variables['assistant']['enableAssistant'] = enableAssistant;
        debug_variables['assistant']['key_disabled'] = key_disabled;
        debug_variables['assistant']['logo_icon_prod'] = logo_icon_prod;
        debug_variables['assistant']['logo_icon_test'] = logo_icon_test;
        debug_variables['assistant']['logo_icon_dev'] = logo_icon_dev;
        debug_variables['assistant']['logo_icon_sup'] = logo_icon_sup;
        debug_variables['assistant']['changelog_page'] = changelog_page;
        debug_variables['assistant']['status_update_time'] = status_update_time;
        debug_variables['assistant']['status_data'] = status_data;
        debug_variables['assistant']['status_data_old'] = status_data_old;
        debug_variables['assistant']['forceReloadDifference'] = forceReloadDifference;
        debug_variables['assistant']['key_pressed'] = key_pressed;
        debug_variables['assistant']['wheel_direction'] = wheel_direction;
        debug_variables['assistant']['lastForceReload'] = lastForceReload;
        debug_variables['assistant']['oldTimestamp'] = oldTimestamp;
        debug_variables['assistant']['currentTimestamp'] = currentTimestamp;
        debug_variables['assistant']['hiddenCFG'] = hiddenCFG;
        debug_variables['assistant']['pausedByExtension'] = pausedByExtension;
        debug_variables['assistant']['storage_stats'] = storage_stats;
        debug_variables['assistant']['oldLink'] = oldLink;
        debug_variables['assistant']['title_end_actions'] = loading_next_title;
        debug_variables['assistant']['skipping'] = skipping;
        debug_variables['assistant']['stuckTime'] = stuckTime;
        debug_variables['assistant']['reload_delay'] = reload_delay;
        debug_variables['assistant']['reloading_page'] = reloading_page;
        debug_variables['assistant']['loadingTime'] = loadingTime;
        debug_variables['assistant']['is_interrupted'] = is_interrupted;
        debug_variables['assistant']['forceNextEpisode'] = forceNextEpisode;
        debug_variables['assistant']['next_is_offered'] = next_is_offered;
        debug_variables['assistant']['next_no_wait'] = next_no_wait;
        debug_variables['assistant']['nextTitleDelay'] = nextTitleDelay;
        debug_variables['assistant']['loadTime'] = loadTime;
        debug_variables['assistant']['currentTime'] = currentTime;
        debug_variables['assistant']['lastCall'] = lastCall;
        debug_variables['assistant']['video'] = video;
        debug_variables['assistant']['video_id'] = video_id;
        debug_variables['assistant']['currentVideo'] = currentVideo;
        debug_variables['assistant']['currentVideo_1'] = currentVideo_1;
        debug_variables['assistant']['currentVideo_2'] = currentVideo_2;
        debug_variables['assistant']['currentVideo_3'] = currentVideo_3;
        debug_variables['assistant']['currentEpisode'] = currentEpisode;
        debug_variables['assistant']['currentEpisode_1'] = currentEpisode_1;
        debug_variables['assistant']['currentEpisode_2'] = currentEpisode_2;
        debug_variables['assistant']['nextVideo'] = nextVideo;
        debug_variables['assistant']['nextVideo_1'] = nextVideo_1;
        debug_variables['assistant']['nextVideo_2'] = nextVideo_2;
        debug_variables['assistant']['nextVideo_3'] = nextVideo_3;
        debug_variables['assistant']['videoSpeedRate'] = videoSpeedRate;
        debug_variables['assistant']['videoSpeedRate_change'] = videoSpeedRate_change;
        debug_variables['assistant']['videoSpeedRate_temp'] = videoSpeedRate_temp;
        debug_variables['assistant']['videoZoom'] = videoZoom;
        debug_variables['assistant']['videoZoom_change'] = videoZoom_change;
        debug_variables['assistant']['videoZoom_temp'] = videoZoom_temp;
        debug_variables['assistant']['videoBrightness'] = videoBrightness;
        debug_variables['assistant']['videoBrightness_change'] = videoBrightness_change;
        debug_variables['assistant']['videoBrightness_temp'] = videoBrightness_temp;
        debug_variables['assistant']['videoContrast'] = videoContrast;
        debug_variables['assistant']['videoContrast_change'] = videoContrast_change;
        debug_variables['assistant']['videoContrast_temp'] = videoContrast_temp;
        debug_variables['assistant']['videoGrayscale'] = videoGrayscale;
        debug_variables['assistant']['videoGrayscale_change'] = videoGrayscale_change;
        debug_variables['assistant']['videoGrayscale_temp'] = videoGrayscale_temp;
        debug_variables['assistant']['videoHue'] = videoHue;
        debug_variables['assistant']['videoHue_change'] = videoHue_change;
        debug_variables['assistant']['videoHue_temp'] = videoHue_temp;
        debug_variables['assistant']['videoInvert'] = videoInvert;
        debug_variables['assistant']['videoInvert_change'] = videoInvert_change;
        debug_variables['assistant']['videoInvert_temp'] = videoInvert_temp;
        debug_variables['assistant']['videoSaturation'] = videoSaturation;
        debug_variables['assistant']['videoSaturation_change'] = videoSaturation_change;
        debug_variables['assistant']['videoSaturation_temp'] = videoSaturation_temp;
        debug_variables['assistant']['videoSepia'] = videoSepia;
        debug_variables['assistant']['videoSepia_change'] = videoSepia_change;
        debug_variables['assistant']['videoSepia_temp'] = videoSepia_temp;
        debug_variables['assistant']['hideSubtitles_temp'] = hideSubtitles_temp;
        debug_variables['assistant']['reset_features'] = reset_features;
        debug_variables['assistant']['news_data'] = news_data;
        debug_variables['assistant']['last_news_update'] = last_news_update;
        debug_variables['assistant']['last_news_read'] = last_news_read;
        debug_variables['assistant']['unread_news_count'] = unread_news_count;
        debug_variables['assistant']['news_update_running'] = news_update_running;
        debug_variables['assistant']['news_force_update'] = news_force_update;
        debug_variables['assistant']['news_update_interval'] = news_update_interval;

        debug_variables['rating']['enableProactiveRatings'] = enableProactiveRatings;
        debug_variables['rating']['ratings_limit_reached'] = ratings_limit_reached;
        debug_variables['rating']['ratings_version'] = ratings_version;
        debug_variables['rating']['rating_expiration_init'] = rating_expiration_init;
        debug_variables['rating']['rating_expiration_pending'] = rating_expiration_pending;
        debug_variables['rating']['rating_expiration_invalid_key'] = rating_expiration_invalid_key;
        debug_variables['rating']['rating_expiration_timeout_wiki'] = rating_expiration_timeout_wiki;
        debug_variables['rating']['rating_expiration_found_new'] = rating_expiration_found_new;
        debug_variables['rating']['rating_expiration_found_old'] = rating_expiration_found_old;
        debug_variables['rating']['rating_expiration_not_found'] = rating_expiration_not_found;
        debug_variables['rating']['rating_expiration_timeout'] = rating_expiration_timeout;
        debug_variables['rating']['rating_expiration_limit'] = rating_expiration_limit;
        debug_variables['rating']['rating_expiration_error'] = rating_expiration_error;

        debug_variables['api']['omdbApi'] = cfg['omdbApi']['val'];

        debug_variables['cfg']['cfg_loaded'] = cfg_loaded;
        debug_variables['cfg']['cfg_loading_start'] = cfg_loading_start;
        debug_variables['cfg']['cfg_loading_end'] = cfg_loading_end;
        debug_variables['cfg'] = cfg;

        debug_variables['statistics'] = stats_counter;
        debug_variables['ratingsDB'] = ratingsDB;
        debug_variables['overflowData'] = overflowData;
        debug_variables['simulation_objects'] = simulation_objects;

        debug_variables['storage']['watchHistory'] = watchHistory;
    } catch (e) {
        error_detected = true;
        error_message = 'environment_update: ' + e.stack;
    }
}

function add_stats_count(stat_key) {
    try {
        if (!stats_counter.hasOwnProperty('collection_start')) {
            stats_counter['collection_start'] = JSON.stringify(new Date()).replace(/\"/gi, '');
        }
        if (stats_counter.hasOwnProperty(stat_key)) {
            stats_counter[stat_key]++;
        } else {
            stats_counter[stat_key] = 1;
        }
    } catch (e) {}
}

function inject_styles() {
    for (var style_name in styles_list) {
        if (!document.getElementById('netflix_extended_styles_' + style_name)) {
            addStyle(style_name);
        } else {
            if (document.getElementById('netflix_extended_styles_' + style_name).getAttribute('run_id') != run_id.toString()) {
                removeDOM(document.getElementById('netflix_extended_styles_' + style_name));
                addStyle(style_name)
            }
        }
    }
}

function addStyle(style_name) {
    var cache_disabler = '';
    if (!styles_list[style_name]['cache']) {
        cache_disabler = '?_=' + run_id;
    }
    var style = document.createElement('link');
    style.setAttribute('id', 'netflix_extended_styles_' + style_name);
    style.setAttribute('href', styles_list[style_name]['src'] + cache_disabler);
    style.setAttribute('rel', 'stylesheet');
    style.setAttribute('type', 'text/css');
    style.setAttribute('run_id', run_id);

    netflix_head.appendChild(style);
}

function normalize_version(version, pads) {
    try {
        var version_chunks = version.split('.');
        for (var i = 0; i < version_chunks.length; i++) {
            version_chunks[i] = version_chunks[i].padStart(pads, '0');
        }
        return parseInt(version_chunks.join(''));
    } catch (e) {return 0;}
}

function load_debug_variables() {
    return JSON.stringify(debug_variables);
}

function checkIfOrphan() {
    var port;
    try {
        port = chrome.runtime.connect();
    }
    catch (e) {
        port = false;
    }

    if (port) {
        port.disconnect();
        isOrphan = false;
    } else {
        /*if (!isOrphan) {
            log('output', '', getLang('status_text_update'));
        }*/
        isOrphan = true;
    }
}

function code_to_key(code) {
    var key = getLang('option_unknown');
    for (var i = 0; i < keybinds.length; i++) {
        if (code == keybinds[i][1]) {
            key = keybinds[i][0];
        }
    }
    return key;
}

function key_to_code(key) {
    var code = getLang('option_unknown');
    for (var i = 0; i < keybinds.length; i++) {
        if (key == keybinds[i][0]) {
            key = keybinds[i][1];
        }
    }
    return code;
}

function getApiKey(api_name, default_key) {
    if (cfg[api_name]['type'] == 'api') {
        if (cfg[api_name]['val'] == cfg[api_name]['def']) {
            return default_key
        } else {
            return cfg[api_name]['val'];
        }
    } else {
        log('error', '', getLang('wrong_configuration_type'), api_name, cfg[api_name]['type'], 'api');
    }
}

function findChildId(object, id) {
    if (object != null && id != null) {
        return object.querySelector('#' + id);
    }

    return null;
}

function findChildTag(object, tag) {
    if (object != null && tag != null) {
        return object.querySelector(tag);
    }

    return null;
}

function findChildClass(object, class_name) {
    if (object != null && class_name != null) {
        return object.getElementsByClassName(class_name)[0];
    }

    return null;
}

function findChildClassElms(object, class_name) {
    if (object != null && class_name != null) {
        return object.getElementsByClassName(class_name);
    }

    return null;
}

function url_encode(value) {
    return encodeURIComponent(value).replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16);
    });
}

Date.prototype.addMilliseconds = function(milliseconds) {
    this.setMilliseconds(this.getMilliseconds() + milliseconds);
    return this;
};

Date.prototype.addSeconds = function(seconds) {
    this.setSeconds(this.getSeconds() + seconds);
    return this;
};

Date.prototype.addMinutes = function(minutes) {
    this.setMinutes(this.getMinutes() + minutes);
    return this;
};

Date.prototype.addHours = function(hours) {
    this.setHours(this.getHours() + hours);
    return this;
};

Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + days);
    return this;
};

Date.prototype.addWeeks = function(weeks) {
    this.addDays(weeks*7);
    return this;
};

Date.prototype.addMonths = function (months) {
    var dt = this.getDate();

    this.setMonth(this.getMonth() + months);
    var currDt = this.getDate();

    if (dt !== currDt) {
        this.addDays(-currDt);
    }

    return this;
};

Date.prototype.addYears = function(years) {
    var dt = this.getDate();

    this.setFullYear(this.getFullYear() + years);

    var currDt = this.getDate();

    if (dt !== currDt) {
        this.addDays(-currDt);
    }

    return this;
};

function checkVisibility() {
    hiddenCFG = false;

    switch(cfg['pauseOnBlur']['val']) {
        case 'disabled':
            hiddenCFG = false;
            break;
        case 'low':
            if (!visibleAPI) {
                hiddenCFG = true;
            }
            break;
        case 'high':
            if (!visibleWND) {
                hiddenCFG = true;
            }
            break;
        default:
            hiddenCFG = false;
            break;
    }
}

function checkNews() {
    // TODO: This feature is not supported on production environment until we request permissions for URL providing news
    if (isProd) {
        return;
    }

    if (!isOrphan) {
        // Check if news are expired and if yes, download current news
        var news_expiration = new Date(last_news_update).addMinutes(news_update_interval);
        if ((news_expiration < new Date() || news_force_update) && !news_update_running) {
            news_update_running = true;
            var loading_icon = document.getElementById('news_loading_icon');
            if (loading_icon) {
                loading_icon.style.display = 'inline';
            }

            // Download latest news data
            $.ajax({
                // Configuration
                type: 'GET',
                url: news_urls['news'],
                timeout: 10000,
                cache: false,
                async: true,
                crossDomain: true,
                dataType: 'text',
                global: true, // ajaxStart/ajaxStop
                // Data
                data: {},
                // Actions
                beforeSend: function() {
                    log('debug', 'news', news_urls['news']);
                    log('info', '', getLang('checking_news'));
                },
                success: function(result, status, xhr) {
                    log('debug', 'news', 'Received news data:');
                    log('debug', 'news', result);

                    try {
                        var news_created = 0;
                        var news_updated = 0;
                        var news_removed = 0;
                        var data_new = {};
                        var data = JSON.parse(nvl(result, "{}"), JSON.dateParser);

                        for (var key in data) {
                            if (data.hasOwnProperty(key)) {
                                var news_item = data[key];
                                var entry = generate_news_entry(news_item);

                                // Check if news message is still/already valid
                                if ((new Date() >= news_item['valid_from'] || news_item['valid_from'] == '') && (new Date() <= news_item['valid_to'] || news_item['valid_to'] == '')) {
                                    // Check if key already exists
                                    if (news_data.hasOwnProperty(key)) {
                                        // Update existing entry and keep created at timestamp
                                        data[key]['received_at'] = news_data[key]['received_at'];
                                        data[key]['updated_at'] = news_data[key]['updated_at'];
                                        log('debug', 'news', JSON.stringify(objSortByKey(news_data[key], 'asc')));
                                        log('debug', 'news', JSON.stringify(objSortByKey(data[key], 'asc')));

                                        if (JSON.stringify(objSortByKey(news_data[key], 'asc')) != JSON.stringify(objSortByKey(data[key], 'asc'))) {
                                            entry['received_at'] = news_data[key]['received_at'];
                                            news_updated++;
                                            log('debug', 'news', 'Entry updated.');
                                        } else {
                                            entry = news_data[key];
                                        }
                                    } else {
                                        // Create new entry
                                        news_created++;
                                        log('debug', 'news', 'Entry created.');
                                    }

                                    data_new[key] = entry;
                                }
                            }
                        }
                        // Count removed entries
                        for (var key in news_data) {
                            if (news_data.hasOwnProperty(key)) {
                                if (!data_new.hasOwnProperty(key)) {
                                    news_removed++;
                                }
                            }
                        }

                        log('debug', 'news', 'News data:');
                        log('debug', 'news', news_data);
                        log('debug', 'news', 'Data new:');
                        log('debug', 'news', data_new);

                        news_data = data_new;

                        // If there were changes perform updates
                        log('debug', 'news', fillArgs('news_created = {0}, news_updated = {1}, news_removed = {2}', news_created, news_updated, news_removed));
                        if (news_created != 0 || news_updated != 0 || news_removed != 0) {
                            localStorage.setItem('netflex_newsData', JSON.stringify(news_data));

                            // Generate data and show them to user
                            generate_news_content(false);
                        }
                    } catch (e) {
                        log('debug', 'news', 'NEWS ERROR (success): ' + e.message);
                    }
                },
                error: function(xhr, status, error) {
                    log('debug', 'news', 'NEWS ERROR (error): ' + error);
                    //log('debug', 'news', xhr);
                },
                complete: function(xhr, status) {
                    last_news_update = new Date();
                    localStorage.setItem('netflex_lastNewsUpdate', JSON.stringify(last_news_update));
                    news_update_running = false;
                    var loading_icon = document.getElementById('news_loading_icon');
                    if (loading_icon) {
                        loading_icon.style.display = 'none';
                    }
                }
            });

            news_force_update = false;
        }

        // If news are opened mark constantly as read
        if (news_opened) {
            last_news_read = new Date();
            localStorage.setItem('netflex_lastNewsRead', JSON.stringify(last_news_read));
        }

        // Count new entries
        var news_counter = 0;
        for (var key in news_data) {
            if (news_data.hasOwnProperty(key)) {
                if (last_news_read < news_data[key]['received_at']) {
                    news_counter++;
                }
            }
        }
        unread_news_count = news_counter;

        // Handle status bubble data update
        var elm1 = document.getElementById('extension_news');
        var elm2 = document.getElementById('extension_unread_news_count');
        if (elm1 && elm2) {
            var formatted_news_unread_count = notification_format(unread_news_count);
            if (elm2.innerText != formatted_news_unread_count) {
                if (formatted_news_unread_count != '') {
                    elm1.classList.add('unread');
                } else {
                    elm1.classList.remove('unread');
                }
                addDOM(elm2, formatted_news_unread_count);
            }
        }
    }
}

function checkProfile() {
    netflix_profile = localStorage.getItem('netflex_profile');
    var netflix_profile_copy = netflix_profile;
    if (netflix_profile) {
        // If we are on browse page we can determine what profile is used
        if (check_browse()) {
            if (check_kids()) {
                netflix_profile = 'kids';
            } else {
                netflix_profile = 'general';
            }
        } else {
            // Keep profile that is stored
        }
    } else {
        // If nothing is set, lets use general profile as default
        netflix_profile = 'general';
    }

    if (netflix_profile != netflix_profile_copy) {
        localStorage.setItem('netflex_profile', netflix_profile);
    }
}

function notification_format(count) {
    if (count == 0) {
        count = '';
    } else {
        if (count > 99) {
            count = '99+ ';
        } else {
            count = count + ' ';
        }
    }
    return count;
}

function objSortByKey(obj, sort) {
    if (sort.toLowerCase() == 'desc') {
        return Object.keys(obj).sort().reverse().reduce(function (result, key) {
            result[key] = obj[key];
            return result;
        }, {});
    } else {
        return Object.keys(obj).sort().reduce(function (result, key) {
            result[key] = obj[key];
            return result;
        }, {});
    }
}

function convertToInterval(seconds) {
    var interval = '';
    var sec = Math.floor(seconds);
    var int_days = Math.floor(sec / 86400);
    var int_hours = Math.floor(((sec % 31536000) % 86400) / 3600);
    var int_mins = Math.floor((((sec % 31536000) % 86400) % 3600) / 60).toString();
    var int_secs = ((((sec % 31536000) % 86400) % 3600) % 60).toString();

    if (int_days != 0) {
        interval += int_days + ' ';
    }

    if (int_hours != 0) {
        interval += int_hours + ':';
    }

    interval += int_mins.padStart(2, '0') + ':' + int_secs.padStart(2, '0');

    return interval;
}

function addTimeFraction(counter, millies) {
    // Calculate fraction with more precession to avoid Floating-Point problem
    // https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html
    var counter_after = Math.round((counter + ((1 / 1000) * millies)) * 10) / 10;
    log('debug', 'fractions_counter', 'Time fractions - counter before: ' + counter + '; millies: ' + millies + '; counter after: ' + counter_after + '.');
    return counter_after;
}

function isElmVisible(elm, parent) {
    var elRect = elm.getBoundingClientRect();
    var parRect = parent.getBoundingClientRect();
    elRect = {
        left: elRect.left,
        top: elRect.top,
        right: elRect.right,
        bottom: elRect.bottom,
        width: elRect.width,
        height: elRect.height,
        x: elRect.x,
        y: elRect.y,
        visibleWidth: elRect.width,
        visibleHeight: elRect.height,
        isVisible: true,
        isContained: true
    };
    parRect = {
        left: parRect.left,
        top: parRect.top,
        right: parRect.right,
        bottom: parRect.bottom,
        width: parRect.width,
        height: parRect.height,
        x: elRect.x,
        y: elRect.y,
        visibleWidth: parRect.width,
        visibleHeight: parRect.height
    };

    var visibility_score = 0;
    if (parRect.height > elRect.height && parRect.width > elRect.width) {
        // If child element is smaller compared to parent, it can be either not visible, partially visible or fully visible
        if (parRect.top < elRect.top && parRect.bottom > elRect.top) {visibility_score++}
        if (parRect.top < elRect.bottom && parRect.bottom > elRect.bottom) {visibility_score++}
        if (parRect.left < elRect.left && parRect.right > elRect.left) {visibility_score++}
        if (parRect.left < elRect.right && parRect.right > elRect.right) {visibility_score++}
    } else {
        // If child element is larger compared to parent, it can be either not visible or partially visible
        if (elRect.top < parRect.top && elRect.bottom > parRect.top) {visibility_score++}
        if (elRect.top < parRect.bottom && elRect.bottom > parRect.bottom) {visibility_score++}
        if (elRect.left < parRect.left && elRect.right > parRect.left) {visibility_score++}
        if (elRect.left < parRect.right && elRect.right > parRect.right) {visibility_score++}
    }

    if (visibility_score == 4) {
        return true;
    }
    return false;
};

function str2bool(value, default_value) {
    try {
        if (value == 'true') {
            return true;
        } else if (value == 'false') {
            return false;
        } else {
            return default_value;
        }
    } catch (e) {return default_value;}
}

function isArray(value) {
    return value && typeof value === 'object' && value.constructor === Array;
}

function isObject(value) {
    return value && typeof value === 'object' && value.constructor === Object;
}

function isNull(value) {
    return value === null;
}

function isRegExp(value) {
    return value && typeof value === 'object' && value.constructor === RegExp;
}

function isDate(value) {
    return value instanceof Date;
}

function html_indent(node, level) {
    var indentBefore = new Array(level++ + 1).join('  ');
    var indentAfter  = new Array(level - 1).join('  ');
    var textNode;

    for (var i = 0; i < node.children.length; i++) {
        textNode = document.createTextNode('\n' + indentBefore);
        node.insertBefore(textNode, node.children[i]);

        html_indent(node.children[i], level);

        if (node.lastElementChild == node.children[i]) {
            textNode = document.createTextNode('\n' + indentAfter);
            node.appendChild(textNode);
        }
    }

    return node;
}

function obj2html(obj) {
    if (!obj) {
        return '<table><tr><th>' + getLang('debug_variables_nodata') + '</th></tr></table>';
    }

    var result = '';
    var lastKey = '';

    Object.keys(obj).map(function(key) {
        lastKey = key;

        var highlight = '';
        if (key == 'val') {
            highlight = ' highlight';
        }

        if (isNull(obj[key])) {
            result +=  '<tr><th><span class="sticky">' + key + '</span></th><td class="td_type"><span class="sticky">undefined</span></td><td class="td_value' + highlight + '">null</td></tr>';
        } else if (isDate(obj[key])) {
            result +=  '<tr><th><span class="sticky">' + key + '</span></th><td class="td_type"><span class="sticky">date</span></td><td class="td_value' + highlight + '">' + obj[key] + '</td></tr>';
        } else if (isArray(obj[key])) {
            result +=  '<tr><th><span class="sticky">' + key + '</span></th><td class="td_type"><span class="sticky">array (' + obj[key].length + ')</span></td><td class="td_value' + highlight + '">' + obj2html(obj[key]) + '</td></tr>';
        } else if (isObject(obj[key])) {
            result +=  '<tr><th><span class="sticky">' + key + '</span></th><td class="td_type"><span class="sticky">object (' + Object.keys(obj[key]).length + ')</span></td><td class="td_value' + highlight + '">' + obj2html(obj[key]) + '</td></tr>';
        } else {
            result += '<tr><th><span class="sticky">' + key + '</span></th><td class="td_type"><span class="sticky">' + typeof(obj[key]) + '</span></td><td class="td_value' + highlight + '">' + (( typeof(obj[key]) !== 'string' ) ? obj[key] : obj[key].toString().replace(/&/gi, '&amp;').replace(/</gi, '&lt;').replace(/>/gi, '&gt;') ) + '</td></tr>';
        }
    });

    if (result == '') {
        if (lastKey == '') {
            result = '<tr><th>-</th><td class="td_type">' + typeof(obj) + '</td><td class="td_value">' + getLang('debug_variables_nodata') + '</td></tr>';
        } else {
            result = '<tr><th>-</th><td class="td_type">' + typeof(obj) + '</td><td class="td_value">' + fillArgs(getLang('debug_variables_noloop'), lastKey) + '</td></tr>';
        }
    }

    return '<table>' + result + '</table>';
}

function process_debug_variables(data, error, filter) {
    try {
        var debug_variables = JSON.parse(data, JSON.dateParser);

        var filter_type = typeof filter;
        if (filter_type === 'object') {
            for (var key in debug_variables) {
                if (debug_variables.hasOwnProperty(key)) {
                    if (!filter.includes(key)) {
                        delete debug_variables[key];
                    }
                }
            }
        }

        if (error) {
            debug_variables = {};
            debug_variables['error'] = error;
        }

        return obj2html(debug_variables);
    } catch (e) {
        return '<table><tr><th>' + getLang('error_message') + e.message + '.</th></tr></table>'
    }
}

function addDOM(object, content) {
    // Sanitize content
    var options = {
        // Added chrome-extension:// or moz-extension:// to allowed URI protocols, original regex copied from lib developer
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx|(.+)-extension):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        // jQuery used to remove warning on Firefox
        SAFE_FOR_JQUERY: true,
        ADD_TAGS: [
            'use'
        ],
        ADD_ATTR: [
            // Allow attribute target to open links on new page "_blank"
            'target'
        ]
    };
    var cleanHTML = DOMPurify.sanitize(content, options);

    log('group_start', 'dom_activities', 'Add HTML content to DOM object for {0}()', nvl(arguments.callee.caller.name, 'function'));
    log('debug', 'dom_activities', 'DOM object:');
    log('debug', 'dom_activities', object);
    log('debug', 'dom_activities', 'HTML content before sanitizing:');
    log('debug', 'dom_activities', content);
    log('debug', 'dom_activities', 'HTML content after sanitizing:');
    log('debug', 'dom_activities', cleanHTML);
    log('group_end', 'dom_activities', '');

    // Insert sanitized content
    //object.innerHTML = cleanHTML;
    $(object).html(cleanHTML);
}

function removeDOM(object) {
    if (object) {
        log('group_start', 'dom_activities', 'Remove DOM object for {0}()', nvl(arguments.callee.caller.name, 'function'));
        log('debug', 'dom_activities', 'DOM object:');
        log('debug', 'dom_activities', object);
        log('group_end', 'dom_activities', '');

        // Remove object
        object.parentNode.removeChild(object);
    }
}

function doClick(object) {
    log('group_start', 'dom_activities', 'Click on DOM object for {0}()', nvl(arguments.callee.caller.name, 'function'));
    log('debug', 'dom_activities', 'DOM object:');
    log('debug', 'dom_activities', object);
    log('group_end', 'dom_activities', '');

    // Prevent all actions when upsell information is shown to avoid unwanted Netflix plan changes
    if (check_upsell()) {
        return;
    }

    // Click object
    object.click();
}

function addCSS(object, css) {
    // Parse existing styles
    var css_current = {};
    if (object.style.cssText != '') {
        var css_current_list = object.style.cssText.split(';');
        for (var i = 0; i < css_current_list.length; i++) {
            if (css_current_list[i].toString().trim() != '') {
                var css_current_split = css_current_list[i].toString().trim().split(':');
                css_current[css_current_split[0].toString().trim().toLowerCase()] = css_current_split[1].toString().trim();
            }
        }
    }

    // Merge styles lists
    var css_merge = JSON.parse(JSON.stringify(css_current));
    for (var key in css) {
        if (css.hasOwnProperty(key)) {
            if (key.toString().trim() != '' && css[key].toString().trim() != '') {
                css_merge[key.toString().trim().toLowerCase()] = css[key].toString().trim();
            }
        }
    }

    // Convert to string
    var css_list = [];
    for (var key in css_merge) {
        if (css_merge.hasOwnProperty(key)) {
            var css_prop = fillArgs('{0}: {1};', key, css_merge[key]);
            css_list.push(css_prop);
        }
    }
    var css_text = css_list.join(' ');

    log('group_start', 'dom_activities', 'Add CSS merged styles for {0}()', nvl(arguments.callee.caller.name, 'function'));
    log('debug', 'dom_activities', 'DOM object:');
    log('debug', 'dom_activities', object);
    log('debug', 'dom_activities', 'CSS styles before merge:');
    log('debug', 'dom_activities', css_current);
    log('debug', 'dom_activities', 'CSS styles to merge:');
    log('debug', 'dom_activities', css);
    log('debug', 'dom_activities', 'CSS styles after merge:');
    log('debug', 'dom_activities', css_merge);
    log('group_end', 'dom_activities', '');

    // Use new merged styles
    object.style.cssText = css_text;
}

function logEvent(information) {
    log('debug', 'dom_events', 'Event triggered originating from object related to: {0}.', information);
}

// Generate debug output to be analysed
// show_debug_variables('html');
function show_debug_variables(type) {
    var debug_content = '';
    if (!type || type == 'json') {
        log('output', '', getLang('show_debug_variables_hint_json'));

        debug_content = JSON.parse(load_debug_variables(), JSON.dateParser);
    }
    if (type == 'html') {
        log('output', '', getLang('show_debug_variables_hint_html'));

        // Create elements, their attributes and contents
        var debug_html = document.createElement('html');
        debug_html.setAttribute('lang', 'en');

        var debug_head = document.createElement('head');

        var debug_title = document.createElement('title');
        addDOM(debug_title, 'Debug variables');

        var debug_css = document.createElement('link');
        debug_css.setAttribute('rel', 'stylesheet');
        debug_css.setAttribute('href', 'devtools.css');

        var debug_body = document.createElement('body');
        addDOM(debug_body, process_debug_variables(load_debug_variables(), false, 'none'));

        // Join elements
        debug_head.appendChild(debug_title);
        debug_head.appendChild(debug_css);

        debug_html.appendChild(debug_head);
        debug_html.appendChild(debug_body);

        debug_content = debug_html;

        // Indent code
        debug_content = html_indent(debug_content, 0);
    }
    log('output', '', debug_content);
}

// To shut Firefox up, keep it a last line (result is non-structured-cloneable data message)
undefined;