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
        const {question, answers} = await questionHandler.onMessageReceived(text, sender.id);
        await sendQuestion(question, answers, sender);
    }

    if (images) {
        const {question, answers} = await questionHandler.onImagesReceived(images, sender.id);
        await sendQuestion(question, answers, sender);
        console.log(images);
    }

    if (location) {
        console.log(location)
    }
});

bot.on('postback', async (event, { sender, text, images, location }, data) => {
    const {question, answers} = await questionHandler.onMessageReceived(data, sender.id);
    const buttons = new messengerBot.Buttons();
    if (!!answers) {
        for (let answer of answers) {
            buttons.add({text: answer, data: answer});
        }
    }

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

async function sendQuestion(question, answers, sender) {
    const buttons = new messengerBot.Buttons();
    if (!!answers) {
        for (let answer of answers) {
            buttons.add({text: answer, data: answer});
        }
    }

    const out = new messengerBot.Elements();
    out.add({text: question, buttons}); // add a card
    await bot.send(sender.id, out);
}
