Privacy:

- Extension does not collect any personal user data, as well as it does not collect any user behaviour or web usage habits, and it never will
- All data stored by extension are limited to local browser storage, which can be accessed only while visiting Netflix™ web page on your local device
- No data are sent over the internet by this extension, only exception is when ratings are turned on (they are turned off by default)
- In case ratings are turned on, extension will send a query containing Netflix™ title ID to Wikidata API, to obtain IMDb ID and later it will send obtained IMDb ID to OMDB API to obtain ratings
- Call to OMDB API contains API key which is provided by extension in default, but can be changed for your own in configuration
- This product is free of charge and without ads
- Your configuration is stored in separate browser local storage dedicated to extensions, no other extensions should have access to this configuration

External libraries:

- jQuery v3.6.0 - https://jquery.com/
- DOMPurify v2.3.0 - https://github.com/cure53/DOMPurify
- Font Awesome Free v5.15.1 - https://fontawesome.com/
- dtrooper Fireworks v5 #68 - https://jsfiddle.net/user/dtrooper/fiddles/

External APIs:

- OMDb API - https://omdbapi.com/
- Wikidata - https://query.wikidata.org/

Extension permissions:

- *://*.netflix.com/* - access domain netflix.com
- *://*.wikidata.org/* - access domain wikidata.org (only used if ratings are enabled)
- *://*.omdbapi.com/* - access domain omdbapi.com (only used if ratings are enabled)
- storage - access internal browser storage to save user configuration

Source code:

- GitHub: https://github.com/UniverseDevel/Netflex/