# Site Blocker

It's a Firefox add-on that blocks certain websites of your choice. It's quite simple.

## Features

-   Block with advanced or simple regex
-   Dark and Light mode
-   Disable Blocking
-   Redirect to custom page
-   Pause blocking for some time
-   Export settings to file
-   Whitelist specific websites

## Installation

You have 3 options to download this extension.

-   You can build it yourself
-   Download the prepackaged release or
-   Install it from the Firefox addon store.
-

### Install from Firefox store

This will not be updated very often at all, but it should be stable.

1. Go to the [Firefox page](https://addons.mozilla.org/en-US/firefox/addon/webite-blocker/) for this addon.
2. Install it.

### Prepackaged Release

This version is less up to date because I need to release it every time it needs updating.

1. Download the [latest release](https://github.com/Odo599/site-blocker/releases/tag/release) (site-blocker.xpi)
2. Move it to somewhere that you can keep it.
3. Go to about:debugging in Firefox.
4. Click on 'This Firefox'
5. Then under 'Temporary Extensions' press 'Load Temporary Add-on'.
6. Choose the xpi file that you downloaded.
7. It should now be installed.

Unfortunately, due to the way Firefox treats temporary add-ons, this will be unloaded on every firefox restart so you'll have to repeat steps 4-8.

### Building

1. Install NPM 11.4.1
2. Run npm install
3. Run npm run package
4. Use the package site-blocker.xpi
