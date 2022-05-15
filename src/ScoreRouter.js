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
	
	const [currScoreCategories, setScoreCategories] = useState({});
    const [currAboutState, setAboutState] = useState(false);
	const [currMenuState, setMenuState] = useState("hide menu");
    
    function toggleAbout(){
        setAboutState(!currAboutState);
    }
	
	useEffect(() => {
		async function getScoreNames(){
			let res = await fetch('src/scoreNames.json');
			res = await res.json();
			setScoreCategories(res);
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
                <h2 className="aboutHeader" onClick={toggleAbout}>about</h2>
                {
                    currAboutState &&
                    <React.Fragment>
                        <p className='about'> Thanks for visiting! This is a place for me to display some of my music work and arrangements. I hope you'll find something interesting. </p>
                        
                        <p className='about'>Please note that although I really enjoy arranging for piano, I am unfortunately not a pianist and so my arrangements for piano (and well, probably any other instrument except for trumpet) may be awkward and/or nonsensical. I'm sorry and welcome any feedback :) (feel free to make an issue in the GitHub repo for this project). </p>
                    </React.Fragment>
                }
                <hr />
				<h2> score list </h2>
				<hr />
				<ul>
				{
					Object.keys(currScoreCategories).map((scoreCategory) => {
						return (
							<div key={"div_" + scoreCategory}>
								<li key={"li_" + scoreCategory}> {scoreCategory}:
									<ul>
									{
										currScoreCategories[scoreCategory].map((scoreName) => {
											return (
												<li key={"li_" + scoreName}> 
													<Link to={"/" + scoreName}>{scoreName}</Link>
												</li>
											)
										})
									}
									</ul>
								</li>
								<br />
							</div>
						)
					})
				}
				</ul>
			</nav>
			
			<Switch>
			{
				Object.keys(currScoreCategories).map((scoreCategory) => {
					return currScoreCategories[scoreCategory].map((scoreName) => {
						return (
							<Route key={"route_" + scoreName} path={"/" + scoreName}>
								<ScoreDisplay scoreName={scoreName} />
							</Route>
						)
					})
				})
			}
			</Switch>
	</Router>
	);
}

export {
	ScoreRouter
}
