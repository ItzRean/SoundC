const Discord = require('discord.js');
const request = require('request');
const bot = new Discord.Client();
const config = require('./config.json');
const prefix = config.prefix;
var servers = {};

// Bot's ready message
bot.on('ready', function(){
	console.log("SoundCloud Bot's ready to play");
});

// SoundCloud function.
function soundcloud(connection, message){
	if (!servers[message.guild.id].dispatcher) {
		request.get("https://api.soundcloud.com/i1/tracks/" + servers[message.guild.id].ulink[0].fields[0].value + "/streams?client_id=" + config.sctoken, {json: true}, function(err, a, data){
			servers[message.guild.id].dispatcher = connection.playArbitraryInput(data[Object.keys(data)[0]]);
			setTimeout(function(){
				servers[message.guild.id].dispatcher.on('end', function(){
					servers[message.guild.id].dispatcher.end();
					servers[message.guild.id].dispatcher = undefined;
					servers[message.guild.id].ulink.shift();
					if (servers[message.guild.id].ulink[0]) { soundcloud(connection, message) } else { setTimeout(function(){
						if (servers[message.guild.id].ulink[0]) return;
						message.member.voiceChannel.leave();
					},18000)};
				})
			},2000);
			message.channel.send({embed:servers[message.guild.id].ulink[0]})
		})
	}
}

// Bot's functions.
bot.on('message', function(message){
	if (message.content.toLowerCase().startsWith(prefix + "play")){
		if (!message.content.toLowerCase().startsWith(prefix + "play ") || !message.content.match(/soundcloud\.com/)) return message.reply("please enter a link");
		if (!message.member.voiceChannel) return message.reply("Please enter a voice channel.");
		request.get("http://api.soundcloud.com/resolve.json?url=" + message.content.split(/play /gmi)[1] + "&client_id=" + сonfig.sctoken, {json: true},function(error, bruh, body){
			if (error || body[0] == "<" || body.errors) return message.channel.send("error occured, video not found");
			message.member.voiceChannel.join().then(function(connection){
				var item = body;
				if (!servers[message.guild.id]) servers[message.guild.id] = {ulink:[]};
				var temp = {title:item.title, url: item.permalink_url, fields: [{name: "ID", value:item.id},{name: "Author", value:`[${item.user.permalink_url}](${item.user.username})`}]};
				if (item.artwork_url) temp.image = {url: item.artwork_url};
				servers[message.guild.id].ulink.push(temp);
				soundcloud(connection, message);
			})
		})
	}
	if (message.content.toLowerCase().startsWith(prefix + "skip")) {
		if (!message.member.voiceChannel) return message.reply("you must first be in a Voice Channel to use this command.");
		if (!servers[message.guild.id].dispatcher) return message.reply("nothing to skip.");
		servers[message.guild.id].dispatcher.end();
	}
	if (message.content.toLowerCase().startsWith(prefix + "restart") && ([config.owner]).includes(message.author.id) == true){
		process.exit(1);
	}
	if (message.content.toLowerCase().startsWith(prefix + "eval") && ([config.owner]).includes(message.author.id) == true){
		eval(message.content.split(/eval/gmi)[1])
	}
});

bot.login('NDAwMzAwOTcxMDYzNzcxMTM4.DUVPRA.AZMs74DE2hVbisseKO_YBoIE_Aw');