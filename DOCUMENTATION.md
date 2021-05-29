Fork info:
  
- Do not use same/similar extension name, description or icons.
- Edit values in 'manifest.json' and 'scripts/distribution.js' to use your API keys.
- Edit names in '_locales/*/messages.json', do not change array item 'founder'.

Libraries description:
  
- jquery.min.js - Official jQuery library. If updated, change version in description as well.
- purify.min.js - Official DOMPurify library. If updated, change version in description as well. Official library contains
                  path to map file which is not part of the project and this line has to be removed from library. If updated, 
                  change version in description as well.
- fontawesome.js - Official FontAwesome library that provides variety of icons. If updated, change version in description
                   as well.
- firework.js - Library for Easter Egg. When you start a video title in Netflix and you click on N logo in status bubble,
                fireworks will start to fly over video. Useless but I love Easter Eggs.

Scripts description:
  
- globals.js - Functions that are needed to generate core extension behavior like: browser detection, extension API load,
               localisation messages load and log handling functions.
- background.js - Some functions that are used by extension to work and also some background adjustments like different
                  icons of extension for development version of extension, test version of extension and for production
                  version. In case you will create your own test extension (published only to testers), change value
                  in variable 'test_extension_id' to ID of this test extension.
- init.js - This script contains functions to inject JS scripts into Netflix page (look for comment '// MAIN'). Functions
            here handle injecting, re-injecting (in case of extension update/disable/enable or failure), all main
            internal intervals and loops. These intervals are responsible for everything running.
- versions.js - This script contains function that executes version specific changes after extension is injected.
- vars.js - All global variables are defined here, so they can be reach from other scripts. Default configuration is
            provided here. In case you will create your own test extension (published only to testers), change value
            in variable 'test_extension_id' to ID of this test extension.
- distribution.js - Contains function to define some deployment specific variables, here you should put your new OMDB API key.
                    It also contains values of other providers like donation links or web store links.
- functions.js - All functions that are somehow general or used by multiple other scripts are in this script.
- objects.js - This script contains list of callable object that are obtained from Netflix. Their order and IF statements
               can represent backwards compatibility or multiple sources.
- options.js - This script generates contents of options page. All data in options page are populated 
               by function 'generate_options_data'.
- assistant.js - Most of the core logic is here. Function 'netflix_assistant' is responsible for almost all the activities
                 that are performed by this extension. Bubble window and status icon are generated and injected here,
                 key bindings are detected as well.
- ratings.js - Core ratings logic is found here. Script in a loop looks for DOM objects that are valid and known to be
               shown when title detail card is open on Netflix browse page. This means that ratings should be shown,
               and rating obtaining process is initialised. After obtaining Netflix ID we look for such ID in local storage
               and if such ID is already there, ratings are obtained from there unless these data are outdated. In
               other cases Ajax call is performed to get IMDb ID and another one to get ratings info from OMDB API.
- devtools.js - Debug tools to show all current extension variable values, this should not be used in production as
                Google requires user to confirm insane permissions, and most of the people complained about this. These
                values are filled in 'globals.js' in function 'environment_update' via the object 'debug_variables'.

General notes:
  
- FireFox requires libraries to be unchanged against their official counterparts, therefore it is best to download them
  replace old once and set them to read-only. SHA-256 of local library file must match SHA-256 of official library file.
  For DOMPurify library they also require the latest available version of library to be used at the moment of release.
- Files need to be in UTF-8 encoding as Skip buttons are detected by inner text and this one is different for every
  language. Each new Netflix language needs to be implemented as new phrases in the array of phrases. Location 'vars.js' in
  arrays 'loc_skip_intro' and 'loc_skip_recap'.
- Ratings are shown by detecting Netflix ID of the show then contacting WikiData API (https://www.wikidata.org/wiki/Wikidata:Main_Page)
  via Ajax call with SPARQL query using Netflix ID to find IMDb ID. IMDb ID is then used when contacting OMDB API
  (https://www.omdbapi.com/) who is the provider of ratings in this extension. To contact OMDB API, API key is used which
  needs to be generated either for free at https://www.omdbapi.com/apikey.aspx (limited to 1 000 daily queries) or by
  paying a fee via Patreon page (https://www.patreon.com/omdb/) starting from $1 a month (100 000 daily queries). Current 
  OMDB API key used by extension will be turned to free API key after transfer therefore limiting itself to 1 000 queries 
  a day. Ratings are designed to store obtained ratings data for some time to prevent constant queries but will attempt 
  to refresh the data after some extended period of time. In case obtaining ratings fail, there is also a buffer period
  before attempting to get ratings again. This means that 100 000 daily queries should be sufficient for current extension
  user count.
- Be careful about Netflix web design changes, some may break features in extension. These redesigns seem to happen once
  a year, and they are usually minor changes affecting only one or two features or none. Also, sometimes they add new types
  of screens to start next episodes and old code may not detect it correctly, this usually happens only with newly added
  titles and does not affect old code, but new detection might be needed.
- File 'messages.json' contains my name as founder in array item 'founder'. This value is referenced by 'options.js'. 
  You should keep this as a credit. To change name on web store page you should change file 'messages.json' array item 'provider'
  and 'developer'.
- There are some TODOs and Known issues at the end of the change log.
- In case OMDB API has an outage, developer provided a link for their database service provider to monitor their outage:
  https://www.databasemart.com/serverstatus, if the outage is caused by other problem it might be needed to contact the
  developer again.