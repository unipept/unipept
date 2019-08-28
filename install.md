# Installing Unipept
Starting development on Unipept

Before starting to work on Unipept, some things need to be installed, configured and tested. This guide provides you with the different steps that can be followed to start work on Unipept as fast as possible (with a minimum of configuration details).

Note: This guide does not install the Unipept-Metagenomics-Pipeline.

# Developing with VS Code and Docker (Recommended)
The Unipept Web Application is written in Ruby-On-Rails in combination with JavaScript, TypeScript and Vue. Unipept also requires access to a complex database. All of these things make it somewhat hard to start development of Unipept straight away. This guide provides a very easy way of developing new Unipept features by leveraging the "Remote Docker Development" feature from Visual Studio Code. You can just download the most recent unipept-db and unipept-application Docker containers and start from there. No need to install a whole bunch of utilities, tools, extensions, packages, etc. Visual Studio Code and Docker Desktop is all you need.

## Preparing your computer
1. Install [Visual Studio Code](https://code.visualstudio.com/)
2. Install some required extensions:
	* [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur)
	* [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)
	* [Ruby](https://marketplace.visualstudio.com/items?itemName=rebornix.Ruby)
	* [HTML CSS Support](https://marketplace.visualstudio.com/items?itemName=ecmel.vscode-html-css)
	* [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
	* [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
3. You can optionally install these extensions, for a better user experience:
	* [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)
	* [Spell Right](https://marketplace.visualstudio.com/items?itemName=ban.spellright)
	* [TODO Highlight](https://marketplace.visualstudio.com/items?itemName=wayou.vscode-todo-highlight)
4. Install [Docker Desktop](https://www.docker.com/products/docker-desktop) (NOTE: Docker Desktop on Windows requires Windows 10 Pro or better!). The steps presented here *might* also work with the older [Docker Toolbox](https://docs.docker.com/toolbox/toolbox_install_windows/) which is also available on Windows 10 Home, but this is not tested.
	
## Preparing the repository
1. Pull the most recent Unipept repository from GitHub: `git clone https://github.com/unipept/unipept`.
2. If you're on Windows, make sure you disable git's automatic line ending conversion. Visual Studio Code needs to convert the files from Windows to Unix line endings before being able to run the code inside the containers. Run `git config --global core.autocrlf input` to disable automatic line ending conversion.

## Download the required Docker containers

# Starting from scratch (Not recommended)
If, for some reason, you would like to configure and build Unipept from the start, you can follow the following steps to completely initialize all necessary depedencies and configurations on your own computer.

This installation guide documents the process of installing Unipept on a Ubuntu 18.04 (LTS) machine, but should also be applicable for other system configurations. 

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
