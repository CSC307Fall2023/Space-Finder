import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Box, List, ListItem, Menu, MenuItem } from '@mui/material';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from "@mui/material/CardActionArea";
import { useState } from 'react';
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

export default function StudyCard(props) {
    const { id, studyName, liveStatus, rating, image } = props;
    const [isStarred, setIsStarred] = useState(false);
    const [open, setOpen] = useState(false);
    const [ratingState, setRatingState] = useState(rating);
  const [anchorEl, setAnchorEl] = React.useState(null);
//   report
  const [ formState, setFormState ] = useState({});
  const [ error, setError ] = useState(false);
//   report

  function toggleStar() {
    setIsStarred(!isStarred);
  }
  
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleCheckIn = () => {
    setAnchorEl(null); // Close the menu when "Check In" is clicked
    displayCheckInMessage(); // Function to display a pop-up message
  };

  const displayCheckInMessage = () => {
    alert('Yay! You\'ve checked in.');
  };
  const handleRatingChange = (event, newValue) => {
    setRatingState(newValue);
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
        mx: 4,
        mb: 10,
        bgcolor: '#dfebe9',
        boxShadow: 6,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        width: 300,
      }}
      
    >
      <CardActionArea
        disableRipple
        onClick={() => {!open && (window.location.href = '/studyspot')}}
      >
      <CardContent>
      <Button component="span" sx={{ position: 'absolute', top: 20, left: 10, zIndex: 1, color: 'black',}} onClick={(event) => {event.stopPropagation(); toggleStar();}}>
        {isStarred ? <BookmarkAddedIcon sx={{fontSize: 30, color: 'red'}} /> : <BookmarkAddIcon sx={{fontSize: 30, color: 'white'}} />}
      </Button>
        <CardMedia
          component="img"
          sx={{
            borderRadius: 2,
            boxShadow: 6,
            display: { xs: 'none', sm: 'block' },
            ':hover': { cursor: 'pointer' }
          }}
          image={image}
          alt={"study"}
          onClick={() => {window.location.href = `/studyspot/${id}`}}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'left', p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Typography component="div">
              {studyName}
            </Typography>
            <Button
              component="span"
              onClick={(event) => {event.stopPropagation(); handleMenuClick(event);}}
              sx={{ color: 'black', ':hover': { bgcolor: 'gray' } }}
              size="small"
            >
              . . .
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={(event) => {event.stopPropagation(); handleMenuClose();}}
            >
              <MenuItem onClick={(event) => {event.stopPropagation(); handleCheckIn();}}>Check In</MenuItem>
              <MenuItem onClick={(event) => {event.stopPropagation(); handleMenuClose();}}>Rate: 
              <Rating
            name="rating"
            value={ratingState}
            precision={0.5}
            onChange={(event, newValue) => {event.stopPropagation(); handleRatingChange(event, newValue)}}/>
          </MenuItem>
              <MenuItem onClick={(event, newValue) => {event.stopPropagation(); handleReportButton(event, newValue)}}>Report</MenuItem>
              </Menu>
              {/* -------------------------------- */}
               {/* <Button variant="underlined" color="inherit" onClick={handleReportButton}>Add Spot</Button> */}
      {open && <Dialog open={open} onClose={(event) => {event.stopPropagation(); handleClose();}}>
        <DialogTitle>Report Study Spot</DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            To Report any inaccuracies, please fill in the following fields.
          </DialogContentText>
          { error ? (
            <Alert severity="error">There was an issue submitting the report, please adjust the fields and try again.</Alert>
          ) : null }
          <TextField
            autoFocus
            margin="dense"
            id="spotName"
            name="spotName"
            label="Spot Name"
            type="spotName"
            fullWidth
            variant="standard"
            required
     
          />
          <TextField
            margin="dense"
            id="building"
            name="building"
            label="Building"
            type="building"
            required
            fullWidth
            variant='standard'/>
          <TextField
            margin="dense"
            name="capacity"
            id="SpotCap"
            label="Spot Capacity"
            inputProps={{min: 0}}
            type="number"
            required
            fullWidth
            variant='standard'/>
        </DialogContent>
        <DialogActions>
          <Button onClick={(event) => {event.stopPropagation(); handleClose();}}>Cancel</Button>
          <Button type="submit">Submit for Review</Button>
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
                          Rating: {ratingState}
                      </Typography>
          </Box>
          <Box>
            <Typography sx={{ mt: 1.5 }} color="text.secondary">
              Top Amenities:
            </Typography>
            <List>
              <ListItem>1. Wifi</ListItem>
              <ListItem>2. Bathroom</ListItem>
              <ListItem>3. Air Conditioning</ListItem>
            </List>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ mt: -3 }}>
        <Box sx={{ ml: 4, mb: 2, ':hover': { cursor: 'pointer' }}}>
            <Button component="span" sx={{ bgcolor: 'black', color: 'white', ':hover': { bgcolor: 'gray'}}} size="small">Comments</Button>
        </Box>
      </CardActions>
      </CardActionArea>
    </Card>
  );
}