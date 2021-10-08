// TODO: unused for now until the implementation is decided and finished, check variable scripts_list


if (!window.netflex) {
    window.netflex = {};
}

function dataProvider() {
    // TODO: Create element that will hold all data that we can collect from Netflix scope for extension to scrape, maybe
    //       chrome.runtime.onMessage could be used and it might be better, need to test this as well
}

function generateScopeData(obj, level) {
    var netflix_copy = {};

    for (var key in obj) {
        try {
            var data_string = JSON.stringify(obj[key]); // Check if can be converted to string, throws error if not
            netflix_copy[key] = obj[key];
        } catch (e) {
            //console.log(key + ' => ' + level);
            if (level < 5) { // Descend only few levels to avoid "Maximum call stack size exceeded"
                netflix_copy[key] = generateScopeData(obj[key], ++level);
            } else {
                //console.log(key + ' => skip');
                netflix_copy[key] = 'Too deep...';
            }
        }
    }

    if (level == 0) {
        return JSON.stringify(netflix_copy);
    } else {
        return netflix_copy;
    }
}

function getUserInfo() {
    return netflix.reactContext.models.userInfo.data;
}

function checkAccountTest() {
    return netflix.reactContext.models.userInfo.data.isTestAccount;
}

function getEnvironment() {
    return netflix.data.config.ui.initParams.environment;
}

function getCadmiumVersion() {
    return netflix.reactContext.models.playerModel.data.config.core.assets.version;
}

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