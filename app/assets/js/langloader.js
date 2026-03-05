const fs = require('fs-extra')
const path = require('path')
const toml = require('toml')
const merge = require('lodash.merge')

let lang

function getEnvValue(key){
    const raw = process.env[key]
    if(raw == null){
        return null
    }

    const trimmed = raw.trim()
    if(trimmed.length === 0){
        return null
    }

    if((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))){
        return trimmed.slice(1, -1).trim()
    }

    return trimmed
}

exports.loadLanguage = function(id){
    lang = merge(lang || {}, toml.parse(fs.readFileSync(path.join(__dirname, '..', 'lang', `${id}.toml`))) || {})
}

exports.query = function(id, placeHolders){
    let query = id.split('.')
    let res = lang
    for(let q of query){
        res = res[q]
    }
    let text = res === lang ? '' : res
    if (placeHolders) {
        Object.entries(placeHolders).forEach(([key, value]) => {
            text = text.replace(`{${key}}`, value)
        })
    }
    return text
}

exports.queryJS = function(id, placeHolders){
    return exports.query(`js.${id}`, placeHolders)
}

exports.queryEJS = function(id, placeHolders){
    return exports.query(`ejs.${id}`, placeHolders)
}

exports.setupLanguage = function(){
    // Load Language Files
    exports.loadLanguage('en_US')
    // Uncomment this when translations are ready
    exports.loadLanguage('ko_KR')

    // Load Custom Language File for Launcher Customizer
    exports.loadLanguage('_custom')

    // Override selected custom landing links from .env.
    const landingEnvMap = {
        mediaGitHubURL: getEnvValue('LAUNCHER_MEDIA_GITHUB_URL'),
        mediaXURL: getEnvValue('LAUNCHER_MEDIA_X_URL'),
        mediaInstagramURL: getEnvValue('LAUNCHER_MEDIA_INSTAGRAM_URL'),
        mediaYouTubeURL: getEnvValue('LAUNCHER_MEDIA_YOUTUBE_URL'),
        mediaDiscordURL: getEnvValue('LAUNCHER_MEDIA_DISCORD_URL')
    }

    lang.ejs = lang.ejs || {}
    lang.ejs.landing = lang.ejs.landing || {}

    Object.entries(landingEnvMap).forEach(([key, value]) => {
        if(value){
            lang.ejs.landing[key] = value
        }
    })
}
