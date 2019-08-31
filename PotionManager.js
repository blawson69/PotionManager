/*
PotionManager
Enables easy adding & updating of Potions in the 5e Shaped Sheet's Utilities section.

On Github:	https://github.com/blawson69
Contact me: https://app.roll20.net/users/1781274/ben-l
Like this script? Buy me a coffee: https://venmo.com/theRealBenLawson
*/

var PotionManager = PotionManager || (function () {
    'use strict';

    //---- INFO ----//

    var version = '0.2',
        debugMode = false,
        styles = {
            button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
            textButton: 'background-color: transparent; border: none; padding: 0; color: #591209; text-decoration: underline;',
            code: 'font-family: "Courier New", Courier, monospace; background-color: #ddd; color: #000; padding: 2px 4px;',
            fullWidth: 'width: 100%; display: block; padding: 12px 0; text-align: center;'
        },
        potions = [
            {name: "Potion of Healing", content: "You regain 2d4 + 2 Hit Points when you drink this potion. The potion's red liquid glimmers when agitated.", heal_dice: 2, heal_bonus: 2},
            {name: "Potion of Greater Healing", content: "You regain 4d4 + 4 Hit Points when you drink this potion. The potion's red liquid glimmers when agitated.", heal_dice: 4, heal_bonus: 4},
            {name: "Potion of Superior Healing", content: "You regain 8d4 + 8 Hit Points when you drink this potion. The potion's red liquid glimmers when agitated.", heal_dice: 8, heal_bonus: 8},
            {name: "Potion of Supreme Healing", content: "You regain 10d4 + 20 Hit Points when you drink this potion. The potion's red liquid glimmers when agitated.", heal_dice: 10, heal_bonus: 20},
            {name: "Potion of Acid Resistance", content: "When you drink this potion, you gain Resistance to acid damage for 1 hour."},
            {name: "Potion of Animal Friendship", content: "When you drink this potion, you can cast the Animal Friendship spell (save DC 13) for 1 hour at will. Agitating this muddy liquid brings little bits into view: a fish scale, a hummingbird tongue, a cat claw, or a squirrel hair."},
            {name: "Potion of Clairvoyance", content: "When you drink this potion, you gain the effect of the Clairvoyance spell. An eyeball bobs in this yellowish liquid but vanishes when the potion is opened."},
            {name: "Potion of Climbing", content: "When you drink this potion, you gain a climbing speed equal to your walking speed for 1 hour. During this time, you have advantage on Strength (Athletics) checks you make to climb. The potion is separated into brown, silver, and gray layers resembling bands of stone. Shaking the bottle fails to mix the colors."},
            {name: "Potion of Cold Resistance", content: "When you drink this potion, you gain Resistance to cold damage for 1 hour."},
            {name: "Potion of Diminution", content: "When you drink this potion, you gain the \"reduce\" effect of the enlarge/reduce spell for [[1d4]] hours (no Concentration required). The red in the potion's liquid continuously contracts to a tiny bead and then expands to color the clear liquid around it. Shaking the bottle fails to interrupt this process."},
            {name: "Potion of Fire Resistance", content: "When you drink this potion, you gain Resistance to fire damage for 1 hour."},
            {name: "Potion of Fire Breath", content: "After drinking this potion, you can use a bonus action to exhale fire at a target within 30 ft. of you. The target must make a DC 13 Dexterity saving throw, taking 4d6 fire damage on a failed save, or half as much damage on a successful one. The effect ends after you exhale the fire three times or when 1 hour has passed.\n\nThis potion\'s orange liquid flickers, and smoke fills the top of the container and wafts out whenever it is opened."},
            {name: "Potion of Flying", content: "When you drink this potion, you gain a flying speed equal to your walking speed for 1 hour and can hover. If you're in the air when the potion wears off, you fall unless you have some other means of staying aloft. This potion's clear liquid floats at the top of its container and has cloudy white impurities drifting in it."},
            {name: "Potion of Force Resistance", content: "When you drink this potion, you gain Resistance to force damage for 1 hour."},
            {name: "Potion of Gaseous Form", content: "When you drink this potion, you gain the effect of the Gaseous Form spell for 1 hour (no Concentration required) or until you end the effect as a Bonus Action. This potion's container seems to hold fog that moves and pours like water."},
            {name: "Potion of Hill Giant Strength", content: "When you drink this potion, your Strength score changes to 21 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score.\n\nThis potion’s transparent liquid has floating in it a sliver of fingernail from a hill giant."},
            {name: "Potion of Frost Giant Strength", content: "When you drink this potion, your Strength score changes to 23 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score.\n\nThis potion’s transparent liquid has floating in it a sliver of fingernail from a frost giant."},
            {name: "Potion of Stone Giant Strength", content: "When you drink this potion, your Strength score changes to 23 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score.\n\nThis potion’s transparent liquid has floating in it a sliver of fingernail from a stone giant."},
            {name: "Potion of Fire Giant Strength", content: "When you drink this potion, your Strength score changes to 25 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score.\n\nThis potion’s transparent liquid has floating in it a sliver of fingernail from a fire giant."},
            {name: "Potion of Cloud Giant Strength", content: "When you drink this potion, your Strength score changes to 27 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score.\n\nThis potion’s transparent liquid has floating in it a sliver of fingernail from a cloud giant."},
            {name: "Potion of Storm Giant Strength", content: "When you drink this potion, your Strength score changes to 29 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score.\n\nThis potion’s transparent liquid has floating in it a sliver of fingernail from a storm giant."},
            {name: "Potion of Growth", content: "When you drink this potion, you gain the \"enlarge\" effect of the enlarge/reduce spell for [[1d4]] hours (no Concentration required). The red in the potion's liquid continuously expands from a tiny bead to color the clear liquid around it and then contracts. Shaking the bottle fails to interrupt this process."},
            {name: "Potion of Heroism", content: "For 1 hour after drinking it, you gain 10 Temporary Hit Points that last for 1 hour. For the same Duration, you are under the effect of the bless spell (no Concentration required). This blue potion bubbles and steams as if boiling."},
            {name: "Potion of Invisibility", content: "This potion's container looks empty but feels as though it holds liquid. When you drink it, you become Invisible for 1 hour. Anything you wear or carry is Invisible with you. The effect ends early if you Attack or Cast a Spell."},
            {name: "Potion of Invulnerability", content: "For 1 minute after you drink this potion, you have Resistance to all damage. The potion's syrupy liquid looks like liquefied iron."},
            {name: "Potion of Lightning Resistance", content: "When you drink this potion, you gain Resistance to lightning damage for 1 hour."},
            {name: "Potion of Mind Reading", content: "When you drink this potion, you gain the effect of the Detect Thoughts spell (save DC 13). The potion's dense, purple liquid has an ovoid cloud of pink floating in it."},
            {name: "Potion of Necrotic Resistance", content: "When you drink this potion, you gain Resistance to necrotic damage for 1 hour."},
            {name: "Potion of Poison", content: "This concoction looks, smells, and tastes like a Potion of Healing or other beneficial potion. However, it is actually poison masked by Illusion magic. An Identify spell reveals its true Nature.\n\nIf you drink it, you take 3d6 poison damage, and you must succeed on a DC 13 Constitution saving throw or be Poisoned. At the start of each of your turns while you are Poisoned in this way, you take 3d6 poison damage. At the end of each of your turns, you can repeat the saving throw. On a successful save, the poison damage you take on your subsequent turns decreases by 1d6. The poison ends when the damage decreases to 0."},
            {name: "Potion of Poison Resistance", content: "When you drink this potion, you gain Resistance to poison damage for 1 hour."},
            {name: "Potion of Psychic Resistance", content: "When you drink this potion, you gain Resistance to psychic damage for 1 hour."},
            {name: "Potion of Radiant Resistance", content: "When you drink this potion, you gain Resistance to radiant damage for 1 hour."},
            {name: "Potion of Speed", content: "When you drink this potion, you gain the effect of the haste spell for 1 minute (no Concentration required). The potion’s yellow fluid is streaked with black and swirls on its own."},
            {name: "Potion of Thunder Resistance", content: "When you drink this potion, you gain Resistance to thunder damage for 1 hour."},
            {name: "Potion of Water Breathing", content: "You can breathe Underwater for 1 hour after drinking this potion. Its cloudy green fluid smells of the sea and has a jellyfish-like bubble floating in it."}
        ],

    checkInstall = function () {
        log('--> PotionManager v' + version + ' <-- Initialized');
		if (debugMode) showDialog('Debug Mode', 'PotionManager loaded.');
    },

    //----- INPUT HANDLER -----//

    handleInput = function (msg) {
        if (msg.type == 'api' && msg.content.startsWith('!pm')) {
			var parms = msg.content.split(/\s+/i);
			if (parms[1] && playerIsGM(msg.playerid)) {
				switch (parms[1]) {
					case '--add':
						commandAdd(msg);
						break;
                    case '--list':
                        commandList();
                        break;
                    case '--view':
						commandView(msg);
						break;
                    case '--help':
                    default:
                        commandHelp();
                        break;
				}
			} else commandHelp();
		}
    },

    commandHelp = function() {
        var button = '<div style="' + styles.fullWidth + '"><a style="' + styles.button + '" href="!pm --list">&#9668; Show List</a></div>';
        var message = '<b>!pm --help</b><br>Sends this Help dialog to the chat window.<br><br>'
        + '<b>!pm --list</b><br>Generates a list of all potions. Select the potion you want from the list and click the name to add it to all selected character(s). '
        + 'If that character already has that potion in its Utility section, the number of uses will be increased by 1. If it doesn\'t already have that potion it will be added.'
        + '<br><br>The list also has a "view" link so you can see a description of the potion in chat. This will <i>not</i> add the potion to any characters.' + button;
        showDialog('Help', message);
    },

    commandList = function() {
        // List all potions with "add" and "view" links
        var list = '<table style="border: 1px; width: 100%;"><tr><td>Click to Add:</td><td>&nbsp;</td></tr>';
        _.each(potions, function(potion) {
            list += '<tr><td style="width: 100%"><a href="!pm --add ' + potion.name + '">' + potion.name + '</a></td><td><a href="!pm --view '
            + potion.name + '">view</a></td></tr>';
        });
        list += '</table>';
        showDialog('Potions', list);
    },

    commandView = function(msg) {
        // Displays the potion's name and description in chat
        var button = '<div style="' + styles.fullWidth + '"><a style="' + styles.button + '" href="!pm --list">&#9668; Back to List</a></div>';
        var name = msg.content.substr(10).trim();
        var potion = _.findWhere(potions, {name: name});
        if (potion) {
            showDialog(potion.name, potion.content.replace('\n', '<br>').replace(/[\[\]]/g, '') + button);
        } else {
            showDialog('Error', name + ' is not a valid potion.' + button);
        }
    },

    commandAdd = function(msg) {
        // Add a potion to selected character(s)
		if (!msg.selected || !msg.selected.length) {
			showDialog('Error', 'No tokens are selected!');
			return;
		}

        // Verify that a valid potion name was given
        var button = '<div style="' + styles.fullWidth + '"><a style="' + styles.button + '" href="!pm --list">&#9668; Back to List</a></div>';
        var potion = _.findWhere(potions, {name: msg.content.substr(9).trim()});
        if (potion) {
            var newPotion, charNames = [], joiner = ' ', roll_template = '';
            if (potion.heal_dice) {
                newPotion = {
                    content: potion.content,
                    name: potion.name,
                    type: 'POTION',
                    toggle_details: 0,
                    content_toggle: '1',
                    roll_template: '{{uses=@{uses}}} {{per_use=@{per_use}}} {{repeating_item=repeating_utility_ROW_ID}} {{heal=[[' + potion.heal_dice + 'd4[heal] + ' + potion.heal_bonus + '[bonus]]]}} {{content=@{content}}}',
                    weight_system: 'POUNDS',
                    heal_toggle: '1',
                    heal_die: 'd4',
                    heal_dice: potion.heal_dice,
                    heal_bonus: potion.heal_bonus,
                    weight: 0.5,
                    weight_per_use: '1',
                    weight_total: 0.5,
                    uses: 1,
                    per_use: 1
                };
            } else {
                newPotion = {
                    content: potion.content,
                    name: potion.name,
                    type: 'POTION',
                    toggle_details: 0,
                    content_toggle: '1',
                    roll_template: '{{uses=@{uses}}} {{per_use=@{per_use}}} {{repeating_item=repeating_utility_ROW_ID}} {{content=@{content}}}',
                    weight_system: 'POUNDS',
                    weight: 0.5,
                    weight_per_use: '1',
                    weight_total: 0.5,
                    uses: 1,
                    per_use: 1
                };
            }

            _.each(msg.selected, function(obj) {
                var token = getObj(obj._type, obj._id);
                if (token && token.get('represents') !== '') {
                    var char_id = token.get('represents');
                    var character = getObj('character', char_id);
                    if (character) {

                        // Check to see if the player already has this potion in utilities
                        var currPotionID = findPotion(char_id, potion.name);
                        if (currPotionID) {
                            // Just update uses and total weight
                            var tmp_uses = findObjs({ type: 'attribute', characterid: char_id, name: 'repeating_utility_' + currPotionID + '_uses' })[0];
                            var tmp_total = findObjs({ type: 'attribute', characterid: char_id, name: 'repeating_utility_' + currPotionID + '_weight_total' })[0];
                            tmp_uses.setWithWorker('current', parseInt(tmp_uses.get('current')) + 1);
                            tmp_total.setWithWorker('current', parseFloat(tmp_total.get('current')) + 0.5);
                        } else {
                            // Add the new potion
                            const data = {};
                            var RowID = generateRowID();
                            var repString = 'repeating_utility_' + RowID;
                            var tmpPotion = newPotion;
                            tmpPotion.roll_template = tmpPotion.roll_template.replace('ROW_ID', RowID);
                            Object.keys(tmpPotion).forEach(function (field) {
                                data[repString + '_' + field] = tmpPotion[field];
                            });
                            setAttrs(char_id, data);
                        }

                        charNames.push(character.get('name'));
                    }
                }
            });

            // Provide feedback
            if (charNames.length > 1) charNames[charNames.length-1] = 'and ' + charNames[charNames.length-1];
    		if (charNames.length > 2) joiner = ', ';
            showDialog('Potion Added', 'One ' + potion.name + ' was given to ' + charNames.join(joiner) + '.' + button);
        } else {
            showDialog('Potion Not Added', 'The potion "' + tmpName + '" does not exist! Try adding from the list this time.' + button);
        }
    },

    findPotion = function(char_id, potion) {
        var row_id = null;
        var char = getObj('character', char_id);
        if (char) {
            var charAttrs = findObjs({type: 'attribute', characterid: char_id}, {caseInsensitive: true});
            var util = _.filter(charAttrs, function (attr) { return (attr.get('current') == potion && attr.get('name').match(/^.+(_utility_).+$/i) !== null); })[0];
            if (util) row_id = util.get('name').split('_')[2];
        }
        return row_id;
    },

    showDialog = function (title, content) {
		// Outputs a 5e Shaped dialog box strictly for GM
        var message = '/w GM &{template:5e-shaped} {{title=' + title + '}} {{text_big=' + content + '}}';
        sendChat('PotionManager', message, null, {noarchive:true});
	},

    generateUUID = (function () {
        "use strict";
        var a = 0, b = [];
        return function() {
            var c = (new Date()).getTime() + 0, d = c === a;
            a = c;
            for (var e = new Array(8), f = 7; 0 <= f; f--) {
                e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
                c = Math.floor(c / 64);
            }
            c = e.join("");
            if (d) {
                for (f = 11; 0 <= f && 63 === b[f]; f--) {
                    b[f] = 0;
                }
                b[f]++;
            } else {
                for (f = 0; 12 > f; f++) {
                    b[f] = Math.floor(64 * Math.random());
                }
            }
            for (f = 0; 12 > f; f++){
                c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
            }
            return c;
        };
    }()),

    generateRowID = function () {
        "use strict";
        return generateUUID().replace(/_/g, "Z");
    },

    //---- PUBLIC FUNCTIONS ----//

    registerEventHandlers = function () {
		on('chat:message', handleInput);
	};

    return {
		checkInstall: checkInstall,
		registerEventHandlers: registerEventHandlers
	};
}());

on("ready", function () {
    PotionManager.checkInstall();
    PotionManager.registerEventHandlers();
});
