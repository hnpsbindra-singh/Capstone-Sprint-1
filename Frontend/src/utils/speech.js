// Web Speech Synthesis API Voice Guidance Utility
export const speakText = (text, lang = 'en-US') => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this browser.');
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Language mapping
  const langMap = {
    EN: 'en-US',
    ES: 'es-ES',
    HI: 'hi-IN',
    FR: 'fr-FR'
  };
  utterance.lang = langMap[lang] || 'en-US';

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
