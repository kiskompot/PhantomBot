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

/**
 * topCommand.js
 *
 * Build and announce lists of top viewers (Highest points, highest time spent in the channel) 
 Составление и объявление списков самых популярных зрителей по количеству очков и самому большому времени проведенному на канале
 */
(function() {
    var amountPoints = $.getSetIniDbNumber('settings', 'topListAmountPoints', 5),//переменная хранящая значение пойнтов variable storing point value
        amountTime = $.getSetIniDbNumber('settings', 'topListAmountTime', 5);// variable storing the amount of time

    /*
     * @function reloadTop - функция перезагрузки топа
     */
    function reloadTop() {
        amountPoints = $.getIniDbNumber('settings', 'topListAmountPoints');
        amountTime = $.getIniDbNumber('settings', 'topListAmountTime');
    }

    /*
     * @function getTop5 - функция перезагрузки топа зрителей 
     *
     * @param {string} iniName
     * @returns {Array} - возвращает массив пользователей
     */
    // Функция получения первых 5 пользователей топа по времени и очкам - Function of getting the first 5 users of the top by time and points
    function getTop5(iniName) {
        var keys = $.inidb.GetKeysByNumberOrderValue(iniName, '', 'DESC', (iniName.equals('points') ? amountPoints + 2: amountTime + 2), 0),
            list = [],
            i,
            ctr = 0;
//Цикл создания списка польхзователь по очкам или времени - Cycle for creating a list of users by points or time
        for (i in keys) {
            if (!$.isBot(keys[i]) && !$.isOwner(keys[i])) {
                if (ctr++ == (iniName.equals('points') ? amountPoints : amountTime)) {
                    break;
                }
                list.push({ // Добавление в массив пользователь+значение полученные по ключу Adding user + value to the array obtained by key                
                    username: keys[i],
                    value: $.inidb.get(iniName, keys[i])
                });
            }
        }
//Сортировка полученного массива Sorting the resulting array
        list.sort(function(a, b) {
            return (b.value - a.value);
        });
//Вернуть массив пользователей взависимости от запроса(время или очки) Return an array of users depending on the request (time or points)
        if (iniName.equals('points')) {
            return list.slice(0, amountPoints);
        } else {
            return list.slice(0, amountTime);
        }
    }

    /*
     * @event command Обработчик команд 
     */
    $.bind('command', function(event) {
        var command = event.getCommand(),
            args = event.getArgs(),
            sender = event.getSender(),
            action = args[0];

        /**
         * @commandpath top - Display the top people with the most points - Если пользователь введет top в чат, 
         то система обратится к модулю очков стрима,если он доступен, и отобразит первых пяти пользоватлей,если таковые имеются
         */
        if (command.equalsIgnoreCase('top')) {
            if (!$.bot.isModuleEnabled('./systems/pointSystem.js')) {
                return;
            }
 // обращение к функции получения первых 5 пользователей по очкам Access to the function of getting the first 5 users by points
            var temp = getTop5('points'),
                top = [],
                i;
 // Добавление в массив имен пользоватлей и очков Adding usernames and points to the array
            for (i in temp) {
                top.push((parseInt(i) + 1) + '. ' + $.resolveRank(temp[i].username) + ' ' + $.getPointsString(temp[i].value));
            }
//Отобразить список популряных пользователей по очкам Display a list of top users by points
            $.say($.lang.get('top5.default', amountPoints, $.pointNameMultiple, top.join(', ')));
            return;
        }

        /*
         * @commandpath toptime - Display the top people with the most time
         // Обращение к функции получения первых 5 пользователей по времени на стриме
         */
        if (command.equalsIgnoreCase('toptime')) {
            var temp = getTop5('time'),
                top = [],
                i;
// Добавление в массив имен пользоватлей и времени Adding usernames and time to the array
            for (i in temp) {
                top.push((parseInt(i) + 1) + '. ' + $.resolveRank(temp[i].username) + ' ' + $.getTimeString(temp[i].value, true));
            }
//Отобразить список популярных зрителей по времени  Display a list of top users by time
            $.say($.lang.get('top5.default', amountTime, 'time', top.join(', ')));
            return;
        }

        /*
         * @commandpath topamount - Set how many people who will show up in the !top points list
         //определить сколько человек будет отображать команда !top
         */
        if (command.equalsIgnoreCase('topamount')) {
            if (action === undefined) {
                $.say($.whisperPrefix(sender) + $.lang.get('top5.amount.points.usage'));
                return;
            } else if (action > 15) {
                $.say($.whisperPrefix(sender) + $.lang.get('top5.amount.max'));
                return;
            }

            amountPoints = action;
            $.inidb.set('settings', 'topListAmountPoints', amountPoints);
            $.say($.whisperPrefix(sender) + $.lang.get('top5.amount.points.set', amountPoints));
        }

        /*
         * @commandpath toptimeamount - Set how many people who will show up in the !toptime list
         определить сколько человек будет отображать команда !toptime
         */
        if (command.equalsIgnoreCase('toptimeamount')) {
            if (action === undefined) {
                $.say($.whisperPrefix(sender) + $.lang.get('top5.amount.time.usage'));
                return;
            } else if (action > 15) {
                $.say($.whisperPrefix(sender) + $.lang.get('top5.amount.max'));
                return;
            }

            amountTime = action;
            $.inidb.set('settings', 'topListAmountTime', amountTime);
            $.say($.whisperPrefix(sender) + $.lang.get('top5.amount.time.set', amountTime));
        }

        /*
         * @commandpath reloadtopbots - DEPRECATED. Use !reloadbots - устарело
         */
        if (command.equalsIgnoreCase('reloadtopbots')) {
            $.say($.whisperPrefix(sender) + $.lang.get('top5.reloadtopbots'));
        }

        /*
         * Panel command, no command path needed. - Вызов функции перезагрузки, если пользователь напишет в чат reloadtop
         */
        if (command.equalsIgnoreCase('reloadtop')) {
            reloadTop();
        }
    });

    /**
     * @event initReady
      Регистрация команды в чате и передача ее в обработчик команд - Registering a command in the chat and sending it to the command handler
     */
    $.bind('initReady', function() {
        $.registerChatCommand('./commands/topCommand.js', 'top', 7);
        $.registerChatCommand('./commands/topCommand.js', 'toptime', 7);
        $.registerChatCommand('./commands/topCommand.js', 'topamount', 1);
        $.registerChatCommand('./commands/topCommand.js', 'toptimeamount', 1);
        $.registerChatCommand('./commands/topCommand.js', 'reloadtop', 1);
        $.registerChatCommand('./commands/topCommand.js', 'reloadtopbots', 1);
    });
})();
