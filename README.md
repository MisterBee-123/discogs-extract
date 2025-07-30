# discogs-extract
## Description
Discogs Track Extract is a Chrome extension that interfaces with Discogs.com to extract specified track information. It locates key fields for a specified track, such as artist, title, album name, label, and release year, and combines them into a classic MTV-style text block that is suitable for displaying in streaming software such as OBS.

## Installation Instructions
Discogs Track Extract requires Google Chrome to use. To install it, locate it in the Chrome Web Store and click on the "Add To Chrome" button, then follow the prompts. Click on the Extensions icon (the "puzzle piece") to the right of the Chrome URL field, locate "Discogs Track Extract" in the extensions list, and click on the "pin" button. This will permanently display the extension's icon in the extension group.

## How To Use
1. Open Discogs.com in Google Chrome, then navigate to a release page. The extension is not compatible with master entry pages, so be sure that the page that you are on is a page for a specific release.
2. Click on the Discogs Track Extract icon to the right of the Chrome URL field. The extension's window is displayed, overlaying the Discogs page.
3. Type in the number of the track for which you wish to compile information into the track ID field and click on the "Return track info" button.
4. The track information is displayed in the Information field. Edit the text as desired. This text can be copied and pasted into a text file that OBS or a comparable streaming application can display.
5. If you want to build a setlist, click on the "Add track to setlist" button. The artist and track name are added to the Setlist field at the end. Edit the setlist text as desired.
6. Navigate to a different release page. The extension window closes once you click away from it.
7. Click on the Discogs Track Extract icon again. Note that the Information field contains the previous track information, and the Setlist field is still populated.
8. Repeat with multiple tracks, extracting information for each track and adding them to the setlist.
