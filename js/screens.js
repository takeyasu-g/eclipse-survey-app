function screenHome(state) {
  const t = content[state.language];

  return `
    <div class="screen screen-home">
      <p>state.language: ${state.language}</p>
      <p>content check: ${t.ui.quickSurveyButton}</p>
    </div>
  `;
}
