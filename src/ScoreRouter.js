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
			<div>
				<nav>
					<ul>
					{
						currScoreNames.map((scoreName) => {
							return (
								<li key={"link_" + scoreName}>
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
			
			</div>
		</Router>
	);
}

export {
	ScoreRouter
}
