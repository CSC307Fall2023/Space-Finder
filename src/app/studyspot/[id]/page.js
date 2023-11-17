"use client"
import {
  Box,
  Typography,
  Button,
  Alert,
  Divider,
  Slider,
  Paper,
  Grid,
  fabClasses,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import Comments from '../../components/comments';
import AmenitiesList from '../../components/amenitiesList';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

function StudySpot(props) {
    const [open, setOpen] = useState(false);
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    })
    const params = useParams();
    const [spot, setSpot] = useState({});
    const [map, setMap] = React.useState(null)
    const [center, setCenter] = React.useState({
        lat: 35.305,
        lng: -120.6625
    })

    useEffect(() => {
        fetch('/api/study-spaces/' + params.id, { method: 'GET', params: {id: params.id} })
          .then((response) => response.ok && response.json())
          .then((data) => {
            setSpot(data);
            setCenter({lat: data.latitude, lng: data.longitude});
            console.log(data);
          });
      }, []);

    const onLoad = React.useCallback(function callback(map) {
        const bounds = new window.google.maps.LatLngBounds(center);
        map.fitBounds(bounds);

        setMap(map)
    }, [center])

    const onUnmount = React.useCallback(function callback(map) {
        setMap(null)
    }, [])  

    function toggleOpen() {
      setOpen(!open);
  }

  const loggedIn = false; // Replace with a field passed through props

  return (
    <Box p={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3}>
            <Box p={2}>
              <Typography variant="h4" gutterBottom>
                {spot.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {spot.building}
              </Typography>
              <Typography variant="body1" gutterBottom>
                School: Cal Poly SLO
              </Typography>
              {loggedIn ? (
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Button variant="outlined" color="primary" width="200px" href="#">
                    Rate
                  </Button>
                  <Button variant="outlined" color="primary" href="#">
                    Report
                  </Button>
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Alert severity="warning">Must be signed in to Rate or Report</Alert>
                  <Button disabled>Rate</Button>
                  <Button disabled>Report</Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
            <Box sx={{ boxShadow:3, height: '16.7em', bgcolor: 'grey.500', borderRadius: 1}}>
              {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={{width: '100%', height: '100%'}}
                    center={center}
                    zoom={15}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    options={{
                        styles: [
                            {
                                elementType: 'labels.icon',
                                stylers: [{visibility: 'off'}]
                            }
                        ]
                    }}
                >
                    <Marker onClick={toggleOpen} position={center}>
                        {open && <InfoWindow onCloseClick={() => toggleOpen()}>
                                <Box>
                                    <Typography>{spot.name}: Very Busy</Typography>
                                    <Typography>Lat: {spot.latitude.toFixed(2)}, Long: {spot.longitude.toFixed(2)}</Typography>
                                </Box>
                            </InfoWindow>}
                    </Marker>
                </GoogleMap>
        ) : <></>}
            </Box>
        </Grid>
      </Grid>
      <Box mt={2} mb={2}>
        <Divider orientation="horizontal" />
      </Box>
      <Grid container justifyContent={'space-between'} spacing={3}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3}>
            <Box sx={{height: "100%"}} p={2}>
              <Typography variant="h4" component="h3">
                Comments
              </Typography>
              <Comments />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper elevation={3}>
            <Box p={2}>
              <Typography variant="h4" component="h3">
                Amenities
              </Typography>
              <AmenitiesList />
            </Box>
          </Paper>
        </Grid>
        <Box sx={{boxShadow: 3, mt: 3, ml:2}} p={2}>
          <Typography variant="h4" component="h3">
            Busyness
          </Typography>
          <Slider
            aria-label="Rating"
            size="medium"
            defaultValue={2}
            step={1}
            min={0}
            max={5}
            marks={[{ value: 0, label: '0' }, { value: 5, label: '5' }]}
            valueLabelDisplay="auto"
          />
          <Box mt={2}>
            <Typography variant="h4" component="h3">
              Trends
            </Typography>
          </Box>
          <BarChart
            xAxis={[
              {
                id: 'Time',
                data: ['1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'],
                scaleType: 'band',
              },
            ]}
            series={[
              {
                data: [20, 33, 81, 45, 21, 76],
              },
            ]}
            width={500}
            height={300}
          />
        </Box>
      </Grid>
    </Box>
  );
}

export default StudySpot;
