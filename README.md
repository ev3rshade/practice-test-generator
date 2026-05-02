# Practice Exam Generator 

A minimal vanilla JS app that turns plain text into an interactive practice exam.

## File Structure

```
index.html       # app shell
style.css        # global styles
js/
  parser.js      # text → data structure
  exam.js        # render, grade, reset
  app.js         # UI wiring
```

## Usage

Open `index.html` in a browser. No build step or server required.

Recommended Usage: using an LLM to parse slides and other text content to generate these interactive slides.

## Test Format

```
Exam Name

Question text | MCQ
Option A
Option B <correct>
Option C

Question text | FRQ
Correct answer here.
```

1. The first line is the exam name.
2. Questions are separated by blank lines.
3. Each question starts with `question text | TYPE` where `TYPE` is `MCQ` or `FRQ`.
4. **MCQ:** list options on following lines; mark the correct one with `<anything>` (e.g. `<correct>`).
5. **FRQ:** the line(s) after the question are the model answer, revealed on demand.
6. LaTeX is supported anywhere using `$...$` (inline) or `$$...$$` (display).

**Example**

```
Algebra Quiz

What is $2^{10}$? | MCQ
512
1024 <correct>
2048

Prove the quadratic formula. | FRQ
Complete the square on $ax^2+bx+c=0$ to derive $x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}$.
```

## Features

| Action | Description |
|---|---|
| **Generate Exam** | Parses the input and renders the exam. |
| **Grade MCQ** | Locks choices, highlights correct/wrong answers, shows score. |
| **Reset** | Clears all answers and score. |
| **← Edit** | Returns to the text editor. |
| **Save .md** | Downloads the input text as a Markdown file. |