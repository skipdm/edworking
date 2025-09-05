import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Paper, Box, Avatar, IconButton, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

function AllPostsPage() {
  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState({});
  const [openReply, setOpenReply] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  useEffect(() => {
    fetch('/src/data/db.json')
      .then(res => res.json())
      .then(data => {
        const map = {};
        data.profiles.forEach(profile => {
          map[profile.id] = profile;
        });
        setAuthors(map);
      });
  }, []);

  useEffect(() => {
    const local = localStorage.getItem('posts');
    if (local) {
      setPosts(JSON.parse(local));
    } else {
      fetch('/src/data/mockPosts.json')
        .then(res => res.json())
        .then(data => {
          setPosts(data);
          localStorage.setItem('posts', JSON.stringify(data));
        });
    }
  }, []);

  const handleReply = (authorName) => {
    setSelectedAuthor(authorName);
    setOpenReply(true);
  };

  const handleClose = () => {
    setOpenReply(false);
    setSelectedAuthor(null);
  };

  const renderPost = (post) => {
    const author = authors[post.authorId];
    return (
      <Paper key={post.id} sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={author?.image} alt={post.author} />
          <Box>
            <Typography variant="body1" fontWeight="bold">{post.author}</Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(post.timestamp).toLocaleString()}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body1" mt={2} mb={1}>
          {post.content}
        </Typography>
        {post.type === 'работа' && (
            <IconButton onClick={() => handleReply(post.author)} aria-label="Откликнуться">
                <ReplyIcon />
            </IconButton>
)}

      </Paper>
    );
  };

  const jobPosts = posts.filter(p => p.type === 'работа');
  const regularPosts = posts.filter(p => p.type === 'пост');

  return (
    <Container sx={{ mt: 4, fontFamily: 'Rubik, sans-serif' }}>

      {jobPosts.length > 0 && (
        <>
          <Typography variant="h3" sx={{ mt: 3 }}>💼 Посты о работе / проектах</Typography>
          {jobPosts.map(renderPost)}
        </>
      )}

      {regularPosts.length > 0 && (
        <>
          <Typography variant="h3" sx={{ mt: 3 }}>📝 Обычные посты</Typography>
          {regularPosts.map(renderPost)}
        </>
      )}

      <Dialog open={openReply} onClose={handleClose}>
        <DialogTitle>Отклик на пост</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Отправьте <strong>{selectedAuthor}</strong> сообщение, если вы заинтересованы.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <IconButton onClick={handleClose} aria-label="Закрыть">
            <CloseIcon />
          </IconButton>
          <IconButton onClick={handleClose} aria-label="Ок">
            <CheckIcon />
          </IconButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AllPostsPage;

