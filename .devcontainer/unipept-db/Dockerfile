FROM mysql:5.7

LABEL maintainer="Pieter Verschaffelt <pieter.verschaffelt@ugent.be>"

RUN mkdir -p /usr/share/man/man1
RUN apt-get update && apt-get install -y default-jdk git dos2unix curl maven make wget unzip
# RUN git clone "https://github.com/unipept/unipept"

COPY "./../../backend" "backend"
COPY "init_db.sql" "init_db.sql"
COPY "create_database.sh" "create_database.sh"
COPY "wizard_answers.txt" "wizard_answers.txt"

RUN dos2unix create_database.sh wizard_answers.txt
RUN bash ./create_database.sh
