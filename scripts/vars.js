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

var reload_requests = {};
var reload_requested = false;
var reloading = false;
var reload_delay = false;

var netflix_head = object_handler('head', null);
var netflix_body = object_handler('body', null);

var styles_list = {
    'extension': {
        'src': extension_extension.getURL('styles/extension.css'),
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

var show_donation_link = true;
var show_source_link = true;

var options_tab_selected = 'tab_assistant';

// ------------------------
// Application
// ------------------------

var logo_icon = extension_extension.getURL('images/netflex.png');
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
var loading = false;
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
var lastForceReload = new Date(1970, 0, 1, 0, 0, 0);
var loadTime = new Date();
var lastCall = new Date();
var currentTime = new Date();
var watchHistory = [];
var ratingsDB = {};
var stats_counter = {};
var simulation_objects = {};
var overflowData = {};

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

var videoSpeedRate = cfg['videoSpeedRate']['def'];
var videoSpeedRate_change = cfg['videoSpeedRate']['def'];
var videoSpeedRate_temp = cfg['videoSpeedRate']['def'];
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
var ratings_limit_reached = false;
var ratings_version = 'v2';

var video_filter_access = false;

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
var rating_expiration_found = 30; // Days
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

var browse_categories_list = {
	'browsecat_army_dramas': 11,
	'browsecat_mockumentaries': 26,
	'browsecat_tv_show': 83,
	'browsecat_sports_documentaries': 180,
	'browsecat_belgian_movies': 262,
	'browsecat_independent_dramas': 384,
	'browsecat_anime_dramas': 452,
	'browsecat_lgbtq_dramas': 500,
	'browsecat_movies_for_ages_8_to_10': 561,
	'browsecat_children_family_movies': 783,
	'browsecat_dark_comedies': 869,
	'browsecat_monster_movies': 947,
	'browsecat_steamy_thrillers': 972,
	'browsecat_country_westernfolk': 1105,
	'browsecat_travel_adventure_documentaries': 1159,
	'browsecat_romantical_dramas': 1255,
	'browsecat_romantic_dramas': 1255,
	'browsecat_action_adventure': 1365,
	'browsecat_tv_scifi_fantasy': 1372,
	'browsecat_late_night_comedies': 1402,
	'browsecat_scifi_fantasy': 1492,
	'browsecat_action_scifi_fantasy': 1568,
	'browsecat_latin_american_movies': 1613,
	'browsecat_scifi_horror_movies': 1694,
	'browsecat_music': 1701,
	'browsecat_military_action_adventure': 2125,
	'browsecat_foreign_dramas': 2150,
	'browsecat_science_navature_documentaries': 2595,
	'browsecat_anime_action': 2653,
	'browsecat_political_comedies': 2700,
	'browsecat_anime_scifi': 2729,
	'browsecat_documentaires_spirituels': 2760,
	'browsecat_world_music_concerts': 2856,
	'browsecat_anime_features': 3063,
	'browsecat_biographical_dramas': 3179,
	'browsecat_independent_thrillers': 3269,
	'browsecat_rock_pop_concerts': 3278,
	'browsecat_alien_scifi': 3327,
	'browsecat_teen_comedies': 3519,
	'browsecat_biographical_documentaries': 3652,
	'browsecat_dramas_based_on_real_life': 3653,
	'browsecat_social_cultural_documentaries': 3675,
	'browsecat_african_movies': 3761,
	'browsecat_scifi_dramas': 3916,
	'browsecat_social_issues_dramas': 3947,
	'browsecat_chinese_movies': 3960,
	'browsecat_military_documentaries': 4006,
	'browsecat_independent_comedies': 4195,
	'browsecat_tv_mysteries': 4366,
	'browsecat_sports_movies': 4370,
	'browsecat_foreign_comedies': 4426,
	'browsecat_cult_scifi_fantasy': 4734,
	'browsecat_miniseries': 4814,
	'browsecat_satires': 4922,
	'browsecat_dramas_based_on_books': 4961,
	'browsecat_showbiz_dramas': 5012,
	'browsecat_foreign_documentaries': 5161,
	'browsecat_australian_movies': 5230,
	'browsecat_eastern_european_movies': 5254,
	'browsecat_sports_comedies': 5286,
	'browsecat_historical_documentaries': 5349,
	'browsecat_movies_for_ages_5_to_7': 5455,
	'browsecat_romantic_comedies': 5475,
	'browsecat_psychological_thrillers': 5505,
	'browsecat_animal_tales': 5507,
	'browsecat_korean_movies': 5685,
	'browsecat_dramas': 5763,
	'browsecat_middle_eastern_movies': 5875,
	'browsecat_movies_for_ages_2_to_4': 6218,
	'browsecat_foreign_scifi_fantasy': 6485,
	'browsecat_comedies': 6548,
	'browsecat_political_dramas': 6616,
	'browsecat_martial_arts_boxing_wrestling': 6695,
	'browsecat_anime_series': 6721,
	'browsecat_movies_for_ages_0_to_2': 6796,
	'browsecat_documentaries': 6839,
	'browsecat_crime_dramas': 6889,
	'browsecat_scifi_adventure': 6926,
	'browsecat_movies_for_ages_11_to_12': 6962,
	'browsecat_satanic_stories': 6998,
	'browsecat_political_documentaries': 7018,
	'browsecat_independent_movies': 7077,
	'browsecat_romantic_foreign_movies': 7153,
	'browsecat_sports_dramas': 7243,
	'browsecat_anime': 7424,
	'browsecat_adventures': 7442,
	'browsecat_foreign_movies': 7462,
	'browsecat_film_noir': 7687,
	'browsecat_westerns': 7700,
	'browsecat_italian_movies': 8221,
	'browsecat_foreign_gay_lesbian_movies': 8243,
	'browsecat_slasher_and_serial_killer_movies': 8646,
	'browsecat_foreign_horror_movies': 8654,
	'browsecat_horror_movies': 8711,
	'browsecat_romantic_movies': 8883,
	'browsecat_thrillers': 8933,
	'browsecat_martial_arts_movies': 8985,
	'browsecat_spy_thrillers': 9147,
	'browsecat_southeast_asian_movies': 9196,
	'browsecat_scandinavian_movies': 9292,
	'browsecat_teen_dramas': 9299,
	'browsecat_animes_comedies': 9302,
	'browsecat_anime_comedies': 9302,
	'browsecat_sports_fitness': 9327,
	'browsecat_urban_dance_concerts': 9472,
	'browsecat_crime_action_adventure': 9584,
	'browsecat_screwball_comedies': 9702,
	'browsecat_fantasy_movies': 9744,
	'browsecat_reality_tv': 9833,
	'browsecat_crime_documentaries': 9875,
	'browsecat_romantic_independent_movies': 9916,
	'browsecat_mysteries': 9994,
	'browsecat_religious_documentaries': 10005,
	'browsecat_movies_based_on_childrens_books': 10056,
	'browsecat_tv_documentaries': 10105,
	'browsecat_comic_book_and_superhero_movies': 10118,
	'browsecat_slapstick_comedies': 10256,
	'browsecat_jazz_easy_listening': 10271,
	'browsecat_foreign_thrillers': 10306,
	'browsecat_tv_comedies': 10375,
	'browsecat_japanese_movies': 10398,
	'browsecat_indian_movies': 10463,
	'browsecat_crime_thrillers': 10499,
	'browsecat_political_thrillers': 10504,
	'browsecat_dutch_movies': 10606,
	'browsecat_education_for_kids': 10659,
	'browsecat_tv_action_adventure': 10673,
	'browsecat_anime_horror': 10695,
	'browsecat_spy_action_adventure': 10702,
	'browsecat_latin_music': 10741,
	'browsecat_british_movies': 10757,
	'browsecat_cult_horror_movies': 10944,
	'browsecat_scifi_thrillers': 11014,
	'browsecat_experimental_movies': 11079,
	'browsecat_supernatural_thrillers': 11140,
	'browsecat_anime_fantasy': 11146,
	'browsecat_tv_cartoons': 11177,
	'browsecat_standup_comedy': 11559,
	'browsecat_standup_comedies': 11559,
	'browsecat_russian_movies': 11567,
	'browsecat_tv_dramas': 11714,
	'browsecat_independent_action_adventure': 11804,
	'browsecat_foreign_action_adventure': 11828,
	'browsecat_adult_animation': 11881,
	'browsecat_baseball_movies': 12339,
	'browsecat_boxing_movies': 12443,
	'browsecat_soccer_movies': 12549,
	'browsecat_basketball_movies': 12762,
	'browsecat_football_movies': 12803,
	'browsecat_musicals_comedies': 13335,
	'browsecat_musicals': 13335,
	'browsecat_showbiz_musicals': 13573,
	'browsecat_hijacking_movies': 20541,
	'browsecat_military_tv_shows': 25804,
	'browsecat_crime_tv_shows': 26146,
	'browsecat_kids_tv': 27346,
	'browsecat_art_house_movies': 29764,
	'browsecat_classic_dramas': 29809,
	'browsecat_classic_romantic_movies': 31273,
	'browsecat_classic_movies': 31574,
	'browsecat_classic_comedies': 31694,
	'browsecat_gangster_movies': 31851,
	'browsecat_classic_musical_comedy': 32392,
	'browsecat_classic_musicals': 32392,
	'browsecat_classic_foreign_movies': 32473,
	'browsecat_steamy_romantic_movies': 35800,
	'browsecat_quirky_romance': 36103,
	'browsecat_supernatural_horror_movies': 42023,
	'browsecat_action_comedies': 43040,
	'browsecat_action_thrillers': 43048,
	'browsecat_deep_sea_horror_movies': 45028,
	'browsecat_classic_tv_shows': 46553,
	'browsecat_classic_action_adventure': 46576,
	'browsecat_classic_thrillers': 46588,
	'browsecat_classic_scifi_fantasy': 47147,
	'browsecat_classic_westerns': 47465,
	'browsecat_classic_war_movies': 48744,
	'browsecat_family_features': 51056,
	'browsecat_british_tv_shows': 52117,
	'browsecat_teen_screams': 52147,
	'browsecat_science_nature': 52780,
	'browsecat_faith_spirituality_movies': 52804,
	'browsecat_kids_music': 52843,
	'browsecat_epics': 52858,
	'browsecat_silent_movies': 53310,
	'browsecat_stage_musicals': 55774,
	'browsecat_spanish_movies': 58741,
	'browsecat_irish_movies': 58750,
	'browsecat_french_movies': 58807,
	'browsecat_german_movies': 58886,
	'browsecat_disney_musicals': 59433,
	'browsecat_teen_tv_shows': 60951,
	'browsecat_greek_movies': 61115,
	'browsecat_new_zealand_movies': 63782,
	'browsecat_disney': 67673,
	'browsecat_korean_tv_shows': 67879,
	'browsecat_food_travel': 72436,
	'browsecat_cult_tv_shows': 74652,
	'browsecat_zombie_horror_movies': 75405,
	'browsecat_vampire_horror_movies': 75804,
	'browsecat_werewolf_horror_movies': 75930,
	'browsecat_asian_action_movies': 77232,
	'browsecat_tv_horror': 83059,
	'browsecat_horror_comedies': 89585,
	'browsecat_horror_comedy': 89585,
	'browsecat_music_concert_documentaries': 90361,
	'browsecat_romantic_favorites': 502675,
	'browsecat_turkish_movies': 1133133,
	'browsecat_familyfriendly_christmas_films': 1394522,
	'browsecat_romantic_christmas_films': 1394527,
	'browsecat_christmas_children_family_films': 1474017,
	'browsecat_feelgood_christmas_children_family_films': 1475066,
	'browsecat_goofy_christmas_children_family_films': 1475071,
	'browsecat_christmas_children_family_films_from_the_1990s': 1476024,
	'browsecat_christmas_children_family_films_for_ages_5_to_7': 1477201,
	'browsecat_christmas_children_family_films_for_ages_8_to_10': 1477204,
	'browsecat_christmas_children_family_films_for_ages_11_to_12': 1477206,
	'browsecat_european_christmas_children_family_films': 1527063,
	'browsecat_british_christmas_children_family_films': 1527064,
	'browsecat_canadian_christmas_children_family_films': 1721544
};