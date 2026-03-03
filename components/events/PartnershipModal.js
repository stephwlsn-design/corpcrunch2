import { useState } from 'react';
import styles from './PartnershipModal.module.css';

export default function PartnershipModal({ isOpen, onClose }) {
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

    if (!isOpen) return null;

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
            setTimeout(() => {
                onClose();
                setSuccess(false); // reset for next time
            }, 3000)
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <h2 className={styles.modalTitle}>Strategic Partnership Details</h2>

                {success ? (
                    <div className={styles.successMessage}>
                        Thank you! Your partnership request has been submitted successfully. We will get back to you soon.
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
                                rows="4"
                            ></textarea>
                        </div>

                        {error && <div className={styles.errorMessage}>{error}</div>}

                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
