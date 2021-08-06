// ------------------------
// Debug and core systems
// ------------------------

// Configuration key (feature) in this array will have notification about it being disabled in options page, actually
// disabling it has to be done separately in code
var disabled_features = [];

var debug_variables = {};

var movement_offset = 0;

var injected = false;
var run_id = Date.now();
var injected_flag = 'Netflex';

var workers = {};
workers['startup'] = false;
workers['status'] = false;
workers['environment'] = false;
workers['injector'] = false;
workers['assistant'] = false;
workers['elements'] = false;
workers['controls'] = false;
workers['ratings'] = false;
workers['options_style'] = false;
workers['close_status_content'] = false;
workers['local_storage_size'] = false;
workers['synopsis_reveal'] = false;
workers['title_end_actions'] = false;

var reload_requests = {};
var reload_requested = false;
var reloading_page = false;
var reload_delay = false;

var netflix_head = object_handler('head', null);
var netflix_body = object_handler('body', null);

var styles_list = {
    'netflex-ui': {
        'src': extension_extension.getURL('styles/netflex-ui.css'),
        'cache': false
    },
    'netflex-features': {
        'src': extension_extension.getURL('styles/netflex-features.css'),
        'cache': false
    }
};

var url = window.location.href;
var origin = window.location.origin;
var ancestorOrigins = origin;
try {ancestorOrigins = window.location.ancestorOrigins[0];} catch (e) {} // https://bugzilla.mozilla.org/show_bug.cgi?id=1085214
var path = window.location.pathname + window.location.search;
var title = window.title;
var full_url = window.location.origin + window.location.pathname;
var full_url_old = full_url;

var isOrphan = false;

// Current extension version
var extension_version = extension_manifest.version;
var extension_version_normalized = normalize_version(extension_version, 4);
// Last version to be loaded, if value is not same as current version, version changes will be applied and value will be updated
var last_version = ((localStorage.getItem('lastVersion') != null) ? localStorage.getItem('lastVersion') : localStorage.getItem('netflex_lastVersion'));
var last_version_normalized = normalize_version(last_version, 4);
// Previous version
var previous_version = localStorage.getItem('netflex_previousVersion');
var previous_version_normalized = normalize_version(previous_version, 4);
// Last applied change from versions.js file for specific version
var applied_version = localStorage.getItem('netflex_appliedVersion');
var applied_version_normalized = normalize_version(applied_version, 4);

var cadmium_version = null;
var cadmium_version_normalized = null;
var netflix_profile = localStorage.getItem('netflex_profile');

var api_keys = load_api_keys();
var donation_urls = load_donation_urls();
var stores_urls = load_stores_urls();
var source_urls = load_source_urls();
var news_urls = load_news_urls();

var show_donation_link = true;
var show_source_link = true;

var options_tab_selected = 'tab_assistant';

// ------------------------
// Application
// ------------------------

var logo_icon_prod = extension_extension.getURL('images/netflex.png');
var logo_icon_test = extension_extension.getURL('images/netflex_test.png');
var logo_icon_dev = extension_extension.getURL('images/netflex_dev.png');
var logo_icon_sup = extension_extension.getURL('images/netflex_sup.png');
var changelog_page = extension_extension.getURL('CHANGELOG');

var control_panel = 'none';
var bubble_offset_right = 0;
var bubble_offset_bottom = 0;
var status_profile = 'init';
var status_profile_old = 'none';
var status_color = 'init';
var status_color_old = 'none';
var border_color = 'init';
var border_color_old = 'none';

var date_format = {
    'full': {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    }
};

var storage_stats = {
    'extension': {
        'used_bytes': 0,
        'max_bytes': 0,
        'used_pct': 0,
        'limit_warn': false
    },
    'local': {
        'used_bytes': 0,
        'max_bytes': 0,
        'used_pct': 0,
        'limit_warn': false
    }
}; // https://bugzilla.mozilla.org/show_bug.cgi?id=1385832
var local_storage_max_size = (5 * 1024 * 1024); // Could be determined by local_storage_total_size(); but it causes small browser lags that are not nice, so we will assume the value
var oldLink = window.location.href;
var oldTimestamp = 0;
var currentTimestamp = 0;
var loading_next_title = false;
var rolling_credits = false;
var skipping = false;
var forceNextEpisode = false;
var next_is_offered = false;
var next_no_wait = false;
var stuckTime = 0;
var loadingTime = 0;
var nextTitleDelay = 0;
var forceReloadDifference = 0;
var pingUpdateDifference = 0;
var key_pressed = '';
var wheel_direction = '';
var lastForceReload = new Date(1970, 0, 1, 0, 0, 0);
var loadTime = new Date();
var lastCall = new Date();
var currentTime = new Date();
var watchHistory = [];
var stats_counter = {};
var simulation_objects = {};
var overflowData = {};

var news_data = JSON.parse(nvl(localStorage.getItem('netflex_newsData'), "{}"), JSON.dateParser);
var last_news_update = JSON.parse(nvl(localStorage.getItem('netflex_lastNewsUpdate'), JSON.stringify(new Date(1970, 0, 1, 0, 0, 0))), JSON.dateParser);
var last_news_read = JSON.parse(nvl(localStorage.getItem('netflex_lastNewsRead'), JSON.stringify(new Date(1970, 0, 1, 0, 0, 0))), JSON.dateParser);
var unread_news_count = 0;
var news_update_interval = 60; // Minutes
var news_update_running = false;
var news_force_update = false;

var video = null;
var video_id = '';
var is_series = false;
var currentVideo = '';
var currentEpisode = '';
var nextVideo = '';
var currentVideo_1 = '';
var currentVideo_2 = '';
var currentVideo_3 = '';
var currentEpisode_1 = '';
var currentEpisode_2 = '';
var nextVideo_1 = '';
var nextVideo_2 = '';
var nextVideo_3 = '';

var status_bubble_opened = false;
var news_opened = false;
var options_opened = false;
var features_opened = false;

var videoSpeedRate = cfg['videoSpeedRate']['def'];
var videoSpeedRate_change = cfg['videoSpeedRate']['def'];
var videoSpeedRate_temp = cfg['videoSpeedRate']['def'];
var videoZoom = cfg['videoZoom']['def'];
var videoZoom_change = cfg['videoZoom']['def'];
var videoZoom_temp = cfg['videoZoom']['def'];
var videoBrightness = cfg['videoBrightness']['def'];
var videoBrightness_change = cfg['videoBrightness']['def'];
var videoBrightness_temp = cfg['videoBrightness']['def'];
var videoContrast = cfg['videoContrast']['def'];
var videoContrast_change = cfg['videoContrast']['def'];
var videoContrast_temp = cfg['videoContrast']['def'];
var videoGrayscale = cfg['videoGrayscale']['def'];
var videoGrayscale_change = cfg['videoGrayscale']['def'];
var videoGrayscale_temp = cfg['videoGrayscale']['def'];
var videoHue = cfg['videoHue']['def'];
var videoHue_change = cfg['videoHue']['def'];
var videoHue_temp = cfg['videoHue']['def'];
var videoInvert = cfg['videoInvert']['def'];
var videoInvert_change = cfg['videoInvert']['def'];
var videoInvert_temp = cfg['videoInvert']['def'];
var videoSaturation = cfg['videoSaturation']['def'];
var videoSaturation_change = cfg['videoSaturation']['def'];
var videoSaturation_temp = cfg['videoSaturation']['def'];
var videoSepia = cfg['videoSepia']['def'];
var videoSepia_change = cfg['videoSepia']['def'];
var videoSepia_temp = cfg['videoSepia']['def'];

var hideSubtitles_temp = false;

var reset_features = false;

var enableAssistant = true;
var key_disabled = false;

var visibleAPI = true;
var visibleWND = true;
var hiddenCFG = false;
var pausedByExtension = false;

var enableProactiveRatings = false; // WARNING: This will eat trough OMDB API key limit like crazy
var ratingsDB = {};
var ratings_limit_reached = false;
var ratings_version = 'v2';

// Internal expiration times
var rating_expiration_init = 5; // Minutes
var rating_expiration_pending = 5; // Minutes
// Technical OMDB API expiration times
var rating_expiration_invalid_key = 1; // Hours
// Wikidata expiration times
var rating_expiration_timeout_wiki = 1; // Hours
var rating_expiration_imdb_not_found_wiki = 1; // Hours
var rating_expiration_not_found_wiki = 1; // Hours
var rating_expiration_error_wiki = 1; // Hours
// OMDB API expiration times
var rating_expiration_found_new = 30; // Days
var rating_expiration_found_old = 183; // Days
var rating_expiration_not_found = 15; // Days
var rating_expiration_timeout = 1; // Days
var rating_expiration_limit = 1; // Days
var rating_expiration_error = 1; // Days

// Always store as UPPERCASE
var loc_skip_intro = [
    'LEWATI INTRO', // Bahasa Indonesia
    'LANGKAU PENGENALAN', // Bahasa Melayu
    'SPRING INTRO OVER', // Dansk
    'INTRO ÜBERSPRINGEN', // Deutsch
    'SKIP INTRO', // English
    'OMITIR INTRO', // Español
    'IGNORER L\'INTRODUCTION', // Français
    'PRESKOČI UVOD', // Hrvatski
    'SALTA L\'INTRO', // Italiano
    'RUKA UTANGULIZI', // Kiswahili
    'BEVEZETÉS KIHAGYÁSA', // Magyar
    'INTRO OVERSLAAN', // Nederlands
    'HOPP OVER INTRO', // Norsk Bokmål
    'POMIŃ CZOŁÓWKĘ', // Polski
    'PULAR ABERTURA', // Português
    'FĂRĂ INTRODUCERE', // Română
    'OHITA INTRO', // Suomi
    'HOPPA ÖVER INTRO', // Svenska
    'BỎ QUA GIỚI THIỆU', // Tiếng Việt
    'İNTROYU ATLA', // Türkçe
    'PŘESKOČIT ÚVOD', // Čeština
    'ΠΑΡΑΛΕΙΨΗ ΕΙΣΑΓΩΓΗΣ', // Ελληνικά
    'ПРОПУСТИТЬ ИНТРО', // Русский
    'דלג על התקציר', // עברית
    'تخطي المقدمة', // العربية
    'इंट्रो स्किप करें', // हिन्दी
    'ข้ามตอนต้น', // ไทย
    '跳过简介', // 中文
    'イントロをスキップ', // 日本語
    '오프닝 건너뛰기', // 한국어
];

// Always store as UPPERCASE
var loc_skip_recap = [
    'LEWATI RINGKASAN', // Bahasa Indonesia
    'LANGKAU IKHTISAR', // Bahasa Melayu
    'SPRING RESUMÉ OVER', // Dansk
    'RÜCKBLICK ÜBERSPRINGEN', // Deutsch
    'SKIP RECAP', // English
    'OMITIR RESUMEN', // Español
    'IGNORER LE RÉCAP', // Français
    'PRESKOČI SAŽETAK', // Hrvatski
    'SALTA IL RIASSUNTO', // Italiano
    'RUKA MARUDIO', // Kiswahili
    'ÖSSZEFOGLALÓ KIHAGYÁSA', // Magyar
    'OVERZICHT OVERSLAAN', // Nederlands
    'HOPP OVER SAMMENDRAG', // Norsk Bokmål
    'POMIŃ PODSUMOWANIE', // Polski
    'PULAR O RESUMO', // Português
    'FĂRĂ RECAPITULARE', // Română
    'OHITA KERTAUS', // Suomi
    'HOPPA ÖVER SAMMANFATTNING', // Svenska
    'BỎ QUA TÓM TẮT', // Tiếng Việt
    'ÖZETI ATLA', // Türkçe
    'PŘESKOČIT REKAPITULACI', // Čeština
    'ΠΑΡΑΛΕΙΨΗ ΠΕΡΙΛΗΨΗΣ', // Ελληνικά
    'ПРОПУСТИТЬ КРАТКОЕ СОДЕРЖАНИЕ', // Русский
    'דלג על ההקדמה', // עברית
    'تخطي الملخص', // العربية
    'रीकैप स्किप करें', // हिन्दी
    'ข้ามความเดิม', // ไทย
    '跳过剧情回顾', // 中文
    '本編へスキップ', // 日本語
    '줄거리 건너뛰기', // 한국어
];
