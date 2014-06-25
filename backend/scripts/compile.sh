#!/bin/bash
# compiles all java files

currentdir=`pwd`

cd "backend/java"
mvn clean
mvn package

cd "${currentdir}"
