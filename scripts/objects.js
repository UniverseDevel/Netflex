function object_handler(object_category, related_object) {
    // Provide objects by their call name. Extension objects are not included.
    // In case of UI changes, new versions can be added by new else if. This should ensure
    // backwards compatibility.

    var obj;

    switch (object_category) {
        // General DOM
        case 'html':
            obj = document.querySelector('html');
            if (obj) { return obj; }
            break;
        case 'head':
            obj = document.querySelector('head');
            if (obj) { return obj; }
            break;
        case 'body':
            obj = document.querySelector('body');
            if (obj) { return obj; }
            break;
        // Check elements
        case 'cast':
            obj = document.querySelector('.mdx-mount-point');
            if (obj) { return obj; }
            break;
        case 'error':
            obj = document.querySelector('.error-page--content--errorCode');
            if (obj) { return obj; }
            break;
        case 'account':
            obj = document.querySelector('.accountLayout');
            if (obj) { return obj; }
            break;
        case 'profile':
            obj = document.querySelector('.profiles-gate-container');
            if (obj) { return obj; }
            break;
        case 'pin':
            obj = document.querySelector('.profile-pin-prompt');
            if (obj) { return obj; }
            break;
        case 'kids':
            obj = document.querySelector('.kidsPage');
            if (obj) { return obj; }
            break;
        case 'upsell':
            obj = document.querySelector('.upsell-heading-wrapper, .upsell-title, .player-upsell-view-secondary-info, .upsell-text, .upsell-streams, .offer-buttons, .upgrade-details');
            if (obj) { return obj; }
            break;
        // Assistant elements
        case 'cadmium_version':
            obj = document.querySelector('#player-core-js').src.split('cadmium-playercore-')[1].replace('.js','');
            if (obj) { return obj; }
            break;
        case 'synopsis':
            obj = {
                'tiles': [
                    [ '', 'synopsis', 'description' ], // Title details episode list
                    [ '', 'episodeSynopsis', 'description' ], // Description on browser page
                    [ '', 'preview-modal-synopsis', 'description' ], // Description on browser page
                    [ '', 'previewModal-episodeDetails', 'episode_name' ], // Episode name on browser page
                    [ '', 'titleCard-synopsis', 'description' ], // Description on browser page
                    [ '', 'titleCard-title_text', 'episode_name' ], // Episode name on browser page
                    [ 'titleCard-imageWrapper', 'ptrack-content', 'episode_picture' ], // Title details episode thumbnails
                ],
                'cast': [
                    [ '', 'title-name-container', 'episode_name' ], // Title name while casting, will be blurred only for series
                ],
                'watch': [
                    [ '', 'synopsis', 'description' ], // Description on watch page in list of episodes
                    [ '', 'PromotedVideo-synopsis', 'description' ], // Description on suggested next title
                    [ '', 'nfa-fs-1-6-em nfa-c-gray-80 nfa-m-0 nfa-w-60', 'description' ], // Video player paused screen description
                    [ '', 'nfa-fs-2-em nfa-m-0 nfa-pt-1-em nfa-pb-05-em', 'episode_name' ], // Video player paused screen title name
                    [ '', 'ellipsize-text', 'episode_name' ], // Video player title name, code will search for last child element if there are more than one
                    [ '', 'tp-image', 'runner_thumbnail' ], // Runner thumbnail
                    [ '', 'playable-title', 'episode_name' ], // Episode title when loading player
                    [ '', 'thumbnail-image', 'episode_picture' ], // Watch episode thumbnails
                    [ '', 'title', 'episode_name' ], // Next episode name and episode list names, skip if parent element contains class player-title-evidence
                    [ '', 'player-loading-background-image', 'episode_picture' ], // Episode picture while video loading
                ]
            };
            return obj;
            break;
        case 'progress_bar':
            obj = document.querySelector('.PlayerControlsNeo__progress-container');
            if (obj) { return obj; }
            break;
        case 'button_next_episode':
            obj = document.querySelector('.button-nfplayerNextEpisode');
            if (obj) { return obj; }
            break;
        case 'button_exit_player':
            obj = document.querySelector('.button-nfplayerBack');
            if (obj) { return obj; }
            break;
        case 'video_loading_spinner':
            obj = document.querySelector('.nf-loading-spinner');
            if (obj) { return obj; }
            break;
        case 'video_interrupter':
            obj = document.querySelector('.interrupter-actions');
            if (obj) { return obj; }
            break;
        case 'buttons_tile_close':
            obj = document.querySelectorAll('.close-button icon-close, .previewModal-close');
            if (obj[0]) { return obj; }
            break;
        case 'buttons_tile_list':
            obj = document.querySelectorAll('.slider-refocus');
            if (obj[0]) { return obj; }
            break;
        case 'title_tile_anchor':
            obj = related_object.parentNode.parentNode.querySelector('.title-card-play.playLink');
            if (obj) { return obj; }
            break;
        case 'video_progress_bar':
            obj = document.querySelector('.PlayerControlsNeo__progress-control-row');
            if (obj) { return obj; }
            break;
        case 'video_report_problem':
            obj = document.querySelector('.ReportAProblemDialog--dialog-box');
            if (obj) { return obj; }
            break;
        case 'button_report_problem':
            obj = document.querySelector('.button-nfplayerReportAProblem');
            if (obj) { return obj; }
            break;
        case 'input_search':
            obj = document.querySelector('.searchInput');
            if (obj) { return obj; }
            break;
        case 'button_play':
            obj = document.querySelector('.button-nfplayerPlay');
            if (obj) { return obj; }
            break;
        case 'button_pause':
            obj = document.querySelector('.button-nfplayerPause');
            if (obj) { return obj; }
            break;
        case 'player_hit_zone':
            obj = document.querySelector('.controls-full-hit-zone');
            if (obj) { return obj; }
            break;
        case 'button_skip':
            obj = document.querySelector('.skip-credits a .nf-flat-button-text');
            if (obj) { return obj; }
            break;
        case 'player_subtitles':
            // Note: relates to CSS
            obj = document.querySelector('.player-timedtext');
            if (obj) { return obj; }
            break;
        case 'next_episode_offer_wait':
            obj = document.querySelectorAll('.WatchNext-still-hover-container, .EpisodicTeaser-action-buttons, .Recommendation-boxshot-active, .nf-flat-button-icon-play, [data-uia="postplay-background-play"]');
            if (obj[0]) { return obj; }
            break;
        case 'next_episode_offer_nowait':
            obj = document.querySelectorAll('.nf-flat-button-primary, .btn-draining, [data-uia="next-episode-seamless-button"], [data-uia="next-episode-seamless-button-draining"]');
            if (obj[0]) { return obj; }
            break;
        case 'next_episode':
            obj = document.querySelector('.MdxControls__button.MdxControls__button--primary');
            if (obj) { return obj; }
            break;
        case 'watch_credits':
            obj = document.querySelector('[data-uia="watch-credits-seamless-button"], .nfp-aspect-wrapper');
            if (obj) { return obj; }
            break;
        case 'player_video':
            obj = document.querySelector('.AkiraPlayer > .nf-player-container video');
            if (obj) { return obj; }
            break;
        case 'player_video_container':
            // Note: relates to CSS
            obj = document.querySelector('.VideoContainer');
            if (obj) { return obj; }
            break;
        case 'trailer_list':
            obj = document.querySelectorAll('video');
            if (obj[0]) { return obj; }
            break;
        case 'player_container':
            obj = document.querySelector('.nf-player-container');
            if (obj) { return obj; }
            break;
        case 'disliked_title':
            obj = document.querySelectorAll('.is-disliked');
            if (obj[0]) { return obj; }
            break;
        case 'button_episodes_list':
            obj = document.querySelector('.button-nfplayerEpisodes');
            if (obj) { return obj; }
            break;
        case 'video_title':
            obj = document.querySelector('.video-title');
            if (obj) { return obj; }
            break;
        case 'rating_title':
            obj = document.querySelector('.pp-rating-title');
            if (obj) { return obj; }
            break;
        case 'show_title':
            obj = document.querySelector('.WatchNext-show-title');
            if (obj) { return obj; }
            break;
        case 'originals_title':
            obj = document.querySelector('.OriginalsLogo');
            if (obj) { return obj; }
            break;
        case 'movie_title':
            obj = document.querySelector('.Recommendation-bob-movie-title');
            if (obj) { return obj; }
            break;
        case 'chromecast_title':
            obj = document.querySelector('.title-name-container a');
            if (obj) { return obj; }
            break;
        case 'player_controls_elements':
            obj = document.querySelector('.PlayerControls--control-element');
            if (obj) { return obj; }
            break;
        case 'navigation_menu_elements':
            obj = document.querySelector('.nav-element');
            if (obj) { return obj; }
            break;
        case 'player_controls':
            obj = document.querySelector('.PlayerControlsNeo__button-control-row');
            if (obj) { return obj; }
            break;
        case 'navigation_menu':
            obj = document.querySelector('.secondary-navigation');
            if (obj) { return obj; }
            break;
        case 'navigation_menu_search':
            obj = document.querySelector('.nav-element:nth-of-type(2)');
            if (obj) { return obj; }
            break;
        case 'player_controls_report_problem':
            obj = document.querySelector('.ReportAProblemPopupContainer');
            if (obj) { return obj; }
            break;
        case 'player_focus_trap':
            obj = document.querySelector('.sizing-wrapper');
            if (obj) { return obj; }
            break;
        case 'player_focus_trap_element':
            obj = document.querySelector('.AkiraPlayer');
            if (obj) { return obj; }
            break;
        case 'player_episode_list':
            obj = document.querySelector('.episode-list');
            if (obj) { return obj; }
            break;
        // Ratings elements
        case 'ratings_elements':
            obj = document.querySelectorAll('.jawBoneContainer, .volatile-billboard-animations-container, .previewModal--container.detail-modal, .previewModal--wrapper, .bob-card, .slider-refocus.title-card, .titleCard--container, .title-card-container');
            if (obj[0]) { return obj; }
            break;
        // Unknown category is a problem
        default:
            log('error', '', fillArgs(getLang('object_category_unknown'), object_category));
            break;
    }

    // If nothing is found in case return undefined
    return undefined;
}

/*
Related attributes that are currently not included, this might be needed in the feature but will be added per need basis.

PlayerControlsNeo__progress-control-row--row-hidden
ellipsize-text
title-name-container
player-title-evidence
nfp-season-preview
slider-item
visually-hidden
title-card-tall-panel
is-disliked
aria-label

jawBoneContainer
previewModal--container detail-modal
jbv=
previewModal--container mini-modal
bob-card
volatile-billboard-animations-container
ptrack-content
data-ui-tracking-context
slider-refocus title-card
slider-refocus
jawbone-overview-info
video-meta
logo-and-text meta-layer
titleWrapper
previewModal--detailsMetadata-left
preview-modal-synopsis
previewModal--metadatAndControls-container
onControls--container mini-modal
bob-overview
bob-title
slider-refocus
*/