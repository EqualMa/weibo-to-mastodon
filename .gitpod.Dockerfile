FROM gitpod/workspace-full

RUN sudo apt-get update \
    && sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
        libnss3 \
        libasound2 \
        libgtk2.0-0 \
        libgtk-3-0 \
        libgbm1 \
        libdrm2 \
    && sudo rm -rf /var/lib/apt/lists/*
