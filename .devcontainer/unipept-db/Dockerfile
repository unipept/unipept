FROM mysql:5.7

LABEL maintainer="Pieter Verschaffelt <pieter.verschaffelt@ugent.be>"

RUN mkdir -p /usr/share/man/man1
RUN apt-get update && apt-get install -y default-jdk git dos2unix curl maven make wget unzip expect gawk
# RUN git clone "https://github.com/unipept/unipept"

COPY "init" "init"
COPY "backend" "backend"
COPY "data/tables" "tables"

RUN dos2unix init/create_database.sh init/fill_database.sh backend/makefile.in
RUN bash ./init/create_database.sh
RUN mv /init/fill_database.sh /docker-entrypoint-initdb.d/2.sh
RUN cp /backend/database/load.sh /tables/load.sh
RUN cp /backend/database/index.sh /tables/index.sh

USER root
