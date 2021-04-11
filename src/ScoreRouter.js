// component for displaying the score and instruments
import React from 'react';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

const ScoreRouter = (props) => {
	const audioManager = props.audioManager;
	const PdfManager = props.pdfManager;
	
	// pass in a list of all scores (json again?) to list in the router
	const scoreList = props.scoreList;
	
	return (
		<Router>
			<div>
				<nav>
					<ul>
						// dynamic li creation based on scoreList. what to do about categories?
					</ul>
				</nav>
			</div>
			
			<Switch>
			  // dynamic route creation based on scoreList. need to map 'link to' to 'path'
			</Switch>
		</Router>
	);
	
	// render a certain component! this might be what we need (we don't want to replace the whole page)
	// so the insturment sliders and notes can be one component. the canvas part should always stay and doesn't need
	// to be a react component. so each route can just load in the audio data, update the canvas, and dynamically render the sliders + notes.
	// https://reactrouter.com/web/api/Route/component
	
	
	/* this stuff needs to be done when a score is selected from the router!
	audioManager.reset();
	pageNum = 1;
	currPage = 1;
	currTimeDiff = 0;
	
	// useeffect for these parts?
	const data = await audioManager.loadScoreJson(options[selected]);
	await pdfManager.loadScore(data.scorePath); // this just returns a boolean
	
	trackPaths = data.trackPaths;
	notes = data.notes;
	timeMarkers = data.timeMarkers;
	
	audioManager.loadInstrumentParts(trackPaths, playButton);
	audioManager.updateDOM(document.getElementById("toolbar"), data.duration);
	audioManager.addNotes(document.getElementById("toolbar"), notes);
	*/
}
