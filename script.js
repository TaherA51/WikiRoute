class WikiRouteUI {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentRoute = null;
    }

    initializeElements() {
        this.startArticleInput = document.getElementById('startArticle');
        this.endArticleInput = document.getElementById('endArticle');
        this.algorithmSelect = document.getElementById('algorithm');
        this.findRouteBtn = document.getElementById('findRoute');
        this.clearResultsBtn = document.getElementById('clearResults');
        this.loadingSection = document.getElementById('loadingSection');
        this.resultsSection = document.getElementById('resultsSection');
        this.errorSection = document.getElementById('errorSection');
        this.routeDistance = document.getElementById('routeDistance');
        this.algorithmUsed = document.getElementById('algorithmUsed');
        this.routePath = document.getElementById('routePath');
        this.errorMessage = document.getElementById('errorMessage');
        this.copyRouteBtn = document.getElementById('copyRoute');
        this.saveRouteBtn = document.getElementById('saveRoute');
        this.tryAgainBtn = document.getElementById('tryAgain');
    }

    bindEvents() {
        this.findRouteBtn.addEventListener('click', () => this.findRoute());
        this.clearResultsBtn.addEventListener('click', () => this.clearResults());
        this.copyRouteBtn.addEventListener('click', () => this.copyRoute());
        this.saveRouteBtn.addEventListener('click', () => this.saveRoute());
        this.tryAgainBtn.addEventListener('click', () => this.hideError());

        this.startArticleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.findRoute();
        });
        this.endArticleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.findRoute();
        });

        this.startArticleInput.addEventListener('input', () => this.validateInputs());
        this.endArticleInput.addEventListener('input', () => this.validateInputs());
    }

    validateInputs() {
        const startValid = this.startArticleInput.value.trim().length > 0;
        const endValid = this.endArticleInput.value.trim().length > 0;
        
        this.findRouteBtn.disabled = !(startValid && endValid);
        
        if (startValid && endValid) {
            this.findRouteBtn.classList.remove('disabled');
        } else {
            this.findRouteBtn.classList.add('disabled');
        }
    }

    async findRoute() {
        const startArticle = this.startArticleInput.value.trim();
        const endArticle = this.endArticleInput.value.trim();
        const algorithm = this.algorithmSelect.value;

        if (!startArticle || !endArticle) {
            this.showError('Please enter both starting and target articles.');
            return;
        }

        if (startArticle.toLowerCase() === endArticle.toLowerCase()) {
            this.showError('Starting and target articles must be different.');
            return;
        }

        this.showLoading();
        this.hideResults();
        this.hideError();

        try {
            const response = await fetch('/api/find-route', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    startArticle: startArticle,
                    endArticle: endArticle,
                    algorithm: algorithm
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.displayRoute(data.route);
            } else {
                this.showError(data.error || 'An error occurred while finding the route.');
            }
        } catch (error) {
            this.showError('Network error. Please check your connection and try again.');
        }
    }







    displayRoute(route) {
        this.currentRoute = route;
        
        this.routeDistance.textContent = route.distance;
        this.algorithmUsed.textContent = route.algorithm;
        
        this.routePath.innerHTML = '';
        
        route.path.forEach((article, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'path-step';
            
            const stepNumber = document.createElement('div');
            stepNumber.className = 'step-number';
            stepNumber.textContent = index + 1;
            
            const stepArticle = document.createElement('a');
            stepArticle.className = 'step-article';
            stepArticle.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(article)}`;
            stepArticle.target = '_blank';
            stepArticle.textContent = article;
            
            stepDiv.appendChild(stepNumber);
            stepDiv.appendChild(stepArticle);
            
            if (index < route.path.length - 1) {
                const arrow = document.createElement('span');
                arrow.className = 'step-arrow';
                arrow.textContent = '→';
                stepDiv.appendChild(arrow);
            }
            
            this.routePath.appendChild(stepDiv);
        });
        
        this.hideLoading();
        this.showResults();
    }

    showLoading() {
        this.loadingSection.classList.remove('hidden');
        this.findRouteBtn.disabled = true;
        this.findRouteBtn.textContent = 'Searching...';
    }

    hideLoading() {
        this.loadingSection.classList.add('hidden');
        this.findRouteBtn.disabled = false;
        this.findRouteBtn.textContent = 'Find Route';
    }

    showResults() {
        this.resultsSection.classList.remove('hidden');
        this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    hideResults() {
        this.resultsSection.classList.add('hidden');
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorSection.classList.remove('hidden');
        this.hideLoading();
        this.errorSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    hideError() {
        this.errorSection.classList.add('hidden');
    }

    clearResults() {
        this.startArticleInput.value = '';
        this.endArticleInput.value = '';
        this.hideResults();
        this.hideError();
        this.currentRoute = null;
        this.validateInputs();
        this.startArticleInput.focus();
    }

    copyRoute() {
        if (!this.currentRoute) return;
        
        const routeText = this.currentRoute.path.join(' → ');
        const fullText = `WikiRoute: ${this.currentRoute.path[0]} → ${this.currentRoute.path[this.currentRoute.path.length - 1]}\n\nPath (${this.currentRoute.distance} steps):\n${routeText}\n\nAlgorithm: ${this.currentRoute.algorithm}`;
        
        navigator.clipboard.writeText(fullText).then(() => {
            this.showCopySuccess();
        }).catch(() => {
            this.fallbackCopyTextToClipboard(fullText);
        });
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showCopySuccess();
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        
        document.body.removeChild(textArea);
    }

    showCopySuccess() {
        const originalText = this.copyRouteBtn.textContent;
        this.copyRouteBtn.textContent = 'Copied!';
        this.copyRouteBtn.style.backgroundColor = '#28a745';
        this.copyRouteBtn.style.borderColor = '#28a745';
        
        setTimeout(() => {
            this.copyRouteBtn.textContent = originalText;
            this.copyRouteBtn.style.backgroundColor = '';
            this.copyRouteBtn.style.borderColor = '';
        }, 2000);
    }

    saveRoute() {
        if (!this.currentRoute) return;
        
        const routeData = {
            ...this.currentRoute,
            savedAt: new Date().toISOString()
        };
        
        const savedRoutes = JSON.parse(localStorage.getItem('wikiRoutes') || '[]');
        savedRoutes.push(routeData);
        localStorage.setItem('wikiRoutes', JSON.stringify(savedRoutes));
        
        const originalText = this.saveRouteBtn.textContent;
        this.saveRouteBtn.textContent = 'Saved!';
        this.saveRouteBtn.style.backgroundColor = '#28a745';
        this.saveRouteBtn.style.borderColor = '#28a745';
        
        setTimeout(() => {
            this.saveRouteBtn.textContent = originalText;
            this.saveRouteBtn.style.backgroundColor = '';
            this.saveRouteBtn.style.borderColor = '';
        }, 2000);
    }

    getSavedRoutes() {
        return JSON.parse(localStorage.getItem('wikiRoutes') || '[]');
    }

    clearSavedRoutes() {
        localStorage.removeItem('wikiRoutes');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const wikiRouteUI = new WikiRouteUI();
    
    window.wikiRouteUI = wikiRouteUI;
    
    const examples = [
        { start: 'Albert Einstein', end: 'Pizza' },
        { start: 'Shakespeare', end: 'Quantum Physics' },
        { start: 'Ancient Rome', end: 'Computer Science' },
        { start: 'Dinosaurs', end: 'Space Exploration' }
    ];
    
    const exampleContainer = document.createElement('div');
    exampleContainer.className = 'example-suggestions';
    exampleContainer.innerHTML = `
        <h3 style="margin: 15px 0 10px 0; font-size: 14px; color: #54595d;">Try these examples:</h3>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            ${examples.map(ex => `
                <button class="wiki-button secondary" style="font-size: 11px; padding: 4px 8px;" 
                        onclick="loadExample('${ex.start}', '${ex.end}')">
                    ${ex.start} → ${ex.end}
                </button>
            `).join('')}
        </div>
    `;
    
    const inputSection = document.querySelector('.input-section');
    inputSection.parentNode.insertBefore(exampleContainer, inputSection.nextSibling);
    
    window.loadExample = (start, end) => {
        wikiRouteUI.startArticleInput.value = start;
        wikiRouteUI.endArticleInput.value = end;
        wikiRouteUI.validateInputs();
        wikiRouteUI.findRoute();
    };
});

const style = document.createElement('style');
style.textContent = `
    .example-suggestions {
        margin-bottom: 20px;
        padding: 15px;
        background-color: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 3px;
    }
    
    .wiki-button.disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .wiki-button.disabled:hover {
        background-color: #ffffff;
        border-color: #a2a9b1;
    }
`;
document.head.appendChild(style); 