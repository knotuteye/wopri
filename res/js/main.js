const gameWindow = document.getElementById('game-window')
const questionHolder = document.getElementById('question-holder')
const questionText = document.getElementById('question')
const answerBoxes = document.getElementsByClassName('answer-holder')
const scoreInt = document.getElementById('score').children[0]
const qNumberText = document.getElementById('qn-number').children[0]

//Config
let AMOUNT = 15
let DIFFICULTY = ''
let TYPE = 'multiple'
let CATEGORY = 18

//Var
let ANSWER = ''
let QNUMBER = 0
let QN_ARRAY = []

const init = () => {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('service-worker.js')
	}
	gameWindow.style.display = 'none'
	fetchQuestion()
	for (let i = 0; i < answerBoxes.length; i++) {
		answerBoxes[i].addEventListener('click', keepScore)
	}
}

const fetchQuestion = () => {
	let url = `https://opentdb.com/api.php?amount=${AMOUNT}&difficulty=${DIFFICULTY}&type=${TYPE}&category=${CATEGORY}`
	fetch(url)
		.then((response) => response.json())
		.then((data) => {
			QN_ARRAY = data.results
			return QN_ARRAY
		})
		.then((arr) => getNextQuestion(arr[QNUMBER]))
		.catch((err) => console.error(err))
}

const getNextQuestion = (obj) => {
	ANSWER = decodeHTMLString(obj.correct_answer)
	questionText.innerHTML = obj.question
	answerBoxes[0].children[1].innerHTML = obj.correct_answer
	for (let i = 0; i < obj.incorrect_answers.length; i++) {
		answerBoxes[i + 1].children[1].innerHTML = obj.incorrect_answers[i]
	}
	qNumberText.innerText = ++QNUMBER
	gameWindow.style.display = ''
}

const keepScore = (event) => {
	let activeLbl =
		event.target.querySelector('.answer-holder label') ||
		event.target.closest('.answer-holder label') ||
		event.target.nextSibling.nextSibling
	if (activeLbl.innerHTML == ANSWER) {
		scoreInt.innerText = parseInt(scoreInt.innerText) + 20
		animateAll(activeLbl, true)
	} else {
		animateAll(activeLbl, false)
	}
}

const animateAll = (activeLbl, isCorrect) => {
	animateAnswerHolder(activeLbl.closest('.answer-holder'), isCorrect)
	animateQuestionHolder(isCorrect)
}

const gameOver = (score) => {
	// window.location.href = './gameOver.html'
}

const animateQuestionHolder = (isCorrect) => {
	if (isCorrect) {
		questionHolder.classList.add('fadeOut')
		setTimeout(() => {
			questionHolder.classList.replace('fadeOut', 'fadeIn')
		}, 500)
		questionHolder.classList.remove('fadeInRight')
	}
}

const animateAnswerHolder = (ansHolder, isCorrect) => {
	ansHolder.classList.add(isCorrect ? 'correct' : 'wrong')

	setTimeout(() => {
		ansHolder.classList.remove(isCorrect ? 'correct' : 'wrong')
	}, 500)

	setTimeout(() => {
		isCorrect ? getNextQuestion(QN_ARRAY[QNUMBER]) : gameOver()
	}, 600)
}

const decodeHTMLString = (HTMLString) => {
	let field = document.createElement('textarea')
	field.innerHTML = HTMLString
	return field.innerText
}
