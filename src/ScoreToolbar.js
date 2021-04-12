import React from 'react';

const ScoreToolbar = (props) => {

	/*
		try this for keeping a bit of state: https://stackoverflow.com/questions/53332321/react-hook-warnings-for-async-function-in-useeffect-useeffect-function-must-ret
		so we can do async stuff. this toolbar should load in the score data
	*/
	const audioManager = props.audioManager;
	const pdfManager = props.pdfManager;
	
	const scoreName = props.scoreName;
	const scoreInstruments = props.instruments;
	const scoreDuration = props.duration;
	const scoreNotes = props.notes;
	let playButtonState = "false";
	//const playButton = props.playButtonElement;
	
	return (
		<div id='toolbar'>
			<div id="buttons">
				<button 
					id='playMusic' 
					data-playing="false" 
					role="switch" 
					aria-checked="false"
					disabled={playButtonState}
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
					max={scoreDuration}
					step='1'
					defaultValue='0'
					onInput={
						function(evt){
							const newVal = evt.target.value;
							document.getElementById('currTimeLabel').textContent = newVal;
							audioManager.seekTime = parseInt(evt.target.value);
						}
					}
				>
				<label 
					id='durationLabel'
					style={
						{'marginLeft': '1%'}
					}
				>{scoreDuration}sec</label>
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
							>
							
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
							>
							
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
					scoreNotes.map((note) => {
						return <p>{note}</p>
					})
				}
			</div>
		</div>
	);

}