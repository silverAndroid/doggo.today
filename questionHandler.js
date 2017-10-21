const context = require('bot-context');
const fs = require('fs');

const breeds = JSON.parse(fs.readFileSync('./dog-breeds.json')).map(breed => capitalize(breed));
const QuestionTypes = {
    SINGLE: 0,
    RANDOM: 1,
};
const questions = [
    {
        question: 'What dog breed would you like?',
        answers: breeds,
        type: QuestionTypes.RANDOM,
        maximum: 3,
    },
    {
        question: 'How old would you like your dog to be?',
        answers: [
            'Puppy',
            'Adult',
            'Elderly',
        ],
        type: QuestionTypes.SINGLE,
    },
    {
        question: 'What size dog would you like?',
        answers: [
            'Small',
            'Medium',
            'Large'
        ],
        type: QuestionTypes.SINGLE,
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

module.exports.onMessageReceived = (message, userID) => new Promise((resolve, reject) => {
    const bot = context.getOrCreate(userID);
    if (!bot.isSet()) {
        getQuestion(userID, resolve);
    }

    bot.match(message, (err, match, cb) => {
        if (!err) {
            cb(userID, match);
        } else {
            reject(err);
        }
    });
});

function getQuestion(userID, resolve, questionNumber = 0) {
    const bot = context.getOrCreate(userID);
    if (questionNumber < questions.length) {
        bot.set((text, cb) => {
            // Checks if there is an answer in question <questionNumber> that the user sent
            cb(questionNumber === 0 && questions[questionNumber].answers.some(answer => answer === text));
        }, () => {
            const nextQuestion = questionNumber + 1;
            getQuestion(userID, resolve, nextQuestion);
        });
        const question = questions[questionNumber];
        if (question.type === QuestionTypes.RANDOM) {
            question.answers = reduceArray(question.answers, question.maximum);
            resolve(question);
        } else {
            resolve(question);
        }
    } else {
        resolve('Thank you for answering all of our questions! We\'ll contact you soon if we have a dog for you.')
    }
}

function reduceArray(array, maximum) {
    const reduced = [];
    const indices = [];

    while (reduced.length < maximum) {
        const index = Math.floor(Math.random() * array.length);
        if (!indices.some(i => i === index)) {
            reduced.push(array[index]);
            indices.push(index);
        }
    }

    return reduced;
}

function capitalize(string) {
    return string.slice(0, 1).toUpperCase() + string.slice(1);
}