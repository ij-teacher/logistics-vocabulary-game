'use strict';
// Only the write-only web-app URL belongs here. No spreadsheet credentials or records.
const SCORE_RECEIVER_URL = 'https://script.google.com/macros/s/AKfycbxuOLp4gcytB_HVm_o5MiBxHEkaviOZpiISOL3L-RoPbn6tYyvXiD65EZsDnrFla0Yt/exec';
window.ScoreSubmission = (() => {
  const pending = new Map();
  window.addEventListener('message', event => {
    let origin;
    try { origin = new URL(event.origin); } catch { return; }
    if (origin.protocol !== 'https:' || !(origin.hostname === 'script.googleusercontent.com' || origin.hostname.endsWith('.googleusercontent.com'))) return;
    const data = event.data;
    if (!data || data.type !== 'logistics-score-result' || typeof data.ok !== 'boolean') return;
    const callback = pending.get(data.requestId);
    if (callback) { pending.delete(data.requestId); callback(data.ok); }
  });
  function show(container, record) {
    container.querySelector('.score-submission')?.remove();
    const card = document.createElement('section');
    card.className = 'score-submission';
    card.style.cssText = 'margin:24px 0;padding:22px;border:1px solid #aabbb4;border-radius:12px;background:#f4f7f1';
    const heading = document.createElement('h2'); heading.textContent = '提交完成紀錄';
    const summary = document.createElement('p'); summary.textContent = `${record.studentName} · ${record.score} / ${record.maxScore} 分`;
    const notice = document.createElement('p'); notice.textContent = '按下提交後，姓名、成績與時間將存入老師的私人試算表。免登入，不會公開顯示學生紀錄。';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'primary'; button.textContent = '提交姓名＋成績';
    const status = document.createElement('p'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const requestId = crypto.randomUUID();
    let sent = false;
    button.addEventListener('click', () => {
      if (sent || pending.has(requestId)) return;
      if (!SCORE_RECEIVER_URL) { status.textContent = '老師尚未完成提交設定，請先保留成績畫面。'; return; }
      button.disabled = true; status.textContent = '正在提交，請稍候…';
      const frame = document.createElement('iframe'); frame.name = 'score-' + requestId; frame.hidden = true; frame.title = '成績提交確認';
      const form = document.createElement('form'); form.method = 'POST'; form.action = SCORE_RECEIVER_URL; form.target = frame.name; form.hidden = true;
      Object.entries({...record, requestId}).forEach(([key, value]) => { const field = document.createElement('input'); field.type = 'hidden'; field.name = key; field.value = String(value); form.append(field); });
      const timer = setTimeout(() => finish(false, true), 45000);
      function finish(ok, timeout = false) {
        clearTimeout(timer); pending.delete(requestId); form.remove(); frame.remove();
        if (ok) { sent = true; button.textContent = '已提交 ✓'; status.textContent = '提交成功！老師已收到你的完成紀錄。'; }
        else { button.disabled = false; status.textContent = timeout ? '尚未收到確認。請確認網路後再按提交；重試同一筆紀錄不會重複登記。' : '提交未成功，請稍後重試，或把成績畫面交給老師。'; }
      }
      pending.set(requestId, ok => finish(ok));
      document.body.append(frame, form); form.submit();
    });
    card.append(heading, summary, notice, button, status); container.prepend(card);
  }
  return {show};
})();

