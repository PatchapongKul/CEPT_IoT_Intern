# Use the official Ubuntu base image
FROM ubuntu:20.04

# Prevent interactive prompts during package installation
ARG DEBIAN_FRONTEND=noninteractive

# Update and install required packages including OpenSSH and utilities
RUN apt-get update && \
    apt-get install -y \
    openssh-server \
    less \
    nano \
    vim \
    zip \
    iputils-ping \
    net-tools \
    iproute2 \
    curl && \
    mkdir /var/run/sshd

# Set root password (change this in production!)
RUN echo 'root:password' | chpasswd

# Create user 'cept' with password 'password' and add to sudo group
RUN useradd -m -s /bin/bash cept && \
    echo 'cept:password' | chpasswd && \
    usermod -aG sudo cept

# Unminimize (bring back man pages, locales, etc.)
RUN yes | unminimize

# Expose SSH port
EXPOSE 22

# Start the SSH service
CMD ["/usr/sbin/sshd", "-D"]
