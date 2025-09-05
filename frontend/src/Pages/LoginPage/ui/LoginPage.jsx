import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container } from '@mui/material';

function Login() {
  const [tgId, setTgId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    fetch('http://localhost:8000/api/auth', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: tgId,
        password: password
      }),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(errorData.detail || 'Ошибка входа');
        });
      }
      return response.json();
    })
    .then(data => {
      localStorage.setItem('token', data.access_token);
      alert('Успешный вход!');
    })
    .catch(error => {
      console.error('Ошибка:', error);
      alert(error.message);
    });
  };

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
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Вход
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Telegram ID"
            variant="outlined"
            fullWidth
            margin="normal"
            value={tgId}
            onChange={(e) => setTgId(e.target.value)}
          />
          <TextField
            label="Пароль"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Вход
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default Login;