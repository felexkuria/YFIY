# Use a Python base image that supports libtorrent
FROM python:3.11-slim-bookworm

# Install system dependencies including libtorrent requirements
RUN apt-get update && apt-get install -y \
    python3-libtorrent \
    libtorrent-rasterbar-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy requirements and install them
COPY requirements.txt .
# Filter out libtorrent from pip install because we use the system package
RUN grep -v "libtorrent" requirements.txt > requirements_filtered.txt && \
    pip install --no-cache-dir -r requirements_filtered.txt

# Copy the rest of the application
COPY . .

# Create persistent directories
RUN mkdir -p downloads temp

# Expose the port the app runs on
EXPOSE 5001

# Define environment variables
ENV PYTHONUNBUFFERED=1
ENV TMPDIR=/app/temp

# Run the application
CMD ["python", "stream_server.py"]
