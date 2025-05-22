import TelegramBot, { Message } from 'node-telegram-bot-api';

const buttonMessages: Record<number, number> = {};

const handleStartCommand = (msg: Message, bot: TelegramBot) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from?.id.toString();
    const redirectUrl = `${process.env.REDIRECT_SCHEME}?user_id=${telegramUserId}`;

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

    // Если уже есть сообщение с кнопкой - редактируем его
    if (buttonMessages[chatId]) {
        bot.editMessageText('Нажмите для авторизации:', {
            chat_id: chatId,
            message_id: buttonMessages[chatId],
            reply_markup: authButton.reply_markup,
        }).catch(console.error);
    } else {
        // Иначе отправляем новое сообщение
        bot.sendMessage(chatId, 'Нажмите для авторизации:', authButton).then((sentMsg) => {
            buttonMessages[chatId] = sentMsg.message_id; // Сохраняем ID сообщения
        });
    }
};

const startBot = () => {
    const bot = new TelegramBot(process.env.BOT_TOKEN as string, { polling: true });

    bot.on('message', (msg) => {
        if (msg.text === '/start') return;
        if (!msg.text || msg.text === '/start') handleStartCommand(msg, bot);
    });

    bot.onText(/\/start/, (msg) => handleStartCommand(msg, bot));
};

export { startBot };
