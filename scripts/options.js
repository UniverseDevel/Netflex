function setStatus(message, color, time) {
    stop_worker('status');
    var object = document.getElementById('status');
    addDOM(object, message);
    object.className = color + ' marginLeftContent status';
    workers['status'] = setTimeout(function() {
        addDOM(object, '&nbsp;');
        object.className = 'marginLeftContent status';
    }, time);
}

function setText(object_class, message_name) {
    var objects = document.getElementsByClassName(object_class);

    for (var i = 0; i < objects.length; i++) {
        addDOM(objects[i], getLang(message_name));
    }
}

function tab_select(tab_id) {
    var tabs = document.getElementsByClassName('tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].style.display = 'none';
        try {document.getElementById('button_' + tabs[i].id).classList.remove('active');} catch (e) {}
    }
    document.getElementById(tab_id).style.display = 'block';
    document.getElementById('button_' + tab_id).classList.add('active');

    if (options_tab_selected != tab_id) {
        document.getElementsByClassName('content')[0].scrollTo(0, 0);
    }

    options_tab_selected = tab_id;
}

function logLevel_type(val) {
    switch(val) {
        case 0:
            type = 'debug';
            break;
        case 1:
            type = 'info';
            break;
        case 2:
            type = 'output';
            break;
        case 3:
            type = 'warn';
            break;
        case 4:
            type = 'error';
            break;
        case 99:
            type = 'none';
            break;
        default:
            type = 'unknown';
            break;
    }
    return type;
}

function check_values(name, value) {
    var ele = document.getElementsByName(name);
    for (i = 0; i < ele.length; i++) {
        ele[i].checked = false;
        if (typeof value === 'object') {
            if (value.includes(ele[i].value)) {
                ele[i].checked = true;
            }
        } else {
            if (value == ele[i].value) {
                ele[i].checked = true;
            }
        }
    }

    if (typeof value === 'object') {
        update_hidden_element('array', name, '');
    } else {
        update_hidden_element('option', name, value);
    }
}

function translate_array_default(cfg_name, default_array) {
    var default_array_translated = [];
    for (i = 0; i < default_array.length; i++) {
        default_array_translated.push(getLang(cfg_name + '_' + default_array[i]));
    }
    return default_array_translated;
}

function generate_options_data(load_tab) {
    // Load current configuration values
    load_configuration();

    var conf = '';
    var conf_cat = {};

    for (var key in cfg) {
        if (cfg.hasOwnProperty(key)) {
            if (conf_cat.hasOwnProperty(cfg[key]['category'])) {
                conf_cat[cfg[key]['category']][cfg[key]['order']] = key;
            } else {
                conf_cat[cfg[key]['category']] = [];
                conf_cat[cfg[key]['category']][cfg[key]['order']] = key;
            }
        }
    }

    var conf_cat_count = [];
    // Generate tabs per category
    for (var key in conf_cat) {
        var fields = [];
        switch (key) {
            case 'debug':
                fields.push(fillArgs('<label class="orange cfg_notice">{0}<br><button id="button_reset_debug" class="control button_reset_debug">{1}</button><hr style="height: 1px;"></label>', getLang('debug_warning_notice'), getLang('button_reset_debug')));
                break;
            case 'video':
                fields.push(fillArgs('<label><button id="button_reset_video" class="control button_reset_video">{0}</button><hr style="height: 1px;"></label>', getLang('button_reset_video')));
                break;
            case 'bindings':
                fields.push(fillArgs('<label><button id="button_reset_bindings" class="control button_reset_bindings">{0}</button><hr style="height: 1px;"></label>', getLang('button_reset_bindings')));
                break;
        }

        // Generate fields
        for (var i = 0; i < conf_cat[key].length; i++) {
            log('debug', 'options_generation', '{0}: {1} - {2} ({3}, access: {4})', key, i, conf_cat[key][i], cfg[conf_cat[key][i]]['type'], cfg[conf_cat[key][i]]['access']);

            var cfgkey = conf_cat[key][i];

            var cfg_name = fillArgs('<span class="cfg_name">{0}</span>', cfg[cfgkey]['name']);

            // Add values based on type
            var cfg_input_type = '';
            var cfg_input_value = '';
            var cfg_hidden_input = '';
            var cfg_form_element = '';
            switch (cfg[cfgkey]['type']) {
                case 'number':
                    cfg_input_type = 'number';
                    cfg_input_value = fillArgs(' value="{0}"', cfg[cfgkey]['val']);
                    cfg_hidden_input = '';
                    cfg_form_element = fillArgs('<input type="{0}" id="{1}" {2}>', cfg_input_type, cfgkey, cfg_input_value);
                    break;
                case 'range':
                    cfg_input_type = 'range';
                    cfg_input_value = fillArgs(' value="{0}"', cfg[cfgkey]['val']);
                    cfg_hidden_input = '';
                    var min_value = cfg[cfgkey]['min'];
                    var max_value = cfg[cfgkey]['max'];
                    var step_value = cfg[cfgkey]['step'];
                    if (cfg[cfgkey]['category'] == 'debug') {
                        if (min_value === null) {
                            min_value = 1;
                        }
                        if (max_value === null) {
                            max_value = 10000;
                        }
                        if (step_value === null) {
                            step_value = 1;
                        }
                    }

                    if (min_value === null || max_value === null || step_value === null) {
                        log('error', '', 'Range configuration of key "{0}" is missing some of the following values: min, max, step.', cfgkey);
                    }

                    cfg_form_element = fillArgs('<input type="{0}" id="{1}" min="{2}" max="{3}" step="{4}" style="width: 80%;" {5}><span id="{1}_current_val" class="cfg_current_value">{6}</span>', cfg_input_type, cfgkey, min_value, max_value, step_value, cfg_input_value, cfg[cfgkey]['val']);
                    break;
                case 'bool':
                    cfg_input_type = 'checkbox';
                    cfg_input_value = fillArgs('{0}', ((cfg[cfgkey]['val']) ? ' checked' : ''));
                    cfg_hidden_input = '';
                    cfg_form_element = fillArgs('<input type="{0}" id="{1}" {2}>', cfg_input_type, cfgkey, cfg_input_value);
                    break;
                case 'array':
                    cfg_input_type = 'checkbox';
                    cfg_input_value = JSON.stringify(cfg[cfgkey]['val']);
                    cfg_hidden_input = fillArgs('<input type="hidden" id="{0}" value=\'{1}\'>', cfgkey, cfg_input_value);
                    var list_items = [];
                    var index = 0;
                    for (var l = 0; l < cfg[cfgkey]['list'].length; l++) {
                        var is_checked = '';
                        if (cfg[cfgkey]['val'].includes(cfg[cfgkey]['list'][l])) {
                            is_checked = ' checked';
                        }
                        list_items.push(fillArgs('<label><input type="checkbox" name="{0}" id="{0}{1}" value="{2}"{3}> {4}</label>', cfgkey, index++, cfg[cfgkey]['list'][l], is_checked, getLang(cfgkey + '_type_' + cfg[cfgkey]['list'][l])));
                    }
                    list_items = list_items.join('<br>');
                    cfg_form_element = list_items;
                    break;
                case 'option':
                    cfg_input_type = 'radio';
                    cfg_input_value = '';
                    cfg_hidden_input = fillArgs('<input type="hidden" id="{0}" value="{1}">', cfgkey, cfg[cfgkey]['val']);
                    var list_items = [];
                    var index = 0;
                    for (var l = 0; l < cfg[cfgkey]['list'].length; l++) {
                        var is_checked = '';
                        if (cfg[cfgkey]['list'][l] == cfg[cfgkey]['val']) {
                            is_checked = ' checked';
                        }
                        list_items.push(fillArgs('<label><input type="radio" name="{0}" id="{0}{1}" value="{2}"{3}> {4}</label>', cfgkey, index++, cfg[cfgkey]['list'][l], is_checked, getLang(cfgkey + '_type_' + transform_value(cfgkey, cfg[cfgkey]['list'][l]))));
                    }
                    list_items = list_items.join('<br>');
                    cfg_form_element = list_items;
                    break;
                case 'binding':
                    cfg_input_type = 'binding';
                    cfg_input_value = '';
                    cfg_hidden_input = '';
                    var size_arg = '';
                    if (isFirefox) {
                        size_arg = ' size="3"';
                    }
                    cfg_form_element = fillArgs('<select id="{0}"{1}>{2}</select>', cfgkey, size_arg, generate_bindings(cfgkey));
                    break;
                case 'api':
                    cfg_input_type = 'text';
                    cfg_input_value = fillArgs(' value="{0}"', cfg[cfgkey]['val']);
                    cfg_hidden_input = '';
                    cfg_form_element = fillArgs('<input type="{0}" id="{1}" {2}>', cfg_input_type, cfgkey, cfg_input_value);
                    break;
            }

            var cfg_form = cfg_hidden_input + cfg_form_element;

            var cfg_reset = '';
            if (cfg[cfgkey]['type'] != 'binding') {
                cfg_reset = fillArgs('<br><button id="{0}ResetButton" class="control button_default">{1}</button>', cfgkey, getLang('button_default'));
            }

            var cfg_presets = [];
            if (cfg[cfgkey]['def'] !== null) {
                var value = process_preset(cfgkey, cfg[cfgkey]['def']);
                cfg_presets.push(fillArgs('{0}: {1}', getLang('options_default'), value));
            }
            if (cfg[cfgkey]['min'] !== null) {
                var value = process_preset(cfgkey, cfg[cfgkey]['min']);
                cfg_presets.push(fillArgs('{0}: {1}', getLang('options_min'), value));
            }
            if (cfg[cfgkey]['max'] !== null) {
                var value = process_preset(cfgkey, cfg[cfgkey]['max']);
                cfg_presets.push(fillArgs('{0}: {1}', getLang('options_max'), value));
            }
            if (cfg[cfgkey]['off'] !== null) {
                var value = process_preset(cfgkey, cfg[cfgkey]['off']);
                cfg_presets.push(fillArgs('{0}: {1}', getLang('options_off'), value));
            }
            if (cfg_presets.length > 0) {
                cfg_presets = '(' + cfg_presets.join(' | ') + ')';
            }

            var cfg_warning = '';
            if (disabled_features.includes(cfgkey)) {
                cfg_warning = fillArgs('<span class="orange">{0}</span>', getLang('netflix_changes'));
            }

            var cfg_desc = fillArgs('<span class="hint">{0}</span>', cfg[cfgkey]['desc']);

            var new_line = [
                'bool',
            ];
            var field_content = '<label style="{SHOW_CFG_ITEM}">{CFG_NAME}{CFG_NEW_LINE}{CFG_FORM}{CFG_RESET}<br>{CFG_PRESETS}<br>{CFG_WARNING}<br>{CFG_DESC}<hr style="height: 1px;"></label>';
            var field_keys = {
                'SHOW_CFG_ITEM': ((cfg[conf_cat[key][i]]['access']) ? '' : 'display: none;'),
                'CFG_NAME': cfg_name,
                'CFG_NEW_LINE': ((!new_line.includes(cfg[cfgkey]['type'])) ? '<br>' : ' '),
                'CFG_FORM': cfg_form,
                'CFG_RESET': cfg_reset,
                'CFG_PRESETS': cfg_presets,
                'CFG_WARNING': cfg_warning,
                'CFG_DESC': cfg_desc
            };
            fields.push(fillKeys(field_content, field_keys));

            if (cfg[conf_cat[key][i]]['access']) {
                if (conf_cat_count.hasOwnProperty(key)) {
                    conf_cat_count[key]++;
                } else {
                    conf_cat_count[key] = 1;
                }
            }
        }

        fields = fields.join('');

        var cat_content = '<div id="tab_{CAT_NAME}" class="tab hidden">{CAT_FIELDS}</div>';
        var cat_keys = {
            'CAT_NAME': key,
            'CAT_FIELDS': fields
        };
        conf += fillKeys(cat_content, cat_keys);
    }

    //log('debug', 'options_generation', conf);
    addDOM(document.getElementById('configuration_tabs'), conf);
    log('debug', 'options_generation', document.getElementById('configuration_tabs'));

    // Add events to buttons and forms based on their type
    for (var key in conf_cat) {
        for (var i = 0; i < conf_cat[key].length; i++) {
            if (!cfg[conf_cat[key][i]]['access']) {
                continue;
            }
            var cfgkey = conf_cat[key][i];
            switch (cfg[cfgkey]['type']) {
                case 'number':
                case 'bool':
                case 'select':
                case 'binding':
                case 'api':
                    document.getElementById(cfgkey).addEventListener('change', function() { logEvent('generate_options_data > api'); save_data(); });
                    break;
                case 'range':
                    document.getElementById(cfgkey).addEventListener('change', function() { logEvent('generate_options_data > range'); save_data(); });
                    document.getElementById(cfgkey).addEventListener('input', function() { logEvent('generate_options_data > range'); update_current_value(this); });
                    break;
                case 'array':
                    var elms = document.getElementsByName(cfgkey);
                    for (var j = 0; j < elms.length; j++) {
                        elms[j].addEventListener('click', function() { logEvent('generate_options_data > array'); array_change(this); });
                    }
                    break;
                case 'option':
                    var elms = document.getElementsByName(cfgkey);
                    for (var j = 0; j < elms.length; j++) {
                        elms[j].addEventListener('click', function() { logEvent('generate_options_data > option'); option_change(this); });
                    }
                    break;
            }
        }
    }

    for (var key in conf_cat_count) {
        var cfg_count = conf_cat_count[key];

        if (key != 'debug') {
            if (cfg_count > 0) {
                document.getElementById('button_tab_' + key).style.display = 'block';
            } else {
                document.getElementById('button_tab_' + key).style.display = 'none';
            }
        } else {
            if (isDev || isTest) {
                document.getElementById('button_tab_' + key).style.display = 'block';
            }
        }
    }

    document.getElementById('button_reset_video').addEventListener('click', function() { logEvent('generate_options_data > button_reset_video'); reset_data_cat('video'); });
    document.getElementById('button_reset_bindings').addEventListener('click', function() { logEvent('generate_options_data > button_reset_bindings'); reset_data_cat('bindings'); });
    document.getElementById('button_reset_debug').addEventListener('click', function() { logEvent('generate_options_data > button_reset_debug'); reset_data_cat('debug'); });
    Array.from(document.getElementsByClassName('button_default')).forEach(item => { item.addEventListener('click', function() { logEvent('generate_options_data > button_default'); reset_option_data(this); }); });

    tab_select(load_tab);
    toggle_objects(false);

    setStatus(getLang('cfg_loaded'),'green',1500);
}

function update_current_value(option) {
    addDOM(document.getElementById(option.id + '_current_val'), document.getElementById(option.id).value);
}

function process_preset(key, value) {
    value = transform_value(key, value);
    if (cfg[key]['type'] == 'array') {
        value = JSON.stringify(translate_array_default(key + '_type', value));
    }
    if (cfg[key]['type'] == 'option') {
        value = getLang(key + '_type_' + value);
    }

    return value;
}

function transform_value(key, value) {
    if (key == 'logLevel') {
        value = logLevel_type(value);
    }

    return value;
}

function option_change(object) {
    // Set current value to hidden element
    update_hidden_element('option', object.name, object.value);
}

function array_change(object) {
    // Set current value to hidden element
    update_hidden_element('array', object.name, '');
}

function update_hidden_element(type, name, value) {
    if (type == 'array') {
        var value_array = [];
        var ele = document.getElementsByName(name);
        for (i = 0; i < ele.length; i++) {
            if (ele[i].checked) {
                value_array.push(ele[i].value);
            }
        }
        document.getElementById(name).value = JSON.stringify(value_array);
    }
    if (type == 'option') {
        document.getElementById(name).value = value;
    }
    save_data();
}

function generate_bindings(selected) {
    // Load already used keys
    var exceptions = [];
    for (var key in cfg) {
        if (cfg.hasOwnProperty(key) && key != selected) {
            if (cfg[key]['type'] == 'binding' && cfg[key]['val'] != 'DISABLED') {
                exceptions.push(cfg[key]['val']);
            }
        }
    }

    // Generate key options
    var options = '';
    for (var i = 0; i < keybinds.length; i++) {
        var keyname = keybinds[i][0];
        var keycode = keybinds[i][1];
        var isSelected = '';
        var cfg_keyname = cfg[selected]['val'];
        if (cfg_keyname == keyname) {
            isSelected = ' selected class="active"';
        }
        var isException = exceptions.includes(keyname);
        if (!isException) {
            var keyname_text = keyname;
            if (keyname_text == 'DISABLED') {
                keyname_text = '== DISABLED ==';
            }
            options += fillArgs('<option value="{1}"{2}>{3}</option>', selected, keyname, isSelected, keyname_text);
        }
    }

    return options;
}

function reset_option_data(object) {
    var obj_name = object.id.replace('ResetButton', '');
    var cfg_type = cfg[obj_name]['type'];

    switch (cfg_type) {
        case 'option':
        case 'array':
            check_values(obj_name, cfg[obj_name]['def']);
            break;
        case 'number':
        case 'range':
        case 'text':
        case 'api':
            document.getElementById(obj_name).value = cfg[obj_name]['def'];
            break;
        case 'bool':
            document.getElementById(obj_name).checked = cfg[obj_name]['def'];
            break;
        case 'binding':
            // Key binding does not allow reset to default due to possible conflicts
            break;
        default:
            log('error', '', getLang('unsupported_cfg_type'), cfg_type);
            break;
    }
    save_data();
}

function show_debug_menu() {
    // Show debug menu tab
    document.getElementById('button_tab_debug').style.display = 'block';
}

function load_changelog() {
    // Load local extension file into variable
    try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', changelog_page, true);
        xhr.responseType = 'text';
        xhr.onreadystatechange = function() {
            if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                addDOM(document.getElementById('about_changelog'), xhr.responseText);
            } else {
                addDOM(document.getElementById('about_changelog'), getLang('changelog_fetch_failed'));
            }
        };
        xhr.send();
    } catch (e) {
        addDOM(document.getElementById('about_changelog'), getLang('changelog_fetch_failed'));
    }
}

function fill_about() {
    load_changelog();
    document.getElementById('about_logo').src = logo_icon;
    addDOM(document.getElementById('about_founder_name'), getLang('founded_by') + ' ' + getLang('founder'));
    addDOM(document.getElementById('about_provider_name'), getLang('provided_by') + ' ' + getLang('provider'));
    addDOM(document.getElementById('about_developer_name'), getLang('developed_by') + ' ' + getLang('developer'));
    addDOM(document.getElementById('about_disclaimer'), getLang('disclaimer'));
    addDOM(document.getElementById('about_extension_version'), getLang('version') + ' ' + extension_version);

    if (webstore_urls[browser] != '') {
        addDOM(document.getElementById('about_web_store'), '<a href="' + webstore_urls[browser] + '" style="display: unset;" target="_blank">' + getLang('extension_webstore') + '</a>');
    }

    var donations = [];
    if (donation_urls['paypal'] != '') {
        donations.push('<a href="' + donation_urls['paypal'] + '" style="display: unset;" target="_blank">' + getLang('paypal') + '</a>');
    }
    if (donation_urls['patreon'] != '') {
        donations.push('<a href="' + donation_urls['patreon'] + '" style="display: unset;" target="_blank">' + getLang('patreon') + '</a>');
    }
    if (donations.length == 0) {
        show_donation_link = false;
    } else {
        donations = donations.join(', ');
    }
    if (show_donation_link) {
        addDOM(document.getElementById('about_donate'), getLang('donate') + ' ' + donations);
    }

    setText('about_extension_name', 'name');
    setText('about_changelog_text', 'changelog');

    setText('button_debug', 'button_debug');
}

function toggle_element(elms, disable) {
    // Loop trough elements and enable/disable them
    for (var i = 0; i < elms.length; i++) {
        elms[i].disabled = disable;
    }
}

function toggle_objects(disable) {
    // Enable/Disable all elements
    var tagsDisable;
    document.getElementById('button_reset').disabled = disable;
    tagsDisable = document.getElementsByTagName('input');
    toggle_element(tagsDisable, disable);
    tagsDisable = document.getElementsByTagName('select');
    toggle_element(tagsDisable, disable);
}

function reset_data() {
    if (!confirm(getLang('confirm_reset'))) {
        return;
    }

    reset_configuration();
    load_data();
}

function reset_data_cat(type) {
    if (!confirm(getLang('confirm_reset'))) {
        return;
    }

    reset_configuration_cat(type);
    load_data();
}

function save_data() {
    // Save data
    toggle_objects(true);
    setStatus(getLang('cfg_saving'),'orange',10);
    save_configuration(function() {
        generate_options_data(options_tab_selected);
    });
}

function load_data() {
    // Load data
    toggle_objects(true);
    setStatus(getLang('cfg_loading'),'orange',10);
    load_configuration(function() {
        generate_options_data(options_tab_selected);
    });
}

function generate_options_content() {
    // Initial load of data
    toggle_objects(true);
    setStatus(getLang('cfg_loading'),'orange',10);
    if (isDev || isTest) {
        document.getElementById('button_reload').classList.remove('hidden');
    }

    // Load configuration with callback
    load_configuration(function() {
        generate_options_data(options_tab_selected);

        // Fill in About info
        fill_about();
        fill_statistics();

        // Fill in fields with text based on locale
        setText('menu_assistant', 'menu_assistant');
        setText('menu_ratings', 'menu_ratings');
        setText('menu_video', 'menu_video');
        setText('menu_timers', 'menu_timers');
        setText('menu_bindings', 'menu_bindings');
        setText('menu_storage', 'menu_storage');
        setText('menu_api', 'menu_api');
        setText('menu_statistics', 'menu_statistics');
        setText('menu_about', 'menu_about');
        setText('menu_debug', 'menu_debug');

        setText('options_title', 'options_title');

        setText('button_reset', 'button_reset');
        setText('button_reload', 'button_reload');

        // Inject button activities
        document.getElementById('button_reset').addEventListener('click', function() { logEvent('button_reset'); reset_data(); });
        document.getElementById('button_reload').addEventListener('click', function() { logEvent('button_reload'); reload_extension(); });
        document.getElementById('button_debug').addEventListener('click', function() { logEvent('button_debug'); show_debug_menu(); });

        document.getElementById('button_tab_assistant').addEventListener('click', function() { logEvent('button_tab_assistant'); tab_select('tab_assistant'); });
        document.getElementById('button_tab_ratings').addEventListener('click', function() { logEvent('button_tab_ratings'); tab_select('tab_ratings'); });
        document.getElementById('button_tab_video').addEventListener('click', function() { logEvent('button_tab_video'); tab_select('tab_video'); });
        document.getElementById('button_tab_timers').addEventListener('click', function() { logEvent('button_tab_timers'); tab_select('tab_timers'); });
        document.getElementById('button_tab_bindings').addEventListener('click', function() { logEvent('button_tab_bindings'); tab_select('tab_bindings'); });
        document.getElementById('button_tab_storage').addEventListener('click', function() { logEvent('button_tab_storage'); tab_select('tab_storage'); });
        document.getElementById('button_tab_api').addEventListener('click', function() { logEvent('button_tab_api'); tab_select('tab_api'); });
        document.getElementById('button_tab_statistics').addEventListener('click', function() { logEvent('button_tab_statistics'); tab_select('tab_statistics'); fill_statistics(); });
        document.getElementById('button_tab_about').addEventListener('click', function() { logEvent('button_tab_about'); tab_select('tab_about'); });
        document.getElementById('button_tab_debug').addEventListener('click', function() { logEvent('button_tab_debug'); tab_select('tab_debug'); });

        document.getElementById('options_loading').style.display = 'none';
        document.getElementById('extension_options_content').style.display = 'block';
        if (options_tab_selected == 'tab_debug') {
            show_debug_menu();
        }
    });
}

function fill_statistics() {
    var statistics_data = `
        <span class="stats_name">{EXTENSION_ACTIONS_TEXT}<br><span style="font-size: 10px;">(from: {ACTIONS_FROM})</span></span><br><br>

        <table style="text-align: left; width: 100%;">
            <tr>
                <th style="width: 100%;">
                    {ACTIONS_TEXT}
                </th>
                <th style="min-width: 100px;">
                    {ACTIONS_COUNT_TEXT}
                </th>
            </tr>
            {ACTIONS_STATS}
        </table>

        <hr style="height: 1px;">

        <span class="stats_name">{RATINGS_TEXT}</span><br><br>

        <table style="text-align: left; width: 100%;">
            <tr>
                <th colspan="2">
                    {RATINGS_GENERAL_TEXT}
                </th>
            </tr>
            <tr>
                <td style="padding-left: 10px; width: 100%;">
                    {RATINGS_TOTAL_TEXT}
                </td>
                <td style="min-width: 100px;">
                    {RATINGS_TOTAL}
                </td>
            </tr>
            <tr>
                <td style="padding-left: 10px;">
                    {RATINGS_SIZE_TEXT}
                </td>
                <td>
                    {RATINGS_SIZE}
                </td>
            </tr>
            <tr>
                <td style="padding-left: 10px;">
                    {RATINGS_API_KEY_LIMIT_TEXT}
                </td>
                <td>
                    {RATINGS_API_KEY_LIMIT}
                </td>
            </tr>
            <tr>
                <td style="padding-left: 10px;">
                    {RATINGS_EXPIRING_24H_TEXT}
                </td>
                <td>
                    {RATINGS_EXPIRING_24H}
                </td>
            </tr>
            <tr>
                <td style="padding-left: 10px;">
                    {RATINGS_EXPIRING_1W_TEXT}
                </td>
                <td>
                    {RATINGS_EXPIRING_1W}
                </td>
            </tr>
            {RATINGS_STATE_STATS}
        </table>

        <hr style="height: 1px;">

        <span class="stats_name">{STORAGE_TEXT}</span><br><br>

        <table style="text-align: center; width: 100%;">
            <tr>
                <th style="text-align: left; min-width: 80px;">
                    {STORAGE_TYPE_TEXT}
                </th>
                <th style="width: 100%;">
                    {PERCENTAGE_TEXT}
                </th>
                <th style="min-width: 150px;">
                    {DATA_VALUES_TEXT}
                </th>
            </tr>
            <tr style="{SHOW_LOCAL_SIZE}">
                <td style="text-align: left;">
                    {LOCAL_SIZE_TEXT}
                </td>
                <td>
                    <input type="range" value="{LOCAL_SIZE_USED}" max="{LOCAL_SIZE_TOTAL}" disabled>
                </td>
                <td>
                    {LOCAL_SIZE_USED} KB/{LOCAL_SIZE_TOTAL} KB
                </td>
            </tr>
            <tr style="{SHOW_LOCAL_SIZE_UNKNOWN}">
                <td style="text-align: left;">
                    {LOCAL_SIZE_TEXT}
                </td>
                <td colspan="2">
                    {SIZE_UNKNOWN}
                </td>
            </tr>
            <tr style="{SHOW_EXTENSION_SIZE}">
                <td style="text-align: left;">
                    {EXTENSION_SIZE_TEXT}
                </td>
                <td>
                    <input type="range" value="{EXTENSION_SIZE_USED}" max="{EXTENSION_SIZE_TOTAL}" disabled>
                </td>
                <td>
                    {EXTENSION_SIZE_USED} KB/{EXTENSION_SIZE_TOTAL} KB
                </td>
            </tr>
            <tr style="{SHOW_EXTENSION_SIZE_UNKNOWN}">
                <td style="text-align: left;">
                    {EXTENSION_SIZE_TEXT}
                </td>
                <td colspan="2">
                    {SIZE_UNKNOWN}
                </td>
            </tr>
        </table>

        <hr style="height: 1px;">
`;

    var collection_start = new Date().toLocaleString(undefined, date_format['full']);
    if (stats_counter['collection_start']) {
        collection_start = new Date(stats_counter['collection_start']).toLocaleString(undefined, date_format['full']);
    }
    var actions_stats = '';
    for (var key in stats_counter) {
        if (key != 'collection_start') {
            actions_stats += fillArgs('<tr><td style="padding-left: 10px;">{0}</td><td>{1}</td></tr>', getLang(key), stats_counter[key]);
        }
    }
    if (actions_stats == '') {
        actions_stats = fillArgs('<tr><td style="text-align: center;" colspan="2">{0}</td></tr>', getLang('stat_actions_none'));
    }

    var ratings_stats = {
        'total': 0,
        'size': ((localStorage['netflex_ratingsDB'].length + 'netflex_ratingsDB'.length) * 2),
        'expiration_within_24h': 0,
        'expiration_within_1w': 0,
        'state': {
            'wikidata_imdb_not_available': 0,
            //'wikidata_finished': 0, // wikidata_finished state should almost immediately change to api_* state
            'wikidata_not_available': 0,
            'wikidata_timeout': 0,
            'wikidata_error': 0,
            'api_finished': 0,
            'api_not_available': 0,
            'api_timeout': 0,
            'api_limit': 0,
            'api_invalid': 0
        }
    };

    for (var key in ratingsDB[ratings_version]) {
        var rating = ratingsDB[ratings_version][key];

        ratings_stats['total']++;
        if (new Date(rating['expire']) < new Date().addDays(1)) {
            ratings_stats['expiration_within_24h']++;
        }
        if (new Date(rating['expire']) < new Date().addDays(7)) {
            ratings_stats['expiration_within_1w']++;
        }

        if (ratings_stats['state'].hasOwnProperty(rating['state'])) {
            ratings_stats['state'][rating['state']]++;
        }
    }

    var ratings_state_stats = '';
    for (var key in ratings_stats['state']) {
        ratings_state_stats += fillArgs('<tr><td style="padding-left: 10px;">{0}</td><td>{1}</td></tr>', getLang('stat_' + key), ratings_stats['state'][key]);
    }
    if (ratings_state_stats != '') {
        ratings_state_stats = fillArgs('<tr><th colspan="2">{0}</th></tr>{1}', getLang('stat_ratings_states'), ratings_state_stats);
    }

    var local_unknown = true;
    if (storage_stats['local']['max_bytes'] != 0) {
        local_unknown = false;
    }
    var extension_unknown = true;
    if (storage_stats['extension']['max_bytes'] != 0) {
        extension_unknown = false;
    }

    var keys = {
        'EXTENSION_ACTIONS_TEXT': getLang('stat_extension_actions'),
        'ACTIONS_FROM': collection_start,
        'ACTIONS_STATS': actions_stats,
        'ACTIONS_TEXT': getLang('stat_actions'),
        'ACTIONS_COUNT_TEXT': getLang('stat_actions_count'),

        'RATINGS_TEXT': getLang('stat_ratings'),
        'RATINGS_GENERAL_TEXT': getLang('stat_ratings_general'),
        'RATINGS_TOTAL_TEXT': getLang('stat_ratings_total_stored'),
        'RATINGS_TOTAL': ratings_stats['total'],
        'RATINGS_SIZE_TEXT': getLang('stat_ratings_total_size'),
        'RATINGS_SIZE': Math.round(ratings_stats['size'] / 1024) + ' KB',
        'RATINGS_API_KEY_LIMIT_TEXT': getLang('stat_ratings_api_limit'),
        'RATINGS_API_KEY_LIMIT': ((ratings_limit_reached) ? 'Yes' : 'No'),
        'RATINGS_EXPIRING_24H_TEXT': getLang('stat_ratings_expire_24h'),
        'RATINGS_EXPIRING_24H': ratings_stats['expiration_within_24h'],
        'RATINGS_EXPIRING_1W_TEXT': getLang('stat_ratings_expire_1w'),
        'RATINGS_EXPIRING_1W': ratings_stats['expiration_within_1w'],
        'RATINGS_STATE_STATS': ratings_state_stats,

        'STORAGE_TEXT': getLang('stat_storage'),
        'STORAGE_TYPE_TEXT': getLang('stat_storage_type'),
        'PERCENTAGE_TEXT': getLang('stat_storage_percentage'),
        'DATA_VALUES_TEXT': getLang('stat_storage_size'),
        'SHOW_LOCAL_SIZE': ((!local_unknown) ? '' : 'display: none;' ),
        'SHOW_LOCAL_SIZE_UNKNOWN': ((local_unknown) ? '' : 'display: none;' ),
        'SHOW_EXTENSION_SIZE': ((!extension_unknown) ? '' : 'display: none;' ),
        'SHOW_EXTENSION_SIZE_UNKNOWN': ((extension_unknown) ? '' : 'display: none;' ),
        'SIZE_UNKNOWN': getLang('stat_storage_size_unknown'),
        'LOCAL_SIZE_TEXT': getLang('stat_storage_local'),
        'LOCAL_SIZE_USED': Math.round(storage_stats['local']['used_bytes'] / 1024),
        'LOCAL_SIZE_TOTAL': Math.round(storage_stats['local']['max_bytes'] / 1024),
        'EXTENSION_SIZE_TEXT': getLang('stat_storage_extension'),
        'EXTENSION_SIZE_USED': Math.round(storage_stats['extension']['used_bytes'] / 1024),
        'EXTENSION_SIZE_TOTAL': Math.round(storage_stats['extension']['max_bytes'] / 1024)
    };
    statistics_data = fillKeys(statistics_data, keys);
    addDOM(document.getElementById('tab_statistics'), statistics_data);
}