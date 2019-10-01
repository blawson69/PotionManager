# PotionManager

**New in v0.3:** Import your own homebrewed potions into PotionManager!

This [Roll20](http://roll20.net/) script fixes a drawback to the [5e Shaped Sheet](http://github.com/mlenser/roll20-character-sheets/tree/master/5eShaped) where the items in the Equipment section are only accessible by opening the character sheet, which is where most of the potions wind up. PotionManager instead adds potions to the Utility section which allows easy access using the sheet's built-in `%{shaped_utility}` macro.

My [GearManager](https://github.com/blawson69/GearManager) script manages a large number of select Adventuring Gear and Wondrous Items in a similar way, and is a great companion to this one.

Use of the [Shaped Script](https://github.com/mlenser/roll20-api-scripts/tree/master/5eShapedScript) can automatically decrement the number of potions remaining for you and is highly recommended.

## How to Use

Type `!pm --help` into chat. This gives short instructions and buttons to view the Potions List and to [import your own potions](#homebrew-potions).

The Potions List shows the name of each potion as a link which will add the potion to every selected token's character. If the character already has the potion in its Utility section, the script will increment uses by 1. Otherwise it will add the potion to the Utility section. The list also contains an **(i)** link that shows the potion's description in chat. This will *not* add the potion to any characters.

## Homebrewed Potions

You can import your own custom potions to add to the default potions. To do this, create a handout named "PotionManager Homebrew" and enter each custom potion in a separate paragraph with the following format:

`"Potion of " Potion Name|Description of the potions effects`

Guidlines:
1. If your potion name does not begin with "Potion of", it will be added to the name.
2. To include a die roll expression that should be executed when the potion is used, enclose it in double square brackets, i.e. [[]]. Note: When viewing from the list, PotionManager will not display the square brackets but will display the die roll expression in red to differentiate it from a static expression.
3. If your potion has healing properties, it requires two additional fields separated by pipes at the end. The first is the number of d4 to roll, and the second is the number added to the die roll. For instance, if your healing should be 6d4+18, you would add "|6|18" to the end.

Examples:
Potion of Typing|When you drink this potion, you can type 90 WPM for one hour.
Potion of Mediocre Healing|The drinker of this potion receives a measly 6d4+18 of healing.|6|18
