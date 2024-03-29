# Water Sort Puzzle prototype

### Idea:

To experiment with new game mechanics. To create a tool for making and testing new puzzle levels. 

### Features:

- Seeded random level generator with the following modes:
-   **CLASSIC**: 2 to 10 colors in tubes of equal size each containing 3 to 8 balls (portions) each. 2 tubes are empty. Gather balls of each color in their own tubes to win.
-   **UNO**: the same as classic except that you have to gather only one color to win. It makes the win condition easier, which is essential for unpuzzling larger tubes with a volume of 5+.
-   **Fog of War**: can be activated in both previous modes. Only the top ball of each tube has its color visible, to reveal others - make them the top. In Uno mode, the balls of the goal color are also visible.

Levels can be saved/exported to files and loaded from it.
The game counts moves, has an undo, and can add & remove empty tubes.
Move helper makes the best move for the selected tube's top ball.
The game supports mouse & touch and can be played with a keyboard.

Try the prototype here: [1shevelov.github.io/tubes23/](https://1shevelov.github.io/tubes23/)

### Further development of this project is [Daily Tubes](https://dailytubes.net/).
---------

This game is built with TypeScript and wonderful [Phaser 3](https://github.com/photonstorm/phaser) by Photonstorm. [Starting template](https://github.com/arsenmazmanyan/phaser3-starting-template) by Arsen Mazmanyan.

