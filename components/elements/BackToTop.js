import { useEffect, useState } from "react"

export default function BackToTop() {
    const [hasScrolled, setHasScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => {
            if (window.scrollY > 100) {
                setHasScrolled(true)
            } else {
                setHasScrolled(false)
            }
        }

        window.addEventListener("scroll", onScroll)
        return () => {
            window.removeEventListener("scroll", onScroll)
        }
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    return (
        <>
            {hasScrolled && (
                <button 
                    className="scroll__top scroll-to-target open" 
                    onClick={scrollToTop}
                    style={{ 
                        position: 'fixed', 
                        bottom: '30px',
                        right: '30px',
                        zIndex: 2147483647,
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: '#ff0292',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        transition: 'all 0.3s ease'
                    }}
                    aria-label="Back to top"
                >
                    <i className="fas fa-angle-up"></i>
                </button>
            )}
        </>
    )
}