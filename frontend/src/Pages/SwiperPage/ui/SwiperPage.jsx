import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  Paper, 
  IconButton 
} from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';

function SwiperPage() {
  const [profiles, setProfiles] = useState([]);
  const [index, setIndex] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:8000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setProfiles(data))
      .catch(() => setProfiles([]));
  }, []);

  const handleSwipe = (direction) => {
    const token = localStorage.getItem('token');
    const currentProfile = profiles[0];
    if (!currentProfile || !token) return;
  
    controls.start({
      x: direction === 'left' ? -1000 : 1000,
      opacity: 0,
      transition: { duration: 0.3 }
    }).then(() => {
      fetch('http://localhost:8000/api/swipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          target_user_id: currentProfile.id,
          action: direction === 'left' ? 'dislike' : 'like'
        })
      }).finally(() => {
        // Удаляем текущего пользователя из списка
        setProfiles(prev => prev.slice(1));
        controls.set({ x: 0, opacity: 1 });
      });
    });
  };
  

  const currentProfile = profiles[index];

  if (!currentProfile) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Typography>Пока больше никого нет 🫠</Typography>
    </Box>
  );  

  return (
    <Box
      sx={{
        mt: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Rubik, sans-serif',
        minHeight: '100vh',
        justifyContent: 'flex-start',
        pt: 6
      }}
    >
      <Typography variant="h4" mb={3}>Найди свою команду</Typography>

      <motion.div
        animate={controls}
        whileDrag={{ scale: 1.05 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(event, info) => {
          if (info.offset.x < -100) handleSwipe('left');
          else if (info.offset.x > 100) handleSwipe('right');
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: 350,
            height: 420,
            p: 4,
            textAlign: 'center',
            borderRadius: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Avatar
            src={currentProfile.image}
            alt={currentProfile.name}
            sx={{ width: 120, height: 120, mb: 2 }}
          />
          <Box>
            <Typography variant="h5">{currentProfile.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {currentProfile.city}
            </Typography>
            {currentProfile.about && (
              <Typography variant="body1" mt={2}>
                {currentProfile.about}
              </Typography>
            )}
          </Box>
          <Box mt={3} display="flex" justifyContent="space-between" width="100%">
            <IconButton onClick={() => handleSwipe('left')}>
              <CloseIcon fontSize="large" />
            </IconButton>
            <IconButton onClick={() => handleSwipe('right')} color="error">
              <FavoriteIcon fontSize="large" />
            </IconButton>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}

export default SwiperPage;
