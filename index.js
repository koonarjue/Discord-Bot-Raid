console.log("RUCARRIO เ ก");

require('dotenv').config();

const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

// ===== Express (กัน Render sleep) =====
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(3000, () => {
  console.log('Web server running');
});

// ===== Discord Client =====
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);


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
    Ranger: [],
    Sorceress: [],
    Berserker: [],
    Tamer: [],
    Musa: [],
    Maehwa: [],
    Ninja: [],
    Kunoichi: [],
    DarkKnight: [],
    Striker: [],
    Mystic: [],
    Lahn: [],
    Archer: [],
    Guardian: [],
    Hashashin: [],
    Nova: [],
    Sage: [],
    Corsair: [],
    Drakania: [],
    Woosa: [],
    Maegu: [],
    Scholar: [],
    Deadeye: [],
    Dosa: [],
  },

  Flex: {
    Warrior: [],
    Ranger: [],
    Sorceress: [],
    Berserker: [],
    Tamer: [],
    Musa: [],
    Maehwa: [],
    Ninja: [],
    Kunoichi: [],
    DarkKnight: [],
    Striker: [],
    Mystic: [],
    Lahn: [],
    Archer: [],
    Guardian: [],
    Hashashin: [],
    Nova: [],
    Sage: [],
    Corsair: [],
    Drakania: [],
    Woosa: [],
    Maegu: [],
    Scholar: [],
    Deadeye: [],
    Dosa: [],
  },

  Caster: {
    Valkyrie: [],
    Wizard: [],
    Witch: [],
  },

  Shai: {
    Shai: [],
  },

  Shotcaller: {
    shotcaller: [],
  },

  Engineer: {
    FireTower: [],
    Hwacha: [],
    Elephant: [],
    Flag: [],

  },

  Bench: {
    Rucarrio: [],
  },

};
const roleLimits = {
  Main: 16,
  Flex: 5,
  Caster: 2,
  Shai: 2,
  Shotcaller: 1,
  Engineer: 5,
  Bench: 999
}

// const maxSlots = {
//   Main: 16,
//   Flex: 5,
//   Caster: 2,
//   Shai: 2,
//   Shotcaller: 1,
//   Engineer: 5,
//   Bench: 999
// };

const roleSelect = new ActionRowBuilder().addComponents(
  new StringSelectMenuBuilder()
    .setCustomId('select_role')
    .setPlaceholder('เลือกตำแหน่ง')
    .addOptions([
      { label: 'Main', value: 'Main' },
      { label: 'Flex', value: 'Flex' },
      { label: 'Caster', value: 'Caster' },
      { label: 'Shai', value: 'Shai' },
      { label: 'Shotcaller', value: 'Shotcaller' },
      { label: 'Engineer', value: 'Engineer' },
      { label: 'Bench', value: 'Bench' },
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
      
     if (!isLeader(interaction.member)) {
        return interaction.reply({
          content: '❌ ต้องมี Role Leader เท่านั้น',
          ephemeral: true
        });
      }
      
      closeTimestamp = getCloseTimestamp();
      isClosed = false;

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          embeds: [createEmbed()],
          components: [roleSelect]
        });
      } else {
        await interaction.reply({
          embeds: [createEmbed()],
          components: [roleSelect]
        });
      }

    }
    const msg = await interaction.fetchReply(); // ดึง message จริง
    eventMessage = msg;

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
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: `คุณเลือก ${role} กรุณาเลือกอาชีพ`,
          components: [createClassSelect(role)],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: `คุณเลือก ${role} กรุณาเลือกอาชีพ`,
          components: [createClassSelect(role)],
          ephemeral: true
        });
      }
    }
    // ===== เลือกอาชีพ =====
    if (interaction.customId.startsWith('select_class_')) {
      const role = interaction.customId.split('_')[2];
      const job = interaction.values[0];
      const userId = interaction.user.id;
      // เช็คว่าคนนี้อยู่ role นี้อยู่แล้วไหม
      if (eventData[role][job].includes(userId)) {
        return interaction.reply({
          content: `⚠ คุณสมัคร ${role} - ${job} ไปแล้ว`,
          flags: 64
        });
      }

      // นับจำนวนใน role
      const totalInRole = Object.values(eventData[role])
        .flat()
        .length;

      const limit = roleLimits[role];

      // ถ้าเต็ม → แจ้งเตือน
      if (limit && totalInRole >= limit) {
        return interaction.reply({
          content: `❌ ${role} เต็มแล้ว! (${totalInRole}/${limit})`,
          flags: 64
        });
      }

      // ถ้ายังไม่เต็มค่อยสมัคร
      removeUserFromAllRoles(userId);
      eventData[role][job].push(userId);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: `✅ สมัคร ${role} - ${job} สำเร็จ`,
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: `✅ สมัคร ${role} - ${job} สำเร็จ`,
          ephemeral: true
        });
      }
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
    .setTitle('📢 Raid Sign-Up')
    .setDescription(
      `🕒 ปิดรับสมัคร: <t:${closeTimestamp}:F>\n` +
      `⏳ เหลือเวลา: <t:${closeTimestamp}:R>\n` +
      `                        \n` +
      `                        \n` +
      `NODE WAR 30\n` +
      `Balenos Or Serendia`



    );

  // ===== MAIN =====
  let MainText = '';
  let MainCount = 0;

  for (const job in eventData.Main) {
    const icon = getJobIcon(job);

    eventData.Main[job].forEach(userId => {
      MainText += `${icon} <@${userId}>\n`;
      MainCount++;
    });
  }

  ///////////////////////////////////////////////////
  // ===== FLEX =====
  let FlexText = '';
  let FlexCount = 0;

  for (const job in eventData.Flex) {
    const icon = getJobIcon(job);

    eventData.Flex[job].forEach(userId => {
      FlexText += `${icon} <@${userId}>\n`;
      FlexCount++;
    });
  }


  ///////////////////////////////////////////////////
  // ===== Caster =====
  let CasterText = '';
  let CasterCount = 0;

  for (const job in eventData.Caster) {
    const icon = getJobIcon(job);

    eventData.Caster[job].forEach(userId => {
      CasterText += `${icon} <@${userId}>\n`;
      FlexCount++;
    });
  }


  // ===== SHAI =====
  let ShaiText = '';
  let ShaiCount = 0;

  for (const job in eventData.Shai) {
    const icon = getJobIcon(job);

    eventData.Shai[job].forEach(userId => {
      ShaiText += `${icon} <@${userId}>\n`;
      ShaiCount++;
    });
  }

  // ===== Shotcaller =====
  let ShotcallerText = '';
  let ShotcallerCount = 0;
  for (const job in eventData.Shotcaller) {
    const icon = getJobIcon(job);

    eventData.Shotcaller[job].forEach(userId => {
      ShotcallerText += `${icon} <@${userId}>\n`;
      ShotcallerCount++;
    });
  }

  // ===== Engineer =====
  let EngineerText = '';
  let EngineerCount = 0;
  for (const job in eventData.Engineer) {
    const icon = getJobIcon(job);

    eventData.Engineer[job].forEach(userId => {
      EngineerText += `${icon} <@${userId}>\n`;
      EngineerCount++;
    });
  }



  // ===== Bench =====
  let BenchText = '';
  let BenchCount = 0;

  for (const job in eventData.Bench) {
    const icon = getJobIcon(job);

    eventData.Bench[job].forEach(userId => {
      BenchText += `${icon} <@${userId}>\n`;
      BenchCount++;
    });
  }

  embed.addFields(
    {
      name: `⚔ Main (${MainCount}/${roleLimits.Main})`,
      value: MainText || '-',
      inline: true
    },
    {
      name: `🔥 Flex (${FlexCount}/${roleLimits.Flex})`,
      value: FlexText || '-',
      inline: true
    },
    {
      name: `🎙 Caster (${CasterCount}/${roleLimits.Caster})`,
      value: CasterText || '-',
      inline: true
    }
  );
  embed.addFields(
    {
      name: `🎙 Shai (${ShaiCount}/${roleLimits.Shai})`,
      value: ShaiText || '-',
      inline: true
    },
    {
      name: `🎙 Shotcaller (${ShotcallerCount}/${roleLimits.Shotcaller})`,
      value: ShotcallerText || '-',
      inline: true
    },
    {
      name: `🎙 Engineer (${EngineerCount}/${roleLimits.Engineer})`,
      value: EngineerText || '-',
      inline: true
    }
  );
  embed.addFields(
    {
      name: `🎙 Bench (${BenchCount}/${roleLimits.Bench})`,
      value: BenchText || '-',
      inline: true
    },
  );

  /////////////////////////นับคน จับ bench
  // ===== คำนวณ Total (ไม่นับ Bench รวม) =====

  let totalMainRoles = 0;

  for (const role in eventData) {
    if (role === 'Bench') continue;

    totalMainRoles += Object.values(eventData[role])
      .flat()
      .length;
  }

  const totalBench = Object.values(eventData.Bench)
    .flat()
    .length;


  embed.addFields({
    name: '━━━━━━━━━━━━━━━━',
    value: `👥 **Total = ${totalMainRoles} (+${totalBench} Bench)**`,
    inline: false
  });








  return embed;   // ✅ เพิ่มบรรทัดนี้

} // ← ปิดฟังก์ชัน

function getJobIcon(job) {
  switch (job) {

    case 'Warrior': return '⚔️';
    case 'Ranger': return '🏹';
    case 'Sorceress': return '🌑';
    case 'Berserker': return '🪓';
    case 'Tamer': return '🐾';
    case 'Musa': return '🗡️';
    case 'Maehwa': return '🌸';
    case 'Valkyrie': return '🛡️';
    case 'Wizard': return '🪄';
    case 'Witch': return '🔮';
    case 'Ninja': return '🥷';
    case 'Kunoichi': return '🌺';
    case 'DarkKnight': return '⚫';
    case 'Striker': return '🥊';
    case 'Mystic': return '🌊';
    case 'Lahn': return '🩸';
    case 'Archer': return '🎯';
    case 'Shai': return '🎵';
    case 'Guardian': return '🧊';
    case 'Hashashin': return '🏜️';
    case 'Nova': return '❄️';
    case 'Sage': return '📜';
    case 'Corsair': return '🏴‍☠️';
    case 'Drakania': return '🐉';
    case 'Woosa': return '🌧️';
    case 'Maegu': return '🦊';
    case 'Scholar': return '📚';
    case 'Deadeye': return '🔫';
    case 'Dosa': return '☯️';
    case 'Wukong': return '🐒';
    case 'Seraph': return '👼';

    default: return '🔹';
  }
}


function formatSimple(arr) {

  // ถ้าไม่ใช่ array → กันพังทันที
  if (!Array.isArray(arr)) {
    console.log("formatSimple received non-array:", arr);
    return '-';
  }

  if (arr.length === 0) return '-';

  return arr.map(id => `<@${id}>`).join('\n');
}
