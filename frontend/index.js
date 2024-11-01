import { backend } from "declarations/backend";

// Initialize Feather icons
feather.replace();

const sourceText = document.getElementById('sourceText');
const targetLang = document.getElementById('targetLang');
const translateBtn = document.getElementById('translateBtn');
const translationOutput = document.getElementById('translationOutput');
const speakBtn = document.getElementById('speakBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const historyList = document.getElementById('historyList');

// MyMemory Translation API endpoint
const API_URL = 'https://api.mymemory.translated.net/get';

// Function to show/hide loading spinner
const toggleLoading = (show) => {
    loadingSpinner.classList.toggle('hidden', !show);
};

// Function to translate text
async function translateText() {
    const text = sourceText.value.trim();
    const lang = targetLang.value;
    
    if (!text) return;

    toggleLoading(true);
    
    try {
        const response = await fetch(
            `${API_URL}?q=${encodeURIComponent(text)}&langpair=en|${lang}`
        );
        const data = await response.json();
        
        if (data.responseStatus === 200) {
            const translation = data.responseData.translatedText;
            translationOutput.textContent = translation;
            
            // Store translation in backend
            await backend.addTranslation(text, lang, translation);
            await updateHistory();
        } else {
            translationOutput.textContent = 'Translation error. Please try again.';
        }
    } catch (error) {
        translationOutput.textContent = 'Network error. Please try again.';
        console.error('Translation error:', error);
    } finally {
        toggleLoading(false);
    }
}

// Function to speak text
function speakText() {
    const text = translationOutput.textContent;
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang.value;
    window.speechSynthesis.speak(utterance);
}

// Function to format timestamp
function formatTimestamp(timestamp) {
    return new Date(Number(timestamp) / 1000000).toLocaleString();
}

// Function to update history
async function updateHistory() {
    try {
        const history = await backend.getHistory();
        historyList.innerHTML = history.reverse().slice(0, 5).map(([source, lang, translation, timestamp]) => `
            <div class="history-item">
                <p><strong>Original:</strong> ${source}</p>
                <p><strong>Translation (${lang}):</strong> ${translation}</p>
                <p class="timestamp">${formatTimestamp(timestamp)}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching history:', error);
    }
}

// Event listeners
translateBtn.addEventListener('click', translateText);
speakBtn.addEventListener('click', speakText);
sourceText.addEventListener('input', () => {
    if (sourceText.value.trim()) {
        translateText();
    }
});

// Initialize history on page load
updateHistory();
