import React from 'react';
import { Container, Typography } from '@mui/material';

function ChatPlaceholderPage() {
  return (
    <Container sx={{ mt: 4, textAlign: 'center', fontFamily: 'Rubik, sans-serif' }}>
      <Typography variant="h3">📨 Чат скоро будет доступен!</Typography>
      <Typography variant="body1" mt={2}>
        В будущем вы сможете общаться здесь напрямую в Telegram.
      </Typography>
    </Container>
  );
}

export default ChatPlaceholderPage;