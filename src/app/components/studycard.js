import * as React from 'react';
import Card from '@mui/material/Card';
import FlagIcon from '@mui/icons-material/Warning';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Box, List, ListItem, Menu, MenuItem } from '@mui/material';
import CardMedia from '@mui/material/CardMedia';
import { useState, useEffect } from 'react';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import { useRouter } from 'next/navigation';

export default function StudyCard(props) {
    const { id, studyName, saved, distance, liveStatus, amenities, image } = props;
    const [isStarred, setIsStarred] = useState(saved);
    const [isFlagged, setIsFlagged] = useState(false);
    const [open, setOpen] = useState(false);
    const [ratingState, setRatingState] = useState([]);
    const [ratingNum, setRatingNum] = useState(0);
    const [ratingLen, setRatingLen] = useState(0);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [ formState, setFormState ] = useState({});
    const [name, setName] = useState('');
    const [spotName, setSpotName] = useState('');
    const [checkedIn, setCheckedIn] = useState(false); 
    const [reason, setReason] = useState('');
    const [ error, setError ] = useState(false);
    const router = useRouter();

    useEffect(() => {
      fetch(`/api/ratings/${id}`, { method: 'GET'})
        .then((response) => response.ok && response.json())
        .then((ratings) => {
          setRatingState(ratings);
        });
    }, [id]);

  useEffect(() => {
    fetch(`/api/study-spaces/${id}`, { method: 'GET'})
      .then((response) => response.ok && response.json())
      .then((space) => {
        setRatingNum(space.avgRating);
        setIsFlagged(space.flagged);
      });
    fetch(`/api/ratings/${id}`, { method: 'GET'})
      .then((response) => response.ok && response.json())
      .then((ratings) => {
        setRatingLen(ratings.length);
      });
  }, [id]);

  function handleSave() {
    fetch(`/api/save-spot`, { method: 'PUT', body: JSON.stringify({ studySpotId: id })});
    setIsStarred(!isStarred);
  }

  function handleSubmittedReview() {
    if (name && name.length && spotName && spotName.length && reason && reason.length) {
        fetch("/api/report", { method: "post", body: JSON.stringify({
          userName: name,
          spotName: spotName,
          reason: reason,
          studySpaceId: id
          }) } );
        // Send a request to your backend to update the rating
        fetch(`/api/study-spaces/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            flagged: true,
          }),
        });
        setOpen(false);
        displayFlaggedSpotMessage();
        setName('');
        setSpotName('');
        setReason('');
    }
  }
      
  const displayFlaggedSpotMessage = () => {
    alert('This spot has been flagged, sorry for the inconvenience.');
  }
  
    const handleMenuClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleCheckIn = () => {
      setAnchorEl(null); 
      fetch(`/api/reservations`, { method: 'GET', })
      .then((response) => response.ok && response.json())
      .then((reservations) => {
        let checkedIn = false;
        if (reservations) {
          reservations.forEach((reservation) => {
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
              ssid: id,
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
    
    const handleRatingChange = async (event, newValue) => {
      try {
        let response = await fetch('/api/ratings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studySpaceID: id,
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
          response = await fetch(`/api/study-spaces/avg-rating/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              studyID: id,
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
        
      }
    };

    const handleReportButton = (event, newValue) => {
      setOpen(true);
      setFormState({});
    };

    function handleClose() {
      setOpen(false);
    }

  return (
    <Card
      sx={{
        mx: 2,
        my: 2,
        bgcolor: '#dfebe9',
        boxShadow: 6,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        width: 300,
        height: 500
      }}
      
    >
      <CardContent>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      <Button sx={{ position: 'absolute', top: 20, left: 10, zIndex: 1, color: 'black',}} onClick={handleSave}>
                {isStarred ? <BookmarkAddedIcon sx={{fontSize: 30, color: 'darkred',stroke: 'black',}} /> : <BookmarkAddIcon sx={{fontSize: 30, color: 'white', stroke: 'black'}} />}
            </Button>
            {isFlagged ? (<FlagIcon sx={{fontSize: 35, position: 'absolute', top: 20, right: 10, zIndex: 1, color: 'gold',stroke: 'black',}} /> ): null}
      </Box>
        
        <CardMedia
          component="img"
          sx={{
            borderRadius: 2,
            boxShadow: 6,
            display: { xs: 'none', sm: 'block' },
            ':hover': { cursor: 'pointer' },
            maxHeight: 125,
          }}
          image={image}
          alt={"study"}
          onClick={() => router.push(`/studyspot/${id}`)}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'left', p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ textTransform: 'capitalize',fontFamily: 'Lucida Grande',fontWeight: 'bold' }}>
                {studyName}
              </Typography>
              <Typography sx={{ fontSize: 10 }} color="text.secondary">
                {distance} miles away
              </Typography>
            </Box>
            <Button
              onClick={handleMenuClick}
              sx={{ color: 'black', ':hover': { bgcolor: 'gray' } }}
              size="small"
            >
              . . .
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleCheckIn}>Check In</MenuItem>
              <MenuItem onClick={handleMenuClose}>Rate: 
                  <Rating
                name="rating"
                value={ratingNum}
                precision={0.5}
                onChange={handleRatingChange}/>
              </MenuItem>
              <MenuItem onClick={handleReportButton}>Report</MenuItem>
              </Menu>
              {/* -------------------------------- */}
               {/* <Button variant="underlined" color="inherit" onClick={handleReportButton}>Add Spot</Button> */}
      {open && <Dialog open={open} onClose={handleClose}>
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" onClick={handleSubmittedReview}>Submit for Review</Button>
        </DialogActions>
        
      </Dialog>}
        {/* -------------------------------- */}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Typography sx={{ mt: 1.5 }} color="text.secondary">
              Live Status: {liveStatus}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row'}}>
                      <Typography sx={{mt:1.5}} color="text.secondary">
                          Rating: {ratingNum}
                          {` (${ratingLen} ratings)`}
                      </Typography>
          </Box>
          <Box>
            <Typography sx={{ mt: 1.5 }} color="text.secondary">
              Included Amenities:
            </Typography>
            <List>
              {amenities.slice(0, 3).map((amenity, index) => (
                <ListItem key={index}>
                  - {amenity || '-'}
                </ListItem>
              ))}
              {amenities.length < 3 && Array.from({ length: 3 - amenities.length }).map((_, index) => (
                <ListItem key={index + amenities.length}>
                  -
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ mt: -3 }}>
        <Box sx={{ ml: 4, mb: 2}}>
            <Button sx={{ bgcolor: 'black', color: 'white', ':hover': { bgcolor: 'gray'}}} size="small"
            onClick={() => router.push(`/studyspot/${id}`)}>Comments</Button>
        </Box>
      </CardActions>
    </Card>
  );
}