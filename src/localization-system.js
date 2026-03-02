/**
 * Localization System
 * Multi-language support with translation management and language switching
 */

class LocalizationEntry {
  constructor(key, translations = {}) {
    this.key = key;
    this.translations = translations; // { 'en': 'Hello', 'es': 'Hola', ... }
    this.metadata = {
      context: '', // UI context where this string is used
      maxLength: 0,
      pluralRules: false,
      notes: ''
    };
  }

  addTranslation(language, text) {
    this.translations[language] = text;
  }

  getTranslation(language, defaultText = '') {
    return this.translations[language] || defaultText;
  }

  hasTranslation(language) {
    return Object.prototype.hasOwnProperty.call(this.translations, language);
  }

  serialize() {
    return {
      key: this.key,
      translations: this.translations,
      metadata: this.metadata
    };
  }

  static deserialize(data) {
    const entry = new LocalizationEntry(data.key, data.translations);
    entry.metadata = data.metadata;
    return entry;
  }
}

class LanguagePack {
  constructor(languageCode = 'en', languageName = 'English') {
    this.languageCode = languageCode;
    this.languageName = languageName;
    this.entries = new Map();
    this.metadata = {
      locale: languageCode,
      direction: 'ltr', // ltr or rtl for Arabic, Hebrew, etc.
      region: '',
      nativeName: languageName,
      completionPercentage: 0
    };
  }

  addEntry(key, text) {
    if (!this.entries.has(key)) {
      this.entries.set(key, text);
      return true;
    }
    return false;
  }

  getEntry(key, defaultText = '') {
    return this.entries.get(key) || defaultText;
  }

  updateEntry(key, text) {
    this.entries.set(key, text);
  }

  removeEntry(key) {
    this.entries.delete(key);
  }

  getEntryCount() {
    return this.entries.size;
  }

  getAllEntries() {
    const result = {};
    for (let [key, value] of this.entries) {
      result[key] = value;
    }
    return result;
  }

  serialize() {
    return {
      languageCode: this.languageCode,
      languageName: this.languageName,
      entries: this.getAllEntries(),
      metadata: this.metadata
    };
  }

  static deserialize(data) {
    const pack = new LanguagePack(data.languageCode, data.languageName);
    pack.metadata = data.metadata;
    for (let [key, value] of Object.entries(data.entries)) {
      pack.addEntry(key, value);
    }
    return pack;
  }
}

class LocalizationManager {
  constructor(defaultLanguage = 'en') {
    this.languages = new Map();
    this.currentLanguage = defaultLanguage;
    this.fallbackLanguage = 'en';
    this.supportedLanguages = [];
    this.missingTranslations = [];
    this.formatOptions = {
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h', // 12h or 24h
      numberFormat: 'en-US',
      currencyFormat: 'USD'
    };
  }

  registerLanguage(languageCode, languageName = '') {
    if (!this.languages.has(languageCode)) {
      const pack = new LanguagePack(languageCode, languageName || languageCode);
      this.languages.set(languageCode, pack);
      this.supportedLanguages.push(languageCode);
      return pack;
    }
    return this.languages.get(languageCode);
  }

  setCurrentLanguage(languageCode) {
    if (this.languages.has(languageCode)) {
      this.currentLanguage = languageCode;
      return true;
    }
    console.warn(`Language not registered: ${languageCode}`);
    return false;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getLanguageName() {
    const pack = this.languages.get(this.currentLanguage);
    return pack ? pack.languageName : this.currentLanguage;
  }

  addTranslation(key, language, text) {
    let pack = this.languages.get(language);
    if (!pack) {
      pack = this.registerLanguage(language);
    }
    pack.updateEntry(key, text);
  }

  translate(key, defaultText = '', context = {}) {
    const pack = this.languages.get(this.currentLanguage);
    let text = pack ? pack.getEntry(key, null) : null;

    // Fallback to fallback language if not found
    if (text === null && this.currentLanguage !== this.fallbackLanguage) {
      const fallbackPack = this.languages.get(this.fallbackLanguage);
      text = fallbackPack ? fallbackPack.getEntry(key, null) : null;
    }

    // Fallback to default text
    if (text === null) {
      text = defaultText;
      if (!this.missingTranslations.includes(key)) {
        this.missingTranslations.push(key);
      }
    }

    // Handle string interpolation
    if (context && Object.keys(context).length > 0) {
      for (let [var_name, value] of Object.entries(context)) {
        text = text.replace(new RegExp(`{${var_name}}`, 'g'), value);
      }
    }

    return text;
  }

  t(key, defaultText = '', context = {}) {
    return this.translate(key, defaultText, context);
  }

  // Plural handling
  translatePlural(key, count, defaultText = '') {
    const base = this.translate(key, defaultText);
    // Simple plural handling - more complex systems can override this
    if (count === 1) {
      return base.replace('{count}', '1');
    }
    return base.replace('{count}', count);
  }

  formatTime(date, format = null) {
    if (!format) {
      format = this.formatOptions.timeFormat;
    }
    
    if (format === '12h') {
      return date.toLocaleTimeString('en-US', { hour12: true });
    } else {
      return date.toLocaleTimeString('en-US', { hour12: false });
    }
  }

  formatDate(date, format = null) {
    if (!format) {
      format = this.formatOptions.dateFormat;
    }
    return date.toLocaleDateString(this.currentLanguage);
  }

  formatNumber(number, options = {}) {
    return new Intl.NumberFormat(this.currentLanguage, options).format(number);
  }

  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat(this.currentLanguage, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  exportLanguagePack(languageCode) {
    const pack = this.languages.get(languageCode);
    if (!pack) return null;
    return pack.serialize();
  }

  importLanguagePack(data) {
    const pack = LanguagePack.deserialize(data);
    this.languages.set(pack.languageCode, pack);
    if (!this.supportedLanguages.includes(pack.languageCode)) {
      this.supportedLanguages.push(pack.languageCode);
    }
    return pack;
  }

  exportAllLanguages() {
    const result = {};
    for (let [code, pack] of this.languages) {
      result[code] = pack.serialize();
    }
    return result;
  }

  importAllLanguages(data) {
    for (let [, packData] of Object.entries(data)) {
      this.importLanguagePack(packData);
    }
  }

  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  getLanguagePack(languageCode) {
    return this.languages.get(languageCode);
  }

  getMissingTranslations() {
    return [...this.missingTranslations];
  }

  getTranslationStats(languageCode) {
    const pack = this.languages.get(languageCode);
    if (!pack) return null;

    const totalKeys = new Set();
    for (let [, p] of this.languages) {
      for (let key of p.entries.keys()) {
        totalKeys.add(key);
      }
    }

    return {
      language: languageCode,
      translated: pack.getEntryCount(),
      total: totalKeys.size,
      percentage: Math.round((pack.getEntryCount() / totalKeys.size) * 100)
    };
  }

  getCompletionStats() {
    const stats = [];
    for (let [code] of this.languages) {
      stats.push(this.getTranslationStats(code));
    }
    return stats;
  }

  serialize() {
    return {
      currentLanguage: this.currentLanguage,
      fallbackLanguage: this.fallbackLanguage,
      languages: this.exportAllLanguages(),
      formatOptions: this.formatOptions,
      version: '1.0'
    };
  }

  static deserialize(data) {
    const manager = new LocalizationManager(data.fallbackLanguage);
    manager.currentLanguage = data.currentLanguage;
    manager.importAllLanguages(data.languages);
    manager.formatOptions = data.formatOptions;
    return manager;
  }
}

// Singleton instance for easy global access
let localizationInstance = null;

function getLocalizationManager() {
  if (!localizationInstance) {
    localizationInstance = new LocalizationManager('en');
  }
  return localizationInstance;
}

function t(key, defaultText = '', context = {}) {
  return getLocalizationManager().translate(key, defaultText, context);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LocalizationEntry,
    LanguagePack,
    LocalizationManager,
    getLocalizationManager,
    t
  };
}
