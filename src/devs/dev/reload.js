const Command = require('../../structures/Command')
const { ButtonStyle, EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder } = require('discord.js');
const fs = require('node:fs');

module.exports = class Reload extends Command {
    constructor(client) {
        super(client, {
            name: 'reload',
            description: {
                content: 'Reloads a specific file or command across all shards.',
                usage: '[command/all/file] [command]',
                examples: ['ping', 'all', 'file'],
            },
            args: false,
            permissions: {
                dev: true,
            },
        });
    }
    async run(client, message, args) {
        const { commands } = message.client;

        if (args[0] === 'all') {
            client.cluster.broadcastEval(reloadCommand, { context: { commandsToReload: [] } });
            return message.reply(`${client.config.emojis.success} Reloaded all **${commands.size}** command.`);
        }
        else if (!args[0] || args[0] === 'file') {
            let hasReceivedIndexes = false;

            let currentDir = './src';
            let dir = currentDir.split('/').slice(currentDir.split('/').length - 1);
            const files = fs.readdirSync(currentDir).filter((file) => {
                return fs.statSync(currentDir + '/' + file).isFile();
            });
            const folders = fs.readdirSync(currentDir).filter((file) => {
                return fs.statSync(currentDir + '/' + file).isDirectory();
            });
            let dirs = [...folders, ...files];

            let selectMenuArray = [];
            for (let i = 0; i < dirs.length; i++) {
                const dir = dirs[i];
                selectMenuArray.push({
                    label: dir,
                    value: i.toString(),
                });
            }
            let selectMenuRow = new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                        .setCustomId(`SELECT_MENU`)
                        .setPlaceholder('Nothing selected')
                        .addOptions(selectMenuArray),
                );

            let buttonRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`CANCEL_BUTTON`)
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel('Cancel'),
                );

            const embed = new EmbedBuilder()
                .setAuthor({ name: 'Reload File', iconURL: client.user.displayAvatarURL() })
                .setColor(client.config.color)
                .setDescription(`📂 **${dir}**` + folders.map(dir => `\n- 📁 ${dir} `).join('') + files.map(dir => `\n- 📄 ${dir} `).join(''));
            const msg = await message.reply({ embeds: [embed], components: [selectMenuRow, buttonRow] });

            const buttonCollector = msg.createMessageComponentCollector({ componentType: 'BUTTON', time: 15000 });
            buttonCollector.on('collect', async interaction => {
                if (interaction.user.id != message.author.id) return;
                if (interaction.customId === `CANCEL_BUTTON`) {
                    hasReceivedIndexes = true;
                    return interaction.message.delete();
                }
                else if (interaction.customId === `BACK_BUTTON`) {
                    currentDir = currentDir.split('/').slice(0, -1).join('/');
                    dir = currentDir.split('/').slice(currentDir.split('/').length - 1);
                    await updateMessage();
                    await interaction.update({ embeds: [embed], components: [selectMenuRow, buttonRow] });
                }
            });
            const selectMenuCollector = msg.createMessageComponentCollector({ componentType: 3, time: 15000 });
            selectMenuCollector.on('collect', async interaction => {
                if (interaction.user.id != message.author.id) return;
                if (interaction.customId != `SELECT_MENU`) return;
                if (interaction.member.id != message.author.id) return;
                hasReceivedIndexes = true;

                dir = dirs[interaction.values.map(s => parseInt(s))];
                currentDir += `/${dir}`;

                if (fs.statSync(currentDir).isFile()) {
                    const command = client.commands.get(dir.replaceAll('.js', '').toLowerCase());
                    if (command && currentDir.includes('commands/')) client.cluster.broadcastEval(reloadCommand, { context: { commandsToReload: [command] } });
                    else client.cluster.broadcastEval(reloadFile, { context: { fileToReload: `${process.cwd()}/${currentDir.replaceAll('./', '')}` } });

                    await interaction.update({ components: [] });
                    return message.reply(`Reloaded file: \`${dir}\``);
                }

                await updateMessage();
                await interaction.update({ embeds: [embed], components: [selectMenuRow, buttonRow] });
            });

            async function updateMessage() {
                const files = fs.readdirSync(currentDir).filter((file) => {
                    return fs.statSync(currentDir + '/' + file).isFile();
                });
                const folders = fs.readdirSync(currentDir).filter((file) => {
                    return fs.statSync(currentDir + '/' + file).isDirectory();
                });
                dirs = [...folders, ...files];

                embed.setDescription(`📂 **${dir}**` + folders.map(dir => `\n- 📁 ${dir} `).join('') + files.map(dir => `\n- 📄 ${dir} `).join(''));
                selectMenuArray = [];
                for (let i = 0; i < dirs.length; i++) {
                    const dir = dirs[i];
                    selectMenuArray.push({
                        label: dir,
                        value: i.toString(),
                    });
                }

                selectMenuRow = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId(`SELECT_MENU`)
                            .setPlaceholder('Nothing selected')
                            .addOptions(selectMenuArray),
                    );

                buttonRow = new ActionRowBuilder();

                if (currentDir != './src') buttonRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`${message.addOptionsid}:BACK_BUTTON`)
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel('Back'),
                );

                buttonRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`CANCEL_BUTTON`)
                        .setStyle(ButtonStyle.Danger)
                        .setLabel('Cancel')
                        .setEmoji('🗑️'),
                );
            }

            setTimeout(() => {
                if (!hasReceivedIndexes) return msg.edit('Selection expired.');
            }, 30000);
        }
        else if (args[0] === 'command' || args[0]) {
            const commandStr = args[1] ? args[1] : args[0];
            if (!commands.has(commandStr)) return message.reply('That\'s not a valid command!');
            const command = commands.get(commandStr);

            try {
                client.cluster.broadcastEval(reloadCommand, { context: { commandsToReload: [command] } });
                return message.reply(`Reloaded the **${command.file.name}** command.`);
            }
            catch (e) {
                return message.reply(`An error occurred while reloading the command: \n\`\`\`${e.message}\`\`\``);
            }
        }

        function reloadCommand(c, { commandsToReload }) {
            c.reloadCommands(commandsToReload);
        }

        function reloadFile(c, { fileToReload }) {
            c.reloadFile(fileToReload);
        }
    }
}