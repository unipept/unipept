FROM mysql:5.7

LABEL maintainer="Pieter Verschaffelt <pieter.verschaffelt@ugent.be>"

RUN mkdir -p /usr/share/man/man1
RUN apt-get update && apt-get install -y default-jdk git dos2unix curl maven make wget unzip expect
# RUN git clone "https://github.com/unipept/unipept"

COPY "backend" "backend"
COPY "init_db.sql" "backend/init_db.sql"
COPY "create_database.sh" "create_database.sh"
COPY "init_makefile.sh" "backend/init_makefile.sh"
COPY "wizard_answers.txt" "backend/wizard_answers.txt"

RUN dos2unix create_database.sh backend/wizard_answers.txt backend/init_makefile.sh
RUN bash ./create_database.sh
