import React from 'react';

const ScoreToolbar = (props) => {

	/*
	audioManager.loadInstrumentParts(trackPaths, playButton);
	audioManager.updateDOM(document.getElementById("toolbar"), data.duration);
	audioManager.addNotes(document.getElementById("toolbar"), notes);
	*/

	const scoreDuration = props.duration;
	const scoreNotes = props.notes;
	const playButton = props.playButtonElement;
	
	/*
			const div = document.createElement("div");
		div.id = "playbackSeek";
		
		const slider = this._createSlider(0, duration, 0, 1);
		slider.id = "playbackSeekSlider";
		
		const seekLabel = document.createElement("label");
		const currTimeLabel = document.createElement("label");
		const durationLabel = document.createElement("label");
		
		slider.addEventListener("input", (evt) => {
			const newVal = evt.target.value;
			currTimeLabel.textContent = newVal;
			this.seekTime = parseInt(evt.target.value);
		});
		
		seekLabel.textContent = "seek: ";
		seekLabel.marginRight = "2%";
		
		currTimeLabel.textContent = "0"; //TODO: improve the time appearance
		currTimeLabel.style.marginRight = "1%";
		currTimeLabel.id = "currTimeLabel";
		
		durationLabel.textContent = duration + " sec"; //TODO: improve the time appearance
		durationLabel.style.marginLeft = "1%";
		durationLabel.id = "durationLabel";
		
		div.appendChild(seekLabel);
		div.appendChild(currTimeLabel);
		div.appendChild(slider);
		div.appendChild(durationLabel);
		
		div.style.marginBottom = "2%";
		
		container.appendChild(div);
		*/
	
	const playbackSeekStyle = {};
	
	return (
		<div>
		
			<div>
				// buttons for play and stop
				<button></button>
			</div>
			
			// curr time label
			<label></label>
			
			// duration slider
			<input></input>
			
			// duration label
			<label></label>
			
			// instrument sliders go here
		</div>
	);

}