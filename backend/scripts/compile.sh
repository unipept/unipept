#!/bin/bash
# compiles all java files

rm -rf backend/java/bin
mkdir backend/java/bin
javac -cp "backend/java/lib/mysql.jar" -d backend/java/bin/ backend/java/src/*/*.java backend/java/src/*/*/*.java
