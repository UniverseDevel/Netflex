function load_api_keys() {
    var keys = {
        'omdb': 'YOUR_SECRET_KEY'
    };
    return keys;
};

function load_donation_urls() {
    var donations = {
        'paypal': 'https://www.paypal.com/donate?hosted_button_id=YOUR_BUTTON_ID',
        'patreon': 'https://www.patreon.com/YOUR_PATREON'
    };
    return donations;
};

function load_stores_urls() {
    var stores = {
        'chrome': 'https://chrome.google.com/webstore/detail/' + extension_id,
        'edge': 'https://microsoftedge.microsoft.com/addons/detail/' + extension_id,
        'firefox': 'https://addons.mozilla.org/firefox/addon/' + extension_id,
        'opera': 'https://addons.opera.com/extensions/details/YOUR_EXTENSION_ID/',
        'unknown': ''
    };
    return stores;
}

function load_source_urls() {
    var source = {
        'github': 'https://github.com/YOUR_PROFILE_NAME/YOUR_PROJECT_NAME/'
    };
    return source;
};

function load_news_urls() {
    var news = {
        'news': 'YOUR_NEWS_URL'
    };
    return news;
};

function load_prod_ids() {
    // As there is no other way to find out if unpacked extension is used on Firefox, we have to specify IDs for production extensions
    // Note: in non Firefox extensions 'extension_manifest.update_url == null' used to work to identify development environment
    var prod = [
        'CHROME_PROD_EXTENSION_ID', // Chrome
        'EDGE_PROD_EXTENSION_ID', // Edge
        'FIREFOX_PROD_EXTENSION_ID', // Firefox
        'OPERA_PROD_EXTENSION_ID' // Opera
    ];
    return prod;
}

function load_test_ids() {
    // Opera won't accept multiple extensions with same name, Firefox will just block any two same/similar extensions from same author
    // Edge takes weeks to publish so there is no point in making a test version, seems like Chrome test should be fine for now
    var test = [
        'CHROME_TEST_EXTENSION_ID', // Chrome
        'EDGE_TEST_EXTENSION_ID', // Edge
        'FIREFOX_TEST_EXTENSION_ID', // Firefox
        'OPERA_TEST_EXTENSION_ID' // Opera
    ];
    return test;
}

function load_api_keys() {
    var keys = {
        'omdb': '9c221e98'
    };
    return keys;
};

function load_donation_urls() {
    var donations = {
        'paypal': 'https://www.paypal.com/donate?hosted_button_id=5WT3FLHUWCPGL',
        'patreon': 'https://www.patreon.com/Netflex'
    };
    return donations;
};

function load_stores_urls() {
    var stores = {
        'chrome': 'https://chrome.google.com/webstore/detail/' + extension_id,
        'edge': 'https://microsoftedge.microsoft.com/addons/detail/' + extension_id,
        'firefox': 'https://addons.mozilla.org/firefox/addon/' + extension_id,
        'opera': 'https://addons.opera.com/extensions/details/netflixtm-extended/',
        'unknown': ''
    };
    return stores;
}

function load_source_urls() {
    var source = {
        'github': 'https://github.com/NetflexExtension/Netflex/'
    };
    return source;
};

function load_news_urls() {
    var news = {
        'news': 'https://gist.githubusercontent.com/NetflexExtension/478c7646610f5c8e4f9e31b7bf47d99d/raw/netflex_news.json'
    };
    return news;
};

function load_prod_ids() {
    // As there is no other way to find out if unpacked extension is used on Firefox, we have to specify IDs for production extensions
    // Note: in non Firefox extensions 'chrome.runtime.getManifest().update_url == null' used to work to identify development environment
    var prod = [
        'gjcgfkhgpaccjpjokgpekpgpphgaanej', // Chrome
        'nkmffnbleghnfmhjncmjkffhanmmiomo', // Edge - OLD: koafamhknckjfgdfikmicbjebhmjgkgh - NEW: nkmffnbleghnfmhjncmjkffhanmmiomo
        '{d197a819-709b-4352-8cd4-f87e11300617}', // Firefox
        'bjodcabipakniikfjfnfjbpeogbiijol' // Opera
    ];
    return prod;
}

function load_test_ids() {
    // Opera won't accept multiple extensions with same name, Firefox will just block any two same/similar extensions from same author
    // Edge takes weeks to publish so there is no point in making a test version, seems like Chrome test should be fine for now
    var test = [
        'fpfdmkieoaokhgmodionpbiifonkccnh' // Chrome
    ];
    return test;
}

function load_discontinued_ids() {
    // List of discontinued store IDs
    var discontinued = {
        'koafamhknckjfgdfikmicbjebhmjgkgh': { // Edge
            'redirect': '',
            'disable_features': true
        }
    };
    return discontinued;
}
