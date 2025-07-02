import TelegramBot, { Message } from 'node-telegram-bot-api';
import { AuthServiceName } from '../../shared/utils';

const handleStartCommand = (msg: Message, bot: TelegramBot) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from?.id.toString();
    const redirectUrl = `${process.env.REDIRECT_SCHEME}?service_id=${telegramUserId}&service_name=${AuthServiceName.TELEGRAM}`;

    const authButton = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '🔑 Авторизоваться',
                        url: redirectUrl,
                    },
                ],
            ],
        },
    };

    bot.sendMessage(chatId, 'Нажмите для авторизации:', authButton);
};

const startBot = () => {
    const bot = new TelegramBot(process.env.BOT_TOKEN as string, { polling: true });

    bot.on('message', (msg) => {
        if (msg.text && msg.text === '/start') {
            handleStartCommand(msg, bot);
        }
    });

    console.log('Bot has been started');
};

export { startBot };
