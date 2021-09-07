// DOM Elements
const homeWindow = document.getElementById("home");
const gameWindow = document.getElementById("game-window");
const gameOverWindow = document.getElementById("game-over");
const questionHolder = document.getElementById("question-holder");
const questionText = document.getElementById("question");
const answerBoxes = document.getElementsByClassName("answer-holder");
const finalScorePct = document.getElementById("final-score");
const qNumberText = document.getElementById("qn-number").children[0];

// Config
const CATEGORIES = [17, 18, 19, 30, 23, 20, 27];

/**
 * This serves as a factory for objects stored in localStorage
 * @param {string} key
 * @param {Function} inputTransformer
 */
const LOCAL_STORAGE_FACTORY = (
  key,
  inputTransformer = (x) => x,
  outputTransformer = (x) => x
) => {
  return {
    set: (value) => window.localStorage.setItem(key, inputTransformer(value)),
    get: () => outputTransformer(window.localStorage.getItem(key)),
  };
};

const ANSWER = LOCAL_STORAGE_FACTORY("answer");
const QNUMBER = LOCAL_STORAGE_FACTORY("qnumber");
const QN_ARRAY = LOCAL_STORAGE_FACTORY(
  "qn_array",
  (x) => JSON.stringify(x),
  (x) => JSON.parse(x)
);

const startGame = () => {
  gameWindow.hidden = true;
  animateStartGame();
  fetchQuestion();
  answerBoxes = answerBoxes.map((x) => x.addEventListener("click", keepScore));
};

const animateStartGame = () => {
  homeWindow.classList.add("flipOutY");
  setTimeout(() => {
    homeWindow.hidden = true;
  }, 600);
};

const generateQuestionSeed = () =>
  Array.from({ length: 15 }).map(
    (_) => CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
  );

const fetchQuestion = async () => {
  const categoryList = generateQuestionSeed();
  const categoryDictionary = {};

  categoryList.forEach(
    (x) => (categoryDictionary[x] = categoryDictionary[x] || 0 + 1)
  );

  try {
    await Promise.all(
      Object.keys(categoryDictionary).map(async (category) => {
        const url = `https://opentdb.com/api.php?amount=${categoryDictionary[category]}&difficulty=easy&type=multiple&category=${category}`;
        const response = await fetch(url);
        const data = await response.json();
        QN_ARRAY.set(QN_ARRAY.get().concat(data.results));
      })
    );
    renderNextQuestion(QN_ARRAY.get()[QNUMBER.get()]);
  } catch (err) {
    onDeviceOffline(err);
  }
};

const renderNextQuestion = (obj) => {
  questionText.innerText = decodeHTMLString(obj.question);

  ANSWER.set(decodeHTMLString(obj.correct_answer));

  [obj.correct_answer, ...obj.incorrect_answers]
    .map((value) => decodeHTMLString(value))
    .sort(() => 0.5 - Math.random())
    .forEach((x, i) => {
      answerBoxes[i].querySelector("label").innerText = x;
    });

  QNUMBER.set(QNUMBER.get() + 1);
  qNumberText.innerText = QNUMBER.get();
  gameWindow.style.display = "block";

  console.log(obj.correct_answer);
};

const keepScore = (event) => {
  const activeLbl =
    event.target.querySelector(".answer-holder label") ||
    event.target.closest(".answer-holder label") ||
    event.target.nextSibling.nextSibling;
  if (activeLbl.innerText == ANSWER.get()) {
    animateAll(activeLbl, true);
  } else {
    animateAll(activeLbl, false);
  }
};

const animateAll = (activeLbl, isCorrect) => {
  animateAnswerHolder(activeLbl.closest(".answer-holder"), isCorrect);
  animateQuestionHolder(isCorrect);
};

const gameOver = (success) => {
  if (success) {
    return console.log("lol");
  } else {
    finalScorePct.innerText = `${((100 * (QNUMBER.get() - 1)) / 15).toFixed(
      0
    )}%`;
    gameWindow.classList.replace("flipInY", "slideOutUp");
    setTimeout(() => {
      gameWindow.style.display = "none";
    }, 600);

    gameOverWindow.style.display = "block";
  }
};

const animateQuestionHolder = (isCorrect) => {
  if (isCorrect) {
    questionHolder.classList.add("fadeOut");
    setTimeout(() => {
      questionHolder.classList.replace("fadeOut", "fadeIn");
    }, 600);
    questionHolder.classList.remove("fadeIn");
  }
};

const animateAnswerHolder = (ansHolder, isCorrect) => {
  ansHolder.classList.add(isCorrect ? "correct" : "wrong");

  setTimeout(() => {
    ansHolder.classList.remove(isCorrect ? "correct" : "wrong");
  }, 500);

  setTimeout(() => {
    if (QNUMBER.get() == 15) gameOver(true);
    isCorrect ? renderNextQuestion(QN_ARRAY.get()[QNUMBER.get()]) : gameOver();
  }, 600);
};

const decodeHTMLString = (HTMLString) => {
  const field = document.createElement("textarea");
  field.innerHTML = HTMLString;
  return field.innerText;
};

const onDeviceOffline = (err) => {
  console.error(err);
};
