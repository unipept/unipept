#!/bin/bash
java -cp "tools/java:tools/java/bin:tools/java/bin/:tools/java/lib/mysql.jar" -Xmx512m tools/commandline/TaxonInvalidator
java -cp "tools/java:tools/java/bin:tools/java/bin/:tools/java/lib/mysql.jar" -Xmx512m tools/commandline/PeptideLoader lineages
