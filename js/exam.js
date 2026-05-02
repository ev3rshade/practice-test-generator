export function renderExam(exam, container) {
  container.innerHTML = '';
  exam.questions.forEach((q, idx) => {
    const card = document.createElement('div');
    card.className = 'q-card';
    card.dataset.index = idx;
    card.dataset.type = q.type;

    const num = document.createElement('div');
    num.className = 'q-num';
    num.textContent = `Q${idx + 1} · ${q.type}`;

    const text = document.createElement('div');
    text.className = 'q-text';
    text.textContent = q.text;

    card.appendChild(num);
    card.appendChild(text);

    if (q.type === 'MCQ') renderMCQ(card, q, idx);
    else if (q.type === 'FRQ') renderFRQ(card, q);

    container.appendChild(card);
  });
}

function renderMCQ(card, q, idx) {
  const choices = document.createElement('div');
  choices.className = 'choices';

  q.options.forEach((opt, i) => {
    const label = document.createElement('label');
    label.className = 'choice';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `q${idx}`;
    input.value = i;

    const span = document.createElement('span');
    span.textContent = opt;

    label.appendChild(input);
    label.appendChild(span);
    choices.appendChild(label);
  });

  const feedback = document.createElement('div');
  feedback.className = 'feedback';

  card.appendChild(choices);
  card.appendChild(feedback);
}

function renderFRQ(card, q) {
  const textarea = document.createElement('textarea');
  textarea.className = 'answer-area';
  textarea.placeholder = 'Write your answer here…';

  const actions = document.createElement('div');
  actions.className = 'fr-actions';

  const showBtn = document.createElement('button');
  showBtn.className = 'show-answer-btn';
  showBtn.textContent = 'Show Answer';

  const reveal = document.createElement('div');
  reveal.className = 'answer-reveal';
  reveal.textContent = q.answer;

  showBtn.addEventListener('click', () => {
    const open = reveal.classList.toggle('show');
    showBtn.textContent = open ? 'Hide Answer' : 'Show Answer';
    if (open && window.MathJax) MathJax.typesetPromise([reveal]);
  });

  actions.appendChild(showBtn);
  card.appendChild(textarea);
  card.appendChild(actions);
  card.appendChild(reveal);
}

export function gradeMCQ(container, exam) {
  let correct = 0;
  const mcqCards = container.querySelectorAll('.q-card[data-type="MCQ"]');

  mcqCards.forEach(card => {
    const q = exam.questions[parseInt(card.dataset.index)];
    const selected = card.querySelector('input[type=radio]:checked');
    const feedback = card.querySelector('.feedback');
    const choices = card.querySelectorAll('.choice');

    choices.forEach(c => {
      c.classList.add('disabled');
      c.querySelector('input').disabled = true;
    });

    if (selected) {
      const selectedIdx = parseInt(selected.value);
      if (selectedIdx === q.correctIndex) {
        correct++;
        selected.closest('.choice').classList.add('selected-correct');
        feedback.textContent = 'Correct!';
        feedback.className = 'feedback show correct-fb';
        card.classList.add('correct');
      } else {
        selected.closest('.choice').classList.add('selected-wrong');
        choices[q.correctIndex]?.classList.add('show-correct');
        feedback.textContent = 'Incorrect.';
        feedback.className = 'feedback show wrong-fb';
        card.classList.add('wrong');
      }
    } else {
      choices[q.correctIndex]?.classList.add('show-correct');
      feedback.textContent = 'Not answered.';
      feedback.className = 'feedback show wrong-fb';
      card.classList.add('wrong');
    }
  });

  return { correct, total: mcqCards.length };
}

export function resetExam(container) {
  container.querySelectorAll('.q-card').forEach(card => {
    card.classList.remove('correct', 'wrong');
    card.querySelectorAll('.choice').forEach(c => {
      c.classList.remove('selected-correct', 'selected-wrong', 'show-correct', 'disabled');
      c.querySelector('input').disabled = false;
    });
    card.querySelectorAll('input[type=radio]').forEach(i => i.checked = false);
    const fb = card.querySelector('.feedback');
    if (fb) { fb.className = 'feedback'; fb.textContent = ''; }
    const reveal = card.querySelector('.answer-reveal');
    if (reveal) reveal.classList.remove('show');
    const showBtn = card.querySelector('.show-answer-btn');
    if (showBtn) showBtn.textContent = 'Show Answer';
    const textarea = card.querySelector('.answer-area');
    if (textarea) textarea.value = '';
  });
}
