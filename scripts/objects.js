// Is there a better way how to do this? It feels too complicated...
function object_handler(object_category, related_object) {
    // Provide objects by their call name. Extension objects are not included.
    // In case of UI changes, new versions cane be added by new else if. This should ensure
    // backwards compatibility.
    var object = undefined;

    try {
        switch (object_category) {
            // General DOM
            case 'head':
                if (document.getElementsByTagName('HEAD')[0]) {
                    object = document.getElementsByTagName('HEAD')[0];
                }
                break;
            case 'body':
                if (document.getElementsByTagName('BODY')[0]) {
                    object = document.getElementsByTagName('BODY')[0];
                }
                break;
            // Check elements
            case 'cast':
                if (document.getElementsByClassName('mdx-mount-point')[0]) {
                    object = document.getElementsByClassName('mdx-mount-point')[0];
                }
                break;
            case 'error':
                if (document.getElementsByClassName('error-page--content--errorCode')[0]) {
                    object = document.getElementsByClassName('error-page--content--errorCode')[0];
                }
                break;
            case 'account':
                if (document.getElementsByClassName('accountLayout')[0]) {
                    object = document.getElementsByClassName('accountLayout')[0];
                }
                break;
            case 'profile':
                if (document.getElementsByClassName('profiles-gate-container')[0]) {
                    object = document.getElementsByClassName('profiles-gate-container')[0];
                }
                break;
            case 'pin':
                if (document.getElementsByClassName('profile-pin-prompt')[0]) {
                    object = document.getElementsByClassName('profile-pin-prompt')[0];
                }
                break;
            case 'kids':
                if (document.getElementsByClassName('kidsPage')[0]) {
                    object = document.getElementsByClassName('kidsPage')[0];
                }
                break;
            case 'upsell':
                if (document.getElementsByClassName('upsell-heading-wrapper')[0]) {
                    object = document.getElementsByClassName('upsell-heading-wrapper')[0];
                } else if (document.getElementsByClassName('upsell-title')[0]) {
                    object = document.getElementsByClassName('upsell-title')[0];
                } else if (document.getElementsByClassName('player-upsell-view-secondary-info')[0]) {
                    object = document.getElementsByClassName('player-upsell-view-secondary-info')[0];
                } else if (document.getElementsByClassName('upsell-text')[0]) {
                    object = document.getElementsByClassName('upsell-text')[0];
                } else if (document.getElementsByClassName('upsell-streams')[0]) {
                    object = document.getElementsByClassName('upsell-streams')[0];
                } else if (document.getElementsByClassName('offer-buttons')[0]) {
                    object = document.getElementsByClassName('offer-buttons')[0];
                } else if (document.getElementsByClassName('upgrade-details')[0]) {
                    object = document.getElementsByClassName('upgrade-details')[0];
                }
                break;
            // Assistant elements
            case 'cadmium_version':
                if (document.getElementById('player-core-js')) {
                    object = document.getElementById('player-core-js').src.split('cadmium-playercore-')[1].replace('.js','');
                }
                break;
            case 'synopsis':
                if (document.getElementById('player-core-js')) {
                    object = {
                        'tiles': [
                            [ 'synopsis', 'description' ], // Title details episode list
                            [ 'episodeSynopsis', 'description' ], // Description on browser page
                            [ 'preview-modal-synopsis', 'description' ], // Description on browser page
                            [ 'previewModal-episodeDetails', 'episode_name' ], // Episode name on browser page
                            [ 'titleCard-synopsis', 'description' ], // Description on browser page
                            [ 'titleCard-title_text', 'episode_name' ], // Episode name on browser page
                            [ 'ptrack-content', 'episode_picture' ], // Title details episode thumbnails
                        ],
                        'cast': [
                            [ 'title-name-container', 'episode_name' ], // Title name while casting, will be blurred only for series
                        ],
                        'watch': [
                            [ 'synopsis', 'description' ], // Description on watch page in list of episodes
                            [ 'PromotedVideo-synopsis', 'description' ], // Description on suggested next title
                            [ 'nfa-fs-1-6-em nfa-c-gray-80 nfa-m-0 nfa-w-60', 'description' ], // Video player paused screen description
                            [ 'nfa-fs-2-em nfa-m-0 nfa-pt-1-em nfa-pb-05-em', 'episode_name' ], // Video player paused screen title name
                            [ 'ellipsize-text', 'episode_name' ], // Video player title name, code will search for last child element if there are more than one
                            [ 'tp-image', 'runner_thumbnail' ], // Runner thumbnail
                            [ 'playable-title', 'episode_name' ], // Episode title when loading player
                            [ 'thumbnail-image', 'episode_picture' ], // Watch episode thumbnails
                            [ 'title', 'episode_name' ], // Next episode name and episode list names, skip if parent element contains class player-title-evidence
                        ]
                    };
                }
                break;
            case 'button_next_episode':
                if (document.getElementsByClassName('button-nfplayerNextEpisode')[0]) {
                    object = document.getElementsByClassName('button-nfplayerNextEpisode')[0];
                }
                break;
            case 'button_exit_player':
                if (document.getElementsByClassName('button-nfplayerBack')[0]) {
                    object = document.getElementsByClassName('button-nfplayerBack')[0];
                }
                break;
            case 'video_loading_spinner':
                if (document.getElementsByClassName('nf-loading-spinner')[0]) {
                    object = document.getElementsByClassName('nf-loading-spinner')[0];
                }
                break;
            case 'video_interrupter':
                if (document.getElementsByClassName('interrupter-actions')[0]) {
                    object = document.getElementsByClassName('interrupter-actions')[0];
                }
                break;
            case 'buttons_tile_close':
                if (document.getElementsByClassName('close-button icon-close')) {
                    object = document.getElementsByClassName('close-button icon-close');
                } else if (document.getElementsByClassName('previewModal-close')) {
                    object = document.getElementsByClassName('previewModal-close');
                }
                break;
            case 'buttons_tile_list':
                if (document.getElementsByClassName('slider-refocus')) {
                    object = document.getElementsByClassName('slider-refocus');
                }
                break;
            case 'title_tile_anchor':
                if (related_object.parentNode.parentNode.getElementsByClassName('title-card-play playLink')[0]) {
                    object = related_object.parentNode.parentNode.getElementsByClassName('title-card-play playLink')[0];
                }
                break;
            case 'video_progress_bar':
                if (document.getElementsByClassName('PlayerControlsNeo__progress-control-row')[0]) {
                    object = document.getElementsByClassName('PlayerControlsNeo__progress-control-row')[0];
                }
                break;
            case 'video_report_problem':
                if (document.getElementsByClassName('ReportAProblemDialog--dialog-box')[0]) {
                    object = document.getElementsByClassName('ReportAProblemDialog--dialog-box')[0];
                }
                break;
            case 'button_report_problem':
                if (document.getElementsByClassName('button-nfplayerReportAProblem')[0]) {
                    object = document.getElementsByClassName('button-nfplayerReportAProblem')[0];
                }
                break;
            case 'input_search':
                if (document.getElementsByClassName('searchInput')[0]) {
                    object = document.getElementsByClassName('searchInput')[0];
                }
                break;
            case 'button_play':
                if (document.getElementsByClassName('button-nfplayerPlay')[0]) {
                    object = document.getElementsByClassName('button-nfplayerPlay')[0];
                }
                break;
            case 'button_pause':
                if (document.getElementsByClassName('button-nfplayerPause')[0]) {
                    object = document.getElementsByClassName('button-nfplayerPause')[0];
                }
                break;
            case 'player_hit_zone':
                if (document.getElementsByClassName('controls-full-hit-zone')[0]) {
                    object = document.getElementsByClassName('controls-full-hit-zone')[0];
                }
                break;
            case 'button_skip':
                if (document.getElementsByClassName('nf-flat-button-text')[0]) {
                    object = document.getElementsByClassName('nf-flat-button-text')[0];
                }
                break;
            case 'player_subtitles':
                if (document.getElementsByClassName('player-timedtext')[0]) {
                    object = document.getElementsByClassName('player-timedtext')[0];
                }
                break;
            case 'next_episode_offer_wait':
                if (document.getElementsByClassName('WatchNext-still-hover-container')[0]) {
                    object = document.getElementsByClassName('WatchNext-still-hover-container')[0];
                } else if (document.getElementsByClassName('EpisodicTeaser-action-buttons')[0]) {
                    object = document.getElementsByClassName('EpisodicTeaser-action-buttons')[0];
                } else if (document.getElementsByClassName('Recommendation-boxshot-active')[0]) {
                    object = document.getElementsByClassName('Recommendation-boxshot-active')[0];
                } else if (document.getElementsByClassName('nf-flat-button-icon-play')[0]) {
                    object = document.getElementsByClassName('nf-flat-button-icon-play')[0];
                }
                break;
            case 'next_episode_offer_nowait':
                if (document.getElementsByClassName('nf-flat-button-primary')[0]) {
                    object = document.getElementsByClassName('nf-flat-button-primary')[0];
                } else if (document.getElementsByClassName('btn-draining')[0]) {
                    object = document.getElementsByClassName('btn-draining')[0];
                } else if (document.querySelectorAll('[data-uia="next-episode-seamless-button"]')[0]) {
                    object = document.querySelectorAll('[data-uia="next-episode-seamless-button"]')[0];
                } else if (document.querySelectorAll('[data-uia="next-episode-seamless-button-draining"]')[0]) {
                    object = document.querySelectorAll('[data-uia="next-episode-seamless-button-draining"]')[0];
                }
                break;
            case 'player_video':
                if (document.getElementsByTagName('video')[0]) {
                    object = document.getElementsByTagName('video')[0];
                }
                break;
            case 'player_video_container':
                if (document.getElementsByClassName('VideoContainer')[0]) {
                    object = document.getElementsByClassName('VideoContainer')[0];
                }
                break;
            case 'trailer_list':
                if (document.getElementsByTagName('video')) {
                    object = document.getElementsByTagName('video');
                }
                break;
            case 'player_container':
                if (document.getElementsByClassName('nf-player-container')[0]) {
                    object = document.getElementsByClassName('nf-player-container')[0];
                }
                break;
            case 'next_episode':
                if (document.getElementsByClassName('MdxControls__button MdxControls__button--primary')[0]) {
                    object = document.getElementsByClassName('MdxControls__button MdxControls__button--primary')[0];
                }
                break;
            case 'disliked_title':
                if (document.getElementsByClassName('is-disliked')) {
                    object = document.getElementsByClassName('is-disliked');
                }
                break;
            case 'button_episodes_list':
                if (document.getElementsByClassName('button-nfplayerEpisodes')[0]) {
                    object = document.getElementsByClassName('button-nfplayerEpisodes')[0];
                }
                break;
            case 'video_title':
                if (document.getElementsByClassName('video-title')[0]) {
                    object = document.getElementsByClassName('video-title')[0];
                }
                break;
            case 'rating_title':
                if (document.getElementsByClassName('pp-rating-title')[0]) {
                    object = document.getElementsByClassName('pp-rating-title')[0];
                }
                break;
            case 'show_title':
                if (document.getElementsByClassName('WatchNext-show-title')[0]) {
                    object = document.getElementsByClassName('WatchNext-show-title')[0];
                }
                break;
            case 'originals_title':
                if (document.getElementsByClassName('OriginalsLogo')[0]) {
                    object = document.getElementsByClassName('OriginalsLogo')[0];
                }
                break;
            case 'movie_title':
                if (document.getElementsByClassName('Recommendation-bob-movie-title')[0]) {
                    object = document.getElementsByClassName('Recommendation-bob-movie-title')[0];
                }
                break;
            case 'chromecast_title':
                if (document.getElementsByClassName('title-name-container')[0].getElementsByTagName('A')[0]) {
                    object = document.getElementsByClassName('title-name-container')[0].getElementsByTagName('A')[0];
                }
                break;
            case 'player_controls_elements':
                if (document.getElementsByClassName('PlayerControls--control-element')) {
                    object = document.getElementsByClassName('PlayerControls--control-element');
                }
                break;
            case 'navigation_menu_elements':
                if (document.getElementsByClassName('nav-element')) {
                    object = document.getElementsByClassName('nav-element');
                }
                break;
            case 'player_controls':
                if (document.getElementsByClassName('PlayerControlsNeo__button-control-row')[0]) {
                    object = document.getElementsByClassName('PlayerControlsNeo__button-control-row')[0];
                }
                break;
            case 'navigation_menu':
                if (document.getElementsByClassName('secondary-navigation')[0]) {
                    object = document.getElementsByClassName('secondary-navigation')[0];
                }
                break;
            case 'navigation_menu_search':
                if (document.getElementsByClassName('nav-element')[1]) {
                    object = document.getElementsByClassName('nav-element')[1];
                }
                break;
            case 'player_controls_report_problem':
                if (document.getElementsByClassName('ReportAProblemPopupContainer')[0]) {
                    object = document.getElementsByClassName('ReportAProblemPopupContainer')[0];
                }
                break;
            case 'player_focus_trap':
                if (document.getElementsByClassName('nf-kb-nav-wrapper')[0]) {
                    object = document.getElementsByClassName('nf-kb-nav-wrapper')[0];
                }
                break;
            case 'player_focus_trap_element':
                if (document.getElementsByClassName('sizing-wrapper')[0]) {
                    object = document.getElementsByClassName('sizing-wrapper')[0];
                }
                break;
            // Ratings elements
            case 'ratings_elements':
                var containers = [];

                if (document.getElementsByClassName('jawBoneContainer').length != 0) {
                    Array.prototype.push.apply(containers, document.getElementsByClassName('jawBoneContainer'));
                } else {
                    if (document.getElementsByClassName('volatile-billboard-animations-container').length != 0) {
                        Array.prototype.push.apply(containers, document.getElementsByClassName('volatile-billboard-animations-container'));
                    }
                    if (document.getElementsByClassName('previewModal--container detail-modal').length != 0) {
                        Array.prototype.push.apply(containers, document.getElementsByClassName('previewModal--container detail-modal'));
                    }
                    if (document.getElementsByClassName('previewModal--container mini-modal').length != 0) {
                        Array.prototype.push.apply(containers, document.getElementsByClassName('previewModal--container mini-modal'));
                    }
                    if (document.getElementsByClassName('bob-card').length != 0) {
                        Array.prototype.push.apply(containers, document.getElementsByClassName('bob-card'));
                    }
                    if (document.getElementsByClassName('slider-refocus title-card').length != 0) {
                        Array.prototype.push.apply(containers, document.getElementsByClassName('slider-refocus title-card'));
                    }
                }

                object = containers;
                break;
            // Unknown category is a problem
            default:
                log('error', '', fillArgs(getLang('object_category_unknown'), object_category));
                break;
        }
    } catch (e) {
        log('error', '', fillArgs(getLang('object_category_error'), object_category, e));
    }

    return object;
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