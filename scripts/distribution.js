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
