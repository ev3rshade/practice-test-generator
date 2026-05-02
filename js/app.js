import { parseExam } from './parser.js';
import { renderExam, gradeMCQ, resetExam } from './exam.js';

let currentExam = null;
let graded = false;
let mcqCorrect = 0;
let frScore = 0;
let frGraded = 0;

const inputView     = document.getElementById('input-view');
const examView      = document.getElementById('exam-view');
const examInput     = document.getElementById('exam-input');
const generateBtn   = document.getElementById('generate-btn');
const examContainer = document.getElementById('exam-container');
const gradeBtn      = document.getElementById('grade-btn');
const resetBtn      = document.getElementById('reset-btn');
const backBtn       = document.getElementById('back-btn');
const saveMdBtn     = document.getElementById('save-md-btn');
const headerTitle   = document.getElementById('header-title');
const scoreBadge    = document.getElementById('score-badge');
const progressEl    = document.getElementById('progress');
const resultFill    = document.getElementById('result-fill');
const resultSummary = document.getElementById('result-summary');

examContainer.addEventListener('mcq-answered', ({ detail: { correct } }) => {
  if (correct) mcqCorrect++;
  updateBadge();
  updateProgress();
});

examContainer.addEventListener('frq-graded', ({ detail: { pts } }) => {
  frScore += pts;
  frGraded++;
  updateBadge();
});

generateBtn.addEventListener('click', () => {
  const raw = examInput.value.trim();
  if (!raw) return;

  currentExam = parseExam(raw);
  if (!currentExam.questions.length) {
    alert('No questions found. Check your formatting.');
    return;
  }

  graded = false;
  mcqCorrect = 0;
  frScore = 0;
  frGraded = 0;

  renderExam(currentExam, examContainer);
  if (window.MathJax) MathJax.typesetPromise([examContainer]);

  const mcqCount = currentExam.questions.filter(q => q.type === 'MCQ').length;
  gradeBtn.hidden = mcqCount === 0;
  gradeBtn.disabled = false;

  resultFill.style.width = '0%';
  resultFill.className = 'result-fill';
  resultSummary.className = 'result-summary';
  resultSummary.innerHTML = '';

  headerTitle.textContent = currentExam.name;
  scoreBadge.hidden = false;
  updateBadge();
  updateProgress();

  inputView.hidden = true;
  examView.hidden = false;
  window.scrollTo(0, 0);
});

gradeBtn.addEventListener('click', () => {
  if (!currentExam || graded) return;
  graded = true;

  const { correct, total } = gradeMCQ(examContainer, currentExam);
  mcqCorrect = correct;

  const pct = total ? Math.round(correct / total * 100) : 0;
  resultFill.style.width = pct + '%';
  resultFill.className = 'result-fill' + (pct >= 70 ? '' : pct >= 50 ? ' mid' : ' low');

  const frCount = currentExam.questions.filter(q => q.type === 'FRQ').length;
  const frPart = frGraded > 0
    ? ` &nbsp;|&nbsp; <strong>FR: ${frScore}/${frCount * 2}</strong>`
    : frCount > 0 ? ' &nbsp;|&nbsp; Self-grade free-response questions to track FR score.' : '';
  resultSummary.className = 'result-summary show';
  resultSummary.innerHTML = total
    ? `<strong>MC: ${correct}/${total} (${pct}%)</strong>${frPart}`
    : 'Self-grade free-response questions to track your score.';

  gradeBtn.disabled = true;
  updateBadge();
});

resetBtn.addEventListener('click', () => {
  if (!currentExam) return;
  graded = false;
  mcqCorrect = 0;
  frScore = 0;
  frGraded = 0;

  resetExam(examContainer);

  resultFill.style.width = '0%';
  resultFill.className = 'result-fill';
  resultSummary.className = 'result-summary';
  resultSummary.innerHTML = '';

  gradeBtn.disabled = false;
  updateBadge();
  updateProgress();
});

backBtn.addEventListener('click', () => {
  examView.hidden = true;
  inputView.hidden = false;
  headerTitle.textContent = 'Practice Exam Generator';
  scoreBadge.hidden = true;
  window.scrollTo(0, 0);
});

saveMdBtn.addEventListener('click', () => {
  const text = examInput.value;
  const name = currentExam?.name || 'exam';
  const blob = new Blob([text], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name.replace(/\s+/g, '_') + '.md';
  a.click();
  URL.revokeObjectURL(a.href);
});

function updateBadge() {
  if (!currentExam) return;
  const mcqCount = currentExam.questions.filter(q => q.type === 'MCQ').length;
  const frCount  = currentExam.questions.filter(q => q.type === 'FRQ').length;
  const answered = examContainer.querySelectorAll('.q-card[data-type="MCQ"].correct, .q-card[data-type="MCQ"].wrong').length;

  if (answered === 0 && frGraded === 0) {
    scoreBadge.textContent = mcqCount ? 'Not graded' : '';
    return;
  }

  const parts = [];
  if (mcqCount) parts.push(`MC ${mcqCorrect}/${mcqCount}`);
  if (frGraded > 0) parts.push(`FR ${frScore}/${frCount * 2}`);
  scoreBadge.textContent = parts.join(' | ');
}

function updateProgress() {
  if (!currentExam) return;
  const mcqCount = currentExam.questions.filter(q => q.type === 'MCQ').length;
  const frCount  = currentExam.questions.filter(q => q.type === 'FRQ').length;
  const answered = examContainer.querySelectorAll('.q-card[data-type="MCQ"].correct, .q-card[data-type="MCQ"].wrong').length;

  const parts = [];
  if (mcqCount) parts.push(`${answered}/${mcqCount} MCQ`);
  if (frCount)  parts.push(`${frCount} FRQ`);
  progressEl.textContent = parts.join(' · ');
}
