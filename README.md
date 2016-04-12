# Unipept

[![Build Status](https://travis-ci.org/unipept/unipept.svg?branch=master)](https://travis-ci.org/unipept/unipept)
[![Coverage Status](https://img.shields.io/coveralls/unipept/unipept.svg)](https://coveralls.io/r/unipept/unipept)
[![Code Climate](https://codeclimate.com/github/unipept/unipept/badges/gpa.svg)](https://codeclimate.com/github/unipept/unipept)

The [Unipept web application](http://unipept.ugent.be) supports biodiversity analysis of large and complex metaproteome samples and the analysis of peptidomes.
The 3.1 release of Unipept has several main features:
* Tryptic peptide analysis (previously single peptide analysis)
* Metaproteomics analysis (previously multi-peptide analysis)
* Unique peptide finder
* Peptidome clustering
* an API to retrieve all data
* [a command line tool](http://github.com/unipept/unipept-cli)

## Contributing

Found a bug or have an idea for an awesome new feature?
File an issue using the github issue tracker or drop us a line at [unipept@ugent.be](mailto:unipept@ugent.be).

If you're willing to get your hands dirty, you might of course also send us a pull request!

## Installation

This application is deployed and fully functional at [unipept.ugent.be](http://unipept.ugent.be).
If for some reason you wish to run your own instance, you can do so by deploying this rails application and setting up a database.
This isn't straightforward and you'll probably want some help, so contact us at [unipept@ugent.be](mailto:unipept@ugent.be) before you attempt an installation.

A more user friendly way to set up your own Unipept instance is planned for the future.
We will probably use [docker](https://www.docker.io/) for this, and release a ready made database as a separate download.

## Who made this app?

Unipept is a research project of the computational biology group at Ghent University. If you use this application, please cite:
* Mesuere et al. (2016) Bioinformatics [doi:10.1093/bioinformatics/btw039](http://dx.doi.org/10.1093/bioinformatics/btw039)
* Mesuere et al. (2015) Proteomics [doi:10.1002/pmic.201400361](http://dx.doi.org/10.1002/pmic.201400361)
* Mesuere et al. (2012) J. Proteome Res. [doi:10.1021/pr300576s](http://dx.doi.org/10.1021/pr300576s)

Current team:
* Bart Mesuere ([@bmesuere](https://github.com/bmesuere)): PhD student and lead developer
* Felix Van der Jeugt ([@NoctuaNivalis](https://github.com/NoctuaNivalis)): PhD student and Master's student 2014-2015
* Peter Dawyndt ([@pdawyndt](https://github.com/pdawyndt)): Group leader and PhD supervisor
* Peter Vandamme: PhD co-supervisor
* Bart Devreese: PhD co-supervisor

Other contributions from:
* Tom Naessens ([@silox](https://github.com/silox)): Master's student 2014-2015
* Toon Willems ([@nudded](https://github.com/nudded)): Master's student 2013-2014
* Ewan Higgs ([@ehiggs](https://github.com/ehiggs)): Ghent University HPC team


For code contributions, the [contributors graph](https://github.com/unipept/unipept/graphs/contributors) is the place to be.
