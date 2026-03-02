console.log("RUCARRIO เ ก ")
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,

} = require('discord.js');

let eventMessage = null;
let closeTimestamp = null;
let isClosed = false;

function getCloseTimestamp() {
  const now = new Date();

  const close = new Date();
  close.setHours(20, 0, 0, 0); // 20:00

  // ถ้าเลย 20:00 แล้ว → ไปพรุ่งนี้
  if (now > close) {
    close.setDate(close.getDate() + 1);
  }

  return Math.floor(close.getTime() / 1000);
}



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
  Main: {
    Warrior: [],
    Wizard: [],
    Maehwa: []
  },
  Flex: {
    Warrior: [],
    Wizard: []
  },
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

const roleSelect = new ActionRowBuilder().addComponents(
  new StringSelectMenuBuilder()
    .setCustomId('select_role')
    .setPlaceholder('เลือกตำแหน่ง')
    .addOptions([
      { label: 'Main', value: 'Main' },
      { label: 'Flex', value: 'Flex' },
    ])
);
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
        components: [roleSelect],
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
    // 🔘 DROPDOWN
    // =========================
  if (interaction.isStringSelectMenu()) {
    // ===== เลือกตำแหน่ง =====
    if (interaction.customId === 'select_role') {
      const role = interaction.values[0];
      return interaction.reply({
        content: `คุณเลือก ${role} กรุณาเลือกอาชีพ`,
        components: [createClassSelect(role)],
        ephemeral: true
      });
    }
      // ===== เลือกอาชีพ =====
    if (interaction.customId.startsWith('select_class_')) {
      const role = interaction.customId.split('_')[2];
      const job = interaction.values[0];
      const userId = interaction.user.id;
      removeUserFromAllRoles(userId);
      eventData[role][job].push(userId);
      await interaction.reply({
        content: `✅ สมัคร ${role} - ${job} สำเร็จ`,
        ephemeral: true
      });
      if (eventMessage) {
        await eventMessage.edit({
          embeds: [createEmbed()],
          components: [roleSelect]
        });
      }
    }
    ////จบ เลือกอาชีพ
  }
  //จบ เลือกตำแหน่ง



    ///
  function createClassSelect(role) {

  const jobs = Object.keys(eventData[role]);

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`select_class_${role}`)
      .setPlaceholder('เลือกอาชีพ')
      .addOptions(
        jobs.map(job => ({
          label: job,
          value: job
        }))
      )
    );
  }

    function removeUserFromAllRoles(userId) {
    
      for (const role in eventData) {
      
        if (typeof eventData[role] === 'object' && !Array.isArray(eventData[role])) {
        
          for (const job in eventData[role]) {
            eventData[role][job] =
              eventData[role][job].filter(id => id !== userId);
          }
        
        } else {
        
          eventData[role] =
            eventData[role].filter(id => id !== userId);
        
        }
      }
    }

});
    
    function createEmbed() {

      const embed = new EmbedBuilder()
        .setTitle('📢 Raid Sign-Up');

      // .setDescription(
      //   `🕒 ปิดรับสมัคร: <t:${closeTimestamp}:F>\n` +
      //   `⏳ เหลือเวลา: <t:${closeTimestamp}:R>`
      // )

      // ===== Main =====
      for (const job in eventData.Main) {
        embed.addFields({
          name: `Main - ${job} (${eventData.Main[job].length})`,
          value: format(eventData.Main[job])
        });
      }

      // ===== Flex =====
      for (const job in eventData.Flex) {
        embed.addFields({
          name: `Flex - ${job} (${eventData.Flex[job].length})`,
          value: format(eventData.Flex[job])
        });
      }

      // ===== Role ปกติ =====
      embed.addFields(
        { name: `Caster (${eventData.Caster.length})`, value: format(eventData.Caster) },
        { name: `Shai (${eventData.Shai.length})`, value: format(eventData.Shai) },
        { name: `Shotcaller (${eventData.Shotcaller.length})`, value: format(eventData.Shotcaller) },
        { name: `Engineer (${eventData.Engineer.length})`, value: format(eventData.Engineer) },
        { name: `Bench (${eventData.Bench.length})`, value: format(eventData.Bench) },
      );

      return embed;
    }

    function format(arr) {
      if (arr.length === 0) return '-';
      return arr.map(id => `<@${id}>`).join('\n');
    }

    client.login('MTQ3NzM2ODg5MDkyNDMzOTM2MQ.GIf4nH.QdUtpWOj9tSckbzsrk5OND4LrpmaRPj_jYySkE');