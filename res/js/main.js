const catSelector = document.getElementById('select-category')
let qnBox = document.getElementById('questions')


let AMOUNT = 1
let DIFFICULTY = 'easy'
let TYPE = 'multiple'
let CATEGORY

const init = () => {
	fetch('https://opentdb.com/api_category.php')
		.then((response) => response.json())
		.then((data) => data.trivia_categories)
		.then((categories) => {
			categories.forEach((obj) => {
				let opt = document.createElement('option')
				opt.text = obj.name
				opt.value = obj.id
				catSelector.appendChild(opt)
			})
		})
}

const displayQuestions = () => {
	CATEGORY = catSelector.value == 7 ? '' : catSelector.value
	renderQuestion(AMOUNT, DIFFICULTY, TYPE, CATEGORY)
}

const renderQuestion = (amount, difficulty, type, category) => {
	let url = `https://opentdb.com/api.php?amount=${amount}&difficulty=${difficulty}&type=${type}&category=${category}`
	console.log(url)

	fetch(url)
		.then((response) => response.json())
		.then((data) => data.results)
		.then((questions) => {
			console.log(questions)
		})
}

const decodeString = (asset) => {
	let txt = document.createElement('textarea')
	txt.innerHTML = asset
	return txt.value
}
