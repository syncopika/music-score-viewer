class AudioManager {
	constructor(){
		this.instruments = {};
		this.audioContext = new AudioContext();
	}

	loadInstrumentParts(trackPaths, playButton){
		
		this.instruments = {};
		
		// also: try to have seek option slider? only enable when paused or stopped.
		this.seekTime = 0;

		// import audio data via trackPaths, which should be an object mapping instrument names to paths to audio files
		for(let instrument in trackPaths){
			// get the audio data
			const newAudioElement = document.createElement('audio');
			newAudioElement.src = trackPaths[instrument];
			newAudioElement.currentTime = 0;
			newAudioElement.id = instrument;
			
			// TODO: find a better way to do this? it forces some assumptions about the play button
			newAudioElement.addEventListener("ended", () => {
				playButton.dataset.playing = 'false';
				playButton.textContent = "play";
			}, false);
			
			newAudioElement.addEventListener('canplaythrough', (evt) => {
				const instruments = this.instruments;
				const thisInstrument = evt.target.id;
				console.log("Audio data for " + thisInstrument +  " has been loaded! setting readyToPlay to true.");
				instruments[thisInstrument].readyToPlay = true;
				
				let playReady = true;
				for(let instrument in instruments){
					playReady = playReady && instruments[instrument].readyToPlay;
				}
				if(playReady){
					playButton.disabled = false;
				}
			});
			
			const newMediaElementSrcNode = this.audioContext.createMediaElementSource(newAudioElement);
			const newGainNode = this.audioContext.createGain();
			const newPanNode = this.audioContext.createStereoPanner();
			
			newMediaElementSrcNode.connect(newGainNode);
			newGainNode.connect(newPanNode);
			newPanNode.connect(this.audioContext.destination);
			
			this.instruments[instrument] = {
				'name': instrument,
				'node': newMediaElementSrcNode,
				'vol': newGainNode,
				'pan': newPanNode,
				'gainVal': 0.5, // maybe make a json to hold this info + the audio file path and other metadata
				'panVal': 0.0,
				'audioElement': newAudioElement,
				'readyToPlay': false,
			};
		}
	}
	
	updateDOM(container, duration){
		this._createPlaybackSeekSlider(container, duration);
		for(let instrument in this.instruments){
			this._createSliders(this.instruments[instrument], container);
		}
	}
	
	addNotes(container, notesList){
		container.appendChild(document.createElement("br"));
		
		const notesContainer = document.createElement("div");
		notesContainer.id = "notesContainer";
		notesContainer.style.textAlign = "left";
		
		const notesHead = document.createElement("p");
		notesHead.textContent = "notes: ";
		notesHead.style.fontWeight = "bold";
		notesContainer.appendChild(notesHead);
		
		for(let note of notesList){
			const newNote = document.createElement("p");
			newNote.innerHTML = note;
			notesContainer.appendChild(newNote);
		}
		
		container.appendChild(notesContainer);
	}
	
	play(){
		for(let instrument in this.instruments){
			this.instruments[instrument].vol.gain.setValueAtTime(this.instruments[instrument].gainVal, 0);
			this.instruments[instrument].pan.pan.setValueAtTime(this.instruments[instrument].panVal, 0);
			this.instruments[instrument].audioElement.currentTime = this.seekTime;
			this.instruments[instrument].audioElement.play();
		}
	}
	
	pause(){
		for(let instrument in this.instruments){
			this.instruments[instrument].audioElement.pause();
		}
	}
	
	stop(){
		for(let instrument in this.instruments){
			this.instruments[instrument].audioElement.pause();
			this.instruments[instrument].audioElement.currentTime = 0;
			this.instruments[instrument].audioElement.dispatchEvent(new Event("ended"));
		}
		this.seekTime = 0;
	}
	
	reset(){
		for(let instrument in this.instruments){
			const inst = this.instruments[instrument];
			inst.node.disconnect();
		}
		
		// remove notes
		const notes = document.getElementById("notesContainer");
		notes.parentNode.removeChild(notes);
		
		// remove all instrument sliders
		const sliders = document.querySelectorAll(".instrumentSlider");
		Array.from(sliders).forEach((slider) => {
			slider.parentNode.removeChild(slider);
		});
		
		// remove playback seek slider
		const playbackSeekSlider = document.getElementById("playbackSeek");
		playbackSeekSlider.parentNode.removeChild(playbackSeekSlider);
		
		this.instruments = {};
		this.seekTime = 0;
	}

	async loadScoreJson(path){
		return fetch(path).then(res => {
			return res.json();
		});
	}
	
	// create a slider for playback seeking
	_createPlaybackSeekSlider(container, duration){
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
	}
	
	// container should be the html element node to put the sliders in
	// pass in this.instruments[instrument] for instrumentObject
	_createSliders(instrumentObject, container){
		const newInstrumentSection = document.createElement("div");
		newInstrumentSection.className = "instrumentSlider";
		newInstrumentSection.style.marginBottom = "2%";
		
		const instrumentLabel = document.createElement("label");
		instrumentLabel.textContent = instrumentObject.name;
		instrumentLabel.style.marginRight = "2%";
		newInstrumentSection.append(instrumentLabel);
		
		const volSlider = this._createSlider(0, 1.5, instrumentObject.gainVal, 0.1);
		volSlider.id = instrumentObject.name + "_vol_slider";
		
		const volLabel = document.createElement("label");
		volLabel.textContent = "vol: ";
		volLabel.for = volSlider.id;
		
		const volValueLabel = document.createElement("label");
		volValueLabel.textContent = instrumentObject.gainVal;
		volValueLabel.id = instrumentObject.name + "_vol_value";
		
		volSlider.addEventListener("input", (evt) => {
			// update volume value
			const newVal = evt.target.value;
			volValueLabel.textContent = newVal;
			instrumentObject.gainVal = newVal;
			instrumentObject.vol.gain.setValueAtTime(newVal, 0);
		});
		
		const panSlider = this._createSlider(-1.0, 1.0, instrumentObject.panVal, 0.1);
		panSlider.id = instrumentObject.name + "_pan_slider";
		
		const panLabel = document.createElement("label");
		panLabel.textContent = "pan: ";
		panLabel.for = panSlider.id;
		panLabel.style.marginLeft = "2%";
		
		const panValueLabel = document.createElement("label");
		panValueLabel.textContent = instrumentObject.panVal;
		panValueLabel.id = instrumentObject.name + "_pan_value";
		
		panSlider.addEventListener("input", (evt) => {
			// update pan value
			const newVal = evt.target.value;
			panValueLabel.textContent = newVal;
			instrumentObject.panVal = newVal;
			instrumentObject.pan.pan.setValueAtTime(newVal, 0);
		});
		
		newInstrumentSection.appendChild(volLabel);
		newInstrumentSection.appendChild(volSlider);
		newInstrumentSection.appendChild(volValueLabel);
		newInstrumentSection.appendChild(panLabel);
		newInstrumentSection.appendChild(panSlider);
		newInstrumentSection.appendChild(panValueLabel);
		
		container.appendChild(newInstrumentSection);
	}
	
	_createSlider(min, max, defaultVal, step){
		const newSlider = document.createElement("input");
		newSlider.type = "range";
		newSlider.min = min;
		newSlider.max = max;
		newSlider.value = defaultVal;
		newSlider.step = step;
		return newSlider;
	}
}