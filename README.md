## music-score-viewer    
    
![screenshot of the app](screenshot.png)
    
This application serves as a way for me to share my music scores from MuseScore. It syncs instrument part playback with pdf music scores.    
    
I was inspired to make this after reaching my free limit on MuseScore and wanted a way to continue sharing my work. Although this isn't as nice as what MuseScore offers, I think it's an interesting substitute. One neat feature is that you can change the volume and panning of individual instrument parts. However, there is no score highlighting and the user (i.e. me) is responsible for providing the audio data for whatever instrument parts they want to display, as well as determining when the score pages should be turned.    
    
If, on initial page load the audio sounds out of sync, stopping and replaying should help.    
    
### dependencies:    
pdf.js (https://mozilla.github.io/pdf.js/)    
    
### running locally:    
Run `python -m http.server` from this directory and go to `localhost:8000`. Please note that there might be issues with seeking when using with Chrome and Edge (see this [super helpful post](https://stackoverflow.com/questions/9563887/setting-html5-audio-position). Firefox seems to handle it well though.    
