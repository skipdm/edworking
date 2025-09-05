# Используем официальное изображение Node.js
FROM node:18

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json (если есть)
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект в контейнер
COPY . .

# Собираем фронтенд
RUN npm run build

# Запускаем сервер разработки Webpack
CMD ["npm", "run", "dev"]