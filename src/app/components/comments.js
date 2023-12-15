import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { Box, Button, IconButton } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { useSession } from 'next-auth/react';

export default function Comments(props) {
    const {spaceId} = props;
    const { data: session, status } = useSession();
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');

  const handleCommentChange = (event) => {
    setCommentText(event.target.value);
  };

  const handleCommentSubmit = () => {
    if (commentText.trim() !== '') {
      const newComment = {
        text: commentText,
        rating: 0,
        voted: null, 
      };

      fetch('/api/comments', {
        method: 'POST',
        body: JSON.stringify({
          ssid: spaceId,
          text: newComment.text,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setComments([...comments, newComment]);
      setCommentText('');
    }
  };

  const handleVote = (index, type) => {
    const updatedComments = [...comments];
  
    if (type === 'up') {
      if (updatedComments[index].voted === 'up') {
        updatedComments[index].voted = null;
        updatedComments[index].rating -= 1;
      } else if (updatedComments[index].voted === 'down') {
        updatedComments[index].rating += 2;
        updatedComments[index].voted = 'up';
      } else {
        updatedComments[index].rating += 1;
        updatedComments[index].voted = 'up';
      }
    } else if (type === 'down') {
      if (updatedComments[index].voted === 'down') {

        updatedComments[index].voted = null;
        updatedComments[index].rating += 1;
      } else if (updatedComments[index].voted === 'up') {
    
        updatedComments[index].rating -= 2;
        updatedComments[index].voted = 'down';
      } else {
        
        updatedComments[index].rating -= 1;
        updatedComments[index].voted = 'down';
      }
    }
  
    setComments(updatedComments);
  };

  useEffect(() => {
    fetch(`/api/comments/${spaceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const dbComments = []
        for (const comment in data) {
          console.log(data[comment])
          fetch(`/api/users/${data[comment].ownerId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
            .then((response) => response.json())
            .then((user) => {
              const newComment = {
                text: data[comment].text,
                rating: data[comment].votes,
                voted: null,
                user: user.username
              };
              console.log(newComment)
              dbComments.push(newComment);
            })
        }

        setComments(dbComments);
      });
  }, []);

  const renderComments = (commentsArray) => {
    return commentsArray.map((comment, index) => (
      <>
        <ListItem alignItems="flex-start" key={index}>
          <ListItemAvatar>
            <Avatar alt={`User${comment.user}`} src={`/static/images/avatar/${index + 1}.jpg`} />
          </ListItemAvatar>
          <ListItemText
            primary={comment.text}
            secondary={`— ${comment.user} | Rating: ${comment.rating}`}
          />
          <IconButton
            aria-label="upvote"
            onClick={() => handleVote(index, 'up')}
            color={comment.voted === 'up' ? 'primary' : 'default'}
          >
            <ThumbUpIcon />
          </IconButton>
          <IconButton
            aria-label="downvote"
            onClick={() => handleVote(index, 'down')}
            color={comment.voted === 'down' ? 'primary' : 'default'}
          >
            <ThumbDownIcon />
          </IconButton>
        </ListItem>
        <Divider variant="inset" component="li" />
      </>
    ));
  };
  

  return (
    <>
      <Box component="span" display="flex" flexDirection="column">
        <Box component="span" m={1}>
          <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            {renderComments(comments)}
          </List>
        </Box>
        <TextField
          id="standard-textarea"
          label="Add a Comment"
          placeholder="Comment"
          multiline
          variant="standard"
          value={commentText}
          onChange={handleCommentChange}
        />
        {status === "authenticated"?
        <Button variant="contained" onClick={handleCommentSubmit}>
          Submit
        </Button> :
        <Button disabled variant="contained" onClick={handleCommentSubmit}>
        Submit
      </Button>}
      </Box>
    </>
  );
}
