import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

export const ScoreList = (props) => {
    const currScoreCategories = props.currScoreCategories;
    const currSelectedScore = props.currSelectedScore;
    
    const scoreCategoryStyle = {
        'textDecoration': 'underline',
        'fontWeight': 'bold',
    };
    
    return (
        <ul>
        {
            Object.keys(currScoreCategories).map((scoreCategory) => {
                const sortedList = currScoreCategories[scoreCategory].sort();
                return (
                    <div key={"div_" + scoreCategory}>
                        <li key={"li_" + scoreCategory} style={scoreCategoryStyle}> {scoreCategory}: </li>
                        <ul>
                        {
                            sortedList.map((scoreName) => {
                                return (
                                    <li key={"li_" + scoreName} className={scoreName === currSelectedScore ? 'selected' : ''}> 
                                        <Link to={scoreName}>{scoreName}</Link>
                                    </li>
                                )
                            })
                        }
                        </ul>
                        <br />
                    </div>
                )
            })
        }
        </ul>
    );
}