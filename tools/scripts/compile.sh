#!/bin/bash
# compiles all java files

rm -rf tools/java/bin
mkdir tools/java/bin
javac -cp "tools/java/lib/mysql.jar" -d tools/java/bin/ tools/java/src/*/*.java tools/java/src/*/*/*.java
