// component for displaying the score and instruments
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter as Router,
  Outlet,
  Routes,
  Route
} from "react-router-dom";
import { useScoreCategories } from "./useScoreCategories.js";
import { ScoreDisplay } from "./ScoreDisplay.js";
import { ScoreList } from "./ScoreList.js";

const ScoreRouter = () => {
    
    const { currScoreCategories } = useScoreCategories(); // custom hook to get score data
    const [currSelectedScore, setSelectedScore] = useState("");

    function selectScore(name){
        return function(){
            setSelectedScore(name);
        }
    }
    
    const Sidebar = (props) => {
        const [currAboutState, setAboutState] = useState(false);
        const [currMenuState, setMenuState] = useState("hide menu");

        function toggleAbout(){
            setAboutState(!currAboutState);
        }

        return (
            <>
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
                    <ScoreList currScoreCategories={props.currScoreCategories} currSelectedScore={props.currSelectedScore} />
                </nav>

                <Outlet />
            </>
        );
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Sidebar currScoreCategories={currScoreCategories} currSelectedScore={currSelectedScore} />}>
                {
                    currScoreCategories && Object.keys(currScoreCategories).map((scoreCategory) => {
                        return currScoreCategories[scoreCategory].map((scoreName) => {
                            return (
                                <Route
                                    path={"/" + scoreName}
                                    element={<ScoreDisplay key={"route_" + scoreName} scoreName={scoreName} callback={selectScore(scoreName)} />}
                                />
                            )
                        })
                    })
                }
                </Route>
            </Routes>
        </Router>
    );
}

export {
    ScoreRouter
}
