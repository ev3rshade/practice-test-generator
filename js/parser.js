export function parseExam(raw) {
  const blocks = raw.trim().split(/\n[ \t]*\n+/);
  const name = blocks[0].trim();
  const questions = [];

  for (let i = 1; i < blocks.length; i++) {
    const lines = blocks[i].trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    const pipeIdx = lines[0].lastIndexOf('|');
    if (pipeIdx === -1) continue;

    const text = lines[0].slice(0, pipeIdx).trim();
    const type = lines[0].slice(pipeIdx + 1).trim().toUpperCase();

    if (type === 'MCQ') {
      const options = [];
      let correctIndex = -1;
      for (let j = 1; j < lines.length; j++) {
        if (/<[^>]+>/.test(lines[j])) {
          options.push(lines[j].replace(/<[^>]+>/g, '').trim());
          correctIndex = j - 1;
        } else {
          options.push(lines[j]);
        }
      }
      if (options.length) questions.push({ text, type: 'MCQ', options, correctIndex });
    } else if (type === 'FRQ') {
      const answer = lines.slice(1).join('\n').trim();
      questions.push({ text, type: 'FRQ', answer });
    }
  }

  return { name, questions };
}
