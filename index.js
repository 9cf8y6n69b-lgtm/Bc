const { Client, GatewayIntentBits, SlashCommandBuilder,
        PermissionFlagsBits, REST, Routes } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = '1574830848597954690';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

const command = new SlashCommandBuilder()
  .setName('broadcast')
  .setDescription('إرسال رسالة لعدد محدد من الأعضاء على الخاص')
  .addStringOption(o => o.setName('message').setDescription('نص الرسالة').setRequired(true))
  .addIntegerOption(o => o.setName('count').setDescription('كم عضو يستلم؟').setMinValue(1).setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

client.once('ready', async () => {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [command.toJSON()] });
  console.log(`جاهز: ${client.user.tag}`);
});

client.on('interactionCreate', async i => {
  if (!i.isChatInputCommand() || i.commandName !== 'broadcast') return;

  const text = i.options.getString('message');
  const count = i.options.getInteger('count');
  await i.reply({ content: 'جاري الإرسال...', ephemeral: true });

  const members = await i.guild.members.fetch();
  const targets = [...members.values()].filter(m => !m.user.bot).slice(0, count);

  let sent = 0, failed = 0;
  for (const m of targets) {
    try {
      await m.send(text);
      sent++;
    } catch {
      failed++;
    }
    await sleep(1500);
  }

  await i.editReply(`تم ✅\nوصلت: ${sent}\nفشلت: ${failed}`);
});

client.login(TOKEN);
