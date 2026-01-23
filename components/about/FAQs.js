import { useState } from 'react';
import styles from './FAQs.module.css';

export default function FAQs({ faqs }) {
  const defaultFAQs = [
    {
      question: 'What makes your agency different from others?',
      answer: 'We combine clean, strategic design with scalable development — always tailored to your goals, not just trends. Every project is handled by a dedicated team focused on your success.',
    },
    {
      question: 'How long have you been in business?',
      answer: 'We have been serving clients since 2012, with over 10 years of industry experience.',
    },
    {
      question: 'Who will be working on my project?',
      answer: 'Your project will be handled by our dedicated team of experts, including designers, developers, and project managers.',
    },
    {
      question: 'Where is your team located?',
      answer: 'We are based in the USA with team members across different time zones.',
    },
    {
      question: 'Do you work with startups or only large companies?',
      answer: 'We work with businesses of all sizes, from startups to large enterprises.',
    },
    {
      question: 'How can I get started with a project?',
      answer: 'You can get started by contacting us through our contact form or email. We will schedule a consultation to discuss your project needs.',
    },
  ];

  const displayFAQs = faqs && faqs.length > 0 ? faqs : defaultFAQs;
  const [expandedIndex, setExpandedIndex] = useState(0); // First FAQ expanded by default

  const toggleFAQ = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className={styles.faqsSection}>
      {/* Top Border */}
      <div className={styles.sectionBorderTop}></div>

      {/* Main Content */}
      <div className={styles.contentWrapper}>
        {/* Title Section */}
        <div className={styles.titleSection}>
          <div className={styles.titleIcon}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="8" y="8" width="24" height="24" rx="4" fill="url(#gradient)" />
              <text x="20" y="26" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">?</text>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9ca3af" />
                  <stop offset="100%" stopColor="#6b7280" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2 className={styles.title}>FAQs</h2>
        </div>

        {/* FAQs List */}
        <div className={styles.faqsList}>
          {displayFAQs.map((faq, index) => (
            <div
              key={index}
              className={`${styles.faqItem} ${expandedIndex === index ? styles.faqItemExpanded : ''}`}
            >
              <button
                className={styles.faqQuestion}
                onClick={() => toggleFAQ(index)}
                aria-expanded={expandedIndex === index}
              >
                <span className={styles.faqQuestionText}>{faq.question}</span>
                <span className={styles.faqToggle}>
                  {expandedIndex === index ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <line x1="4" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <line x1="10" y1="4" x2="10" y2="16" stroke="currentColor" strokeWidth="2" />
                      <line x1="4" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </span>
              </button>
              {expandedIndex === index && (
                <div className={styles.faqAnswer}>
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

