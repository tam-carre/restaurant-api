FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm cache clean --force
RUN npm install
COPY . .
RUN git clone https://github.com/vishnubob/wait-for-it.git

EXPOSE 3000

CMD [ 'npm' 'start' ]
