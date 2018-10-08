# Installing Unipept
This installation guide documents the process of installing Unipept on a Ubuntu 18.04 (LTS) machine, but should also be applicable for other system configurations. 

Note: This guide does not install the Unipept-Metagenomics-Pipeline.

## Requirements
* Ruby 2.4 (and Rails)
* Rails
* MySQL server + client
* git
* curl
* Java
* make
* Maven

## Installation
The very first step involves cloning the Unipept repository from GitHub (https://github.com/unipept/unipept) using `git clone https://github.ugent.be/unipept/unipept`.

### Rails and Ruby
It's recommended to install Ruby using RVM. A complete guide on how to do this (including the installation of rails), can be found [here](https://www.digitalocean.com/community/tutorials/how-to-install-ruby-on-rails-with-rvm-on-ubuntu-18-04).

After you succesfully installed Ruby 2.4 and Rails, please go to the repository's root folder and run `bundle install`. Some gems may fail to install. If this is the case, look for the exact error message and install the missing packages mentioned there on your system.

### Populating the database
The database should be initialized firstly. This requires both a compatible MySQL-server and -client to be installed. Follow these steps:

1. Run `sudo mysql` to open up the MySQL-monitor page and execute following commands:
	* `CREATE DATABASE unipept;`
	* `GRANT ALL PRIVILEGES ON *.* TO 'unipept'@'localhost' IDENTIFIED BY 'unipept';` (Replace with the desired username and password!)
	* `quit`
2. Move into the `backend/database` folder of the repository and execute following command `sudo mysql "unipept" < "structure_no_index.sql"`. The Unipept database structure should be present now.
3. Run `sudo apt-get install gawk` to install the correct version of Awk on Ubuntu (default mawk is outdated and does not work). 
4. Move into the backend folder by going up one directory level and execute `nano configure`. Look for the line with `checkdep build-index "Unipept crate (build-index)"` and comment it out.
5. Run `./configure` and answer the on-screen questions (press enter to use the default values). Enter `gawk` when given the following question `What's my gnu awk executable (e.g. awk, gawk)?`. It's recommended to only parse the Swissprot data on a home computer, as the trembl dataset is very large and takes weeks to process on a simple machine.
6. Now run `make` to begin downloading and parsing of all the Unipept data. This might take a while.
7. Move all files from the data/tables folder to the database folder (all folder names relative to the unipept/backend folder).
8. Open the `load.sh` file and look for the following line `zcat $file | mysql  --local-infile=1 -uunipept -punipept $db`. Adjust this line so that the correct username and password for your mysql-server is being used (the `-u` and `-p`-parameters indicate the mysql username and password respectively).
9. Run the `load.sh` file by executing `./load.sh`. This takes a minute.
10. Execute `rm *.tsv.gz` to remove all temporary data files.
11. Again, run `sudo mysql` and perform the following commands:
	* `use unipept;`
	* `INSERT INTO `unipept`.`users` (`id`, `username`, `admin`) VALUES (3, 'guest', 0);`
	* `quit`

### Running the Unipept web application
1. Go to the repository's root folder and move into the config directory. Open the file `database.yml` with a text editor and modify the database's username and password to be corresponding with your installation.
2. Follow [this guide](https://linuxize.com/post/how-to-install-yarn-on-ubuntu-18-04/) to install yarn.
3. Run `yarn install` to install all JavaScript-dependencies for Unipept.
3. Go back to the root folder and run `rails server` to start the development version of Unipept.
4. Navigate to localhost:3000 in your favourite web browser and start using Unipept.
