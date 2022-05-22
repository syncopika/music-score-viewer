class AudioManager {

    constructor(updateStateFunc){
        this.instruments = {};
        this.currentlyPlaying = []; // keep track of which instruments are currently playing
        this.audioContext = new AudioContext();
        this.updateUIState = updateStateFunc; // use this function to update the state of ScoreDisplay
    }

    loadInstrumentParts(trackPaths){
        this.instruments = {};
        this.seekTime = 0;
        
        const numInstruments = Object.keys(trackPaths).length;
        let count = 0;

        // import audio data via trackPaths, which should be an object mapping instrument names to paths to audio files
        for(let instrument in trackPaths){
            // get the audio data
            const newAudioElement = document.createElement('audio');
            newAudioElement.currentTime = 0;
            newAudioElement.id = instrument;
            
            const audioDataPath = trackPaths[instrument];
            this.updateUIState({
                "showLoadingMsg": true,
            });
            
            fetch(audioDataPath).then((res) => {
                if(!res.ok){
                    throw new Error(`${res.status}: loading ${audioDataPath} failed! sorry :(`); 
                }
                return res.blob();
            }).then((res) => {
                const objectURL = URL.createObjectURL(res);
                newAudioElement.src = objectURL;
                
                // ideally when one audio element ends, it should be representative of all the current audio elements
                newAudioElement.addEventListener("ended", () => {
                    this.updateUIState({
                        "isPlaying": false,
                    });
                }, false);
                
                const newMediaElementSrcNode = this.audioContext.createMediaElementSource(newAudioElement);
                const newGainNode = this.audioContext.createGain();
                const newPanNode = this.audioContext.createStereoPanner();
                
                newMediaElementSrcNode.connect(newGainNode);
                newGainNode.connect(newPanNode);
                newPanNode.connect(this.audioContext.destination);

                // TODO: what if two instruments share the same key name in the json? should we keep track of instrument names and keep a counter?
                this.instruments[instrument] = {
                    'name': instrument,
                    'node': newMediaElementSrcNode,
                    'vol': newGainNode,
                    'pan': newPanNode,
                    'gainVal': 0.5, // maybe make a json to hold this info + the audio file path and other metadata
                    'panVal': 0.0,
                    'audioElement': newAudioElement,
                };
                
                // if this is the last instrument to load, unblock the play button
                if(++count === numInstruments){
                    this.updateUIState({
                        "playButtonDisabled": false,
                        "showLoadingMsg": false,
                    });
                }
            })
        }
    }
    
    play(){
        for(let instrument in this.instruments){
            this.instruments[instrument].vol.gain.setValueAtTime(this.instruments[instrument].gainVal, 0);
            this.instruments[instrument].pan.pan.setValueAtTime(this.instruments[instrument].panVal, 0);
            this.instruments[instrument].audioElement.currentTime = this.seekTime;
            
            // keep track of currently playing instruments so we know which ones are safe to call pause on (or else you can get a play request interrupted error)
            const playPromise = this.instruments[instrument].audioElement.play();
            this.currentlyPlaying.push({'name': instrument, 'promise': playPromise});
        }
    }
    
    pause(){
        this.currentlyPlaying.forEach((instrument) => {
            if(instrument.promise !== undefined){
                instrument.promise.then(_ => {
                    this.instruments[instrument.name].audioElement.pause();
                }).catch(err => {
                    console.log("there was an error trying to play: " + instrument.name);
                });
            }
        });
        this.currentlyPlaying = [];
    }
    
    reset(){
        for(let instrument in this.instruments){
            const inst = this.instruments[instrument];
            inst.node.disconnect();
            inst.audioElement.removeAttribute('src');
        }
        this.currentlyPlaying = [];
        this.instruments = {};
        this.seekTime = 0;
        this.updateUIState = () => {}; // make sure we don't attempt to update an unmounted component
    }
    
    stop(){
        this.pause();
        for(let instrument in this.instruments){
            this.instruments[instrument].audioElement.currentTime = 0;
            this.instruments[instrument].audioElement.dispatchEvent(new Event("ended"));
        }
        this.seekTime = 0;
        this.currentlyPlaying = [];
    }

    async loadScoreJson(path){
        return fetch(path).then(res => {
            return res.json();
        });
    }

}

export {
    AudioManager
}