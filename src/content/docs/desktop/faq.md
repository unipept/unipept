---
title: Frequently Asked Questions (FAQ)
subtitle: Check this page for a list of questions or issues that arise frequently (and how to find a proper solution).
menuLabel: Frequently Asked Questions
---

::: warning The Unipept Desktop application is deprecated
The app still works, but will no longer receive updates or new features.
All functionality previously unique to the desktop app has been migrated to the
[Unipept web application](https://unipept.ugent.be), which we recommend using going forward.
:::

## Frequently Asked Questions {#faq}

### Q: Why does the analysis using a large targeted protein reference database fail on Windows?

A: This is a known issue on Windows that's caused by a default limit on the amount of storage space that can
be used by Docker on Windows systems. Docker on Windows uses a virtual hard drive (this is just a file that's
situated somewhere on your machine) that has a fixed, maximum size (by default this is 256GiB). This size can
be increased by creating a new virtual hard drive and moving all contents from the previous one to the one.
Doing so is, however, quite technical and is not recommended for non-technical users. Instead, we recommend to
use a Linux system (such as Ubuntu) or a Mac in this case. If you do want to move the virtual hard drive on
Windows, you can follow the steps in [this
guide](https://verschaffelt.be/increase-maximum-size-of-docker-volume-on-windows/).

### Q: Is Docker always required when using the Unipept Desktop application?

A: No, a valid Docker installation is only required when you want to use a targeted protein reference during
your metaproteomic analyses.

### Q: What happens when my internet connection drops during an analysis?

A: If some part of the analysis fails due to a dropped internet connection, the application will keep track of
the peptides that were not processed and will try again after a few minutes. If the connection is still not
working by then, the analysis will fail completely and you will be notified. As long as the internet
connection only drops for a short period of time, the analysis will recover from this and finish without
issues.

### Q: Does the application need to restart from scratch when an analysis fails after a few minutes?

A: No. The application will keep previously processed analysis results for some time. If you restart the analysis after a failure, the application will try to recover the results that were already processed and will restart from the point where it last stopped.
