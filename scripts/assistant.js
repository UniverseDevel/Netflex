function extension_options() {
    var feat = document.getElementById('extension_features_integrated');
    var icon = document.getElementById('extension_features');
    if (feat) {
        if (feat.style.display != 'none') {
            feat.style.display = 'none';
            try {icon.children[0].classList.remove('fa-minus');} catch (e) {}
            icon.children[0].classList.add('fa-plus');
        }
    }

    // Open options page
    var opt = document.getElementById('extension_options_integrated');
    if (opt) {
        if (opt.style.display == 'none') {
            addDOM(document.getElementById('extension_options_scrollable'), generate_options());
            generate_options_content();
            opt.style.display = 'table-cell';
        } else {
            opt.style.display = 'none';
        }
    }
}

function extension_features() {
    var opt = document.getElementById('extension_options_integrated');
    if (opt) {
        if (opt.style.display != 'none') {
            opt.style.display = 'none';
        }
    }

    // Show features part of status bubble element
    var feat = document.getElementById('extension_features_integrated');
    var icon = document.getElementById('extension_features');
    if (feat) {
        if (feat.style.display === 'none') {
            addDOM(document.getElementById('extension_features_scrollable'), generate_status_features());
            document.getElementById('extension_features_scrollable').scrollTo(0, 0);
            create_features_events();
            feat.style.display = 'table-cell';
            try {icon.children[0].classList.remove('fa-plus');} catch (e) {}
            icon.children[0].classList.add('fa-minus');
        } else {
            feat.style.display = 'none';
            try {icon.children[0].classList.remove('fa-minus');} catch (e) {}
            icon.children[0].classList.add('fa-plus');
        }
    }
}

function generate_status_data(status_text) {
    // Generate donations links
    var donations = [];
    if (donation_urls['paypal'] != '') {
        donations.push('<a href="' + donation_urls['paypal'] + '" target="_blank" style="text-decoration: underline; display: unset;">' + getLang('paypal') + '</a>');
    }
    if (donation_urls['patreon'] != '') {
        donations.push('<a href="' + donation_urls['patreon'] + '" target="_blank" style="text-decoration: underline; display: unset;">' + getLang('patreon') + '</a>');
    }
    if (donations.length == 0 || check_kids() || check_kids_profile()) {
        show_donation_link = false;
    } else {
        donations = donations.join(', ');
    }

    // HTML template for status pop-up bubble injected into status icon in Netflix
    var status_data = `
<table border="0" style="border: 0; margin: 0; padding: 0; width: 100%;">
    <tr>
        <td rowspan="3" style="vertical-align: top; max-width: 75px; width: 75px;{SHOW_LOGO}">
            <img id="extension_logo" src="{LOGO}" style="width: 64px; cursor: pointer;" alt="{SHORT_NAME}">
        </td>
        <th>
            {NAME} <span style="font-size: .5em;">(v{VERSION})</span>
            <a href="javascript:void(0);" id="extension_options" style="color: #00b642; position: relative; top: 0.1em; float: right; cursor: pointer;{SHOW_OPTIONS_ICON}"><i id="extension_options_icon" class="fas fa-cog" title="{OPTIONS}"></i></a>
        </th>
    </tr>
    <tr>
        <td>
            {STATUS_TEXT}
        </td>
    </tr>
    <tr>
        <td>
            <a href="{WEBSTORE_URL}" target="_blank" style="text-decoration: underline; font-size: 12px; display: unset;{SHOW_WEBSTORE}">{RATE_EXTENSION}</a>
            <span style="font-size: 12px; display: unset;{SHOW_DONATIONS}">
                - {DONATE} {DONATION_LINKS}
            </span>
            <a href="javascript:void(0);" id="extension_features" style="color: #00b642; position: relative; float: right; cursor: pointer;{SHOW_OPTIONS_ICON}"><i class="fas fa-plus" title="{FEATURES}"></i></a>
        </td>
    </tr>
    <tr>
        <td colspan="2" id="extension_features_integrated" style="display: none; font-size: 12px;">
            <br>
            <div id="extension_features_scrollable" style="max-height: 300px; overflow-y: scroll;">
                {FEATURES_CONTENT}
            </div>
        </td>
    </tr>
    <tr>
        <td colspan="2" id="extension_options_integrated" style="display: none;">
            <hr>
            <div id="extension_options_scrollable" style="width: 100%; height: 430px; border: 0px;">{OPTIONS_CONTENT}</div>
        </td>
    </tr>
</table>
`;

    // Define and insert fields into template
    var keys = {
        'SHOW_LOGO': ((!isOrphan) ? '' : 'display: none;' ),
        'LOGO': logo_icon,
        'SHORT_NAME': getLang('short_name'),
        'NAME': getLang('name'),
        'VERSION': extension_version,
        'SHOW_OPTIONS_ICON': ((!isOrphan && !check_kids() && !check_kids_profile()) ? '' : 'display: none;' ),
        'OPTIONS': getLang('options'),
        'STATUS_TEXT': status_text,
        'WEBSTORE_URL': stores_urls[browser],
        'SHOW_WEBSTORE': ((!check_kids() && !check_kids_profile()) ? '' : 'display: none;' ),
        'RATE_EXTENSION': getLang('rate_extension'),
        'SHOW_DONATIONS': ((show_donation_link) ? '' : 'display: none;'),
        'DONATE': getLang('donate'),
        'DONATION_LINKS': donations,
        'OPTIONS_CONTENT': ((!isOrphan) ? generate_options() : ''),
        'FEATURES': getLang('features'),
        'FEATURES_CONTENT': generate_status_features()
    };
    status_data = fillKeys(status_data, keys);

    return status_data;
}

function generate_options() {
    // HTML template for extension options status pop-up bubble injected into status icon in Netflix
    var options_data = `
        <div id="options_loading" style="text-align: center;">
            <i class="fas fa-spinner fa-pulse" title="{LOADING_TEXT}" style="font-size: 30px; font-weight: bold;"></i>
        </div>
        <div id="extension_options_content" style="display: none;">
            <div id="window_status" style="display: none;"></div>
            <div id="status" class="status marginLeftContent">&nbsp;</div>
            <div class="controls marginLeftContent marginTopControls">
                <button id="button_reset" class="control button_reset"></button>
                <button id="button_reload" class="control button_reload right hidden"></button>
            </div>

            <nav class="sidebar block">
                <button class="option item active menu_assistant" id="button_tab_assistant" style="display: none;"></button>
                <button class="option item menu_ratings" id="button_tab_ratings" style="display: none;"></button>
                <button class="option item menu_video" id="button_tab_video" style="display: none;"></button>
                <button class="option item menu_timers" id="button_tab_timers" style="display: none;"></button>
                <button class="option item menu_bindings" id="button_tab_bindings" style="display: none;"></button>
                <button class="option item menu_storage" id="button_tab_storage" style="display: none;"></button>
                <button class="option item menu_api" id="button_tab_api" style="display: none;"></button>
                <button class="option item menu_statistics" id="button_tab_statistics"></button>
                <button class="option item menu_about" id="button_tab_about"></button>
                <button class="option item menu_debug" id="button_tab_debug" style="display: none;"></button>
            </nav>

            <div class="content marginLeftContent marginTopContent">

                <hr style="height: 1px;">

                <div id="tab_about" class="tab hidden">
                    <div style="text-align: center;">
                        <img id="about_logo" class="about_logo" src=""><br>
                        <span id="about_extension_name" class="about_extension_name"></span><br>
                        <span id="about_extension_version" class="about_extension_version"></span><br>
                        <span id="about_founder_name" class="about_founder_name"></span><br>
                        <span id="about_provider_name" class="about_provider_name"></span><br>
                        <span id="about_developer_name" class="about_developer_name"></span><br><br>
                        <span id="about_donate" class="about_donate"></span><br><br>
                        <span id="about_source" class="about_source"></span><br><br>
                        <span id="about_disclaimer" class="about_disclaimer"></span><br><br>
                        <span id="about_web_store" class="about_web_store"></span><br><br>
                        <button id="button_debug" class="control button_debug"></button>
                    </div>
                    <hr style="height: 1px;">
                    <span id="about_changelog_text" class="about_changelog_text"></span><br>
                    <div id="about_changelog" class="about_changelog"></div>
                </div>

                <div id="tab_statistics" class="tab hidden"></div>

                <span id="configuration_tabs"></span>

            </div>
        </div>
`;

    var keys = {
        'LOADING_TEXT': getLang('data_loading')
    };
    options_data = fillKeys(options_data, keys);

    return options_data;
}

function generate_status_features() {
    // HTML template for additional features in status pop-up bubble injected into status icon in Netflix
    var status_features = `
        <hr style="{SHOW_NO_FEATURES_MSG}">
        <div style="text-align: center;{SHOW_NO_FEATURES_MSG}">
            {NO_FEATURES_MSG}
        </div>
        <hr style="{SHOW_BROWSE_CATEGORIES}">
        <div style="text-align: center;{SHOW_BROWSE_CATEGORIES}">
            {BROWSE_CATEGORIES}
        </div>
        <hr style="{SHOW_TEMP_HIDE_SUBTITLES}">
        <table border="0" style="border: 0; margin: 0; padding: 0; width: 100%;{SHOW_TEMP_HIDE_SUBTITLES}">
            <tr>
                <td>
                    <label>{TEMP_HIDE_SUBTITLES_TEXT} <input type="checkbox" id="feature_tempHideSubtitles" {TEMP_HIDE_SUBTITLES}></label>
                </td>
            </tr>
            <tr>
                <td>
                    <button class="extension_feature_reset" value="feature_tempHideSubtitles:check:false" style="border: 0; color: #ffffff !important; background-color: #000000 !important;">{FEATURE_RESET_DEFAULT}</button>
                </td>
            </tr>
        </table>
        <hr style="{SHOW_VIDEO_SPEED_RATE}">
        <table border="0" style="border: 0; margin: 0; padding: 0; width: 100%;{SHOW_VIDEO_SPEED_RATE}">
            <tr>
                <td colspan="2">
                    {VIDEO_SPEED_RATE_TEXT}
                </td>
            </tr>
            <tr style="padding-top: 5px;">
                <td style="width: 100%; padding-right: 5px;">
                    <input type="range" id="feature_videoSpeedRate" value="{VIDEO_SPEED_RATE_VALUE}" min="{VIDEO_SPEED_RATE_MIN}" max="{VIDEO_SPEED_RATE_MAX}" step="{VIDEO_SPEED_RATE_STEP}" style="width: 100%;">
                </td>
                <td style="min-width: 50px;">
                    <span id="feature_videoSpeedRate_display">{VIDEO_SPEED_RATE_VALUE_DISPLAY}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <button class="extension_feature_reset" value="feature_videoSpeedRate:cfg:videoSpeedRate" style="border: 0; color: #ffffff !important; background-color: #000000 !important;">{FEATURE_RESET_CFG}</button>
                </td>
            </tr>
        </table>
        <hr style="{SHOW_VIDEO_BRIGHTNESS}">
        <table border="0" style="border: 0; margin: 0; padding: 0; width: 100%;{SHOW_VIDEO_BRIGHTNESS}">
            <tr>
                <td colspan="2">
                    {VIDEO_BRIGHTNESS_TEXT}
                </td>
            </tr>
            <tr style="padding-top: 5px;">
                <td style="width: 100%; padding-right: 5px;">
                    <input type="range" id="feature_videoBrightness" value="{VIDEO_BRIGHTNESS_VALUE}" min="{VIDEO_BRIGHTNESS_MIN}" max="{VIDEO_BRIGHTNESS_MAX}" step="{VIDEO_BRIGHTNESS_STEP}" style="width: 100%;">
                </td>
                <td style="min-width: 50px;">
                    <span id="feature_videoBrightness_display">{VIDEO_BRIGHTNESS_VALUE_DISPLAY}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <button class="extension_feature_reset" value="feature_videoBrightness:cfg:videoBrightness" style="border: 0; color: #ffffff !important; background-color: #000000 !important;">{FEATURE_RESET_CFG}</button>
                </td>
            </tr>
        </table>
        <hr style="{SHOW_VIDEO_CONTRAST}">
        <table border="0" style="border: 0; margin: 0; padding: 0; width: 100%;{SHOW_VIDEO_CONTRAST}">
            <tr>
                <td colspan="2">
                    {VIDEO_CONTRAST_TEXT}
                </td>
            </tr>
            <tr style="padding-top: 5px;">
                <td style="width: 100%; padding-right: 5px;">
                    <input type="range" id="feature_videoContrast" value="{VIDEO_CONTRAST_VALUE}" min="{VIDEO_CONTRAST_MIN}" max="{VIDEO_CONTRAST_MAX}" step="{VIDEO_CONTRAST_STEP}" style="width: 100%;">
                </td>
                <td style="min-width: 50px;">
                    <span id="feature_videoContrast_display">{VIDEO_CONTRAST_VALUE_DISPLAY}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <button class="extension_feature_reset" value="feature_videoContrast:cfg:videoContrast" style="border: 0; color: #ffffff !important; background-color: #000000 !important;">{FEATURE_RESET_CFG}</button>
                </td>
            </tr>
        </table>
        <hr style="{SHOW_VIDEO_GRAYSCALE}">
        <table border="0" style="border: 0; margin: 0; padding: 0; width: 100%;{SHOW_VIDEO_GRAYSCALE}">
            <tr>
                <td colspan="2">
                    {VIDEO_GRAYSCALE_TEXT}
                </td>
            </tr>
            <tr style="padding-top: 5px;">
                <td style="width: 100%; padding-right: 5px;">
                    <input type="range" id="feature_videoGrayscale" value="{VIDEO_GRAYSCALE_VALUE}" min="{VIDEO_GRAYSCALE_MIN}" max="{VIDEO_GRAYSCALE_MAX}" step="{VIDEO_GRAYSCALE_STEP}" style="width: 100%;">
                </td>
                <td style="min-width: 50px;">
                    <span id="feature_videoGrayscale_display">{VIDEO_GRAYSCALE_VALUE_DISPLAY}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <button class="extension_feature_reset" value="feature_videoGrayscale:cfg:videoGrayscale" style="border: 0; color: #ffffff !important; background-color: #000000 !important;">{FEATURE_RESET_CFG}</button>
                </td>
            </tr>
        </table>
        <hr style="{SHOW_VIDEO_HUE}">
        <table border="0" style="border: 0; margin: 0; padding: 0; width: 100%;{SHOW_VIDEO_HUE}">
            <tr>
                <td colspan="2">
                    {VIDEO_HUE_TEXT}
                </td>
            </tr>
            <tr style="padding-top: 5px;">
                <td style="width: 100%; padding-right: 5px;">
                    <input type="range" id="feature_videoHue" value="{VIDEO_HUE_VALUE}" min="{VIDEO_HUE_MIN}" max="{VIDEO_HUE_MAX}" step="{VIDEO_HUE_STEP}" style="width: 100%;">
                </td>
                <td style="min-width: 50px;">
                    <span id="feature_videoHue_display">{VIDEO_HUE_VALUE_DISPLAY}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <button class="extension_feature_reset" value="feature_videoHue:cfg:videoHue" style="border: 0; color: #ffffff !important; background-color: #000000 !important;">{FEATURE_RESET_CFG}</button>
                </td>
            </tr>
        </table>
        <hr style="{SHOW_VIDEO_INVERT}">
        <table border="0" style="border: 0; margin: 0; padding: 0; width: 100%;{SHOW_VIDEO_INVERT}">
            <tr>
                <td colspan="2">
                    {VIDEO_INVERT_TEXT}
                </td>
            </tr>
            <tr style="padding-top: 5px;">
                <td style="width: 100%; padding-right: 5px;">
                    <input type="range" id="feature_videoInvert" value="{VIDEO_INVERT_VALUE}" min="{VIDEO_INVERT_MIN}" max="{VIDEO_INVERT_MAX}" step="{VIDEO_INVERT_STEP}" style="width: 100%;">
                </td>
                <td style="min-width: 50px;">
                    <span id="feature_videoInvert_display">{VIDEO_INVERT_VALUE_DISPLAY}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <button class="extension_feature_reset" value="feature_videoInvert:cfg:videoInvert" style="border: 0; color: #ffffff !important; background-color: #000000 !important;">{FEATURE_RESET_CFG}</button>
                </td>
            </tr>
        </table>
        <hr style="{SHOW_VIDEO_SATURATION}">
        <table border="0" style="border: 0; margin: 0; padding: 0; width: 100%;{SHOW_VIDEO_SATURATION}">
            <tr>
                <td colspan="2">
                    {VIDEO_SATURATION_TEXT}
                </td>
            </tr>
            <tr style="padding-top: 5px;">
                <td style="width: 100%; padding-right: 5px;">
                    <input type="range" id="feature_videoSaturation" value="{VIDEO_SATURATION_VALUE}" min="{VIDEO_SATURATION_MIN}" max="{VIDEO_SATURATION_MAX}" step="{VIDEO_SATURATION_STEP}" style="width: 100%;">
                </td>
                <td style="min-width: 50px;">
                    <span id="feature_videoSaturation_display">{VIDEO_SATURATION_VALUE_DISPLAY}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <button class="extension_feature_reset" value="feature_videoSaturation:cfg:videoSaturation" style="border: 0; color: #ffffff !important; background-color: #000000 !important;">{FEATURE_RESET_CFG}</button>
                </td>
            </tr>
        </table>
        <hr style="{SHOW_VIDEO_SEPIA}">
        <table border="0" style="border: 0; margin: 0; padding: 0; width: 100%;{SHOW_VIDEO_SEPIA}">
            <tr>
                <td colspan="2">
                    {VIDEO_SEPIA_TEXT}
                </td>
            </tr>
            <tr style="padding-top: 5px;">
                <td style="width: 100%; padding-right: 5px;">
                    <input type="range" id="feature_videoSepia" value="{VIDEO_SEPIA_VALUE}" min="{VIDEO_SEPIA_MIN}" max="{VIDEO_SEPIA_MAX}" step="{VIDEO_SEPIA_STEP}" style="width: 100%;">
                </td>
                <td style="min-width: 50px;">
                    <span id="feature_videoSepia_display">{VIDEO_SEPIA_VALUE_DISPLAY}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <button class="extension_feature_reset" value="feature_videoSepia:cfg:videoSepia" style="border: 0; color: #ffffff !important; background-color: #000000 !important;">{FEATURE_RESET_CFG}</button>
                </td>
            </tr>
        </table>
`;

    var shown_features_count = 0;

    var show_browse_categories = 'display: none;';

    var show_tempHideSubtitles = 'display: none;';

    var show_videoSpeedRate = 'display: none;';
    var show_videoBrightness = 'display: none;';
    var show_videoContrast = 'display: none;';
    var show_videoGrayscale = 'display: none;';
    var show_videoHue = 'display: none;';
    var show_videoInvert = 'display: none;';
    var show_videoSaturation = 'display: none;';
    var show_videoSepia = 'display: none;';

    if (check_watch()) {
        if (cfg['hideSubtitlesKey']['access']) {
            show_tempHideSubtitles = '';

            shown_features_count++;
        }

        if (cfg['enableVideoFeatures']['val'] && cfg['enableVideoFeatures']['access']) {
            if (cfg['videoSpeedRate']['access']) {
                show_videoSpeedRate = '';

                shown_features_count++;
            }
            if (video_filter_access) {
                show_videoBrightness = '';
                show_videoContrast = '';
                show_videoGrayscale = '';
                show_videoHue = '';
                show_videoInvert = '';
                show_videoSaturation = '';
                show_videoSepia = '';

                shown_features_count++;
            }
        }
    } else {
        if (cfg['showCategories']['val'] && cfg['showCategories']['access']) {
            show_browse_categories = '';

            shown_features_count++;
        }
    }

    var keys = {
        'SHOW_NO_FEATURES_MSG': ((shown_features_count == 0) ? '' : 'display: none;'),
        'NO_FEATURES_MSG': getLang('no_features_available'),

        'SHOW_BROWSE_CATEGORIES': show_browse_categories,
        'BROWSE_CATEGORIES': generate_categories(),

        'FEATURE_RESET_CFG': getLang('extension_feature_reset_cfg'),
        'FEATURE_RESET_DEFAULT': getLang('extension_feature_reset_default'),

        'SHOW_TEMP_HIDE_SUBTITLES': show_tempHideSubtitles,
        'TEMP_HIDE_SUBTITLES_TEXT': getLang('feature_tempHideSubtitles'),
        'TEMP_HIDE_SUBTITLES': ((hideSubtitles_temp) ? 'checked' : ''),

        'SHOW_VIDEO_SPEED_RATE': show_videoSpeedRate,
        'VIDEO_SPEED_RATE_TEXT': getLang('feature_videoSpeedRate'),
        'VIDEO_SPEED_RATE_VALUE_DISPLAY': videoSpeedRate_temp,
        'VIDEO_SPEED_RATE_VALUE': videoSpeedRate_temp,
        'VIDEO_SPEED_RATE_MIN': cfg['videoSpeedRate']['min'],
        'VIDEO_SPEED_RATE_MAX': cfg['videoSpeedRate']['max'],
        'VIDEO_SPEED_RATE_STEP': cfg['videoSpeedRate']['step'],

        'SHOW_VIDEO_BRIGHTNESS': show_videoBrightness,
        'VIDEO_BRIGHTNESS_TEXT': getLang('feature_videoBrightness'),
        'VIDEO_BRIGHTNESS_VALUE_DISPLAY': videoBrightness_temp,
        'VIDEO_BRIGHTNESS_VALUE': videoBrightness_temp,
        'VIDEO_BRIGHTNESS_MIN': cfg['videoBrightness']['min'],
        'VIDEO_BRIGHTNESS_MAX': cfg['videoBrightness']['max'],
        'VIDEO_BRIGHTNESS_STEP': cfg['videoBrightness']['step'],

        'SHOW_VIDEO_CONTRAST': show_videoContrast,
        'VIDEO_CONTRAST_TEXT': getLang('feature_videoContrast'),
        'VIDEO_CONTRAST_VALUE_DISPLAY': videoContrast_temp,
        'VIDEO_CONTRAST_VALUE': videoContrast_temp,
        'VIDEO_CONTRAST_MIN': cfg['videoContrast']['min'],
        'VIDEO_CONTRAST_MAX': cfg['videoContrast']['max'],
        'VIDEO_CONTRAST_STEP': cfg['videoContrast']['step'],

        'SHOW_VIDEO_GRAYSCALE': show_videoGrayscale,
        'VIDEO_GRAYSCALE_TEXT': getLang('feature_videoGrayscale'),
        'VIDEO_GRAYSCALE_VALUE_DISPLAY': videoGrayscale_temp,
        'VIDEO_GRAYSCALE_VALUE': videoGrayscale_temp,
        'VIDEO_GRAYSCALE_MIN': cfg['videoGrayscale']['min'],
        'VIDEO_GRAYSCALE_MAX': cfg['videoGrayscale']['max'],
        'VIDEO_GRAYSCALE_STEP': cfg['videoGrayscale']['step'],

        'SHOW_VIDEO_HUE': show_videoHue,
        'VIDEO_HUE_TEXT': getLang('feature_videoHue'),
        'VIDEO_HUE_VALUE_DISPLAY': videoHue_temp,
        'VIDEO_HUE_VALUE': videoHue_temp,
        'VIDEO_HUE_MIN': cfg['videoHue']['min'],
        'VIDEO_HUE_MAX': cfg['videoHue']['max'],
        'VIDEO_HUE_STEP': cfg['videoHue']['step'],

        'SHOW_VIDEO_INVERT': show_videoInvert,
        'VIDEO_INVERT_TEXT': getLang('feature_videoInvert'),
        'VIDEO_INVERT_VALUE_DISPLAY': videoInvert_temp,
        'VIDEO_INVERT_VALUE': videoInvert_temp,
        'VIDEO_INVERT_MIN': cfg['videoInvert']['min'],
        'VIDEO_INVERT_MAX': cfg['videoInvert']['max'],
        'VIDEO_INVERT_STEP': cfg['videoInvert']['step'],

        'SHOW_VIDEO_SATURATION': show_videoSaturation,
        'VIDEO_SATURATION_TEXT': getLang('feature_videoSaturation'),
        'VIDEO_SATURATION_VALUE_DISPLAY': videoSaturation_temp,
        'VIDEO_SATURATION_VALUE': videoSaturation_temp,
        'VIDEO_SATURATION_MIN': cfg['videoSaturation']['min'],
        'VIDEO_SATURATION_MAX': cfg['videoSaturation']['max'],
        'VIDEO_SATURATION_STEP': cfg['videoSaturation']['step'],

        'SHOW_VIDEO_SEPIA': show_videoSepia,
        'VIDEO_SEPIA_TEXT': getLang('feature_videoSepia'),
        'VIDEO_SEPIA_VALUE_DISPLAY': videoSepia_temp,
        'VIDEO_SEPIA_VALUE': videoSepia_temp,
        'VIDEO_SEPIA_MIN': cfg['videoSepia']['min'],
        'VIDEO_SEPIA_MAX': cfg['videoSepia']['max'],
        'VIDEO_SEPIA_STEP': cfg['videoSepia']['step']
    };
    status_features = fillKeys(status_features, keys);

    return status_features;
}

function generate_categories() {
    var cat_links = [];
    var column = 0;
    var columns = 3;

    for (var key in browse_categories_list) {
        if (!cat_links[column]) {
            cat_links[column] = '';
        }
        cat_links[column] += '<div style="padding: 2px; margin: 1px; text-align: center; display: block;"><a style="border-radius: 3px; background-color: rgba(38,38,38,1);" href="https://www.netflix.com/browse/genre/' + browse_categories_list[key] + '">' + getLang(key) + '</a></div>';
        column++;
        if (column > (columns - 1)) {
            column = 0;
        }
    }

    for (var i = 0; i < columns; i++) {
        cat_links[i] = fillArgs('<div style="width: 160px; float: left;">{0}</div>', cat_links[i]);
    }
    cat_links = cat_links.join('');
    cat_links = '<div>' + cat_links + '<div style="clear: both;"></div></div>';
    return cat_links;
}

function create_features_events() {
    try {document.getElementById('feature_tempHideSubtitles').addEventListener('change', function() { logEvent('status_updater > feature_tempHideSubtitles'); adjust_hide_subtitles_features_values(this); });} catch (e) {}
    try {document.getElementById('feature_videoSpeedRate').addEventListener('input', function() { logEvent('status_updater > feature_videoSpeedRate'); adjust_video_features_values(this); });} catch (e) {}
    try {document.getElementById('feature_videoBrightness').addEventListener('input', function() { logEvent('status_updater > feature_videoBrightness'); adjust_video_features_values(this); });} catch (e) {}
    try {document.getElementById('feature_videoContrast').addEventListener('input', function() { logEvent('status_updater > feature_videoContrast'); adjust_video_features_values(this); });} catch (e) {}
    try {document.getElementById('feature_videoGrayscale').addEventListener('input', function() { logEvent('status_updater > feature_videoGrayscale'); adjust_video_features_values(this); });} catch (e) {}
    try {document.getElementById('feature_videoHue').addEventListener('input', function() { logEvent('status_updater > feature_videoHue'); adjust_video_features_values(this); });} catch (e) {}
    try {document.getElementById('feature_videoInvert').addEventListener('input', function() { logEvent('status_updater > feature_videoInvert'); adjust_video_features_values(this); });} catch (e) {}
    try {document.getElementById('feature_videoSaturation').addEventListener('input', function() { logEvent('status_updater > feature_videoSaturation'); adjust_video_features_values(this); });} catch (e) {}
    try {document.getElementById('feature_videoSepia').addEventListener('input', function() { logEvent('status_updater > feature_videoSepia'); adjust_video_features_values(this); });} catch (e) {}
    var evt_elms = document.getElementsByClassName('extension_feature_reset');
    for (var i = 0; i < evt_elms.length; i++) {
        evt_elms[i].addEventListener('click', function() { logEvent('status_updater > extension_feature_reset'); reset_feature_value(this.value); });
    }
}

function adjust_hide_subtitles_features_values(object) {
    var checked = object.checked;
    hideSubtitles_temp = checked;
}

function adjust_video_features_values(object) {
    var value = object.value;
    switch (object.id) {
        case 'feature_videoSpeedRate':
            videoSpeedRate_temp = Number(value);
            break;
        case 'feature_videoBrightness':
            videoBrightness_temp = Number(value);
            break;
        case 'feature_videoContrast':
            videoContrast_temp = Number(value);
            break;
        case 'feature_videoGrayscale':
            videoGrayscale_temp = Number(value);
            break;
        case 'feature_videoHue':
            videoHue_temp = Number(value);
            break;
        case 'feature_videoInvert':
            videoInvert_temp = Number(value);
            break;
        case 'feature_videoSaturation':
            videoSaturation_temp = Number(value);
            break;
        case 'feature_videoSepia':
            videoSepia_temp = Number(value);
            break;
    }
    addDOM(document.getElementById(object.id + '_display'), value.toString());
}

function reset_feature_value(feature_default) {
    var feature_default_split = feature_default.split(':');
    var object_name = feature_default_split[0];
    var value_type = feature_default_split[1];

    var elm = document.getElementById(object_name);
    if (value_type == 'cfg') {
        elm.value = cfg[feature_default_split[2]]['val'];
    } else if (value_type == 'check') {
        elm.checked = ((feature_default_split[2] == 'true') ? true : false);
    } else if (value_type == 'val') {
        elm.value = feature_default_split[2];
    }


    var evt = new Event('input');
    elm.dispatchEvent(evt);
    var evt = new Event('change');
    elm.dispatchEvent(evt);
}

function remove_status_icon() {
    var icon = document.getElementById('extension_status_content');
    var content = document.getElementById('extension_status_bubble_content');
    removeDOM(icon);
    if (content) {
        removeDOM(content);
    }
}

function status_updater() {
    debug_overflow_entry('status_updater', 11);

    // Add status icon on playback control/browse bar
    try {
        var controls_element = null;
        var controlsBefore_element = null;
        var content_element = null;
        var contentBefore_element = null;
        var icon_size = null;
        var icon_shade = null;
        var icon_space = null;
        var bodyRect = null;
        var elemRect = null;

        if (check_watch() && object_handler('player_controls', null)) {
            try {
                control_panel = 'watch';
                controls_element = object_handler('player_controls', null);
                controlsBefore_element = object_handler('player_controls_report_problem', null);
                content_element = object_handler('player_focus_trap', null);
                contentBefore_element = object_handler('player_focus_trap_element', null);
                icon_size = '0.5em';
                icon_shade = '0.12em';
                icon_space = '0em';

                bodyRect = document.body.getBoundingClientRect();
                elemRect = controlsBefore_element.getBoundingClientRect();
                if (bodyRect.right != 0 && elemRect.right != 0) {
                    bubble_offset_right = bodyRect.right - elemRect.right;
                    if (bubble_offset_right < 10) {
                        bubble_offset_right = 10;
                    }
                }
                if (elemRect.top != 0 && elemRect.bottom != 0) {
                    bubble_offset_bottom = elemRect.bottom - elemRect.top - 3;
                }
            } catch (e) {control_panel = 'unknown e: ' + e.stack;}
        } else if ((check_browse() || check_latest() || check_title() || check_search()) && object_handler('navigation_menu', null)) {
            try {
                control_panel = 'browse';
                controls_element = object_handler('navigation_menu', null);
                controlsBefore_element = object_handler('navigation_menu_search', null);
                content_element = null;
                contentBefore_element = null;
                icon_size = '0.6em';
                icon_shade = '0.20em';
                icon_space = '1em';
            } catch (e) {control_panel = 'unknown e: ' + e.stack;}
        } else {
            // Controls not found or are from unknown source
            remove_status_icon();
            control_panel = 'unknown';
        }

        if (!control_panel.startsWith('unknown')) {
            var decimals = 3;
            var precision = Math.pow(10, decimals);
            var status_size = controls_element.clientHeight;
            var status_size_adj = Math.round((status_size/20) * precision) / precision;
            var text_color = '#FFFFFF';
            var background_color = 'rgba(38,38,38,.85)';

            checkProfile();
            status_profile = 'general';
            border_color = '#FFFFFF';
            if (check_kids() || check_kids_profile()) {
                status_profile = 'kids';
                border_color = '#EBEBEB';
                text_color = '#000000';
                background_color = 'rgba(255,255,255,.85)';
            }

            if (isSimulated) {
                border_color = '#7B83EB';
            }
            status_color = '#00b642'; // green
            var status_text = getLang('status_text_ok');
            if (!enableAssistant) {
                status_color = '#808080'; // gray
                status_text = getLang('status_text_disabled');
            }
            if (error_detected) {
                status_color = '#E77400'; // orange
                status_text = getLang('status_text_errors');
            }
            if (!workers['assistant'] || check_error()) {
                status_color = '#E70000'; // red
                status_text = getLang('status_text_broken');
            }
            if (isOrphan) {
                status_color = '#E70074'; // purple
                status_text = getLang('status_text_update');
            }

            var status_text_value = status_text;

            var status_style = {
                'border': icon_shade + ' solid ' + border_color,
                'background-color': status_color,
                'border-radius': '100%',
                'margin': 'auto',
                'width': icon_size,
                'height': icon_size,
                'transition': 'background-color 0.3s, display 0.7s, transform .25s cubic-bezier(.5,0,.1,1),opacity .25s',
                'transform': 'scale(1)',
                'cursor': 'pointer'
            };
            var status_style_button = {
                'border': '0em',
                'background-color': 'transparent',
                'cursor': 'default'
            };
            var status_style_content = {
                'display': 'flex',
                'justify-content': 'center',
                'align-items': 'center',
                'cursor': 'default',
                'padding-top': icon_space,
                'padding-bottom': icon_space
            };

            // Add or update status elements based on already existing elements
            if (!document.getElementById('extension_status')) {
                debug_overflow_entry('create_objects (extension_status)', 2);

                var status_data = generate_status_data(status_text);

                // Status icon
                var el1 = document.createElement('div');
                el1.setAttribute('id','extension_status');
                el1.setAttribute('data-size', status_size_adj);
                el1.setAttribute('data-status', status_text_value);
                el1.addEventListener('click', function() { logEvent('status_updater > extension_status'); toggle_assistant(); });
                addCSS(el1, status_style);

                // Icon as button
                var el2 = document.createElement('button');
                el2.setAttribute('id','extension_status_button');
                el2.setAttribute('class','PlayerControls--control-element nfp-button-control default-control-button');
                addCSS(el2, status_style_button);
                el2.appendChild(el1);

                // Create pop-up elements
                var el_pop = create_status_bubble(status_data, control_panel);
                if (check_watch()) {
                    content_element.insertBefore(el_pop, contentBefore_element);
                }

                // Parent element
                var el_last = document.createElement('div');
                el_last.setAttribute('style','display: none;');
                el_last.setAttribute('id','extension_status_content');
                addCSS(el_last, status_style_content);
                el_last.setAttribute('class','PlayerControls--control-element nav-element');
                el_last.addEventListener('mouseenter', function() { logEvent('status_updater > extension_status_content'); stop_worker('close_status_content'); switch_simulation(true, 'extension_status_content'); });
                el_last.addEventListener('mouseleave', function() { logEvent('status_updater > extension_status_content'); workers['close_status_content'] = setTimeout(function() { switch_simulation(false, 'extension_status_content'); }, cfg['bubbleHideDelay']['val']); });
                el_last.appendChild(el2);
                if (!check_watch()) {
                    el_last.appendChild(el_pop);
                }

                controls_element.insertBefore(el_last, controls_element.childNodes[Array.from(controlsBefore_element.parentNode.children).indexOf(controlsBefore_element)]);

                // Add status bubble colors
                var el_pop_style = document.getElementById('extension_status_bubble_style');
                addCSS(el_pop_style, { 'color': text_color, 'background-color' : background_color });

                if (check_watch()) {
                    el_pop_style.addEventListener('mouseenter', function() { logEvent('status_updater > extension_status_content'); stop_worker('close_status_content'); switch_simulation(true, 'extension_status_content'); });
                    el_pop_style.addEventListener('mouseleave', function() { logEvent('status_updater > extension_status_content'); workers['close_status_content'] = setTimeout(function() { switch_simulation(false, 'extension_status_content'); }, cfg['bubbleHideDelay']['val']); });
                }

                // Set elements for status elements
                document.getElementById('extension_options').addEventListener('click', function() { logEvent('status_updater > extension_options'); extension_options(); });
                document.getElementById('extension_options').addEventListener('mouseenter', function() { logEvent('status_updater > extension_options > enter'); options_icon_animate(true); });
                document.getElementById('extension_options').addEventListener('mouseleave', function() { logEvent('status_updater > extension_options > leave'); options_icon_animate(false); });
                document.getElementById('extension_features').addEventListener('click', function() { logEvent('status_updater > extension_features'); extension_features(); });
                if (check_watch()) {
                    document.getElementById('extension_logo').addEventListener('click', function() { logEvent('status_updater > extension_logo'); create_fireworks_mark(); });
                }
                create_features_events();

                // Set closing events for other buttons
                var elms = [];
                var elms1 = object_handler('player_controls_elements', null);
                var elms2 = object_handler('navigation_menu_elements', null);
                Array.prototype.push.apply(elms, elms1);
                Array.prototype.push.apply(elms, elms2);
                for (var i = 0; i < elms.length; i++) {
                    var attr = elms[i].getAttribute('netflex_event_set');
                    if (elms[i].id !== 'extension_status_content' && elms[i].id !== 'extension_status_button' && attr !== 'true') {
                        elms[i].addEventListener('mouseenter', function() { logEvent('status_updater > PlayerControls--control-element/nav-element'); stop_worker('close_status_content'); switch_simulation(false, 'extension_status_content'); });
                        elms[i].setAttribute('netflex_event_set', 'true');
                    }
                }

                status_profile_old = status_profile;
                status_color_old = status_color;
                border_color_old = border_color;
            } else {
                var width_size = status_size_adj.toString();
                var width_attr = document.getElementById('extension_status').getAttribute('data-size');
                var status_text_value_src = document.getElementById('extension_status').getAttribute('data-status');

                // Refresh status bubble position if needed
                var el_pop = document.getElementById('extension_status_bubble_content');
                if (check_watch() && (el_pop.style.right != bubble_offset_right || el_pop.style.bottom != bubble_offset_bottom)) {
                    var pop_style = {
                        'right': bubble_offset_right + 'px',
                        'bottom': bubble_offset_bottom + 'px'
                    };
                    addCSS(el_pop, pop_style);
                }

                // Refresh status content if needed
                if (status_profile != status_profile_old || border_color != border_color_old || status_color != status_color_old || width_size != width_attr || status_text_value != status_text_value_src) {
                    debug_overflow_entry('status_icon_refresh', 10);

                    var status_data = generate_status_data(status_text);

                    var el1 = document.getElementById('extension_status');
                    el1.setAttribute('data-size', width_size);
                    el1.setAttribute('data-status', status_text_value);
                    addCSS(el1, status_style);

                    var el2 = document.getElementById('extension_status_button');
                    addCSS(el2, status_style_button);

                    var el_last = document.getElementById('extension_status_content');
                    addCSS(el_last, status_style_content);

                    var el_pop = document.getElementById('extension_status_bubble');
                    addDOM(el_pop, status_data);

                    var el_pop_style = document.getElementById('extension_status_bubble_style');
                    addCSS(el_pop_style, { 'color': text_color, 'background-color' : background_color });

                    // Set elements for status elements
                    document.getElementById('extension_options').addEventListener('click', function() { logEvent('status_updater > extension_options'); extension_options(); });
                    document.getElementById('extension_options').addEventListener('mouseenter', function() { logEvent('status_updater > extension_options > enter'); options_icon_animate(true); });
                    document.getElementById('extension_options').addEventListener('mouseleave', function() { logEvent('status_updater > extension_options > leave'); options_icon_animate(false); });
                    document.getElementById('extension_features').addEventListener('click', function() { logEvent('status_updater > extension_features'); extension_features(); });
                    if (check_watch()) {
                        document.getElementById('extension_logo').addEventListener('click', function() { logEvent('status_updater > extension_logo'); create_fireworks_mark(); });
                    }
                    create_features_events();

                    // Set closing events for other buttons
                    var elms = [];
                    var elms1 = object_handler('player_controls_elements', null);
                    var elms2 = object_handler('navigation_menu_elements', null);
                    Array.prototype.push.apply(elms, elms1);
                    Array.prototype.push.apply(elms, elms2);
                    for (var i = 0; i < elms.length; i++) {
                        var attr = elms[i].getAttribute('netflex_event_set');
                        if (elms[i].id !== 'extension_status_content' && elms[i].id !== 'extension_status_button' && attr !== 'true') {
                            elms[i].addEventListener('mouseenter', function() { logEvent('status_updater > PlayerControls--control-element/nav-element'); stop_worker('close_status_content'); switch_simulation(false, 'extension_status_content'); });
                            elms[i].setAttribute('netflex_event_set', 'true');
                        }
                    }

                    // If profile changed whole content of status bubble may need to be refreshed
                    if (status_profile != status_profile_old) {
                        remove_status_icon();
                    }

                    status_profile_old = status_profile;
                    status_color_old = status_color;
                    border_color_old = border_color;
                }
            }
        }
    } catch (e) {
        error_detected = true;
        error_message = 'status_updater: ' + e.message;
    }
}

function options_icon_animate(animate) {
    var elm = document.getElementById('extension_options_icon');

    if (elm) {
        if (animate) {
            if (!elm.classList.contains('fa-spin')) {
                elm.classList.add('fa-spin');
            }
        } else {
            if (elm.classList.contains('fa-spin')) {
                elm.classList.remove('fa-spin');
            }
        }
    }
}

function reset_temporary_features() {
    if (reset_features) {
        // Reset all temporary features in extension quick feature access
        var evt_elms = document.getElementsByClassName('extension_feature_reset');
        for (var i = 0; i < evt_elms.length; i++) {
            doClick(evt_elms[i]);
            reset_features = false;
        }
        // Reset all temporary key features
        hideSubtitles_temp = false;
    }
}

function create_status_bubble(status_text, control_panel) {
    var content_left = '';
    var content_right = bubble_offset_right + 'px'; // 22em
    var content_top = '';
    var content_bottom = bubble_offset_bottom + 'px'; // 5.8em
    var width_size = '500px';
    var font_size_size = '16px';
    var border_radius_size = '0.5em';
    var padding_size = '0.8em';

    if (control_panel == 'browse') {
        content_left = '';
        content_right = '-5.5em';
        content_bottom = '';
        content_top = '2.8em';
        width_size = '500px';
        font_size_size = '16px';
        border_radius_size = '0.5em';
        padding_size = '0.8em';
    }

    var el_pop = null;
    try {
        el_pop = document.createElement('span');
        el_pop.setAttribute('id','extension_status_bubble');
        addDOM(el_pop, status_text);
        var el_pop_tmp = el_pop;

        el_pop = document.createElement('div');
        el_pop.setAttribute('id','extension_status_bubble_style');
        addCSS(el_pop, {
            'font-size': font_size_size,
            'border-radius': border_radius_size,
            'overflow': 'hidden',
            'width': width_size,
            'padding': padding_size,
            'z-index': 5
        });
        el_pop.appendChild(el_pop_tmp);
        el_pop_tmp = el_pop;

        el_pop = document.createElement('div');
        el_pop.setAttribute('id','extension_status_bubble_content');
        el_pop.setAttribute('class','popup-content-wrapper');
        var pop_style = {
            'position': 'absolute',
            'left': content_left,
            'right': content_right,
            'bottom': content_bottom,
            'top': content_top,
            'display': 'none',
            'transition': 'display 0.7s',
            'z-index': '2'
        };
        addCSS(el_pop, pop_style);
        el_pop.appendChild(el_pop_tmp);
    } catch (e) {
        error_detected = true;
        error_message = 'create_status_bubble: ' + e.message;
    }

    return el_pop;
}

function toggle_assistant() {
    // Enable/Disable all features of extension
    if (!isOrphan) {
        if (enableAssistant) {
            log('output', '', getLang('assistant_disabled'));
            enableAssistant = false;
        } else {
            log('output', '', getLang('assistant_enabled'));
            enableAssistant = true;
        }
    }

    if (!document.getElementById('extension_manual_override')) {
        var elm_override = document.createElement('div');
        elm_override.setAttribute('id', 'extension_manual_override');
        addCSS(elm_override, {'display': 'none'});
        document.body.appendChild(elm_override);
    }
}

function switch_simulation(state, type) {
    if (!isOrphan) {
        //debug_overflow_entry('switch_simulation ('+type+')', 10);

        var elm;

        // Keep pop-up visible
        switch (type) {
            case 'extension_status_content':
                // Element that will be triggering mouse move event
                elm = object_handler('button_report_problem', null);

                // Actions perform when event is raised and finished
                var el_pop_content = document.getElementById('extension_status_bubble_content');
                var el_status = document.getElementById('extension_status');
                var progress_bar = object_handler('video_progress_bar', null);
                var opt = document.getElementById('extension_options_integrated');
                var feat = document.getElementById('extension_features_integrated');

                if (state) {
                    if (progress_bar) {
                        progress_bar.classList.add('PlayerControlsNeo__progress-control-row--row-hidden');
                    }
                    addCSS(el_pop_content, {'display': 'inherit'});
                    addCSS(el_status, {'transform': 'scale(1.2)'});
                } else {
                    addCSS(el_status, {'transform': 'scale(1)'});
                    addCSS(el_pop_content, {'display': 'none'});
                    if (progress_bar) {
                        progress_bar.classList.remove('PlayerControlsNeo__progress-control-row--row-hidden');
                    }
                    addCSS(opt, {'display': 'none'});
                    addCSS(feat, {'display': 'none'});

                    var icon = document.getElementById('extension_features');
                    try {icon.children[0].classList.remove('fa-minus');} catch (e) {}
                    icon.children[0].classList.add('fa-plus');
                }
                break;
        }

        // Handle the element registration
        if (state) {
            simulation_objects[type] = elm;
        } else {
            delete simulation_objects[type];
        }
    }
}

function mouse_simulation() {
    debug_overflow_entry('mouse_simulation', 10);

    // Loop trough all registered elements and perform mouse move on them
    for (var key in simulation_objects) {
        if (simulation_objects.hasOwnProperty(key)) {
            try {
                var el1 = simulation_objects[key];
                if (movement_offset == 0) {
                    movement_offset = 1;
                } else {
                    movement_offset = 0;
                }

                if (cfg['debug']['val'].includes('mouse_simulation')) {
                    var dbg_el1 = document.createElement('div');
                    addCSS(dbg_el1, {
                        'width': '1px',
                        'height': '1px',
                        'border': '1px solid green',
                        'background-color': 'green',
                        'position': 'absolute',
                        'z-index': '9999999999',
                        'top': (el1.getBoundingClientRect().top + el1.offsetHeight/2 + movement_offset + 1) + 'px',
                        'left': (el1.getBoundingClientRect().left + el1.offsetWidth/2 + movement_offset + 1) + 'px'
                    })
                    document.body.appendChild(dbg_el1);
                    setTimeout(function() {removeDOM(dbg_el1);}, cfg['debugControlsSwitchTimer']['val']);

                    var dbg_el2 = document.createElement('div');
                    addCSS(dbg_el2, {
                        'width': '1px',
                        'height': '1px',
                        'border': '1px solid red',
                        'background-color': 'red',
                        'position': 'absolute',
                        'z-index': '9999999999',
                        'top': (el1.offsetHeight/2 + movement_offset + 2) + 'px',
                        'left': (el1.offsetWidth/2 + movement_offset + 2) + 'px'
                    })
                    el1.appendChild(dbg_el2);
                    setTimeout(function() {removeDOM(dbg_el2);}, cfg['debugControlsSwitchTimer']['val']);

                    var dbg_el3 = document.createElement('div');
                    addCSS(dbg_el3, {
                        'width': '1px',
                        'height': '1px',
                        'border': '1px solid blue',
                        'background-color': 'blue',
                        'position': 'absolute',
                        'z-index': '9999999999',
                        'top': (el1.offsetHeight/2 + movement_offset + 3) + 'px',
                        'left': (el1.offsetWidth/2 + movement_offset + 3) + 'px'
                    })
                    el1.appendChild(dbg_el3);
                    setTimeout(function() {removeDOM(dbg_el3);}, cfg['debugControlsSwitchTimer']['val']);
                }

                // Keep controls displayed
                var eventOptions = {
                    'bubbles': true,
                    'button': 0,
                    'clientX': el1.getBoundingClientRect().left + el1.offsetWidth/2 + movement_offset,
                    'clientY': el1.getBoundingClientRect().top + el1.offsetHeight/2 + movement_offset,
                    'offsetX': el1.offsetWidth/2 + movement_offset,
                    'offsetY': el1.offsetHeight/2 + movement_offset,
                    'pageX': el1.offsetWidth/2 + movement_offset,
                    'pageY': el1.offsetHeight/2 + movement_offset,
                    'currentTarget': el1[0]
                };
                el1.dispatchEvent(new MouseEvent('mousemove', eventOptions));
            } catch (e) {}
        }
    }
}

function get_title_names() {
    // Names on Chromecast page
    if (check_cast()) {
        // Get current title name from all known sources
        try {currentVideo_1 = object_handler('chromecast_title', null).innerText.trim();} catch (e) {currentVideo = '';}

        // Decide which source to use for current video name
        var currentVideo_tmp = '';
        if (currentVideo_1 != '') {
            currentVideo_tmp = currentVideo_1;
        } else {
            // Keep last value
        }

        // Decide which source to use for next title name
        nextVideo_1 = currentVideo_tmp;
        var nextVideo_tmp = '';
        if (nextVideo_1 != '') {
            nextVideo_tmp = nextVideo_1;
        } else {
            nextVideo_tmp = '';
        }
    }

    // Names on watch page
    if (check_watch()) {
        // Get current title name from all known sources
        try {currentVideo_1 = object_handler('video_title', null).children[0].children[0].innerText;} catch (e) {currentVideo_1 = '';}
        try {currentVideo_2 = object_handler('video_title', null).children[0].innerText;} catch (e) {currentVideo_2 = '';}
        try {currentVideo_3 = object_handler('rating_title', null).innerText;} catch (e) {currentVideo_3 = '';}

        try {currentEpisode_1 = object_handler('video_title', null).children[0].children[1].innerText;} catch (e) {currentEpisode_1 = '';}
        try {currentEpisode_2 = object_handler('video_title', null).children[0].children[2].innerText;} catch (e) {currentEpisode_2 = '';}

        // Get next title name from all known sources
        try {nextVideo_1 = object_handler('show_title', null).innerText;} catch (e) {nextVideo_1 = '';}
        try {nextVideo_2 = object_handler('originals_title', null).children[0].alt;} catch (e) {nextVideo_2 = '';}
        try {nextVideo_3 = object_handler('movie_title', null).innerText;} catch (e) {nextVideo_3 = '';}

        // Decide which source to use for current video name
        var currentVideo_tmp = '';
        if (currentVideo_1 != '') {
            currentVideo_tmp = currentVideo_1;
        } else if (currentVideo_2 != '') {
            currentVideo_tmp = currentVideo_2;
        } else if (currentVideo_3 != '') {
            currentVideo_tmp = currentVideo_3;
        } else {
            // Keep last value
        }

        // Decide which source to use for current episode name/number
        var currentEpisode_tmp = '';
        if (currentEpisode_1 != '' && currentEpisode_2 != '') {
            currentEpisode_tmp = currentEpisode_1 + ' ' + currentEpisode_2;
        } else if (currentEpisode_1 != '') {
            currentEpisode_tmp = currentEpisode_1;
        } else if (currentEpisode_2 != '') {
            currentEpisode_tmp = currentEpisode_2;
        } else {
            currentEpisode_tmp = '';
        }

        // Decide which source to use for next title name
        var nextVideo_tmp = '';
        if (nextVideo_1 != '') {
            nextVideo_tmp = nextVideo_1;
        } else if (nextVideo_2 != '') {
            nextVideo_tmp = nextVideo_2;
        } else if (nextVideo_3 != '') {
            nextVideo_tmp = nextVideo_3;
        } else {
            nextVideo_tmp = '';
        }
    }

    // Update global variable only if there is actual change
    if (currentVideo != currentVideo_tmp) {
        currentVideo = currentVideo_tmp;
    }
    if (currentEpisode != currentEpisode_tmp) {
        currentEpisode = currentEpisode_tmp;
    }
    if (nextVideo != nextVideo_tmp) {
        nextVideo = nextVideo_tmp;
    }
}

function hide_synopsis() {
    // List of synopsis objects
    var synopsis_obj = object_handler('synopsis', null);

    if (enableAssistant && cfg['hideSpoilers']['access']) {
        for (var key in synopsis_obj) {
            if (synopsis_obj.hasOwnProperty(key)) {
                if (key == 'tiles' && !check_browse() && !check_latest() && !check_cast() && !check_search() && !check_title()) {
                    continue;
                }
                if (key == 'cast' && !check_cast()) {
                    continue;
                }
                if (key == 'watch' && !check_watch()) {
                    continue;
                }

                for (var i = 0; i < synopsis_obj[key].length; i++) {
                    try {
                        var syn_class_name = synopsis_obj[key][i][0];
                        var syn_class_type = synopsis_obj[key][i][1];
                        var should_be_blurred_type = true;

                        if (!cfg['hideSpoilersObjects']['val'].includes(syn_class_type)) {
                            should_be_blurred_type = false;
                        }

                        var descriptions_list = document.getElementsByClassName(syn_class_name);

                        if (descriptions_list[0]) {
                            for (var j = 0; j < descriptions_list.length; j++) {
                                var should_be_blurred = true;
                                var elm = descriptions_list[j];

                                // Special cases
                                if (elm.className == 'ellipsize-text') {
                                    if (elm.children.length > 1) {
                                        elm = elm.children[elm.children.length - 1];
                                    } else {
                                        should_be_blurred = false;
                                    }
                                }
                                if (elm.className == 'title-name-container') {
                                    if (is_series) {
                                        if (elm.children.length > 1) {
                                            elm = elm.children[elm.children.length - 1];
                                        } else {
                                            should_be_blurred = false;
                                        }
                                    } else {
                                        should_be_blurred = false;
                                    }
                                }
                                if (elm.className == 'title') {
                                    if (elm.parentNode.classList.contains('player-title-evidence') || elm.parentNode.classList.contains('nfp-season-preview')) {
                                        should_be_blurred = false;
                                    }
                                }

                                // Check if type should be blurred or not
                                if (!should_be_blurred_type) {
                                    should_be_blurred = false;
                                }

                                // Initialize attribute
                                if (!elm.getAttribute('netflex_blur')) {
                                    elm.setAttribute('netflex_blur', 'shown');
                                }
                                // Handle styles
                                if (cfg['hideSpoilers']['val'] && should_be_blurred) {
                                    var filter = '';
                                    var filter_value = 'blur(5px)';

                                    try {filter = elm.style.filter;} catch (e) {}
                                    if (cfg['spoilersBlurAmount']['access']) {
                                        filter_value = fillArgs('blur({0}px)', cfg['spoilersBlurAmount']['val']);
                                    }

                                    if (elm.getAttribute('netflex_blur') != 'blurred') {
                                        add_stats_count('stat_hideSpoilers');
                                    }
                                    if (elm.getAttribute('netflex_blur') != 'blurred' || (filter != '' && filter != filter_value)) {
                                        elm.style = fillArgs('filter: {0} !important;', filter_value);
                                        elm.setAttribute('netflex_blur', 'blurred');
                                        //log('output', '', getLang('description_hidden'));
                                    }
                                } else {
                                    if (elm.getAttribute('netflex_blur') == 'blurred') {
                                        elm.style = 'filter: inherit;';
                                        elm.setAttribute('netflex_blur', 'shown');
                                    }
                                }
                            }
                        }
                    } catch (e) {}
                }
            }
        }
    } else {
        // Show hidden descriptions when extension is disabled
        var descriptions_list = document.querySelectorAll('[netflex_blur="blurred"]');
        for (var j = 0; j < descriptions_list.length; j++) {
            var elm = descriptions_list[j];
            elm.style = 'filter: inherit;';
            elm.setAttribute('netflex_blur', 'shown');
        }
    }
}

function handle_video_features() {
    if (cfg['enableVideoFeatures']['val'] && cfg['enableVideoFeatures']['access']) {
        try {var video = object_handler('player_video', null);} catch (e) {}

        if (video) {
            if (enableAssistant) {
                if (check_watch()) {
                    videoSpeedRate = video.playbackRate;

                    // Update feature controls
                    if (videoSpeedRate_change != cfg['videoSpeedRate']['val']) {
                        addDOM(document.getElementById('feature_videoSpeedRate_display'), cfg['videoSpeedRate']['val'].toString());
                        document.getElementById('feature_videoSpeedRate').value = cfg['videoSpeedRate']['val'];
                        videoSpeedRate_temp = cfg['videoSpeedRate']['val'];
                        videoSpeedRate_change = cfg['videoSpeedRate']['val'];
                    }
                    if (videoBrightness_change != cfg['videoBrightness']['val']) {
                        addDOM(document.getElementById('feature_videoBrightness_display'), cfg['videoBrightness']['val'].toString());
                        document.getElementById('feature_videoBrightness').value = cfg['videoBrightness']['val'];
                        videoBrightness_temp = cfg['videoBrightness']['val'];
                        videoBrightness_change = cfg['videoBrightness']['val'];
                    }
                    if (videoContrast_change != cfg['videoContrast']['val']) {
                        addDOM(document.getElementById('feature_videoContrast_display'), cfg['videoContrast']['val'].toString());
                        document.getElementById('feature_videoContrast').value = cfg['videoContrast']['val'];
                        videoContrast_temp = cfg['videoContrast']['val'];
                        videoContrast_change = cfg['videoContrast']['val'];
                    }
                    if (videoGrayscale_change != cfg['videoGrayscale']['val']) {
                        addDOM(document.getElementById('feature_videoGrayscale_display'), cfg['videoGrayscale']['val'].toString());
                        document.getElementById('feature_videoGrayscale').value = cfg['videoGrayscale']['val'];
                        videoGrayscale_temp = cfg['videoGrayscale']['val'];
                        videoGrayscale_change = cfg['videoGrayscale']['val'];
                    }
                    if (videoGrayscale_change != cfg['videoGrayscale']['val']) {
                        addDOM(document.getElementById('feature_videoGrayscale_display'), cfg['videoGrayscale']['val'].toString());
                        document.getElementById('feature_videoGrayscale').value = cfg['videoGrayscale']['val'];
                        videoGrayscale_temp = cfg['videoGrayscale']['val'];
                        videoGrayscale_change = cfg['videoGrayscale']['val'];
                    }
                    if (videoHue_change != cfg['videoHue']['val']) {
                        addDOM(document.getElementById('feature_videoHue_display'), cfg['videoHue']['val'].toString());
                        document.getElementById('feature_videoHue').value = cfg['videoHue']['val'];
                        videoHue_temp = cfg['videoHue']['val'];
                        videoHue_change = cfg['videoHue']['val'];
                    }
                    if (videoInvert_change != cfg['videoInvert']['val']) {
                        addDOM(document.getElementById('feature_videoInvert_display'), cfg['videoInvert']['val'].toString());
                        document.getElementById('feature_videoInvert').value = cfg['videoInvert']['val'];
                        videoInvert_temp = cfg['videoInvert']['val'];
                        videoInvert_change = cfg['videoInvert']['val'];
                    }
                    if (videoSaturation_change != cfg['videoSaturation']['val']) {
                        addDOM(document.getElementById('feature_videoSaturation_display'), cfg['videoSaturation']['val'].toString());
                        document.getElementById('feature_videoSaturation').value = cfg['videoSaturation']['val'];
                        videoSaturation_temp = cfg['videoSaturation']['val'];
                        videoSaturation_change = cfg['videoSaturation']['val'];
                    }
                    if (videoSepia_change != cfg['videoSepia']['val']) {
                        addDOM(document.getElementById('feature_videoSepia_display'), cfg['videoSepia']['val'].toString());
                        document.getElementById('feature_videoSepia').value = cfg['videoSepia']['val'];
                        videoSepia_temp = cfg['videoSepia']['val'];
                        videoSepia_change = cfg['videoSepia']['val'];
                    }

                    // Change video rate
                    if (videoSpeedRate != videoSpeedRate_temp) {
                        video.playbackRate = videoSpeedRate_temp;
                        videoSpeedRate = videoSpeedRate_temp;
                    }

                    // Change filter
                    if (video_filter_access) {
                        if (
                               video.style.cssText == ''
                            || videoBrightness != videoBrightness_temp
                            || videoContrast != videoContrast_temp
                            || videoGrayscale != videoGrayscale_temp
                            || videoHue != videoHue_temp
                            || videoInvert != videoInvert_temp
                            || videoSaturation != videoSaturation_temp
                            || videoSepia != videoSepia_temp
                        ) {
                            var keys = {
                                'VIDEO_BRIGHTNESS': videoBrightness_temp,
                                'VIDEO_CONTRAST': videoContrast_temp,
                                'VIDEO_GRAYSCALE': videoGrayscale_temp,
                                'VIDEO_HUE': videoHue_temp,
                                'VIDEO_INVERT': videoInvert_temp,
                                'VIDEO_SATURATION': videoSaturation_temp,
                                'VIDEO_SEPIA': videoSepia_temp
                            };
                            addCSS(video, {
                                'filter': fillKeys('brightness({VIDEO_BRIGHTNESS}%) contrast({VIDEO_CONTRAST}%) grayscale({VIDEO_GRAYSCALE}%) hue-rotate({VIDEO_HUE}deg) invert({VIDEO_INVERT}%) saturate({VIDEO_SATURATION}%) sepia({VIDEO_SEPIA}%);',keys)
                            });
                            videoBrightness = videoBrightness_temp;
                            videoContrast = videoContrast_temp;
                            videoGrayscale = videoGrayscale_temp;
                            videoHue = videoHue_temp;
                            videoInvert = videoInvert_temp;
                            videoSaturation = videoSaturation_temp;
                            videoSepia = videoSepia_temp;
                        }
                    }
                } else {
                    if (cfg['videoSpeedRate']['access']) {
                        videoSpeedRate_temp = cfg['videoSpeedRate']['val'];
                    }
                    if (video_filter_access) {
                        videoBrightness_temp = cfg['videoBrightness']['val'];
                        videoContrast_temp = cfg['videoContrast']['val'];
                        videoGrayscale_temp = cfg['videoGrayscale']['val'];
                        videoHue_temp = cfg['videoHue']['val'];
                        videoInvert_temp = cfg['videoInvert']['val'];
                        videoSaturation_temp = cfg['videoSaturation']['val'];
                        videoSepia_temp = cfg['videoSepia']['val'];
                    }
                }
            } else {
                if (cfg['videoSpeedRate']['access']) {
                    video.playbackRate = 1;
                    videoSpeedRate = 1;
                }
                if (video_filter_access) {
                    var keys = {
                        'VIDEO_BRIGHTNESS': cfg['videoBrightness']['def'],
                        'VIDEO_CONTRAST': cfg['videoContrast']['def'],
                        'VIDEO_GRAYSCALE': cfg['videoGrayscale']['def'],
                        'VIDEO_HUE': cfg['videoHue']['def'],
                        'VIDEO_INVERT': cfg['videoInvert']['def'],
                        'VIDEO_SATURATION': cfg['videoSaturation']['def'],
                        'VIDEO_SEPIA': cfg['videoSepia']['def']
                    };
                    addCSS(video, {
                        'filter': fillKeys('brightness({VIDEO_BRIGHTNESS}%) contrast({VIDEO_CONTRAST}%) grayscale({VIDEO_GRAYSCALE}%) hue-rotate({VIDEO_HUE}deg) invert({VIDEO_INVERT}%) saturate({VIDEO_SATURATION}%) sepia({VIDEO_SEPIA}%);',keys)
                    });
                    videoBrightness = cfg['videoBrightness']['def'];
                    videoContrast = cfg['videoContrast']['def'];
                    videoGrayscale = cfg['videoGrayscale']['def'];
                    videoHue = cfg['videoHue']['def'];
                    videoInvert = cfg['videoInvert']['def'];
                    videoSaturation = cfg['videoSaturation']['def'];
                    videoSepia = cfg['videoSepia']['def'];
                }
            }
        }
    }
}

function netflix_assistant() {
    debug_overflow_entry('netflix_assistant', 10);

    log('group_start', 'assistant_loop', 'Assistant cycle');
    log('debug', 'assistant_loop', '# ASSISTANT CYCLE START ##############################');
    log('debug', 'assistant_loop', 'netflix_assistant');

    // Disable context blocker on watch page for debugging
    if (check_watch()) {
        try {object_handler('player_container', null).addEventListener('contextmenu', function(e) { e.stopImmediatePropagation(); });} catch (e) {}
    }

    // Prevent all actions when upsell information is shown to avoid unwanted Netflix plan changes
    if (check_upsell()) {
        return;
    }

    // Adjust video display settings
    handle_video_features();

    // If key is pressed for some time nothing should be performed to avoid errors
    if (!key_disabled) {
        // Check if Kids Netflix is shown and extension should be disabled, unless manual override
        if ((check_kids() || check_kids_profile()) && cfg['autoDisableKids']['val'] && !document.getElementById('extension_manual_override') && cfg['autoDisableKids']['access']) {
            enableAssistant = false;
        }

        var location_changed = false
        if (full_url != full_url_old) {
            full_url_old = full_url;
            location_changed = true;
        }

        // Check if extension is disabled
        if (!enableAssistant) {
            // Hide/Un-hide title description
            hide_synopsis();

            // Show hidden disliked titles
            var disliked_obj = object_handler('disliked_title', null);
            for (var i = 0; i < disliked_obj.length; i++) {
                var disliked_parent = disliked_obj[i].parentNode.parentNode;
                if (disliked_parent.classList.contains('slider-item')) {
                    if (disliked_parent.classList.contains('netflex_hide')) {
                        disliked_parent.classList.remove('netflex_hide');
                    }
                }
            }

            // Show subtitles if hidden
            var subtitles_block = object_handler('player_subtitles', null);
            if (subtitles_block) {
                if (subtitles_block.classList.contains('visually-hidden')) {
                    subtitles_block.classList.remove('visually-hidden');
                }
            }
        } else {
            // Check if title is series or not
            if (object_handler('button_episodes_list', null)) {
                is_series = true;
            } else {
                is_series = false;
            }

            // Features on tiles pages
            if ((check_browse() || check_latest() || check_title() || check_search())) {
                // Hide disliked titles
                if (cfg['hideDisliked']['access']) {
                    var disliked_obj = object_handler('disliked_title', null);
                    for (var i = 0; i < disliked_obj.length; i++) {
                        var disliked_parent = disliked_obj[i].parentNode.parentNode;
                        if (disliked_parent.classList.contains('slider-item')) {
                            if (cfg['hideDisliked']['val']) {
                                if (!disliked_parent.classList.contains('netflex_hide')) {
                                    add_stats_count('stat_hideDisliked');
                                    disliked_parent.classList.add('netflex_hide');
                                    log('output', '', getLang('disliked_hidden'));
                                }
                            } else {
                                if (disliked_parent.classList.contains('netflex_hide')) {
                                    disliked_parent.classList.remove('netflex_hide');
                                }
                            }
                        }
                    }
                }

                // Hide/Un-hide title description
                hide_synopsis();

                // Stop trailers video
                if (cfg['trailerVideoStop']['val'] && cfg['trailerVideoStop']['access']) {
                    var trailer_list = object_handler('trailer_list', null);
                    for (var i = 0; i < trailer_list.length; i++) {
                        if (!trailer_list[i].paused) {
                            add_stats_count('stat_trailerVideoStop');
                            trailer_list[i].pause();
                            trailer_list[i].currentTime = trailer_list[i].duration;
                            log('output', '', getLang('trailer_stopped'));
                        }
                    }
                }
            }

            // Features on Chromecast page
            if (check_cast()) {
                // Get names of current title, episode and next offered title if available
                get_title_names();

                // Play next episode
                var is_next_available = false;
                if (object_handler('next_episode', null)) {
                    // Next video is available
                    is_next_available = true;
                    // Check configuration if we want to start next episodes
                    if (cfg['nextEpisode']['val'] && cfg['nextEpisode']['access']) {
                        // Play next video
                        log('output', '', getLang('next_episode'));
                        add_stats_count('stat_nextEpisode');
                        try {doClick(object_handler('next_episode', null));} catch (e) {}
                    }
                } else {
                    // Mark end of loading period
                    if (oldLink != window.location.href) {
                        oldLink = window.location.href;
                    }
                }
            }

            // Features on watch page
            if (check_watch()) {
                // Get video object
                try {var video = object_handler('player_video', null);} catch (e) {}

                // Get names of current title, episode and next offered title if available
                get_title_names();

                // Check if current title is movie or series
                if ((window.path + '?').split('?')[0] != video_id && video) {
                    video_id = (window.path + '?').split('?')[0];
                }

                // Check if next episode is offered
                next_is_offered = false;
                if (object_handler('next_episode_offer_wait', null)) {
                    next_is_offered = true;
                } else if (object_handler('next_episode_offer_nowait', null)) {
                    next_is_offered = true;
                    next_no_wait = true;
                }

                // Play next episode
                var is_next_available = false;
                if ((next_is_offered && !loading) && cfg['nextEpisode']['access']) {
                    // Next video is available or we didn't find next video, but next episode button is available
                    is_next_available = true;
                    // Check configuration if we want to start next episodes
                    if (cfg['nextEpisode']['val'] || forceNextEpisode) {
                        if (nextVideo != '' || (nextVideo == '' && next_no_wait)) {
                            // If we didn't find next video but next episode button is available we consider next video the same as current one
                            if (nextVideo == '' && next_no_wait) {
                                nextVideo = currentVideo;
                            }

                            // Check if next video is from different title and we want to stop playing
                            if (((!is_series && cfg['nextEpisodeStopMovies']['val']) || (is_series && cfg['nextEpisodeStopSeries']['val'])) && currentVideo != nextVideo) {
                                loading = true;
                                log('output', '', getLang('next_video_stop'));
                                if (!is_series) {
                                    add_stats_count('stat_nextEpisodeStopSeries');
                                } else {
                                    add_stats_count('stat_nextEpisodeStopMovies');
                                }
                                if (object_handler('button_exit_player', null)) {
                                    doClick(object_handler('button_exit_player', null));
                                } else {
                                    window.location = window.location.origin + '/browse';
                                }
                            }

                            // Play next video, if it is from same show as current or we waited long enough
                            if (forceNextEpisode || (currentVideo == nextVideo || nextTitleDelay >= cfg['nextTitleDelayLimit']['val'] || cfg['nextTitleDelayLimit']['val'] == cfg['nextTitleDelayLimit']['off'])) {
                                next_is_offered = false;
                                next_no_wait = false;
                                forceNextEpisode = false;
                                nextTitleDelay = 0;
                                loading = true;
                                log('output', '', getLang('next_episode'));
                                add_stats_count('stat_nextEpisode');
                                // Click to start next episode. These commands are not included in object_handler as they are
                                // not necessarily UI version based and try catch will attempt to click all of the buttons
                                // if they are available.
                                try {doClick(document.getElementsByClassName('WatchNext-still-hover-container')[0]);} catch (e) {}
                                try {doClick(document.getElementsByClassName('Recommendation-boxshot-active')[0]);} catch (e) {}
                                try {doClick(document.getElementsByClassName('nf-flat-button')[0]);} catch (e) {}
                                try {doClick(document.getElementsByClassName('nf-flat-button-primary')[0]);} catch (e) {}
                                try {doClick(document.getElementsByClassName('nf-flat-button-icon-play')[0]);} catch (e) {}
                                // Last attempt if others fail to click next episode button in video controls
                                try {doClick(object_handler('button_next_episode', null));} catch (e) {}
                            } else {
                                nextTitleDelay = addTimeFraction(nextTitleDelay, cfg['netflixAssistantTimer']['val']);
                                if (nextTitleDelay % 1 == 0) {
                                    log('output', '', getLang('next_video_delay'), nextTitleDelay, ((nextTitleDelay == 1) ? getLang('second') : ((nextTitleDelay < 5) ? getLang('second_less5') : getLang('seconds'))), cfg['nextTitleDelayLimit']['val']);
                                }
                            }
                        }
                    }
                } else {
                    next_is_offered = false;
                    next_no_wait = false;
                    forceNextEpisode = false;
                    nextTitleDelay = 0;
                    // Mark end of loading period
                    if (oldLink != window.location.href) {
                        oldLink = window.location.href;
                        loading = false;
                    }
                }

                // Hide/Un-hide title description
                hide_synopsis();

                // Detect if video is in focus and if to pause/unpause it
                if (cfg['pauseOnBlur']['val'] != cfg['pauseOnBlur']['off'] && video && cfg['pauseOnBlur']['access']) {
                    // If window is hidden according to sensitivity in configuration, pause video
                    if (hiddenCFG && !video.paused) {
                        // Check if it is not already paused by extension
                        if (!pausedByExtension) {
                            // Pause video
                            try {
                                add_stats_count('stat_pauseOnBlur');
                                doClick(object_handler('button_pause', null));
                                log('output', '', getLang('lost_focus_pause'));
                                pausedByExtension = true;
                            } catch (e) {}
                        }
                    } else {
                        // Check if video is visible and paused by extension and is configured to autostart
                        if (!hiddenCFG && video.paused && pausedByExtension && cfg['playOnFocus']['val']) {
                            // Autostart video
                            try {
                                add_stats_count('stat_playOnFocus');
                                doClick(object_handler('button_play', null));
                                log('output', '', getLang('gained_focus_play'));
                                pausedByExtension = false;
                            } catch (e) {}
                        }
                        // Video is running it is not paused by extension
                        if (!video.paused) {
                            pausedByExtension = false;
                        }
                    }
                }

                // Apply subtitles configuration
                var subtitles_block = object_handler('player_subtitles', null);
                if (subtitles_block && ((cfg['highlightSubtitles']['val'] != cfg['highlightSubtitles']['off'] && cfg['highlightSubtitles']['access']) || (hideSubtitles_temp && cfg['hideSubtitlesKey']['access']))) {
                    if (cfg['highlightSubtitles']['val'] == 'hidden' || hideSubtitles_temp) {
                        // Hide subtitles
                        if (!subtitles_block.classList.contains('visually-hidden')) {
                            add_stats_count('stat_highlightSubtitles');
                            subtitles_block.classList.add('visually-hidden');
                            subtitles_items[j].setAttribute('netflex_highlighted', cfg['highlightSubtitles']['val']);
                        }
                    } else {
                        // Show subtitles
                        if (subtitles_block.classList.contains('visually-hidden')) {
                            subtitles_block.classList.remove('visually-hidden');
                        }

                        // Handle subtitles style
                        var subtitles_lines = subtitles_block.children;
                        for (var i = 0; i < subtitles_lines.length; i++) {
                            var subtitles_items = subtitles_lines[i].children;
                            for (var j = 0; j < subtitles_items.length; j++) {
                                // Highlight subtitles that are not yet highlighted
                                if (subtitles_items[j].getAttribute('netflex_highlighted') != cfg['highlightSubtitles']['val']) {
                                    add_stats_count('stat_highlightSubtitles');

                                    // Highlight subtitles shadow
                                    if (cfg['highlightSubtitles']['val'] == 'shadow') {
                                        subtitles_items[j].style.textShadow = '#000000 -2px 0px, #000000 0px 2px, #000000 2px 0px, #000000 0px -2px';
                                        subtitles_items[j].setAttribute('netflex_highlighted', cfg['highlightSubtitles']['val']);
                                    }
                                    // Highlight subtitles background
                                    if (cfg['highlightSubtitles']['val'] == 'background') {
                                        subtitles_items[j].style.background = 'rgba(0,0,0,0.5)';
                                        subtitles_items[j].setAttribute('netflex_highlighted', cfg['highlightSubtitles']['val']);
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (subtitles_block && !hideSubtitles_temp && cfg['hideSubtitlesKey']['access']) {
                        // Show subtitles
                        if (subtitles_block.classList.contains('visually-hidden')) {
                            subtitles_block.classList.remove('visually-hidden');
                        }
                    }
                }

                // Skip all intros & recaps
                if (!skipping) {
                    if (object_handler('button_skip', null) && video) {
                        try {
                            var is_paused = video.paused;
                            var skip_button = object_handler('button_skip', null);

                            if (loc_skip_intro.includes(skip_button.innerText.toUpperCase().trim()) && cfg['skipIntros']['val'] && cfg['skipIntros']['access']) {
                                skipping = true;
                                log('output', '', getLang('skipping_intro'));
                                add_stats_count('stat_skipIntros');
                                doClick(skip_button.parentNode);
                                removeDOM(skip_button);
                            } else if (loc_skip_recap.includes(skip_button.innerText.toUpperCase().trim()) && cfg['skipRecaps']['val'] && cfg['skipRecaps']['access']) {
                                skipping = true;
                                log('output', '', getLang('skipping_recap'));
                                add_stats_count('stat_skipRecaps');
                                doClick(skip_button.parentNode);
                                removeDOM(skip_button);
                            }

                            // Video sometimes pauses when skipping, this should workaround the issue
                            if (skipping) {
                                // Repeated skipping prevention
                                setTimeout(function() {skipping = false;}, cfg['skippingPreventionTimer']['val']);

                                if (is_paused != video.paused) {
                                    if (video.paused) {
                                        video.play();
                                        // Prevent event handlers to be messed up after skipping intro/recap
                                        object_handler('player_hit_zone', null).style.display = 'none';
                                        try {doClick(object_handler('button_pause', null));} catch (e) {}
                                        try {doClick(object_handler('button_play', null));} catch (e) {}
                                        object_handler('player_hit_zone', null).style.display = 'flex';
                                        // Just to make sure we will return into correct state, even if something goes wrong before
                                        setTimeout(function() {try {doClick(object_handler('button_play', null));} catch (e) {}}, cfg['playPauseButtonDelay']['val']);
                                    } else {
                                        video.pause();
                                        // Prevent event handlers to be messed up after skipping intro/recap
                                        object_handler('player_hit_zone', null).style.display = 'none';
                                        try {doClick(object_handler('button_play', null));} catch (e) {}
                                        try {doClick(object_handler('button_pause', null));} catch (e) {}
                                        object_handler('player_hit_zone', null).style.display = 'flex';
                                        // Just to make sure we will return into correct state, even if something goes wrong before
                                        setTimeout(function() {try {doClick(object_handler('button_pause', null));} catch (e) {}}, cfg['playPauseButtonDelay']['val']);
                                    }
                                }
                            }
                        } catch (e) { }
                    }
                }

                // Skip interruption if nothing is clicked after X videos played
                var is_interrupted = false;
                if (object_handler('video_interrupter', null) && cfg['skipInterrupter']['access']) {
                    is_interrupted = true;
                    // Check configuration if we want to skip interruptions
                    if (cfg['skipInterrupter']['val']) {
                        log('output', '', getLang('skipping_interrupter'));
                        add_stats_count('stat_skipInterrupter');
                        doClick(object_handler('video_interrupter', null).children[0]);
                    }
                }

                // Detect if video playback is stuck and reload, if it is stuck for long enough
                try {
                    var timeFromLoad = (currentTime - loadTime) / 100;
                    try {currentTimestamp = video.currentTime;} catch (e) {}

                    // Give it a little time for objects to load before considering any reloading (browser load time)
                    // also tab has to be active to even consider reload, not active pages get paused by browser, what
                    // may trigger page reload, because next video does not load until tab is in focus, also in case
                    // we stop at next available episode it is no reason to refresh, or in case we are stopped via
                    // interruption.
                    if (!check_error() && timeFromLoad > cfg['timeFromLoadLimit']['val'] && visibleAPI && !is_next_available && !is_interrupted) {
                        // If video object does not exist or video is stopped and spinning loader is present or if video is stopped and also it is not paused
                        if (!video || (currentTimestamp == oldTimestamp && object_handler('video_loading_spinner', null)) || (currentTimestamp == oldTimestamp && !video.paused)) {
                            var timerValid = false;

                            // If spinning loader is present give it a time to load video (data load time)
                            if (object_handler('video_loading_spinner', null) && cfg['loadingTimeLimit']['access']) {
                                loadingTime = addTimeFraction(loadingTime, cfg['netflixAssistantTimer']['val']);
                                // Too long loading, might be stuck, lets start countdown
                                if (loadingTime >= cfg['loadingTimeLimit']['val']) {
                                    timerValid = true;
                                }
                            } else {
                                // If spinning loader is not present something is wrong, lets start countdown
                                timerValid = true;
                            }

                            if (timerValid) {
                                // Countdown to reload
                                if (stuckTime >= cfg['stuckTimeLimit']['val'] && cfg['stuckTimeLimit']['val'] != cfg['stuckTimeLimit']['off'] && cfg['stuckTimeLimit']['access']) {
                                    // Set reload request for reload worker to pick up
                                    reload_requests['video_stuck'] = true;
                                } else {
                                    stuckTime = addTimeFraction(stuckTime, cfg['netflixAssistantTimer']['val']);
                                    if (stuckTime % 1 == 0 && stuckTime <= cfg['stuckTimeLimit']['val']) {
                                        log('output', '', getLang('video_stuck'), stuckTime, ((stuckTime == 1) ? getLang('second') : ((stuckTime < 5) ? getLang('second_less5') : getLang('seconds'))), cfg['stuckTimeLimit']['val']);
                                    }
                                }
                            }
                        } else {
                            oldTimestamp = currentTimestamp;
                            stuckTime = 0;
                            loadingTime = 0;
                            reload_requests['video_stuck'] = false;
                        }
                    }
                } catch (e) {}

                // Record episode
                if (cfg['keepHistory']['access']) {
                    var history_changed = false;
                    if (!array_contains(watchHistory, full_url) && cfg['keepHistory']['val'] != cfg['keepHistory']['off']) {
                        watchHistory[watchHistory.length] = full_url;
                        history_changed = true;
                    }
                    if (watchHistory.length > cfg['keepHistory']['val']) {
                        watchHistory = watchHistory.slice(watchHistory.length - cfg['keepHistory']['val'], watchHistory.length);
                        history_changed = true;
                    }
                    if (history_changed) {
                        localStorage.setItem('netflex_watchHistory', JSON.stringify(watchHistory));
                    }
                }

                if (location_changed) {
                    reset_features = true;
                }
                reset_temporary_features();
            }
        }
    }

    // Store statistics database to local storage
    localStorage.setItem('netflex_statistics', JSON.stringify(stats_counter));

    log('debug', 'assistant_loop', '# ASSISTANT CYCLE STOP ###############################');
    log('group_end', 'assistant_loop', '');

    // Record time of last cycle
    lastCall = new Date();
}

function play_random() {
    add_stats_count('stat_randomTitle');

    // Find all open tiles and close them
    var openTiles = object_handler('buttons_tile_close', null);
    for (i = openTiles.length - 1; i >= 0; i--) {
        doClick(openTiles[i]);
    }

    // Find all existing tiles
    var tiles = object_handler('buttons_tile_list', null);

    // Pick only tiles that have unique titles and are not large tiles or disliked tiles of correct node type
    var unique_tiles = {};
    var index_count = 0;
    for (var i = 0; i < tiles.length; i++) {
        var current_tile = tiles[i];

        if (   current_tile.nodeName != 'A'
            || current_tile.className.includes('title-card-tall-panel')
            || current_tile.className.includes('is-disliked')) {
            continue;
        }

        var tile = {};
        tile.Title = current_tile.getAttribute('aria-label');
        tile.Object = current_tile;

        if (!unique_tiles[tile.Title]) {
            unique_tiles[tile.Title] = tile;
            index_count++;
        }
    }

    // Pick random tile from available tiles
    var rand_idx = Math.floor(Math.random() * ((index_count - 1) - 0) + 0);
    var length = 0;
    var el1 = null;
    for (var key in unique_tiles) {
        if (unique_tiles.hasOwnProperty(key)) {
            if (rand_idx == length) {
                el1 = unique_tiles[key].Object;
                break;
            }
            length++;
        }
    }

    // Check if we picked tile successfully
    if (el1 === null) {
        log('error', '', getLang('rand_video_failed_select'));
    } else {
        try {
            // Start video playback
            doClick(el1);
            doClick(object_handler('title_tile_anchor', el1));
            var title_name = el1.getAttribute('aria-label');
            log('output', '', getLang('rand_video_success'), title_name);
        } catch (e) {
            try {
                // Redirect browser to video
                if (el1.getAttribute('href')) {
                    document.location = document.location.origin + el1.getAttribute('href');
                } else {
                    log('error', '', getLang('rand_video_failed_play'));
                }
            } catch (e) {
                log('error', '', getLang('rand_video_failed_play'));
            }
        }
    }
}

function bind_key_events() {
    document.resize = function(evt) {
        status_updater();
    };

    document.onkeyup = function(evt) {
        key_event_handler(evt);
    };

    document.addEventListener("visibilitychange", function() {
        visibleAPI = ((document.visibilityState == 'visible') ? true : false);
    });

    window.onblur = function() {
        visibleWND = false;
    }

    window.onfocus = function() {
        visibleWND = true;
    }
}

function unbind_key_events() {
    document.resize = null;
    document.onkeyup = null;
    window.onblur = null;
    window.onfocus = null;
}

function key_event_handler(evt) {
    // Skip binding actions while reporting a problem or searching for titles
    if (check_search_bar() || check_problem_report() || check_options()) {
        return;
    }

    var valid_key = false;

    log('debug', 'keypress', '[\'{0}\',{1}],', evt.key.toUpperCase(), evt.keyCode);

    evt = evt || window.event;
    key_pressed = evt.key.toUpperCase();

    // Detect if key event is for valid action
    var isExitPlayer = (key_pressed == cfg['exitPlayerKey']['val'] && cfg['exitPlayerKey']['val'] != cfg['exitPlayerKey']['off'] && cfg['exitPlayerKey']['access']);
    var isPrevEpisode = (key_pressed == cfg['prevEpisodeKey']['val'] && cfg['prevEpisodeKey']['val'] != cfg['prevEpisodeKey']['off'] && cfg['prevEpisodeKey']['access']);
    var isNextEpisode = (key_pressed == cfg['nextEpisodeKey']['val'] && cfg['nextEpisodeKey']['val'] != cfg['nextEpisodeKey']['off'] && cfg['nextEpisodeKey']['access']);
    var isRandomMovie = (key_pressed == cfg['randomMovieKey']['val'] && cfg['randomMovieKey']['val'] != cfg['randomMovieKey']['off'] && cfg['randomMovieKey']['access']);
    var isHideSubtitles = (key_pressed == cfg['hideSubtitlesKey']['val'] && cfg['hideSubtitlesKey']['val'] != cfg['hideSubtitlesKey']['off'] && cfg['hideSubtitlesKey']['access']);
    var isToggleAssistant = (key_pressed == cfg['toggleAssistantKey']['val'] && cfg['toggleAssistantKey']['val'] != cfg['toggleAssistantKey']['off'] && cfg['toggleAssistantKey']['access']);

    key_pressed = '';

    // Perform activities for valid keys
    // Global
    if (isToggleAssistant) {
        log('debug', 'keypress', 'initContent>binding_handler>onkeyup>toggle_assistant');

        toggle_assistant();
        valid_key = true;
    }

    // Tiles only
    if (check_browse() || check_latest() || check_title() || check_search()) {
        if (isRandomMovie) {
            log('debug', 'keypress', 'initContent>binding_handler>onkeyup>rand_movie');

            play_random();
            valid_key = true;
        }
    }

    // Watch only
    if (check_watch()) {
        if (isExitPlayer) {
            log('debug', 'keypress', 'initContent>binding_handler>onkeyup>exit_player');

            if (object_handler('button_exit_player', null)) {
                doClick(object_handler('button_exit_player', null));
                valid_key = true;
            }
        }

        if (isPrevEpisode) {
            log('debug', 'keypress', 'initContent>binding_handler>onkeyup>prev_episode');

            if ((watchHistory.length - 2) >= 0) {
                log('output', '', getLang('prev_episode_manual'));
                watchHistory = watchHistory.slice(0, watchHistory.length - 1);
                localStorage.setItem('netflex_watchHistory', JSON.stringify(watchHistory));
                // Reload page to previous title
                window.location.href = watchHistory[watchHistory.length - 1];
                valid_key = true;
            } else {
                log('output', '', getLang('prev_episode_manual_no_history'));
            }
        }

        if (isNextEpisode) {
            log('debug', 'keypress', 'initContent>binding_handler>onkeyup>next_episode');

            if (object_handler('button_next_episode', null)) {
                log('output', '', getLang('next_episode'));
                doClick(object_handler('button_next_episode', null));
                valid_key = true;
            } else {
                forceNextEpisode = true;
            }
        }

        if (isHideSubtitles) {
            log('debug', 'keypress', 'initContent>binding_handler>onkeyup>hide_subs');

            var elm = document.getElementById('feature_tempHideSubtitles');
            if (!hideSubtitles_temp) {
                hideSubtitles_temp = true;
                if (elm) {
                    elm.checked = true;
                }
            } else {
                hideSubtitles_temp = false;
                if (elm) {
                    elm.checked = false;
                }
            }
        }
    }

    // In case activity for valid key was performed, pause all other assistant activities for a while
    if (valid_key) {
        add_stats_count('stat_keyBinding');
        key_disabled = true;
        setTimeout(function() {key_disabled = false;}, cfg['keyEventProcessingDelay']['val']);
    }
}