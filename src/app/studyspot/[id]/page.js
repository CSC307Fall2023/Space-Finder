"use client"
import {
  Box,
  Typography,
  Button,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Slider,
  TextField,
  Paper,
  Grid,
  CardMedia,
  MenuItem,
  Rating
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import Comments from '../../components/comments';
import AmenitiesList from '../../components/amenitiesList';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

function StudySpot(props) {
  const { data: session, status }  = useSession();

    const [open, setOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);
    const [name, setName] = useState("");
    const [error, setError] = useState(false);
    const [spotName, setSpotName] = useState("")
    const [reason, setReason] = useState("");
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    })
    const [capacity, setCapacity] = useState(0);
    const params = useParams();
    const [spot, setSpot] = useState({});
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [map, setMap] = React.useState(null)
    const [ratingState, setRatingState] = useState([]);
    const [ratingNum, setRatingNum] = useState(0);
    const [amenities, setAmenities] = useState([]);
    const [ratingLen, setRatingLen] = useState(0);
    const [center, setCenter] = React.useState({
        lat: 35.305,
        lng: -120.6625
    })

    useEffect(() => {
        fetch('/api/study-spaces/' + params.id, { method: 'GET', params: {id: params.id} })
          .then((response) => response.ok && response.json())
          .then((data) => {
            setSpot(data);
            setAmenities(data.amenities);
            setRatingNum(data.avgRating);
            setCapacity(data.capacity);
            setCenter({lat: data.latitude, lng: data.longitude});
            fetch(`/api/ratings/${data.id}`, { method: 'GET'})
              .then((response) => response.ok && response.json())
              .then((ratings) => {
                setRatingState(ratings);
                setRatingLen(ratings.length);
            });
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

    function flagSpot() {

      if (name && name.length && spotName && spotName.length && reason && reason.length) {
        fetch("/api/report", { method: "post", body: JSON.stringify({
          userName: name,
          spotName: spotName,
          reason: reason,
          studySpaceId: parseInt(params.id)
          }) } );
        // Send a request to your backend to update the rating
        fetch(`/api/study-spaces/${params.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            flagged: true,
          }),
        });
        setReportOpen(false);
        displayFlaggedSpotMessage();
        setName("");
        setSpotName("");
        setReason("");
    }
  }

    function toggleOpen() {
      setOpen(!open);
    }

      
    const handleCheckIn = () => {
      setAnchorEl(null); 
      fetch(`/api/reservations`, { method: 'GET', })
      .then((response) => response.ok && response.json())
      .then((reservations) => {
        console.log(reservations);
        let checkedIn = false;
        if (reservations) {
          reservations.forEach((reservation) => {
            console.log(reservation);
            const currentTime = new Date();
            // Get the time the user checked in
            const checkInTime = new Date(reservation.checkIn);
            // Get the difference between the current time and the check in time
            const difference = currentTime - checkInTime;
            // If the difference is less than 3600000 milliseconds (1 hour), then the user has already checked in
            if (difference < 3600000) {
              checkedIn = true;
            }
          });
        }

        if (checkedIn) {
          displayAlreadyCheckedInMessage();
        } else {
          fetch(`/api/reservations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ssid: +params.id,
            }),
          }).then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Error checking in');
            }
          }).then((data) => {
            console.log(data);
          }).catch((error) => {
            console.log(error);
          });
          displayCheckInMessage(); 
        }
      });
    };

    const displayAlreadyCheckedInMessage = () => {
      alert('Sorry, you have already checked in to a spot.');
    };
    
    const displayCheckInMessage = () => {
      alert('Yay! You\'ve checked in. You have reserved this spot for an hour. If you would like to study here longer, please check in again later.');
    };

      const getReportDialog = () => {
        return (<Dialog open={reportOpen} onClose={() => setReportOpen(false)}>
        <DialogTitle>Report Study Spot</DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            To Report any inaccuracies, please fill in the following fields.
          </DialogContentText>
          { error ? (
            <Alert severity="error">There was an issue submitting the report, please adjust the fields and try again.</Alert>
          ) : null }
          <TextField
            margin="dense"
            id="name"
            name="name"
            label="Name"
            type="name"
            required
            fullWidth
            variant='standard'
            onChange={e => {
              setName(e.target.value);
            }}/>
          <TextField
            margin="dense"
            id="spotName"
            name="spotName"
            label="Spot Name"
            type="spotName"
            required
            fullWidth
            variant='standard'
            onChange={e => {
              setSpotName(e.target.value);
            }}/>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            name="reason"
            label="Reason For Report"
            type="reason"
            fullWidth
            variant="standard"
            onChange={e => {
              setReason(e.target.value);
            }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={flagSpot}>Submit for Review</Button>
        </DialogActions>
        
      </Dialog>);
    }

      const displayFlaggedSpotMessage = () => {
        alert('This spot has been flagged, sorry for the inconvenience.');
      }
      
      const handleRatingChange = async (event, newValue) => {
        try {
          // Send a request to your backend to update the rating
          let response = await fetch('/api/ratings', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              studySpaceID: spot.id,
              value: newValue,
            }),
          });
  
          if (response.ok) {
            const responseData = await response.json();
            const updatedRatings = ratingState.map((rating) => {
              if (rating.userId === responseData.userId) {
                return { ...rating, value: responseData.value };
              }
              return rating;
            });
  
            if (!updatedRatings.some((rating) => rating.userId === responseData.userId)) {
              updatedRatings.push({ userId: responseData.userId, value: responseData.value });
            }
  
            let ratingNum = updatedRatings.length === 0 ? 0 : (updatedRatings.map(obj => obj.value).reduce((a, b) => a + b, 0) / updatedRatings.length).toFixed(1)
            response = await fetch(`/api/study-spaces/avg-rating/${spot.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                studyID: spot.id,
                avgRating: ratingNum,
              }),
            });
  
            setRatingLen(updatedRatings.length);
            setRatingState(updatedRatings);
            setRatingNum(ratingNum);
          } else {
            throw new Error('Failed to update rating');
          }
        } catch (error) {
          console.error(error);
          // Handle the error here, e.g. display an error message to the user
        }
      };

  return (
    <Box p={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3}>
            <Box sx={{p:2}}>
              <Box sx={{display: "flex", flexDirection: 'row', justifyContent: "space-between"}}>
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {spot.name}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {spot.building}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    School: Cal Poly SLO
                  </Typography>
                </Box>
                <CardMedia
          component="img"
          sx={{
            borderRadius: 2,
            boxShadow: 6,
            display: { xs: 'none', sm: 'block' },
            ':hover': { cursor: 'pointer' },
            maxHeight: 125,
            maxWidth: 300
          }}
          image={spot.img}
          alt={"study"}
        />
              </Box>
              {status === "authenticated" ? (
                <Box display="flex" flexDirection="row" justifyContent="space-around">
              <MenuItem onClick={handleCheckIn}>Check In</MenuItem>
              <Box sx={{display: "flex", flexDirection: "column", mt: 2}}>
                <Typography>Rate: 
                  <Rating precision={0.5} onChange={handleRatingChange}/>
                </Typography>
                <Typography sx={{mx: "auto"}} color="text.secondary">
                  {ratingNum} {` (${ratingLen} ratings)`}
                </Typography>
              </Box>
              <MenuItem onClick={() => setReportOpen(true)}>Report</MenuItem>
              {reportOpen && getReportDialog()}
                </Box>
              ) : (
                <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 2}} >
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
              <AmenitiesList amenities={amenities}/>
            </Box>
          </Paper>
        </Grid>
        <Box sx={{boxShadow: 3, mt: 3, ml:2}} p={2}>
          <Typography variant="h4" component="h3">
            Busyness
          </Typography>
          <Slider 
            disabled
            defaultValue={1 + Math.floor(Math.random() * 30)}
            aria-label="Disabled slider"
            max={capacity}
            marks={[{ value: 0, label: '0' }, { value: capacity, label: `${capacity}` }]}
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
                data: ['1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM', '12 AM'],
                scaleType: 'band',
              },
            ]}
            series={[
              {
                data: [0, 1 , 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 , 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
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
