function apply_version(version) {
    localStorage.setItem('netflex_appliedVersion', version);
    applied_version = localStorage.getItem('netflex_appliedVersion');
    applied_version_normalized = normalize_version(applied_version, 4);
}

function localStorage_rename(key_from, key_to) {
    log('info', '', getLang('versions_rename_localStorage'), key_from, key_to);
    if (localStorage.getItem(key_from)) {
        localStorage.setItem(key_to, localStorage.getItem(key_from));
        localStorage.removeItem(key_from);
    }
}

function cfg_rename(cfg_key_from, cfg_key_to) {
    try {
        log('info', '', getLang('versions_rename_variable'), cfg_key_from, cfg_key_to);
        chrome.storage.local.get(cfg_key_from, function(result) {
            if (result[cfg_key_from] !== undefined) {
                var new_cfg = {};
                new_cfg[cfg_key_to] = result[cfg_key_from].toString();
                chrome.storage.local.set(new_cfg, function() {});
            }
        });
        chrome.storage.local.remove([cfg_key_from],function(){});
        log('info', '', getLang('success'));
    } catch (e) {log('error', '', getLang('failed'));}
}

function cfg_remove(cfg_key) {
    try {
        log('info', '', getLang('versions_remove_variable'), cfg_key);
        chrome.storage.local.remove(cfg_key, function() {});
        log('info', '', getLang('success'));
    } catch (e) {log('error', '', getLang('failed'));}
}

function stat_rename(stat_key_from, stat_key_to) {
    try {
        log('info', '', getLang('versions_rename_stats'), stat_key_from, stat_key_to);
        var stats_data = {};
        if (localStorage.getItem('netflex_statistics') !== null) {
            stats_data = JSON.parse(localStorage.getItem('netflex_statistics'));
            if (stats_data.hasOwnProperty(stat_key_from)) {
                stats_data[stat_key_to] = stats_data[stat_key_from];
                delete stats_data[stat_key_from];
                localStorage.setItem('netflex_statistics', JSON.stringify(stats_data));
            }
        }
        log('info', '', getLang('success'));
    } catch (e) {log('error', '', getLang('failed'));}
}

function stat_remove(stat_key) {
    try {
        log('info', '', getLang('versions_remove_stats'), stat_key);
        var stats_data = {};
        if (localStorage.getItem('netflex_statistics') !== null) {
            stats_data = JSON.parse(localStorage.getItem('netflex_statistics'));
            if (stats_data.hasOwnProperty(stat_key)) {
                delete stats_data[stat_key];
                localStorage.setItem('netflex_statistics', JSON.stringify(stats_data));
            }
        }
        log('info', '', getLang('success'));
    } catch (e) {log('error', '', getLang('failed'));}
}

function version_consistency_changes() {
    log('info', '', getLang('extension_version'), extension_version);
    log('info', '', getLang('last_version'), last_version);
    log('info', '', getLang('previous_version'), previous_version);
    log('info', '', getLang('applied_version'), applied_version);

    // Fix situation when updating to 6.2.8 and last version is not defined
    if (extension_version_normalized == normalize_version('6.2.8', 4) && !last_version) {
        localStorage.setItem('netflex_lastVersion', '6.2.7');
        last_version = localStorage.getItem('netflex_lastVersion');
        last_version_normalized = normalize_version(last_version, 4);
        apply_version(last_version);
    }

    // Check if versions changed and apply version specific changes if needed
    if (last_version != extension_version) {
        // If there is no applied version, set last known working version
        if (!applied_version && last_version) {
            apply_version(last_version);
        }

        // In case when there is clean installation when last version in not available or when during debugging applied
        // version might be higher then current version we set value of current version
        if (!applied_version || applied_version_normalized > extension_version_normalized) {
            apply_version(extension_version);
        }

        /*****************************************
        *     APPLY VERSION SPECIFIC CHANGES     *
        *****************************************/

        // Before 4.2.0
        if (applied_version_normalized < normalize_version('4.2.0', 4)) {
            log('info', '', getLang('version_changes'), '4.2.0');

            // Configuration variable highlightSubtitles converted from boolean to number
            try {
                log('info', '', getLang('versions_reset_data'), 'highlightSubtitles');
                chrome.storage.local.set({ 'highlightSubtitles': 0 }, function() {});
                log('info', '', getLang('success'));
            } catch (e) {log('error', '', getLang('failed'));}

            apply_version('4.2.0');
        }

        // Before 4.8.0
        if (applied_version_normalized < normalize_version('4.8.0', 4)) {
            log('info', '', getLang('version_changes'), '4.8.0');

            // Configuration variable disableTouchscreen removed
            cfg_remove('disableTouchscreen');

            apply_version('4.8.0');
        }

        // Before 4.15.0
        if (applied_version_normalized < normalize_version('4.15.0', 4)) {
            log('info', '', getLang('version_changes'), '4.15.0');

            // Configuration variable skipInterupter renamed to skipInterrupter
            cfg_rename('skipInterupter', 'skipInterrupter');

            apply_version('4.15.0');
        }

        // Before 4.15.1
        if (applied_version_normalized < normalize_version('4.15.1', 4)) {
            log('info', '', getLang('version_changes'), '4.15.1');

            // Configuration variable nextEpisodeStop renamed to nextEpisodeStopSeries
            cfg_rename('nextEpisodeStop', 'nextEpisodeStopSeries');

            apply_version('4.15.1');
        }

        // Before 5.1.0
        if (applied_version_normalized < normalize_version('5.1.0', 4)) {
            log('info', '', getLang('version_changes'), '5.1.0');

            // Configuration variable trailerAudioMute removed
            cfg_remove('trailerAudioMute');

            // Configuration variable trailerRemove renamed to trailerVideoStop
            cfg_rename('trailerRemove', 'trailerVideoStop');

            apply_version('5.1.0');
        }

        // Before 6.0.0
        if (applied_version_normalized < normalize_version('6.0.0', 4)) {
            log('info', '', getLang('version_changes'), '6.0.0');

            // Configuration variable optionsInChrome renamed to optionsInBrowser
            cfg_rename('optionsInChrome', 'optionsInBrowser');

            // Configuration variable debug removed
            cfg_remove('debug');

            // Configuration variable debugVar removed
            cfg_remove('debugVar');

            // Configuration variable debugKey removed
            cfg_remove('debugKey');

            // Configuration variable debugOverflow removed
            cfg_remove('debugOverflow');

            // Configuration variable debugClear removed
            cfg_remove('debugClear');

            // Configuration variable debugGroups removed
            cfg_remove('debugGroups');

            // Configuration variable debugRatings removed
            cfg_remove('debugRatings');

            // Configuration variable exitPlayerKey converted from code to key
            try {
                log('info', '', getLang('versions_reset_data'), 'exitPlayerKey');
                chrome.storage.local.get(['exitPlayerKey'], function(result) {
                    if (result['exitPlayerKey'] !== undefined && !isNaN(result['exitPlayerKey'])) {
                        chrome.storage.local.set({ 'exitPlayerKey': code_to_key(result['exitPlayerKey']) }, function() {});
                    }
                });
                log('info', '', getLang('success'));
            } catch (e) {log('error', '', getLang('failed'));}

            // Configuration variable prevEpisodeKey converted from code to key
            try {
                log('info', '', getLang('versions_reset_data'), 'prevEpisodeKey');
                chrome.storage.local.get(['prevEpisodeKey'], function(result) {
                    if (result['prevEpisodeKey'] !== undefined && !isNaN(result['prevEpisodeKey'])) {
                        chrome.storage.local.set({ 'prevEpisodeKey': code_to_key(result['prevEpisodeKey']) }, function() {});
                    }
                });
                log('info', '', getLang('success'));
            } catch (e) {log('error', '', getLang('failed'));}

            // Configuration variable nextEpisodeKey converted from code to key
            try {
                log('info', '', getLang('versions_reset_data'), 'nextEpisodeKey');
                chrome.storage.local.get(['nextEpisodeKey'], function(result) {
                    if (result['nextEpisodeKey'] !== undefined && !isNaN(result['nextEpisodeKey'])) {
                        chrome.storage.local.set({ 'nextEpisodeKey': code_to_key(result['nextEpisodeKey']) }, function() {});
                    }
                });
                log('info', '', getLang('success'));
            } catch (e) {log('error', '', getLang('failed'));}

            // Configuration variable randomMovieKey converted from code to key
            try {
                log('info', '', getLang('versions_reset_data'), 'randomMovieKey');
                chrome.storage.local.get(['randomMovieKey'], function(result) {
                    if (result['randomMovieKey'] !== undefined && !isNaN(result['randomMovieKey'])) {
                        chrome.storage.local.set({ 'randomMovieKey': code_to_key(result['randomMovieKey']) }, function() {});
                    }
                });
                log('info', '', getLang('success'));
            } catch (e) {log('error', '', getLang('failed'));}

            // Configuration variable highlightSubtitles converted from number to string
            try {
                log('info', '', getLang('versions_reset_data'), 'highlightSubtitles');
                chrome.storage.local.get(['highlightSubtitles'], function(result) {
                    if (result['highlightSubtitles'] !== undefined && !isNaN(result['highlightSubtitles'])) {
                        var new_value = 'disabled';
                        switch (result['highlightSubtitles'].toString()) {
                            case '-1':
                                new_value = 'hidden';
                                break;
                            case '0':
                                new_value = 'disabled';
                                break;
                            case '1':
                                new_value = 'shadow';
                                break;
                            case '2':
                                new_value = 'background';
                                break;
                        }
                        chrome.storage.local.set({ 'highlightSubtitles': new_value }, function() {});
                    }
                });
                log('info', '', getLang('success'));
            } catch (e) {log('error', '', getLang('failed'));}

            // Configuration variable pauseOnBlur converted from number to string
            try {
                log('info', '', getLang('versions_reset_data'), 'pauseOnBlur');
                chrome.storage.local.get(['pauseOnBlur'], function(result) {
                    if (result['pauseOnBlur'] !== undefined && !isNaN(result['pauseOnBlur'])) {
                        var new_value = 'disabled';
                        switch (result['pauseOnBlur'].toString()) {
                            case '0':
                                new_value = 'disabled';
                                break;
                            case '1':
                                new_value = 'low';
                                break;
                            case '2':
                                new_value = 'high';
                                break;
                        }
                        chrome.storage.local.set({ 'pauseOnBlur': new_value }, function() {});
                    }
                });
                log('info', '', getLang('success'));
            } catch (e) {log('error', '', getLang('failed'));}

            apply_version('6.0.0');
        }

        // Before 6.1.1
        if (applied_version_normalized < normalize_version('6.1.1', 4)) {
            log('info', '', getLang('version_changes'), '6.1.1');

            // Old configuration used to store boolean as boolean but current configuration stores everything as string
            // All boolean configuration values have to be converted from boolean to string
            var cfg_list = [];
            for (var key in cfg) {
                if (cfg[key]['type'] == 'bool') {
                    cfg_list.push(key);
                }
            }
            if (cfg_list.length != 0) {
                var cfg_fix_list = {};
                chrome.storage.local.get(cfg_list, function (conf) {
                    for (var key in conf) {
                        if (typeof conf[key] == 'boolean') {
                            cfg_fix_list[key] = conf[key].toString();
                        }
                    }
                    if (Object.keys(cfg_fix_list).length != 0) {
                        chrome.storage.local.set(cfg_fix_list, function () {});
                    }
                });
            }

            apply_version('6.1.1');
        }

        // Before 6.2.2
        if (applied_version_normalized < normalize_version('6.2.2', 4)) {
            log('info', '', getLang('version_changes'), '6.2.2');

            // Configuration variable styleHandlerTimer removed
            cfg_remove('styleHandlerTimer');

            // Configuration variable optionsInBrowser removed
            cfg_remove('optionsInBrowser');

            apply_version('6.2.2');
        }

        // Before 6.2.4
        // NOTE: hideStatusIcon returns in version 6.4.3, it should work the same way from configuration perspective
        //       so we don't need to remove it from old version in case someone is using the old version still
        /*if (applied_version_normalized < normalize_version('6.2.4', 4)) {
            log('info', '', getLang('version_changes'), '6.2.4');

            // Configuration variable hideStatusIcon removed
            cfg_remove('hideStatusIcon');

            apply_version('6.2.4');
        }*/

        // Before 6.2.8
        if (applied_version_normalized < normalize_version('6.2.8', 4)) {
            log('info', '', getLang('version_changes'), '6.2.8');

            // Rename local storage items
            localStorage_rename('previousVersion', 'netflex_previousVersion');
            localStorage_rename('appliedVersion', 'netflex_appliedVersion');
            localStorage_rename('lastVersion', 'netflex_lastVersion');
            localStorage_rename('ratingsDB', 'netflex_ratingsDB');
            localStorage_rename('watchHistory', 'netflex_watchHistory');
            localStorage_rename('lastForceReload', 'netflex_lastForceReload');
            localStorage_rename('profile', 'netflex_profile');

            // Rename ratings states
            log('info', '', getLang('adjusting_stored_data'));
            var ratingsDB_tmp = {};
            if (localStorage.getItem('netflex_ratingsDB') !== null) {
                ratingsDB_tmp = JSON.parse(localStorage.getItem('netflex_ratingsDB'));
            }
            for (var key in ratingsDB_tmp[ratings_version]) {
                // State finished renamed to api_finished
                if (ratingsDB_tmp[ratings_version][key]['state'] == 'finished') {
                    ratingsDB_tmp[ratings_version][key]['state'] = 'api_finished';
                }
                // State not_available renamed to api_not_available
                if (ratingsDB_tmp[ratings_version][key]['state'] == 'not_available') {
                    ratingsDB_tmp[ratings_version][key]['state'] = 'api_not_available';
                }
                // State timeout renamed to api_timeout
                if (ratingsDB_tmp[ratings_version][key]['state'] == 'timeout') {
                    ratingsDB_tmp[ratings_version][key]['state'] = 'api_timeout';
                }
                // State limit renamed to api_limit
                if (ratingsDB_tmp[ratings_version][key]['state'] == 'limit') {
                    ratingsDB_tmp[ratings_version][key]['state'] = 'api_limit';
                }
                // State invalid renamed to api_invalid
                if (ratingsDB_tmp[ratings_version][key]['state'] == 'invalid') {
                    ratingsDB_tmp[ratings_version][key]['state'] = 'api_invalid';
                }
            }
            localStorage.setItem('netflex_ratingsDB', JSON.stringify(ratingsDB_tmp));

            // Changing default intervals
            chrome.storage.local.set({'startupTimer': 200}, function() {});
            chrome.storage.local.set({'injectorTimer': 200}, function() {});

            apply_version('6.2.8');
        }

        // Before 6.4.0
        if (applied_version_normalized < normalize_version('6.4.0', 4)) {
            log('info', '', getLang('version_changes'), '6.4.0');

            // Configuration variable showCategories removed
            cfg_remove('showCategories');

            apply_version('6.4.0');
        }

        // Before 6.5.0
        if (applied_version_normalized < normalize_version('6.5.0', 4)) {
            log('info', '', getLang('version_changes'), '6.5.0');

            // Configuration variable elapsedTime renamed to showElapsedTime
            cfg_rename('elapsedTime', 'showElapsedTime');

            // Statistic variable stat_nextEpisode renamed to stat_titleEndActionSkip
            stat_rename('stat_nextEpisode', 'stat_titleEndActionSkip');

            // Configuration variable nextEpisode converted from bool to option
            try {
                log('info', '', getLang('versions_reset_data'), 'nextEpisode');
                chrome.storage.local.get(['nextEpisode'], function(result) {
                    if (result['nextEpisode'] !== undefined) {
                        chrome.storage.local.set({ 'titleEndAction': 'skip' }, function() {
                            // Configuration variable nextEpisode removed
                            cfg_remove('nextEpisode');
                        });
                    } else {
                        chrome.storage.local.set({ 'titleEndAction': 'none' }, function() {
                            // Configuration variable nextEpisode removed
                            cfg_remove('nextEpisode');
                        });
                    }
                });
                log('info', '', getLang('success'));
            } catch (e) {log('error', '', getLang('failed'));}

            // Configuration variable logLevel converted from option number to option text
            try {
                log('info', '', getLang('versions_reset_data'), 'logLevel');
                chrome.storage.local.get(['logLevel'], function(result) {
                    if (result['logLevel'] !== undefined) {
                        chrome.storage.local.set({ 'logLevel': result['logLevel'].toString() }, function() {});
                    }
                });
                log('info', '', getLang('success'));
            } catch (e) {log('error', '', getLang('failed'));}

            apply_version('6.5.0');
        }

        /* - Template, add new changes to the 'Perform necessary changes' part and adjust version number
        // Before 999999.999.999
        if (applied_version_normalized < normalize_version('999999.999.999', 4)) {
            log('info', '', getLang('version_changes'), '999999.999.999');

            // Perform necessary changes

            apply_version('999999.999.999');
        }
        */

        // Mark version as up to date when changes are loaded
        load_configuration(function() {
            localStorage.setItem('netflex_previousVersion', last_version);
            localStorage.setItem('netflex_lastVersion', extension_version);
        });
    }
}