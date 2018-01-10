"use strict"

const discord = require("discord.js");
const timers = require("timers");

const Server = require("../common/models/server");

const client = new discord.Client();

// Emitted whenever a channel is created.
client.on("channelCreate", channel => {

});

// Emitted whenever a channel is deleted.
client.on("channelDelete", channel => {

});

// Emitted whenever the pins of a channel are updated. Due to the nature of the WebSocket event,
// not much information can be provided easily here - you need to manually check the pins yourself.
client.on("channelPinsUpdate", (channel, time) => {

});

// Emitted whenever a channel is updated - e.g. name change, topic change.
client.on("channelUpdate", (oldChannel, newChannel) => {

});

// Emitted whenever the client user's settings update.
client.on("clientUserGuildSettingsUpdate", clientUserGuildSettings => {

});

// Emitted when the client user's settings update.
client.on("clientUserSettingsUpdate", clientUserSettings => {

});

// Emitted for general debugging information.
client.on("debug", info => {

});

// Emitted when the client's WebSocket disconnects and will no longer attempt to reconnect.
client.on("disconnect", event => {

});

// Emitted whenever a custom emoji is created in a guild.
client.on("emojiCreate", emoji => {

});

// Emitted whenever a custom guild emoji is deleted.
client.on("emojiDelete", emoji => {

});

// Emitted whenever a custom guild emoji is updated.
client.on("emojiUpdate", (oldEmoji, newEmoji) => {

});

// Emitted whenever the client's WebSocket encounters a connection error.
client.on("error", error => {

});

// Emitted whenever a member is banned from a guild.
client.on("guildBanAdd", (guild, user) => {

});

// Emitted whenever a member is unbanned from a guild.
client.on("guildBanRemove", (guild, user) => {

});

// Emitted whenever the client joins a guild.
client.on("guildCreate", guild => {

});

// Emitted whenever a guild is deleted/left.
client.on("guildDelete", guild => {

});

// Emitted whenever a user joins a guild.
client.on("guildMemberAdd", member => {

});

// Emitted whenever a member becomes available in a large guild.
client.on("guildMemberAvailable", member => {

});

// Emitted whenever a member leaves a guild, or is kicked.
client.on("guildMemberRemove", member => {

});

// Emitted whenever a chunk of guild members is received (all members come from the same guild).
client.on("guildMembersChunk", (members, guild) => {

});

// Emitted once a guild member starts/stops speaking.
client.on("guildMemberSpeaking", (member, speaking) => {

});

// Emitted whenever a guild member changes - i.e. new role, removed role, nickname.
client.on("guildMemberUpdate", (oldMember, newMember) => {

});

// Emitted whenever a guild becomes unavailable, likely due to a server outage.
client.on("guildUnavailable", guild => {

});

// Emitted whenever a guild is updated - e.g. name change.
client.on("guildUpdate", (oldGuild, newGuild) => {

});

// TEMP
const prefix = "<<";

const glob = {
    server: true,
    channels: [],
    roles: [],
    members: [],
    stats: []
};

const local = {
    server: false,
    channels: [],
    roles: [],
    members: [],
    stats: []
}

class PermissionGroup {
    constructor(json) {
        this.json = json;
    }
    inherit(other) {
        
        const inherit = other.get();
        const base = this.json;

        const server = (inherit.server && base.server) || base.server;

        var found;

        // Channels.
        if (!base.channels) {
            base.channels = [];
        }
        var channels = base.channels.slice();

        found = false;
        for (var i = 0; i < (inherit.channels ? inherit.channels.length : 0); i++) {
            for (var j = 0; j < (base.channels ? base.channels.length : 0); j++) {
                if (inherit.channels[i].id == base.channels[j].id) {
                    channels[j].allow = (inherit.channels[i].allow && base.channels[j].allow) || base.channels[j].allow,
                    found = true;
                }
            }
            if (!found) {
                channels.push(inherit.channels[i]);
            }
        }

        // Roles.
        if (!base.roles) {
            base.roles = [];
        }
        var roles = base.roles.slice();

        found = false;
        for (var i = 0; i < (inherit.roles ? inherit.roles.length : 0); i++) {
            for (var j = 0; j < (base.roles ? base.roles.length : 0); j++) {
                if (inherit.roles[i].id == base.roles[j].id) {
                    roles[j].allow = (inherit.roles[i].allow && base.roles[j].allow) || base.roles[j].allow,
                    found = true;
                }
            }
            if (!found) {
                roles.push(inherit.roles[i]);
            }
        }

        // Members.
        if (!base.members) {
            base.members = [];
        }
        var members = base.members.slice();

        found = false;
        for (var i = 0; i < (inherit.members ? inherit.members.length : 0); i++) {
            for (var j = 0; j < (base.members ? base.members.length : 0); j++) {
                if (inherit.members[i].id == base.members[j].id) {
                    members[j].allow = (inherit.members[i].allow && base.members[j].allow) || base.members[j].allow,
                    found = true;
                }
            }
            if (!found) {
                members.push(inherit.members[i]);
            }
        }

        // Stats.
        if (!base.stats) {
            base.stats = [];
        }
        var stats = base.stats.slice();

        found = false;
        for (var i = 0; i < (inherit.stats ? inherit.stats.length : 0); i++) {
            for (var j = 0; j < (base.stats ? base.stats.length : 0); j++) {
                if ((inherit.stats[i].name == base.stats[j].name) && (inherit.stats[i].operator == base.stats[j].operator)) {
                    stats[j].value = base.stats[j].value;
                    found = true;
                }
            }
            if (!found) {
                stats.push(inherit.stats[i]);
            }
        }

        return new PermissionGroup({
            server: server,
            channels: channels,
            roles: roles,
            members: members,
            stats: stats
        });
    }
    check(command, message, stats) {
        // server
        // channels
        // roles
        // members
        // stats
    }
    get() {
        return this.json;
    }
}

var globPerms = new PermissionGroup(glob);
var localPerms = new PermissionGroup(local);

console.log(localPerms.inherit(globPerms).get());

class Command {
    constructor(json) {
        this.json = json;
    }
    get() {
        return this.json;
    }
}


/*
class Group {
    constructor(groupJson) {
        this.group = groupJson;
    }
    inherit(other) {
        const temp = other.getJson();
        const server = (temp.server && this.group.server) || this.group.server;
        const combine = function(from, to, prop, cmp, comb) {
            var found;
            for (var i = 0; i < (from[prop] == undefined ? 0 : from[prop].length); i++) {
                for (var j = 0; j < (to[prop] == undefined ? 0 : to[prop].length); j++) {
                    if (cmp(from[prop][i], to[prop][j])) {
                        comb(from[prop][i], to[prop][j]);
                        found = true;
                    }
                }
                if (!found) {
                    if (to[prop] == undefined) {
                        to[prop] = [];
                    }
                    to[prop].push(from[prop][i]);
                }
            }
        }
        var cmp, comb;
        cmp = function(from, to) { return from.id == to.id; }
        comb = function(from, to) { to.value = (from.value && to.value) || to.value; }
        combine(temp, this.group, "channels", cmp, comb);
        combine(temp, this.group, "roles", cmp, comb);
        combine(temp, this.group, "members", cmp, comb);
        cmp = function(from, to) {
            return ((from.name == to.name) && (from.operator == to.operator));
        }
        comb = function(from, to) {
            to.value = from.value;
        }
        combine(temp, this.group, "stats", cmp, comb);
    }
    resolve(message, stats, command) {
        const info = {
            error: false,
            embed: null,
        };
        var final = true;
        // Server.
        const server = this.group.server;
        final = final && server;
        if (!final) {
            info.error = true;
            info.embed = embeds.groupError(command, [
                {
                    head: "Command disabled on the server.",
                    desc: "So basically you can't use it here.",
                }
            ]);
            return info;
        }
        // Channels.
        if (this.group.channels != undefined) {
            var channelWc = this.group.channels.find(e => {
                return e.id == "*";
            });
            var channelOv = this.group.channels.find(e => {
                return e.id == message.channel.id;
            });
            if (channelWc == undefined) {
                channelWc = {};
                channelWc.value = server;
            }
            if (channelOv == undefined) {
                channelOv = {};
                channelOv.value = channelWc;
            }
            final = final && ((channelWc.value && channelOv.value) || channelOv.value);
            if (!final) {
                info.error = true;
                info.embed = embeds.groupError(command, [
                    {
                        head: "Command disabled for this channel.",
                        desc: "So basically you can't use it here.",
                    }
                ]);
                return info;
            }
        }
        // Roles.
        if (this.group.roles != undefined) {
            var rolesWc = this.group.channels.find(e => {
                return e.id == "*";
            });
            var rolesOv = this.group.channels.filter(e => {
                for (var i = 0; i < message.member.roles.array().length; i++) {
                    return e.id == message.member.roles.array()[i];
                }
            });
            if (rolesWc == undefined) {
                rolesWc = {};
                rolesWc.value = server;
            }
            if (rolesOv.length > 0) {
                for (var i = 0; i < rolesOv.length; i++) {
                    final = final && ((rolesWc.value && rolesOv[i].value) || rolesOv[i].value);
                }
            } else {
                final = final && rolesWc.value;
            }
            if (!final) {
                info.error = true;
                info.embed = embeds.groupError(command, [
                    {
                        head: "Command disabled for your role.",
                        desc: "So basically you can't use it.",
                    }
                ]);
                return info;
            }
        }
        // Members
        if (this.group.members != undefined) {
            var memberWc = this.group.members.find(e => {
                return e.id == "*";
            });
            var memberOv = this.group.members.find(e => {
                return e.id == message.author.id;
            });
            if (memberWc == undefined) {
                memberWc = {};
                memberWc.value = server;
            }
            if (memberOv == undefined) {
                memberOv = {};
                memberOv.value = memberWc;
            }
            final = final && ((memberWc.value && memberOv.value) || memberOv.value);
            if (!final) {
                info.error = true;
                info.embed = embeds.groupError(command, [
                    {
                        head: "Command disabled for you.",
                        desc: "So basically you can't use it.",
                    }
                ]);
                return info;
            }
        }
        return info;
    }
    getJson() {
        return this.group;
    }
}
class Command {
    constructor(commandJson) {
        this.command = commandJson;
    }
    check(message, prefix) {
        switch(this.command.type) {
            case "command":
                return message.content.toLowerCase().startsWith(prefix + this.command.value.toLowerCase());
                break;
            case "startswith":
                return message.content.toLowerCase().startsWith(this.command.value.toLowerCase());
                break;
            case "contains":
                return message.content.toLowerCase().indexOf(this.command.value.toLowerCase()) != -1;
                break;
            case "exactmatch":
                return message.content == this.command.value;
                break;
            case "regex":
                const regex = new RegExp(this.command.value, this.command.flags);
                return regex.test(message.content);
                break;
        }
        return false;
    }
    resolve(message, members, stats, callback) {
        const info = {
            error: false,
            embed: null,
        };
        const script = this.command.script;
        const commandArgs = message.content.split(" ");
        const options = {};
        var all = "";
        for (var i = 1; i < commandArgs.length; i++) {
            options["args." + i] = commandArgs[i];
            all = (all + commandArgs[i] + " ");
        }
        options["args.all"] = all.trim();
        // member
        // stats
        // args
        // spwikia
        // channel
        // embed
        //-member.stat
        //-member.addstat
        //-member.remstat
        //-member.addrole
        //-member.remrole
        //-stats.stat
        //-args.n
        //-args.all
        //spwikia.search
        //-channel.send
        //embed.create
        //#member.addrole(testrole);
        var done = false;
        var i = 0;
        var call = 0, variable = 0, start = 0, end = 0;
        while (!done) {
            call = script.indexOf("#", end);
            variable = script.indexOf("$", end);
            if (call < variable || variable == -1) {
                start = call;
            } else {
                start = variable;
            }
            end = script.indexOf(";", start);
            if (start == -1 || end == -1) {
                done = true;
                break;
            }
            const line = script.substring(start, end + 1).trim();
            console.log(i + " >> " + line);
            const delimIndex = line.indexOf(".");
            const functional = line.substring(delimIndex + 1, line.length);
            var argLine = functional.substring(functional.indexOf("(") + 1, functional.indexOf(")"));
            
            const args = [];
            var parsed = false;
            var curr = 0, prev = 0;
            while (!parsed) {
                prev = curr;
                if (prev != 0) {
                    prev = prev + 1;
                } 
                curr = argLine.indexOf(",", prev + 1);
                if (curr == -1) {
                    args.push(argLine.substring(prev, argLine.length).trim());
                    parsed = true;
                } else {
                    args.push(argLine.substring(prev, curr).trim());
                }
            }
            for (var i = 0; i < args.length; i++) {
                if (args[i] == "member") {
                    args[i] = message.author.username;
                }
                if (options[args[i]] == undefined) {
                    options[args[i]] = args[i];
                }
            }
            if (line.startsWith("$")) {
                const name = line.substring(line.indexOf("$") + 1, line.indexOf("=")).trim();
                const equate = line.substring(line.indexOf("=") + 1, line.indexOf(";")).trim();
                if (equate.startsWith("member")) {
                    if (functional.startsWith("stat")) {
                        const memId = message.guild.members.find(e => { return e.user.id }, options[args[0]]);
                        const member = members.find(e => {
                            return e.id == memId;
                        });
                        if (member == undefined) {
                            callback(info);
                            return;
                        }
                        const stat = member.stats.find(e => {
                            return e.name == args[1];
                        });
                        if (stat == undefined) {
                            callback(info);
                            return;
                        }
                        options[name] = stat.value;
                    }
                }
                if (equate.startsWith("stats")) {
                    if (functional.startsWith("stat")) {
                        const stat = stats.find(e => {
                            return e.name == args[0];
                        });
                        if (stat == undefined) {
                            callback(info);
                            return;
                        }
                        options[name] = stat.now;
                    }
                }
            }
            if (line.startsWith("#")) {
                if (line.startsWith("#member")) {
                    if (functional.startsWith("addstat")) {
                        const memId = message.guild.members.find(e => { return e.user.id }, options[args[0]]);
                        const member = members.find(e => {
                            return e.id == memId;
                        });
                        if (member == undefined) {
                            callback(info);
                            return;
                        }
                        const stat = member.stats.find(e => {
                            return e.name == args[1];
                        });
                        if (stat == undefined) {
                            callback(info);
                            return;
                        }
                        const value = parseInt(args[2]);
                        if (value == undefined) {
                            callback(info);
                            return;
                        }
                        stat.value = stat.value + value;
                    }
                    if (functional.startsWith("remstat")) {
                        const memId = message.guild.members.find(e => { return e.user.id }, options[args[0]]);
                        const member = members.find(e => {
                            return e.id == memId;
                        });
                        if (member == undefined) {
                            callback(info);
                            return;
                        }
                        const stat = member.stats.find(e => {
                            return e.name == args[1];
                        });
                        if (stat == undefined) {
                            callback(info);
                            return;
                        }
                        const value = parseInt(args[2]);
                        if (value == undefined) {
                            callback(info);
                            return;
                        }
                        stat.value = stat.value - value;
                    }
                    if (functional.startsWith("addrole")) {
                        const member = message.guild.members.find(e => { return e.user.username }, options[args[0]]);
                        if (member == undefined) {
                            callback(info);
                            return;
                        }
                        const role = message.guild.roles.find("name", "testrole");
                        if (role == undefined) {
                            callback(info);
                            return;
                        }
                        member.addRole(role);
                    }
                    if (functional.startsWith("remrole")) {
                        const member = message.guild.members.find(e => { return e.user.username }, options[args[0]]);
                        if (member == undefined) {
                            callback(info);
                            return;
                        }
                        const role = message.guild.roles.find("name", options[args[1]]);
                        if (role == undefined) {
                            callback(info);
                            return;
                        }
                        member.removeRole(role);
                    }
                    if (functional.startsWith("reply")) {
                        if (options[args[0]] == undefined) {
                            message.reply(args[0]);
                        } else {
                            message.reply(options[args[0]]);
                        }
                    }
                }
                if (line.startsWith("#channel")) {
                    if (functional.startsWith("send")) {
                        const channel = message.guild.channels.find("name", options[args[0]]);
                        if (channel == undefined) {
                            callback(info);
                            return;
                        }
                        channel.send(options[args[1]]);
                    }
                }
            }
            i = i + 1;
        }
        callback(info);
    }
    getJson() {
        return this.command;
    }
}
*/

// Emitted whenever a message is created.
client.on("message", message => {

    if (message.author.equals(client.user)) { return; }



    /*
    if (message.author.equals(client.user)) { return; }

    const ourServerId = "371762864790306817";

    if (message.content.startsWith("-debug")) {
        console.log(servers);
    }

    if (message.content.indexOf("shit") != -1) {

        // Find /r/southpark server.
        const server = servers.find(e => {
            return e._id == ourServerId;
        });
        if (server == undefined) {
            console.log("1 >> THE BOT IS BROKEN, WERE ALL FUCKED!");
            return;
        }

        // Find current member.
        if (server.members == undefined) {
            server.members = [];
        }
        const member = server.members.find(e => {
            return e.id == message.author.id;
        });
        if (member == undefined) {
            server.members.push({
                id: message.author.id,
                name: message.author.username,
                stats: [
                    {
                        name: "shits",
                        value: 1
                    }
                ]
            });
            return;
        }

        // Find 'shits' stat.
        if (member.stats == undefined) {
            member.stats = [];
        }
        const stat = member.stats.find(e => {
            return e.name == "shits";
        });
        if (stat == undefined) {
            member.stats.push({
                name: "shits",
                value: 1
            });
            return;
        }

        stat.value += 1;

        for (var i = 0; i < member.stats.length; i++) {
            if (member.stats[i].name == "shits") {
                member.stats[i] = stat;
                break;
            }
        }

        for (var i = 0; i < server.members.length; i++) {
            if (server.members[i].id == message.author.id) {
                server.members[i] = member;
                break;
            }
        }
    }
    */
});

// Emitted whenever a message is deleted.
client.on("messageDelete", message => {

});

// Emitted whenever messages are deleted in bulk.
client.on("messageDeleteBulk", messages => {

});

// Emitted whenever a reaction is added to a message.
client.on("messageReactionAdd", (messageReaction, user) => {

});

// Emitted whenever a reaction is removed from a message.
client.on("messageReactionRemove", (messageReaction, user) => {

});

// Emitted whenever all reactions are removed from a message.
client.on("messageReactionRemoveAll", message => {

});

// Emitted whenever a message is updated - e.g. embed or content change.
client.on("messageUpdate", (oldMessage, newMessage) => {

});

// Emitted whenever a guild member's presence changes, or they change one of their details.
client.on("presenceUpdate", (oldMember, newMember) => {

});

// Emitted when the client becomes ready to start working.
client.on("ready", () => {

    /*
    const ourServerId = "371762864790306817";
    Server.findById(ourServerId, (err, server) => {
        if (err) {
            console.log("1 >> THE DB IS BROKEN, WERE ALL FUCKED!");
            return;
        }

        var found = false;
        for (var i = 0; i < servers.length; i++) {
            if (servers[i]._id == server._id) {

                found = true;
                servers[i] = server;
            }
        }

        if (!found) {
            servers.push(server);
        }
    });

    const interval = /*300000*//*10000;
    timers.setInterval(() => {

        Server.findById(ourServerId, (err, server) => {
            if (err) {
                console.log("2 >> THE DB IS BROKEN, WERE ALL FUCKED!");
                return;
            }

            var found = false;
            for (var i = 0; i < servers.length; i++) {
                if (servers[i]._id == server._id) {
    
                    found = true;

                    // Convert old json storage and save in db.
                    /*
                    const members = [];
                    for (var j = 0; j < temp.list.length; j++) {
                        members.push({
                            id: temp.list[j].id,
                            name: temp.list[j].name,
                            stats: [
                                {
                                    name: "shits",
                                    value: temp.list[j].shits
                                },
                                {
                                    name: "activity",
                                    value: temp.list[j].activity
                                }
                            ]
                        });
                    }
                    */

                    /*server.members = servers[i].members;
                    server.graphs = servers[i].graphs;
                    server.stats = servers[i].stats;
                    server.issues = servers[i].issues;
                }
            }
    
            if (!found) {
                console.log("3 >> THE DB IS BROKEN, WERE ALL FUCKED!");
            }

            server.save(err => {
                if (err) {
                    console.log("4 >> THE DB IS BROKEN, WERE ALL FUCKED!");
                }
            });
        });

    }, interval);
    */
});

// Emitted whenever the client tries to reconnect to the WebSocket.
client.on("reconnecting", () => {

});

// Emitted whenever a WebSocket resumes.
client.on("resume", replayed => {

});

// Emitted whenever a role is created.
client.on("roleCreate", role => {

});

// Emitted whenever a guild role is deleted.
client.on("roleDelete", role => {

});

// Emitted whenever a guild role is updated.
client.on("roleUpdate", (oldRole, newRole) => {

});

// Emitted whenever a user starts typing in a channel.
client.on("typingStart", (channel, user) => {

});

// Emitted whenever a user stops typing in a channel.
client.on("typingStop", (channel, user) => {

});

// Emitted whenever a note is updated.
client.on("userNoteUpdate", (user, oldNote, newNote) => {

});

// Emitted whenever a user's details (e.g. username) are changed.
client.on("userUpdate", (oldUser, newUser) => {

});

// Emitted whenever a user changes voice state - e.g. joins/leaves a channel, mutes/unmutes.
client.on("voiceStateUpdate", (oldMember, newMember) => {

});

// Emitted for general warnings.
client.on("warn", info => {

});

module.exports = client;