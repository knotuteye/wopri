// Pattern 1: Mediator Pattern
const useDOM = () => {
  // We can do any calculations or state update here
  return {
    homeWindow: document.getElementById("home"),
    gameWindow: document.getElementById("game-window"),
    gameOverWindow: document.getElementById("game-over"),
    questionHolder: document.getElementById("question-holder"),
    questionText: document.getElementById("question"),
    answerBoxes: document.getElementsByClassName("answer-holder"),
    finalScorePct: document.getElementById("final-score"),
    qNumberText: document.getElementById("qn-number").children[0],
  };
};

// Compose Function
const compose =
  (...fxns) =>
  (x) =>
    fxns.reduceRight((y, f) => f(y), x);

// Pattern 2: Factory Pattern
const LOCAL_STORAGE_FACTORY = (
  key,
  inputTransformer = (x) => x,
  outputTransformer = (x) => x
) => {
  return {
    set: (value) => window.localStorage.setItem(key, inputTransformer(value)),
    // Pattern 3: Decorator
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

const startGame = () =>
  compose(
    hideGameWindow,
    animateStartGame,
    fetchQuestion,
    initEventListeners
  )();

const hideGameWindow = () => {
  useDOM().gameWindow.hidden = true;
};

const initEventListeners = () => {
  useDOM().answerBoxes = useDOM().answerBoxes.map((x) =>
    x.addEventListener("click", keepScore)
  );
};

const animateStartGame = () => {
  useDOM().homeWindow.classList.add("flipOutY");
  setTimeout(() => {
    useDOM().homeWindow.hidden = true;
  }, 600);
};

const generateQuestionSeed = () => {
  const CATEGORIES = [17, 18, 19, 30, 23, 20, 27];
  Array.from({ length: 15 }).map(
    (_) => CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
  );
};

const fetchQuestion = async () => {
  const categoryList = generateQuestionSeed();
  const categoryDictionary = {};

  categoryList.forEach(
    (x) => (categoryDictionary[x] = categoryDictionary[x] + 1)
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
  useDOM().questionText.innerText = decodeHTMLString(obj.question);

  ANSWER.set(decodeHTMLString(obj.correct_answer));

  [obj.correct_answer, ...obj.incorrect_answers]
    .map((value) => decodeHTMLString(value))
    .sort(() => 0.5 - Math.random())
    .forEach((x, i) => {
      useDOM().answerBoxes[i].querySelector("label").innerText = x;
    });

  QNUMBER.set(QNUMBER.get() + 1);
  useDOM().qNumberText.innerText = QNUMBER.get();
  useDOM().gameWindow.style.display = "block";

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
    useDOM().finalScorePct.innerText = `${(
      (100 * (QNUMBER.get() - 1)) /
      15
    ).toFixed(0)}%`;
    useDOM().gameWindow.classList.replace("flipInY", "slideOutUp");
    setTimeout(() => {
      useDOM().gameWindow.style.display = "none";
    }, 600);

    useDOM().gameOverWindow.style.display = "block";
  }
};

const animateQuestionHolder = (isCorrect) => {
  if (isCorrect) {
    useDOM().questionHolder.classList.add("fadeOut");
    setTimeout(() => {
      useDOM().questionHolder.classList.replace("fadeOut", "fadeIn");
    }, 600);
    useDOM().questionHolder.classList.remove("fadeIn");
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
