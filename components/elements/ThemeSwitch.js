import { useEffect, useState } from "react"

export default function ThemeSwitch() {
    const [togglETHeme, setTogglETHeme] = useState("light-theme")
    
    useEffect(() => {
        // Only access localStorage on client side
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem("togglETHeme");
            const initialTheme = savedTheme ? JSON.parse(savedTheme) : "light-theme";
            setTogglETHeme(initialTheme);
        }
    }, [])
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
        localStorage.setItem("togglETHeme", JSON.stringify(togglETHeme))
        document.body.classList.add(togglETHeme)
        return () => {
            document.body.classList.remove(togglETHeme)
            }
        }
    }, [togglETHeme])

    return (
        <>
            <nav className="switcher__tab"
                onClick={() => togglETHeme === "light-theme" ? setTogglETHeme("dark-theme") : setTogglETHeme("light-theme")
                }
            >
                <span className="switcher__btn light-mode"><i className="flaticon-sun" /></span>
                <span className="switcher__mode" />
                <span className="switcher__btn dark-mode"><i className="flaticon-moon" /></span>
            </nav>
        </>
    )
}
