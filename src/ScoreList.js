<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
=======
import React from 'react';
>>>>>>> improving linting a bit more, minor code adjustments
import { Link } from 'react-router-dom';

export const ScoreList = (props) => {
  const currScoreCategories = props.currScoreNames.categories;
  const currSelectedScore = props.currSelectedScore;
  const scoreTags = props.currScoreNames.tags;
  const currSearchText = props.currSearchText;
    
  const scoreCategoryStyle = {
    'textDecoration': 'underline',
    'fontWeight': 'bold',
  };
    
  function matchScoreName(text, scoreName){
    return scoreName.replace('_', ' ').toLowerCase().includes(text.toLowerCase()) ||
           scoreName.toLowerCase().includes(text.toLowerCase());
  }
    
  return (
    <ul>
      {
        currScoreCategories && Object.keys(currScoreCategories).map(scoreCategory => {
          const sortedList = currScoreCategories[scoreCategory].sort();
          return (
<<<<<<< HEAD
            <div key={'div_' + scoreCategory}>
              <p key={'li_' + scoreCategory} style={scoreCategoryStyle}> {scoreCategory}: </p>
=======
            <div key={"div_" + scoreCategory}>
>>>>>>> improving linting a bit more, minor code adjustments
              <ul>
                <li key={"li_" + scoreCategory} style={scoreCategoryStyle}> {scoreCategory}: </li>
                {
                  sortedList
                    .filter(scoreName => {
                      if(currSearchText){
                        let matchFound = matchScoreName(currSearchText, scoreName);
                                
                        if(scoreTags[scoreName]){
                          matchFound |= scoreTags[scoreName].some(
                            tag => tag.toLowerCase().includes(currSearchText.toLowerCase())
                          );
                        }
                                
                        return matchFound;
                      }
                              
                      return true;
                    })
                    .map(scoreName => {
                      return (
<<<<<<< HEAD
                        <li key={'li_' + scoreName} className={scoreName === currSelectedScore ? 'selected' : ''}> 
=======
                        <li 
                          key={"li_" + scoreName} 
                          className={scoreName === currSelectedScore ? 'selected' : ''}
                        > 
>>>>>>> improving linting a bit more, minor code adjustments
                          <Link to={scoreName}>{scoreName}</Link>
                        </li>
                      );
                    })
                }
              </ul>
            </div>
          );
        })
      }
    </ul>
  );
};