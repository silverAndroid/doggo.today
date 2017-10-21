const context = require('bot-context');
const fs = require('fs');

const breeds = JSON.parse(fs.readFileSync('./dog-breeds.json'));
const questionTypes = {
    SINGLE: 0,
    RANDOM: 1,
};
const questions = [
    {
        question: 'What dog breed would you like?',
        answers: breeds,
        type: questionTypes.RANDOM,
        maximum: 5,
    },
    {
        question: 'How old would you like your dog to be?',
        answers: [
            'Puppy',
            'Adult',
            'Elderly',
        ],
        type: questionTypes.SINGLE,
    },
    {
        question: 'What size dog would you like?',
        answers: [
            'Small',
            'Medium',
            'Large'
        ],
        type: questionTypes.SINGLE,
    },
    {
        question: 'What kind of dog are you looking for?',
        answers: [
            'Playful',
            'Loves being indoors',
            'Loves being outdoors',
            'Fluffy'
        ]
    }
];

module.exports.onMessageReceived = (message, userID) => {
    const bot = context.getOrCreate(userID);
    if (!bot.isSet()) {

    }
};

function init(userID) {
    const bot = context.getOrCreate(userID);
    bot.set()
}