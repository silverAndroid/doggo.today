require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const messengerBot = require('facebook-messenger-bot');

const app = express();
const questionHandler = require('./questionHandler');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const controller = require('./controllers/controller');

const bot = new messengerBot.Bot(PAGE_ACCESS_TOKEN, "lazer_cat");

bot.on('message', async (message) => {
    const {sender, text, images, location} = message;
    if (text) {
        const {question, answers, elements} = await questionHandler.onMessageReceived(text, sender.id);
        await sendQuestion(question, answers, sender, elements);
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

bot.on('postback', async (event, {sender, text, images, location}, data) => {
    const {question, answers, elements} = await questionHandler.onMessageReceived(data, sender.id);
    await sendQuestion(question, answers, sender, elements);
});

bot.on('invalid-postback', message => console.error(message));

app.use('/facebook', bot.router());

//for testing
app.get('/getAllDoggos', controller.findAllDoggos);

if (process.env.NODE_ENV !== 'test') {
    app.use(logger('dev'));
}

app.listen(3000);

async function sendQuestion(question, answers, sender, elements) {
    let buttons;
    if (!elements) {
        if (!!answers) {
            buttons = new messengerBot.Buttons();
            answers.forEach(answer => {
                buttons.add({text: answer, data: answer});
            });
        }

        const element = {text: question};
        if (!!buttons) {
            element.buttons = buttons;
        }
        const out = new messengerBot.Elements();
        out.add(element); // add a card
        await bot.send(sender.id, out);
    } else {
        console.log("elements before: ")
        console.dir(elements);
        buttons = new messengerBot.Buttons();
        for (let element of elements._elements) {
            console.log("element: " + element.text);
            buttons.add({text: element.text, data: element.text});
        }

        const element = {text: "choose your doggo:"};
        const out = new messengerBot.Elements();
        if (!!buttons) {
            element.buttons = buttons;
        }
        out.add(element);
        console.log("elements after: ")
        console.dir(elements);
        await bot.send(sender.id, elements);
        // await bot.send(sender.id, out)
    }
}
