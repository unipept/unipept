# compiles all java files
mkdir tools/java/bin
javac -cp "tools/java/lib/mysql.jar" -d tools/java/bin/ tools/java/src/*/*.java tools/java/src/*/*/*.java
