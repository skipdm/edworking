import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container } from '@mui/material';

function Register() {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [tgId, setTgId] = useState('');
  const [name, setName] = useState('');
  const [dateBirth, setDateBirth] = useState('');
  const [city, setCity] = useState('');
  const [about, setAbout] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    const newUser = { 
      name, 
      email, 
      tg_id: tgId,
      birth_date: dateBirth,
      city,
      about,
      password: password  
    };
    
    fetch('http://localhost:8000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    })
    .then(response => response.json())
    .then(user => {
      alert(`Пользователь ${name} зарегистрирован с почтой ${email}`);
      console.log('User added:', user);
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
          Регистрация
        </Typography>
        <form onSubmit={handleRegister}>
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <TextField
            label="Telegram ID"
            variant="outlined"
            fullWidth
            margin="normal"
            value={tgId}
            onChange={(e) => setTgId(e.target.value)}
          />
          <TextField
            label="Имя"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Дата рождения"
            type="date"
            variant="outlined"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={dateBirth}
            onChange={(e) => setDateBirth(e.target.value)}
          />
          <TextField
            label="Город"
            variant="outlined"
            fullWidth
            margin="normal"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <TextField
            label="О себе"
            variant="outlined"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Регистрация
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default Register;