# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy the rest of the application source code to the working directory
COPY . .

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define the command to run the app
CMD ["node", "server.js"]
