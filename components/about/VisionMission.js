import styles from './VisionMission.module.css';

export default function VisionMission({ visionContent, missionContent }) {
  const defaultVision = {
    title: 'Our Vision',
    content: `To become the compass for a world in constant motion.

Imagine a future where understanding global change doesn't require sifting through ten thousand articles or trusting algorithms that trap you in echo chambers. Where the most crucial insights, the weak signals that predict seismic shifts, the hidden connections between seemingly unrelated events, the human stories behind the headlines; find you before you even know to look for them.

That's the Corp Crunch of tomorrow: the indispensable intelligence layer for everyone who refuses to be blindsided by change. We're building more than a media platform; we're architecting a new nervous system for collective understanding, where artificial intelligence amplifies human curiosity rather than replacing it, and where storytelling becomes the bridge between what's happening and why it matters to you.

The question isn't whether the world will change. It's whether you'll see it coming.`,
  };

  const defaultMission = {
    title: 'Our Mission',
    content: `We exist to make sense of chaos.

In a world drowning in data but starving for meaning, Corp Crunch cuts through the noise to reveal the patterns that matter. Our mission is audacious yet essential: to transform the overwhelming torrent of global information into crystallized insight that moves hearts, shifts perspectives, and drives action. We don't just report trends; we decode the invisible forces reshaping economies, cultures, and human behavior itself. Through AI-enhanced storytelling that pulses with human truth, we ignite the kind of understanding that sparks innovation, challenges assumptions, and connects people across the fault lines of our fragmented world.

Because in the end, knowledge without emotion is forgotten. Insight without connection is powerless. And stories without a soul are just noise.`,
  };

  const vision = visionContent || defaultVision;
  const mission = missionContent || defaultMission;

  return (
    <section className={styles.visionMission}>
      {/* Top Border */}
      <div className={styles.sectionBorderTop}></div>

      {/* Decorative Shapes */}
      <div className={styles.decorativeShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
      </div>

      {/* Main Content */}
      <div className={styles.contentWrapper}>
        {/* Vision Panel */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>{vision.title || '/Our Vision'}</h2>
          <div className={styles.panelContent}>
            {(vision.content || defaultVision.content).split('\n').map((paragraph, index) => (
              paragraph.trim() && <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Mission Panel */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>{mission.title || '/Our Mission'}</h2>
          <div className={styles.panelContent}>
            {(mission.content || defaultMission.content).split('\n').map((paragraph, index) => {
              // Replace periods with blue dots
              const parts = paragraph.split('.');
              return paragraph.trim() && (
                <p key={index}>
                  {parts.map((part, i) => (
                    i < parts.length - 1 ? (
                      <span key={i}>
                        {part}
                        <span className={styles.blueDot}>.</span>
                      </span>
                    ) : part
                  ))}
                </p>
              );
            })}
          </div>
          {mission.items && mission.items.length > 0 && (
            <ul className={styles.missionList}>
              {mission.items.map((item, index) => (
                <li key={index} className={styles.missionItem}>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

