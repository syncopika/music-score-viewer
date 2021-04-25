## music-score-viewer    
    
![screenshot of the app](screenshot.png)
    
This application serves as a way for me to share my music scores from MuseScore. It syncs instrument part playback with pdf music scores.    
    
I was inspired to make this after reaching my free limit on MuseScore and wanted a way to continue sharing my work. Although this isn't as nice as what MuseScore offers, I think it's an interesting substitute. One neat feature is that you can change the volume and panning of individual instrument parts. However, there is no score highlighting and the user (i.e. me) is responsible for providing the audio data for whatever instrument parts they want to display, as well as determining when the score pages should be turned.    
    
If, on initial page load the audio sounds out of sync, stopping and replaying should help.    
    
### design:    
Initially this was just a vanilla Javascript application but I decided that I wanted to be able to get urls for each of my scores so I could share them.    
    
I thought about the History API for a bit (and I'm pretty sure, after a bit more thorough reading, it would've been enough to meet my needs) but I decided to go with React and to utilize react-router-dom (because more practice with a popular library never hurts right? ;) ).    
    
In doing so I was also able to clean up my existing code a bit more, which is a plus.    
    
Some notes on the files needed to make this work:    
- in /src I have a json file that will be used to figure out the contents of score list in the sidebar menu.
- all the score stuff goes in /music. each score has its own folder and in each folder is a json file. this file contains the information to know what instrument sliders need to be created, where the score file is, etc.
    
### main dependencies:    
pdf.js (https://mozilla.github.io/pdf.js/)    
React   
    
### running locally:    
Run `npm install` to get the dependencies (super annoying, I know. sorry!)    
Then run `node server.js` from this directory and go to `localhost:3000`.    
