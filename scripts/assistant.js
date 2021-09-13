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
                        var syn_class_parent = synopsis_obj[key][i][0];
                        var syn_class_name = synopsis_obj[key][i][1];
                        var syn_class_type = synopsis_obj[key][i][2];
                        var should_be_blurred_type = true;

                        if (!cfg['hideSpoilersObjects']['val'].includes(syn_class_type)) {
                            should_be_blurred_type = false;
                        }

                        var descriptions_list = [];
                        if (syn_class_parent == '') {
                            descriptions_list = document.querySelectorAll(syn_class_name);
                        } else {
                            var parent_list = document.querySelectorAll(syn_class_parent);
                            for (var j = 0; j < parent_list.length; j++) {
                                Array.prototype.push.apply(descriptions_list, parent_list[j].querySelectorAll(syn_class_name));
                            }
                        }

                        if (descriptions_list[0]) {
                            for (var j = 0; j < descriptions_list.length; j++) {
                                var should_be_blurred = true;
                                var elm = descriptions_list[j];

                                // Special cases
                                if (elm.classList.contains('title-name-container')) {
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
                                if (elm.classList.contains('title')) {
                                    if (elm.parentNode.classList.contains('player-title-evidence') || elm.parentNode.classList.contains('nfp-season-preview')) {
                                        should_be_blurred = false;
                                    }
                                }
                                if (elm.parentNode.classList.contains('titleCard-imageWrapper')) {
                                    if (elm.parentNode.parentNode.classList.contains('more-like-this-item')) {
                                        should_be_blurred = false;
                                    }
                                }
                                if (elm.getAttribute('data-uia') == 'episode-pane-item-number') {
                                    elm = elm.nextSibling;
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

                                    if (elm.getAttribute('netflex_blur') != 'blurred' && elm.getAttribute('netflex_blur') != 'revealed') {
                                        add_stats_count('stat_hideSpoilers');
                                        elm.addEventListener('mouseenter', function() { logEvent('hide_synopsis'); reveal_synopsis(this); });
                                        elm.addEventListener('mouseleave', function() { logEvent('hide_synopsis'); unreveal_synopsis(this); });
                                    }
                                    if ((elm.getAttribute('netflex_blur') != 'blurred' || (filter != '' && filter != filter_value))  && elm.getAttribute('netflex_blur') != 'revealed') {
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

function reveal_synopsis(obj) {
    if (cfg['revealSpoilers']['access'] && cfg['revealSpoilers']['val'] != cfg['revealSpoilers']['off']) {
        obj.MouseIsOver = true;
        workers['synopsis_reveal'] = setTimeout(function() { reveal_synopsis_content(obj); }, cfg['revealSpoilers']['val'] * 1000);
    }
}

function reveal_synopsis_content(obj) {
    if (obj.MouseIsOver) {
        obj.setAttribute('netflex_blur', 'revealed');
        obj.style = 'filter: inherit;';
        add_stats_count('stat_revealSpoilers');
    }
}

function unreveal_synopsis(obj) {
    obj.MouseIsOver = false;
    stop_worker('synopsis_reveal');
    obj.setAttribute('netflex_blur', 'shown');
}

function handle_video_features() {
    // Only set/change/reset video features when enableVideoFeatures are enabled to avoid changing any values
    // when other extension might be changing them as well
    try {var video = object_handler('player_video', null);} catch (e) {}

    if (video) {
        if (check_watch()) {
            if (cfg['enableVideoFeatures']['val'] && cfg['enableVideoFeatures']['access']) {
                if (enableAssistant) {
                    video.setAttribute('netflex_video_features', 'on');
                    videoSpeedRate = video.playbackRate * 100;

                    // Video speed rate feature
                    if (cfg['videoSpeedRate']['access']) {
                        if (videoSpeedRate_change != cfg['videoSpeedRate']['val']) {
                            updateFeaturesControls('videoSpeedRate');
                            videoSpeedRate_temp = cfg['videoSpeedRate']['val'];
                            videoSpeedRate_change = cfg['videoSpeedRate']['val'];
                        }
                        if (videoSpeedRate != videoSpeedRate_temp) {
                            // Going below or above min/max values means something is wrong and we should prefer to use default value
                            if (videoSpeedRate_temp < cfg['videoSpeedRate']['min'] || videoSpeedRate_temp > cfg['videoSpeedRate']['max']) {
                                videoSpeedRate_temp = cfg['videoSpeedRate']['def'];
                                videoSpeedRate_change = cfg['videoSpeedRate']['def'];
                                cfg['videoSpeedRate']['val'] = cfg['videoSpeedRate']['def'];
                            }
                            video.playbackRate = (videoSpeedRate_temp / 100).toFixed(2);
                            videoSpeedRate = videoSpeedRate_temp;
                        }
                    }

                    // Video aspect ratio and zoom
                    if (cfg['videoAspectRatio']['access']) {
                        if (cfg['videoAspectRatio']['val'] != 'original') {
                            video.setAttribute('netflex_aspect_ratio', cfg['videoAspectRatio']['val']);
                        } else {
                            video.removeAttribute('netflex_aspect_ratio');
                        }

                        if (cfg['videoZoom']['access']) {
                            if (videoZoom_change != cfg['videoZoom']['val']) {
                                updateFeaturesControls('videoZoom');
                                videoZoom_temp = cfg['videoZoom']['val'];
                                videoZoom_change = cfg['videoZoom']['val'];
                            }
                            video.style.setProperty('--netflex_zoom', videoZoom_temp + '%', '');
                        }
                    }

                    // Filter video features
                    var filter_values = [];

                    if (cfg['videoBrightness']['access']) {
                        if (videoBrightness_change != cfg['videoBrightness']['val']) {
                            updateFeaturesControls('videoBrightness');
                            videoBrightness_temp = cfg['videoBrightness']['val'];
                            videoBrightness_change = cfg['videoBrightness']['val'];
                        }
                        if (videoBrightness_temp != cfg['videoBrightness']['def']) {
                            filter_values.push('brightness(' + videoBrightness_temp + '%)');
                        }
                    }

                    if (cfg['videoContrast']['access']) {
                        if (videoContrast_change != cfg['videoContrast']['val']) {
                            updateFeaturesControls('videoContrast');
                            videoContrast_temp = cfg['videoContrast']['val'];
                            videoContrast_change = cfg['videoContrast']['val'];
                        }
                        if (videoContrast_temp != cfg['videoContrast']['def']) {
                            filter_values.push('contrast(' + videoContrast_temp + '%)');
                        }
                    }

                    if (cfg['videoGrayscale']['access']) {
                        if (videoGrayscale_change != cfg['videoGrayscale']['val']) {
                            updateFeaturesControls('videoGrayscale');
                            videoGrayscale_temp = cfg['videoGrayscale']['val'];
                            videoGrayscale_change = cfg['videoGrayscale']['val'];
                        }
                        if (videoGrayscale_temp != cfg['videoGrayscale']['def']) {
                            filter_values.push('grayscale(' + videoGrayscale_temp + '%)');
                        }
                    }

                    if (cfg['videoHue']['access']) {
                        if (videoHue_change != cfg['videoHue']['val']) {
                            updateFeaturesControls('videoHue');
                            videoHue_temp = cfg['videoHue']['val'];
                            videoHue_change = cfg['videoHue']['val'];
                        }
                        if (videoHue_temp != cfg['videoHue']['def']) {
                            filter_values.push('hue-rotate(' + videoHue_temp + 'deg)');
                        }
                    }

                    if (cfg['videoInvert']['access']) {
                        if (videoInvert_change != cfg['videoInvert']['val']) {
                            updateFeaturesControls('videoInvert');
                            videoInvert_temp = cfg['videoInvert']['val'];
                            videoInvert_change = cfg['videoInvert']['val'];
                        }
                        if (videoInvert_temp != cfg['videoInvert']['def']) {
                            filter_values.push('invert(' + videoInvert_temp + '%)');
                        }
                    }

                    if (cfg['videoSaturation']['access']) {
                        if (videoSaturation_change != cfg['videoSaturation']['val']) {
                            updateFeaturesControls('videoSaturation');
                            videoSaturation_temp = cfg['videoSaturation']['val'];
                            videoSaturation_change = cfg['videoSaturation']['val'];
                        }
                        if (videoSaturation_temp != cfg['videoSaturation']['def']) {
                            filter_values.push('saturate(' + videoSaturation_temp + '%)');
                        }
                    }

                    if (cfg['videoSepia']['access']) {
                        if (videoSepia_change != cfg['videoSepia']['val']) {
                            updateFeaturesControls('videoSepia');
                            videoSepia_temp = cfg['videoSepia']['val'];
                            videoSepia_change = cfg['videoSepia']['val'];
                        }
                        if (videoSepia_temp != cfg['videoSepia']['def']) {
                            filter_values.push('sepia(' + videoSepia_temp + '%)');
                        }
                    }

                    // Change filter
                    var filter = filter_values.join(' ');
                    if (filter == '') {
                        filter = 'none';
                    }
                    video.style.setProperty('--netflex_filter', filter, '');
                } else {
                    reset_videoSpeedRate();
                    video.removeAttribute('netflex_video_features');
                }
            } else {
                video.removeAttribute('netflex_video_features');
            }
        } else {
            video.removeAttribute('netflex_video_features');
        }
    }
}

function updateFeaturesControls(feature_name) {
    var cfg_elm_disp = document.getElementById('feature_' + feature_name + '_display');
    if (cfg_elm_disp) {
        addDOM(cfg_elm_disp, cfg[feature_name]['val'].toString());
    }
    var cfg_elm = document.getElementById('feature_' + feature_name);
    if (cfg_elm) {
        cfg_elm.value = cfg[feature_name]['val'];
    }
}

function reset_videoSpeedRate() {
    try {var video = object_handler('player_video', null);} catch (e) {}
    if (video) {
        if (cfg['videoSpeedRate']['access']) {
            videoSpeedRate_temp = cfg['videoSpeedRate']['val'];
            video.playbackRate = 1;
            videoSpeedRate = 100;
            log('debug', 'assistant_loop', 'RESET');
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

    var location_changed = false
    if (full_url != full_url_old) {
        full_url_old = full_url;
        location_changed = true;
        loadTime = new Date(); // Each URL change is basically time of load
    }

    // If key is pressed for some time nothing should be performed to avoid errors
    if (!key_disabled) {
        // Check if Kids Netflix is shown and extension should be disabled, unless manual override
        if ((check_kids() || check_kids_profile()) && cfg['autoDisableKids']['val'] && !document.getElementById('extension_manual_override') && cfg['autoDisableKids']['access']) {
            enableAssistant = false;
        }

        // Check if extension is disabled
        if (!enableAssistant) {
            // Hide/Un-hide title description
            hide_synopsis();

            // Show hidden disliked titles
            var disliked_obj = object_handler('disliked_title', null);
            if (disliked_obj) {
                for (var i = 0; i < disliked_obj.length; i++) {
                    var disliked_parent = disliked_obj[i].parentNode.parentNode;
                    if (disliked_parent.classList.contains('slider-item')) {
                        if (disliked_parent.classList.contains('netflex_hide')) {
                            disliked_parent.classList.remove('netflex_hide');
                        }
                    }
                }
            }

            // Show subtitles if hidden
            var subtitles_block = object_handler('player_subtitles', null);
            if (subtitles_block) {
                if (subtitles_block.classList.contains('visually-hidden')) {
                    subtitles_block.classList.remove('visually-hidden');
                }
                subtitles_block.setAttribute('netflex_highlighted', cfg['highlightSubtitles']['off']);
            }

            // Remove elapsed time objects
            if (document.querySelector('#netflex_elapsed_time')) {
                removeDOM(document.querySelector('#netflex_elapsed_time'));
                window.dispatchEvent(new Event('resize')); // Fix progressbar size
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
                    if (disliked_obj) {
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
                }

                // Hide/Un-hide title description
                hide_synopsis();

                // Stop trailers video
                if (cfg['trailerVideoStop']['val'] && cfg['trailerVideoStop']['access']) {
                    var trailer_list = object_handler('trailer_list', null);
                    if (trailer_list) {
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
            }

            // Features on Chromecast page
            if (check_cast()) {
                // Get names of current title, episode and next offered title if available
                get_title_names();

                // Play next episode
                var next_episode_obj = object_handler('next_episode', null);
                if (next_episode_obj) {
                    // Check configuration if we want to start next episodes
                    if (cfg['titleEndAction']['val'] == 'skip' && cfg['titleEndAction']['access']) {
                        // Play next video
                        log('output', '', getLang('next_episode'));
                        add_stats_count('stat_titleEndActionSkip');
                        try {doClick(next_episode_obj);} catch (e) {}
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
                    next_no_wait = false;
                } else if (object_handler('next_episode_offer_nowait', null)) {
                    next_is_offered = true;
                    next_no_wait = true;
                }

                // Perform activities at title end
                if ((next_is_offered && !loading_next_title) || forceNextEpisode) {
                    if (cfg['titleEndAction']['val'] != cfg['titleEndAction']['off'] && cfg['titleEndAction']['access']) {
                        // Check configuration if we want to start next episodes
                        if (cfg['titleEndAction']['val'] == 'skip' || forceNextEpisode) {
                            if (nextVideo != '' || (nextVideo == '' && next_no_wait)) {
                                // If we didn't find next video but next episode button is available we consider next video the same as current one
                                if (nextVideo == '' && next_no_wait) {
                                    nextVideo = currentVideo;
                                }

                                // Check if next video is from different title and we want to stop playing
                                if (((!is_series && cfg['nextEpisodeStopMovies']['val']) || (is_series && cfg['nextEpisodeStopSeries']['val'])) && currentVideo != nextVideo) {
                                    loading_next_title = true;
                                    log('output', '', getLang('next_video_stop'));
                                    if (!is_series) {
                                        add_stats_count('stat_nextEpisodeStopSeries');
                                    } else {
                                        add_stats_count('stat_nextEpisodeStopMovies');
                                    }
                                    var button_exit_player_obj = object_handler('button_exit_player', null);
                                    if (button_exit_player_obj) {
                                        doClick(button_exit_player_obj);
                                    } else {
                                        window.location = window.location.origin + '/browse';
                                    }
                                }

                                // Play next video, if it is from same show as current or we waited long enough
                                if (forceNextEpisode || (currentVideo == nextVideo || nextTitleDelay >= cfg['nextTitleDelayLimit']['val'] || cfg['nextTitleDelayLimit']['val'] == cfg['nextTitleDelayLimit']['off'])) {
                                    if (!forceNextEpisode) {
                                        add_stats_count('stat_titleEndActionSkip');
                                    }
                                    forceNextEpisode = false;
                                    nextTitleDelay = 0;
                                    loading_next_title = true;
                                    log('output', '', getLang('next_episode'));

                                    // Click to start next episode
                                    var next_episode_buttons = [];
                                    var next_episode_buttons_list1 = object_handler('next_episode_offer_wait', null);
                                    var next_episode_buttons_list2 = object_handler('next_episode_offer_nowait', null);
                                    var button_next_episode = object_handler('button_next_episode', null);
                                    if (next_episode_buttons_list1) {
                                        next_episode_buttons_list1 = Array.prototype.slice.call(next_episode_buttons_list1);
                                    }
                                    if (next_episode_buttons_list2) {
                                        next_episode_buttons_list2 = Array.prototype.slice.call(next_episode_buttons_list2);
                                    }
                                    next_episode_buttons = next_episode_buttons.concat(next_episode_buttons_list1, next_episode_buttons_list2).filter(item => item !== undefined);
                                    // Last attempt if others fail to click next episode button in video controls
                                    if (is_series && button_next_episode) {
                                        next_episode_buttons.push(button_next_episode);
                                    }
                                    if (next_episode_buttons[0]) {
                                        for (var i = 0; i < next_episode_buttons.length; i++) {
                                            try {doClick(next_episode_buttons[i]);} catch (e) {}
                                            if (oldLink != window.location.href) {
                                                // Prevent multiple episode skips
                                                break;
                                            }
                                        }
                                    }
                                } else {
                                    nextTitleDelay = addTimeFraction(nextTitleDelay, cfg['netflixAssistantTimer']['val']);
                                    if (nextTitleDelay % 1 == 0) {
                                        log('output', '', getLang('next_video_delay'), nextTitleDelay, ((nextTitleDelay == 1) ? getLang('second') : ((nextTitleDelay < 5) ? getLang('second_less5') : getLang('seconds'))), cfg['nextTitleDelayLimit']['val']);
                                    }
                                }
                            }
                        } else if (cfg['titleEndAction']['val'] == 'roll') {
                            if (object_handler('watch_credits', null) && !rolling_credits) {
                                rolling_credits = true;
                                log('output', '', getLang('roll_credits'));
                                add_stats_count('stat_titleEndActionRoll');
                                try {doClick(object_handler('watch_credits', null));} catch (e) {}
                            }
                            if (video) {
                                if (video.duration - 1 < video.currentTime) {
                                    forceNextEpisode = true;
                                }
                            } else {
                                forceNextEpisode = true;
                            }
                        }
                    }
                } else {
                    forceNextEpisode = false;
                    nextTitleDelay = 0;
                    // Mark end of loading period
                    if (oldLink != window.location.href && workers['title_end_actions'] === false) {
                        oldLink = window.location.href;
                        // Delay end action reset
                        workers['title_end_actions'] = setTimeout(function () {
                            rolling_credits = false;
                            loading_next_title = false;
                            stop_worker('title_end_actions');
                        }, cfg['titleEndActionsDelay']['val']);
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
                                //doClick(object_handler('button_pause', null));
                                video.pause();
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
                                //doClick(object_handler('button_play', null));
                                video.play();
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
                        }
                    } else {
                        // Show subtitles
                        if (subtitles_block.classList.contains('visually-hidden')) {
                            subtitles_block.classList.remove('visually-hidden');
                        }

                        // Handle subtitles style
                        subtitles_block.setAttribute('netflex_highlighted', cfg['highlightSubtitles']['val']);
                    }
                } else {
                    if (subtitles_block && !hideSubtitles_temp && cfg['hideSubtitlesKey']['access']) {
                        // Show subtitles
                        if (subtitles_block.classList.contains('visually-hidden')) {
                            subtitles_block.classList.remove('visually-hidden');
                        }
                        subtitles_block.setAttribute('netflex_highlighted', cfg['highlightSubtitles']['off']);
                    }
                }

                // Add elapsed video time
                if (cfg['showElapsedTime']['val'] && cfg['showElapsedTime']['access']) {
                    var progress_bar = object_handler('progress_bar', null);
                    var remaining_time = object_handler('remaining_time', null);
                    if (!document.querySelector('#netflex_elapsed_time') && progress_bar && remaining_time) {
                        var elapsed_time = remaining_time.parentNode.cloneNode(true);
                        elapsed_time.setAttribute('id','netflex_elapsed_time');
                        elapsed_time.children[0].setAttribute('data-uia','controls-time-elapsed');
                        addCSS(elapsed_time, { 'padding-left': '0em !important', 'padding-right': '1em !important' });

                        try {progress_bar.parentNode.parentNode.insertBefore(elapsed_time, progress_bar.parentNode.parentNode.children[0]);} catch (e) {}
                    }

                    // Refresh value or add event that will
                    if (document.querySelector('[data-uia="controls-time-elapsed"]') && video) {
                        addDOM(document.querySelector('[data-uia="controls-time-elapsed"]'), convertToInterval(video.currentTime));
                        window.dispatchEvent(new Event('resize')); // Prevent progressbar size to overgrow
                    }
                } else {
                    if (document.querySelector('#netflex_elapsed_time')) {
                        removeDOM(document.querySelector('#netflex_elapsed_time'));
                    }
                }

                // Skip all intros & recaps
                if (!skipping) {
                    // With new UI it possible to split this, but keeping this has some advantages as well
                    var skip_button = object_handler('button_skip', null);
                    if (skip_button && video) {
                        try {
                            var is_paused = video.paused;
                            var button_text = skip_button.innerText.toUpperCase().trim();
                            log('debug', 'skip_button_text', 'Skip button text found: "{0}".', button_text);

                            if (loc_skip_intro.includes(button_text) && cfg['skipIntros']['val'] && cfg['skipIntros']['access']) {
                                skipping = true;
                                log('output', '', getLang('skipping_intro'));
                                add_stats_count('stat_skipIntros');
                                doClick(skip_button);
                                removeDOM(skip_button);
                            } else if (loc_skip_recap.includes(button_text) && cfg['skipRecaps']['val'] && cfg['skipRecaps']['access']) {
                                skipping = true;
                                log('output', '', getLang('skipping_recap'));
                                add_stats_count('stat_skipRecaps');
                                doClick(skip_button);
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
                var video_interrupter_obj = object_handler('video_interrupter', null);
                if (video_interrupter_obj && cfg['skipInterrupter']['access']) {
                    is_interrupted = true;
                    // Check configuration if we want to skip interruptions
                    if (cfg['skipInterrupter']['val']) {
                        log('output', '', getLang('skipping_interrupter'));
                        add_stats_count('stat_skipInterrupter');
                        doClick(video_interrupter_obj.children[0]);
                    }
                }

                // Detect if video playback is stuck and reload, if it is stuck for long enough
                try {
                    var timeFromLoadDiff = currentTime - loadTime;
                    var timeFromLoad = timeFromLoadDiff / 1000; // Convert to seconds
                    try {currentTimestamp = video.currentTime;} catch (e) {}

                    // Give it a little time for objects to load before considering any reloading (browser load time)
                    // also tab has to be active to even consider reload, not active pages get paused by browser, what
                    // may trigger page reload, because next video does not load until tab is in focus, also in case
                    // we stop at next available episode it is no reason to refresh, or in case we are stopped via
                    // interruption.
                    if (!check_error() && timeFromLoad > cfg['timeFromLoadLimit']['val'] && visibleAPI && !next_is_offered && !is_interrupted) {
                        // If video object does not exist or video is stopped and spinning loader is present or if video is stopped and also it is not paused
                        var video_spinner_obj = object_handler('video_loading_spinner', null);
                        if (!video || (currentTimestamp == oldTimestamp && video_spinner_obj) || (currentTimestamp == oldTimestamp && !video.paused)) {
                            var timerValid = false;

                            // If spinning loader is present give it a time to load video (data load time)
                            if (video_spinner_obj && cfg['loadingTimeLimit']['access']) {
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
    if (openTiles) {
        for (i = openTiles.length - 1; i >= 0; i--) {
            doClick(openTiles[i]);
        }
    }

    // Find all existing tiles
    var tiles = object_handler('buttons_tile_list', null);
    if (!tiles) {
        return;
    }

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

function bind_events() {
    document.onkeyup = function(evt) {
        key_event_handler(evt);
    };

    window.onwheel = function(evt) {
        wheel_event_handler(evt);
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

function unbind_events() {
    document.onkeyup = null;
    window.onwheel = null;
    window.onblur = null;
    window.onfocus = null;
}

function key_event_handler(evt) {
    // Skip binding actions while reporting a problem or searching for titles
    if (check_search_bar() || check_problem_report() || check_options() || isOrphan) {
        return;
    }

    var valid_key = false;

    evt = evt || window.event;
    key_pressed = evt.key.toUpperCase();

    log('debug', 'keypress', '[\'{0}\',{1}],', evt.key.toUpperCase(), evt.keyCode);

    // Detect if key event is for valid action
    var isExitPlayer = (key_pressed == cfg['exitPlayerKey']['val'] && cfg['exitPlayerKey']['val'] != cfg['exitPlayerKey']['off'] && cfg['exitPlayerKey']['access']);
    var isPrevEpisode = (key_pressed == cfg['prevEpisodeKey']['val'] && cfg['prevEpisodeKey']['val'] != cfg['prevEpisodeKey']['off'] && cfg['prevEpisodeKey']['access']);
    var isNextEpisode = (key_pressed == cfg['nextEpisodeKey']['val'] && cfg['nextEpisodeKey']['val'] != cfg['nextEpisodeKey']['off'] && cfg['nextEpisodeKey']['access']);
    var isRandomMovie = (key_pressed == cfg['randomMovieKey']['val'] && cfg['randomMovieKey']['val'] != cfg['randomMovieKey']['off'] && cfg['randomMovieKey']['access']);
    var isHideSubtitles = (key_pressed == cfg['hideSubtitlesKey']['val'] && cfg['hideSubtitlesKey']['val'] != cfg['hideSubtitlesKey']['off'] && cfg['hideSubtitlesKey']['access']);
    var isToggleAssistant = (key_pressed == cfg['toggleAssistantKey']['val'] && cfg['toggleAssistantKey']['val'] != cfg['toggleAssistantKey']['off'] && cfg['toggleAssistantKey']['access']);

    // Perform activities for valid keys
    // Global
    if (isToggleAssistant) {
        log('debug', 'keypress', 'initContent>bind_events>onkeyup>key_event_handler>toggle_assistant');

        toggle_assistant();
        valid_key = true;
    }

    // Tiles only
    if (check_browse() || check_latest() || check_title() || check_search()) {
        if (isRandomMovie) {
            log('debug', 'keypress', 'initContent>bind_events>onkeyup>key_event_handler>rand_movie');

            play_random();
            valid_key = true;
        }
    }

    // Watch only
    if (check_watch()) {
        if (isExitPlayer) {
            log('debug', 'keypress', 'initContent>bind_events>onkeyup>key_event_handler>exit_player');

            var button_exit_player_obj = object_handler('button_exit_player', null);
            if (button_exit_player_obj) {
                doClick(button_exit_player_obj);
                valid_key = true;
            }
        }

        if (isPrevEpisode) {
            log('debug', 'keypress', 'initContent>bind_events>onkeyup>key_event_handler>prev_episode');

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
            log('debug', 'keypress', 'initContent>bind_events>onkeyup>key_event_handler>next_episode');

            var button_next_episode_obj = object_handler('button_next_episode', null);
            if (button_next_episode_obj) {
                log('output', '', getLang('next_episode'));
                doClick(button_next_episode_obj);
                valid_key = true;
            } else {
                forceNextEpisode = true;
            }
        }

        if (isHideSubtitles) {
            log('debug', 'keypress', 'initContent>bind_events>onkeyup>key_event_handler>hide_subs');

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

    if (valid_key) {
        add_stats_count('stat_keyBinding');
        key_disabled = true;
        // In case activity for valid key was performed, pause all other assistant activities for a while
        setTimeout(function() {key_disabled = false;}, cfg['keyEventProcessingDelay']['val']);
    }

    key_pressed = '';
}

function wheel_event_handler(evt) {
    // Skip binding actions while reporting a problem or searching for titles
    if (check_search_bar() || check_problem_report() || check_options() || isOrphan) {
        return;
    }

    var valid_wheel = false;

    evt = evt || window.event;

    if (evt.deltaY < 0) {
        wheel_direction = 'up';
    } else if (evt.deltaY > 0) {
        wheel_direction = 'down';
    }

    log('debug', 'wheelturn', '[\'{0}\', {1}],', wheel_direction, evt.deltaY);

    // Global
    // Nothing yet

    // Tiles only
    if (check_browse() || check_latest() || check_title() || check_search()) {
        // Nothing yet
    }

    // Watch only
    if (check_watch()) {
        // While in player, mouse up/down should adjust player volume if enabled
        if (cfg['wheelVolume']['access'] && cfg['wheelVolume']['val'] != cfg['wheelVolume']['off']) {
            // If episode list is open or extension bubble is active, disable volume control
            if (!object_handler('player_episode_list') && !simulation_objects['netflex_bubble_container']) {
                try {var video = object_handler('player_video', null);} catch (e) {}
                if (video) {
                    log('debug', 'wheelturn', 'initContent>bind_events>onwheel>wheel_event_handler>change_volume');

                    var amount = cfg['wheelVolume']['val'];

                    if (wheel_direction == 'down') {
                        amount = amount * -1;
                    }

                    var new_volume = video.volume + amount;

                    if (new_volume > 1) {
                        new_volume = 1;
                    } else if (new_volume < 0) {
                        new_volume = 0;
                    }

                    video.volume = new_volume;
                    valid_wheel = true;
                }
            }
        }
    }

    if (valid_wheel) {
        add_stats_count('stat_wheelTurn');
    }

    wheel_direction = '';
}