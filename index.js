const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const {Bot} = require('facebook-messenger-bot');

const app = express();

const bot = new Bot('117457765682453', 'b7f1d28559fa109bfe1d00080b246801');

bot.on('message', async message => {
    const {sender} = message;
    await sender.fetch('first_name');

    const out = new Elements();
    out.add({text: `hey ${sender.first_name}, you're a good boy!`});

    await bot.send(sender.id, out);
});

app.use(bodyParser.json());

if (process.env.NODE_ENV !== 'test') {
    app.use(logger('dev'));
}

app.use('/facebook', bot.router());
app.listen(3000);
