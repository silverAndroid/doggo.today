require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const messengerBot = require('facebook-messenger-bot');

const app = express();
const questionHandler = require('./questionHandler');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const bot = new messengerBot.Bot(PAGE_ACCESS_TOKEN, "lazer_cat");


bot.on('message', async (message) => {
    const { sender, text, images, location } = message;
    if (text) {
        console.log(text);
        const {question, answers} = await questionHandler.onMessageReceived(text, sender.id);
        const buttons = new messengerBot.Buttons();
        answers.forEach(answer => {
            buttons.add({text: answer, data: answer});
        });

        const out = new messengerBot.Elements();
        out.add({text: question, buttons}); // add a card
        await bot.send(sender.id, out);
    }

    if (images) {
        console.log(images);
    }

    if (location) {
        console.log(location)
    }
});

bot.on('postback', async (event, { sender, text, images, location }, data) => {
    console.log(data);
    const {question, answers} = await questionHandler.onMessageReceived(data, sender.id);
    const buttons = new messengerBot.Buttons();
    answers.forEach(answer => {
        buttons.add({text: answer, data: answer});
    });

    const out = new messengerBot.Elements();
    out.add({text: question, buttons}); // add a card
    await bot.send(sender.id, out);
});

bot.on('invalid-postback', message => console.error(message));

app.use('/facebook', bot.router());

if (process.env.NODE_ENV !== 'test') {
    app.use(logger('dev'));
}

app.listen(3000);
