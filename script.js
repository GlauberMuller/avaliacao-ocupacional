// script.js

// Perguntas adaptadas do exemplo enviado
const questions = [
  {
    text: "Com que frequência você sente estresse excessivo no trabalho?",
    options: ["Nunca", "Às vezes", "Frequentemente", "Sempre"]
  },
  {
    text: "Você se sente apoiado(a) psicologicamente pela liderança?",
    options: ["Totalmente", "Parcialmente", "Pouco", "Nada"]
  },
  {
    text: "Seu ambiente de trabalho oferece mobiliário ergonômico adequado?",
    options: ["Sim, totalmente", "Sim, em parte", "Não muito", "Nada"]
  },
  {
    text: "A empresa promove ações de inclusão e diversidade?",
    options: ["Sempre", "Às vezes", "Raramente", "Nunca"]
  },
  {
    text: "Você conhece os principais riscos ocupacionais da sua função?",
    options: ["Sim, totalmente", "Mais ou menos", "Pouco", "Nada"]
  }
];

let currentQuestion = 0;
const responses = new Array(questions.length);

const startBtn = document.getElementById("startBtn");
const quiz = document.getElementById("quiz");
const questionText = document.getElementById("questionText");
const optionsList = document.getElementById("optionsList");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const results = document.getElementById("results");
const summary = document.getElementById("summary");
const restartBtn = document.getElementById("restartBtn");

startBtn.addEventListener("click", () => {
  startBtn.parentElement.classList.add("hidden");
  quiz.classList.remove("hidden");
  showQuestion();
});

function showQuestion() {
  const q = questions[currentQuestion];
  questionText.textContent = `${currentQuestion + 1}. ${q.text}`;
  optionsList.innerHTML = "";
  q.options.forEach((opt, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `<label><input type="radio" name="option" value="${idx}" ${responses[currentQuestion] === idx ? 'checked' : ''}> ${opt}</label>`;
    optionsList.appendChild(li);
  });
}

nextBtn.addEventListener("click", () => {
  saveResponse();
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion();
  } else {
    showResults();
  }
});

prevBtn.addEventListener("click", () => {
  saveResponse();
  if (currentQuestion > 0) {
    currentQuestion--;
    showQuestion();
  }
});

function saveResponse() {
  const selected = document.querySelector("input[name='option']:checked");
  if (selected) {
    responses[currentQuestion] = parseInt(selected.value);
  }
}

function showResults() {
  quiz.classList.add("hidden");
  results.classList.remove("hidden");
  let total = responses.reduce((acc, val) => acc + (val ?? 0), 0);
  summary.innerHTML = `Pontuação total: <strong>${total}</strong> de ${questions.length * 3}`;

  // Enviar para backend
  fetch('http://localhost:3000/salvar', { // altere para o endereço do backend se for deploy!
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ respostas: responses })
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      summary.innerHTML += "<br><span style='color:green'>Respostas registradas e enviadas com sucesso!</span>";
    } else {
      summary.innerHTML += "<br><span style='color:red'>Erro ao enviar respostas: " + (data.error || "Tente novamente mais tarde") + "</span>";
    }
  })
  .catch(() => {
    summary.innerHTML += "<br><span style='color:red'>Erro de conexão com o servidor.</span>";
  });
}
