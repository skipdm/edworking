import React, { useEffect, useState } from 'react';
import {
  Container, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText,
  Button, Dialog, DialogTitle, DialogContent, Box
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useNavigate } from 'react-router-dom';

function ChatPage() {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [likers, setLikers] = useState([]);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const current = JSON.parse(localStorage.getItem('profile'));
    setUser(current);

    fetch('/src/data/db.json')
      .then(res => res.json())
      .then(data => {
        setProfiles(data.profiles);
        localStorage.setItem('db_users', JSON.stringify(data.profiles)); // для совместимости
      });
  }, []);

  useEffect(() => {
    if (!user || profiles.length === 0) return;

    const posts = JSON.parse(localStorage.getItem('posts') || '[]');

    const myJobPosts = posts.filter(p => p.type === 'работа' && p.authorId === user.id);
    const iRepliedTo = new Set();

    posts.forEach(post => {
      if (post.type === 'работа' && post.authorId !== user.id) {
        iRepliedTo.add(post.authorId);
      }
    });

    const repliedToMe = new Set();
    myJobPosts.forEach(post => {
      posts.forEach(p => {
        if (p.authorId !== user.id && p.content.toLowerCase().includes(user.name.toLowerCase())) {
          repliedToMe.add(p.authorId);
        }
      });
    });

    const ids = new Set([...repliedToMe, ...iRepliedTo]);
    const relevantProfiles = profiles.filter(p => ids.has(p.id));
    setChatList(relevantProfiles);

    // Лайки — кто лайкнул меня
    const likes = JSON.parse(localStorage.getItem('likes') || '[]');
    const myLikers = likes.filter(like => like.to === user.id);
    const uniqueLikerIds = [...new Set(myLikers.map(l => l.from))];
    const likerProfiles = profiles.filter(p => uniqueLikerIds.includes(p.id));
    setLikers(likerProfiles);
  }, [user, profiles]);

  return (
    <Container sx={{ mt: 4, fontFamily: 'Rubik, sans-serif' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">💬 Ваши чаты</Typography>
        <Button
          variant="outlined"
          startIcon={<FavoriteIcon />}
          onClick={() => setOpen(true)}
        >
          Меня лайкнули
        </Button>
      </Box>

      {chatList.length === 0 ? (
        <Typography>Пока нет активных чатов</Typography>
      ) : (
        <List>
          {chatList.map((person) => (
            <ListItem key={person.id} divider>
              <ListItemAvatar>
                <Avatar src={person.pic} />
              </ListItemAvatar>
              <ListItemText
                primary={person.name}
                secondary={`${person.profession} из ${person.city}`}
              />
              <Button variant="outlined" onClick={() => navigate('/chat/placeholder')}>
                Открыть чат
              </Button>
            </ListItem>
          ))}
        </List>
      )}

      {/* Диалог с лайками */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>❤️ Вас лайкнули</DialogTitle>
        <DialogContent>
          {likers.length > 0 ? (
            <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
              {likers.map((person) => (
                <Box
                  key={person.id}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  width="80px"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    setOpen(false);
                    navigate('/chat/placeholder');
                  }}
                >
                  <Avatar src={person.pic} />
                  <Typography variant="caption" align="center">
                    {person.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" mt={1}>Пока никто не лайкнул 😿</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default ChatPage;
