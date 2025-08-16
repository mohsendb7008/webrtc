FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm i -g node-pre-gyp
RUN npm install
COPY . .
CMD [ "node", "main.js" ]