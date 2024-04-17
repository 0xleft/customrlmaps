FROM node:14
WORKDIR /app

RUN apt-get update
RUN apt-get install -y nginx

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

COPY /app/dist /var/www/html

CMD ["nginx", "-g", "daemon off;"]