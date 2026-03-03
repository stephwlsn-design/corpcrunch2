import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import styles from '@/components/events/PartnershipModal.module.css';

export default function PartnershipApplication() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        location: '',
        partnershipType: '',
        companyName: '',
        jobTitle: '',
        phoneNumber: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch('/api/partnerships', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setSuccess(true);
            // Reset form on success
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                location: '',
                partnershipType: '',
                companyName: '',
                jobTitle: '',
                phoneNumber: '',
                message: ''
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Head>
                <title>Application Form | Corp Crunch Events</title>
                <meta name="description" content="Apply for speaker, exhibitor, or strategic partnership opportunities at Corp Crunch AIX Summit." />
            </Head>

            <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '100px 20px 60px', display: 'flex', justifyContent: 'center' }}>
                <div className={styles.modalContent} style={{ width: '100%', maxWidth: '800px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', borderRadius: '16px' }}>

                    <div style={{ marginBottom: '30px' }}>
                        <Link href="/events" style={{ color: '#2551e7', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            Back to Events
                        </Link>
                    </div>

                    <h1 className={styles.modalTitle} style={{ fontSize: '36px', textAlign: 'left', marginBottom: '10px' }}>Application Form</h1>
                    <p style={{ color: '#666', marginBottom: '40px', fontSize: '16px', lineHeight: '1.6' }}>Fill out the form below to apply for a speaker slot, exhibition booth, or strategic partnership tier at the AIX Summit. Our team will review your application and get in touch with you shortly.</p>

                    {success ? (
                        <div className={styles.successMessage} style={{ padding: '40px' }}>
                            <h3 style={{ fontSize: '24px', marginBottom: '16px', color: '#2f855a' }}>Application Submitted!</h3>
                            <p>Thank you for your interest in partnering with us. Your partnership request has been submitted successfully. We will review your application and our team will get back to you soon.</p>

                            <Link href="/events" passHref>
                                <button className={styles.submitButton} style={{ marginTop: '30px' }}>
                                    Return to Event Details
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <form className={styles.formContainer} onSubmit={handleSubmit}>
                            <div className={styles.formGroupRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="firstName">First Name *</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="lastName">Last Name *</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email">Work Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroupRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="phoneNumber">Phone Number *</label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="location">Location (City/Country) *</label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroupRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="companyName">Company Name *</label>
                                    <input
                                        type="text"
                                        id="companyName"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="jobTitle">Job Title *</label>
                                    <input
                                        type="text"
                                        id="jobTitle"
                                        name="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="partnershipType">Partnership Type *</label>
                                <select
                                    id="partnershipType"
                                    name="partnershipType"
                                    value={formData.partnershipType}
                                    onChange={handleChange}
                                    required
                                    className={styles.pSelect}
                                >
                                    <option value="" disabled>Select Option</option>
                                    <option value="Speaker">Speaker</option>
                                    <option value="Partner">Partner</option>
                                    <option value="Exhibitor">Exhibitor</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="message">Message (Optional)</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="Tell us what you are looking to achieve through this partnership..."
                                ></textarea>
                            </div>

                            {error && <div className={styles.errorMessage}>{error}</div>}

                            <button type="submit" className={styles.submitButton} disabled={loading} style={{ padding: '16px 32px', fontSize: '18px', marginTop: '20px' }}>
                                {loading ? 'Submitting Application...' : 'Submit Application'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </Layout>
    );
}
