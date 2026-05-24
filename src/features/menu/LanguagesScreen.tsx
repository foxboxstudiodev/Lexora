import { LanguageCode, translations } from '../i18n/translations';
import { getLanguageSelectorItems } from './languageSelectorModel';

type LanguagesScreenProps = {
  language: LanguageCode;
  disabled?: boolean;
  onLanguageChange: (language: LanguageCode) => void;
  onBack: () => void;
};

export function LanguagesScreen({ language, disabled = false, onLanguageChange, onBack }: LanguagesScreenProps) {
  const labels = translations[language];
  const languages = getLanguageSelectorItems();

  return (
    <section className="screen-panel" aria-labelledby="languages-title">
      <div className="screen-header">
        <div>
          <p className="eyebrow">LEXORA</p>
          <h2 id="languages-title">{labels.languages}</h2>
          <p className="subtitle">{labels.subtitle}</p>
        </div>
        <button className="icon-button" onClick={onBack} aria-label={labels.back} disabled={disabled}>
          ←
        </button>
      </div>

      <div className="language-grid" aria-label={labels.languages}>
        {languages.map((item) => (
          <button
            key={item.code}
            className={item.code === language ? 'language-card active' : 'language-card'}
            onClick={() => onLanguageChange(item.code)}
            aria-pressed={item.code === language}
            disabled={disabled}
          >
            <strong>{item.label}</strong>
            <span>{item.code.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
