extension_browserAction.onClicked.addListener(function (activeTab) {
    var newURL = 'https://www.netflix.com/';
    extension_tabs.create({ url: newURL });
});
/*
// Requires "management" permission which shows as "Manage your apps, extensions, and themes"
extension_management.onEnabled.addListener(function (details) {
    log('info', '', getLang('extension_enable'));

    if (last_version_normalized >= normalize_version('3.8', 4)) { // 3.8
        // Automated injection is supported from version 3.8 forward, older versions
        // will have to perform manual page refresh when updating to 3.8 or above
        injectWindows();
    }
});
extension_management.onDisabled.addListener(function (details) {
    log('info', '', getLang('extension_disable'));
});
*/
extension_runtime.onInstalled.addListener(function (details) {
    if (isDev) { // DEV: Any local installation
        extension_browserAction.setIcon({
            path: extension_extension.getURL('images/netflex_dev.png')
        });
        extension_browserAction.setTitle({
            title: getLang('name') + ' DEV'
        });
    } else if (isTest) { // TEST
        extension_browserAction.setIcon({
            path: extension_extension.getURL('images/netflex_test.png')
        });
        extension_browserAction.setTitle({
            title: getLang('name') + ' TEST'
        });
    } else { // PROD: Anything that is not TEST or DEV
        // Keep production settings
    }

    if (details.reason == 'install') {
        log('info', '', getLang('extension_install'));

        if (last_version == null) {
            // Initiation - extension was installed store variables
            localStorage.setItem('netflex_lastVersion', extension_manifest.version);
            localStorage.setItem('netflex_previousVersion', details.previousVersion);
            localStorage.setItem('netflex_thisVersion', extension_manifest.version);
        }

        // After installation no configuration loading is needed as default configuration will be used anyway
    } else if (details.reason == 'update') {
        log('info', '', getLang('extension_update'));

        if (last_version == null) {
            // Initiation - extension was updated but values does not exist
            localStorage.setItem('netflex_lastVersion', extension_manifest.version);
            localStorage.setItem('netflex_previousVersion', details.previousVersion);
            localStorage.setItem('netflex_thisVersion', extension_manifest.version);
        } else if (last_version != extension_version) {
            // Update - extension was updated and versions does not match
            localStorage.setItem('netflex_lastVersion', extension_manifest.version);
            localStorage.setItem('netflex_previousVersion', details.previousVersion);
            localStorage.setItem('netflex_thisVersion', extension_manifest.version);
        }

        // Automated injection is supported from version 3.8 forward, older versions
        // will have to perform manual page refresh when updating to 3.8 or above
        if (last_version_normalized >= normalize_version('3.8', 4)) {
            injectWindows();
        }
    }
});

extension_runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var status = 'OK';
    var message = '';
    var data = {};

    try {
        switch(request.action) {
            case 'openOptionsPage':
                extension_runtime.openOptionsPage();
                break;
            case 'reloadExtension':
                extension_runtime.reload();
                break;
            case 'checkPermissions':
                extension_permissions.contains({
                    permissions: request.permissions,
                    origins: request.origins
                }, function(result) {
                    data['granted'] = result;
                });
                break;
            case 'requestPermissions':
                extension_permissions.request({
                    permissions: request.permissions,
                    origins: request.origins
                }, function(result) {
                    data['granted'] = result;
                });
                break;
            case 'revokePermissions':
                extension_permissions.remove({
                    permissions: request.permissions,
                    origins: request.origins
                }, function(result) {
                    data['revoked'] = result;
                });
                break;
        }
    } catch (e) {
        status = 'ERROR';
        message = e.message;
        data = e;
    }

    sendResponse({request: request, status: status, message: message, data: data});
});

function injectWindows() {
    extension_windows.getAll({
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
                        if (currentTab.url.match(extension_manifest.content_scripts[0].matches[0].replace('/','\/').replace('.','\.').replace('*','.*')) && !currentTab.url.match(/(chrome|about):\/\//gi)) {
                            var scripts = extension_manifest.content_scripts[0].js;

                            // Add DevTools script to injected scripts if available in manifest and is Development or Test environment
                            if ((isDev || isTest) && extension_manifest.devtools_page) {
                                scripts.push(extension_manifest.devtools_page);
                            }

                            for (var k = 0; k < scripts.length; k++) {
                                log('debug', 'background', 'Injecting script with ID {0} on path: \'{1}\', to tab with ID {2} and URL: \'{3}\', in window with ID {4}.', k, extension_extension.getURL(scripts[k]), j, currentTab.url, i);

                                extension_tabs.executeScript(currentTab.id, {
                                    file: scripts[k]
                                }, function(e) {
                                    if (extension_runtime.lastError) {
                                        log('debug', 'background', 'Injecting script failed with: {0}. Error was suppressed.', extension_runtime.lastError.message);
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
        catch (e) {
            log('error', '', getLang('extension_autoinject_failed'));
        }
    });
}

