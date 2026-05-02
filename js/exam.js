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

    input.addEventListener('change', () => gradeMCQChoice(card, q, i));

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

function gradeMCQChoice(card, q, selectedIdx) {
  const choices = card.querySelectorAll('.choice');
  const feedback = card.querySelector('.feedback');

  choices.forEach(c => {
    c.classList.add('disabled');
    c.querySelector('input').disabled = true;
  });

  const correct = selectedIdx === q.correctIndex;
  if (correct) {
    choices[selectedIdx].classList.add('selected-correct');
    feedback.textContent = 'Correct!';
    feedback.className = 'feedback show correct-fb';
    card.classList.add('correct');
  } else {
    choices[selectedIdx].classList.add('selected-wrong');
    choices[q.correctIndex]?.classList.add('show-correct');
    feedback.textContent = 'Incorrect.';
    feedback.className = 'feedback show wrong-fb';
    card.classList.add('wrong');
  }

  card.dispatchEvent(new CustomEvent('mcq-answered', { bubbles: true, detail: { correct } }));
}

function renderFRQ(card, q) {
  const textarea = document.createElement('textarea');
  textarea.className = 'answer-area';
  textarea.placeholder = 'Write your answer here…';

  const actions = document.createElement('div');
  actions.className = 'fr-actions';

  const checkBtn = document.createElement('button');
  checkBtn.className = 'submit-fr-btn';
  checkBtn.textContent = 'Check Answer';

  const showBtn = document.createElement('button');
  showBtn.className = 'show-answer-btn';
  showBtn.textContent = 'Show Answer';

  const reveal = document.createElement('div');
  reveal.className = 'answer-reveal';
  reveal.textContent = q.answer;

  const gradeBtns = document.createElement('div');
  gradeBtns.className = 'fr-grade-btns';

  const gradeLabel = document.createElement('span');
  gradeLabel.textContent = 'Self-grade:';
  gradeLabel.style.cssText = 'font-size:12.5px;color:#555';
  gradeBtns.appendChild(gradeLabel);

  const gradeConfigs = [
    { label: '✓ Full (2 pts)', grade: 'ok' },
    { label: '~ Partial (1 pt)', grade: 'half' },
    { label: '✗ Wrong (0 pts)', grade: 'no' },
  ];
  const pts = { ok: 2, half: 1, no: 0 };
  const gradeLabels = { ok: 'Full credit (2 pts)', half: 'Partial credit (1 pt)', no: 'No credit (0 pts)' };

  const scored = document.createElement('span');
  scored.className = 'fr-scored';

  gradeConfigs.forEach(({ label, grade }) => {
    const btn = document.createElement('button');
    btn.className = `fr-grade-btn ${grade}`;
    btn.textContent = label;
    btn.addEventListener('click', () => {
      gradeBtns.classList.remove('show');
      scored.textContent = gradeLabels[grade];
      scored.className = `fr-scored show ${grade}`;
      card.dispatchEvent(new CustomEvent('frq-graded', { bubbles: true, detail: { pts: pts[grade] } }));
    });
    gradeBtns.appendChild(btn);
  });

  checkBtn.addEventListener('click', () => {
    textarea.disabled = true;
    checkBtn.disabled = true;
    checkBtn.textContent = 'Submitted';
    reveal.classList.add('show');
    gradeBtns.classList.add('show');
    showBtn.textContent = 'Hide Answer';
    if (window.MathJax) MathJax.typesetPromise([reveal]);
  });

  showBtn.addEventListener('click', () => {
    const open = reveal.classList.toggle('show');
    showBtn.textContent = open ? 'Hide Answer' : 'Show Answer';
    if (open && window.MathJax) MathJax.typesetPromise([reveal]);
  });

  actions.appendChild(checkBtn);
  actions.appendChild(showBtn);
  card.appendChild(textarea);
  card.appendChild(actions);
  card.appendChild(reveal);
  card.appendChild(gradeBtns);
  card.appendChild(scored);
}

export function gradeMCQ(container, exam) {
  let correct = 0;
  const mcqCards = container.querySelectorAll('.q-card[data-type="MCQ"]');

  mcqCards.forEach(card => {
    if (card.classList.contains('correct')) { correct++; return; }
    if (card.classList.contains('wrong')) return;

    // Unanswered — mark wrong and show correct answer
    const q = exam.questions[parseInt(card.dataset.index)];
    const feedback = card.querySelector('.feedback');
    const choices = card.querySelectorAll('.choice');

    choices.forEach(c => {
      c.classList.add('disabled');
      c.querySelector('input').disabled = true;
    });
    choices[q.correctIndex]?.classList.add('show-correct');
    feedback.textContent = 'Not answered.';
    feedback.className = 'feedback show wrong-fb';
    card.classList.add('wrong');
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
    if (textarea) { textarea.value = ''; textarea.disabled = false; }
    const checkBtn = card.querySelector('.submit-fr-btn');
    if (checkBtn) { checkBtn.disabled = false; checkBtn.textContent = 'Check Answer'; }
    const gradeBtns = card.querySelector('.fr-grade-btns');
    if (gradeBtns) gradeBtns.classList.remove('show');
    const scored = card.querySelector('.fr-scored');
    if (scored) { scored.className = 'fr-scored'; scored.textContent = ''; }
  });
}
