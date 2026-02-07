import Image from 'next/image';
import styles from './TeamMembers.module.css';

export default function TeamMembers() {
  const teamMembers = [
    { name: 'Steph Wilson', role: 'Founder & CEO', image: '/assets/img/others/Professional photo (28).png' },
    { name: 'Alexander Wilkinson', role: 'Senior Sales Director', image: '/assets/img/others/Professional photo (29).png' },
  ];

  const advisors = [
    { name: 'Malay Kumar', role: 'Event and Sponsorship Advisor', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600' },
    { name: 'Amit Singh', role: 'Fractional CFO', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600' },
  ];
  const TechTeam = [
    { name: 'Aditya Telsinge', role: 'Full Stack Developer', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600' },
    
  ];

  return (
    <section className={styles.teamSection}>
      <div className={styles.container}>
        
        {/* --- TEAM MEMBERS SECTION --- */}
        <div className={styles.sectionHeader}>
          <span className={styles.label}>EXPERTISE</span>
          <h2 className={styles.title}>Explore our comprehensive team</h2>
        </div>

        <div className={styles.grid}>
          {/* Blue Highlight Card for Team */}
          <div className={styles.blueCard}>
            <p className={styles.blueRole}>Leadership Team</p>
            <p className={styles.blueDesc}>
              Steph leads our vision as founder, while Alex drives our global 
              outreach through innovative sales and marketing strategies.
            </p>
          </div>

          {teamMembers.map((member, index) => (
            <div key={index} className={styles.memberCard}>
              <div className={styles.imageWrapper}>
                <Image src={member.image} alt={member.name} fill className={styles.memberImage} />
                <div className={styles.nameOverlay}>
                  <h4 className={styles.nameText}>{member.name}</h4>
                  <span className={styles.RoleText}>{member.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- ADVISORS SECTION --- */}
        <div className={styles.sectionHeader} style={{ marginTop: '100px' }}>
          <span className={styles.label}>STRATEGY</span>
          <h2 className={styles.title}>Industry Advisors</h2>
        </div>

        <div className={styles.grid}>
          {/* Blue Highlight Card for Advisors */}
          <div className={styles.blueCard}>
            <p className={styles.blueRole}>Strategic Council</p>
            <p className={styles.blueDesc}>
              Our advisors bring decades of experience in global policy and 
              technological innovation to guide our long-term roadmap.
            </p>
          </div>

          {advisors.map((advisor, index) => (
            <div key={index} className={styles.memberCard}>
              <div className={styles.imageWrapper}>
                <Image src={advisor.image} alt={advisor.name} fill className={styles.memberImage} />
                <div className={styles.nameOverlay}>
                  <h4 className={styles.nameText}>{advisor.name}</h4>
                  <span className={styles.RoleText}>{advisor.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- TECH TEAM SECTION --- */}
        <div className={styles.sectionHeader} style={{ marginTop: '100px' }}>
          <span className={styles.label}>TECH</span>
          <h2 className={styles.title}>Tech Team</h2>
        </div>
        <div className={styles.grid}>
        <div className={styles.blueCard}>
            <p className={styles.blueRole}>Tech Team</p>
            <p className={styles.blueDesc}>
              Our tech team is responsible for the development of our platform and the implementation of our technology.
            </p>
          </div>

        
          {TechTeam.map((member, index) => (
            <div key={index} className={styles.memberCard}> 
              <div className={styles.imageWrapper}>
                <Image src={member.image} alt={member.name} fill className={styles.memberImage} />
                <div className={styles.nameOverlay}>
                  <h4 className={styles.nameText}>{member.name}</h4>
                  <span className={styles.RoleText}>{member.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}