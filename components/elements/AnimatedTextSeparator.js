import { useEffect } from 'react';
import styles from './AnimatedTextSeparator.module.css';

export default function AnimatedTextSeparator() {
  useEffect(() => {
    // Load Smooch Sans font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Smooch+Sans:wght@400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const texts = ['CORP CRUNCH', 'BUILD REPUTATION', 'TRACK ROI'];

  return (
    <div className={styles.separator}>
      <div className={styles.textContainer}>
        {/* Render 3 sets for seamless infinite loop - no gaps */}
        {Array.from({ length: 3 }).map((_, setIndex) => (
          texts.map((text, textIndex) => (
            <span 
              key={`set${setIndex}-${textIndex}`} 
              className={styles.animatedText}
              aria-hidden={setIndex > 0}
            >
              {text}
            </span>
          ))
        ))}
      </div>
    </div>
  );
}

