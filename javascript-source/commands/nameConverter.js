/*
 * Copyright (C) 2016-2020 phantombot.github.io/PhantomBot
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function() {
    $.bind('command', function(event) {
        var sender = event.getSender(),     // - sender of message
            command = event.getCommand(),   
            args = event.getArgs(),         
            action = args[0],               // - old name
            subAction = args[1];            // - new name


        /**
         * @commandpath namechange [oldname] [newname] - Convert someones old Twitch username to his/her new Twitch name. The user will be able to keep their points, time, quotes, and more.
         */
        //Checks whether the specified user names are defined.
        //If one of the user names is not defined, the function aborts its execution.
        //If both names are defined, then the variables necessary for further changing the user name are created
        
        if (command.equalsIgnoreCase('namechange')) {
            if (action === undefined || subAction === undefined) {
                $.say($.whisperPrefix(sender) + $.lang.get('namechange.default'));
                return;
            }

            var tables = ['points', 'time', 'followed', 'subscribed', 'visited', 'group', 'panelchatuserstats', 'panelchatstats'],
                changed = 0,
                i;

            $.say($.whisperPrefix(sender) + $.lang.get('namechange.updating', action, subAction));

            // Update the default tables with that users new name if it's currently in any tables.
            // Searches for the old username in the tables and sets the new name when it finds it. 
            // The old name will be removed from the tables
            for (i in tables) {
                if ($.inidb.exists(tables[i], action.toLowerCase()) == true) {
                    $.inidb.set(tables[i], subAction.toLowerCase(), $.inidb.get(tables[i], action.toLowerCase()));
                    $.inidb.del(tables[i], action.toLowerCase());
                    changed++;
                }
            }

            // Update the username in the quotes table.
            var keys = $.inidb.GetKeyList('quotes', ''),
                jsonArr;

            for (i in keys) {
                if ($.inidb.get('quotes', keys[i]).toLowerCase().indexOf(action.toLowerCase()) > -1) {
                    jsonArr = JSON.parse($.inidb.get('quotes', keys[i]));
                    $.inidb.set('quotes', keys[i], JSON.stringify([String(subAction), String(jsonArr[1]), String(jsonArr[2]), String(jsonArr[3])]));
                }
            }

            // Announce in chat once done.
            // If the name change was successful, the user will receive a message about changing the old name to the new one.
            // If this fails, the user will be notified that the name was not found.
            if (changed > 0) {
                $.say($.whisperPrefix(sender) + $.lang.get('namechange.success', action, subAction, changed));
            } else {
                $.say($.whisperPrefix(sender) + $.lang.get('namechange.notfound', action));
            }
        }
    });

    $.bind('initReady', function() {
        $.registerChatCommand('./commands/nameConverter.js', 'namechange', 1);
    });
})();
