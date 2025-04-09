// Monaco Editor için web worker yapılandırması
export function configureMonaco() {
  if (typeof window !== "undefined") {
    window.MonacoEnvironment = {
      getWorkerUrl: (moduleId, label) => {
        if (label === "json") {
          return "/_next/static/chunks/monaco-editor/json.worker.js"
        }
        if (label === "css" || label === "scss" || label === "less") {
          return "/_next/static/chunks/monaco-editor/css.worker.js"
        }
        if (label === "html" || label === "handlebars" || label === "razor") {
          return "/_next/static/chunks/monaco-editor/html.worker.js"
        }
        if (label === "typescript" || label === "javascript") {
          return "/_next/static/chunks/monaco-editor/ts.worker.js"
        }
        return "/_next/static/chunks/monaco-editor/editor.worker.js"
      },
    }
  }
}

