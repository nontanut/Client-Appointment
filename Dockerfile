ARG API_ENDPOINT
ENV VITE_API=${API_ENDPOINT}
FROM node:lts
COPY package*.json ./
RUN ["npm", "install"]
COPY . ./
RUN ["npm", "run", "build"]
CMD ["npm", "run", "serve"]