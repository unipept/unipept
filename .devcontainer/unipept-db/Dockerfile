FROM mysql:5.7

LABEL maintainer="Pieter Verschaffelt <pieter.verschaffelt@ugent.be>"

RUN mkdir -p /usr/share/man/man1
RUN apt-get update && apt-get install -y default-jdk git dos2unix curl maven make wget unzip expect gawk
# The files needed to build the database are part of the unipept repository
RUN git clone "https://github.com/unipept/unipept" && cd unipept && git checkout develop && cd /

COPY "scripts" "scripts"
COPY "data" "tables"

# These files sometimes give problems when being used on Windows-machines.
RUN dos2unix scripts/*.sh scripts/*.exp
RUN chmod u+x scripts/*.sh

RUN bash ./scripts/create_database.sh
# The fill-database script should be called right after the structure of the database has been initialized by the
# create_database-script.
RUN mv /scripts/fill_database.sh /docker-entrypoint-initdb.d/2.sh
# These files are run automatically when the container is started by the fill_database-script.
RUN cp /unipept/backend/database/load.sh /tables/load.sh
RUN cp /unipept/backend/database/index.sh /tables/index.sh
RUN chmod u+x /tables/load.sh && chmod u+x /tables/index.sh
