# Unipept

The [Unipept web application](http://unipept.ugent.be) supports biodiversity and functional analysis of large and complex metaproteome samples and the analysis of peptidomes.

The 6.0 release of Unipept brings support for non-tryptic peptides and the novel Peptonizer analysis pipeline to the tool.

An [API](https://unipept.ugent.be/apidocs) and [command line tool](http://github.com/unipept/unipept-cli) are available
for integration in other programs.

## Contributing

Found a bug or have an idea for an awesome new feature?
File an issue using the github [issue tracker](https://github.com/unipept/unipept/issues) or drop us a line at [unipept@ugent.be](mailto:unipept@ugent.be).

If you're willing to get your hands dirty, you might of course also send us a pull request!

## Installation

This repository contains the source code for the Unipept web application.

To run this application locally, you need to have **Node.js** and **Yarn** installed.

1.  Clone the repository:
    ```bash
    git clone https://github.com/unipept/unipept.git
    cd unipept
    ```

2.  Install dependencies:
    ```bash
    yarn install
    ```

3.  Start the development server:
    ```bash
    yarn dev
    ```

The application will be available at `http://localhost:3000`.

### Custom Unipept Instance

This repository only contains the code for the web application of Unipept. To run a fully functional custom version of Unipept (with your own data), you also need to set up:

*   The **Unipept Database**
*   The **Unipept API**

We have detailed guides on how to set up all of these components on our Wiki:
[https://github.com/unipept/unipept/wiki](https://github.com/unipept/unipept/wiki)

## Adding custom icons

The application uses a small custom icon font (`unipept-icons`) for icons not available in Material Design Icons. The SVG sources live in `custom-icons/` and the font is generated automatically by [fantasticon](https://github.com/tancredi/fantasticon) when you run `yarn dev` or `yarn build`. You can also regenerate it manually:

```bash
yarn generate-icons
```

### Adding a new icon

1. Export your icon as an SVG (24x24 px viewBox, filled paths — no strokes) and place it in `custom-icons/`.

2. Regenerate the font:
   ```bash
   yarn generate-icons
   ```

3. Check the assigned codepoint in the generated `src/styles/unipept-icons.css` and add it to `.fantasticonrc.json` to lock it in permanently:
   ```json
   "codepoints": {
     "your-new-icon": 59395
   }
   ```

4. To make the icon available as a Vuetify alias, add an entry to `src/plugins/unipept-icons.ts`:
   ```typescript
   const unipeptIconsAliases = {
       yourNewIcon: 'unipept-your-new-icon'
   }
   ```

5. Use it in a component:
   ```vue
   <VIcon icon="unipept:your-new-icon" />
   ```

## Who made this app?

Unipept is a research project of the computational biology group at Ghent University. If you use this application, please cite:

- Vande Moortele et al. (2025) J. Proteome Res. [doi.org:10.1021/acs.jproteome.4c00848](https://doi.org/10.1021/acs.jproteome.4c00848)
- Verschaffelt et al. (2023) J. Proteome Res. [doi:10.1021/acs.jproteome.3c00091](doi.org/10.1021/acs.jproteome.3c00091)
- Verschaffelt et al. (2021) J. Proteome Res. [doi:10.1021/acs.jproteome.0c00855](doi.org/10.1021/acs.jproteome.0c00855)
- Verschaffelt et al. (2020) Bioinformatics [doi:10.1093/bioinformatics/btaa553](doi.org/10.1093/bioinformatics/btaa553)
- Gurdeep Singh et al. (2019) J. Proteome Res. [doi:10.1021/acs.jproteome.8b00716](https://doi.org/10.1021/acs.jproteome.8b00716)
- Mesuere et al. (2018) J. Proteomics [doi:10.1016/j.jprot.2017.05.022](https://doi.org/10.1016/j.jprot.2017.05.022)
- Mesuere et al. (2016) Proteomics [doi:10.1002/pmic.201600023](https://doi.org/10.1002/pmic.201600023)
- Mesuere et al. (2016) Bioinformatics [doi:10.1093/bioinformatics/btw039](https://doi.org/10.1093/bioinformatics/btw039)
- Mesuere et al. (2015) Proteomics [doi:10.1002/pmic.201400361](https://doi.org/10.1002/pmic.201400361)
- Mesuere et al. (2012) J. Proteome Res. [doi:10.1021/pr300576s](https://doi.org/10.1021/pr300576s)

Current team:

- Bart Mesuere ([@bmesuere](https://github.com/bmesuere)): Group leader and PhD supervisor, Unipept founder
- Pieter Verschaffelt ([@pverscha](https://github.com/pverscha)): Postdoc and lead developer
- Tibo Vande Moortele ([@tibvdm](https://github.com/tibvdm)): PhD student
- Simon Van de Vyver ([@SimonVandeVyver](https://github.com/SimonVandeVyver)): PhD student
- Ben-Björn Binke ([@benbnk](https://github.com/benbnk)): PhD student
- Peter Dawyndt ([@pdawyndt](https://github.com/pdawyndt)): Group leader and PhD supervisor

Other contributions from:

- Felix Van der Jeugt ([@ninewise](https://github.com/ninewise)): Master's student 2014 - 2016 and PhD student 2016 - 2022
- Robbert Gurdeep Singh ([@beardhatcode](https://github.com/beardhatcode)): Developer 2017-2018
- Tom Naessens ([@silox](https://github.com/silox)): Master's student 2014-2015
- Toon Willems ([@nudded](https://github.com/nudded)): Master's student 2013-2014
- Ewan Higgs ([@ehiggs](https://github.com/ehiggs)): Ghent University HPC team
- Peter Vandamme: PhD co-supervisor of Bart
- Bart Devreese: PhD co-supervisor of Bart

For code contributions, the [contributors graph](https://github.com/unipept/unipept/graphs/contributors) is the place to be.
