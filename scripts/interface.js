// VARIABLES
if (workers) {
    // If workers are already defined, stop all running workers
    for (var key in workers) {
        if (workers[key]) {
            clearInterval(workers[key]);
            clearTimeout(workers[key]);
        }
    }
} else {
    var workers = {};
}

workers['startup'] = false;
workers['environment'] = false;

var injected_flag = 'netflex';
var run_id = document.getElementById('netflix_extended_styles_netflex-interface').getAttribute('run_id');
var interface = null;

// FUNCTIONS
function startupInterface() {
    interface = document.getElementById(injected_flag);

    if (interface) {
        if (interface.getAttribute('run-id') == run_id) {
            if (!window.netflex) {
                window.netflex = {};
            }

            injectWindowCalls();

            workers['environment'] = setInterval(environment_update, 500);

            clearInterval(workers['startup']);
        }
    }
}

function injectWindowCalls() {
    // Inject JSON.parser to spoof Netflix responses from server
    /**-/
    if (!window.netflex.json_parse) {
        window.netflex.json_parse = JSON.parse;
    }
    window.JSON.parse = function(...args) {
        var parsed_json = window.netflex.json_parse.call(JSON, ...args);
        if (parsed_json) {
            console.log(parsed_json);
        }
        return parsed_json;
    };
    /**/
}

function environment_update() {
    interface = document.getElementById(injected_flag);

    if (interface) {
        if (interface.getAttribute('run-id') == run_id) {
            interface.setAttribute('ping-interface', JSON.stringify(new Date()).replace(/\"/gi, ''));
            interface.setAttribute('data-interface', JSON.stringify(generateInterfaceData()));
        } else {
            clearInterval(workers['environment']);
        }
    }
}

function generateScopeData(obj, level, output_string) {
    var netflix_copy = {};

    for (var key in obj) {
        try {
            var data_string = JSON.stringify(obj[key]); // Check if can be converted to string, throws error if not
            netflix_copy[key] = obj[key];
        } catch (e) {
            //console.log(key + ' => ' + level);
            if (level < 5) { // Descend only few levels to avoid "Maximum call stack size exceeded"
                netflix_copy[key] = generateScopeData(obj[key], ++level, false);
            } else {
                //console.log(key + ' => skip');
                netflix_copy[key] = 'Too deep...';
            }
        }
    }

    if (level == 0) {
        if (output_string) {
            return JSON.stringify(netflix_copy);
        } else {
            return netflix_copy;
        }
    } else {
        return netflix_copy;
    }
}

function generateInterfaceData() {
    var data = {};

    data[run_id] = {};
    data[run_id]['profile_name'] = getProfileName();
    data[run_id]['is_account_test'] = checkAccountTest();
    data[run_id]['environment'] = getEnvironment();
    data[run_id]['cadmium_version'] = getCadmiumVersion();

    return data;
}

function getProfileName() {
    var data = {};

    try {
        data['value'] = netflix.reactContext.models.userInfo.data.name;
        data['state'] = 'OK';
    } catch (e) {
        data['value'] = e.stack;
        data['state'] = 'ERROR';
    }

    return data;
}

function checkAccountTest() {
    var data = {};

    try {
        data['value'] = netflix.reactContext.models.userInfo.data.isTestAccount;
        data['state'] = 'OK';
    } catch (e) {
        data['value'] = e.stack;
        data['state'] = 'ERROR';
    }

    return data;
}

function getEnvironment() {
    var data = {};

    try {
        data['value'] = netflix.reactContext.models.playerModel.data.config.ui.initParams.environment;
        data['state'] = 'OK';
    } catch (e) {
        data['value'] = e.stack;
        data['state'] = 'ERROR';
    }

    return data;
}

function getCadmiumVersion() {
    var data = {};

    try {
        data['value'] = netflix.reactContext.models.playerModel.data.config.core.assets.version;
        data['state'] = 'OK';
    } catch (e) {
        data['value'] = e.stack;
        data['state'] = 'ERROR';
    }

    return data;
}

// INIT
workers['startup'] = setInterval(startupInterface, 1000);