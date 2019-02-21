# PotionManager

This [Roll20](http://roll20.net/) script fixes a drawback to the [5e Shaped Sheet](http://github.com/mlenser/roll20-character-sheets/tree/master/5eShaped) where the items in the Equipment section are only accessible by opening the character sheet, which is where most of the potions wind up. PotionManager adds potions to the Utility section instead of the Equipment section which allows easy access to potions using the sheet's built-in macro `%{shaped_utility}`.

My [GearManager](https://github.com/blawson69/GearManager) script manages a large number of select Adventuring Gear and Wondrous Items in a similar way, and is a great companion to this one.

Use of the [Shaped Script](https://github.com/mlenser/roll20-api-scripts/tree/master/5eShapedScript) can automatically decrement the number of potions remaining for you and is highly recommended.

## How to Use

To see a list of all available potions, type `!pm --list` into chat. This list shows the name of each potion as a link which will add the potion to every selected token's character. If the character already has the potion in its Utility section, the script will increment uses by 1. Otherwise it will add the potion to the Utility section.

The list also contains a "view" link that shows the potion's description in chat. The "view" link will *not* add the potion to any characters.

To view this information in chat, sent `!pm --help`.
