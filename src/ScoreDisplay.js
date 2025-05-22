import React from 'react';
import { PdfManager } from './PdfManager.js';
import { AudioManager } from './AudioManager.js';

class ScoreDisplay extends React.Component {
  constructor(props){
    super(props);
        
    this.state = {
      scoreData: {
        name: '',
        scorePath: '',
        trackPaths: {},
        notes: [],
        duration: 0,
        timeMarkers: {},
        tags: [],
      },
      showLoadingMsg: false,
      instruments: {},
      currPage: 1,
      totalPages: 0,
      prevPageButtonDisabled: false,
      nextPageButtonDisabled: false,
      playButtonDisabled: true,
      isPlaying: false,
    };
    
    this.scoreMetadataPath = `./music/${props.scoreName}/${props.scoreName}.json`;
    this.callbackFn = props.callback; // callback function. in this case we want to update the currently selected score in the root component (see ScoreRouter.js)
        
    this.pdfManager = new PdfManager(this.updateState.bind(this));
    this.audioManager = new AudioManager(this.updateState.bind(this));
        
    this.reqId;
    this.lastTime;
        
    this.mounted; // use to prevent updating state of an unmounted component
        
    this.instrumentCategories = {
      'winds': [
        'clarinet',
        'flute',
        'oboe',
        'bassoon',
        'trumpet',
        'horn',
        'trombone',
        'tuba',
        'piccolo',
        'recorder',
      ],
      'strings': [
        'violin',
        'viola',
        'cello',
        'double bass',
        'contrabass',
        'guitar',
        'strings',
      ],
      'percussion': [
        'timpani',
        'percussion',
        'chimes',
        'piano',
        'harp',
        'vibes',
        'vibraphone',
        'xylophone',
        'marimba',
        'glockenspiel',
        'drums',
      ],
    };
    
    this.selectedPresets = new Set();
  }
    
  async importScore(scorePath){
    const data = await this.audioManager.loadScoreJson(scorePath);
        
    // render whatever page is specified to start on, if specified
    const startPage = data.startPage ? data.startPage : 1;
        
    // load the score
    await this.pdfManager.loadScore(data.scorePath, startPage);
        
    const playButton = document.getElementById('playMusic');
        
    this.audioManager.loadInstrumentParts(data.trackPaths);
        
    if(this.mounted){
      this.setState({
        'scoreData': Object.assign(this.state.scoreData, data),
        'instruments': this.audioManager.instruments,
      });
    }
  }
    
  // used with requestAnimationFrame
  step(timestamp){
    // we don't care about the timestamp requestAnimationFrame uses
    // since we'll rely on audioContext's timer instead
    const diff = this.audioManager.audioContext.currentTime - this.lastTime; // updating audioManager's seekTime is dependent on this
    const seekSlider = document.getElementById('playbackSeekSlider');
    seekSlider.value = diff;
    seekSlider.dispatchEvent(new Event('input', { bubbles: true })); // trigger event so label will get updated. React didn't like 'new InputEvent()' for some reason it seems?

    if(diff >= this.state.scoreData.timeMarkers[this.state.currPage]){
      if(this.state.scoreData.timeMarkers[this.state.currPage+1]){
        // if the next page exists
        this.pdfManager.queueRenderPage(++this.state.currPage); // make sure render calls don't collide by queuing, which would cause errors otherwise
      }else{
        // we're at the last page. stop the cycle.
        cancelAnimationFrame(this.reqId);
        this.audioManager.seekTime = 0;

        this.setState({
          'prevPageButtonDisabled': false,
          'nextPageButtonDisabled': false,
        });
                
        return;
      }
    }
    this.reqId = requestAnimationFrame(this.step.bind(this));
  }
    
  play(evt){
    if(this.audioManager.audioContext.state === 'suspended'){
      this.audioManager.audioContext.resume();
    }
        
    if(!this.state.isPlaying){
      evt.target.textContent = 'pause';
            
      this.setState({
        'prevPageButtonDisabled': true,
        'nextPageButtonDisabled':true,
        'isPlaying': true,
      });
            
      if(this.audioManager.seekTime > 0){
        const pageToBeOn = this.pdfManager.findScorePage(this.audioManager.seekTime, this.state.scoreData.timeMarkers);

        // if the user goes to a different page while paused and
        // if they play again, we need to move the page back to where they paused
        this.pdfManager.queueRenderPage(pageToBeOn);
        this.pdfManager.pageNum = pageToBeOn;
                    
        this.lastTime = this.audioManager.audioContext.currentTime - this.audioManager.seekTime;
      }else{
        // starting from the beginning
        this.pdfManager.queueRenderPage(this.state.scoreData.startPage ? this.state.scoreData.startPage : 1);
        this.lastTime = this.audioManager.audioContext.currentTime;
      }
            
      this.audioManager.play();
      this.reqId = requestAnimationFrame(this.step.bind(this));
    }else{
      this.audioManager.pause();
      evt.target.textContent = 'play';
      cancelAnimationFrame(this.reqId);

      this.setState({
        'prevPageButtonDisabled': false,
        'nextPageButtonDisabled': false,
        'isPlaying': false,
      });
    }
  }
    
  stop(evt){
    // stop playing and rewind audio to the beginning
    cancelAnimationFrame(this.reqId);
    this.audioManager.stop();

    this.setState({
      'prevPageButtonDisabled': false,
      'nextPageButtonDisabled': false,
    });
  }
  
  selectPreset(evt){
    const presetName = evt.target.value;
    if(this.selectedPresets.has(presetName)){
      this.selectedPresets.delete(presetName);
    }else{
      this.selectedPresets.add(presetName);
    }
    
    this.toggleInstrumentPresets();
  }
    
  toggleInstrumentPresets(){
    const activeInstruments = new Set();
    
    this.selectedPresets.forEach(instCategoryToToggle => {
      this.instrumentCategories[instCategoryToToggle].forEach(inst => {
        activeInstruments.add(inst);
      });
    });
      
    Object.keys(this.state.instruments).forEach(inst => {
      const volSlider = document.getElementById(`${inst}_vol_slider`);
      
      let newVal = 0;
      
      if(activeInstruments.has(inst)){
        // if this instrument is in the selected category
        newVal = 0.5;
      }
      
      this.state.instruments[inst].gainVal = newVal;
      this.state.instruments[inst].vol.gain.setValueAtTime(newVal, 0);
      volSlider.value = newVal;
      volSlider.dispatchEvent(new Event('change'));
    });
  }
    
  // https://stackoverflow.com/questions/49906437/how-to-cancel-a-fetch-on-componentwillunmount
  updateState(state){
    if(this.mounted){
      this.setState(state);
    }
  }
    
  componentDidMount(){
    this.mounted = true;
    this.callbackFn();
    this.pdfManager.setCanvas(document.getElementById('theCanvas'));
    this.importScore(this.scoreMetadataPath);
  }
    
  componentWillUnmount(){
    // make sure to silence any audio before mounting another ScoreDisplay instance
    cancelAnimationFrame(this.reqId);
    this.audioManager.stop();
    this.audioManager.reset();
    this.audioManager.audioContext.close();
    this.mounted = false;
  }
    
  render(){
    return(
      <div id='container'>
        <div id='content'>
          <section>
            <button
              id='prevPage'
              disabled={this.state.prevPageButtonDisabled}
              onClick={this.pdfManager.onPrevPage.bind(this.pdfManager)}
            >
              previous
            </button>
                      
            <span>
              page: <span id='pageNum'>{this.state.currPage}</span> / <span id='pageCount'>{this.state.totalPages}</span>
            </span>
                      
            <button
              id='nextPage'
              disabled={this.state.nextPageButtonDisabled}
              onClick={this.pdfManager.onNextPage.bind(this.pdfManager)}
            >
              next
            </button>
          </section>
                    
          <canvas id='theCanvas'></canvas>
                    
          <button id='openScoreInTab' onClick={() => {
            if(this.state.scoreData.scorePath) window.open(this.state.scoreData.scorePath);
          }}> open score in another tab </button>
        </div>
                
        <div id='toolbar'>
          {Object.keys(this.state.instruments).length > 0 &&
            <section id='buttons'>
              <button
                id='playMusic' 
                data-playing={this.state.isPlaying}
                role='switch'
                aria-checked='false'
                disabled={this.state.playButtonDisabled}
                onClick={this.play.bind(this)}
              >
                {this.state.isPlaying ? 'pause' : 'play'}
              </button>
              <button
                id='stopMusic' 
                aria-checked='false'
                onClick={this.stop.bind(this)}
              >
                stop
              </button>
            </section>
          }
          
          {Object.keys(this.state.instruments).length > 0 &&
            <section id='playbackSeek' style={{'marginBottom': '2%'}}>
              <label
                id='currTimeLabel'
                htmlFor='playbackSeekSlider'
                style={{'marginRight': '1%'}}
              >
                seek: 0
              </label>
                          
              <input
                id='playbackSeekSlider'
                type='range'
                min='0'
                max={this.state.scoreData.duration}
                step='1'
                defaultValue='0'
                onInput={
                  (evt) => {
                    const newVal = evt.target.value;
                    document.getElementById('currTimeLabel').textContent = `seek: ${newVal}`;
                    this.audioManager.seekTime = parseInt(evt.target.value);
                  }
                }
              ></input>
              
              <span
                id='durationLabel'
                style={{'marginLeft': '1%'}}
              >
                {this.state.scoreData.duration} sec
              </span>
            </section>
          }
              
          {
            this.state.showLoadingMsg &&
            <h3 id='loadingMsg'>loading instruments...</h3>
          }
          
          {Object.keys(this.state.instruments).length > 0 &&
            <section>
              <p> instrument group toggle: </p>
              <label htmlFor='stringsPreset'>strings:</label>
              <input
                className='checkbox'
                id='stringsPreset'
                type='checkbox'
                onChange={this.selectPreset.bind(this)}
                value='strings'
              />
                        
              <label htmlFor='windsPreset'>winds:</label>
              <input
                className='checkbox'
                id='windsPreset'
                type='checkbox'
                onChange={this.selectPreset.bind(this)}
                value='winds'
              />
                        
              <label htmlFor='percussionPreset'>percussion:</label>
              <input
                className='checkbox'
                id='percussionPreset'
                type='checkbox'
                onChange={this.selectPreset.bind(this)}
                value='percussion'
              />
            </section>
          }
         
          {Object.keys(this.state.instruments).length > 0 &&
            <table id='instrumentControls'>
              <tbody>
                {
                  // instrument sliders here
                  Object.keys(this.state.instruments).map((instrumentName, index) => {
                    const instrument = this.audioManager.instruments[instrumentName];
                    return (
                      <tr
                        key={`${instrumentName}${index}`}
                        style={{'marginBottom': '3px'}}
                        className='instrumentSlider'
                      >
                        <td>
                          <p id='instrumentName'>
                            {instrument.name}
                          </p>
                        </td>
                                          
                        <td>
                          <label htmlFor={`${instrument.name}_vol_slider`}>vol: </label>
                                              
                          <input
                            id={`${instrument.name}_vol_slider`}
                            type='range'
                            min='0'
                            max='1.5'
                            step='0.1'
                            defaultValue={instrument.gainVal}
                            onChange={
                              function(evt){
                                // update volume value
                                const newVal = evt.target.value;
                                document.getElementById(`${instrument.name}_vol_value`).textContent = newVal;
                                instrument.gainVal = newVal;
                                instrument.vol.gain.setValueAtTime(newVal, 0);
                              }
                            }
                          ></input>
                                              
                          <span id={`${instrument.name}_vol_value`}>
                            {instrument.gainVal}
                          </span>
                        </td>
                                          
                        <td>
                          <label htmlFor={`${instrument.name}_pan_slider`}> pan: </label>
                                              
                          <input
                            id={`${instrument.name}_pan_slider`}
                            type='range'
                            min='-1'
                            max='1'
                            step='0.1'
                            defaultValue={instrument.panVal}
                            onInput={
                              function(evt){
                                // update pan value
                                const newVal = evt.target.value;
                                document.getElementById(`${instrument.name}_pan_value`).textContent = newVal;
                                instrument.panVal = newVal;
                                instrument.pan.pan.setValueAtTime(newVal, 0);
                              }
                            }
                          ></input>
                                              
                          <span id={`${instrument.name}_pan_value`}>0</span>
                        </td>
                                      
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          }
                    
          <section id='notesContainer'>
            <h3 id='notesHeader'> notes: </h3>
            {
              this.state.scoreData.notes.map((note, index) => {
                return <p dangerouslySetInnerHTML={{__html: note}} key={`${note}${index}`} />;
              })
            }
            <p> tags: {this.state.scoreData.tags.join(", ")} </p>
          </section>
                    
        </div>
      </div>
    );
  }

}

export {
  ScoreDisplay
};