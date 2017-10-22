require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const messengerBot = require('facebook-messenger-bot');
const axios = require('axios');

const app = express();
const questionHandler = require('./questionHandler');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const controller = require('./controllers/controller');

const bot = new messengerBot.Bot(PAGE_ACCESS_TOKEN, "lazer_cat");

bot.on('message', async (message) => {
    const {sender, text, images, location} = message;
    if (text) {
        const {question, answers, elements, locationUI} = await questionHandler.onMessageReceived(text, sender.id);
        await sendQuestion(question, answers, sender, elements, locationUI);
    }

    if (images) {
        const {question, answers} = await questionHandler.onImagesReceived(images, sender.id);
        await sendQuestion(question, answers, sender);
        console.log(images);
    }

    if (location) {
        const {question, answers} = await questionHandler.onLocationReceived(location, sender.id);
        await sendQuestion(question, answers, sender);
        console.log(location)
    }
});

bot.on('postback', async (event, {sender, text, images}, data) => {
    if (data.hasOwnProperty('id')) {
        // Send user is interested
        let buttons = new messengerBot.Buttons();
        const message = new messengerBot.Elements();
        const senderProfile = await axios.get(`https://graph.facebook.com/v2.10/${sender.id}`, {headers: {'Authorization': `OAuth ${PAGE_ACCESS_TOKEN}`}});

        const {first_name: senderFirstName, last_name: senderLastName, profile_pic: senderProfilePic} = senderProfile.data;
        let name = `${senderFirstName} ${senderLastName}`;
        buttons.add({text: 'Interested!', url: `https://www.facebook.com/search/top/?q=${name}`});
        message.add({image: senderProfilePic, text: `${name} is interested in your doggo!`, buttons});
        bot.send(data.id, message);

        // Send contact info of doggo owner
        const profile = await axios.get(`https://graph.facebook.com/v2.10/${data.id}`, {headers: {'Authorization': `OAuth ${PAGE_ACCESS_TOKEN}`}});
        const {first_name: profileFirstName, last_name: profileLastName, profile_pic: profilePic} = profile.data;
        name = `${profileFirstName} ${profileLastName}`;

        const user = new messengerBot.Elements();
        buttons = new messengerBot.Buttons();
        buttons.add({text: 'Take me to the doggo', url: `https://www.facebook.com/search/top/?q=${name}`});
        user.add({image: profilePic, text: name, buttons});
        bot.send(sender.id, user);
    } else {
        const {question, answers, elements, locationUI} = await questionHandler.onMessageReceived(data, sender.id);
        await sendQuestion(question, answers, sender, elements, locationUI);
    }
});

bot.on('invalid-postback', message => console.error(message));

app.use('/facebook', bot.router());

app.get('/test', controller.test);
app.get('/createUser', controller.createUser);
app.get('/GetAvailableDoggos', controller.GetAvailableDoggos);

if (process.env.NODE_ENV !== 'test') {
    app.use(logger('dev'));
}

app.listen(3000);

async function sendQuestion(question, answers, sender, elements, location) {
    let buttons;
    if (!elements) {
        if (!!location){
            await bot.send(sender.id, location)
        } else {
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
        }
    } else {
        buttons = new messengerBot.Buttons();	
        const {ui, ids} = elements;	
        for (let i = 0; i < ui._elements.length; i++) {
            const id = ids[i];
            const element = ui._elements[i];
            console.log("element: " + element.text);		
            buttons.add({text: element.text, data: {id}});		
        }				
        const element = {text: "choose your doggo:", buttons};		
        const out = new messengerBot.Elements();
        out.add(element);		
        console.log("elements after: ");
        console.dir(ui  );

        await bot.send(sender.id, ui);
    }
}
