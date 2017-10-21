const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const request = require('request')
const app = express();
const messengerBot = require('facebook-messenger-bot');
const PAGE_ACCESS_TOKEN = 'EAABq08RmTRUBAKG5JwtXGbqjPpQm2rXqdYbaCLmqVb9Njhj24mIgKkT0ZCWlZBMERI7NeD0sOd3ZAsvPftyx58hbQvUxaef1CotXsZCFJLgoZC5ZB7XtrYiOMxJX9RdZBgqqKWYcFs26VzuG4JpSctB9boKIjDNfdWhPjst0KxRHDvy4ArOagfs'

const bot = new messengerBot.Bot(PAGE_ACCESS_TOKEN, "lazer_cat");


bot.on('message', async message => {
    const {sender} = message;
    await sender.fetch('first_name,profile_pic', true);
    const {text, images, location} = message;

  	if (text) {
        console.log(text); 
		buttons = new messengerBot.Buttons();
		buttons.add({text: 'Google', url: 'http://google.com'});
		buttons.add({text: 'Yahoo', url: 'http://yahoo.com'});

		out = new messengerBot.Elements();
	    out.add({text: 'search engines', subtext: 'click to get redirected', buttons}); // add a card
	  	await bot.send(sender.id, out);     
    }
 
    if (images) {
        console.log(images);    
    }

    if (location) {
    	console.log(location)
    }
});
 
app.use('/facebook', bot.router());


app.use(bodyParser.json());

if (process.env.NODE_ENV !== 'test') {
    app.use(logger('dev'));
}


// // Creates the endpoint for our webhook
// app.post('/webhook', (req, res) => {
//  console.log(req.body);
//   let body = req.body;

//   // Checks this is an event from a page subscription
//   if (body.object === 'page') {

//     // Iterates over each entry - there may be multiple if batched
//     body.entry.forEach(function(entry) {

//        // Gets the body of the webhook event
// 	  let webhook_event = entry.messaging[0];
// 	  console.log(webhook_event);


// 	  // Get the sender PSID
// 	  let sender_psid = webhook_event.sender.id;
// 	  console.log('Sender PSID: ' + sender_psid);

// 	  // Check if the event is a message or postback and
// 	  // pass the event to the appropriate handler function
// 	  if (webhook_event.message) {
// 	    handleMessage(sender_psid, webhook_event.message);
// 	  } else if (webhook_event.postback) {
// 	    handlePostback(sender_psid, webhook_event.postback);
// 	  }
//     });

//     // Returns a '200 OK' response to all requests
//     res.status(200).send('EVENT_RECEIVED');
//   } else {
//     // Returns a '404 Not Found' if event is not from a page subscription
//     res.sendStatus(404);
//   }

// });

// app.get('/webhook', (req, res) => {
//   // Your verify token. Should be a random string.
//   let VERIFY_TOKEN = "lazer_cat"

//   // Parse the query params
//   let mode = req.query['hub.mode'];
//   let token = req.query['hub.verify_token'];
//   let challenge = req.query['hub.challenge'];

//   // Checks if a token and mode is in the query string of the request
//   if (mode && token) {

//     // Checks the mode and token sent is correct
//     if (mode === 'subscribe' && token === VERIFY_TOKEN) {

//       // Responds with the challenge token from the request
//       console.log('WEBHOOK_VERIFIED');
//       res.status(200).send(challenge);

//     } else {
//       // Responds with '403 Forbidden' if verify tokens do not match
//       res.sendStatus(403);
//     }
//   }
// });
// // Handles messages events
// function handleMessage(sender_psid, received_message) {
// 	let response;

// 	// Check if the message contains text
// 	if (received_message.text) {

// 	console.log(received_message.nlp.entities)
// 	// Create the payload for a basic text message
// 	response = {
// 	  "text": `You are a potato`
// 	}
// }

//   // Sends the response message
//   callSendAPI(sender_psid, response);
// }

// // Handles messaging_postbacks events
// function handlePostback(sender_psid, received_postback) {

// }

// // Sends response messages via the Send API
// function callSendAPI(sender_psid, response) {
//   // Construct the message body
//   let request_body = {
//     "recipient": {
//       "id": sender_psid
//     },
//     "message": response
//   }
//    // Send the HTTP request to the Messenger Platform
//   request({
//     "uri": "https://graph.facebook.com/v2.6/me/messages",
//     "qs": { "access_token": PAGE_ACCESS_TOKEN },
//     "method": "POST",
//     "json": request_body
//   }, (err, res, body) => {
//     if (!err) {
//       console.log('message sent!')
//     } else {
//       console.error("Unable to send message:" + err);
//     }
//   });
// }

app.listen(3000);
