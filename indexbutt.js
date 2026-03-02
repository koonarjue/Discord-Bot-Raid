let eventMessageId = null;
let eventEndTime = null;
let countdownInterval = null;
let eventClosed = false;




const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

let eventMessage = null;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

const buttonsRow1 = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('Main').setLabel('Main').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId('Flex').setLabel('Flex').setStyle(ButtonStyle.Success),
  new ButtonBuilder().setCustomId('Caster').setLabel('Caster').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('Shai').setLabel('Shai').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId('Shotcaller').setLabel('Shotcaller').setStyle(ButtonStyle.Danger),
);

const buttonsRow2 = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('Engineer').setLabel('Engineer').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('Bench').setLabel('Bench').setStyle(ButtonStyle.Danger),
  new ButtonBuilder().setCustomId('Leave').setLabel('Leave').setStyle(ButtonStyle.Secondary),
);

const eventData = {
  Main: [],
  Flex: [],
  Caster: [],
  Shai: [],
  Shotcaller: [],
  Engineer: [],
  Bench: []
};

const maxSlots = {
  Main: 16,
  Flex: 5,
  Caster: 2,
  Shai: 2,
  Shotcaller: 1,
  Engineer: 5,
  Bench: 999
};

function isLeader(member) {
  return member.roles.cache.some(role => role.name === 'Officer');
}

client.once('clientReady', () => {
  console.log('Bot is online!');
});

client.on('interactionCreate', async interaction => {

  // =========================
  // 🎯 SLASH COMMAND
  // =========================
  if (interaction.isChatInputCommand()) {

    // ===== /event =====
    if (interaction.commandName === 'event') {

      const msg = await interaction.reply({
        embeds: [createEmbed()],
        components: [buttonsRow1, buttonsRow2],
        fetchReply: true
      });

      eventMessage = msg;
      return;
    }

    // ===== /kickwar =====
    if (interaction.commandName === 'kickwar') {

      if (!isLeader(interaction.member)) {
        return interaction.reply({
          content: '❌ ต้องมี Role Leader เท่านั้น',
          ephemeral: true
        });
      }

      const user = interaction.options.getUser('user');

      for (const role in eventData) {
        const index = eventData[role].indexOf(user.id);
        if (index !== -1) {
          eventData[role].splice(index, 1);
        }
      }

      if (eventMessage) {
        await eventMessage.edit({
          embeds: [createEmbed()],
          components: [buttonsRow1, buttonsRow2]
        });
      }

      return interaction.reply({
        content: `✅ เตะ ${user.tag} แล้ว`,
        ephemeral: true
      });
    }

    // ===== /add =====
    if (interaction.commandName === 'add') {

      if (!isLeader(interaction.member)) {
        return interaction.reply({
          content: '❌ ต้องมี Role Leader เท่านั้น',
          ephemeral: true
        });
      }

      const user = interaction.options.getUser('user');
      const role = interaction.options.getString('role');

      // ===== เช็คว่า user อยู่ role ไหนอยู่แล้ว =====
      let currentRole = null;

      for (const r in eventData) {
        if (eventData[r].includes(user.id)) {
          currentRole = r;
          break;
        }
      }

      // ===== ถ้าอยู่ role เดิม =====
      if (currentRole === role) {
        return interaction.reply({
          content: `⚠️ ${user.tag} อยู่ใน ${role} อยู่แล้ว`,
          ephemeral: true
        });
      }

      // ===== ถ้าอยู่ role อื่น → เอาออกก่อน =====
      if (currentRole) {
        eventData[currentRole] =
          eventData[currentRole].filter(id => id !== user.id);
      }

      // ===== เช็คเต็ม =====
      if (eventData[role].length >= maxSlots[role]) {
        return interaction.reply({
          content: `❌ ${role} เต็ม`,
          ephemeral: true
        });
      }

      // ===== เพิ่มเข้า role ใหม่ =====
      eventData[role].push(user.id);

      // ===== อัปเดท embed =====
      if (eventMessage) {
        await eventMessage.edit({
          embeds: [createEmbed()],
          components: [buttonsRow1, buttonsRow2]
        });
      }

      return interaction.reply({
        content: `✅ เพิ่ม ${user.tag} เข้า ${role}`,
        ephemeral: true
      });
    }

  }


  // =========================
  // 🔘 BUTTON
  // =========================
  if (interaction.isButton()) {

    const role = interaction.customId;
    const userId = interaction.user.id;

    // ===== Leave =====
    if (role === 'Leave') {

      let removed = false;

      for (const r in eventData) {
        const index = eventData[r].indexOf(userId);
        if (index !== -1) {
          eventData[r].splice(index, 1);
          removed = true;
        }
      }

      if (!removed) {
        return interaction.reply({
          content: '❌ คุณยังไม่ได้ลงทะเบียน',
          ephemeral: true
        });
      }

      return interaction.update({
        embeds: [createEmbed()],
        components: [buttonsRow1, buttonsRow2]
      });
    }

    // ===== Auto Remove from old role =====
    for (const r in eventData) {
      const index = eventData[r].indexOf(userId);
      if (index !== -1) {
        eventData[r].splice(index, 1);
      }
    }

    // ===== Check Full =====
    if (eventData[role].length >= maxSlots[role]) {

      if (eventData.Bench.length < maxSlots.Bench) {
        eventData.Bench.push(userId);

        await interaction.update({
          embeds: [createEmbed()],
          components: [buttonsRow1, buttonsRow2]
        });

        return interaction.followUp({
          content: `⚠️ ${role} เต็มแล้ว คุณถูกย้ายไป Bench`,
          ephemeral: true
        });
      }

      return interaction.reply({
        content: `❌ ${role} เต็ม และ Bench ก็เต็ม`,
        ephemeral: true
      });
    }

    // ===== Add normally =====
    eventData[role].push(userId);

    return interaction.update({
      embeds: [createEmbed()],
      components: [buttonsRow1, buttonsRow2]
    });
  }

});

///

function createEmbed() {
  return new EmbedBuilder()
    .setTitle('📢 Raid Sign-Up')
    .addFields(
      { name: `Main (${eventData.Main.length}/${maxSlots.Main})`, value: format(eventData.Main) },
      { name: `Flex (${eventData.Flex.length}/${maxSlots.Flex})`, value: format(eventData.Flex) },
      { name: `Caster (${eventData.Caster.length}/${maxSlots.Caster})`, value: format(eventData.Caster) },
      { name: `Shai (${eventData.Shai.length}/${maxSlots.Shai})`, value: format(eventData.Shai) },
      { name: `Shotcaller (${eventData.Shotcaller.length}/${maxSlots.Shotcaller})`, value: format(eventData.Shotcaller) },
      { name: `Engineer (${eventData.Engineer.length}/${maxSlots.Engineer})`, value: format(eventData.Engineer) },
      { name: `Bench (${eventData.Bench.length}/${maxSlots.Bench})`, value: format(eventData.Bench) },
    );
}

function format(arr) {
  if (arr.length === 0) return '-';
  return arr.map(id => `<@${id}>`).join('\n');
}


client.login('MTQ3NzM2ODg5MDkyNDMzOTM2MQ.GIf4nH.QdUtpWOj9tSckbzsrk5OND4LrpmaRPj_jYySkE');