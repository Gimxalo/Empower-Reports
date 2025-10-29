#!/bin/bash

# Script para construir y ejecutar la imagen Docker localmente
# Uso: ./build-docker.sh [tag]

set -e

# Configuración
IMAGE_NAME="empower-reports"
TAG=${1:-"latest"}
FULL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"

echo "🚀 Construyendo imagen Docker: ${FULL_IMAGE_NAME}"

# Construir la imagen
echo "📦 Construyendo imagen..."
docker build -t "${FULL_IMAGE_NAME}" .

echo "✅ Imagen construida exitosamente: ${FULL_IMAGE_NAME}"

# Mostrar información de la imagen
echo "📊 Información de la imagen:"
docker images "${IMAGE_NAME}"

echo ""
echo "🎯 Para ejecutar la aplicación:"
echo "   docker run -p 3000:80 ${FULL_IMAGE_NAME}"
echo ""
echo "🎯 O usar docker-compose:"
echo "   docker-compose up -d"
echo ""
echo "🌐 La aplicación estará disponible en: http://localhost:3000"
