sudo docker run --name unipept-mysql -e MYSQL_ROOT_PASSWORD=secret -e MYSQL_USER=unipept -e MYSQL_PASSWORD=unipept -e MYSQL_DATABASE=unipept -d mysql
sudo docker run --name unipept --link unipept-mysql:mysql -d -P unipept
