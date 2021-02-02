function ratings_handler(object, object_id) {
    //debug_overflow_entry('ratings_handler', 2);

    try {
        var api_key = getApiKey('omdbApi', api_keys['omdb']);

        var ratings
        var current_time = new Date();
        var netflix_id = object_id;
        var title_id = 'nflx' + netflix_id; // Forcing to string due to problems with JSON.parse() generating empty values for all empty indexes (lets say movie ID is 99999 it would generate 99998 empty indexes in array)
        var title_name = '';

        if (title_name == '') {try {title_name = findChildClass(findChildClass(findChildClass(object, 'jawbone-title-link'), 'title'), 'text').innerText;} catch (e) {}}
        if (title_name == '') {try {title_name = findChildClass(findChildClass(findChildClass(object, 'jawbone-title-link'), 'title'), 'logo').getAttribute('alt');} catch (e) {}}
        if (title_name == '') {try {title_name = findChildClass(object, 'previewModal--player-titleTreatment-logo').getAttribute('alt');} catch (e) {}}
        if (title_name == '') {try {title_name = findChildClass(object, 'slider-refocus').getAttribute('aria-label');} catch (e) {}}
        if (title_name == '') {try {title_name = findChildClass(object, 'previewModal--boxart').getAttribute('alt');} catch (e) {}}
        if (title_name == '') {try {title_name = findChildClass(findChildClass(object, 'fallback-text'), 'fallback-text-container').innerText;} catch (e) {}}
        if (title_name == '') {try {title_name = findChildClass(object, 'title-logo').getAttribute('alt');} catch (e) {}}

        // Do not use private domain for custom user keys
        var omdb_url = 'https://private.omdbapi.com/';
        if (api_key != api_keys['omdb']) {
            omdb_url = 'https://omdbapi.com/';
        }

        // Initialize if missing
        if (!ratingsDB[ratings_version].hasOwnProperty(title_id)) {
            // Add data to ratings database
            handle_ratingsDB_entry(title_id, netflix_id, '', '', '', '', title_name, current_time, new Date().addMinutes(rating_expiration_init), '', 'init', 'N/A', 'N/A', 'N/A');
        }

        // Allocate WikiData know values
        var wikidata_url = '';
        if (ratingsDB[ratings_version][title_id]['urls']) {
            if (ratingsDB[ratings_version][title_id]['urls']['wikidata']) {
                wikidata_url = ratingsDB[ratings_version][title_id]['urls']['wikidata'];
            }
        }
        var imdb_id = '';
        if (ratingsDB[ratings_version][title_id]['ids']['imdb_id']) {
            imdb_id = ratingsDB[ratings_version][title_id]['ids']['imdb_id'];
        }
        var rt_id = '';
        if (ratingsDB[ratings_version][title_id]['ids']['rt_id']) {
            rt_id = ratingsDB[ratings_version][title_id]['ids']['rt_id'];
        }
        var meta_id = '';
        if (ratingsDB[ratings_version][title_id]['ids']['meta_id']) {
            meta_id = ratingsDB[ratings_version][title_id]['ids']['meta_id'];
        }

        // Start working
        if (!findChildClass(object, 'extension_rating_' + object_id) || ratingsDB[ratings_version][title_id]['state'] == 'init' || new Date(ratingsDB[ratings_version][title_id]['expire']) < current_time) {
            generate_ratings_object(object, object_id);

            // Any expired data should be set to init state as they need to be obtained again
            if (new Date(ratingsDB[ratings_version][title_id]['expire']) < current_time) {
                ratingsDB[ratings_version][title_id]['state'] = 'init';
            }

            // While we are waiting for ratings do not try to get another ratings of same ID
            if (ratingsDB[ratings_version][title_id]['state'] == 'pending') {
                return;
            }

            // Obtain missing data from WikiData API
            if (ratingsDB[ratings_version][title_id]['state'] == 'init') {
                add_stats_count('stat_loaded_api');
                var timestamp = new Date();
                var expiration = new Date().addMinutes(rating_expiration_pending);
                var state = 'pending';
                var details = '';
                var imdb = 'N/A';
                var rt = 'N/A';
                var meta = 'N/A';

                if (imdb_id == '') {
                    var sparql = 'SELECT (?item AS ?url) (COALESCE(?title, "") AS ?title) (COALESCE(?idIMDB, "N/A") AS ?idIMDB) (COALESCE(?idRT, "N/A") AS ?idRT) (COALESCE(?idMETA, "N/A") AS ?idMETA) WHERE { ?item wdt:P1874 "' + netflix_id + '". OPTIONAL {?item wdt:P1476 ?title.}  OPTIONAL {?item wdt:P345 ?idIMDB.} OPTIONAL {?item wdt:P1258 ?idRT.} OPTIONAL {?item wdt:P1712 ?idMETA.} } LIMIT 1';

                    log('debug', 'ratings', 'https://query.wikidata.org/#{0}', url_encode(sparql));

                    $.ajax({
                        // Configuration
                        type: 'GET',
                        url: 'https://query.wikidata.org/sparql?',
                        timeout: 10000,
                        cache: false,
                        async: true,
                        crossDomain: true,
                        dataType: 'json',
                        //global: true, // ajaxStart/ajaxStop
                        // Data
                        data: {
                            query: sparql,
                            origin: 'https://www.netflix.com'
                        },
                        // Actions
                        beforeSend: function() {
                            // Add data to ratings database
                            add_stats_count('stat_wiki_call');
                            handle_ratingsDB_entry(title_id, netflix_id, wikidata_url, imdb_id, rt_id, meta_id, title_name, timestamp, expiration, details, state, imdb, rt, meta);
                        },
                        success: function(result, status, xhr) {
                            if (result['results']['bindings'].length != 0) {
                                // Found
                                state = 'wikidata_finished';
                                wikidata_url = result['results']['bindings'][0]['url']['value'];
                                title_name = nvl(result['results']['bindings'][0]['title']['value'], title_name);
                                imdb_id = result['results']['bindings'][0]['idIMDB']['value'];
                                rt_id = result['results']['bindings'][0]['idRT']['value'];
                                meta_id = result['results']['bindings'][0]['idMETA']['value'];
                                expiration = new Date().addDays(-1);

                                if (imdb_id == '' || imdb_id == 'N/A') {
                                    state = 'wikidata_imdb_not_available';
                                    add_stats_count('stat_wikidata_imdb_not_available');
                                    expiration = new Date().addHours(rating_expiration_imdb_not_found_wiki);
                                    details = getLang('ratings_imdb_id_not_found');

                                    log('debug', 'ratings', 'Rating for "{0}" ({1}) not obtained. Reason: {2}', title_name, netflix_id, details);
                                } else {
                                    add_stats_count('stat_wikidata_finished');
                                }
                            } else {
                                // Not found
                                state = 'wikidata_not_available';
                                add_stats_count('stat_wikidata_not_available');
                                expiration = new Date().addHours(rating_expiration_not_found_wiki);
                                details = getLang('ratings_no_data_wikidata');

                                log('debug', 'ratings', 'IMDb ID for "{0}" ({1}) not obtained. Reason: {2}', title_name, netflix_id, details);
                            }
                        },
                        error: function(xhr, status, error) {
                            var resp = xhr.responseJSON;
                            if (resp) {
                                if (resp.hasOwnProperty('Error')) {
                                    error = resp['Error'];
                                }
                            }
                            if (error == '') {
                                error = getLang('ratings_unknown_error');
                            }

                            state = 'wikidata_error';
                            expiration = new Date().addHours(rating_expiration_error_wiki);

                            if (status === 'timeout') {
                                // Timeout
                                state = 'wikidata_timeout';
                                add_stats_count('stat_wikidata_timeout');
                                expiration = new Date().addHours(rating_expiration_timeout_wiki);
                                details = error;
                            } else {
                                // Error
                                add_stats_count('stat_wikidata_error');
                                details = fillArgs(getLang('ratings_error_message'), error, status);
                            }
                        },
                        complete: function(xhr, status) {
                            timestamp = new Date();

                            // Add data to ratings database
                            handle_ratingsDB_entry(title_id, netflix_id, wikidata_url, imdb_id, rt_id, meta_id, title_name, timestamp, expiration, details, state, imdb, rt, meta);

                            if (state != 'wikidata_finished') {
                                // Add data to pre-generated elements from ratings database
                                handle_rating_values(object, object_id);
                            }
                        }
                    });
                }

                if (imdb_id != '' && imdb_id != 'N/A') {
                    log('debug', 'ratings',  '{0}?i={1}&apikey={2}&r=json&v=1', omdb_url, imdb_id, api_key);

                    // Look up data about title and add them to pre-generated elements
                    $.ajax({
                        // Configuration
                        type: 'GET',
                        url: omdb_url,
                        timeout: 10000,
                        cache: true,
                        async: true,
                        crossDomain: true,
                        dataType: 'json',
                        global: true, // ajaxStart/ajaxStop
                        // Data
                        data: {
                            i: imdb_id,
                            apikey: api_key,
                            r: 'json',
                            v: 1
                        },
                        // Actions
                        beforeSend: function() {
                            // Add data to ratings database
                            add_stats_count('stat_api_call');
                            handle_ratingsDB_entry(title_id, netflix_id, wikidata_url, imdb_id, rt_id, meta_id, title_name, timestamp, expiration, details, state, imdb, rt, meta);
                        },
                        success: function(result, status, xhr) {
                            ratings_limit_reached = false;
                            var resp = result;

                            if (resp['Response'] == 'True') {
                                // Found
                                var ratings = resp['Ratings'];
                                state = 'api_finished';
                                expiration = new Date().addDays(rating_expiration_found);

                                add_stats_count('stat_api_finished');
                                for (var i = 0; i < ratings.length; i++) {
                                    if (ratings[i]['Source'] == 'Internet Movie Database') {
                                        imdb = ratings[i]['Value'];
                                    }
                                    if (ratings[i]['Source'] == 'Rotten Tomatoes') {
                                        rt = ratings[i]['Value'];
                                    }
                                    if (ratings[i]['Source'] == 'Metacritic') {
                                        meta = ratings[i]['Value'];
                                    }
                                }
                            } else {
                                // Not found
                                state = 'api_not_available';
                                add_stats_count('stat_api_not_available');
                                expiration = new Date().addDays(rating_expiration_not_found);
                                details = resp['Error'];

                                log('debug', 'ratings', 'Rating for "{0}" ({1}) not obtained. Reason: {2}', title_name, netflix_id, resp['Error']);
                            }
                        },
                        error: function(xhr, status, error) {
                            var resp = xhr.responseJSON;
                            if (resp) {
                                if (resp.hasOwnProperty('Error')) {
                                    error = resp['Error'];
                                }
                            }
                            if (error == '') {
                                error = getLang('ratings_unknown_error');
                            }

                            state = 'api_error';
                            expiration = new Date().addDays(rating_expiration_error);

                            if (status === 'timeout') {
                                // Timeout
                                state = 'api_timeout';
                                add_stats_count('stat_api_timeout');
                                expiration = new Date().addDays(rating_expiration_timeout);
                                details = error;
                            } else {
                                if (error == 'Request limit reached!') {
                                    ratings_limit_reached = true;

                                    state = 'api_limit';
                                    add_stats_count('stat_api_limit');
                                    expiration = new Date().addDays(rating_expiration_limit);
                                } else if (error == 'Invalid API key!') {
                                    state = 'api_invalid';
                                    add_stats_count('stat_api_invalid');
                                    expiration = new Date().addHours(rating_expiration_invalid_key);
                                } else {
                                    // Error
                                    add_stats_count('stat_api_error');
                                    details = fillArgs(getLang('ratings_error_message'), error, status);
                                }

                            }
                        },
                        complete: function(xhr, status) {
                            timestamp = new Date();

                            // Add data to ratings database
                            handle_ratingsDB_entry(title_id, netflix_id, wikidata_url, imdb_id, rt_id, meta_id, title_name, timestamp, expiration, details, state, imdb, rt, meta);

                            // Add data to pre-generated elements from ratings database
                            handle_rating_values(object, object_id);
                        }
                    });
                }
            } else {
                // Add data to pre-generated elements from ratings database
                add_stats_count('stat_loaded_storage');
                handle_rating_values(object, object_id);
            }
        }
    } catch (e) {
        if (title_id) {
            // Add data to ratings database
            handle_ratingsDB_entry(title_id, netflix_id, wikidata_url, imdb_id, rt_id, meta_id, title_name, new Date(), new Date().addDays(rating_expiration_error), e.message, 'error', 'N/A', 'N/A', 'N/A');

            // Add data to pre-generated elements from ratings database
            handle_rating_values(object, object_id);
        }

        log('error', 'ratings', 'There was an error obtaining ratings. Error: {0}', e.message);
    }
}

function handle_ratingsDB_entry(title_id, netflix_id, wikidata_url, imdb_id, rt_id, meta_id, title_name, last_sync, expire, details, state, imdb, rt, meta) {
    var old_entry = null;
    var old_state = null;
    try {
        old_entry = ratingsDB[ratings_version][title_id];
        old_state = old_entry['state'];
    } catch (e) { }

    // Add data to ratings database
    ratingsDB[ratings_version][title_id] = {
        'ids': {
            'title_id': title_id,
            'netflix_id': netflix_id,
            'imdb_id': imdb_id,
            'rt_id': rt_id,
            'meta_id': meta_id
        },
        'title_name': title_name,
        'urls': {
            'wikidata': wikidata_url
        },
        'last_sync': JSON.stringify(last_sync).replace(/\"/gi, ''),
        'expire': JSON.stringify(expire).replace(/\"/gi, ''),
        'details': details,
        'state': state,
        'ratings': {
            'imdb': imdb,
            'rt': rt,
            'meta': meta
        }
    };

    log('group_start', 'ratings', 'Ratings local DB changes for {0}', title_id);
    log('debug', 'ratings', 'Rating entry updated.');
    log('debug', 'ratings', 'Old state="{0}" => New state="{1}"', old_state, ratingsDB[ratings_version][title_id]['state']);
    log('debug', 'ratings', 'Old entry:');
    log('debug', 'ratings', old_entry);
    log('debug', 'ratings', 'New entry:');
    log('debug', 'ratings', ratingsDB[ratings_version][title_id]);
    log('group_end', 'ratings', '');
}

function generate_ratings_object(object, object_id) {
    // If object does not exist create it
    var elm = findChildClass(object, 'extension_rating_' + object_id);
    if (!elm) {
        // Pre-generate elements
        if (findChildClass(object, 'jawBoneContainer')) {
            var parent = findChildClass(object, 'jawbone-overview-info');
            var position_object = findChildClass(object, 'video-meta');
            var add_position = 'after';
            var classes = ' meta video-meta';
            var rating_main_style = {'font-size': '.9vw', 'margin-top': '1em'};
            var rating_content_style = {};
            var rating_style = {'margin-right': '1em'};
            var loader_style = {'position':'absolute'};
            var loader_image_style = 'font-size: .9vw; font-weight: bold;';
        }/* else if (findChildClass(object, 'previewModal--detailsMetadata')) {
            var parent = findChildClass(object, 'previewModal--detailsMetadata-left');
            var position_object = findChildClass(object, 'preview-modal-synopsis');
            var add_position = 'before';
            var classes = ' meta video-meta';
            var rating_main_style = {'font-size': '.9vw', 'margin-top': '1em'};
            var rating_content_style = {};
            var rating_style = {'margin-right': '1em'};
            var loader_style = {'position':'absolute'};
            var loader_image_style = 'font-size: .9vw; font-weight: bold;';
        }*/ else if (findChildClass(object, 'ptrack-content') || findChildClass(object, 'previewModal--info-container')) {
            var add_position = 'after';
            var is_positionable = true;
            var position_from_top_spacer = 0;
            var position_from_bottom_spacer = 0;
            var position_from_left_spacer = 0;
            var position_from_right_spacer = 0;

            if (findChildClass(object, 'boxart-tall-panel') && findChildClass(object, 'boxart-image-tall')) {
                var parent = findChildClass(object, 'boxart-tall-panel');
                var position_object = findChildClass(object, 'boxart-image-tall');
            } else if (findChildClass(object, 'slider-refocus') && findChildClass(object, 'boxart-rounded')) {
                var parent = findChildClass(object, 'slider-refocus');
                var position_object = findChildClass(object, 'boxart-rounded');
            } else if (findChildClass(object, 'bob-overview') && findChildClass(object, 'bob-title')) {
                var parent = findChildClass(object, 'bob-overview');
                var position_object = findChildClass(object, 'bob-title');
            } else if (findChildClass(object, 'previewModal--player_container') && findChildClass(object, 'videoMerchPlayer--boxart-wrapper')) {
                var parent = findChildClass(object, 'previewModal--player_container');
                var position_object = findChildClass(object, 'videoMerchPlayer--boxart-wrapper');
            } else if (findChildClass(object, 'titleCard-imageWrapper') && findChildClass(object, 'ptrack-content')) {
                var parent = findChildClass(object, 'titleCard-imageWrapper');
                var position_object = findChildClass(object, 'ptrack-content');
                var position_from_top_spacer = 10;
            } else if (findChildClass(object, 'logo-and-text meta-layer') && findChildClass(object, 'titleWrapper')) {
                var parent = findChildClass(object, 'logo-and-text meta-layer');
                var position_object = findChildClass(object, 'titleWrapper');
                var is_positionable = false;
                var position_from_top_spacer = 125;
                var position_from_left_spacer = -5;
            }

            var position_from_top_base = 5;
            var position_from_top = position_from_top_base + position_from_top_spacer;
            var position_from_bottom_base = 5;
            var position_from_bottom = position_from_bottom_base + position_from_bottom_spacer;
            var position_from_left_base = 5;
            var position_from_left = position_from_left_base + position_from_left_spacer;
            var position_from_right_base = 5;
            var position_from_right = position_from_right_base + position_from_right_spacer;

            var position_split = cfg['ratingsTilePosition']['val'].split('_');
            var position_y = position_split[0];
            var position_x = position_split[1];

            var classes = '';
            var rating_main_style = {'display': 'table-cell', 'position':'absolute', 'top': '5px', 'z-index': '1', 'margin': '5px', 'width': '90%', 'height': '70%'};
            var rating_content_style = {'display': 'inline-block', 'padding': '3px', 'padding-left': '5px', 'font-size': '12px', 'position':'absolute', 'text-align': 'left', 'left':position_from_left + 'px', 'top':position_from_top + 'px'};
            var rating_style = {'display': 'block'};
            var loader_style = {'position':'absolute'};
            var loader_image_style = 'font-size: 24px;';

            if (cfg['ratingsTileTextAlign']['access']) {
                switch (cfg['ratingsTileTextAlign']['val']) {
                    case 'left':
                    case 'right':
                    case 'center':
                        rating_content_style['text-align'] = cfg['ratingsTileTextAlign']['val'];
                        break;
                    case 'same_as_position':
                        rating_content_style['text-align'] = position_x;
                        break;
                }
            }

            if (cfg['ratingsTilePosition']['access'] && is_positionable) {
                var translateX = '-0%';
                var translateY = '-0%';

                switch (position_x) {
                    case 'left':
                        rating_content_style['left'] = position_from_left + 'px';
                        rating_content_style['right'] = '';
                        break;
                    case 'right':
                        rating_content_style['left'] = '';
                        rating_content_style['right'] = position_from_right + 'px';
                        break;
                    case 'center':
                        rating_content_style['left'] = '50%';
                        rating_content_style['right'] = '';
                        translateX = '-50%';
                        break;
                }
                switch (position_y) {
                    case 'top':
                        rating_content_style['top'] = position_from_top + 'px';
                        rating_content_style['bottom'] = '';
                        break;
                    case 'bottom':
                        rating_content_style['top'] = '';
                        rating_content_style['bottom'] = position_from_bottom_base + 'px';
                        break;
                    case 'middle':
                        rating_content_style['top'] = '50%';
                        rating_content_style['bottom'] = '';
                        translateY = '-50%';
                        break;
                }

                rating_content_style['transform'] = fillArgs('translate({0}, {1})', translateX, translateY);
            }

            if (cfg['ratingsTileSize']['access']) {
                rating_content_style['font-size'] = cfg['ratingsTileSize']['val'] + 'px';
                loader_image_style = 'font-size: ' + (cfg['ratingsTileSize']['val'] * 2) + 'px;';
            }
        }

        // Pre-generate loader animation
        loader = fillArgs('<i class="fas fa-spinner fa-pulse" title="{0}" style="{1}"></i>', getLang('data_loading'), loader_image_style + ' font-weight: bold; stroke: #000000; stroke-width: 15px; text-shadow: 0px 0px 3px #000000;');

        var el_main = document.createElement('div');
        el_main.setAttribute('class', 'extension_rating extension_rating_' + object_id + classes);
        el_main.setAttribute('netflex_expiration', JSON.stringify(new Date().addMinutes(1)).replace(/\"/gi, ''));
        el_main.setAttribute('netflex_change', JSON.stringify(new Date()).replace(/\"/gi, ''));
        el_main.setAttribute('netflex_position', cfg['ratingsTilePosition']['val']);
        el_main.setAttribute('netflex_size', cfg['ratingsTileSize']['val']);
        el_main.setAttribute('netflex_align', cfg['ratingsTileTextAlign']['val']);
        el_main.setAttribute('netflex_anchors', cfg['ratingsAnchors']['val']);
        el_main.setAttribute('netflex_wiki_anchors', cfg['ratingsWikidataAnchors']['val']);
        addCSS(el_main, rating_main_style);

        var el_content = document.createElement('span');
        el_content.setAttribute('class', 'extension_rating_content');
        addCSS(el_content, rating_content_style);

        var el_load = document.createElement('span');
        el_load.setAttribute('class', 'extension_rating_loader');
        addDOM(el_load, loader);
        addCSS(el_load, loader_style);

        var el1 = document.createElement('span');
        el1.setAttribute('class', 'extension_rating_imdb');
        addCSS(el1, rating_style);

        var el2 = document.createElement('span');
        el2.setAttribute('class', 'extension_rating_rt');
        addCSS(el2, rating_style);

        var el3 = document.createElement('span');
        el3.setAttribute('class', 'extension_rating_meta');
        addCSS(el3, rating_style);

        el_content.appendChild(el_load);
        el_content.appendChild(el1);
        el_content.appendChild(el2);
        el_content.appendChild(el3);
        el_main.appendChild(el_content);
        if (add_position == 'before') {
            parent.insertBefore(el_main, position_object);
        } else {
            parent.insertBefore(el_main, position_object.nextSibling);
        }

        // Prevent starting of title when clicked on object with ratings
        findChildClass(object, 'extension_rating_content').addEventListener('click', function(e) { logEvent('generate_ratings_object > preventDefault'); stop_propagation(e); });
    }
}

function handle_rating_values(object, object_id) {
    //debug_overflow_entry('handle_rating_values', 1);

    var anchor_start = '';
    var anchor_end = '';
    var ratings_data = '';
    var ratings_shown = 0;
    var no_rating_provided = false;
    var title_id = 'nflx' + nvl(object_id, 'Unknown');

    try {
        generate_ratings_object(object, object_id);

        if (object_id == '') {
            log('debug', 'ratings', 'Unable to obtain title ID.');

            // Stop loading
            //addDOM(findChildClass(object, 'extension_rating_loader'), '');
            addCSS(findChildClass(object, 'extension_rating_loader'), {'display': 'none'});
            addDOM(findChildClass(object, 'extension_rating_imdb'), getLang('rating_id_not_found'));
        } else {
            // If somehow we are updating init/pending rating, we stop until init/pending state is not resolved
            if (   ratingsDB[ratings_version][title_id]['state'] == 'init'
                || ratingsDB[ratings_version][title_id]['state'] == 'pending') {
                return;
            }

            // Stop loading
            //addDOM(findChildClass(object, 'extension_rating_loader'), '');
            addCSS(findChildClass(object, 'extension_rating_loader'), {'display': 'none'});

            log('debug', 'ratings', 'Stored rating entry:');
            log('debug', 'ratings', ratingsDB[ratings_version][title_id]);

            // Generate data for IMDb ratings
            if (ratingsDB[ratings_version][title_id]['ratings']['imdb'] != 'N/A') {
                anchor_start = '';
                anchor_end = '';
                if (ratingsDB[ratings_version][title_id]['ids']['imdb_id']) {
                    if (ratingsDB[ratings_version][title_id]['ids']['imdb_id'] != 'N/A' && cfg['ratingsAnchors']['val'] && cfg['ratingsAnchors']['access']) {
                        anchor_start = '<a href="https://www.imdb.com/title/' + ratingsDB[ratings_version][title_id]['ids']['imdb_id'] + '/" style="text-decoration: underline; cursor: pointer;" target="_blank">';
                        anchor_end = '</a>';
                    }
                }
                ratings_data = anchor_start + getLang('rating_imdb') + anchor_end + ': ' + ratingsDB[ratings_version][title_id]['ratings']['imdb'];
                addDOM(findChildClass(object, 'extension_rating_imdb'), ratings_data);
                log('debug', 'ratings', 'IMDb: {0}', ratingsDB[ratings_version][title_id]['ratings']['imdb']);
                ratings_shown++;
            }
            // Generate data for RottenTomatoes ratings
            if (ratingsDB[ratings_version][title_id]['ratings']['rt'] != 'N/A') {
                anchor_start = '';
                anchor_end = '';
                if (ratingsDB[ratings_version][title_id]['ids']['rt_id']) {
                    if (ratingsDB[ratings_version][title_id]['ids']['rt_id'] != 'N/A' && cfg['ratingsAnchors']['val'] && cfg['ratingsAnchors']['access']) {
                        anchor_start = '<a href="https://www.rottentomatoes.com/' + ratingsDB[ratings_version][title_id]['ids']['rt_id'] + '" style="text-decoration: underline; cursor: pointer;" target="_blank">';
                        anchor_end = '</a>';
                    }
                }
                ratings_data = anchor_start + getLang('rating_rt') + anchor_end + ': ' + ratingsDB[ratings_version][title_id]['ratings']['rt'];
                addDOM(findChildClass(object, 'extension_rating_rt'), ratings_data);
                log('debug', 'ratings', 'RT: {0}', ratingsDB[ratings_version][title_id]['ratings']['rt']);
                ratings_shown++;
            }
            // Generate data for Metacritic ratings
            if (ratingsDB[ratings_version][title_id]['ratings']['meta'] != 'N/A') {
                anchor_start = '';
                anchor_end = '';
                if (ratingsDB[ratings_version][title_id]['ids']['meta_id']) {
                    if (ratingsDB[ratings_version][title_id]['ids']['meta_id'] != 'N/A' && cfg['ratingsAnchors']['val'] && cfg['ratingsAnchors']['access']) {
                        anchor_start = '<a href="https://www.metacritic.com/' + ratingsDB[ratings_version][title_id]['ids']['meta_id'] + '" style="text-decoration: underline; cursor: pointer;" target="_blank">';
                        anchor_end = '</a>';
                    }
                }
                ratings_data = anchor_start + getLang('rating_meta') + anchor_end + ': ' + ratingsDB[ratings_version][title_id]['ratings']['meta'];
                addDOM(findChildClass(object, 'extension_rating_meta'), ratings_data);
                log('debug', 'ratings', '{0}', ratingsDB[ratings_version][title_id]['ratings']['meta']);
                ratings_shown++;
            }

            // Generate data if no ratings are available
            if (ratings_shown == 0) {
                if (ratingsDB[ratings_version][title_id]['state'] == 'limit') {
                    // When daily API limit is reached
                    addDOM(findChildClass(object, 'extension_rating_imdb'), getLang('rating_daily_limit'));
                    log('debug', 'ratings', 'Ratings daily limit reached.');
                } else if (ratingsDB[ratings_version][title_id]['state'] == 'invalid') {
                    // When API key is invalid
                    addDOM(findChildClass(object, 'extension_rating_imdb'), getLang('rating_invalid_key'));
                    log('debug', 'ratings', 'Invalid API key provided.');
                } else {
                    // When everything seems fine only no ratings are available
                    no_rating_provided = true;
                    if (!ratingsDB[ratings_version][title_id]['details']) {
                        ratingsDB[ratings_version][title_id]['details'] = getLang('ratings_no_data_omdb_api');
                    }

                    var wiki_link = '';

                    if (
                        (
                           ratingsDB[ratings_version][title_id]['state'] == 'wikidata_not_available'
                        || ratingsDB[ratings_version][title_id]['state'] == 'wikidata_imdb_not_available'
                        ) && cfg['ratingsWikidataAnchors']['val'] && cfg['ratingsWikidataAnchors']['access']
                    ) {
                        var wiki_link_content = '';
                        var refresh_button = fillArgs('<a href="javascript:void(0);" class="ratings_wiki_refresh_{0}"><i class="fas fa-sync-alt ratings_wiki_refresh_{0}_icon"></i></a>', title_id);

                        if (ratingsDB[ratings_version][title_id]['state'] == 'wikidata_not_available') {
                            if (ratingsDB[ratings_version][title_id]['title_name']) {
                                wiki_link_content = fillArgs(getLang('ratings_wiki_missing_netflix_id'), ratingsDB[ratings_version][title_id]['ids']['netflix_id'], 'https://www.wikidata.org/w/index.php?search=' + url_encode(ratingsDB[ratings_version][title_id]['title_name']) + '&netflix_id=' + ratingsDB[ratings_version][title_id]['ids']['netflix_id'], refresh_button);
                            }
                        } else if (ratingsDB[ratings_version][title_id]['state'] == 'wikidata_imdb_not_available') {
                            if (ratingsDB[ratings_version][title_id]['urls']['wikidata'] && ratingsDB[ratings_version][title_id]['title_name']) {
                                var search_engine = 'https://www.google.com/search?q=';
                                if (isEdgeChromium) {
                                    search_engine = 'https://www.bing.com/search?q=';
                                }
                                wiki_link_content = fillArgs(getLang('ratings_wiki_missing_imdb_id'), search_engine + url_encode(ratingsDB[ratings_version][title_id]['title_name']) + ' IMDb', ratingsDB[ratings_version][title_id]['urls']['wikidata'], refresh_button);
                            }
                        }

                        if (wiki_link_content != '') {
                            wiki_link = '<br><span style="font-size: 10px;">' + wiki_link_content + '</span>';
                        }
                    }

                    addDOM(findChildClass(object, 'extension_rating_imdb'), getLang('rating_no_rating') + wiki_link);
                    var elm = findChildClass(object, 'ratings_wiki_refresh_' + title_id);
                    if (elm) {
                        elm.addEventListener('click', function() { logEvent('handle_rating_values > ratings_wiki_refresh'); ratings_wiki_refresh(this); });
                        elm.addEventListener('mouseenter', function() { logEvent('handle_rating_values > ratings_wiki_refresh > enter'); ratings_icon_animate(this, true); });
                        elm.addEventListener('mouseleave', function() { logEvent('handle_rating_values > ratings_wiki_refresh > leave'); ratings_icon_animate(this, false); });
                    }
                    log('debug', 'ratings', 'No ratings shown.');
                }
            }
        }
    } catch (e) {
        log('error', 'ratings', 'Error showing ratings: {0}', e.message);

        try {
            addDOM(findChildClass(object, 'extension_rating_imdb'), getLang('rating_display_error'));
        } catch (e) {
            log('error', 'ratings', 'Error showing ratings error: {0}', e.message);
        }
    }

    try {
        if (object_id != '') {
            var reason = '';
            if (no_rating_provided && ratingsDB[ratings_version][title_id]['details']) {
                reason = "\n" + fillArgs(getLang('ratings_reason'), ratingsDB[ratings_version][title_id]['details'].replace(/\.$/, ""));
            }

            var local_timestamp = new Date(ratingsDB[ratings_version][title_id]['expire']).toLocaleString(undefined, date_format['full']);
            findChildClass(findChildClass(object, 'extension_rating_' + object_id), 'extension_rating_content').setAttribute('title', fillArgs(getLang('rating_next_refresh'), local_timestamp) + reason);
            findChildClass(object, 'extension_rating_' + object_id).setAttribute('netflex_title_id', title_id);
            findChildClass(object, 'extension_rating_' + object_id).setAttribute('netflex_expiration', JSON.stringify(ratingsDB[ratings_version][title_id]['expire']).replace(/\"/gi, ''));
            findChildClass(object, 'extension_rating_' + object_id).setAttribute('netflex_change', JSON.stringify(ratingsDB[ratings_version][title_id]['last_sync']).replace(/\"/gi, ''));
        }
    } catch (e) {}

    // Add nice touch to shown ratings object
    addCSS(findChildClass(object, 'extension_rating_content'), {'border-radius': '5px', 'background': 'rgba(0,0,0,0.8)', ' max-width': '120px;'});
}

function stop_propagation(event) {
    event.stopImmediatePropagation();
}

function ratings_wiki_refresh(object) {
    if (object) {
        var obj_class = object.className;
        var title_id = obj_class.replace('ratings_wiki_refresh_', '');

        force_rating_refresh(title_id);
    }
}

function ratings_icon_animate(object, animate) {
    if (object) {
        var obj_class = object.className;
        var elm = findChildClass(object, obj_class + '_icon');

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
}

function remove_expired() {
    var count = 0;

    // Find all expired titles and delete them
    for (var title_id in ratingsDB[ratings_version]) {
        if (ratingsDB[ratings_version].hasOwnProperty(title_id)) {
            var current_time = new Date();
            var expiration_time = new Date(ratingsDB[ratings_version][title_id]['expire']);
            if (expiration_time < current_time) {
                if (count == 0) {
                    log('group_start', 'ratings', 'Ratings local DB expires');
                }
                count++;
                log('debug', 'ratings', 'Deleting expired rating {0}:', title_id);
                log('debug', 'ratings', ratingsDB[ratings_version][title_id]);

                delete ratingsDB[ratings_version][title_id];
            }
        }
    }

    if (count > 0) {
        log('group_end', 'ratings', '');
    }
}

function force_rating_refresh(title_id) {
    if (ratingsDB[ratings_version][title_id]) {
        ratingsDB[ratings_version][title_id]['expire'] = JSON.stringify(new Date().addSeconds(2)).replace(/\"/gi, '');
        var elms = document.getElementsByClassName('extension_rating_' + ratingsDB[ratings_version][title_id]['ids']['netflix_id']);
        for (var i = 0; i < elms.length; i++) {
            elms[i].setAttribute('netflex_expiration', JSON.stringify(ratingsDB[ratings_version][title_id]['expire']).replace(/\"/gi, ''));
            addCSS(findChildClass(elms[i], 'extension_rating_loader'), {'display': 'block'});
            addCSS(findChildClass(elms[i], 'extension_rating_content'), {'background': 'transparent'});
            addDOM(findChildClass(elms[i], 'extension_rating_imdb'), '');
            addDOM(findChildClass(elms[i], 'extension_rating_rt'), '');
            addDOM(findChildClass(elms[i], 'extension_rating_meta'), '');
        }
    }
}

function netflix_ratings() {
    // If we have ratings turned on perform activities with ratings, else remove
    // all instances of ratings, but keep already gathered data
    if (cfg['showRatings']['val'] && cfg['showRatings']['access']) {
        // Check if there is new ratings version and if yes, perform cleanup and define new version
        if (!ratingsDB[ratings_version]) {
            // Remove old values
            ratingsDB = {};
            // Define scope for new version
            ratingsDB[ratings_version] = {};
        }

        // Prevent all actions when upsell information is shown to avoid unwanted Netflix plan changes
        if (check_upsell()) {
            return;
        }

        if (check_browse() || check_latest() || check_title() || check_search()) {
            // Find valid ratings containers
            var containers = object_handler('ratings_elements', null);

            // Loop trough each container to handle ratings
            for (var i = 0; i < containers.length; i++) {
                var object = containers[i];

                // Extract title ID
                var hasDetails = false;
                var object_id = '';
                var object_class = '';
                if (object.className) {
                    object_class = object.className;
                }

                // Old Netflix UI
                if (object_id == '' && object.id && object_class.includes('jawBoneContainer')) {
                    object_id = object.id;
                    hasDetails = true;
                }
                // Current Netflix UI
                if (object_id == '' && object_class.includes('previewModal--container detail-modal')) {
                    var parameters = ((window.location.search != '') ? (window.location.search + '&').replace('?','').split('&') : '');
                    for (var j = 0; j < parameters.length; j++) {
                        var param = parameters[j];
                        if (param.startsWith('jbv=')) {
                            object_id = param.replace('jbv=','');
                            break;
                        }
                    }
                    hasDetails = true;
                }
                if (object_id == '' && check_title() && object_class.includes('previewModal--container detail-modal')) {
                    object_id = window.location.pathname.replace('/title/','');
                    hasDetails = true;
                }
                if (object_id == '' && (
                       object_class.includes('previewModal--container mini-modal')
                    || object_class.includes('bob-card')
                    || object_class.includes('volatile-billboard-animations-container')
                    || object_class.includes('titleCard--container')
                )) {
                    try {
                        object_id = JSON.parse(decodeURIComponent((findChildClass(object, 'ptrack-content').getAttribute('data-ui-tracking-context'))), JSON.dateParse)['video_id'];
                    } catch (e) {}
                }
                if (object_id == '' && object_class.includes('slider-refocus title-card')) {
                    object_id = (findChildClass(object, 'slider-refocus').getAttribute('href').replace('/watch/','') + '?').split('?')[0];
                }

                // Object ID that is not a number is invalid
                if (isNaN(object_id)) {
                    object_id = '';
                }

                // Some object may cause too much requests, so unless we already have their data
                // or proactive ratings collection is allowed, we skip
                if (object_id != '' && (
                       object_class.includes('slider-refocus title-card')
                    || object_class.includes('titleCard--container')
                )) {
                    // WARNING: Setting enableProactiveRatings to true will eat trough OMDB API key limit like crazy
                    if (!enableProactiveRatings) {
                        if (!ratingsDB[ratings_version].hasOwnProperty('nflx' + object_id)) {
                            continue;
                        }
                    }
                }

                // If we cannot get title ID we cannot continue
                if (object_id == '') {
                    if (!findChildClass(object, 'extension_rating_unknown') && hasDetails) {
                        handle_rating_values(object, '');
                    }
                    continue;
                }

                // Find out if ratings are expired
                var has_expired = false;
                try {
                    if (new Date(ratingsDB[ratings_version]['nflx' + object_id]['expire']) < new Date()) {
                        has_expired = true;
                    }
                } catch (e) {
                    has_expired = true;
                }

                // Check if objects that show ratings are available
                if (   findChildClass(object, 'jawbone-overview-info') && findChildClass(object, 'video-meta')
                    || findChildClass(object, 'logo-and-text meta-layer') && findChildClass(object, 'titleWrapper')
                    || findChildClass(object, 'previewModal--detailsMetadata-left') && findChildClass(object, 'preview-modal-synopsis')
                    || findChildClass(object, 'previewModal--metadatAndControls-container') && findChildClass(object, 'buttonControls--container mini-modal')
                    || findChildClass(object, 'bob-overview') && findChildClass(object, 'bob-title')
                    || findChildClass(object, 'titleCard-imageWrapper') && findChildClass(object, 'ptrack-content')
                    || findChildClass(object, 'slider-refocus')) {
                    // Get ratings only if ratings element is missing or expired
                    if (!findChildClass(object, 'extension_rating_' + object_id) || has_expired) {
                        log('debug', 'ratings', 'Getting ratings for ID {0}.', object_id);
                        ratings_handler(object, object_id);
                    } else {
                        // Check for last change and update element if changed
                        var change_time_db = JSON.stringify(ratingsDB[ratings_version]['nflx' + object_id]['last_sync']).replace(/\"/gi, '');
                        var change_time_elm = findChildClass(object, 'extension_rating_' + object_id).getAttribute('netflex_change');
                        if (change_time_db != change_time_elm && change_time_elm) {
                            handle_rating_values(object, object_id);
                        }
                    }
                }
            }
        }

        // Store ratings database to local storage
        localStorage.setItem('netflex_ratingsDB', JSON.stringify(ratingsDB));

        // Find all expired titles and delete them
        remove_expired();

        // Remove shown elements to refresh ratings data that does not meet required conditions
        var elms = document.getElementsByClassName('extension_rating');
        for (var i = 0; i < elms.length; i++) {
            var current_time = new Date();

            var expiration_time = new Date(elms[i].getAttribute('netflex_expiration'));
            var position = elms[i].getAttribute('netflex_position');
            var size = elms[i].getAttribute('netflex_size');
            var align = elms[i].getAttribute('netflex_align');
            var anchors = elms[i].getAttribute('netflex_anchors');
            var wiki_anchors = elms[i].getAttribute('netflex_wiki_anchors');

            if (   expiration_time < current_time
                || cfg['ratingsTilePosition']['val'] != position
                || cfg['ratingsTileSize']['val'] != size
                || cfg['ratingsTileTextAlign']['val'] != align
                || cfg['ratingsAnchors']['val'].toString() != anchors
                || cfg['ratingsWikidataAnchors']['val'].toString() != wiki_anchors
            ) {
                removeDOM(elms[i]);
            }
        }
    } else {
        // Remove all elements related to ratings
        var elms = document.getElementsByClassName('extension_rating');
        for (var i = 0; i < elms.length; i++) {
            removeDOM(elms[i]);
        }

        // Find all expired titles and delete them to free storage even when ratings are not used
        remove_expired();
    }
}