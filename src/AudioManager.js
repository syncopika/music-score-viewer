export class AudioManager {
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
    for(const instrument in trackPaths){
      const audioDataPath = trackPaths[instrument];
      this.updateUIState({
        'showLoadingMsg': true,
      });
            
      fetch(audioDataPath)
        .then(res => {
          if(!res.ok){
            throw new Error(`${res.status}: loading ${audioDataPath} failed! sorry :(`); 
          }
          return res.blob();
        })
        .then(async (res) => {
          const arrayBuf = await res.arrayBuffer();
          const audioBuf = await this.audioContext.decodeAudioData(arrayBuf);
                
          if(this.audioContext.state !== 'closed'){
            const newGainNode = this.audioContext.createGain();
            const newPanNode = this.audioContext.createStereoPanner();
            
            newGainNode.connect(newPanNode);
            newPanNode.connect(this.audioContext.destination);

            // TODO: what if two instruments share the same key name in the json? should we keep track of instrument names and keep a counter?
            this.instruments[instrument] = {
              'name': instrument,
              'vol': newGainNode,
              'pan': newPanNode,
              'gainVal': 0.5, // maybe make a json to hold this info + the audio file path and other metadata
              'panVal': 0.0,
              'buffer': audioBuf,
              'sourceNode': null, // will be filled in at playback time
            };
                    
            // if this is the last instrument to load, unblock the play button
            if(++count === numInstruments){
              this.updateUIState({
                'playButtonDisabled': false,
                'showLoadingMsg': false,
              });
            }
          }
        });
            
    }
  }
    
  play(){
    // set up new buffer nodes for each instrument
    for(const instrument in this.instruments){
      const currInst = this.instruments[instrument];
      currInst.vol.gain.setValueAtTime(this.instruments[instrument].gainVal, 0);
      currInst.pan.pan.setValueAtTime(this.instruments[instrument].panVal, 0);
      
      const bufNode = this.audioContext.createBufferSource();
      bufNode.buffer = currInst.buffer;
      bufNode.connect(currInst.vol);
      
      // ideally when one buffer node is done playing, it should be representative of all the other buffer nodes (and the whole musical piece)
      // since they should all be starting at the same time
      bufNode.onended = () => {
        this.updateUIState({
          'isPlaying': false,
        });
      };
      
      currInst.sourceNode = bufNode;
    }
    
    // then start all the buffer nodes
    const startTime = this.audioContext.currentTime + 0.05; // add a tiny amount of extra time to the start time to try to ensure that all instruments will start simultaneously
    for(const instrument in this.instruments){
      const inst = this.instruments[instrument];
      inst.sourceNode.start(startTime, this.seekTime);
    }
  }
    
  pause(){
    for(const instrument in this.instruments){
      const inst = this.instruments[instrument];
      // since buffer nodes are one-time use only, just stop and disconnect them as they'll
      // need to be recreated on next playback
      inst.sourceNode.stop();
      inst.sourceNode.disconnect();
    }
  }
    
  reset(){
    for(const instrument in this.instruments){
      const inst = this.instruments[instrument];
      this.instruments[instrument.name].sourceNode.stop();
      this.instruments[instrument.name].sourceNode.disconnect();
    }
    this.instruments = {};
    this.seekTime = 0;
  }
    
  stop(){
    this.pause();
    this.seekTime = 0;
  }

  async loadScoreJson(path){
    return fetch(path).then(res => {
      return res.json();
    });
  }

}