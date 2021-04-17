// component for displaying the score and instruments
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { ScoreDisplay } from "./ScoreDisplay.js";

const ScoreRouter = (props) => {
	const audioManager = props.audioManager;
	const pdfManager = props.pdfManager;
	
	const [currScoreNames, setScoreNames] = useState([]);
	const [currMenuState, setMenuState] = useState("show menu");
	
	useEffect(() => {
		async function getScoreNames(){
			let res = await fetch('src/scoreNames.json');
			res = await res.json();
			setScoreNames(res);
		}
		getScoreNames();
	}, []);
	
	return (
		<Router>
			<div id='toggleSidebar'>
				<button 
					className="toggleSidebarBtn" 
					onClick={() => {
						if(currMenuState === "show menu"){
							setMenuState("hide menu");
						}else{
							setMenuState("show menu");
						}
					}}
				>{currMenuState}</button>
			</div>
			<nav className={currMenuState === "hide menu" ? 'naviOn' : 'naviOff'}>
				<h2> score list </h2>
				<hr />
				<ul>
				{
					currScoreNames.map((scoreName) => {
						return (
							<li key={"li_" + scoreName}>
								<Link to={"/" + scoreName}>{scoreName}</Link>
							</li>
						)
					})
				}
				</ul>
			</nav>
			
			<Switch>
			{
				currScoreNames.map((scoreName) => {
					return (
						<Route key={"route_" + scoreName} path={"/" + scoreName}>
							<ScoreDisplay scoreName={scoreName} />
						</Route>
					)
				})
			}
			</Switch>
	</Router>
	);
}

export {
	ScoreRouter
}
