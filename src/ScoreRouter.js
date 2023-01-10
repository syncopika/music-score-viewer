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
    const [currSelectedScore, setSelectedScore] = useState("");
    
    function toggleAbout(){
        setAboutState(!currAboutState);
    }
	
    function selectScore(name){
        return function(){
            setSelectedScore(name);
        }
    }
    
    useEffect(() => {
        async function getScoreNames(){
            const res = await fetch('src/scoreNames.json');
            const data = await res.json();
            setScoreCategories(data);
        }
        
        getScoreNames();
        
        // set currSelectedScore to score name in url (it'll be empty string if not present)
        const urlScoreName = window.location.href.split('/').at(-1);
        setSelectedScore(urlScoreName);
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
            <nav className={currMenuState === "hide menu" ? "naviOn" : "naviOff"}>
                <h2 className="aboutHeader" onClick={toggleAbout}>about</h2>
                {
                    currAboutState &&
                    <>
                        <p className='about'> Thanks for visiting! This is a place for me to display some of my music work and arrangements. I hope you'll find something interesting. </p>
                        <p className='about'>disclaimer: As much as I try to write playable stuff, some of my arrangements may be awkward and/or nonsensical. There are probably errors as well. Sorry in advance and any feedback is welcome via GitHub issue for any suggestions/corrections/constructive criticism. </p>
                    </>
                }
                <hr />
                <h2> score list </h2>
                <hr />
                <ul>
                {
                    Object.keys(currScoreCategories).map((scoreCategory) => {
                        const sortedList = currScoreCategories[scoreCategory].sort();
                        return (
                            <div key={"div_" + scoreCategory}>
                                <li key={"li_" + scoreCategory}> {scoreCategory}:
                                    <ul>
                                    {
                                        sortedList.map((scoreName) => {
                                            return (
                                                <li key={"li_" + scoreName} className={scoreName === currSelectedScore ? 'selected' : ''}> 
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
                                <ScoreDisplay scoreName={scoreName} callback={selectScore(scoreName)} />
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
