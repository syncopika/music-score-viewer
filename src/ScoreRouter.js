// component for displaying the score and instruments
import React, { useState } from 'react';
import {
  HashRouter,
  Link,
  Routes,
  Route
} from 'react-router-dom';
import { useGetScoreNames } from './useGetScoreNames.js';
import { ScoreDisplay } from './ScoreDisplay.js';
import { Homepage } from './HomePage.js';

export const ScoreRouter = () => {
  const {currScoreNames} = useGetScoreNames(); // custom hook to get score data
  const [currSelectedScore, setSelectedScore] = useState('');

  function selectScore(name){
    return function(){
      setSelectedScore(name);
    };
  }

  return (
    <HashRouter>
      <Routes>
        <Route
          path='/'
          element={
            <Homepage
              currScoreNames={currScoreNames}
              currSelectedScore={currSelectedScore} />
          }
        />
        {
          currScoreNames.categories && Object.keys(currScoreNames.categories).map(scoreCategory => {
            return currScoreNames.categories[scoreCategory].map(scoreName => {
              return (
                <Route
                  path={'/' + scoreName}
                  element={
                    <ScoreDisplay
                      key={'route_' + scoreName}
                      scoreName={scoreName}
                      callback={selectScore(scoreName)} />
                  }
                />
              );
            });
          })
        }
      </Routes>
    </HashRouter>
  );
};