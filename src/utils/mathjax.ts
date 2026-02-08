// MathJax configuration and utility functions

declare global {
    interface Window {
        MathJax: any;
    }
}

// Check if MathJax is already handled by index.html script, but here we config it
if (typeof window !== 'undefined') {
    window.MathJax = {
        tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true,
            processEnvironments: true
        },
        options: {
            skipHtmlTags: ['script', 'style', 'textarea', 'pre', 'code'],
            ignoreHtmlClass: 'tex2jax_ignore',
            processHtmlClass: 'tex2jax_process'
        }
    };
}

export const renderMath = (element: HTMLElement | null) => {
    if (element && window.MathJax && window.MathJax.typesetPromise) {
        return window.MathJax.typesetPromise([element]);
    }
};

export const renderMathContent = (content: string) => {
    if (!content) return '';
    // Escape HTML and render LaTeX
    return content.replace(/\$([^$]+)\$/g, (match, math) => {
        return match; // MathJax will process this
    });
};
