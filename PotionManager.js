/*
PotionManager
Enables easy adding & updating of Potions in the 5e Shaped Sheet's Utilities section.

On Github:	https://github.com/blawson69
Contact me: https://app.roll20.net/users/1781274/ben-l

Like this script? Buy me a coffee:
    https://venmo.com/theRealBenLawson
    https://paypal.me/theRealBenLawson
*/

var PotionManager = PotionManager || (function () {
    'use strict';

    //---- INFO ----//

    var version = '0.4',
        debugMode = false,
        styles = {
            button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
            textButton: 'background-color: transparent; border: none; padding: 0; color: #591209; text-decoration: underline;',
            buttonWrapper: 'text-align: center; margin: 14px 0 12px 0; clear: both;',
            code: 'font-family: "Courier New", Courier, monospace; background-color: #ddd; color: #000; padding: 2px 4px;',
            subtitle: 'margin-top: -4px; padding-bottom: 4px; color: #666; font-size: 1.125em; font-variant: small-caps;',
            infoLink: 'text-decoration: none; font-family: Webdings;'
        },

    checkInstall = function () {
        if (!_.has(state, 'PotionManager')) state['PotionManager'] = state['PotionManager'] || {};
        if (typeof state['PotionManager'].core_potions == 'undefined') state['PotionManager'].core_potions = setCorePotions();
        if (typeof state['PotionManager'].homebrew_potions == 'undefined') state['PotionManager'].homebrew_potions = [];

        checkCorePotionUpdates();
        log('--> PotionManager v' + version + ' <-- Initialized');
        if (debugMode) {
            var d = new Date();
            showDialog('Debug Mode', 'PotionManager loaded at ' + d.toLocaleTimeString());
            state['PotionManager'].core_potions = setCorePotions();
        }
    },

    //----- INPUT HANDLER -----//

    handleInput = function (msg) {
        if (msg.type == 'api' && msg.content.startsWith('!pm')) {
			var parms = msg.content.split(/\s+/i);
			if (parms[1] && playerIsGM(msg.playerid)) {
				switch (parms[1]) {
					case '--add':
						commandAdd(msg, false);
						break;
                    case '--list':
                        commandList();
                        break;
                    case '--view':
						commandView(msg);
						break;
                    case '--import':
						commandImport();
						break;
                    case '--help':
                    default:
                        commandHelp();
                        break;
				}
			} else commandHelp();
		}
    },

    commandHelp = function () {
        var message = '';
        message += 'Use the button below to generate a list of all potions. Select the potion you want and click the name to add it to all selected character(s). If that character already has that potion in its Utility section, the number of uses will be increased by 1. If it doesn\'t, the potion will be added.';
        message += '<br><br>Click the "view" link to see a description of the potion.';
        message += '<div style="' + styles.buttonWrapper + '"><a style=\'' + styles.button + '\' href="!pm --list">View List</a></div>';

        message += '<hr>Import your homebrewed potions from a "PotionManager Homebrew" handout.';
        message += '<div style="' + styles.buttonWrapper + '"><a style=\'' + styles.button + '\' href="!pm --import">Import</a></div>';

        message += 'See the <a style=\'' + styles.textButton + '\' href="https://github.com/blawson69/PotionManager">documentation</a> for complete instructions.';
        showDialog('Help', message);
    },

    commandList = function () {
        // List all potions with "add" and "view" links
        var potions = getPotions(), list = '<table style="border: 1px; width: 100%;">';
        _.each(potions, function(potion) {
            list += '<tr><td style="width: 100%"><a href="!pm --add ' + potion.name + '" title="Add to Selected Character(s)">' + potion.name + '</a></td><td><a style=\'' + styles.infoLink + '\' href="!pm --view ' + potion.name + '" title="View ' + potion.name + '">i</a></td></tr>';
        });
        list += '</table>';
        showDialog('Potions', list);
    },

    commandView = function (msg) {
        // Displays the potion's name and description in chat
        var potions = getPotions();
        var button = '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + '" href="!pm --list">&#9668; Back to List</a></div>';
        var category = '<div style="' + styles.subtitle + '">Adventuring Gear</div>';
        var name = msg.content.substr(10).trim();
        var potion = _.findWhere(potions, {name: name});
        if (potion) {
            showDialog(potion.name, category + potion.content.replace(/\n/g, '<br>').replace(/\[{2}([^\]]*)\]{2}/g, '<span style=\'color: #c00;\'>$1</span>') + button);
        } else {
            showDialog('Error', name + ' is not a valid potion.' + button);
        }
    },

    commandAdd = function (msg, external = true) {
        // Add a potion to selected character(s)
        var retval = true;
		if (!msg.selected || !msg.selected.length) {
            retval.success = false;
			if (!external) showDialog('Error', 'No tokens are selected!');
            else log('PotionManager Error: No tokens are selected!');
			return retval;
		}

        // Verify that a valid potion name was given
        var potions = getPotions();
        var button = '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + '" href="!pm --list">&#9668; Back to List</a></div>';
        var potion = _.findWhere(potions, {name: msg.content.replace('!pm --add', '').trim()});
        if (potion) {
            var newPotion, charNames = [], joiner = ' ', roll_template = '';
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
            if (potion.heal_dice) {
                newPotion.roll_template = '{{uses=@{uses}}} {{per_use=@{per_use}}} {{repeating_item=repeating_utility_ROW_ID}} {{heal=[[' + potion.heal_dice + 'd4[heal] + ' + potion.heal_bonus + '[bonus]]]}} {{content=@{content}}}';
                newPotion.weight_system = 'POUNDS';
                newPotion.heal_toggle = '1';
                newPotion.heal_die = 'd4';
                newPotion.heal_dice = potion.heal_dice;
                newPotion.heal_bonus = potion.heal_bonus;
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
                            tmp_uses.setWithWorker('current', toNumber(tmp_uses.get('current')) + 1);
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
            if (!external) showDialog('Potion Added', 'One ' + potion.name + ' was given to ' + charNames.join(joiner) + '.' + button);
        } else {
            retval = false;
            if (!external) showDialog('Potion Not Added', 'The potion "' + tmpName + '" does not exist! Try adding from the list this time.' + button);
            else log('PotionManager Error: The potion "' + tmpName + '" does not exist.');
        }
        return retval;
    },

    commandImport = function () {
        var button = '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + '" href="!pm --list">View List</a></div>';
        var custom = findObjs({name: 'PotionManager Homebrew', type: 'handout'})[0];
        if (custom) {
            custom.get('notes', function (notes) {
                var tmpPotions = [], potions = processNotes(notes);
                _.each(potions, function (item) {
                    var potion = item.trim().split(/\s*\|\s*/);
                    if (_.size(potion) > 1) {
                        var name = (potion[0].startsWith('Potion of')) ? potion[0] : 'Potion of ' + potion[0];
                        var newPotion = {name: name, content: potion[1]};
                        if (potion[2] && potion[3] && !isNaN(potion[2]) && potion[2] != '' && !isNaN(potion[3]) && potion[3] != '') {
                            newPotion.heal_dice = parseInt(potion[2]);
                            newPotion.heal_bonus = parseInt(potion[3]);
                        }
                        tmpPotions.push(newPotion);
                    }
                });
                state['PotionManager'].homebrew_potions = tmpPotions;
                if (_.size(tmpPotions) == 0) showDialog('Import Error', 'No potions found! Please check your formatting and try again.');
                else showDialog('Import Complete', _.size(tmpPotions) + ' potions have been imported. If they do not appear in the list, please check your formatting and try again.' + button);
            });
        } else {
            showDialog('Import Error', 'A handout named "PotionManager Homebrew" does not exist.');
        }
    },

    findPotion = function (char_id, potion) {
        var row_id;
        var char = getObj('character', char_id);
        if (char) {
            var charAttrs = findObjs({type: 'attribute', characterid: char_id}, {caseInsensitive: true});
            var util = _.filter(charAttrs, function (attr) { return (attr.get('current') == potion && attr.get('name').match(/^.+(_utility_).+$/i) !== null); })[0];
            if (util) row_id = util.get('name').split('_')[2];
        }
        return row_id;
    },

    getPotions = function (kind = '') {
        var potions;
        switch (kind.toLowerCase()) {
            case 'core':
            potions = state['PotionManager'].core_potions;
            break;
            case 'homebrew':
            potions = state['PotionManager'].homebrew_potions;
            break;
            default:
            potions = _.clone(state['PotionManager'].core_potions);
            _.each(state['PotionManager'].homebrew_potions, function (x) { potions.push(x); });
        }
        potions = _.sortBy(potions, 'name');
        return potions;
    },

    processNotes = function (notes) {
        var retval, text = notes.trim();
        text = text.replace(/<p[^>]*>/gi, '<p>').replace(/<br>/gi, '\n').replace(/<\/?(span|div|pre|img|code|b|i)[^>]*>/gi, '');
        if (text != '' && /<p>[^<]*<\/p>/g.test(text)) retval = text.match(/<p>[^<]*<\/p>/g).map( l => l.replace(/^<p>([^<]*)<\/p>$/,'$1'));
        return retval;
    },

    setCorePotions = function () {
        return [
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
            {name: "Potion of Poison Resistance", content: "When you drink this potion, you gain Resistance to poison damage for 1 hour."},
            {name: "Potion of Psychic Resistance", content: "When you drink this potion, you gain Resistance to psychic damage for 1 hour."},
            {name: "Potion of Radiant Resistance", content: "When you drink this potion, you gain Resistance to radiant damage for 1 hour."},
            {name: "Potion of Speed", content: "When you drink this potion, you gain the effect of the haste spell for 1 minute (no Concentration required). The potion’s yellow fluid is streaked with black and swirls on its own."},
            {name: "Potion of Thunder Resistance", content: "When you drink this potion, you gain Resistance to thunder damage for 1 hour."},
            {name: "Potion of Water Breathing", content: "You can breathe Underwater for 1 hour after drinking this potion. Its cloudy green fluid smells of the sea and has a jellyfish-like bubble floating in it."}
        ];
    },

    checkCorePotionUpdates = function () {
        var message = '', updated = [], removed = [];
        _.each(setCorePotions(), function (x) {
            if (!_.find(state['PotionManager'].core_potions, function (y) { return x.name === y.name && x.content === y.content; })) updated.push(x);
        });
        updated = _.pluck(updated, 'name');
        _.each(state['PotionManager'].core_potions, function (x) {
            if (!_.find(setCorePotions(), function (y) { return x.name === y.name && x.content === y.content; })) removed.push(x);
        });
        removed = _.pluck(removed, 'name');

        message += 'The core potions list has been updated from the previous version.';
        if (_.size(updated) > 0) {
            message += 'The following potions have been added:';
            message += '<ul><li>' + updated.join('</li><li>') + '</li></ul>';
        }
        if (_.size(removed) > 0) {
            message += 'The following potions have been removed:';
            message += '<ul><li>' + removed.join('</li><li>') + '</li></ul>';
        }
        message += '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + '" href="!pm --list">View List</a></div>';

        if (_.size(updated) > 0 || _.size(removed) > 0) {
            showDialog('Update Notice', message);
            state['PotionManager'].core_potions = setCorePotions();
        }
    },

    toNumber = function (num) {
        var ret;
        if (typeof num == 'string') num = num.replace(/\D*/i, '');
        return Number(num);
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
		registerEventHandlers: registerEventHandlers,
        getPotions: getPotions,
        addPotion: commandAdd,
        version: version
	};
}());

on("ready", function () {
    PotionManager.checkInstall();
    PotionManager.registerEventHandlers();
});
