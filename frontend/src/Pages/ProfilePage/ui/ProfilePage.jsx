import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Button, Box, Paper, Avatar, IconButton
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import WorkIcon from '@mui/icons-material/Work';
import NotesIcon from '@mui/icons-material/Notes';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newType, setNewType] = useState('пост');
  const navigate = useNavigate();

  // Получение профиля
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/get_profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Не удалось загрузить профиль');
        }
        const data = await response.json();
        setUser(data);  // устанавливаем профиль
      } catch (err) {
        console.error('Ошибка загрузки профиля:', err);
      }
    };

    fetchProfile();
  }, []);

  // Получение постов
  useEffect(() => {
    if (!user) return;
    const fetchPosts = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api_post/user/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Не удалось загрузить посты');
        }
        const data = await response.json();
        setPosts(data);  // устанавливаем посты
      } catch (err) {
        console.error('Ошибка загрузки постов:', err);
      }
    };

    fetchPosts();
  }, [user]);

  // Создание поста
  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    const newEntry = {
      content: newPost,
    };

    try {
      const response = await fetch('http://localhost:8000/api_post/create_post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) {
        throw new Error('Ошибка при создании поста');
      }

      const createdPost = await response.json();
      setPosts([createdPost, ...posts]);
      setNewPost('');
    } catch (err) {
      console.error('Ошибка создания поста:', err);
    }
  };

  const renderTypeIcon = (type) =>
    type === 'работа' ? <WorkIcon fontSize="small" /> : <NotesIcon fontSize="small" />;

  if (!user) return <Typography>Загрузка профиля...</Typography>;

  const jobPosts = posts.filter(p => p.type === 'работа');
  const regularPosts = posts.filter(p => p.type === 'пост');

  return (
    <Container sx={{ mt: 4, fontFamily: 'Rubik, sans-serif' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Мой профиль</Typography>
        <IconButton onClick={() => navigate('/profile/settings')}>
          <SettingsIcon />
        </IconButton>
      </Box>

      <Paper sx={{ p: 3, my: 3 }}>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} alignItems="center">
          <Box>
            <Typography variant="h5">{user.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
            {user.tg_id && <Typography mt={1}>{user.tg_id}</Typography>}
            {user.birth_date && <Typography mt={1}>Дата рождения: {new Date(user.birth_date).toLocaleDateString()}</Typography>}
            {user.city && <Typography>Город: {user.city}</Typography>}
            {user.about && <Typography>About: {user.about}</Typography>}
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          label="Что у вас нового?"
          multiline
          rows={3}
          fullWidth
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <Box
          mt={1}
          display="flex"
          gap={1}
          flexDirection={{ xs: 'column', sm: 'row' }}
          flexWrap="wrap"
          justifyContent="space-between"
        >
          <Button
            onClick={() => setNewType('пост')}
            variant={newType === 'пост' ? 'contained' : 'outlined'}
            startIcon={<NotesIcon />}
            fullWidth
          >
            Пост
          </Button>
          <Button
            onClick={handlePost}
            variant="contained"
            fullWidth
          >
            Опубликовать
          </Button>
        </Box>
      </Paper>

      {jobPosts.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>💼 Мои проекты / предложения</Typography>
          {jobPosts.map((post) => (
            <Paper key={post.id} sx={{ p: 2, mb: 2 }}>
              <Box display="flex" gap={1} alignItems="center" mb={1}>
                {renderTypeIcon(post.type)}
                <Typography variant="subtitle1" fontWeight="bold">{post.author}</Typography>
              </Box>
              <Typography>{post.content}</Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <AccessTimeIcon fontSize="small" />
                <Typography variant="caption">
                  {new Date(post.timestamp).toLocaleString()}
                </Typography>
              </Box>
            </Paper>
          ))}
        </>
      )}

      {regularPosts.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>📝 Обычные посты</Typography>
          {regularPosts.map((post) => (
            <Paper key={post.id} sx={{ p: 2, mb: 2 }}>
              <Box display="flex" gap={1} alignItems="center" mb={1}>
                {renderTypeIcon(post.type)}
                <Typography variant="subtitle1" fontWeight="bold">{post.author}</Typography>
              </Box>
              <Typography>{post.content}</Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <AccessTimeIcon fontSize="small" />
                <Typography variant="caption">
                  {new Date(post.timestamp).toLocaleString()}
                </Typography>
              </Box>
            </Paper>
          ))}
        </>
      )}
    </Container>
  );
}

export default ProfilePage;
