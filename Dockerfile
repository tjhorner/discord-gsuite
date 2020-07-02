FROM node:lts

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "index" ]