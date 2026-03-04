"use client";

import { useContext, useState } from "react";
import { PrimeReactContext } from "primereact/api";
import { Button } from "primereact/button";

// import Cookies from "js-cookie";

export default function ThemeSwitcher() {
  const light = "lara-light-blue"; //"lara-light-blue"
  const darkd = "lara-dark-purple"; //"lara-dark-purple"
  const [currentTheme, setCurrentTheme] = useState(light);

  const context = useContext(PrimeReactContext) as {
    changeTheme?: (
      currentTheme: string,
      newTheme: string,
      linkElementId: string,
      callback: () => void,
    ) => void;
  };

  if (!context) {
    return (
      <p>
        PrimeReactContext not available. Make sure PrimeReactProvider is set.
      </p>
    );
  }

  const handleThemeChange = () => {
    const newTheme = currentTheme === light ? darkd : light;
    const linkElementId = "theme-link";
    const linkElement = document.getElementById("theme-link");

    if (linkElement && context?.changeTheme) {
      context.changeTheme(currentTheme, newTheme, linkElementId, () => {
        console.log(`Theme changed to ${newTheme}`);
        setCurrentTheme(newTheme); // update state
      });
    } else {
      console.warn("changeTheme is not available. Is PrimeReactProvider set?");
    }
  };

  return (
    <div>
      <Button
        icon={currentTheme === darkd ? "pi pi-sun" : "pi pi-moon"}
        className="w-6 h-6 scale-65"
        severity="secondary"
        rounded
        tooltip="Toggle Theme"
        onClick={handleThemeChange}
      />
    </div>
  );
}
