# Water Sort Puzzle prototype

### Idea:

To experiment with new game mechanics. To create a tool for making and testing new puzzle levels. 

### Features:

-   **Classic mode**: 2-10 colors in tubes of equal size containing 3-8 balls (portions) each. Gather all balls in their own tubes to win.
-   **Uno mode**: the same as classic except that you have to gather only one color to win. Makes playing with large tubes (volume 5+) faster and easier.
-   **Fog of War mode**: can be set and tried with both previous modes. All the balls except the top in each tube are hidden until you make them top. In Uno mode the balls of the winning color are also visible.

The game has moves counter, undo and can add & remove empty tubes.  
Move helper makes the best move for the selected tube's top ball.  
The game field is responsive to the window size.  
The game supports mouse, touch and can be played with keyboard only.

Try the prototype here: [1shevelov.github.io/tubes23/](https://1shevelov.github.io/tubes23/)

---------

The game is build with TS and wonderful [Phaser 3](https://github.com/photonstorm/phaser) by Photonstorm and based on Arsen Mazmanyan's [starting template](https://github.com/arsenmazmanyan/phaser3-starting-template).

