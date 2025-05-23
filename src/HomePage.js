import React, { useState, useEffect } from 'react';
import { ScoreList } from './ScoreList.js';
import {
  Outlet,
} from 'react-router-dom';

export const Homepage = (props) => {
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
      <header>
        <h1>
          music score viewer
          <span><a href="https://github.com/syncopika/music-score-viewer">src</a></span>
        </h1>
        <h3 className='aboutHeader' onClick={toggleAbout}>about</h3>
        {
          currAboutState &&
          <>
            <p className='about'>
              Thanks for visiting! This is a place for me to display
              some of my music work and arrangements.
              I hope you'll find something interesting.
            </p>
            <p className='about'>
              disclaimer: As much as I try to write playable stuff,
              some of my arrangements may be awkward and/or nonsensical.
              There are probably errors as well.
              Apologies in advance and any feedback (suggestions/corrections/constructive criticism)
              is welcome and would be well-appreciated via GitHub issue.
            </p>
          </>
        }
        <hr />
      </header>
              
      <main>
        <label htmlFor='search'>search: </label>
        <input id='search' type='text' onInput={setSearchText} />
                  
        <ScoreList
          currSearchText={currSearchText}
          currScoreNames={props.currScoreNames}
          currSelectedScore={props.currSelectedScore}
        />

        <Outlet />
      </main>
    </>
  );
};