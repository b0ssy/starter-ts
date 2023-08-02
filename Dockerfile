# Base image
FROM node:slim

# Set working directory
WORKDIR /opt/backend

# Add package.json and install node modules for production only
COPY package.json /opt/backend/package.json
RUN npm i --omit=dev

# Add files
ADD build/src /opt/backend/src
ADD build/migrations /opt/backend/migrations
COPY build/index.js /opt/backend/index.js
COPY build/knexfile.js /opt/backend/knexfile.js

# Export web server
EXPOSE 10002

# Run server
CMD ["node", "index", "run"]
