import React from 'react';
import { PdfManager } from './PdfManager.js';
import { AudioManager } from './AudioManager.js';

class ScoreDisplay extends React.Component {

	constructor(props){
		super(props);
		
		this.state = {
			'scoreData': {
				"name": "",
				"scorePath": "",
				"trackPaths": {},
				"notes": [],
				"duration": 0,
				"timeMarkers": {}
			},
			'instruments': {},
			'currPage': 1,
			'totalPages': 0,
			'prevPageButtonDisabled': false,
			'nextPageButtonDisabled': false,
			'playButtonDisabled': true,
			'isPlaying': false,
		}
			
		this.scoreMetadataPath = `./music/${props.scoreName}/${props.scoreName}.json`;
		
		this.pdfManager = new PdfManager(this.updateState.bind(this));
		this.audioManager = new AudioManager(this.updateState.bind(this));
		
		this.reqId;
		this.lastTime;
	}
	
	async importScore(scorePath){
		const data = await this.audioManager.loadScoreJson(scorePath);
		
		// render whatever page is specified to start on, if specified
		const startPage = data.startPage ? data.startPage : 1;
		
		// load the score
		await this.pdfManager.loadScore(data.scorePath, startPage);
		
		const playButton = document.getElementById('playMusic');
		this.audioManager.loadInstrumentParts(data.trackPaths);
		
		this.setState({
			'scoreData': data,
			'instruments': this.audioManager.instruments,
		});
	}
	
	// used with requestAnimationFrame
	step(timestamp){
		// we don't care about the timestamp requestAnimationFrame uses
		// since we'll rely on audioContext's timer instead
		const diff = this.audioManager.audioContext.currentTime - this.lastTime; // updating audioManager's seekTime is dependent on this
		const seekSlider = document.getElementById("playbackSeekSlider");
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
			
			evt.target.textContent = "pause";
			
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
			evt.target.textContent = "play";
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
	
	updateState(state){
		this.setState(state);
	}
	
	componentDidMount(){
		this.pdfManager.setCanvas(document.getElementById('the-canvas'));
		this.importScore(this.scoreMetadataPath);
	}
	
	componentWillUnmount(){
		// make sure to silence any audio before mounting another ScoreDisplay instance
		cancelAnimationFrame(this.reqId);
		this.audioManager.stop();
		this.audioManager.reset();
		this.audioManager.audioContext.close();
	}
	
	render(){
		return(
			<div id='container'>
				<div id='content'>
					<div>
					  <button id="prevPage" disabled={this.state.prevPageButtonDisabled} onClick={this.pdfManager.onPrevPage.bind(this.pdfManager)}>previous</button>
					  <span> page: <span id="page_num">{this.state.currPage}</span> / <span id="page_count">{this.state.totalPages}</span></span>
					  <button id="nextPage" disabled={this.state.nextPageButtonDisabled} onClick={this.pdfManager.onNextPage.bind(this.pdfManager)}> next </button>
					</div>
					<br />
					<canvas id="the-canvas"></canvas>
				</div>
				
				<div id='toolbar'>
					<div id='buttons'>
						<button
							id='playMusic' 
							data-playing={this.state.isPlaying}
							role="switch" 
							aria-checked="false"
							disabled={this.state.playButtonDisabled}
							onClick={this.play.bind(this)}
						>
						{this.state.isPlaying ? 'pause' : 'play'}
						</button>
						<button
							id='stopMusic' 
							aria-checked="false"
							onClick={this.stop.bind(this)}
						>
							stop
						</button>
					</div>
					
					<div id='playbackSeek' style={{'marginBottom': '2%'}}>
						<label> seek: </label>
						
						<label 
							id='currTimeLabel' 
							style={{'marginRight': '1%'}}
						>0</label>
						
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
									document.getElementById('currTimeLabel').textContent = newVal;
									this.audioManager.seekTime = parseInt(evt.target.value);
								}
							}
						></input>
						
						<label 
							id='durationLabel'
							style={{'marginLeft': '1%'}}
						> {this.state.scoreData.duration} sec </label>
					</div>
					
					<div>
					{
						// instrument sliders here
						Object.keys(this.state.instruments).map((instrumentName, index) => {
							const instrument = this.audioManager.instruments[instrumentName];
							return (
								<div
									key={instrumentName + index}
									className='instrumentSlider'
									style={{'marginBottom': '2%'}}
								>
									<label
										style={{'marginRight': '2%'}}
									>{instrument.name}</label>
									
									<label> vol: </label>
									
									<input
										id={instrument.name + '_vol_slider'}
										type='range'
										min='0'
										max='1.5'
										step='0.1'
										defaultValue={instrument.gainVal}
										onChange={
											function(evt){
												// update volume value
												const newVal = evt.target.value;
												document.getElementById(instrument.name+'_vol_value').textContent = newVal;
												instrument.gainVal = newVal;
												instrument.vol.gain.setValueAtTime(newVal, 0);
											}
										}
									></input>
									
									<label
										id={instrument.name + '_vol_value'}
									>{instrument.gainVal}
									</label>
									
									<label
										style={{'marginLeft': '2%'}}
									> pan: </label>
									
									<input
										id={instrument.name + '_pan_slider'}
										type='range'
										min='-1'
										max='1'
										step='0.1'
										defaultValue={instrument.panVal}
										onInput={
											function(evt){
												// update pan value
												const newVal = evt.target.value;
												document.getElementById(instrument.name+'_pan_value').textContent = newVal;
												instrument.panVal = newVal;
												instrument.pan.pan.setValueAtTime(newVal, 0);
											}
										}
									></input>
									
									<label id={instrument.name + '_pan_value'}>0</label>
								
								</div>
							);
						})
					}
					</div>
					
					<div id='notesContainer' style={{'textAlign': 'left'}}>
						<p style={{'fontWeight': 'bold'}}> notes: </p>
						{
							this.state.scoreData.notes.map((note, index) => {
								return <p dangerouslySetInnerHTML={{__html: note}} key={"note" + index} />;
							})
						}
					</div>
					
				</div>
			</div>
		);
	}

}

export {
	ScoreDisplay
}