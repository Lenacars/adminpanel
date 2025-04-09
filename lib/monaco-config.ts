// Monaco Editor için web worker yapılandırması
export function configureMonaco() {
  if (typeof window !== "undefined") {
    window.MonacoEnvironment = {
      getWorkerUrl: (_moduleId, label) => {
        if (label === "json") {
          return "/monaco-editor/json.worker.js"
        }
        if (label === "css" || label === "scss" || label === "less") {
          return "/monaco-editor/css.worker.js"
        }
        if (label === "html" || label === "handlebars" || label === "razor") {
          return "/monaco-editor/html.worker.js"
        }
        if (label === "typescript" || label === "javascript") {
          return "/monaco-editor/ts.worker.js"
        }
        return "/monaco-editor/editor.worker.js"
      },
    }
  }
}

