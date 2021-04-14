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
		}
			
		this.scoreMetadataPath = `/music/${props.scoreName}/${props.scoreName}.json`;
		console.log(this.scoreMetadataPath);
		this.pdfManager = null;
		this.audioManager = new AudioManager();
		//this.playButtonState = false; // apply to play button
	}
	
	async importScore(scorePath){
		this.audioManager.reset();
		const data = await this.audioManager.loadScoreJson(scorePath);
		
		// load the score
		await this.pdfManager.loadScore(data.scorePath);
		
		const playButton = document.getElementById('playMusic');
		this.audioManager.loadInstrumentParts(data.trackPaths, playButton);
		
		//this.audioManager.updateDOM(document.getElementById("toolbar"), data.duration);
		//this.audioManager.addNotes(document.getElementById("toolbar"), data.notes);
		
		this.setState({
			'scoreData': data,
			'instruments': this.audioManager.instruments,
		});
	}
	
	componentDidMount(){
		// load in stuff here based on props
		this.pdfManager = new PdfManager(document.getElementById('the-canvas'));
		this.importScore(this.scoreMetadataPath);
	}
	
	render(){
		return (
			<div id='container'>
				<div id='content'>
					<div>
					  <button id="prev">previous</button>
					  <span>page: <span id="page_num"></span> / <span id="page_count"></span></span>
					  <button id="next">next</button>
					</div>
					<br />
					<canvas id="the-canvas"></canvas>
				</div>
				
				<div id='toolbar'>
					<div id="buttons">
						<button 
							id='playMusic' 
							data-playing="false" 
							role="switch" 
							aria-checked="false"
							disabled={true}
						>
							play
						</button>
						<button 
							id='stopMusic' 
							aria-checked="false"
						>
							stop
						</button>
					</div>
					
					<div id='playbackSeek' style={
						{'marginBottom': '2%'}
					}>
						<label> seek: </label>
						<label 
							id='currTimeLabel' 
							style = {
							{'marginRight': '1%'}
						}>0</label>
						<input 
							id='playbackSeekSlider'
							type='range'
							min='0'
							max={this.state.scoreData.duration}
							step='1'
							defaultValue='0'
							onInput={
								function(evt){
									const newVal = evt.target.value;
									document.getElementById('currTimeLabel').textContent = newVal;
									this.audioManager.seekTime = parseInt(evt.target.value);
								}
							}
						></input>
						<label 
							id='durationLabel'
							style={
								{'marginLeft': '1%'}
							}
						>{this.state.scoreData.duration} sec</label>
					</div>
					
					<div>
					{
						// instrument sliders here
						Object.keys(this.state.instruments).map((instrumentName) => {
							const instrument = this.audioManager.instruments[instrumentName];
							return (
								<div 
									className='instrumentSlider'
									style={
										{'marginBottom': '2%'}
									}
								>
									<label
										style={
											{'marginRight': '2%'}
										}
									>{instrument.name}</label>
									
									<label> vol: </label>
									
									<input
										id={instrument.name + '_vol_slider'}
										type='range'
										min='0'
										max='1.5'
										step='0.1'
										defaultValue={instrument.gainVal}
										onInput={
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
										style={
											{'marginLeft': '2%'}
										}
									> pan: </label>
									
									<input
										id={instrument.name+'_pan_slider'}
										type='range'
										min='-1'
										max='1'
										step='0.1'
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
							)
						})
					}
					</div>
					
					<div 
						id='notesContainer'
						style={
							{'textAlign': 'left'}
						}
					>
						<p style={{'fontWeight': 'bold'}}>notes: </p>
						{
							// notes go here
							this.state.scoreData.notes.map((note) => {
								return <p>{note}</p>
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