#!/bin/bash
java -cp "backend/java:backend/java/bin:backend/java/bin/:backend/java/lib/mysql.jar" -Xmx512m tools/commandline/TaxonInvalidator
java -cp "backend/java:backend/java/bin:backend/java/bin/:backend/java/lib/mysql.jar" -Xmx512m tools/commandline/PeptideLoader lineages
