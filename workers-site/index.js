import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', event => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event) {
  const url = new URL(event.request.url);
  const pathname = url.pathname;

  // Проверка на наличие двойного слэша в URL
  if (pathname.includes('//')) {
    return new Response('404 - Page Not Found', { status: 404 });
  }

  // Обработка запроса от Telegram
  if (pathname === '/webhook') {
    return await handleWebhook(event);
  }

  try {
    const response = await getAssetFromKV(event);
    return response;
  } catch (e) {
    return new Response('404 - Page Not Found', { status: 404 });
  }
}

// Функция для обработки webhook запросов от Telegram
async function handleWebhook(event) {
  const update = await event.request.json(); // Получаем данные обновления от Telegram
  console.log('Received update:', update); // Логируем полученные обновления

  if (update.message) {
    const chatId = update.message.chat.id;
    const firstName = update.message.from.first_name;
    const lastName = update.message.from.last_name;
    console.log('Chat ID:', chatId, 'Text:', update.message.text); // Логируем Chat ID и текст сообщения

    // Формируем приветственное сообщение
    const welcomeMessage = `✨ Добро пожаловать, ${firstName} ${lastName}! ✨

` +
                           `Вас приятно удивит наш салон ресниц BOSSY! 🌟 ` +
                           `Мы предлагаем лучшие услуги по наращиванию и уходу за ресницами, ` +
                           `чтобы подчеркнуть вашу естественную красоту.

` +
                           `Для записи на процедуру, пожалуйста, нажмите кнопку "Записаться"!`;

    // Обработка команды /start
    if (update.message.text === '/start') {
      return await sendMessage(chatId, welcomeMessage, [
        [{ text: "Записаться", url: "https://n1302516.yclients.com" }] // Измените на ваш URL
      ]);
    }
  } else {
    console.log('Received non-message update, ignoring.'); // Логируем ненужные обновления
  }

  return new Response('OK', { status: 200 }); // Возвращаем успешный статус
}

// Функция для отправки сообщений в Telegram
async function sendMessage(chatId, text, replyMarkup) {
  const userToken = USER_TOKEN;  // Получаем токен из переменной окружения

  const url = `https://api.telegram.org/bot${userToken}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      reply_markup: {
        inline_keyboard: replyMarkup
      }
    })
  });

  return response; // Возвращаем ответ от API Telegram
}
