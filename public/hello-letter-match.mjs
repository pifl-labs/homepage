const letters = ['あ', 'い'];
export function initialMatch() { return { index: 0, matched: false, feedback: 'Choose the same shape.' }; }
export function chooseMatch(state, letter) {
  if (state.matched || !letters.includes(letter)) return state;
  const target = letters[state.index];
  return letter === target
    ? { ...state, matched: true, feedback: state.index === 0 ? "That's あ. Ready to try い?" : 'Matched both letters! In the app, try hearing and tracing them.' }
    : { ...state, feedback: `That is ${letter}. Look for ${target}.` };
}
export function nextMatch(state) {
  return state.matched && state.index === 0 ? { ...initialMatch(), index: 1 } : state;
}

// No requests, tracking, storage, audio, or links are added by this sample.
if (typeof document !== 'undefined') {
  for (const root of document.querySelectorAll('[data-hello-match]')) {
    let state = initialMatch();
    const choices = [...root.querySelectorAll('[data-match-choice]')];
    const next = root.querySelector('[data-match-next]');
    const reset = root.querySelector('[data-match-reset]');
    const feedback = root.querySelector('[data-match-feedback]');
    const step = root.querySelector('[data-match-step]');
    const target = root.querySelector('[data-match-target]');
    const render = () => {
      step.textContent = `Letter ${state.index + 1} of 2`;
      target.textContent = letters[state.index];
      feedback.textContent = state.feedback;
      next.disabled = !state.matched || state.index !== 0;
      for (const button of choices) {
        button.disabled = false;
        button.setAttribute('aria-disabled', String(state.matched));
        button.dataset.result = state.matched && button.dataset.matchChoice === letters[state.index] ? 'correct' : '';
      }
    };
    choices.forEach(button => button.addEventListener('click', () => { state = chooseMatch(state, button.dataset.matchChoice); render(); }));
    next.addEventListener('click', () => { state = nextMatch(state); render(); choices[0].focus(); });
    reset.addEventListener('click', () => { state = initialMatch(); render(); choices[0].focus(); });
    reset.disabled = false;
    root.querySelector('[data-match-loading]').hidden = true;
    render();
  }
}
