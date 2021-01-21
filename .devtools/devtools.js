// Variables

/*
Be aware that extension will start requiring "Read and change all your data on the websites that you visit" permissions once DevTools are added to manifest.

Manifest add:
"devtools_page": ".devtools/devtools.html",
*/

try {
    log('info', '', getLang('devtools_page_loading'));

    var tab_url;
    var data_refresh = true;
    var enabled_output = [];
    var debug_variables_json = {};
    var debug_variables_output = '';
    var tabs_error = getLang('devtools_tabs_error');

    // Init - start DevTools only on Netflix domain
    extension_devtools.inspectedWindow.eval('window.location.href', function(data, error) {
        if (!error) {
            tab_url = data;
        } else {
            tab_url = '';
        }

        if (tab_url.match('*://www.netflix.com/*'.replace('/','\/').replace('.','\.').replace('*','.*'))) {
            extension_devtools.panels.create(getLang('name'),
                extension_extension.getURL('images/netflex_dev.png'),
                extension_manifest.devtools_page,
                function(panel) {
                    init_dev_tools();
                }
            );
        }
    });

    // Functions
    function init_dev_tools() {
        addDOM(document.getElementById('data_output'), getLang('data_loading'));
        document.getElementById('data_refresh').addEventListener('click', function() { logEvent('init_dev_tools'); switch_data_refresh(); });

        generateVariables(true);
        generateContent();

        setTimeout(generateContent, cfg['devToolsRefreshTimer']['val']);
        setInterval(load_configuration, cfg['devToolsConfigLoadTimer']['val']);
    }

    function get_url() {
        extension_devtools.inspectedWindow.eval('window.location.href', function(data, error) {
            //log('output', '', data);
            if (!error) {
                tab_url = data;
            } else {
                tab_url = '';
            }
        });
    }

    function switch_data_refresh() {
        var button = document.getElementById('data_refresh');
        if (button.value == getLang('devtools_resume')) {
            data_refresh = true;
            button.value = getLang('devtools_pause');
        } else {
            data_refresh = false;
            button.value = getLang('devtools_resume');
        }
        return false;
    }

    function refresh_outputs() {
        var enabled_output_tmp = [];
        var ele = document.getElementsByName('content');
        for (var i = 0; i < ele.length; i++) {
            if (ele[i].checked) {
                enabled_output_tmp.push(ele[i].value);
            }
        }
        enabled_output = enabled_output_tmp;
    }

    function generateButtons() {
        //log('output', '', debug_variables_json);
        var buttons = getLang('devtools_show_content') + ': | ';
        for (var key in debug_variables_json) {
            if (debug_variables_json.hasOwnProperty(key)) {
                var checked = '';
                if (enabled_output.includes(key)) {
                    checked = ' checked="true"';
                }
                buttons += '<label><input name="content" type="checkbox" value="' + key + '"' + checked + '> ' + key + '</label> | ';
            }
        }
        addDOM(document.getElementById('content_buttons'), buttons);
        var ele = document.getElementsByName('content');
        for (var i = 0; i < ele.length; i++) {
            ele[i].addEventListener('change', function() { logEvent('generateButtons'); refresh_outputs(); });
        }
    }

    function generateContent() {
        if (!data_refresh) {
            return;
        }

        try {
            var generated_content = '';

            get_url();

            try {
                if (tab_url) {
                    if (tab_url.match('*://www.netflix.com/*'.replace('/','\/').replace('.','\.').replace('*','.*'))) {
                        // Output all debug variables that are set for extension
                        try {
                            generateVariables(false);
                            generated_content += debug_variables_output + '<br>';
                        } catch (e) {
                            generated_content += getLang('error_message') + ' (generateVariables) ' + e.message + '<br>';
                        }
                    } else {
                        log('error', '', tabs_error);
                        generated_content = tabs_error;
                    }
                } else {
                    log('error', '', tabs_error);
                    generated_content = tabs_error;
                }
            } catch (e) {
                generated_content = getLang('error_message') + ' (generateContent) ' + e.message;
            }

            addDOM(document.getElementById('data_output'), generated_content);
            addDOM(document.getElementById('last_refresh'), new Date().toISOString().replace('T', ' ').replace('.', ' ').replace('Z', ''));
        } catch (e) {
            log('error', '', e.message);
        }

        setTimeout(generateContent, cfg['devToolsRefreshTimer']['val']);
    }

    function generateVariables(generate_buttons) {
        extension_devtools.inspectedWindow.eval(
            'load_debug_variables()',
            {
                useContentScriptContext: true
            },
            function(data, error) {
                debug_variables_json = JSON.parse(data, JSON.dateParser);
                debug_variables_output = process_debug_variables(data, error, enabled_output);
                if (generate_buttons) {
                    generateButtons();
                }
            }
        );
    }
} catch (e) {
    log('error', '', getLang('devtools_loading_error'), e.message);
}