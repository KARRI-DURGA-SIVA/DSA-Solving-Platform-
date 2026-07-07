FROM node:22-alpine

WORKDIR /app
COPY package.json server.js index.html app.css app.js README.md ./

ENV NODE_ENV=production
EXPOSE 8080

CMD ["npm", "start"]
