import { PdfManager } from './PdfManager.js';
import { AudioManager } from './AudioManager.js';

let reqId;
let lastTime;
let currPage = 1;

async function main(){
	const pdfManager = new PdfManager(document.getElementById('the-canvas'));
	const audioManager = new AudioManager();
	const audioContext = audioManager.audioContext;
	const playButton = document.querySelector('#playMusic');
	playButton.disabled = true; // don't enabled until all audio has been loaded
	
	const prevPageButton = document.getElementById('prev');
	const nextPageButton = document.getElementById('next');
	prevPageButton.addEventListener('click', pdfManager.onPrevPage);
	nextPageButton.addEventListener('click', pdfManager.onNextPage);
	
	const optionSelect = document.getElementById('scoreOptions');
	const options = {
		"fun_piano": "music/fun_piano/fun_piano.json",
		"rustic_inn_bgm": "music/rustic_inn_bgm/rustic_inn_bgm.json",
	};
	
	let data, trackPaths, notes, timeMarkers;
	
	async function selectScore(evt){
		playButton.disabled = true; // don't enabled until all audio has been loaded
		
		const selected = evt.target.options[evt.target.selectedIndex].value;
		audioManager.reset();
		pdfManager.pageNum = 1;
		currPage = 1;
		
		data = await audioManager.loadScoreJson(options[selected]);
		await pdfManager.loadScore(data.scorePath); // this just returns a boolean
		
		trackPaths = data.trackPaths;
		notes = data.notes;
		timeMarkers = data.timeMarkers;
		
		audioManager.loadInstrumentParts(trackPaths, playButton);
		audioManager.updateDOM(document.getElementById("toolbar"), data.duration);
		audioManager.addNotes(document.getElementById("toolbar"), notes);
	}
	optionSelect.addEventListener('change', selectScore);
	
	// load first score
	data = await audioManager.loadScoreJson("music/rustic_inn_bgm/rustic_inn_bgm.json");
	await pdfManager.loadScore(data.scorePath);
	
	trackPaths = data.trackPaths;
	notes = data.notes;
	timeMarkers = data.timeMarkers;
	
	audioManager.loadInstrumentParts(trackPaths, playButton);
	audioManager.updateDOM(document.getElementById("toolbar"), data.duration);
	audioManager.addNotes(document.getElementById("toolbar"), notes);
	
	// sync page flipping with time progressed for music playback
	const reqAnimFrame = window.requestAnimationFrame;
	const cancelAnimFrame = window.cancelAnimationFrame;
	
	function step(timestamp){
		// we don't care about the timestamp requestAnimationFrame uses
		// since we'll rely on audioContext's timer instead
		const diff = audioContext.currentTime - lastTime; // updating audioManager's seekTime is dependent on this
		const seekSlider = document.getElementById("playbackSeekSlider");
		seekSlider.value = diff;
		seekSlider.dispatchEvent(new InputEvent('input')); // trigger event so label will get updated

		if(diff >= timeMarkers[currPage]){
			//console.log("" + timeMarkers[currPage] + ": need to go to page " + currPage + "!");
			if(currPage < Object.keys(timeMarkers).length){
				pdfManager.queueRenderPage(++currPage); // make sure render calls don't collide by queuing, which would cause errors otherwise
			}else{
				// we're at the last page. stop the cycle.
				//console.log("reached the end of the score");
				cancelAnimFrame(reqId);
				audioManager.seekTime = 0;
				currPage = 1;
				
				prevPageButton.disabled = false;
				nextPageButton.disabled = false;
				optionSelect.disabled = false;
				
				return;
			}
		}
		reqId = reqAnimFrame(step);
	}
	
	playButton.addEventListener("click", function(evt){
		if(audioContext.state === 'suspended'){
			audioContext.resume();
		}
		if(this.dataset.playing === 'false'){
			this.dataset.playing = 'true';
			evt.target.textContent = "pause";
			
			prevPageButton.disabled = true;
			nextPageButton.disabled = true;
			optionSelect.disabled = true;
			
			if(audioManager.seekTime > 0){
				const pageToBeOn = pdfManager.findScorePage(audioManager.seekTime, timeMarkers);

				// if the user goes to a different page while paused and
				// if they play again, we need to move the page back to where they paused
				pdfManager.queueRenderPage(pageToBeOn);
				pdfManager.currPage = pageToBeOn;
				pdfManager.pageNum = currPage;
				//console.log("need to be on page: " + pageToBeOn);
					
				lastTime = audioContext.currentTime - audioManager.seekTime;
			}else{
				// starting from the beginning
				currPage = 1;
				pdfManager.queueRenderPage(currPage);
				lastTime = audioContext.currentTime;
			}
			
			audioManager.play();
			reqId = reqAnimFrame(step);
		}else{
			audioManager.pause();
			this.dataset.playing = 'false';
			evt.target.textContent = "play";
			cancelAnimFrame(reqId);
			
			prevPageButton.disabled = false;
			nextPageButton.disabled = false;
			optionSelect.disabled = false;
		}
	}, false);
	
	const stopButton = document.querySelector('#stopMusic');
	stopButton.addEventListener("click", function(evt){
		// stop playing and rewind audio to the beginning
		cancelAnimFrame(reqId);
		currPage = 1;
		audioManager.stop();
		
		prevPageButton.disabled = false;
		nextPageButton.disabled = false;
		optionSelect.disabled = false;
	}, false);
}

main();