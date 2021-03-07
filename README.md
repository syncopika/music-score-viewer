## music-score-viewer    
    
![screenshot of the app](screenshot.png)
    
This application serves as a way for me to share my music scores from MuseScore. It syncs instrument part playback with pdf music scores. It's currently in an early, experimental phase.    
    
I was inspired to make this after reaching my free limit on MuseScore and wanted a way to continue sharing my work. Although this isn't as nice as whatever MuseScore offers, I think it's an interesting substitute. One neat feature is that you can change the volume and panning of individual instrument parts. However, there is no score highlighting and the user (i.e. me) is responsible for providing the audio data for whatever instrument parts they want to display, as well as determining when the score pages should be turned.    
    
### dependencies:    
pdf.js (https://mozilla.github.io/pdf.js/)    
    
### running locally:    
Run `python -m http.server` from this directory and go to `localhost:8000`.    
