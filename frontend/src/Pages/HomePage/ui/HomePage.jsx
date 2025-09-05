import React from 'react';
import { Typography, Container, Box, ButtonGroup, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
const welcomeImage = "/welcome.jpg";

function Home() {
  const navigate = useNavigate();
  return (
    <Container 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 16vh)', 
        textAlign: 'center',
        px: { xs: 2, sm: 0 }
      }}
    >
      <Typography 
        variant="h3" 
        gutterBottom 
        sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}
      >
        Добро пожаловать в Edworking
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ fontSize: { xs: '1rem', sm: '1.2rem' }, px: { xs: 2, sm: 0 } }}
      >
        Пожалуйста, войдите или зарегистрируйтесь.
      </Typography>
      <Box sx={{ mt: 4, textAlign: 'center' }}>
      <ButtonGroup variant="outlined" aria-label="Basic button group">
        <Button onClick={() => navigate('/login')}>
          Вход
        </Button>
        <Button onClick={() => navigate('/register')}>
          Регистрация
        </Button>
        </ButtonGroup>
      </Box>
      <Box
        component="img"
        src={welcomeImage}
        alt="Welcome"
        sx={{
          maxWidth: { xs: '80%', sm: '50%', md: '30%' },
          width: '100%',
          height: 'auto',
          borderRadius: 5,
          mt: 4
        }}
      />
    </Container>
  );
}

export default Home;
