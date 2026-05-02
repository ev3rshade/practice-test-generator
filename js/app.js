import { parseExam } from './parser.js';
import { renderExam, gradeMCQ, resetExam } from './exam.js';

let currentExam = null;
let graded = false;

const inputView  = document.getElementById('input-view');
const examView   = document.getElementById('exam-view');
const examInput  = document.getElementById('exam-input');
const generateBtn = document.getElementById('generate-btn');
const examContainer = document.getElementById('exam-container');
const gradeBtn   = document.getElementById('grade-btn');
const resetBtn   = document.getElementById('reset-btn');
const backBtn    = document.getElementById('back-btn');
const saveMdBtn  = document.getElementById('save-md-btn');
const headerTitle = document.getElementById('header-title');
const scoreBadge  = document.getElementById('score-badge');
const progressEl  = document.getElementById('progress');

generateBtn.addEventListener('click', () => {
  const raw = examInput.value.trim();
  if (!raw) return;

  currentExam = parseExam(raw);
  if (!currentExam.questions.length) {
    alert('No questions found. Check your formatting.');
    return;
  }

  graded = false;
  renderExam(currentExam, examContainer);
  if (window.MathJax) MathJax.typesetPromise([examContainer]);

  const mcqCount = currentExam.questions.filter(q => q.type === 'MCQ').length;
  gradeBtn.hidden = mcqCount === 0;
  gradeBtn.disabled = false;

  headerTitle.textContent = currentExam.name;
  scoreBadge.hidden = false;
  scoreBadge.textContent = mcqCount ? 'Not graded' : '';
  updateProgress();

  inputView.hidden = true;
  examView.hidden = false;
  window.scrollTo(0, 0);
});

gradeBtn.addEventListener('click', () => {
  if (!currentExam || graded) return;
  graded = true;
  const { correct, total } = gradeMCQ(examContainer, currentExam);
  scoreBadge.textContent = `${correct} / ${total}`;
  gradeBtn.disabled = true;
});

resetBtn.addEventListener('click', () => {
  if (!currentExam) return;
  graded = false;
  resetExam(examContainer);
  const mcqCount = currentExam.questions.filter(q => q.type === 'MCQ').length;
  scoreBadge.textContent = mcqCount ? 'Not graded' : '';
  gradeBtn.disabled = false;
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

function updateProgress() {
  const mc = currentExam.questions.filter(q => q.type === 'MCQ').length;
  const fr = currentExam.questions.filter(q => q.type === 'FRQ').length;
  const parts = [];
  if (mc) parts.push(`${mc} MCQ`);
  if (fr) parts.push(`${fr} FRQ`);
  progressEl.textContent = parts.join(' · ');
}
