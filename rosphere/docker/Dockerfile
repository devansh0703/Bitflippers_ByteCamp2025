FROM ros:humble-desktop

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3-pip \
    nodejs \
    npm \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy ROSphere files
COPY . .

# Install Python dependencies
RUN pip3 install -r requirements.txt

# Install Node.js dependencies
RUN npm install

# Build frontend
RUN npm run build

# Expose ports
EXPOSE 3000 8000

# Create startup script
RUN echo '#!/bin/bash\n\
source /opt/ros/humble/setup.bash\n\
python3 rosphere/backend/main.py &\n\
npm start\n\
wait' > /app/start.sh && chmod +x /app/start.sh

# Start ROSphere
CMD ["/app/start.sh"]