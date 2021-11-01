function hide_extension_containers(container) {
    // Status bubble
    if (container != 'status_bubble') {
        status_bubble_opened = false;
    }

    // News panel
    if (container != 'news') {
        var news = document.getElementById('extension_news_integrated');
        if (news) {
            if (news.style.display != 'none') {
                news.style.display = 'none';
                news_opened = false;
            }
        }
    }

    // Options panel
    if (container != 'options') {
        var opt = document.getElementById('extension_options_integrated');
        if (opt) {
            if (opt.style.display != 'none') {
                opt.style.display = 'none';
                options_opened = false;
            }
        }
    }

    // Features panel
    if (container != 'features') {
        var feat = document.getElementById('extension_features_integrated');
        var icon = document.getElementById('extension_features');
        if (feat) {
            if (feat.style.display != 'none') {
                feat.style.display = 'none';
                try {icon.children[0].classList.remove('fa-minus');} catch (e) {}
                icon.children[0].classList.add('fa-plus');
                features_opened = false
            }
        }
    }
}

function extension_news() {
    hide_extension_containers('news');

    // Open news page
    var news = document.getElementById('extension_news_integrated');
    if (news) {
        if (news.style.display == 'none') {
            addDOM(document.getElementById('extension_news_scrollable'), generate_news());
            generate_news_content(true);
            news.style.display = 'table-cell';
            news_opened = true;
        } else {
            news.style.display = 'none';
            news_opened = false;
        }
    }
}

function extension_options() {
    hide_extension_containers('options');

    // Open options page
    var opt = document.getElementById('extension_options_integrated');
    if (opt) {
        if (opt.style.display == 'none') {
            addDOM(document.getElementById('extension_options_scrollable'), generate_options());
            generate_options_content();
            opt.style.display = 'table-cell';
            options_opened = true;
        } else {
            opt.style.display = 'none';
            options_opened = false;
        }
    }
}

function extension_features() {
    hide_extension_containers('features');

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
            features_opened = true;
        } else {
            feat.style.display = 'none';
            try {icon.children[0].classList.remove('fa-minus');} catch (e) {}
            icon.children[0].classList.add('fa-plus');
            features_opened = false;
        }
    }
}

function generate_status_data() {
    // Generate donations links
    var donations = [];
    if (donation_urls['paypal'] != '') {
        donations.push('<a href="' + donation_urls['paypal'] + '" target="_blank" style="text-decoration: underline; display: unset;">' + getLang('paypal') + '</a>');
    }
    if (donation_urls['patreon'] != '') {
        donations.push('<a href="' + donation_urls['patreon'] + '" target="_blank" style="text-decoration: underline; display: unset;">' + getLang('patreon') + '</a>');
    }
    //checkProfile();
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
            <img id="extension_logo" src="{LOGO}" style="width: 64px;" alt="{SHORT_NAME}">
        </td>
        <th>
            {NAME} <span style="font-size: .5em;">(v{VERSION})</span>
            <span style="position: relative; top: 0.1em; float: right;">
                <table style="position: absolute; right: 0px; white-space: nowrap;">
                    <tr>
                        <td><a href="javascript:void(0);" id="extension_news" class="{NEWS_UNREAD_CLASS}" style="color: #00b642; margin-left: 6px; cursor: pointer; {SHOW_NEWS_ICON}"><span id="extension_unread_news_count">{UNREAD_NEWS_COUNT}</span><i id="extension_news_icon" class="fas fa-newspaper" title="{NEWS}"></i></a></td>
                        <td><a href="javascript:void(0);" id="extension_options" style="color: #00b642; margin-left: 6px; cursor: pointer;{SHOW_OPTIONS_ICON}"><i id="extension_options_icon" class="fas fa-cog" title="{OPTIONS}"></i></a></td>
                    </tr>
                </table>
            </span>
        </th>
    </tr>
    <tr>
        <td id="netflex_status_text">
            {STATUS_TEXT}
        </td>
    </tr>
    <tr>
        <td>
            <a href="{WEBSTORE_URL}" target="_blank" style="text-decoration: underline; font-size: 12px; display: unset;{SHOW_WEBSTORE}">{RATE_EXTENSION}</a>
            <span style="font-size: 12px; display: unset;{SHOW_DONATIONS}">
                - {DONATE} {DONATION_LINKS}
            </span>
            <span style="position: relative; top: 0.1em; float: right;">
                <table style="right: 0px; white-space: nowrap;">
                    <tr>
                        <td><a href="javascript:void(0);" id="extension_features" style="color: #00b642; margin-left: 6px; cursor: pointer;{SHOW_OPTIONS_ICON}"><i class="fas fa-plus" title="{FEATURES}"></i></a></td>
                    </tr>
                </table>
            </span>
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
        <td colspan="2" id="extension_news_integrated" style="display: none;">
            <hr>
            <div id="extension_news_scrollable" style="width: 100%; max-height: 430px; border: 0px; overflow-y: scroll;">{NEWS_CONTENT}</div>
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
        'LOGO': logo_icon_prod,
        'SHORT_NAME': getLang('short_name'),
        'NAME': getLang('name'),
        'VERSION': extension_version,
        'STATUS_TEXT': getLang('data_loading'),
        'WEBSTORE_URL': stores_urls[browser],
        'SHOW_WEBSTORE': ((!check_kids() && !check_kids_profile()) ? '' : 'display: none;' ),
        'RATE_EXTENSION': getLang('rate_extension'),
        'SHOW_DONATIONS': ((show_donation_link) ? '' : 'display: none;'),
        'DONATE': getLang('donate'),
        'DONATION_LINKS': donations,
        'NEWS': getLang('news'),
        'SHOW_NEWS_ICON': ((!isProd && !isOrphan && !check_kids() && !check_kids_profile()) ? '' : 'display: none;' ), // TODO: Remove !isProd when supported on production environment
        'UNREAD_NEWS_COUNT': notification_format(unread_news_count),
        'NEWS_UNREAD_CLASS': ((unread_news_count == 0) ? '' : ' unread'),
        'NEWS_CONTENT': ((!isOrphan) ? generate_news() : ''),
        'OPTIONS': getLang('options'),
        'SHOW_OPTIONS_ICON': ((!isOrphan) ? ((cfg['allowKidsConfig']['val'] && cfg['allowKidsConfig']['access'] && (check_kids() || check_kids_profile())) ? '' : ((!check_kids() && !check_kids_profile()) ? '' : 'display: none;')) : 'display: none;' ),
        'OPTIONS_CONTENT': ((!isOrphan) ? generate_options() : ''),
        'FEATURES': getLang('features'),
        'FEATURES_CONTENT': generate_status_features()
    };
    status_data = fillKeys(status_data, keys);

    return status_data;
}

function generate_news() {
    // HTML template for extension news status pop-up bubble injected into status icon in Netflix
    var news_data = `
        <div id="news_loading" style="text-align: center;">
            <i class="fas fa-spinner fa-pulse" title="{LOADING_TEXT}" style="font-size: 30px; font-weight: bold; margin-top: 150px;"></i>
        </div>
        <div id="extension_news_content" style="display: none;">
        </div>
`;

    var keys = {
        'LOADING_TEXT': getLang('data_loading')
    };
    news_data = fillKeys(news_data, keys);

    return news_data;
}

function processDynamicNewsContent(msg) {
    return msg.replace(/%(.+):*(.*)*%/g, (m, str) => {
        var data = str.split(':');
        switch (data[0]) {
            // %unixtime:<unixtime in UTC>% => Date in local time zone
            case 'unixtime':
                if (data[1]) {
                    return new Date(data[1] * 1000).toLocaleString(undefined, date_format['full']);
                }
                return fillArgs(getLang('news_missing_data'), data[0]);
                break;
        }
    });
}

function generate_news_entry(news_item) {
    var entry = {
        'msg': news_item['msg'],
        'env': news_item['env'],
        'valid_from': news_item['valid_from'],
        'valid_to': news_item['valid_to'],
        'received_at': new Date(),
        'updated_at': new Date()
    };
    return entry
}

function generate_news_content(reset_unread_values) {
    var last_news_read_old = JSON.parse(nvl(localStorage.getItem('netflex_lastNewsRead'), JSON.stringify(new Date(1970, 0, 1, 0, 0, 0))), JSON.dateParser);
    if (reset_unread_values) {
        unread_news_count = 0;
        localStorage.setItem('netflex_lastNewsRead', JSON.stringify(new Date()));
    }

    // Reorder news items
    var news_data = JSON.parse(nvl(localStorage.getItem('netflex_newsData'), "{}"), JSON.dateParser);
    var ordered_news = {};
    for (var key in news_data) {
        if (news_data.hasOwnProperty(key)) {
            var news_item = news_data[key];
            var regex_ts_rep = /[\-\.:TZ]/gi;
            var news_id_padding = 20;
            var order_key = news_item['received_at'].toJSON().replace(regex_ts_rep, '') + '_' + news_item['updated_at'].toJSON().replace(regex_ts_rep, '') + '_' + key.replace('news_', '').padStart(news_id_padding, '0');
            ordered_news[order_key] = news_item;
        }
    }
    ordered_news = objSortByKey(ordered_news, 'desc');
    log('debug', 'news', 'Ordered news:');
    log('debug', 'news', ordered_news);

    // Generate content with news
    var news_content = fillArgs('<div style="text-align: center; margin: auto; height: 20px;"><i id="news_loading_icon" class="fas fa-spinner fa-pulse" title="{0}" style="display: none; font-size: 10px;"></i></div>', getLang('data_loading'));
    var news_count = 0;
    for (var key in ordered_news) {
        if (ordered_news.hasOwnProperty(key)) {
            var news_content_data = '';
            var news_item = ordered_news[key];

            // HTML template for news items
            var news_content_data = `
<div class="{NEWS_CLASS}">
    <table style="width: 100%;">
        <tr>
            <td colspan="2">
                <img src="{ENV_LOGO}" atl="{SHORT_NAME}" style="{HIDE_LOGO} width: 25px; position: absolute; top: -8px; left: -8px;">
                <div style="white-space: pre-line;">{NEWS_MSG}</div>
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <hr style="border: 1px solid {NEWS_COLOR_FNT};">
            </td>
        </tr>
        <tr style="font-size: 12px;">
            <td style="width: 50%;">
                {RECEIVED_AT_TEXT}<br>{RECEIVED_AT}
            </td>
            <td style="width: 50%;">
                {UPDATED_AT_TEXT}<br>{UPDATED_AT}
            </td>
        </tr>
    </table>
</div>
`;

            // Use logo based on environment message is for
            var hide_icon = false;
            var logo_icon = logo_icon_prod;
            switch (news_item['env']) {
                case 'prod':
                    hide_icon = true;
                    logo_icon = logo_icon_prod;
                    break;
                case 'test':
                    if (isProd) {
                        continue;
                    }
                    hide_icon = false;
                    logo_icon = logo_icon_test;
                    break;
                case 'dev':
                    if (isProd || isTest) {
                        continue;
                    }
                    hide_icon = false;
                    logo_icon = logo_icon_dev;
                    break;
                default:
                    log('debug', 'news', fillArgs('Unknown news environment value: {0}.', news_item['env']));
                    continue;
                    break;
            }

            // Define and insert fields into template
            var keys = {
                'SHORT_NAME': getLang('short_name'),
                'ENV_LOGO': logo_icon,
                'HIDE_LOGO': ((hide_icon) ? 'display: none;' : ''),
                'NEWS_CLASS': ((last_news_read_old < news_item['received_at']) ? 'new_message news_content' : 'news_content'),
                'NEWS_MSG': processDynamicNewsContent(news_item['msg']),
                'RECEIVED_AT_TEXT': getLang('news_received_at'),
                'RECEIVED_AT': news_item['received_at'].toLocaleString(undefined, date_format['full']),
                'UPDATED_AT_TEXT': getLang('news_updated_at'),
                'UPDATED_AT': news_item['updated_at'].toLocaleString(undefined, date_format['full'])
            };
            news_content_data = fillKeys(news_content_data, keys);

            news_content += news_content_data;
            news_count++;
        }
    }

    if (news_count == 0) {
        news_content = fillArgs('<div><table style="width: 100%;"><tr><th>{0}</th></tr></table></div>', getLang('no_news'));
    }

    addDOM(document.getElementById('extension_news_content'), news_content);

    document.getElementById('news_loading').style.display = 'none';
    document.getElementById('extension_news_content').style.display = 'block';
}

function generate_options() {
    // HTML template for extension options status pop-up bubble injected into status icon in Netflix
    var options_data = `
        <div id="options_loading" style="text-align: center;">
            <i class="fas fa-spinner fa-pulse" title="{LOADING_TEXT}" style="font-size: 30px; font-weight: bold; margin-top: 150px;"></i>
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
                <button class="option item menu_kids" id="button_tab_kids" style="display: none;"></button>
                <button class="option item menu_ratings" id="button_tab_ratings" style="display: none;"></button>
                <button class="option item menu_video" id="button_tab_video" style="display: none;"></button>
                <button class="option item menu_subtitles" id="button_tab_subtitles" style="display: none;"></button>
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
                        <span id="about_cfg_string_text" class="about_cfg_string_text"></span><br>
                        <textarea id="about_cfg_string" class="about_cfg_string" readonly></textarea><br><br>
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
        <hr style="{SHOW_TEMP_HIDE_SUBTITLES}">
        <table border="0" style="border: 0; margin: 0; padding: 0; width: 100%;{SHOW_TEMP_HIDE_SUBTITLES}">
            <tr>
                <td>
                    <label style="cursor:pointer;">{TEMP_HIDE_SUBTITLES_TEXT} <input type="checkbox" id="feature_tempHideSubtitles" {TEMP_HIDE_SUBTITLES}><i class="far fa-square unchecked"></i><i class="fas fa-check-square checked"></i></label>
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
                <td style="min-width: 70px;">
                    <span id="feature_videoSpeedRate_display">{VIDEO_SPEED_RATE_VALUE_DISPLAY}</span>{VIDEO_SPEED_RATE_UNITS}
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <button class="extension_feature_reset" value="feature_videoSpeedRate:cfg:videoSpeedRate" style="border: 0; color: #ffffff !important; background-color: #000000 !important;">{FEATURE_RESET_CFG}</button>
                </td>
            </tr>
        </table>
        <hr style="{SHOW_VIDEO_ZOOM}">
        <table border="0" style="border: 0; margin: 0; padding: 0; width: 100%;{SHOW_VIDEO_ZOOM}">
            <tr>
                <td colspan="2">
                    {VIDEO_ZOOM_TEXT}
                </td>
            </tr>
            <tr style="padding-top: 5px;">
                <td style="width: 100%; padding-right: 5px;">
                    <input type="range" id="feature_videoZoom" value="{VIDEO_ZOOM_VALUE}" min="{VIDEO_ZOOM_MIN}" max="{VIDEO_ZOOM_MAX}" step="{VIDEO_ZOOM_STEP}" style="width: 100%;">
                </td>
                <td style="min-width: 70px;">
                    <span id="feature_videoZoom_display">{VIDEO_ZOOM_VALUE_DISPLAY}</span>{VIDEO_ZOOM_UNITS}
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <button class="extension_feature_reset" value="feature_videoZoom:cfg:videoZoom" style="border: 0; color: #ffffff !important; background-color: #000000 !important;">{FEATURE_RESET_CFG}</button>
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
                <td style="min-width: 70px;">
                    <span id="feature_videoBrightness_display">{VIDEO_BRIGHTNESS_VALUE_DISPLAY}</span>{VIDEO_BRIGHTNESS_UNITS}
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
                <td style="min-width: 70px;">
                    <span id="feature_videoContrast_display">{VIDEO_CONTRAST_VALUE_DISPLAY}</span>{VIDEO_CONTRAST_UNITS}
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
                <td style="min-width: 70px;">
                    <span id="feature_videoGrayscale_display">{VIDEO_GRAYSCALE_VALUE_DISPLAY}</span>{VIDEO_GRAYSCALE_UNITS}
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
                <td style="min-width: 70px;">
                    <span id="feature_videoHue_display">{VIDEO_HUE_VALUE_DISPLAY}</span>{VIDEO_HUE_UNITS}
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
                <td style="min-width: 70px;">
                    <span id="feature_videoInvert_display">{VIDEO_INVERT_VALUE_DISPLAY}</span>{VIDEO_INVERT_UNITS}
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
                <td style="min-width: 70px;">
                    <span id="feature_videoSaturation_display">{VIDEO_SATURATION_VALUE_DISPLAY}</span>{VIDEO_SATURATION_UNITS}
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
                <td style="min-width: 70px;">
                    <span id="feature_videoSepia_display">{VIDEO_SEPIA_VALUE_DISPLAY}</span>{VIDEO_SEPIA_UNITS}
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

    var show_tempHideSubtitles = 'display: none;';

    var show_videoSpeedRate = 'display: none;';
    var show_videoZoom = 'display: none;';
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
            if (cfg['videoAspectRatio']['access'] && cfg['videoAspectRatio']['val'] == 'manual' && cfg['videoZoom']['access']) {
                show_videoZoom = '';

                shown_features_count++;
            }
            if (cfg['videoBrightness']['access']) {
                show_videoBrightness = '';

                shown_features_count++;
            }
            if (cfg['videoContrast']['access']) {
                show_videoContrast = '';

                shown_features_count++;
            }
            if (cfg['videoGrayscale']['access']) {
                show_videoGrayscale = '';

                shown_features_count++;
            }
            if (cfg['videoHue']['access']) {
                show_videoHue = '';

                shown_features_count++;
            }
            if (cfg['videoInvert']['access']) {
                show_videoInvert = '';

                shown_features_count++;
            }
            if (cfg['videoSaturation']['access']) {
                show_videoSaturation = '';

                shown_features_count++;
            }
            if (cfg['videoSepia']['access']) {
                show_videoSepia = '';

                shown_features_count++;
            }
        }
    } else {
        // Nothing yet
    }

    var keys = {
        'SHOW_NO_FEATURES_MSG': ((shown_features_count == 0) ? '' : 'display: none;'),
        'NO_FEATURES_MSG': getLang('no_features_available'),

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
        'VIDEO_SPEED_RATE_UNITS': transform_units(cfg['videoSpeedRate']['units']),

        'SHOW_VIDEO_ZOOM': show_videoZoom,
        'VIDEO_ZOOM_TEXT': getLang('feature_videoZoom'),
        'VIDEO_ZOOM_VALUE_DISPLAY': videoZoom_temp,
        'VIDEO_ZOOM_VALUE': videoZoom_temp,
        'VIDEO_ZOOM_MIN': cfg['videoZoom']['min'],
        'VIDEO_ZOOM_MAX': cfg['videoZoom']['max'],
        'VIDEO_ZOOM_STEP': cfg['videoZoom']['step'],
        'VIDEO_ZOOM_UNITS': transform_units(cfg['videoZoom']['units']),

        'SHOW_VIDEO_BRIGHTNESS': show_videoBrightness,
        'VIDEO_BRIGHTNESS_TEXT': getLang('feature_videoBrightness'),
        'VIDEO_BRIGHTNESS_VALUE_DISPLAY': videoBrightness_temp,
        'VIDEO_BRIGHTNESS_VALUE': videoBrightness_temp,
        'VIDEO_BRIGHTNESS_MIN': cfg['videoBrightness']['min'],
        'VIDEO_BRIGHTNESS_MAX': cfg['videoBrightness']['max'],
        'VIDEO_BRIGHTNESS_STEP': cfg['videoBrightness']['step'],
        'VIDEO_BRIGHTNESS_UNITS': transform_units(cfg['videoBrightness']['units']),

        'SHOW_VIDEO_CONTRAST': show_videoContrast,
        'VIDEO_CONTRAST_TEXT': getLang('feature_videoContrast'),
        'VIDEO_CONTRAST_VALUE_DISPLAY': videoContrast_temp,
        'VIDEO_CONTRAST_VALUE': videoContrast_temp,
        'VIDEO_CONTRAST_MIN': cfg['videoContrast']['min'],
        'VIDEO_CONTRAST_MAX': cfg['videoContrast']['max'],
        'VIDEO_CONTRAST_STEP': cfg['videoContrast']['step'],
        'VIDEO_CONTRAST_UNITS': transform_units(cfg['videoContrast']['units']),

        'SHOW_VIDEO_GRAYSCALE': show_videoGrayscale,
        'VIDEO_GRAYSCALE_TEXT': getLang('feature_videoGrayscale'),
        'VIDEO_GRAYSCALE_VALUE_DISPLAY': videoGrayscale_temp,
        'VIDEO_GRAYSCALE_VALUE': videoGrayscale_temp,
        'VIDEO_GRAYSCALE_MIN': cfg['videoGrayscale']['min'],
        'VIDEO_GRAYSCALE_MAX': cfg['videoGrayscale']['max'],
        'VIDEO_GRAYSCALE_STEP': cfg['videoGrayscale']['step'],
        'VIDEO_GRAYSCALE_UNITS': transform_units(cfg['videoGrayscale']['units']),

        'SHOW_VIDEO_HUE': show_videoHue,
        'VIDEO_HUE_TEXT': getLang('feature_videoHue'),
        'VIDEO_HUE_VALUE_DISPLAY': videoHue_temp,
        'VIDEO_HUE_VALUE': videoHue_temp,
        'VIDEO_HUE_MIN': cfg['videoHue']['min'],
        'VIDEO_HUE_MAX': cfg['videoHue']['max'],
        'VIDEO_HUE_STEP': cfg['videoHue']['step'],
        'VIDEO_HUE_UNITS': transform_units(cfg['videoHue']['units']),

        'SHOW_VIDEO_INVERT': show_videoInvert,
        'VIDEO_INVERT_TEXT': getLang('feature_videoInvert'),
        'VIDEO_INVERT_VALUE_DISPLAY': videoInvert_temp,
        'VIDEO_INVERT_VALUE': videoInvert_temp,
        'VIDEO_INVERT_MIN': cfg['videoInvert']['min'],
        'VIDEO_INVERT_MAX': cfg['videoInvert']['max'],
        'VIDEO_INVERT_STEP': cfg['videoInvert']['step'],
        'VIDEO_INVERT_UNITS': transform_units(cfg['videoInvert']['units']),

        'SHOW_VIDEO_SATURATION': show_videoSaturation,
        'VIDEO_SATURATION_TEXT': getLang('feature_videoSaturation'),
        'VIDEO_SATURATION_VALUE_DISPLAY': videoSaturation_temp,
        'VIDEO_SATURATION_VALUE': videoSaturation_temp,
        'VIDEO_SATURATION_MIN': cfg['videoSaturation']['min'],
        'VIDEO_SATURATION_MAX': cfg['videoSaturation']['max'],
        'VIDEO_SATURATION_STEP': cfg['videoSaturation']['step'],
        'VIDEO_SATURATION_UNITS': transform_units(cfg['videoSaturation']['units']),

        'SHOW_VIDEO_SEPIA': show_videoSepia,
        'VIDEO_SEPIA_TEXT': getLang('feature_videoSepia'),
        'VIDEO_SEPIA_VALUE_DISPLAY': videoSepia_temp,
        'VIDEO_SEPIA_VALUE': videoSepia_temp,
        'VIDEO_SEPIA_MIN': cfg['videoSepia']['min'],
        'VIDEO_SEPIA_MAX': cfg['videoSepia']['max'],
        'VIDEO_SEPIA_STEP': cfg['videoSepia']['step'],
        'VIDEO_SEPIA_UNITS': transform_units(cfg['videoSepia']['units'])
    };
    status_features = fillKeys(status_features, keys);

    return status_features;
}

function create_features_events() {
    try {document.getElementById('feature_tempHideSubtitles').addEventListener('change', function() { logEvent('status_updater > feature_tempHideSubtitles'); adjust_hide_subtitles_features_values(this); });} catch (e) {}
    try {document.getElementById('feature_videoSpeedRate').addEventListener('input', function() { logEvent('status_updater > feature_videoSpeedRate'); adjust_video_features_values(this); });} catch (e) {}
    try {document.getElementById('feature_videoZoom').addEventListener('input', function() { logEvent('status_updater > feature_videoZoom'); adjust_video_features_values(this); });} catch (e) {}
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
        case 'feature_videoZoom':
            videoZoom_temp = Number(value);
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

function remove_status_objects() {
    remove_status_icon();
    remove_status_bubble();
}

function remove_status_icon() {
    debug_overflow_entry('remove_status_icon', 11);
    var icon_container = document.getElementById('netflex_icon_container');
    if (icon_container) {
        removeDOM(icon_container);
    }
}

function remove_status_bubble() {
    debug_overflow_entry('remove_status_bubble', 11);
    var bubble_container = document.getElementById('netflex_bubble_container');
    if (bubble_container) {
        removeDOM(bubble_container);
    }
}

function element_handler() {
    try {
        create_status_objects();
        status_updater();
        status_update_time = new Date();
    } catch (e) {
        error_detected = true;
        error_message = 'element_handler: ' + e.stack;
    }
}

function status_updater() {
    debug_overflow_entry('status_updater', 11);

    // Defaults
    var netflix_status_profile = 'general';
    var icon_class = '';
    var icon_body_class = '';
    var icon_status_color = 'transparent'; // green
    var icon_border_color = '#FFFFFF';
    var bubble_status_text = getLang('status_text_ok');
    var bubble_offset_right = 'auto';
    var bubble_offset_top = 'auto';
    var bubble_offset_bottom = 'auto';

    // Determine profile
    if (check_kids() || check_kids_profile()) {
        netflix_status_profile = 'kids';
        icon_border_color = '#EBEBEB';
    }

    // Determine status
    if (isSimulated) {
        icon_border_color = '#7B83EB';
    }
    if (!enableAssistant) {
        icon_status_color = '#808080'; // gray
        bubble_status_text = getLang('status_text_disabled');
    }
    if (error_detected) {
        icon_status_color = '#E77400'; // orange
        bubble_status_text = getLang('status_text_errors');
    }
    if (!workers['assistant'] || check_error()) {
        icon_status_color = '#E70000'; // red
        bubble_status_text = getLang('status_text_broken');
    }
    if (isOrphan) {
        icon_status_color = '#E70074'; // purple
        bubble_status_text = getLang('status_text_update');
    }

    // Determine styles and positions
    var obj = get_status_objects();
    if (obj['iconTemplateElm']) {
        icon_class = obj['iconTemplateElm'].className;

        var text_class_name = '';
        var text_class = document.querySelector('[data-uia="video-title"]');
        if (text_class) {
            text_class_name = ' ' + text_class.className.replace('small','').replace('medium','').replace('large','').trim();
        }
        icon_class = icon_class + text_class_name;

        if (obj['controls_type'] == 'watch' && obj['iconTemplateElm'].querySelector('[role="presentation"]')) {
            icon_body_class = obj['iconTemplateElm'].querySelector('[role="presentation"]').className;
        }
    }
    if (obj['iconPlaceBeforeElm']) {
        var elemRect = obj['iconPlaceBeforeElm'].getBoundingClientRect();

        var elm = object_handler('player_video_container', null);
        if (elm && obj['controls_type'] == 'watch') {
            var bodyRect = elm.getBoundingClientRect();
            if (bodyRect.right != 0 && elemRect.right != 0) {
                bubble_offset_right = bodyRect.right - elemRect.right - 40;
                if (bubble_offset_right < 10) {
                    bubble_offset_right = 10;
                }
            }
        } else {
            var bodyRect = document.body.getBoundingClientRect();
            if (bodyRect.right != 0 && elemRect.right != 0) {
                bubble_offset_right = bodyRect.right - elemRect.right - 40;
                if (bubble_offset_right < 10) {
                    bubble_offset_right = 10;
                }
            }
        }

        if (obj['controls_type'] == 'watch') {
            if (elemRect.top != 0 && elemRect.bottom != 0) {
                bubble_offset_bottom = bodyRect.bottom - elemRect.bottom + elemRect.height;
            }

            bubble_offset_right = bubble_offset_right + 'px';
            bubble_offset_top = 'auto';
            bubble_offset_bottom = bubble_offset_bottom + 'px';
        } else if (obj['controls_type'] == 'browse') {
            bubble_offset_right = bubble_offset_right + 'px';
            bubble_offset_top = (elemRect.top + elemRect.height) + 'px';
            bubble_offset_bottom = 'auto';
        }
    } else {
        // In case controls are hidden and there are no referenced objects to rely on, use old stored values
        if (status_data_old.hasOwnProperty('bubble_offset_right')) {
            bubble_offset_right = status_data_old['bubble_offset_right'];
        }
        if (status_data_old.hasOwnProperty('bubble_offset_bottom')) {
            bubble_offset_bottom = status_data_old['bubble_offset_bottom'];
        }
    }

    status_data = {
        'netflix_status_profile': netflix_status_profile,
        'controls': obj['controls_type'],
        'icon_class': icon_class,
        'icon_body_class': icon_body_class,
        'icon_status_color': icon_status_color,
        'icon_border_color': icon_border_color,
        'bubble_status_text': bubble_status_text,
        'bubble_offset_right': bubble_offset_right,
        'bubble_offset_top': bubble_offset_top,
        'bubble_offset_bottom': bubble_offset_bottom
    };

    update_status_objects();
}

function update_status_objects() {
    var updated_keys = [];
    for (var key in status_data) {
        if (status_data.hasOwnProperty(key)) {
            var old_value = undefined;
            if (status_data_old.hasOwnProperty(key)) {
                old_value = status_data_old[key];
            }

            switch (key) {
                // ICON
                case 'icon_class':
                    // If icon status class changed, update it
                    var elm = document.getElementById('netflex_icon_container');
                    if (elm) {
                        if (status_data[key] != elm.className) {
                            elm.className = status_data[key];
                            updated_keys.push(key);
                        }
                    }
                    break;
                case 'icon_body_class':
                    // If icon status body class changed, update it
                    var elm = document.getElementById('netflex_icon_body');
                    if (elm) {
                        if (status_data[key] != elm.className) {
                            elm.className = status_data[key];
                            updated_keys.push(key);
                        }
                    }
                    break;
                case 'icon_status_color':
                    // If icon status color changed, update it
                    var elm = document.getElementById('netflex_icon_status');
                    if (elm) {
                        if (status_data[key] != elm.style.getPropertyValue('--netflex_icon_stat_color')) {
                            elm.style.setProperty('--netflex_icon_stat_color', status_data[key], '');
                            updated_keys.push(key);
                        }
                    }
                    break;
                case 'icon_border_color':
                    // If icon border color changed, update it
                    var elm = document.getElementById('netflex_icon_status');
                    if (elm) {
                        if (status_data[key] != elm.style.getPropertyValue('--netflex_icon_bord_color')) {
                            elm.style.setProperty('--netflex_icon_bord_color', status_data[key], '');
                            updated_keys.push(key);
                        }
                    }
                    break;
                // BUBBLE
                case 'bubble_status_text':
                    // If status text changed, update it
                    var elm = document.getElementById('netflex_status_text');
                    if (elm) {
                        if (status_data[key] != elm.innerHTML) {
                            addDOM(elm, status_data[key]);
                            updated_keys.push(key);
                        }
                    }
                    break;
                case 'bubble_offset_right':
                    // If bubble offset right changed, update it
                    var elm = document.getElementById('netflex_bubble_container');
                    if (elm) {
                        //if (status_data[key] != old_value) {
                        //if (status_data[key] != elm.style.getPropertyValue('--netflex_bubble_off_right')) {
                            elm.style.setProperty('--netflex_bubble_off_right', status_data[key], '');
                            status_data_old[key] = status_data[key];
                            updated_keys.push(key);
                        //}
                    }
                    break;
                case 'bubble_offset_top':
                    // If bubble offset top changed, update it
                    var elm = document.getElementById('netflex_bubble_container');
                    if (elm) {
                        //if (status_data[key] != old_value) {
                        //if (status_data[key] != elm.style.getPropertyValue('--netflex_bubble_off_top')) {
                            elm.style.setProperty('--netflex_bubble_off_top', status_data[key], '');
                            status_data_old[key] = status_data[key];
                            updated_keys.push(key);
                        //}
                    }
                    break;
                case 'bubble_offset_bottom':
                    // If bubble offset bottom changed, update it
                    var elm = document.getElementById('netflex_bubble_container');
                    if (elm) {
                        //if (status_data[key] != old_value) {
                        //if (status_data[key] != elm.style.getPropertyValue('--netflex_bubble_off_bottom')) {
                            elm.style.setProperty('--netflex_bubble_off_bottom', status_data[key], '');
                            status_data_old[key] = status_data[key];
                            updated_keys.push(key);
                        //}
                    }
                    break;
                // OTHER
                case 'netflix_status_profile':
                    // If profile changes we should recreate status objects
                    var elm = document.getElementById('netflex_bubble_container');
                    if (elm) {
                        if (status_data[key] != elm.getAttribute('profile')) {
                            elm.setAttribute('profile',status_data[key]);
                            remove_status_objects();
                            status_data_old[key] = status_data[key];
                            updated_keys.push(key);
                        }
                    }
                    break;
                case 'controls':
                    // If controls changes we should update information about it
                    var elm_bubble = document.getElementById('netflex_bubble_container');
                    if (elm_bubble) {
                        if (status_data[key] != elm_bubble.getAttribute('controls')) {
                            elm_bubble.setAttribute('controls',status_data[key]);
                            updated_keys.push(key);
                        }
                    }
                    var elm_icon = document.getElementById('netflex_icon_status');
                    if (elm_icon) {
                        if (status_data[key] != elm_icon.getAttribute('controls')) {
                            elm_icon.setAttribute('controls',status_data[key]);
                            updated_keys.push(key);
                        }
                    }
                    break;
                default:
                    log('info', '', 'Unknown: "' + key + '" => "' + status_data[key] + '"');
                    break;
            }
        }
    }

    if (updated_keys.length > 0) {
        log('debug', 'environment', updated_keys);
    }
}

function create_status_objects() {
    debug_overflow_entry('create_status_objects', 11);

    // Add status icon on playback control/browse bar
    if (check_watch() && cfg['hideStatusIcon']['val'] && cfg['hideStatusIcon']['access']) {
        // Status icon should be hidden
        remove_status_icon();
        if (status_bubble_opened) {
            switch_simulation(false, 'netflex_bubble_container');
        }
    } else {
        // Prepare status objects and variables
        var obj = get_status_objects();

        // Create bubble container that is independent from icon
        if (obj['bubblePlaceBeforeElm']) {
            var bubble_container = obj['bubblePlaceBeforeElm'].parentNode.querySelector('#netflex_bubble_container');
            if (!bubble_container) {
                remove_status_bubble();

                bubble_container = document.createElement('div');
                bubble_container.setAttribute('style','display: none; position: fixed;');
                bubble_container.setAttribute('id','netflex_bubble_container');
                bubble_container.setAttribute('profile',localStorage.getItem('netflex_profile'));
                bubble_container.setAttribute('controls',obj['controls_type']);
                bubble_container.setAttribute('run-id',run_id);
                addDOM(bubble_container, generate_status_data());
                obj['bubblePlaceBeforeElm'].parentNode.insertBefore(bubble_container, obj['bubblePlaceBeforeElm']);

                // Deploy status events
                bubble_container.addEventListener('mouseenter', function() { logEvent('create_status_objects > netflex_bubble_container > enter'); stop_worker('close_status_content'); switch_simulation(true, 'netflex_bubble_container'); });
                bubble_container.addEventListener('mouseleave', function() { logEvent('create_status_objects > netflex_bubble_container > leave'); workers['close_status_content'] = setTimeout(function() { switch_simulation(false, 'netflex_bubble_container'); }, cfg['bubbleHideDelay']['val']); });

                // Set events for status elements
                document.getElementById('extension_news').addEventListener('click', function() { logEvent('create_status_objects > extension_news'); extension_news(); });

                document.getElementById('extension_options').addEventListener('click', function() { logEvent('create_status_objects > extension_options'); extension_options(); });
                document.getElementById('extension_options').addEventListener('mouseenter', function() { logEvent('create_status_objects > extension_options > enter'); options_icon_animate(true); });
                document.getElementById('extension_options').addEventListener('mouseleave', function() { logEvent('create_status_objects > extension_options > leave'); options_icon_animate(false); });

                document.getElementById('extension_features').addEventListener('click', function() { logEvent('create_status_objects > extension_features'); extension_features(); });

                document.getElementById('extension_logo').addEventListener('click', function() { if (check_watch()) {logEvent('create_status_objects > extension_logo'); create_fireworks_mark(); stop_worker('close_status_content'); switch_simulation(false, 'netflex_bubble_container');} });

                create_features_events();
            } else {
                if (bubble_container.getAttribute('run-id')) {
                    if (bubble_container.getAttribute('run-id') != run_id.toString()) {
                        remove_status_bubble();
                    }
                } else {
                    remove_status_bubble();
                }
            }
        }

        // If icon objects are prepared, insert icon
        if (obj['iconPlaceBeforeElm']) {
            var icon_container = obj['iconPlaceBeforeElm'].parentNode.querySelector('#netflex_icon_container');
            if (obj['iconPlaceBeforeElm'] && obj['iconTemplateElm'] && !icon_container) {
                remove_status_icon();

                icon_container = obj['iconTemplateElm'].cloneNode(true);
                try {icon_container.querySelector('svg, a').parentNode.removeChild(icon_container.querySelector('svg, a'));} catch (e) {}
                icon_container.setAttribute('style','color: transparent; stroke: #FFFFFF; stroke-width: 80px; transform-origin: center center;');
                icon_container.setAttribute('id','netflex_icon_container');
                icon_container.setAttribute('run-id',run_id);

                if (obj['controls_type'] == 'watch') {
                    try {
                        icon_container.children[0].removeAttribute('aria-label');
                        icon_container.children[0].removeAttribute('data-uia');
                        icon_container.children[0].children[0].setAttribute('id','netflex_icon_body');
                    } catch (e) {}
                }

                var text_class_name = '';
                var text_class = document.querySelector('[data-uia="video-title"]');
                if (text_class) {
                    text_class_name = ' ' + text_class.className.replace('small','').replace('medium','').replace('large','').trim();
                }
                icon_container.className = icon_container.className + text_class_name;

                var insert_container = icon_container;
                if (obj['controls_type'] == 'watch') {
                    if (icon_container.children[0]) {
                        if (icon_container.children[0].children[0]) {
                            insert_container = icon_container.children[0].children[0];
                        }
                    }
                }
                addDOM(insert_container, '<i id="netflex_icon_status" controls="' + obj['controls_type'] + '" class="fas fa-circle"></i>');
                obj['iconPlaceBeforeElm'].parentNode.insertBefore(icon_container, obj['iconPlaceBeforeElm']);

                icon_container.addEventListener('mouseenter', function() { logEvent('create_status_objects > netflex_icon_container > enter'); stop_worker('close_status_content'); switch_simulation(true, 'netflex_bubble_container'); });
                icon_container.addEventListener('mouseleave', function() { logEvent('create_status_objects > netflex_icon_container > leave'); workers['close_status_content'] = setTimeout(function() { switch_simulation(false, 'netflex_bubble_container'); }, cfg['bubbleHideDelay']['val']); });

                // Set closing events for other buttons
                if (icon_container.parentNode.children) {
                    var elms = icon_container.parentNode.children;
                    for (var i = 0; i < elms.length; i++) {
                        var elm_id = elms[i].id;
                        if (elm_id != 'netflex_icon_container') {
                            var attr = elms[i].getAttribute('netflex_event_set');
                            if (elms[i].id !== 'extension_status_content' && elms[i].id !== 'extension_status_button' && attr !== 'true') {
                                elms[i].addEventListener('mouseenter', function() { logEvent('status_updater > player_controls_elements/navigation_menu_elements'); stop_worker('close_status_content'); switch_simulation(false, 'netflex_bubble_container'); });
                                elms[i].setAttribute('netflex_event_set', 'true');
                            }
                        }
                    }
                }
            } else {
                if (icon_container) {
                    if (icon_container.getAttribute('run-id')) {
                        if (icon_container.getAttribute('run-id') != run_id.toString()) {
                            remove_status_icon();
                        }
                    } else {
                        remove_status_icon();
                    }

                    // Deploy status events
                    var icon_element = document.querySelector('svg#netflex_icon_status');
                    if (icon_element) {
                        if (!icon_element.getAttribute('events')) {
                            icon_element.addEventListener('click', function(e) { if (e.button == 0) {logEvent('create_status_objects > extension_status'); toggle_assistant();} });
                            //icon_element.addEventListener('mouseenter', function() { logEvent('create_status_objects > netflex_icon > enter'); stop_worker('close_status_content'); switch_simulation(true, 'netflex_bubble_container'); });
                            //icon_element.addEventListener('mouseleave', function() { logEvent('create_status_objects > netflex_icon > leave'); workers['close_status_content'] = setTimeout(function() { switch_simulation(false, 'netflex_bubble_container'); }, cfg['bubbleHideDelay']['val']); });
                            icon_element.setAttribute('events','listening')
                        }
                    }
                }
            }
        }
    }
}

function get_status_objects() {
    var obj = {
        'controls_type': 'unknown',
        'iconTemplateElm': null,
        'iconPlaceBeforeElm': null,
        'bubblePlaceBeforeElm': null
    };

    if (check_watch()) {
        obj['controls_type'] = 'watch';
        if (object_handler('player_extension_status_location', null)) {
            obj['iconTemplateElm'] = object_handler('player_extension_status_location', null).parentNode;
            obj['iconPlaceBeforeElm'] = obj['iconTemplateElm'].parentNode.children[0];
        }

        obj['bubblePlaceBeforeElm'] = object_handler('player_container', null);
    } else if (check_browse() || check_latest() || check_title() || check_search()) {
        obj['controls_type'] = 'browse';
        if (object_handler('navigation_menu_account', null) && object_handler('navigation_menu_kids', null)) {
            obj['iconTemplateElm'] = object_handler('navigation_menu_account', null).parentNode;
            obj['iconPlaceBeforeElm'] = object_handler('navigation_menu_kids', null);
        }

        obj['bubblePlaceBeforeElm'] = netflix_body.children[0];
    } else {
        // Controls not found or are from unknown source
        obj['controls_type'] = 'unknown';
        remove_status_icon();
    }

    return obj;
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

        var event;
        var elm;

        // Keep pop-up visible
        switch (type) {
            case 'netflex_bubble_container':
                // Element that will be triggering mouse move event
                var elm_button_question = object_handler('button_report_problem', null);
                event = 'move';

                //var elm_button_audio_subtitle = object_handler('button_audio_subtitle', null);
                //event = 'click';

                elm = elm_button_question;

                // Actions perform when event is raised and finished
                var elm_pop_content = document.getElementById('netflex_bubble_container');
                var elm_container = object_handler('player_video_container', null);

                if (state) {
                    try {
                        addCSS(elm_pop_content, {'display': 'inherit'});

                        status_bubble_opened = true;
                    } catch (e) {}
                } else {
                    try {
                        addCSS(elm_pop_content, {'display': 'none'});

                        hide_extension_containers('status_bubble');

                        status_bubble_opened = false;
                    } catch (e) {}
                }
                break;
        }

        // Handle the element registration
        if (state) {
            simulation_objects[type] = [ event, elm ];
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
                var event = simulation_objects[key][0];
                var elm = simulation_objects[key][1];

                if (elm && event) {
                    switch (event) {
                        case 'move':
                            if (movement_offset == 0) {
                                movement_offset = 1;
                            } else {
                                movement_offset = 0;
                            }

                            if (cfg['debug']['val'].includes('mouse_simulation')) {
                                var dbg_el1 = document.createElement('div');
                                dbg_el1.className = 'netflex_mouse_move_debug';
                                dbg_el1.setAttribute('data-creation', new Date().getTime());
                                addCSS(dbg_el1, {
                                    'width': '1px',
                                    'height': '1px',
                                    'border': '1px solid green',
                                    'background-color': 'green',
                                    'position': 'absolute',
                                    'z-index': '9999999999',
                                    'top': (elm.getBoundingClientRect().top + elm.offsetHeight/2 + movement_offset + 1) + 'px',
                                    'left': (elm.getBoundingClientRect().left + elm.offsetWidth/2 + movement_offset + 1) + 'px'
                                })
                                elm.appendChild(dbg_el1);

                                var dbg_el2 = document.createElement('div');
                                dbg_el2.className = 'netflex_mouse_move_debug';
                                dbg_el2.setAttribute('data-creation', new Date().getTime());
                                addCSS(dbg_el2, {
                                    'width': '1px',
                                    'height': '1px',
                                    'border': '1px solid red',
                                    'background-color': 'red',
                                    'position': 'absolute',
                                    'z-index': '9999999999',
                                    'top': (elm.offsetHeight/2 + movement_offset + 2) + 'px',
                                    'left': (elm.offsetWidth/2 + movement_offset + 2) + 'px'
                                })
                                elm.appendChild(dbg_el2);

                                var dbg_el3 = document.createElement('div');
                                dbg_el3.className = 'netflex_mouse_move_debug';
                                dbg_el3.setAttribute('data-creation', new Date().getTime());
                                addCSS(dbg_el3, {
                                    'width': '1px',
                                    'height': '1px',
                                    'border': '1px solid blue',
                                    'background-color': 'blue',
                                    'position': 'absolute',
                                    'z-index': '9999999999',
                                    'top': (elm.offsetHeight/2 + movement_offset + 3) + 'px',
                                    'left': (elm.offsetWidth/2 + movement_offset + 3) + 'px'
                                })
                                elm.appendChild(dbg_el3);
                            }

                            // Keep controls displayed
                            var eventOptions = {
                                'bubbles': true,
                                'button': 0,
                                'clientX': elm.getBoundingClientRect().left + elm.offsetWidth/2 + movement_offset,
                                'clientY': elm.getBoundingClientRect().top + elm.offsetHeight/2 + movement_offset,
                                'offsetX': elm.offsetWidth/2 + movement_offset,
                                'offsetY': elm.offsetHeight/2 + movement_offset,
                                'pageX': elm.offsetWidth/2 + movement_offset,
                                'pageY': elm.offsetHeight/2 + movement_offset,
                                'currentTarget': elm[0]
                            };
                            elm.dispatchEvent(new MouseEvent('mousemove', eventOptions));
                            break;
                        case 'click':
                            doClick(elm);
                            break;
                    }
                }
            } catch (e) {}
        }
    }

    // Check for debug objects and remove them if they are old enough
    var elms = document.querySelectorAll('.netflex_mouse_move_debug');
    if (elms[0]) {
        for (var i = 0; i < elms.length; i++) {
            var created_epoch_time = Number(elms[i].getAttribute('data-creation'));
            var curr_epoch_time = new Date().getTime();
            if (created_epoch_time < (curr_epoch_time - cfg['debugControlsSwitchTimer']['val']) || !cfg['debug']['val'].includes('mouse_simulation')) {
                removeDOM(elms[i]);
            }
        }
    }
}