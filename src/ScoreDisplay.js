import React from 'react';
import { PdfManager } from './PdfManager.js';
import { AudioManager } from './AudioManager.js';

class ScoreDisplay extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			scoreMetadataPath: `/music/${props.scoreName}/${props.scoreName}.json`,
			pdfManager: null,
			audioManager: null,
			playButtonState: false, // apply to play button
		};
		
		/*
		const audioManager = props.audioManager;
		const pdfManager = props.pdfManager;
	
		const scoreName = props.scoreName;
		const scoreInstruments = props.instruments;
		const scoreDuration = props.duration;
		const scoreNotes = props.notes;
		let playButtonState = "false";
		*/
		//const playButton = props.playButtonElement;
		this.data = null;
	}
	
	async importScore(scorePath){
		this.state.audioManager.reset();
		const data = await this.state.audioManager.loadScoreJson(scorePath);
		this.data = data;
		console.log(data);
		// load the score
		await this.state.pdfManager.loadScore(data.scorePath);
		this.state.audioManager.loadInstrumentParts(data.trackPaths, playButton);
		this.state.audioManager.updateDOM(document.getElementById("toolbar"), data.duration);
		this.state.audioManager.addNotes(document.getElementById("toolbar"), data.notes);
	}
	
	componentDidMount(){
		// load in stuff here based on props
		this.pdfManager = new PdfManager(document.getElementById('the-canvas'));
		this.audioManager = new AudioManager();
		
		importScore(this.scoreMetadataPath);
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
							disabled={this.state.playButtonState}
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
							max={this.data.duration}
							step='1'
							defaultValue='0'
							onInput={
								function(evt){
									const newVal = evt.target.value;
									document.getElementById('currTimeLabel').textContent = newVal;
									this.state.audioManager.seekTime = parseInt(evt.target.value);
								}
							}
						></input>
						<label 
							id='durationLabel'
							style={
								{'marginLeft': '1%'}
							}
						>{scoreDuration} sec</label>
					</div>
					
					{
						// instrument sliders here
						scoreInstruments.map((instrument) => {
							return (
								<div 
									class='instrumentSlider'
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
					
					<div 
						id='notesContainer'
						style={
							{'textAlign': 'left'}
						}
					>
						<p style={{'fontWeight': 'bold'}}>notes: </p>
						{
							// notes go here
							this.data.scoreNotes.map((note) => {
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