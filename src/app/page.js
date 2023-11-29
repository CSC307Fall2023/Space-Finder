"use client"
import { useEffect, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material';
import Filter from './components/filter';
import StudyCard from './components/studycard';

export default function Home() {
  const [startIndex, setStartIndex] = useState(0);
  const [studies, setStudies] = useState([]);

  useEffect(() => {
    fetch('/api/study-spaces', { method: 'GET', })
      .then((response) => response.ok && response.json())
      .then((data) => {
        setStudies(data);
      });
  }, []);

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 3);
    }
  };

  const handleNext = () => {
    if (startIndex < studies.length - 3) {
      setStartIndex(startIndex + 3);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: "space-between", p: 1 }}>
        <Filter />
        <Box sx={{ display: "flex", justifyContent: 'flex-start', flexWrap: 'wrap', alignItems: 'center' }}>
          <IconButton onClick={handlePrev} disabled={startIndex === 0}>
            <ArrowBackIosNew />
          </IconButton>
          {studies.slice(startIndex, startIndex + 3).map((study, index) => (
            <StudyCard key={index} id={study.id} studyName={study.name} 
            liveStatus={study.liveStatus} rating={study.rating}
            image={study.img} />
          ))}
          <IconButton onClick={handleNext} disabled={startIndex >= studies.length - 3}>
            <ArrowForwardIos />
          </IconButton>
        </Box>
      </Box>
    </>
  )
}
