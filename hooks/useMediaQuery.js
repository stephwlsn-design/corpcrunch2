import { useState, useEffect } from "react";

const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        // Create a MediaQueryList object from the provided query string
        const mediaQueryList = window.matchMedia(query);

        // Define a function to update the state based on the query's match status
        const handleMediaChange = (event) => {
            setMatches(event.matches);
        };

        // Set the initial state
        setMatches(mediaQueryList.matches);

        // Attach the listener for changes in the query's match status
        mediaQueryList.addEventListener("change", handleMediaChange);

        // Clean up listener on component unmount
        return () => {
            mediaQueryList.removeEventListener("change", handleMediaChange);
        };
    }, [query]);

    return matches;
};

export default useMediaQuery;
