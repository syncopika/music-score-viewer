// component for displaying the score and instruments
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter,
  Link,
  Outlet,
  Routes,
  Route
} from 'react-router-dom';
import { useGetScoreNames } from './useGetScoreNames.js';
import { ScoreDisplay } from './ScoreDisplay.js';
import { ScoreList } from './ScoreList.js';

const ScoreRouter = () => {

    const {currScoreNames} = useGetScoreNames(); // custom hook to get score data
    const [currSelectedScore, setSelectedScore] = useState('');

    function selectScore(name){
        return function(){
            setSelectedScore(name);
        }
    }
    
    const Homepage = (props) => {
        const [currAboutState, setAboutState] = useState(false);
        const [currSearchText, setCurrSearchText] = useState('');

        function toggleAbout(){
            setAboutState(!currAboutState);
        }
        
        function setSearchText(evt){
            setCurrSearchText(evt.target.value);
        }

        return (
            <>
                <h2 className='aboutHeader' onClick={toggleAbout}>about</h2>
                {
                    currAboutState &&
                    <>
                        <p className='about'> 
                            Thanks for visiting! This is a place for me to display some of my music work and arrangements. 
                            I hope you'll find something interesting. 
                        </p>
                        <p className='about'>
                            disclaimer: As much as I try to write playable stuff, some of my arrangements may be awkward and/or nonsensical. 
                            There are probably errors as well. 
                            Sorry in advance and any feedback is welcome via GitHub issue for any suggestions/corrections/constructive criticism. 
                        </p>
                    </>
                }
                
                <hr />
                
                <label htmlFor='search'>search: </label><input id='search' type='text' onInput={setSearchText} />
                
                <ScoreList currSearchText={currSearchText} currScoreNames={props.currScoreNames} currSelectedScore={props.currSelectedScore} />

                <Outlet />
            </>
        );
    };

    return (
        <HashRouter>
            <h3><Link to='/'> music score viewer </Link><span><a href="https://github.com/syncopika/music-score-viewer">src</a></span></h3>
            <Routes>
                <Route path='/' element={<Homepage currScoreNames={currScoreNames} currSelectedScore={currSelectedScore} />} />
                {
                    currScoreNames.categories && Object.keys(currScoreNames.categories).map(scoreCategory => {
                        return currScoreNames.categories[scoreCategory].map(scoreName => {
                            return (
                                <Route
                                    path={'/' + scoreName}
                                    element={
                                        <ScoreDisplay key={'route_' + scoreName} scoreName={scoreName} callback={selectScore(scoreName)} />
                                    }
                                />
                            )
                        })
                    })
                }
            </Routes>
        </HashRouter>
    );
}

export {
    ScoreRouter
}
