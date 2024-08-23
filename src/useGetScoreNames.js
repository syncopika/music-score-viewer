import React, { useState, useEffect } from 'react';

export function useGetScoreNames(){
  const [currScoreNames, setScoreNames] = useState({});
    
  useEffect(() => {
    async function getScoreNames(){
      const res = await fetch('src/scoreNames.json');
      const data = await res.json();
            
      const scoreNameData = {
        'categories': data,
        'tags': {}, // field to store any tags for each arrangement for searching
      };
            
      Object.keys(data).forEach(arrCategory => {
        data[arrCategory].forEach(async (arr) => {
          const arrJson = await fetch(`music/${arr}/${arr}.json`);
          const jsonData = await arrJson.json();
          scoreNameData.tags[arr] = jsonData.tags;
        });
      });
            
      //console.log(scoreNameData);
      setScoreNames(scoreNameData);
    }
    getScoreNames();
  }, []);
    
  return {
    currScoreNames
  };
}