# phaser3-starting-template

Phaser 3 starting template

ToDo

-   Simplify buttons implementation
-   Text config
-   Add useful functions

Some hints on using this templates

-   ASSETS GENERATION and LOADING is fully AUTOMATED. But PLEASE, follow the instructions below
-   If you need another spriteSheet to be generated, then add a folder in `src/assets/images` folder and add your images there. The name of the folder will also be the name of the corresponding spriteSheet
-   If there images that are too large and you don't want them to be in a spriteSheet, add them to `src/assets/uncompressed` folder
-   To use spine, please, insert all the spine files into one folder and name the folder the way you want to use the spine in the game (e.g. `Racoon`) and add them into `src/assets/spines` folder. PLEASE DON'T ADD OTHER FILES IN THE FOLDER
-   If you want to use shaders or videos, please uncomment the corresponding line in `webpack.common.js` file (lines 56-57)
-   In order to use audio, just add the files in `src/assets/audio` folder
