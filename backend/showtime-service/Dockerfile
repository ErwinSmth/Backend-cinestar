# syntax=docker/dockerfile:1

# ================================
# Fase 1: Construccion (Spring Boot)
# ================================
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copia el wrapper de Maven y dependencias primero para cache
COPY backend/showtime-service/mvnw .
COPY backend/showtime-service/.mvn .mvn
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
COPY backend/showtime-service/pom.xml .

RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw dependency:go-offline -q

# Copia el archivo de la API que Maven necesita para autogenerar clases
COPY docs/api-spec.yml /docs/api-spec.yml

# Evitar que Maven consuma toda la RAM durante la compilación
ENV MAVEN_OPTS="-Xmx256m -XX:TieredStopAtLevel=1"

# Copia el codigo y compila
COPY backend/showtime-service/src src
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw clean package -DskipTests -q

# ================================
# Fase 2: Ejecucion
# ================================
FROM eclipse-temurin:17-jre-alpine AS runner

WORKDIR /app

# Crear usuario seguro
RUN addgroup -S spring && adduser -S spring -G spring

# Copia unicamente el jar generado
COPY --from=builder --chown=spring:spring /app/target/*.jar app.jar

USER spring

EXPOSE 8084

# Tuning de RAM optimizado para entornos de escasos recursos
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-Xms64m", \
    "-Xmx128m", \
    "-XX:+UseSerialGC", \
    "-XX:TieredStopAtLevel=1", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
