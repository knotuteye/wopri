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
const DIFFICULTIES = ["easy", "easy", "easy", "medium", "hard"];

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
  for (let i = 0; i < answerBoxes.length; i++) {
    answerBoxes[i].addEventListener("click", keepScore);
  }
};

const animateStartGame = () => {
  homeWindow.classList.add("flipOutY");
  setTimeout(() => {
    setTimeout(() => {
      homeWindow.hidden = true;
    }, 300);
  }, 300);
};

const generateQuestionSeed = () => {
  let arr = [];
  while (arr.length < 15) {
    let y;
    if (arr.length < 5) {
      y = DIFFICULTIES[0];
    } else if (arr.length < 10) {
      y = DIFFICULTIES[1];
    } else {
      y = DIFFICULTIES[2];
    }
    let x =
      CATEGORIES[(Math.random() * CATEGORIES.length - 1).toFixed(0)] ||
      CATEGORIES[0];
    arr.push({ category: x, difficulty: y });
  }

  return arr;
};

const fetchQuestion = () => {
  Promise.all(
    generateQuestionSeed().map((qSeed) => {
      let url = `https://opentdb.com/api.php?amount=1&difficulty=${qSeed.difficulty}&type=multiple&category=${qSeed.category}`;
      return fetch(url)
        .then((response) => response.json())
        .then((data) => {
          QN_ARRAY.set(QN_ARRAY.get().concat(data.results[0]));
        });
    })
  )
    .then(() => {
      renderNextQuestion(QN_ARRAY.get()[QNUMBER.get()]);
    })
    .catch((err) => onDeviceOffline(err));
};

const renderNextQuestion = (obj) => {
  let arr = [];
  let x = (Math.random() * 3).toFixed(0);
  arr.push(x);
  while (arr.length < 4) {
    x = (Math.random() * 3).toFixed(0);
    while (arr.includes(x)) {
      x = (Math.random() * 3).toFixed(0);
    }
    arr.push(x);
  }

  ANSWER.set(decodeHTMLString(obj.correct_answer));

  let optionsArr = [obj.correct_answer, ...obj.incorrect_answers].map((value) =>
    decodeHTMLString(value)
  );

  let i = arr.length;
  while (i-- > 0) {
    answerBoxes[i].querySelector("label").innerText = optionsArr[arr[i]];
  }
  console.log(obj.correct_answer);

  questionText.innerText = decodeHTMLString(obj.question);
  QNUMBER.set(QNUMBER.get() + 1);
  qNumberText.innerText = QNUMBER.get();
  gameWindow.style.display = "block";
};

const keepScore = (event) => {
  let activeLbl =
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
  let field = document.createElement("textarea");
  field.innerHTML = HTMLString;
  return field.innerText;
};

const onDeviceOffline = (err) => {
  console.error(err);
};
