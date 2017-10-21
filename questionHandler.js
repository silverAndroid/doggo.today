const context = require('bot-context');
const fs = require('fs');

const breeds = JSON.parse(fs.readFileSync('./dog-breeds.json')).map(breed => capitalize(breed));
const QuestionTypes = {
    SINGLE: 0,
    RANDOM: 1,
};
const questions = [
    {
        question: 'What dog breed do you like?',
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
        getQuestionOne(userID, resolve);
    }

    bot.match(message, (err, match, cb) => {
        if (!err) {
            cb(userID, match);
        } else {
            console.error(err);
        }
    });
});

function getQuestionOne(userID, resolve) {
    const bot = context.getOrCreate(userID);
    bot.set(/.*/, () => {
        console.log('Question 1');
       getQuestionTwo(userID, resolve);
    });
    const question = questions[0];
    if (question.type === QuestionTypes.RANDOM) {
        question.answers = reduceArray(question.answers, question.maximum);
    }

    resolve(question);
}

function getQuestionTwo(userID, resolve) {
    const bot = context.getOrCreate(userID);
    bot.set((text, cb) => {
        // cb(null, questions[0].answers.some(answer => answer === text))
        cb(null, true);
    }, () => {
        console.log('Test complete');
    });

    const question = questions[1];
    resolve(question);
}

/*function getQuestion(userID, resolve, questionNumber = 0) {
    const bot = context.getOrCreate(userID);
    if (questionNumber < questions.length) {
        bot.set((text, cb) => {
            // console.log(questionNumber);
            if (questionNumber === 0) cb(null, true);
            else {
                // Checks if there is an answer in question <questionNumber> that the user sent
                cb(null, questions[questionNumber - 1].answers.some(answer => answer === text));
            }
        }, () => {
            const nextQuestion = questionNumber + 1;
            console.log(`Sending question ${nextQuestion}`);
            getQuestion(userID, resolve, nextQuestion);
        });
        const question = questions[questionNumber];
        if (question.type === QuestionTypes.RANDOM) {
            question.answers = reduceArray(question.answers, question.maximum);
        }

        resolve(question);
    } else {
        resolve('Thank you for answering all of our questions! We\'ll contact you soon if we have a dog for you.')
    }
}*/

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