import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Container, CssBaseline, Box
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArticleIcon from '@mui/icons-material/Article';
import SwipeIcon from '@mui/icons-material/Swipe';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';

import ChatPage from '../Pages/ChatPage/ui/ChatPage';
import ChatPlaceholderPage from '../Pages/ChatPlaceholderPage/ui/ChatPlaceholderPage';
import Login from '../Pages/LoginPage/ui/LoginPage';
import Register from '../Pages/RegisterPage/ui/RegisterPage';
import Home from '../Pages/HomePage/ui/HomePage';
import Swiper from '../Pages/SwiperPage/ui/SwiperPage';
import ProfilePage from '../Pages/ProfilePage/ui/ProfilePage';
import ProfileSettingsPage from '../Pages/ProfileSettingsPage/ui/ProfileSettingsPage';
import AllPostsPage from '../Pages/AllPostsPage/ui/AllPostsPage';
import './index.css';

function App() {
  return (
    <Router>
      <CssBaseline />
      <AppBar position="fixed" sx={{ height: { xs: '8vh', sm: '10vh' } }}>
        <Toolbar>
        <Typography
          variant="h6"
          sx={{
          fontSize: { xs: '0.9rem', sm: '1.2rem', md: '1.6rem' },
          fontFamily: '"Press Start 2P", monospace',
          letterSpacing: '0.05em'
          }}
        >
          EDWORKING
        </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar />

      <AppBar
        position="fixed"
        sx={{
          top: 'auto',
          bottom: 0,
          height: { xs: '8vh', sm: '10vh' },
          width: '100%'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-around' }}>
          <IconButton color="inherit" component={Link} to="/">
            <HomeIcon />
          </IconButton>
          <IconButton color="inherit" component={Link} to="/posts">
            <ArticleIcon />
          </IconButton>
          <IconButton color="inherit" component={Link} to="/swiper">
            <SwipeIcon />
          </IconButton>
          <IconButton color="inherit" component={Link} to="/chat">
            <ChatIcon />
          </IconButton>
         {/* <IconButton color="inherit" component={Link} to="/login">
            <LoginIcon />
          </IconButton>
          <IconButton color="inherit" component={Link} to="/register">
            <PersonAddIcon />
          </IconButton> */}
          <IconButton color="inherit" component={Link} to="/profile">
            <PersonIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ minHeight: 'calc(100vh - 64px - 56px)', pb: 8 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/swiper" element={<Swiper />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/posts" element={<AllPostsPage />} />
          <Route path="/profile/settings" element={<ProfileSettingsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/placeholder" element={<ChatPlaceholderPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
