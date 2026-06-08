FROM node:22.19.0
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm run build
COPY . .
EXPOSE 4000
CMD ["npm", "start"]