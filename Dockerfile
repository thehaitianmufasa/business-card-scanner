# Use Node.js LTS
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your app
COPY . .

# Expose port 8080 (required by Cloud Run)
EXPOSE 8080

# Start the app
CMD [ "npm", "start" ] 