var error_detected = false;
var error_message = '';
var error_count = 0;
var error_reload = false;

// ------------------------
// Browser handler
// ------------------------

var browser = 'unknown';
var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime) && !(navigator.userAgent.indexOf('Edg') != -1) && !(navigator.userAgent.indexOf(' OPR/') != -1);
var isEdgeChromium = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime) && (navigator.userAgent.indexOf('Edg') != -1) && !(navigator.userAgent.indexOf(' OPR/') != -1);
var isFirefox = typeof InstallTrigger !== 'undefined';
var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || (navigator.userAgent.indexOf(' OPR/') != -1);

if (isChrome) {
    browser = 'chrome';
} else if (isEdgeChromium) {
    browser = 'edge';
} else if (isFirefox) {
    browser = 'firefox';
} else if (isOpera) {
    browser = 'opera';
}

function generate_extension() {
    if (!isChrome && !isEdgeChromium && !isFirefox && !isOpera) {
        // Unsupported browser
        console.error('ERROR: Unsupported browser running extension.');
    }
}

var extension = chrome;

var extension_runtime = extension.runtime;
var extension_browserAction = extension.browserAction;
var extension_tabs = extension.tabs;
var extension_manifest = extension.manifest;
var extension_devtools = extension.devtools;
var extension_windows = extension.windows;
var extension_extension = extension.extension;
var extension_storage = extension.storage;
var extension_management = extension.management;
var extension_i18n = extension.i18n;
var extension_manifest = extension_runtime.getManifest();
var extension_permissions = extension.permissions;

// ------------------------
// Environment handler
// ------------------------

var environment = 'developement';
var isDev = true;
var isTest = false;
var isProd = false;
var isSimulated = false;

// As there is no other way to find out if unpacked extension is used on Firefox, we have to specify IDs for production extensions
// Note: in non Firefox extensions 'extension_manifest.update_url == null' used to work to identify development environment
var extension_id = extension_runtime.id;
var prod_extension_list = [
    'gjcgfkhgpaccjpjokgpekpgpphgaanej', // Chrome
    'koafamhknckjfgdfikmicbjebhmjgkgh', // Edge
    '{d197a819-709b-4352-8cd4-f87e11300617}', // Firefox
    'bjodcabipakniikfjfnfjbpeogbiijol' // Opera
];
// Opera won't accept multiple extensions with same name, Firefox will just block any two same/similar extensions from same author
// Edge takes weeks to publish so there is no point in making a test version, seems like Chrome test should be fine for now
var test_extension_list = [
    'fpfdmkieoaokhgmodionpbiifonkccnh' // Chrome
];

function determine_environment() {
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
}

determine_environment();

// ------------------------
// Language handler
// ------------------------

function lang_generate() {
    var lang_prepare = {};
    for (i = 0; i < lang_keys.length; i++) {
        var message = lang_dnf_error;
        try {
            message = extension_i18n.getMessage(lang_keys[i]);
        } catch (e) {
            console.error('ERROR: Unable to load translation of key \'' + lang_keys[i] + '\'.');
        }
        lang_prepare[lang_keys[i]] = message;
    }
    return lang_prepare;
}

function getLang(key) {
    try {
        var value = lang[key];
        if (value !== undefined && value != '') {
            return lang[key];
        } else {
            log('error', '', getLang('lang_key_missing'), key);
            return '??? - ' + key;
        }
    } catch (e) {
        log('error', '', getLang('lang_key_missing'), key);
        return '??? - ' + key;
    }
}

// Easy way to generate:
//   1. Go to https://jqplay.org/
//   2. Paste '[keys[]]' into Filter field
//   3. Paste messages.json into JSON field
//   4. Copy contents of Result field
var lang_keys = [
    'adjusting_stored_data',
    'applied_version',
    'assistant_disabled',
    'assistant_enabled',
    'browsecat_action_adventure',
    'browsecat_action_comedies',
    'browsecat_action_scifi_fantasy',
    'browsecat_action_thrillers',
    'browsecat_adult_animation',
    'browsecat_adventures',
    'browsecat_african_movies',
    'browsecat_alien_scifi',
    'browsecat_animal_tales',
    'browsecat_anime',
    'browsecat_anime_action',
    'browsecat_anime_comedies',
    'browsecat_anime_dramas',
    'browsecat_anime_fantasy',
    'browsecat_anime_features',
    'browsecat_anime_horror',
    'browsecat_anime_scifi',
    'browsecat_anime_series',
    'browsecat_animes_comedies',
    'browsecat_army_dramas',
    'browsecat_art_house_movies',
    'browsecat_asian_action_movies',
    'browsecat_australian_movies',
    'browsecat_baseball_movies',
    'browsecat_basketball_movies',
    'browsecat_belgian_movies',
    'browsecat_biographical_documentaries',
    'browsecat_biographical_dramas',
    'browsecat_boxing_movies',
    'browsecat_british_christmas_children_family_films',
    'browsecat_british_movies',
    'browsecat_british_tv_shows',
    'browsecat_canadian_christmas_children_family_films',
    'browsecat_children_family_movies',
    'browsecat_chinese_movies',
    'browsecat_christmas_children_family_films',
    'browsecat_christmas_children_family_films_for_ages_11_to_12',
    'browsecat_christmas_children_family_films_for_ages_5_to_7',
    'browsecat_christmas_children_family_films_for_ages_8_to_10',
    'browsecat_christmas_children_family_films_from_the_1990s',
    'browsecat_classic_action_adventure',
    'browsecat_classic_comedies',
    'browsecat_classic_dramas',
    'browsecat_classic_foreign_movies',
    'browsecat_classic_movies',
    'browsecat_classic_musical_comedy',
    'browsecat_classic_musicals',
    'browsecat_classic_romantic_movies',
    'browsecat_classic_scifi_fantasy',
    'browsecat_classic_thrillers',
    'browsecat_classic_tv_shows',
    'browsecat_classic_war_movies',
    'browsecat_classic_westerns',
    'browsecat_comedies',
    'browsecat_comic_book_and_superhero_movies',
    'browsecat_country_westernfolk',
    'browsecat_crime_action_adventure',
    'browsecat_crime_documentaries',
    'browsecat_crime_dramas',
    'browsecat_crime_thrillers',
    'browsecat_crime_tv_shows',
    'browsecat_cult_horror_movies',
    'browsecat_cult_scifi_fantasy',
    'browsecat_cult_tv_shows',
    'browsecat_dark_comedies',
    'browsecat_deep_sea_horror_movies',
    'browsecat_disney',
    'browsecat_disney_musicals',
    'browsecat_documentaires_spirituels',
    'browsecat_documentaries',
    'browsecat_dramas',
    'browsecat_dramas_based_on_books',
    'browsecat_dramas_based_on_real_life',
    'browsecat_dutch_movies',
    'browsecat_eastern_european_movies',
    'browsecat_education_for_kids',
    'browsecat_epics',
    'browsecat_european_christmas_children_family_films',
    'browsecat_experimental_movies',
    'browsecat_faith_spirituality_movies',
    'browsecat_family_features',
    'browsecat_familyfriendly_christmas_films',
    'browsecat_fantasy_movies',
    'browsecat_feelgood_christmas_children_family_films',
    'browsecat_film_noir',
    'browsecat_food_travel',
    'browsecat_football_movies',
    'browsecat_foreign_action_adventure',
    'browsecat_foreign_comedies',
    'browsecat_foreign_documentaries',
    'browsecat_foreign_dramas',
    'browsecat_foreign_gay_lesbian_movies',
    'browsecat_foreign_horror_movies',
    'browsecat_foreign_movies',
    'browsecat_foreign_scifi_fantasy',
    'browsecat_foreign_thrillers',
    'browsecat_french_movies',
    'browsecat_gangster_movies',
    'browsecat_german_movies',
    'browsecat_goofy_christmas_children_family_films',
    'browsecat_greek_movies',
    'browsecat_hijacking_movies',
    'browsecat_historical_documentaries',
    'browsecat_horror_comedies',
    'browsecat_horror_comedy',
    'browsecat_horror_movies',
    'browsecat_independent_action_adventure',
    'browsecat_independent_comedies',
    'browsecat_independent_dramas',
    'browsecat_independent_movies',
    'browsecat_independent_thrillers',
    'browsecat_indian_movies',
    'browsecat_irish_movies',
    'browsecat_italian_movies',
    'browsecat_japanese_movies',
    'browsecat_jazz_easy_listening',
    'browsecat_kids_music',
    'browsecat_kids_tv',
    'browsecat_korean_movies',
    'browsecat_korean_tv_shows',
    'browsecat_late_night_comedies',
    'browsecat_latin_american_movies',
    'browsecat_latin_music',
    'browsecat_lgbtq_dramas',
    'browsecat_martial_arts_boxing_wrestling',
    'browsecat_martial_arts_movies',
    'browsecat_middle_eastern_movies',
    'browsecat_military_action_adventure',
    'browsecat_military_documentaries',
    'browsecat_military_tv_shows',
    'browsecat_miniseries',
    'browsecat_mockumentaries',
    'browsecat_monster_movies',
    'browsecat_movies_based_on_childrens_books',
    'browsecat_movies_for_ages_0_to_2',
    'browsecat_movies_for_ages_11_to_12',
    'browsecat_movies_for_ages_2_to_4',
    'browsecat_movies_for_ages_5_to_7',
    'browsecat_movies_for_ages_8_to_10',
    'browsecat_music',
    'browsecat_music_concert_documentaries',
    'browsecat_musicals',
    'browsecat_musicals_comedies',
    'browsecat_mysteries',
    'browsecat_new_zealand_movies',
    'browsecat_political_comedies',
    'browsecat_political_documentaries',
    'browsecat_political_dramas',
    'browsecat_political_thrillers',
    'browsecat_psychological_thrillers',
    'browsecat_quirky_romance',
    'browsecat_reality_tv',
    'browsecat_religious_documentaries',
    'browsecat_rock_pop_concerts',
    'browsecat_romantic_christmas_films',
    'browsecat_romantic_comedies',
    'browsecat_romantic_dramas',
    'browsecat_romantic_favorites',
    'browsecat_romantic_foreign_movies',
    'browsecat_romantic_independent_movies',
    'browsecat_romantic_movies',
    'browsecat_romantical_dramas',
    'browsecat_russian_movies',
    'browsecat_satanic_stories',
    'browsecat_satires',
    'browsecat_scandinavian_movies',
    'browsecat_science_nature',
    'browsecat_science_navature_documentaries',
    'browsecat_scifi_adventure',
    'browsecat_scifi_dramas',
    'browsecat_scifi_fantasy',
    'browsecat_scifi_horror_movies',
    'browsecat_scifi_thrillers',
    'browsecat_screwball_comedies',
    'browsecat_showbiz_dramas',
    'browsecat_showbiz_musicals',
    'browsecat_silent_movies',
    'browsecat_slapstick_comedies',
    'browsecat_slasher_and_serial_killer_movies',
    'browsecat_soccer_movies',
    'browsecat_social_cultural_documentaries',
    'browsecat_social_issues_dramas',
    'browsecat_southeast_asian_movies',
    'browsecat_spanish_movies',
    'browsecat_sports_comedies',
    'browsecat_sports_documentaries',
    'browsecat_sports_dramas',
    'browsecat_sports_fitness',
    'browsecat_sports_movies',
    'browsecat_spy_action_adventure',
    'browsecat_spy_thrillers',
    'browsecat_stage_musicals',
    'browsecat_standup_comedies',
    'browsecat_standup_comedy',
    'browsecat_steamy_romantic_movies',
    'browsecat_steamy_thrillers',
    'browsecat_supernatural_horror_movies',
    'browsecat_supernatural_thrillers',
    'browsecat_teen_comedies',
    'browsecat_teen_dramas',
    'browsecat_teen_screams',
    'browsecat_teen_tv_shows',
    'browsecat_thrillers',
    'browsecat_travel_adventure_documentaries',
    'browsecat_turkish_movies',
    'browsecat_tv_action_adventure',
    'browsecat_tv_cartoons',
    'browsecat_tv_comedies',
    'browsecat_tv_documentaries',
    'browsecat_tv_dramas',
    'browsecat_tv_horror',
    'browsecat_tv_mysteries',
    'browsecat_tv_scifi_fantasy',
    'browsecat_tv_show',
    'browsecat_urban_dance_concerts',
    'browsecat_vampire_horror_movies',
    'browsecat_werewolf_horror_movies',
    'browsecat_westerns',
    'browsecat_world_music_concerts',
    'browsecat_zombie_horror_movies',
    'button_debug',
    'button_default',
    'button_reload',
    'button_reset',
    'button_reset_bindings',
    'button_reset_debug',
    'button_reset_video',
    'cfg_autoDisableKids_description',
    'cfg_autoDisableKids_name',
    'cfg_bubbleHideDelay_description',
    'cfg_bubbleHideDelay_name',
    'cfg_changed',
    'cfg_controlsSwitchTimer_description',
    'cfg_controlsSwitchTimer_name',
    'cfg_debugControlsSwitchTimer_description',
    'cfg_debugControlsSwitchTimer_name',
    'cfg_debug_description',
    'cfg_debug_name',
    'cfg_devToolsConfigLoadTimer_description',
    'cfg_devToolsConfigLoadTimer_name',
    'cfg_devToolsRefreshTimer_description',
    'cfg_devToolsRefreshTimer_name',
    'cfg_elementHandlerTimer_description',
    'cfg_elementHandlerTimer_name',
    'cfg_enableVideoFeatures_description',
    'cfg_enableVideoFeatures_name',
    'cfg_environmentUpdateTimer_description',
    'cfg_environmentUpdateTimer_name',
    'cfg_errorExtensionReloadDelay_description',
    'cfg_errorExtensionReloadDelay_name',
    'cfg_exitPlayerKey_description',
    'cfg_exitPlayerKey_name',
    'cfg_forceReloadDelay_description',
    'cfg_forceReloadDelay_name',
    'cfg_hideDisliked_description',
    'cfg_hideDisliked_name',
    'cfg_wheelVolume_description',
    'cfg_wheelVolume_name',
    'cfg_hideSpoilersObjects_description',
    'cfg_hideSpoilersObjects_name',
    'cfg_hideSpoilers_description',
    'cfg_hideSpoilers_name',
    'cfg_revealSpoilers_description',
    'cfg_revealSpoilers_name',
    'cfg_hideSubtitlesKey_description',
    'cfg_hideSubtitlesKey_name',
    'cfg_highlightSubtitles_description',
    'cfg_highlightSubtitles_name',
    'cfg_injectorTimer_description',
    'cfg_injectorTimer_name',
    'cfg_keepHistory_description',
    'cfg_keepHistory_name',
    'cfg_keyEventProcessingDelay_description',
    'cfg_keyEventProcessingDelay_name',
    'cfg_load_timedout',
    'cfg_loaded',
    'cfg_loading',
    'cfg_loadingTimeLimit_description',
    'cfg_loadingTimeLimit_name',
    'cfg_logLevel_description',
    'cfg_logLevel_name',
    'cfg_netflixAssistantTimer_description',
    'cfg_netflixAssistantTimer_name',
    'cfg_netflixRatingsTimer_description',
    'cfg_netflixRatingsTimer_name',
    'cfg_nextEpisodeKey_description',
    'cfg_nextEpisodeKey_name',
    'cfg_nextEpisodeStopMovies_description',
    'cfg_nextEpisodeStopMovies_name',
    'cfg_nextEpisodeStopSeries_description',
    'cfg_nextEpisodeStopSeries_name',
    'cfg_nextEpisode_description',
    'cfg_nextEpisode_name',
    'cfg_nextTitleDelayLimit_description',
    'cfg_nextTitleDelayLimit_name',
    'cfg_omdbApi_description',
    'cfg_omdbApi_name',
    'cfg_pageReloadTimer_description',
    'cfg_pageReloadTimer_name',
    'cfg_pauseOnBlur_description',
    'cfg_pauseOnBlur_name',
    'cfg_playOnFocus_description',
    'cfg_playOnFocus_name',
    'cfg_playPauseButtonDelay_description',
    'cfg_playPauseButtonDelay_name',
    'cfg_prevEpisodeKey_description',
    'cfg_prevEpisodeKey_name',
    'cfg_randomMovieKey_description',
    'cfg_randomMovieKey_name',
    'cfg_ratingsAnchors_description',
    'cfg_ratingsAnchors_name',
    'cfg_ratingsTilePosition_description',
    'cfg_ratingsTilePosition_name',
    'cfg_ratingsTileSize_description',
    'cfg_ratingsTileSize_name',
    'cfg_ratingsTileTextAlign_description',
    'cfg_ratingsTileTextAlign_name',
    'cfg_ratingsWikidataAnchors_description',
    'cfg_ratingsWikidataAnchors_name',
    'cfg_saved',
    'cfg_saving',
    'cfg_showCategories_description',
    'cfg_showCategories_name',
    'cfg_showRatings_description',
    'cfg_showRatings_name',
    'cfg_simulateProduction_description',
    'cfg_simulateProduction_name',
    'cfg_skipInterrupter_description',
    'cfg_skipInterrupter_name',
    'cfg_skipIntros_description',
    'cfg_skipIntros_name',
    'cfg_skipRecaps_description',
    'cfg_skipRecaps_name',
    'cfg_skippingPreventionTimer_description',
    'cfg_skippingPreventionTimer_name',
    'cfg_spoilersBlurAmount_description',
    'cfg_spoilersBlurAmount_name',
    'cfg_startupTimer_description',
    'cfg_startupTimer_name',
    'cfg_stuckTimeLimit_description',
    'cfg_stuckTimeLimit_name',
    'cfg_timeFromLoadLimit_description',
    'cfg_timeFromLoadLimit_name',
    'cfg_toggleAssistantKey_description',
    'cfg_toggleAssistantKey_name',
    'cfg_trailerVideoStop_description',
    'cfg_trailerVideoStop_name',
    'cfg_videoBrightness_description',
    'cfg_videoBrightness_name',
    'cfg_videoContrast_description',
    'cfg_videoContrast_name',
    'cfg_videoGrayscale_description',
    'cfg_videoGrayscale_name',
    'cfg_videoHue_description',
    'cfg_videoHue_name',
    'cfg_videoInvert_description',
    'cfg_videoInvert_name',
    'cfg_videoSaturation_description',
    'cfg_videoSaturation_name',
    'cfg_videoSepia_description',
    'cfg_videoSepia_name',
    'cfg_videoSpeedRate_description',
    'cfg_videoSpeedRate_name',
    'changelog',
    'changelog_fetch_failed',
    'confirm_reset',
    'data_loading',
    'debug_message',
    'debug_message_without_access',
    'debug_type_assistant_loop',
    'debug_type_skip_button_text',
    'debug_type_background',
    'debug_type_configuration',
    'debug_type_core_errors',
    'debug_type_dom_activities',
    'debug_type_dom_events',
    'debug_type_environment',
    'debug_type_fractions_counter',
    'debug_type_init',
    'debug_type_keypress',
    'debug_type_wheelturn',
    'debug_type_main_loop',
    'debug_type_mouse_simulation',
    'debug_type_options_generation',
    'debug_type_overflow',
    'debug_type_ratings',
    'debug_type_startup',
    'debug_variables_nodata',
    'debug_variables_noloop',
    'debug_warning_notice',
    'description',
    'description_hidden',
    'developed_by',
    'developer',
    'devtools_loading_error',
    'devtools_page_loading',
    'devtools_pause',
    'devtools_resume',
    'devtools_show_content',
    'devtools_tabs_error',
    'disclaimer',
    'disliked_hidden',
    'dnf_error',
    'donate',
    'source',
    'github',
    'dummy',
    'error_core',
    'error_core_assistant_delay',
    'error_message',
    'error_reload',
    'extension_autoinject_failed',
    'extension_disable',
    'extension_enable',
    'extension_feature_reset_cfg',
    'extension_feature_reset_default',
    'extension_install',
    'extension_update',
    'extension_version',
    'extension_webstore',
    'failed',
    'feature_tempHideSubtitles',
    'feature_videoBrightness',
    'feature_videoContrast',
    'feature_videoGrayscale',
    'feature_videoHue',
    'feature_videoInvert',
    'feature_videoSaturation',
    'feature_videoSepia',
    'feature_videoSpeedRate',
    'features',
    'fireworks_start',
    'founded_by',
    'founder',
    'gained_focus_play',
    'help_wikidata',
    'hideSpoilersObjects_type_description',
    'hideSpoilersObjects_type_episode_name',
    'hideSpoilersObjects_type_episode_picture',
    'hideSpoilersObjects_type_runner_thumbnail',
    'highlightSubtitles_type_background',
    'highlightSubtitles_type_disabled',
    'highlightSubtitles_type_hidden',
    'highlightSubtitles_type_shadow',
    'info_message',
    'lang_key_missing',
    'last_version',
    'logLevel_type_debug',
    'logLevel_type_error',
    'logLevel_type_info',
    'logLevel_type_none',
    'logLevel_type_output',
    'logLevel_type_unknown',
    'logLevel_type_warn',
    'log_type_unknown',
    'loop_overflow',
    'lost_focus_pause',
    'menu_about',
    'menu_api',
    'menu_assistant',
    'menu_bindings',
    'menu_debug',
    'menu_ratings',
    'menu_statistics',
    'menu_storage',
    'menu_timers',
    'menu_video',
    'name',
    'netflix_changes',
    'next_episode',
    'next_video_delay',
    'next_video_stop',
    'no_features_available',
    'option_unknown',
    'options',
    'options_default',
    'options_max',
    'options_min',
    'options_off',
    'options_open',
    'options_title',
    'output_message',
    'page_reload',
    'page_reload_cancelled',
    'page_reload_delay',
    'page_reload_delay_info',
    'patreon',
    'pauseOnBlur_type_disabled',
    'pauseOnBlur_type_high',
    'pauseOnBlur_type_low',
    'paypal',
    'prev_episode_manual',
    'prev_episode_manual_no_history',
    'previous_version',
    'provided_by',
    'provider',
    'rand_video_failed_play',
    'rand_video_failed_select',
    'rand_video_success',
    'rate_extension',
    'rating_daily_limit',
    'rating_display_error',
    'rating_id_not_found',
    'rating_imdb',
    'rating_invalid_key',
    'rating_meta',
    'rating_next_refresh',
    'rating_no_rating',
    'rating_rt',
    'ratingsTilePosition_type_bottom_center',
    'ratingsTilePosition_type_bottom_left',
    'ratingsTilePosition_type_bottom_right',
    'ratingsTilePosition_type_middle_center',
    'ratingsTilePosition_type_middle_left',
    'ratingsTilePosition_type_middle_right',
    'ratingsTilePosition_type_top_center',
    'ratingsTilePosition_type_top_left',
    'ratingsTilePosition_type_top_right',
    'ratingsTileTextAlign_type_center',
    'ratingsTileTextAlign_type_left',
    'ratingsTileTextAlign_type_right',
    'ratingsTileTextAlign_type_same_as_position',
    'ratings_error_message',
    'ratings_imdb_id_not_found',
    'ratings_no_data_omdb_api',
    'ratings_no_data_wikidata',
    'ratings_reason',
    'ratings_unknown_error',
    'ratings_wiki_missing_imdb_id',
    'ratings_wiki_missing_netflix_id',
    'second',
    'second_less5',
    'seconds',
    'short_name',
    'show_debug_variables_hint',
    'skipping_interrupter',
    'skipping_intro',
    'skipping_recap',
    'stat_actions',
    'stat_actions_count',
    'stat_actions_none',
    'stat_api_call',
    'stat_api_finished',
    'stat_api_invalid',
    'stat_api_error',
    'stat_api_limit',
    'stat_api_not_available',
    'stat_api_timeout',
    'stat_extension_actions',
    'stat_hideDisliked',
    'stat_wheelTurn',
    'stat_hideSpoilers',
    'stat_revealSpoilers',
    'stat_revealSpoilers',
    'stat_highlightSubtitles',
    'stat_keyBinding',
    'stat_wheelTurn',
    'stat_loaded_api',
    'stat_loaded_storage',
    'stat_nextEpisode',
    'stat_nextEpisodeStopMovies',
    'stat_nextEpisodeStopSeries',
    'stat_pauseOnBlur',
    'stat_playOnFocus',
    'stat_randomTitle',
    'stat_ratings',
    'stat_ratings_api_limit',
    'stat_ratings_expire_1w',
    'stat_ratings_expire_24h',
    'stat_ratings_general',
    'stat_ratings_states',
    'stat_ratings_total_size',
    'stat_ratings_total_stored',
    'stat_skipInterrupter',
    'stat_skipIntros',
    'stat_skipRecaps',
    'stat_storage',
    'stat_storage_extension',
    'stat_storage_local',
    'stat_storage_percentage',
    'stat_storage_size',
    'stat_storage_size_unknown',
    'stat_storage_type',
    'stat_trailerVideoStop',
    'stat_wiki_call',
    'stat_wikidata_error',
    'stat_wikidata_finished',
    'stat_wikidata_imdb_not_available',
    'stat_wikidata_not_available',
    'stat_wikidata_timeout',
    'status_text_broken',
    'status_text_disabled',
    'status_text_errors',
    'status_text_ok',
    'status_text_update',
    'success',
    'trailer_stopped',
    'unsupported_browser',
    'unsupported_cfg_type',
    'version',
    'version_changed',
    'version_changes',
    'versions_remove_variable',
    'versions_rename_localStorage',
    'versions_rename_variable',
    'versions_reset_value',
    'video_stuck',
    'warn_message',
    'wrong_configuration_type'
];

var lang_dnf_error = extension_i18n.getMessage('dnf_error');
var lang = lang_generate();
var locale = extension_i18n.getMessage('@@ui_locale');
var locale_iso = locale.split('_')[0];

// ------------------------
// Configuration
// ------------------------

var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
JSON.dateParser = function (key, value) {
    if (typeof value === 'string') {
        var match = reISO.exec(value);
        if (match) {
            return new Date(value);
        }
    }
    return value;
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function load_configuration(callback) {
    var conf_def = {};

    for (var key in cfg) {
        var type = cfg[key]['type'];
        var value = cfg[key]['def'];

        switch (type) {
            case 'array':
                value = JSON.stringify(value);
                break;
        }

        conf_def[key] = value.toString();
    }

    try {
        extension_storage.local.get(conf_def, function(conf) {
            log('debug', 'configuration', 'Default configuration:');
            log('debug', 'configuration', conf_def);

            for (var key in cfg) {
                var type = cfg[key]['type'];
                var value = cfg[key]['val'];

                switch (type) {
                    case 'number':
                    case 'range':
                        cfg[key]['val'] = Number(conf[key]);
                        break;
                    case 'bool':
                        if (typeof conf[key] == 'boolean') {
                            cfg[key]['val'] = conf[key];
                        } else {
                            cfg[key]['val'] = ((conf[key] == 'true') ? true : false);
                        }
                        break;
                    case 'array':
                        cfg[key]['val'] = JSON.parse(nvl(conf[key], '[]'), JSON.dateParser);
                        break;
                    default:
                        cfg[key]['val'] = conf[key];
                        break;
                }
            }

            log('debug', 'configuration', 'Loaded configuration:');
            log('debug', 'configuration', cfg);

            cfg_loaded = true;
            if (cfg_loading_end == cfg_loading_start) {
                cfg_loading_end = new Date();
            }

            if (cfg_changed) {
                log('info', '', getLang('cfg_changed'));
                cfg_changed = false;
            }

            if (typeof callback === 'function') {
                callback();
            }
        });
    } catch (e) {
        error_detected = true;
        error_message = 'load_configuration: ' + e.message;
    }
}

function save_configuration(callback) {
    var conf = {};

    for (var key in cfg) {
        var type = cfg[key]['type'];
        var value = cfg[key]['val'];

        switch (type) {
            case 'number':
            case 'range':
                // Get current value from options
                value = document.getElementById(key).value;
                // Validate input
                if (cfg[key]['min'] !== null) {
                    if (value < cfg[key]['min']) {
                        if (cfg[key]['off'] !== null) {
                            value = cfg[key]['off'];
                        } else {
                            value = cfg[key]['min'];
                        }
                    }
                }
                if (cfg[key]['max'] !== null) {
                    if (value > cfg[key]['max']) {
                        value = cfg[key]['max'];
                    }
                }
                // Insert validated value into options
                document.getElementById(key).value = value;
                break;
            case 'bool':
                // Get current value from options
                value = document.getElementById(key).checked;
                // Insert validated value into options
                document.getElementById(key).checked = value;
                break;
            case 'text':
                // Get current value from options
                value = document.getElementById(key).value;
                // Insert validated value into options
                document.getElementById(key).value = value;
                break;
            case 'api':
                // Get current value from options
                value = document.getElementById(key).value;
                if (value == '') {
                    value = cfg[key]['def'];
                }
                // Insert validated value into options
                document.getElementById(key).value = value;
                break;
            case 'select':
            case 'binding':
                // Get current value from options
                value = document.getElementById(key).value;
                // Insert validated value into options
                document.getElementById(key).value = value;
                break;
            case 'option':
                // Get current value from options
                value = document.getElementById(key).value;
                if (key == 'logLevel') {
                    value = Number(value);
                }
                // Validate input
                if (!cfg[key]['list'].includes(value)) {
                    value = cfg[key]['def'].toString();
                }
                // Insert validated value into options
                document.getElementById(key).value = value.toString();
                break;
            case 'array':
                // Get current value from options
                value = document.getElementById(key).value;
                // Convert to object
                value = nvl(value, '[]');
                value = JSON.parse(value, JSON.parseDate);
                // Validate input
                var new_value = [];
                for (var i = 0; i < value.length; i++) {
                    if (cfg[key]['list'].includes(value[i])) {
                        new_value.push(value[i]);
                    }
                }
                value = new_value;
                // Convert to string
                value = JSON.stringify(value);
                // Insert validated value into options
                document.getElementById(key).value = value;
                break;
        }

        // Add to list of cfg values that will be stored
        conf[key] = value.toString();
    }

    // Store values into storage
    try {
        extension_storage.local.set(conf, function() {

            log('debug', 'configuration', 'Saved configuration:');
            log('debug', 'configuration', conf);

            try {setStatus(getLang('cfg_saved'),'green',1500);} catch (e) {}
            load_configuration(callback);
            cfg_changed = true;
        });

    } catch (e) {
        error_detected = true;
        error_message = 'save_configuration: ' + e.message;
    }
}

var keybinds = [
    ['DISABLED',-1], // Extension value for disabled key binding
    ['A',65],
    ['B',66],
    ['C',67],
    //['D',68], // Netflix shortcut
    ['E',69],
    //['F',70], // Netflix shortcut
    ['G',71],
    ['H',72],
    ['I',73],
    ['J',74],
    ['K',75],
    //['L',76], // Netflix shortcut
    //['M',77], // Netflix shortcut
    ['N',78],
    ['O',79],
    ['P',80],
    ['Q',81],
    ['R',82],
    //['S',83], // Netflix shortcut
    ['T',84],
    ['U',85],
    ['V',86],
    ['W',87],
    ['X',88],
    ['Y',89],
    ['Z',90],
    ['1',49],
    ['2',50],
    ['3',51],
    ['4',52],
    ['5',53],
    ['6',54],
    ['7',55],
    ['8',56],
    ['9',57],
    ['0',48],
    ['+',107],
    ['-',109],
    ['*',106],
    //['/',111], // Firefox shortcut
    //['F1',112], // Chrome/Edge/Opera shortcut
    //['F2',113], // Edge shortcut
    //['F3',114], // Chrome/Firefox/Edge/Opera shortcut
    //['F4',115], // Edge shortcut
    //['F5',116], // Chrome/Firefox/Edge/Opera shortcut
    //['F6',117], // Edge shortcut
    //['F7',118], // Chrome/Firefox/Edge shortcut
    //['F8',119], // Opera shortcut
    ['F9',120],
    //['F10',121], // Firefox/Edge shortcut
    //['F11',122], // Chrome/Edge/Opera shortcut
    //['F12',123], // Chrome/Edge shortcut
    //['ARROWUP',38], // Netflix shortcut
    //['ARROWDOWN',40], // Netflix shortcut
    //['ARROWLEFT',37], // Netflix shortcut
    //['ARROWRIGHT',39], // Netflix shortcut
    //['ENTER',13], // Netflix shortcut
    //['SPACE',32], // Netflix shortcut
    //['BACKSPACE',8], // Chrome/Edge/Opera shortcut but seems to be disabled on Netflix, Firefox shortcut
    ['ESCAPE',27], // Netflix shortcut on tiles when shown details (maybe we shouldn't use it?)
    ['PAGEUP',33],
    ['PAGEDOWN',34],
    ['HOME',36],
    ['END',35],
    ['DELETE',46],
    ['PAUSE',19]
];

function init_configuration() {
    var cfg_order = {};
    cfg_order['assistant'] = 0;
    cfg_order['ratings'] = 0;
    cfg_order['video'] = 0;
    cfg_order['timers'] = 0;
    cfg_order['bindings'] = 0;
    cfg_order['storage'] = 0;
    cfg_order['api'] = 0;
    cfg_order['debug'] = 0;

    // Order of items here will be reflected on options page
    var conf = {
        'skipIntros' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : true,
            'def' : true,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_skipIntros_name'),
            'desc' : getLang('cfg_skipIntros_description')
        },
        'skipRecaps' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : true,
            'def' : true,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_skipRecaps_name'),
            'desc' : getLang('cfg_skipRecaps_description')
        },
        'skipInterrupter' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : true,
            'def' : true,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_skipInterrupter_name'),
            'desc' : getLang('cfg_skipInterrupter_description')
        },
        'nextEpisode' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : true,
            'def' : true,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_nextEpisode_name'),
            'desc' : getLang('cfg_nextEpisode_description')
        },
        'trailerVideoStop' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_trailerVideoStop_name'),
            'desc' : getLang('cfg_trailerVideoStop_description')
        },
        'hideDisliked' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_hideDisliked_name'),
            'desc' : getLang('cfg_hideDisliked_description')
        },
        'wheelVolume' : {
            'type' : 'range',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : 0.05,
            'def' : 0.05,
            'min' : 0,
            'max' : 0.1,
            'step' : 0.01,
            'off' : 0,
            'list': [],
            'name' : getLang('cfg_wheelVolume_name'),
            'desc' : getLang('cfg_wheelVolume_description')
        },
        'hideSpoilers' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_hideSpoilers_name'),
            'desc' : getLang('cfg_hideSpoilers_description')
        },
        'revealSpoilers' : {
            'type' : 'range',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : 1,
            'def' : 1,
            'min' : -1,
            'max' : 10,
            'step' : 1,
            'off' : -1,
            'list': [],
            'name' : getLang('cfg_revealSpoilers_name'),
            'desc' : getLang('cfg_revealSpoilers_description')
        },
        'spoilersBlurAmount' : {
            'type' : 'range',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : 5,
            'def' : 5,
            'min' : 5,
            'max' : 50,
            'step' : 1,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_spoilersBlurAmount_name'),
            'desc' : getLang('cfg_spoilersBlurAmount_description')
        },
        'hideSpoilersObjects' : {
            'type' : 'array',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : [],
            'def' : [
                'description',
                'runner_thumbnail'
            ],
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [
                'description',
                'episode_name',
                'episode_picture',
                'runner_thumbnail'
            ],
            'name' : getLang('cfg_hideSpoilersObjects_name'),
            'desc' : getLang('cfg_hideSpoilersObjects_description')
        },
        'highlightSubtitles' : {
            'type' : 'option',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : 'disabled',
            'def' : 'disabled',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : 'disabled',
            'list': [
                'hidden',
                'disabled',
                'shadow',
                'background'
            ],
            'name' : getLang('cfg_highlightSubtitles_name'),
            'desc' : getLang('cfg_highlightSubtitles_description')
        },
        'pauseOnBlur' : {
            'type' : 'option',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : 'disabled',
            'def' : 'disabled',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : 'disabled',
            'list': [
                'disabled',
                'low',
                'high'
            ],
            'name' : getLang('cfg_pauseOnBlur_name'),
            'desc' : getLang('cfg_pauseOnBlur_description')
        },
        'playOnFocus' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : true,
            'def' : true,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_playOnFocus_name'),
            'desc' : getLang('cfg_playOnFocus_description')
        },
        'showCategories' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : false  || isDev,
            'order' : cfg_order['assistant']++,
            'val' : true,
            'def' : true,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_showCategories_name'),
            'desc' : getLang('cfg_showCategories_description')
        },
        'nextTitleDelayLimit' : {
            'type' : 'range',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : 5,
            'def' : 5,
            'min' : -1,
            'max' : 15,
            'step' : 1,
            'off' : -1,
            'list': [],
            'name' : getLang('cfg_nextTitleDelayLimit_name'),
            'desc' : getLang('cfg_nextTitleDelayLimit_description')
        },
        'nextEpisodeStopMovies' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_nextEpisodeStopMovies_name'),
            'desc' : getLang('cfg_nextEpisodeStopMovies_description')
        },
        'nextEpisodeStopSeries' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_nextEpisodeStopSeries_name'),
            'desc' : getLang('cfg_nextEpisodeStopSeries_description')
        },
        'autoDisableKids' : {
            'type' : 'bool',
            'category' : 'assistant',
            'access' : true,
            'order' : cfg_order['assistant']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_autoDisableKids_name'),
            'desc' : getLang('cfg_autoDisableKids_description')
        },
        'showRatings' : {
            'type' : 'bool',
            'category' : 'ratings',
            'access' : true,
            'order' : cfg_order['ratings']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_showRatings_name'),
            'desc' : getLang('cfg_showRatings_description')
        },
        'ratingsAnchors' : {
            'type' : 'bool',
            'category' : 'ratings',
            'access' : true,
            'order' : cfg_order['ratings']++,
            'val' : true,
            'def' : true,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_ratingsAnchors_name'),
            'desc' : getLang('cfg_ratingsAnchors_description')
        },
        'ratingsWikidataAnchors' : {
            'type' : 'bool',
            'category' : 'ratings',
            'access' : true,
            'order' : cfg_order['ratings']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_ratingsWikidataAnchors_name'),
            'desc' : getLang('cfg_ratingsWikidataAnchors_description')
        },
        'ratingsTileSize' : {
            'type' : 'range',
            'category' : 'ratings',
            'access' : true,
            'order' : cfg_order['ratings']++,
            'val' : 12,
            'def' : 12,
            'min' : 8,
            'max' : 20,
            'step' : 1,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_ratingsTileSize_name'),
            'desc' : getLang('cfg_ratingsTileSize_description')
        },
        'ratingsTilePosition' : {
            'type' : 'option',
            'category' : 'ratings',
            'access' : true,
            'order' : cfg_order['ratings']++,
            'val' : 'top_left',
            'def' : 'top_left',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [
                'top_left',
                'top_center',
                'top_right',
                'middle_left',
                'middle_center',
                'middle_right',
                'bottom_left',
                'bottom_center',
                'bottom_right'
            ],
            'name' : getLang('cfg_ratingsTilePosition_name'),
            'desc' : getLang('cfg_ratingsTilePosition_description')
        },
        'ratingsTileTextAlign' : {
            'type' : 'option',
            'category' : 'ratings',
            'access' : true,
            'order' : cfg_order['ratings']++,
            'val' : 'left',
            'def' : 'left',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [
                'left',
                'center',
                'right',
                'same_as_position'
            ],
            'name' : getLang('cfg_ratingsTileTextAlign_name'),
            'desc' : getLang('cfg_ratingsTileTextAlign_description')
        },
        'enableVideoFeatures' : {
            'type' : 'bool',
            'category' : 'video',
            'access' : true,
            'order' : cfg_order['video']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_enableVideoFeatures_name'),
            'desc' : getLang('cfg_enableVideoFeatures_description')
        },
        'videoSpeedRate' : {
            'type' : 'range',
            'category' : 'video',
            'access' : true,
            'order' : cfg_order['video']++,
            'val' : 1,
            'def' : 1,
            'min' : 0.25,
            'max' : 4,
            'step' : 0.01,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_videoSpeedRate_name'),
            'desc' : getLang('cfg_videoSpeedRate_description')
        },
        'videoBrightness' : {
            'type' : 'range',
            'category' : 'video',
            'access' : (false && !isEdgeChromium) || isDev,
            'order' : cfg_order['video']++,
            'val' : 100,
            'def' : 100,
            'min' : 0,
            'max' : 500,
            'step' : 1,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_videoBrightness_name'),
            'desc' : getLang('cfg_videoBrightness_description')
        },
        'videoContrast' : {
            'type' : 'range',
            'category' : 'video',
            'access' : (false && !isEdgeChromium) || isDev,
            'order' : cfg_order['video']++,
            'val' : 100,
            'def' : 100,
            'min' : 0,
            'max' : 500,
            'step' : 1,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_videoContrast_name'),
            'desc' : getLang('cfg_videoContrast_description')
        },
        'videoGrayscale' : {
            'type' : 'range',
            'category' : 'video',
            'access' : (false && !isEdgeChromium) || isDev,
            'order' : cfg_order['video']++,
            'val' : 0,
            'def' : 0,
            'min' : 0,
            'max' : 100,
            'step' : 1,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_videoGrayscale_name'),
            'desc' : getLang('cfg_videoGrayscale_description')
        },
        'videoHue' : {
            'type' : 'range',
            'category' : 'video',
            'access' : (false && !isEdgeChromium) || isDev,
            'order' : cfg_order['video']++,
            'val' : 0,
            'def' : 0,
            'min' : 0,
            'max' : 360,
            'step' : 1,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_videoHue_name'),
            'desc' : getLang('cfg_videoHue_description')
        },
        'videoInvert' : {
            'type' : 'range',
            'category' : 'video',
            'access' : (false && !isEdgeChromium) || isDev,
            'order' : cfg_order['video']++,
            'val' : 0,
            'def' : 0,
            'min' : 0,
            'max' : 100,
            'step' : 1,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_videoInvert_name'),
            'desc' : getLang('cfg_videoInvert_description')
        },
        'videoSaturation' : {
            'type' : 'range',
            'category' : 'video',
            'access' : (false && !isEdgeChromium) || isDev,
            'order' : cfg_order['video']++,
            'val' : 100,
            'def' : 100,
            'min' : 0,
            'max' : 500,
            'step' : 1,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_videoSaturation_name'),
            'desc' : getLang('cfg_videoSaturation_description')
        },
        'videoSepia' : {
            'type' : 'range',
            'category' : 'video',
            'access' : (false && !isEdgeChromium) || isDev,
            'order' : cfg_order['video']++,
            'val' : 0,
            'def' : 0,
            'min' : 0,
            'max' : 100,
            'step' : 1,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_videoSepia_name'),
            'desc' : getLang('cfg_videoSepia_description')
        },
        'timeFromLoadLimit' : {
            'type' : 'range',
            'category' : 'timers',
            'access' : true,
            'order' : cfg_order['timers']++,
            'val' : 5,
            'def' : 5,
            'min' : 0,
            'max' : 60,
            'step' : 1,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_timeFromLoadLimit_name'),
            'desc' : getLang('cfg_timeFromLoadLimit_description')
        },
        'loadingTimeLimit' : {
            'type' : 'range',
            'category' : 'timers',
            'access' : true,
            'order' : cfg_order['timers']++,
            'val' : 5,
            'def' : 5,
            'min' : 0,
            'max' : 60,
            'step' : 1,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_loadingTimeLimit_name'),
            'desc' : getLang('cfg_loadingTimeLimit_description')
        },
        'stuckTimeLimit' : {
            'type' : 'range',
            'category' : 'timers',
            'access' : true,
            'order' : cfg_order['timers']++,
            'val' : 15,
            'def' : 15,
            'min' : -1,
            'max' : 60,
            'step' : 1,
            'off' : -1,
            'list': [],
            'name' : getLang('cfg_stuckTimeLimit_name'),
            'desc' : getLang('cfg_stuckTimeLimit_description')
        },
        'forceReloadDelay' : {
            'type' : 'range',
            'category' : 'timers',
            'access' : true,
            'order' : cfg_order['timers']++,
            'val' : 60,
            'def' : 60,
            'min' : 60,
            'max' : 600,
            'step' : 1,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_forceReloadDelay_name'),
            'desc' : getLang('cfg_forceReloadDelay_description')
        },
        'toggleAssistantKey' : {
            'type' : 'binding',
            'category' : 'bindings',
            'access' : true,
            'order' : cfg_order['bindings']++,
            'val' : 'T',
            'def' : 'T',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : 'DISABLED',
            'list': keybinds,
            'name' : getLang('cfg_toggleAssistantKey_name'),
            'desc' : getLang('cfg_toggleAssistantKey_description')
        },
        'hideSubtitlesKey' : {
            'type' : 'binding',
            'category' : 'bindings',
            'access' : true,
            'order' : cfg_order['bindings']++,
            'val' : 'H',
            'def' : 'H',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : 'DISABLED',
            'list': keybinds,
            'name' : getLang('cfg_hideSubtitlesKey_name'),
            'desc' : getLang('cfg_hideSubtitlesKey_description')
        },
        'exitPlayerKey' : {
            'type' : 'binding',
            'category' : 'bindings',
            'access' : true,
            'order' : cfg_order['bindings']++,
            'val' : 'ESCAPE',
            'def' : 'ESCAPE',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : 'DISABLED',
            'list': keybinds,
            'name' : getLang('cfg_exitPlayerKey_name'),
            'desc' : getLang('cfg_exitPlayerKey_description')
        },
        'prevEpisodeKey' : {
            'type' : 'binding',
            'category' : 'bindings',
            'access' : true,
            'order' : cfg_order['bindings']++,
            'val' : 'B',
            'def' : 'B',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : 'DISABLED',
            'list': keybinds,
            'name' : getLang('cfg_prevEpisodeKey_name'),
            'desc' : getLang('cfg_prevEpisodeKey_description')
        },
        'nextEpisodeKey' : {
            'type' : 'binding',
            'category' : 'bindings',
            'access' : true,
            'order' : cfg_order['bindings']++,
            'val' : 'N',
            'def' : 'N',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : 'DISABLED',
            'list': keybinds,
            'name' : getLang('cfg_nextEpisodeKey_name'),
            'desc' : getLang('cfg_nextEpisodeKey_description')
        },
        'randomMovieKey' : {
            'type' : 'binding',
            'category' : 'bindings',
            'access' : true,
            'order' : cfg_order['bindings']++,
            'val' : 'R',
            'def' : 'R',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : 'DISABLED',
            'list': keybinds,
            'name' : getLang('cfg_randomMovieKey_name'),
            'desc' : getLang('cfg_randomMovieKey_description')
        },
        'keepHistory' : {
            'type' : 'range',
            'category' : 'storage',
            'access' : true,
            'order' : cfg_order['storage']++,
            'val' : 100,
            'def' : 100,
            'min' : 1,
            'max' : 500,
            'step' : 1,
            'off' : 1,
            'list': [],
            'name' : getLang('cfg_keepHistory_name'),
            'desc' : getLang('cfg_keepHistory_description')
        },
        'omdbApi' : {
            'type' : 'api',
            'category' : 'api',
            'access' : true,
            'order' : cfg_order['api']++,
            'val' : 'DEFAULT',
            'def' : 'DEFAULT',
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_omdbApi_name'),
            'desc' : getLang('cfg_omdbApi_description')
        },
        'logLevel' : {
            'type' : 'option',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 2,
            'def' : 2,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [
                0, // Debug
                1, // Info
                2, // Output
                3, // Warn
                4, // Error
                99 // None
            ],
            'name' : getLang('cfg_logLevel_name'),
            'desc' : getLang('cfg_logLevel_description')
        },
        'debug' : {
            'type' : 'array',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : [],
            'def' : [
                'init',
                'overflow'
            ],
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [
                'init',
                'startup',
                'configuration',
                'environment',
                'options_generation',
                'main_loop',
                'core_errors',
                'dom_activities',
                'dom_events',
                'assistant_loop',
                'skip_button_text',
                'ratings',
                'overflow',
                'keypress',
                'wheelturn',
                'mouse_simulation',
                'fractions_counter',
                'background'
            ],
            'name' : getLang('cfg_debug_name'),
            'desc' : getLang('cfg_debug_description')
        },
        'simulateProduction' : {
            'type' : 'bool',
            'category' : 'debug',
            'access' : isDev || isTest || isSimulated,
            'order' : cfg_order['debug']++,
            'val' : false,
            'def' : false,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_simulateProduction_name'),
            'desc' : getLang('cfg_simulateProduction_description')
        },
        //-- CORE TIMERS START
        'startupTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 200,
            'def' : 200,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_startupTimer_name'),
            'desc' : getLang('cfg_startupTimer_description')
        },
        'injectorTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 200,
            'def' : 200,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_injectorTimer_name'),
            'desc' : getLang('cfg_injectorTimer_description')
        },
        'pageReloadTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 1000,
            'def' : 1000,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_pageReloadTimer_name'),
            'desc' : getLang('cfg_pageReloadTimer_description')
        },
        'errorExtensionReloadDelay' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 10000,
            'def' : 10000,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_errorExtensionReloadDelay_name'),
            'desc' : getLang('cfg_errorExtensionReloadDelay_description')
        },
        'environmentUpdateTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 500,
            'def' : 500,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_environmentUpdateTimer_name'),
            'desc' : getLang('cfg_environmentUpdateTimer_description')
        },
        'keyEventProcessingDelay' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 1000,
            'def' : 1000,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_keyEventProcessingDelay_name'),
            'desc' : getLang('cfg_keyEventProcessingDelay_description')
        },
        'netflixAssistantTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 100,
            'def' : 100,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_netflixAssistantTimer_name'),
            'desc' : getLang('cfg_netflixAssistantTimer_description')
        },
        'netflixRatingsTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 500,
            'def' : 500,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_netflixRatingsTimer_name'),
            'desc' : getLang('cfg_netflixRatingsTimer_description')
        },
        'elementHandlerTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 100,
            'def' : 100,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_elementHandlerTimer_name'),
            'desc' : getLang('cfg_elementHandlerTimer_description')
        },
        'bubbleHideDelay' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 500,
            'def' : 500,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_bubbleHideDelay_name'),
            'desc' : getLang('cfg_bubbleHideDelay_description')
        },
        'controlsSwitchTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 100,
            'def' : 100,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_controlsSwitchTimer_name'),
            'desc' : getLang('cfg_controlsSwitchTimer_description')
        },
        'debugControlsSwitchTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 50,
            'def' : 50,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_debugControlsSwitchTimer_name'),
            'desc' : getLang('cfg_debugControlsSwitchTimer_description')
        },
        'skippingPreventionTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 2000,
            'def' : 2000,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_skippingPreventionTimer_name'),
            'desc' : getLang('cfg_skippingPreventionTimer_description')
        },
        'playPauseButtonDelay' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 1000,
            'def' : 1000,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_playPauseButtonDelay_name'),
            'desc' : getLang('cfg_playPauseButtonDelay_description')
        },
        'devToolsRefreshTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 500,
            'def' : 500,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_devToolsRefreshTimer_name'),
            'desc' : getLang('cfg_devToolsRefreshTimer_description')
        },
        'devToolsConfigLoadTimer' : {
            'type' : 'range',
            'category' : 'debug',
            'access' : true,
            'order' : cfg_order['debug']++,
            'val' : 500,
            'def' : 500,
            'min' : null,
            'max' : null,
            'step' : null,
            'off' : null,
            'list': [],
            'name' : getLang('cfg_devToolsConfigLoadTimer_name'),
            'desc' : getLang('cfg_devToolsConfigLoadTimer_description')
        }
        //-- CORE TIMERS END
    };

    return conf;
}

var cfg = init_configuration();

var cfg_changed = false;

var cfg_loaded = false;
var cfg_loading_start = new Date();
var cfg_loading_end = cfg_loading_start;

// ------------------------
// Log handler
// ------------------------

function nvl(string1, string2) {
    if (string1 == null || string1 == '' || string1 === undefined) {
        return string2;
    }
    return string1;
}

function fillKeys(string, keys) {
    return string.replace(/((?:[^{}]|(?:\{\{)|(?:\}\}))+)|(?:\{([A-Z0-9_\-\.]+)\})/g, (m, str, key) => {
        if (str) {
            return str.replace(/(?:{{)|(?:}})/g, m => m[0]);
        } else {
            if (!keys.hasOwnProperty(key)) {
                return '{' + key + '}';
            }
            return keys[key];
        }
    });
}

function fillArgs(string, ...args) {
    return string.replace(/((?:[^{}]|(?:\{\{)|(?:\}\}))+)|(?:\{([0-9]+)\})/g, (m, str, index) => {
        if (str) {
            return str.replace(/(?:{{)|(?:}})/g, m => m[0]);
        } else {
            if (index >= args.length) {
                return '{' + index + '}';
            }
            return args[index];
        }
    });
}

function log(type, access, message, ...args) {
    try {
        // Handle log type access
        if (access == '' || access === undefined) {
            // If access is empty show message unless it is one of the debug types, these require to have access
            if (type == 'debug' || type == 'group_start' || type == 'group_end') {
                log('error', '', getLang('debug_message_without_access'), message);
                return;
            }
        } else {
            // If access is provided, look if they are allowed in configuration
            try {
                if (!cfg['debug']['val'].includes(access)) {
                    return;
                }
            } catch (e) {
                // If we cannot determine if we should show debug message due to cfg not being properly set yet, show
                // message unless it is a debug type
                if (type == 'debug' || type == 'group_start' || type == 'group_end') {
                    return;
                }
            }
        }

        // If message is a string, perform argument filling
        var datatype = 'string';
        var message_processed = message;
        if (message_processed) {
            if (Object.prototype.toString.call(message_processed) === '[object String]') {
                datatype = 'string';
                try {
                    message_processed = fillArgs(message_processed, ...args);
                } catch (e) {
                    log('error', '', e.message, type);
                }
            } else {
                datatype = 'object';
            }
        }

        // Define message styles
        var debug_style = 'color: #999999; font-style: italic;';
        var info_style = 'color: #4d88ff;';
        var warn_style = 'font-style: normal;';
        var error_style = 'font-style: normal;';
        var output_style = 'font-style: normal;';

        // Handle message output to console
        var log_level = parseInt(cfg['logLevel']['val']);
        switch (type) {
            // Debug types
            case 'debug':
                if (log_level <= 0) {
                    if (datatype == 'string') {
                        console.log('%c' + getLang('debug_message') + message_processed, debug_style);
                    } else {
                        console.log(message_processed);
                    }
                }
                break;
            case 'group_start':
                if (log_level <= 0) {
                    console.groupCollapsed('%c' + message_processed, debug_style);
                }
                break;
            case 'group_end':
                if (log_level <= 0) {
                    console.groupEnd();
                }
                break;
            // Non-debug types
            case 'info':
                if (log_level <= 1) {
                    if (datatype == 'string') {
                        console.info('%c' + getLang('info_message') + message_processed, info_style);
                    } else {
                        console.log(message_processed);
                    }
                }
                break;
            case 'output':
                if (log_level <= 2) {
                    if (datatype == 'string') {
                        console.log('%c' + getLang('output_message') + message_processed, output_style);
                    } else {
                        console.log(message_processed);
                    }
                }
                break;
            case 'warn':
                if (log_level <= 3) {
                    if (datatype == 'string') {
                        console.warn('%c' + getLang('warn_message') + message_processed, warn_style);
                    } else {
                        console.log(message_processed);
                    }
                }
                break;
            case 'error':
                if (log_level <= 4) {
                    if (datatype == 'string') {
                        console.error('%c' + getLang('error_message') + message_processed, error_style);
                    } else {
                        console.log(message_processed);
                    }
                    //throw new Error(getLang('error_message') + message_processed);
                }
                break;
            default:
                // Unknown log type
                log('error', '', getLang('log_type_unknown'), type);
                break;
        }
    } catch (e) {
        throw new Error(getLang('error_message') + e.message);
    }
}