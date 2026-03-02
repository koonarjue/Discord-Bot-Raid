const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [

  // ===== /event =====
  new SlashCommandBuilder()
    .setName('event')
    .setDescription('สร้าง Raid Event'),

  // ===== /kickwar =====
  new SlashCommandBuilder()
    .setName('kickwar')
    .setDescription('Leader เตะคนออก')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('เลือกคนที่จะเตะ')
        .setRequired(true)
    ),

  // ===== /add =====
  new SlashCommandBuilder()
    .setName('add')
    .setDescription('Leader สมัครคนเข้าวอ')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('เลือกคน')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('role')
        .setDescription('เลือกตำแหน่ง')
        .setRequired(true)
        .addChoices(
          { name: 'Main', value: 'Main' },
          { name: 'Flex', value: 'Flex' },
          { name: 'Caster', value: 'Caster' },
          { name: 'Shai', value: 'Shai' },
          { name: 'Shotcaller', value: 'Shotcaller' },
          { name: 'Engineer', value: 'Engineer' },
          { name: 'Bench', value: 'Bench' },
        )
    ),

].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken('MTQ3NzM2ODg5MDkyNDMzOTM2MQ.GIf4nH.QdUtpWOj9tSckbzsrk5OND4LrpmaRPj_jYySkE');

rest.put(
  Routes.applicationCommands('1477368890924339361'),
  { body: commands },
).then(() => console.log('Slash command registered!'))
 .catch(console.error);