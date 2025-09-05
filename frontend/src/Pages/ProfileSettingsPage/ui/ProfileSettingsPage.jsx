import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const [profile, setProfile] = useState({
    id: '',
    name: '',
    email: '',
    tg_id: '',
    birthd_date: '',
    city: '',
    about: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // Функция для получения профиля
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/get_profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Ошибка при получении данных');
        }

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  // Функция для обновления профиля
  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/update_profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении профиля');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
      alert('Профиль обновлён!');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Обработчик изменения данных
  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, fontFamily: 'Rubik, sans-serif' }}>
      <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Rubik, sans-serif' }}>
        Профиль
      </Typography>

      <TextField
        label="ID"
        name="id"
        value={profile.id}
        disabled
        fullWidth
        margin="normal"
      />

      <TextField
        label="Имя"
        name="name"
        value={profile.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled={!isEditing}
      />

      <TextField
        label="Email"
        name="email"
        value={profile.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled={!isEditing}
      />

      <TextField
        label="Tg_id"
        name="tg_id"
        value={profile.tg_id}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled={!isEditing}
      />

      <TextField
        label="Birthday"
        name="birthd_date"
        value={profile.birthd_date}
        onChange={handleChange}
        fullWidth
        multiline
        rows={3}
        margin="normal"
        disabled={!isEditing}
      />

      <TextField
        label="Город"
        name="city"
        value={profile.city}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled={!isEditing}
      />

      <TextField
        label="About"
        name="about"
        value={profile.about}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled={!isEditing}
      />

      {isEditing ? (
        <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 3 }}>
          Сохранить
        </Button>
      ) : (
        <Button variant="outlined" color="primary" onClick={() => setIsEditing(true)} sx={{ mt: 3 }}>
          Редактировать
        </Button>
      )}

      <Button variant="text" color="secondary" onClick={() => navigate('/')} sx={{ mt: 2 }}>
        Назад
      </Button>
    </Container>
  );
}

export default ProfilePage;
