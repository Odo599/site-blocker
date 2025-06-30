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

1. Download this github repository as a zip.
2. Unzip it using whatever you usually use.
3. Move it to somewhere that you can keep it.
4. Go to about:debugging in Firefox.
5. Click on 'This Firefox'
6. Then under 'Temporary Extensions' press 'Load Temporary Add-on'.
7. Choose the folder that you downloaded.
8. It should now be installed.

Unfortunately, due to the way Firefox treats temporary add-ons, this will be unloaded on every firefox restart so you'll have to repeat steps 4-8.

## Building

1. Install NPM 11.4.1
2. Run npm install
3. Run npm run package
4. Use the package site-blocker.xpi
