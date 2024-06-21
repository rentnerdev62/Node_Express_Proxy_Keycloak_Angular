FROM quay.io/keycloak/keycloak:latest
# Must add json files before import, volume is not mounted yet
ADD ./keycloak/realms /opt/keycloak/data/import/
# Import all files
RUN /opt/keycloak/bin/kc.sh import --dir=/opt/keycloak/data/import/ --override true; exit 0
# Start image
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "-v", "start-dev"]

#Produktion
# ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "-v", "start"]