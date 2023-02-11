import React, { useState, useEffect } from 'react';

export function useScoreCategories(){
    const [currScoreCategories, setScoreCategories] = useState({});
    
    useEffect(() => {
        async function getScoreNames(){
            const res = await fetch('src/scoreNames.json');
            const data = await res.json();
            setScoreCategories(data);
        }
        getScoreNames();
    }, []);
    
    return {
        currScoreCategories
    };
}