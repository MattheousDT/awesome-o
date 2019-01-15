"use strict";

const initGuildSchemas = mongoose => {

    const Schema = mongoose.Schema;

    const permNodeSchema = new Schema({

        whitelist: { type: Boolean, default: false },
        list: [ String ]
    }, {
        _id: false
    });

    const scriptPermSchema = new Schema({

        enabled: { type: String, default: false },
        members: permNodeSchema,
        channels: permNodeSchema,
        roles: permNodeSchema
    }, {
        _id: false
    });

    const guildScriptSchema = new Schema({

        object_id: { type: Schema.Types.ObjectId, required: true },
        permissions: scriptPermSchema
    }, {
        _id: false
    });

    const memberPermSchema = new Schema({

        member_id: { type: String, required: true },
        list: [ String ]
    }, {
        _id: false
    });

    const GuildSchema = new Schema({

        // Id generated by mongo, this is here so I remember it exists.
        // _id: ObjectId,

        discord_id: { type: String, required: true, unique: true },
        prefix: { type: String, default: "-" },
        premium: { type: Boolean, default: false },
        member_perms: [ memberPermSchema ],
        script_perms: scriptPermSchema,
        scripts: [ guildScriptSchema ],
    });

    return {

        GuildSchema: mongoose.model("Guild", GuildSchema),
        GuildScriptSchema: mongoose.model("GuildScript", guildScriptSchema)
    };
}

module.exports = initGuildSchemas;