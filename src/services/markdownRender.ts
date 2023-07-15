//@ts-nocheck
import markdown from "markdown-it";
import hljs from "highlight.js";

window.copyToClipboard = (e) => {
  const str = e.target.dataset.code;
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    return
  }
  navigator.clipboard.writeText(str).then(() => {
    alert("复制成功")
  })
}
const md = markdown({
  html: true,
  linkify: true,
  xhtmlOut: true,
  typographer: true,

  highlight: function (str, lang) {
    const value = hljs.highlight(str, {
      language: lang || "html",
      ignoreIllegals: true,
    }).value;
    const lines = value.split(/\n/).slice(0, -1);
    const html = lines
      .map((item, i) => {
        return `<div data-line="${i + 1}">${item}</div>`;
      })
      .join("");
    if (lang && hljs.getLanguage(lang)) {
      return `<pre class="bg-black p-4 mb-4 leading-6"><code>${html}</code></pre>`;
    }
    return `<pre class="bg-black p-4 mb-4 leading-6"><code>${html}</code></pre>`;
  },
});

md.disable("code");
md.core.ruler.before("normalize", "isHtml", (state) => {
  let startText = "<!DOCTYPE html>";
  let endText = "</html>";
  let str = state.src.trim();
  if (
    str.slice(0, startText.length) === startText ||
    str.slice(str.length - 7) === endText
  ) {
    let str = "```html\n" + state.src + "\n```";
    state.src = str;
  }
});
let defaultRender = md.renderer.rules.fence;
md.renderer.rules.fence = function (tokens, idx, options, env, self) {
  const t = md.utils.escapeHtml(tokens[idx].content);
  // 传递 token 到默认的渲染器。
  return `<div class="rounded bg-black/50 font-sans text-sm"><div class="flex items-center justify-between py-1.5 px-4"><span class="text-xs lowercase text-white">${
    tokens[idx].info
  }</span><div class="flex items-center">
          <button
            class="flex gap-1.5 items-center rounded bg-none p-1 text-xs text-white"
            data-code="${t}"
            onclick="copyToClipboard(event)"
            >
            复制
          </button>
        </div></div>${defaultRender(tokens, idx, options, env, self)}</div>`;
};

export default md;
