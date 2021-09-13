var error_detected = false;
var error_message = '';
var error_count = 0;
var error_reload = false;

// ------------------------
// Environment handler
// ------------------------

var environment = 'developement';
var isDev = true;
var isTest = false;
var isProd = false;
var isSimulated = false;

var extension_id = chrome.runtime.id;
var prod_extension_list = load_prod_ids();
var test_extension_list = load_test_ids();

function determine_environment() {
    if (prod_extension_list.includes(extension_id)) { // PROD
        environment = 'production';
        isDev = false;
        isTest = false;
        isProd = true;
    } else if (test_extension_list.includes(extension_id)) { // TEST
        environment = 'test';
        isDev = false;
        isTest = true;
        isProd = false;
    } else { // DEV
        environment = 'developement';
        isDev = true;
        isTest = false;
        isProd = false;
    }
}

determine_environment();

// ------------------------
// Language
// ------------------------

function getLang(key) {
    try {
        var value = lang[key];
        if (value !== undefined && value != '') {
            return lang[key]['message'];
        } else {
            log('error', '', getLang('lang_key_missing'), key);
            return '??? - ' + key;
        }
    } catch (e) {
        log('error', '', getLang('lang_key_missing'), key);
        return '??? - ' + key;
    }
}

// ------------------------
// Configuration
// ------------------------

var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
JSON.dateParser = function (key, value) {
    if (typeof value === 'string') {
        var match = reISO.exec(value);
        if (match) {
            return new Date(value);
        }
    }
    return value;
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function load_configuration(callback, cfg_changes) {
    var conf_def = {};

    for (var key in cfg) {
        var type = cfg[key]['type'];
        var value = cfg[key]['def'];

        switch (type) {
            case 'array':
                value = JSON.stringify(value);
                break;
        }

        conf_def[key] = value.toString();
    }

    try {
        chrome.storage.local.get(conf_def, function(conf) {
            log('debug', 'configuration', 'Default configuration:');
            log('debug', 'configuration', conf_def);

            for (var key in cfg) {
                try {
                    var type = cfg[key]['type'];

                    switch (type) {
                        case 'number':
                        case 'range':
                            cfg[key]['val'] = Number(conf[key]);
                            break;
                        case 'bool':
                            if (typeof conf[key] == 'boolean') {
                                cfg[key]['val'] = conf[key];
                            } else {
                                cfg[key]['val'] = ((conf[key] == 'true') ? true : false);
                            }
                            break;
                        case 'option':
                            cfg[key]['val'] = conf[key];
                            if (!cfg[key]['list'].includes(cfg[key]['val'])) {
                                cfg[key]['val'] = cfg[key]['def'];
                                log('error', '', getLang('error_invalid_value'), key);
                            }
                            break;
                        case 'array':
                            cfg[key]['val'] = JSON.parse(nvl(conf[key], '[]'), JSON.dateParser);
                            for (var i = 0; i < cfg[key]['val'].length; i++) {
                                if (!cfg[key]['list'].includes(cfg[key]['val'][i])) {
                                    cfg[key]['val'] = cfg[key]['def'];
                                    log('error', '', getLang('error_invalid_value'), key);
                                    break;
                                }
                            }
                            break;
                        default:
                            cfg[key]['val'] = conf[key];
                            break;
                    }
                } catch (e) {
                    cfg[key]['val'] = cfg[key]['def'];
                    log('error', '', getLang('error_loading_value'), key, e.message);
                }
            }

            var changed_keys = [];
            var cfg_changed = false;
            if (!cfg_changes) {
                cfg_changes = [];
            }
            for (var i = 0; i < cfg_changes.length; i++) {
                log('debug', 'configuration', 'Changed key found:');
                log('debug', 'configuration', cfg_changes[i]);
                if (typeof cfg[cfg_changes[i]['key']]['callback'] === 'function') {
                    log('debug', 'configuration', 'Executing callback function...');
                    cfg[cfg_changes[i]['key']]['callback'](cfg_changes[i]['value_new'], cfg_changes[i]['value_old']);
                }
                try {
                    changed_keys.push(getLang(fillArgs('cfg_{0}_name', cfg_changes[i]['key'])) + ' [' + cfg_changes[i]['key'] + ']');
                } catch (e) {
                    changed_keys.push(cfg_changes[i]['key']);
                }
                cfg_changed = true;
            }

            log('debug', 'configuration', 'Loaded configuration:');
            log('debug', 'configuration', cfg);

            cfg_loaded = true;
            if (cfg_loading_end == cfg_loading_start) {
                cfg_loading_end = new Date();
            }

            if (cfg_changed) {
                log('debug', 'configuration', 'Configuration changes:');
                log('debug', 'configuration', cfg_changes);

                add_stats_count('stat_cfg_changed');
                log('info', '', getLang('cfg_changed'), changed_keys.join(', '));
                cfg_changed = false;
            }

            if (typeof callback === 'function') {
                callback();
            }
        });
    } catch (e) {
        error_detected = true;
        error_message = 'load_configuration: ' + e.stack;
    }
}

function save_configuration(callback) {
    var conf = {};
    var cfg_changes = [];

    for (var key in cfg) {
        var type = cfg[key]['type'];
        var store_value = cfg[key]['val'];
        var value_old = cfg[key]['val'];
        var value = cfg[key]['val'];

        switch (type) {
            case 'number':
            case 'range':
                // Get current value from options
                value = document.getElementById(key).value;
                // Validate input
                if (cfg[key]['min'] !== null) {
                    if (value < cfg[key]['min']) {
                        if (cfg[key]['off'] !== null) {
                            value = cfg[key]['off'];
                        } else {
                            value = cfg[key]['min'];
                        }
                    }
                }
                if (cfg[key]['max'] !== null) {
                    if (value > cfg[key]['max']) {
                        value = cfg[key]['max'];
                    }
                }
                // Insert validated value into options
                store_value = value;
                document.getElementById(key).value = value;
                break;
            case 'bool':
                // Get current value from options
                value = document.getElementById(key).checked;
                // Insert validated value into options
                store_value = value;
                document.getElementById(key).checked = value;
                break;
            case 'text':
                // Get current value from options
                value = document.getElementById(key).value;
                // Insert validated value into options
                store_value = value;
                document.getElementById(key).value = value;
                break;
            case 'api':
                // Get current value from options
                value = document.getElementById(key).value;
                if (value == '') {
                    value = cfg[key]['def'];
                }
                // Insert validated value into options
                store_value = value;
                document.getElementById(key).value = value;
                break;
            case 'select':
            case 'binding':
                // Get current value from options
                value = document.getElementById(key).value;
                // Insert validated value into options
                store_value = value;
                document.getElementById(key).value = value;
                break;
            case 'option':
                // Get current value from options
                value = document.getElementById(key).value;
                // Validate input
                if (!cfg[key]['list'].includes(value)) {
                    value = cfg[key]['def'].toString();
                }
                // Insert validated value into options
                store_value = value;
                document.getElementById(key).value = value.toString();
                break;
            case 'array':
                // Get current value from options
                value = document.getElementById(key).value;
                // Convert to object
                value = nvl(value, '[]');
                value = JSON.parse(value, JSON.parseDate);
                // Validate input
                var new_value = [];
                for (var i = 0; i < value.length; i++) {
                    if (cfg[key]['list'].includes(value[i])) {
                        new_value.push(value[i]);
                    }
                }
                value = new_value;
                // Insert validated value into options as string
                store_value = JSON.stringify(value);
                document.getElementById(key).value = store_value;
                break;
        }

        // Add to list of cfg values that will be stored
        conf[key] = store_value.toString();

        // Add changed values to list of changes
        if (value.toString() != value_old.toString()) {
            cfg_changes.push({'key': key, 'value_new': value, 'value_old': value_old});
        }
    }

    // Store values into storage
    try {
        chrome.storage.local.set(conf, function() {

            log('debug', 'configuration', 'Saved configuration:');
            log('debug', 'configuration', conf);

            try {setStatus(getLang('cfg_saved'),'green',1500);} catch (e) {}
            load_configuration(function () {
                if (typeof callback === 'function') {
                    callback();
                }

                // Perform permission check
                perform_permission_check(cfg_changes);
            }, cfg_changes);

        });
    } catch (e) {
        error_detected = true;
        error_message = 'save_configuration: ' + e.stack;
    }
}

function perform_permission_check(check_list) {
    // TODO: does not work on Firefox the same way as on Chrome, implementing Firefox version
    //       would lead to many complications and will most likely not work anyway, therefore
    //       optional permissions will be implemented but unused for now.
    return;

    // Configuration must be initialised
    if (cfg) {
        var cfg_list = [];

        if (check_list.length == 0) {
            // Load all cfg keys
            for(var key in cfg) {
                if (cfg.hasOwnProperty(key)) {
                    cfg_list.push(key);
                }
            }
        } else {
            // Load changed keys
            for (var i = 0; i < check_list.length; i++) {
                cfg_list.push(check_list[i]['key']);
            }
        }

        // Check permissions on keys that have permissions set
        for (var i = 0; i < cfg_list.length; i++) {
            var key = cfg_list[i];

            if (cfg[key]['permissions'] != null) {
                optional_permission_handler(key, cfg[key]['permissions']);
            }
        }
    }
}

function optional_permission_handler(cfg_key, data) {
    chrome.runtime.sendMessage({
        action: 'checkPermissions',
        permissions: data.permissions,
        origins: data.origins
    }, function(chk_response) {
        log('debug', 'configuration', 'Check permissions response:');
        log('debug', 'configuration', chk_response);

        if (cfg[cfg_key]['access']) {
            log('debug', 'configuration', cfg[cfg_key]['val']);
            log('debug', 'configuration', cfg[cfg_key]['off']);
            if (cfg[cfg_key]['val'] != cfg[cfg_key]['off']) {
                if (!chk_response['data']['granted']) {
                    chrome.runtime.sendMessage({
                        action: 'requestPermissions',
                        permissions: data.permissions,
                        origins: data.origins
                    }, function(req_response) {
                        log('debug', 'configuration', 'Request permissions response:');
                        log('debug', 'configuration', req_response);

                        if (req_response['data']['granted']) {
                            log('output', '', 'Permissions request accepted.');
                        } else {
                            cfg[cfg_key]['val'] = false;
                            var conf = {};
                            conf[cfg_key] = false;
                            chrome.storage.local.set(conf, function() {});
                            var elm = document.getElementById(cfg_key);
                            if (elm) {
                                elm.checked = false;
                            }
                            log('warn', '', 'Permissions request revoked.');
                        }
                    });
                }
            } else {
                if (chk_response['data']['granted']) {
                    /*chrome.runtime.sendMessage({
                        action: 'revokePermissions',
                        permissions: data.permissions,
                        origins: data.origins
                    }, function(rvk_response) {
                        log('debug', 'configuration', 'Revoke permissions response:');
                        log('debug', 'configuration', rvk_response);

                        if (rvk_response['data']['revoked']) {
                            log('output', '', 'Permissions revoked.');
                        } else {
                            log('warn', '', 'Permissions revoke failed.');
                        }
                    });*/
                }
            }
        }
    });
}

var keybinds = [
    ['DISABLED',-1], // Extension value for disabled key binding
    ['A',65],
    ['B',66],
    ['C',67],
    //['D',68], // Netflix shortcut
    ['E',69],
    //['F',70], // Netflix shortcut
    ['G',71],
    ['H',72],
    ['I',73],
    ['J',74],
    ['K',75],
    //['L',76], // Netflix shortcut
    //['M',77], // Netflix shortcut
    ['N',78],
    ['O',79],
    ['P',80],
    ['Q',81],
    ['R',82],
    //['S',83], // Netflix shortcut
    ['T',84],
    ['U',85],
    ['V',86],
    ['W',87],
    ['X',88],
    ['Y',89],
    ['Z',90],
    ['1',49],
    ['2',50],
    ['3',51],
    ['4',52],
    ['5',53],
    ['6',54],
    ['7',55],
    ['8',56],
    ['9',57],
    ['0',48],
    ['+',107],
    ['-',109],
    ['*',106],
    //['/',111], // Firefox shortcut
    //['F1',112], // Chrome/Edge/Opera shortcut
    //['F2',113], // Edge shortcut
    //['F3',114], // Chrome/Firefox/Edge/Opera shortcut
    //['F4',115], // Edge shortcut
    //['F5',116], // Chrome/Firefox/Edge/Opera shortcut
    //['F6',117], // Edge shortcut
    //['F7',118], // Chrome/Firefox/Edge shortcut
    //['F8',119], // Opera shortcut
    ['F9',120],
    //['F10',121], // Firefox/Edge shortcut
    //['F11',122], // Chrome/Edge/Opera shortcut
    //['F12',123], // Chrome/Edge shortcut
    //['ARROWUP',38], // Netflix shortcut
    //['ARROWDOWN',40], // Netflix shortcut
    //['ARROWLEFT',37], // Netflix shortcut
    //['ARROWRIGHT',39], // Netflix shortcut
    //['ENTER',13], // Netflix shortcut
    //['SPACE',32], // Netflix shortcut
    //['BACKSPACE',8], // Chrome/Edge/Opera shortcut but seems to be disabled on Netflix, Firefox shortcut
    ['ESCAPE',27], // Netflix shortcut on tiles when shown details (maybe we shouldn't use it?)
    ['PAGEUP',33],
    ['PAGEDOWN',34],
    ['HOME',36],
    ['END',35],
    ['DELETE',46],
    ['PAUSE',19]
];

function init_configuration() {
    var cfg_order = {};
    cfg_order['assistant'] = 0;
    cfg_order['ratings'] = 0;
    cfg_order['video'] = 0;
    cfg_order['timers'] = 0;
    cfg_order['bindings'] = 0;
    cfg_order['storage'] = 0;
    cfg_order['api'] = 0;
    cfg_order['debug'] = 0;

    // Global configuration switches (if any)
    var disableVideoFeatures = true;

    // Order of items here will be reflected on options page
    var conf = {
        'showElapsedTime' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : true,
            'def' : true,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : false,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },'skipIntros' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : true,
            'def' : true,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : false,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'skipRecaps' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : true,
            'def' : true,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : false,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'notice' : false
        },
        'titleEndAction' : {
            'type' : 'option',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : 'skip',
            'def' : 'skip',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : 'none',
            'list': [
                'none',
                'skip',
                'roll'
            ],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : true
        },
        'skipInterrupter' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : true,
            'def' : true,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : false,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'highlightSubtitles' : {
            'type' : 'option',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : 'disabled',
            'def' : 'disabled',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : 'disabled',
            'list': [
                'hidden',
                'disabled',
                'shadow',
                'background'
            ],
            'callback' : null,
            'units' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'trailerVideoStop' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : false,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'hideDisliked' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : false,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'wheelVolume' : {
            'type' : 'range',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : 0.05,
            'def' : 0.05,
            'min' : 0,
            'max' : 0.1,
            'step' : 0.01,
            'off' : 0,
            'list': [],
            'callback' : null,
            'units' : 'pct',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'hideSpoilers' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : false,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'revealSpoilers' : {
            'type' : 'range',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : 1,
            'def' : 1,
            'min' : -1,
            'max' : 10,
            'step' : 1,
            'off' : -1,
            'list': [],
            'callback' : null,
            'units' : 'sec',
            'permissions' : null,
            'dependency' : {
                'hideSpoilers' : [ true ]
            },
            'notice' : true
        },
        'spoilersBlurAmount' : {
            'type' : 'range',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : 5,
            'def' : 5,
            'min' : 5,
            'max' : 50,
            'step' : 1,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'pct',
            'permissions' : null,
            'dependency' : {
                'hideSpoilers' : [ true ]
            },
            'notice' : false
        },
        'hideSpoilersObjects' : {
            'type' : 'array',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : [],
            'def' : [
                'description',
                'runner_thumbnail'
            ],
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [
                'description',
                'episode_name',
                'episode_picture',
                'runner_thumbnail'
            ],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : {
                'hideSpoilers' : [ true ]
            },
            'notice' : false
        },
        'pauseOnBlur' : {
            'type' : 'option',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : 'disabled',
            'def' : 'disabled',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : 'disabled',
            'list': [
                'disabled',
                'low',
                'high'
            ],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'playOnFocus' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : true,
            'def' : true,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : false,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : {
                'pauseOnBlur' : [ 'low', 'high' ]
            },
            'notice' : false
        },
        'hideStatusIcon' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : false,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'nextTitleDelayLimit' : {
            'type' : 'range',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : 5,
            'def' : 5,
            'min' : -1,
            'max' : 15,
            'step' : 1,
            'off' : -1,
            'list': [],
            'callback' : null,
            'units' : 'sec',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'nextEpisodeStopMovies' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : false,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'nextEpisodeStopSeries' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : false,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'allowKidsConfig' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : false, // TODO: active check on kids profile and if unchecked/check propagate change immediately (even close options)
            'order' : cfg_order['assistant']++,
            'val' : true,
            'def' : true,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : false,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'autoDisableKids' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : false,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'showRatings' : {
            'type' : 'bool',
            'category' : 'ratings',
            'access' : true,
            'order' : cfg_order['ratings']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : false,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : {
                permissions: [],
                origins: [
                    '*://*.wikidata.org/*',
                    '*://*.omdbapi.com/*'
                ]
            },
            'notice' : ((/*isSimulated || */!isProd) ? true : false)
        },
        'ratingsSources' : {
            'type' : 'array',
            'category' : 'ratings',
            'access' : true,
            'order' : cfg_order['ratings']++,
            'val' : [
                'imdb',
                'rt',
                'meta'
            ],
            'def' : [
                'imdb',
                'rt',
                'meta'
            ],
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [
                'imdb',
                'rt',
                'meta'
            ],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : {
                'showRatings' : [ true ]
            },
            'notice' : false
        },
        'ratingsAnchors' : {
            'type' : 'bool',
            'category' : 'ratings',
            'access' : true,
            'order' : cfg_order['ratings']++,
            'val' : true,
            'def' : true,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : false,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : {
                'showRatings' : [ true ]
            },
            'notice' : false
        },
        'ratingsWikidataAnchors' : {
            'type' : 'bool',
            'category' : 'ratings',
            'access' : true,
            'order' : cfg_order['ratings']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : false,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : {
                'showRatings' : [ true ]
            },
            'notice' : true
        },
        'ratingsTileSize' : {
            'type' : 'range',
            'category' : 'ratings',
            'access' : true,
            'order' : cfg_order['ratings']++,
            'val' : 12,
            'def' : 12,
            'min' : 8,
            'max' : 20,
            'step' : 1,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'px',
            'permissions' : null,
            'dependency' : {
                'showRatings' : [ true ]
            },
            'notice' : false
        },
        'ratingsTilePosition' : {
            'type' : 'option',
            'category' : 'ratings',
            'access' : true,
            'order' : cfg_order['ratings']++,
            'val' : 'top_left',
            'def' : 'top_left',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [
                'top_left',
                'top_center',
                'top_right',
                'middle_left',
                'middle_center',
                'middle_right',
                'bottom_left',
                'bottom_center',
                'bottom_right'
            ],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : {
                'showRatings' : [ true ]
            },
            'notice' : false
        },
        'ratingsTileTextAlign' : {
            'type' : 'option',
            'category' : 'ratings',
            'access' : true,
            'order' : cfg_order['ratings']++,
            'val' : 'left',
            'def' : 'left',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [
                'left',
                'center',
                'right',
                'same_as_position'
            ],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : {
                'showRatings' : [ true ]
            },
            'notice' : false
        },
        'enableVideoFeatures' : {
            'type' : 'bool',
            'category' : 'video',
            'access' : true,
            'order' : cfg_order['video']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : false,
            'list': [],
            'callback' : function(value_new, value_old) {
                if (!value_new && value_old) {
                    reset_videoSpeedRate();
                }
             },
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : true
        },
        'videoSpeedRate' : {
            'type' : 'range',
            'category' : 'video',
            'access' : true,
            'order' : cfg_order['video']++,
            'val' : 100,
            'def' : 100,
            'min' : 25,
            'max' : 400,
            'step' : 1,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'pct',
            'permissions' : null,
            'dependency' : {
                'enableVideoFeatures' : [ true ]
            },
            'notice' : true
        },
        'videoAspectRatio' : {
            'type' : 'option',
            'category' : 'video',
            'access' : true,
            'order' : cfg_order['video']++,
            'val' : 'original',
            'def' : 'original',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : 'original',
            'list': [
                'original',
                '21_9',
                'manual'
            ],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : {
                'enableVideoFeatures' : [ true ]
            },
            'notice' : false
        },
        'videoZoom' : {
            'type' : 'range',
            'category' : 'video',
            'access' : true,
            'order' : cfg_order['video']++,
            'val' : 100,
            'def' : 100,
            'min' : 20,
            'max' : 200,
            'step' : 1,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'pct',
            'permissions' : null,
            'dependency' : {
                'enableVideoFeatures' : [ true ],
                'videoAspectRatio' : [ 'manual' ]
            },
            'notice' : false
        },
        'videoBrightness' : {
            'type' : 'range',
            'category' : 'video',
            'access' : (!disableVideoFeatures && !isEdgeChromium) || isDev,
            'order' : cfg_order['video']++,
            'val' : 100,
            'def' : 100,
            'min' : 0,
            'max' : 500,
            'step' : 1,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'pct',
            'permissions' : null,
            'dependency' : {
                'enableVideoFeatures' : [ true ]
            },
            'notice' : false
        },
        'videoContrast' : {
            'type' : 'range',
            'category' : 'video',
            'access' : (!disableVideoFeatures && !isEdgeChromium) || isDev,
            'order' : cfg_order['video']++,
            'val' : 100,
            'def' : 100,
            'min' : 0,
            'max' : 500,
            'step' : 1,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'pct',
            'permissions' : null,
            'dependency' : {
                'enableVideoFeatures' : [ true ]
            },
            'notice' : false
        },
        'videoGrayscale' : {
            'type' : 'range',
            'category' : 'video',
            'access' : (!disableVideoFeatures && !isEdgeChromium) || isDev,
            'order' : cfg_order['video']++,
            'val' : 0,
            'def' : 0,
            'min' : 0,
            'max' : 100,
            'step' : 1,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'pct',
            'permissions' : null,
            'dependency' : {
                'enableVideoFeatures' : [ true ]
            },
            'notice' : false
        },
        'videoHue' : {
            'type' : 'range',
            'category' : 'video',
            'access' : (!disableVideoFeatures && !isEdgeChromium) || isDev,
            'order' : cfg_order['video']++,
            'val' : 0,
            'def' : 0,
            'min' : 0,
            'max' : 360,
            'step' : 1,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'deg',
            'permissions' : null,
            'dependency' : {
                'enableVideoFeatures' : [ true ]
            },
            'notice' : false
        },
        'videoInvert' : {
            'type' : 'range',
            'category' : 'video',
            'access' : (!disableVideoFeatures && !isEdgeChromium) || isDev,
            'order' : cfg_order['video']++,
            'val' : 0,
            'def' : 0,
            'min' : 0,
            'max' : 100,
            'step' : 1,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'pct',
            'permissions' : null,
            'dependency' : {
                'enableVideoFeatures' : [ true ]
            },
            'notice' : false
        },
        'videoSaturation' : {
            'type' : 'range',
            'category' : 'video',
            'access' : (!disableVideoFeatures && !isEdgeChromium) || isDev,
            'order' : cfg_order['video']++,
            'val' : 100,
            'def' : 100,
            'min' : 0,
            'max' : 500,
            'step' : 1,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'pct',
            'permissions' : null,
            'dependency' : {
                'enableVideoFeatures' : [ true ]
            },
            'notice' : false
        },
        'videoSepia' : {
            'type' : 'range',
            'category' : 'video',
            'access' : (!disableVideoFeatures && !isEdgeChromium) || isDev,
            'order' : cfg_order['video']++,
            'val' : 0,
            'def' : 0,
            'min' : 0,
            'max' : 100,
            'step' : 1,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'pct',
            'permissions' : null,
            'dependency' : {
                'enableVideoFeatures' : [ true ]
            },
            'notice' : false
        },
        'timeFromLoadLimit' : {
            'type' : 'range',
            'category' : 'timers',
            'access' : true,
            'order' : cfg_order['timers']++,
            'val' : 5,
            'def' : 5,
            'min' : 0,
            'max' : 60,
            'step' : 1,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'sec',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'loadingTimeLimit' : {
            'type' : 'range',
            'category' : 'timers',
            'access' : true,
            'order' : cfg_order['timers']++,
            'val' : 5,
            'def' : 5,
            'min' : 0,
            'max' : 60,
            'step' : 1,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'sec',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'stuckTimeLimit' : {
            'type' : 'range',
            'category' : 'timers',
            'access' : true,
            'order' : cfg_order['timers']++,
            'val' : 15,
            'def' : 15,
            'min' : -1,
            'max' : 60,
            'step' : 1,
            'off' : -1,
            'list': [],
            'callback' : null,
            'units' : 'sec',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'forceReloadDelay' : {
            'type' : 'range',
            'category' : 'timers',
            'access' : true,
            'order' : cfg_order['timers']++,
            'val' : 60,
            'def' : 60,
            'min' : 60,
            'max' : 600,
            'step' : 1,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'sec',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'toggleAssistantKey' : {
            'type' : 'binding',
            'category' : 'bindings',
            'access' : true,
            'order' : cfg_order['bindings']++,
            'val' : 'T',
            'def' : 'T',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : 'DISABLED',
            'list': keybinds,
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'hideSubtitlesKey' : {
            'type' : 'binding',
            'category' : 'bindings',
            'access' : true,
            'order' : cfg_order['bindings']++,
            'val' : 'H',
            'def' : 'H',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : 'DISABLED',
            'list': keybinds,
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'exitPlayerKey' : {
            'type' : 'binding',
            'category' : 'bindings',
            'access' : true,
            'order' : cfg_order['bindings']++,
            'val' : 'ESCAPE',
            'def' : 'ESCAPE',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : 'DISABLED',
            'list': keybinds,
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'prevEpisodeKey' : {
            'type' : 'binding',
            'category' : 'bindings',
            'access' : true,
            'order' : cfg_order['bindings']++,
            'val' : 'B',
            'def' : 'B',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : 'DISABLED',
            'list': keybinds,
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'nextEpisodeKey' : {
            'type' : 'binding',
            'category' : 'bindings',
            'access' : true,
            'order' : cfg_order['bindings']++,
            'val' : 'N',
            'def' : 'N',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : 'DISABLED',
            'list': keybinds,
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'randomMovieKey' : {
            'type' : 'binding',
            'category' : 'bindings',
            'access' : true,
            'order' : cfg_order['bindings']++,
            'val' : 'R',
            'def' : 'R',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : 'DISABLED',
            'list': keybinds,
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'keepHistory' : {
            'type' : 'range',
            'category' : 'storage',
            'access' : true,
            'order' : cfg_order['storage']++,
            'val' : 100,
            'def' : 100,
            'min' : 1,
            'max' : 500,
            'step' : 1,
            'off' : 1,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'omdbApi' : {
            'type' : 'api',
            'category' : 'api',
            'access' : true,
            'order' : cfg_order['api']++,
            'val' : 'DEFAULT',
            'def' : 'DEFAULT',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'logLevel' : {
            'type' : 'option',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : '2',
            'def' : '2',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [
                '0', // Debug
                '1', // Info
                '2', // Output
                '3', // Warn
                '4', // Error
                '99' // None
            ],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'debug' : {
            'type' : 'array',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : [],
            'def' : [
                'init',
                'overflow'
            ],
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [
                'init',
                'startup',
                'configuration',
                'environment',
                'options_generation',
                'main_loop',
                'core_errors',
                'dom_activities',
                'dom_events',
                'assistant_loop',
                'skip_button_text',
                'news',
                'ratings',
                'overflow',
                'keypress',
                'wheelturn',
                'mouse_simulation',
                'fractions_counter',
                'background'
            ],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : {
                'logLevel' : [ '0' ]
            },
            'notice' : false
        },
        'simulateProduction' : {
            'type' : 'bool',
            'category' : 'debug',
            'access' : isDev || isTest || isSimulated,
            'order' : cfg_order['debug']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : false,
            'list': [],
            'callback' : null,
            'units' : null,
            'permissions' : null,
            'dependency' : null,
            'notice' : true
        },
        //-- CORE TIMERS START
        'startupTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 200,
            'def' : 200,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'ms',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'injectorTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 200,
            'def' : 200,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'ms',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'pageReloadTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 1000,
            'def' : 1000,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'ms',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'errorExtensionReloadDelay' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 10000,
            'def' : 10000,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'ms',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'environmentUpdateTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 500,
            'def' : 500,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'ms',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'keyEventProcessingDelay' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 1000,
            'def' : 1000,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'ms',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'netflixAssistantTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 100,
            'def' : 100,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'ms',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'netflixRatingsTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 500,
            'def' : 500,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'ms',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'elementHandlerTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 100,
            'def' : 100,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'ms',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'bubbleHideDelay' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 500,
            'def' : 500,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'ms',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'titleEndActionsDelay' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 2000,
            'def' : 2000,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'ms',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'controlsSwitchTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 100,
            'def' : 100,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'ms',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'debugControlsSwitchTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 50,
            'def' : 50,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'ms',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'skippingPreventionTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 2000,
            'def' : 2000,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'ms',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'playPauseButtonDelay' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 1000,
            'def' : 1000,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'ms',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'devToolsRefreshTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 500,
            'def' : 500,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'ms',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'devToolsConfigLoadTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 500,
            'def' : 500,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'ms',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        },
        'dependencyHighlightDelay' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 3000,
            'def' : 3000,
            'min' : 1000,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'callback' : null,
            'units' : 'ms',
            'permissions' : null,
            'dependency' : null,
            'notice' : false
        }
        //-- CORE TIMERS END
    };

    return conf;
}

var cfg = init_configuration();

var cfg_loaded = false;
var cfg_loading_start = new Date();
var cfg_loading_end = cfg_loading_start;

// ------------------------
// Log handler
// ------------------------

function nvl(string1, string2) {
    if (string1 == null || string1 == '' || string1 === undefined) {
        return string2;
    }
    return string1;
}

function fillKeys(string, keys) {
    return string.replace(/((?:[^{}]|(?:\{\{)|(?:\}\}))+)|(?:\{([A-Z0-9_\-\.]+)\})/g, (m, str, key) => {
        if (str) {
            return str.replace(/(?:{{)|(?:}})/g, m => m[0]);
        } else {
            if (!keys.hasOwnProperty(key)) {
                return '{' + key + '}';
            }
            return keys[key];
        }
    });
}

function fillArgs(string, ...args) {
    return string.replace(/((?:[^{}]|(?:\{\{)|(?:\}\}))+)|(?:\{([0-9]+)\})/g, (m, str, index) => {
        if (str) {
            return str.replace(/(?:{{)|(?:}})/g, m => m[0]);
        } else {
            if (index >= args.length) {
                return '{' + index + '}';
            }
            return args[index];
        }
    });
}

function log(type, access, message, ...args) {
    try {
        // Handle log type access
        if (access == '' || access === undefined) {
            // If access is empty show message unless it is one of the debug types, these require to have access
            if (type == 'debug' || type == 'group_start' || type == 'group_end') {
                log('error', '', getLang('debug_message_without_access'), message);
                return;
            }
        } else {
            // If access is provided, look if they are allowed in configuration
            try {
                if (!cfg['debug']['val'].includes(access)) {
                    return;
                }
            } catch (e) {
                // If we cannot determine if we should show debug message due to cfg not being properly set yet, show
                // message unless it is a debug type
                if (type == 'debug' || type == 'group_start' || type == 'group_end') {
                    return;
                }
            }
        }

        // If message is a string, perform argument filling
        var datatype = 'string';
        var message_processed = message;
        if (message_processed) {
            if (Object.prototype.toString.call(message_processed) === '[object String]') {
                datatype = 'string';
                try {
                    message_processed = fillArgs(message_processed, ...args);
                } catch (e) {
                    log('error', '', e.message, type);
                }
            } else {
                datatype = 'object';
            }
        }

        // Define message styles
        var debug_style = 'color: #999999; font-style: italic;';
        var info_style = 'color: #4d88ff;';
        var warn_style = 'font-style: normal;';
        var error_style = 'font-style: normal;';
        var output_style = 'font-style: normal;';

        // Handle message output to console
        var log_level = Number(cfg['logLevel']['val']);
        switch (type) {
            // Debug types
            case 'debug':
                if (log_level <= 0) {
                    if (datatype == 'string') {
                        console.log('%c' + getLang('debug_message') + message_processed, debug_style);
                    } else {
                        console.log(message_processed);
                    }
                }
                break;
            case 'group_start':
                if (log_level <= 0) {
                    console.groupCollapsed('%c' + message_processed, debug_style);
                }
                break;
            case 'group_end':
                if (log_level <= 0) {
                    console.groupEnd();
                }
                break;
            // Non-debug types
            case 'info':
                if (log_level <= 1) {
                    if (datatype == 'string') {
                        console.info('%c' + getLang('info_message') + message_processed, info_style);
                    } else {
                        console.log(message_processed);
                    }
                }
                break;
            case 'output':
                if (log_level <= 2) {
                    if (datatype == 'string') {
                        console.log('%c' + getLang('output_message') + message_processed, output_style);
                    } else {
                        console.log(message_processed);
                    }
                }
                break;
            case 'warn':
                if (log_level <= 3) {
                    if (datatype == 'string') {
                        console.warn('%c' + getLang('warn_message') + message_processed, warn_style);
                    } else {
                        console.log(message_processed);
                    }
                }
                break;
            case 'error':
                if (log_level <= 4) {
                    if (datatype == 'string') {
                        console.error('%c' + getLang('error_message') + message_processed, error_style);
                    } else {
                        console.log(message_processed);
                    }
                    //throw new Error(getLang('error_message') + message_processed);
                }
                break;
            default:
                // Unknown log type
                log('error', '', getLang('log_type_unknown'), type);
                break;
        }
    } catch (e) {
        throw new Error(getLang('error_message') + e.message);
    }
}

// To shut Firefox up, keep it a last line (result is non-structured-clonable data message)
undefined;