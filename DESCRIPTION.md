Disclaimer:

NETFLIX is a trademark of Netflix, Inc.. This application and its developer are in no way affiliated with Netflix, Inc..

General features:

- Clicking on extension icon will open Netflix™ page in new tab
- Clicking on extension status icon in a video player, disable/enable all extension features
- Extension has options menu which allows you to change extension behaviour, this is accessible via an icon that is shown when hovering on extension status icon or in browser extension management page
- Extension adds a coloured icon at Netflix™ video player controls that indicate extension state and show more extension info when hovered upon
- Extension will try to automatically recover if it stops working or updates itself
- Options can be changed directly from Netflix™ page via extension status information bubble options button
- If configured, extension will auto-disable itself on Kids profile

Title screen key bindings:

- Press R on browse page or search screen to start a random title excluding disliked titles (can be changed in the configuration)

Title screen features:

- If configured, extension will try to obtain and show title ratings on title details screen (turned off by default, note that this feature makes internet calls on background to gather these ratings from https://omdbapi.com/ and https://wikidata.org/)
- If configured, extension will be hiding all title story description to avoid spoilers
- If configured, extension will be hiding all disliked titles
- If configured, extension will stop trailers on browse page

Video player key bindings:

- Press 'N' in the player if you want to go to the next episode during the current episode (can be changed in the configuration)
- Press 'B' in the player if you want to go to the previous episode during the current episode (can be changed in the configuration)
- Press 'Escape' in the player to return to browse page (can be changed in the configuration)
- Press 'H' in the player to temporarily disable subtitles (can be changed in the configuration)
- Press 'Up Arrow' in the player to increase volume (original Netflix™ feature)
- Press 'Down Arrow' in the player to decrease volume (original Netflix™ feature)
- Press 'M' in the player to mute/unmute (original Netflix™ feature)
- Press 'Space/Enter' in the player to play/pause (original Netflix™ feature)
- Press 'Right Arrow' in the player to skip forward (original Netflix™ feature)
- Press 'Left Arrow' in the player to skip backward (original Netflix™ feature)
- Press 'F' in the player to make video full screen (original Netflix™ feature)
- Press 'S' in the player to make skip intro or recap, if skip button is shown by Netflix™ (original Netflix™ feature)

Video player features:

- When current episode ends, next episode will start as soon as possible (can be changed in the configuration)
- Extension will delay 10 seconds before starting next episode if previous title and next title are different titles (can be changed in the configuration)
- If configured, extension will stop playing if previous title of a series and next title are different titles
- If configured, extension will stop playing if previous title of a movie and next title are different titles
- If video is stuck on loading for longer than 5 seconds, it will be reloaded within next 15 seconds if nothing changes (can be changed in the configuration)
- Any Skip Intro or Skip Recap button will be clicked automatically (can be changed in the configuration)
- If all skip features are turned off, Netflix™ will ask every few episodes if you are still watching, this will be automatically skipped (can be changed in the configuration)
- Extension keeps 100 unique entries as history in local browser storage (can be changed in the configuration)
- If configured, video will automatically pause, if not in focus and can also automatically start, if focus is regained
- If configured, highlight shadow around subtitles to stand out more with possibility to remove subtitles as well
- If configured, video features like speed can be enabled and changed permanently or temporarily while extension is running

Chromecast player key bindings:

- Press 'M' in the player to mute/unmute (original Netflix™ feature)
- Press 'Space/Enter' in the player to play/pause (original Netflix™ feature)

Chromecast player features:

- When current episode ends, next episode will start as soon as possible (can be changed in the configuration)
- Hiding extension status icon (can be changed in the configuration)

Title ratings:

- Support for this feature is very limited as data are obtained from external sources (https://omdbapi.com/ & https://query.wikidata.org/) that are out of reach
- Title ratings are turned off by default to prevent unwanted internet calls on background, this can be changed in configuration if wanted
- Many ratings may not be available or might be out of date, OMDb API may not find the title by name that Netflix™ uses when it is translated due to localisation settings, or many other reasons why it may fail obtaining ratings
- Due to limited number of calls that we can make to OMDb API daily, it is possible that ratings will stop working because we use this feature too much
- Once title rating was obtained, it is stored in local browser storage for some number of days before they get refreshed to reduce number of calls to OMDb API, so we can all enjoy this feature
- Currently, OMDb API provides ratings from Internet Movie Database (IMDb), Rotten Tomatoes (RT) and MetaCritic (Meta), if available
- If this feature will cause too many problems in the future, it might get removed
- If configured, users can define their own API key to make sure they will not share number of calls to this API with other users (Free API keys can be generated here: https://omdbapi.com/apikey.aspx)

Note:

- At any time Netflix™ can change/update their UI and make this extension not work or misbehave, extension will be updated to work with this new UI once the UI reaches developers and as Netflix™ updates are not rolled out all at same time this may take a while

Removed features:

- Touch screen disable - this feature caused multiple problems and never worked as expected, without possible fix
- Mute trailers on browse page - after Netflix™ GUI got updated, this feature no longer worked, it was also obsolete as Netflix™ remembers last audio setting for trailers you choose

Privacy:

- Extension does not collect any personal user data, as well as it does not collect any user behaviour or web usage habits, and it never will
- All data stored by extension are limited to local browser storage, which can be accessed only while visiting Netflix™ web page on your local device
- No data are sent over the internet by this extension, only exception is when ratings are turned on (they are turned off by default)
- In case ratings are turned on, extension will send a query containing Netflix™ title ID to Wikidata API, to obtain IMDb ID and later it will send obtained IMDb ID to OMDB API to obtain ratings
- Call to OMDB API contains API key which is provided by extension in default, but can be changed for your own in configuration
- This product is free of charge and without ads
- Your configuration is stored in separate browser local storage dedicated to extensions, no other extensions should have access to this configuration

External libraries:

- jQuery v3.5.1 - https://jquery.com/
- DOMPurify v2.2.6 - https://github.com/cure53/DOMPurify
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

Supported browsers (all in their own web stores):

- Chrome
- Edge (Chromium)
- Firefox
- Opera

If you like this extension, support its developer by donating here:
- PayPal: https://www.paypal.com/donate/?hosted_button_id=5WT3FLHUWCPGL
- Patreon: https://www.patreon.com/Netflex

Warranty:

The software is provided "as is", without a warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and non-infringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.