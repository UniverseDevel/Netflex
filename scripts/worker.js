var environment = 'developement';
var isDev = true;
var isTest = false;
var isProd = false;

var extension_id = chrome.runtime.id;
var prod_extension_list = load_prod_ids();
var test_extension_list = load_test_ids();

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

function injectWindows() {
    chrome.windows.getAll({
        populate: true
    }, function (windows) {
        try {
            // Auto re-inject to all Netflix tabs
            for (var i = 0; i < windows.length; i++) {
                var currentWindow = windows[i];
                for (var j = 0 ; j < currentWindow.tabs.length; j++) {
                    currentTab = currentWindow.tabs[j];
                    if (currentTab.url) {
                        // Skip chrome:// and about:// and apply only to allowed URL
                        if (currentTab.url.match(chrome.runtime.getManifest().content_scripts[0].matches[0].replace('/','\/').replace('.','\.').replace('*','.*')) && !currentTab.url.match(/(chrome|about):\/\//gi)) {
                            var scripts = chrome.runtime.getManifest().content_scripts[0].js;

                            // Add DevTools script to injected scripts if available in manifest and is Development or Test environment
                            if ((isDev || isTest) && chrome.runtime.getManifest().devtools_page) {
                                scripts.push(chrome.runtime.getManifest().devtools_page);
                            }

                            for (var k = 0; k < scripts.length; k++) {
                                console.log('NETFLEX INFO: Injecting script with ID ' + k + ' on path: "' + chrome.runtime.getURL(scripts[k]) + '", to tab with ID ' + j + ' and URL: "' + currentTab.url + '", in window with ID ' + i + '.');

                                chrome.tabs.executeScript(currentTab.id, {
                                    file: scripts[k]
                                }, function(e) {
                                    if (chrome.runtime.lastError) {
                                        if (chrome.runtime.lastError.length() != 0) {
                                            console.error('NETFLEX ERROR: Injecting script failed with: ' + chrome.runtime.lastError.message + '. Error was suppressed.');
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
        catch (e) {
            console.error('NETFLEX ERROR: Failed to auto-inject tabs.');
            console.error(e);
        }
    });
}

chrome.browserAction.onClicked.addListener(function (activeTab) {
    var newURL = 'https://www.netflix.com/';
    chrome.tabs.create({ url: newURL });
});
/*
// Requires "management" permission which shows as "Manage your apps, extensions, and themes"
chrome.management.onEnabled.addListener(function (details) {
    console.log('NETFLEX INFO: Extension enabled.');

    injectWindows();
});
chrome.management.onDisabled.addListener(function (details) {
    console.log('NETFLEX INFO: Extension disabled.');
});
*/
chrome.runtime.onInstalled.addListener(function (details) {
    chrome.browserAction.getTitle({}, function(name) {
        if (isDev) { // DEV: Any local installation
            chrome.browserAction.setIcon({
                path: chrome.runtime.getURL('images/netflex_dev.png')
            });
            chrome.browserAction.setTitle({
                title: name + ' DEV'
            });
        } else if (isTest) { // TEST
            chrome.browserAction.setIcon({
                path: chrome.runtime.getURL('images/netflex_test.png')
            });
            chrome.browserAction.setTitle({
                title: name + ' TEST'
            });
        } else { // PROD: Anything that is not TEST or DEV
            // Keep production settings
        }

        injectWindows();
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var status = 'OK';
    var message = '';
    var data = {};

    try {
        switch(request.action) {
            case 'openOptionsPage':
                chrome.runtime.openOptionsPage();
                break;
            case 'reloadExtension':
                chrome.runtime.reload();
                break;
            case 'checkPermissions':
                chrome.permissions.contains({
                    permissions: request.permissions,
                    origins: request.origins
                }, function(result) {
                    data['granted'] = result;

                    sendResponse({request: request, status: status, message: message, data: data});
                });
                break;
            case 'getPermissions':
                chrome.permissions.getAll(function(result) {
                    data['permissions'] = result;

                    sendResponse({request: request, status: status, message: message, data: data});
                });
                break;
            case 'requestPermissions':
                chrome.permissions.request({
                    permissions: request.permissions,
                    origins: request.origins
                }, function(result) {
                    data['granted'] = result;

                    sendResponse({request: request, status: status, message: message, data: data});
                });
                break;
            case 'revokePermissions':
                chrome.permissions.remove({
                    permissions: request.permissions,
                    origins: request.origins
                }, function(result) {
                    data['revoked'] = result;

                    sendResponse({request: request, status: status, message: message, data: data});
                });
                break;
        }
    } catch (e) {
        status = 'ERROR';
        message = e.message;
        data = e;

        sendResponse({request: request, status: status, message: message, data: data});

        return;
    }

    // To prevent connection from closing before async message is returned
    return true;
});