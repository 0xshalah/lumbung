import { createContext, useContext, useEffect, useState } from "react";
import { copy } from "./copy";

const LangCtx = createContext({ lang: "en", t: copy.en, setLang: () => {} });

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("lumbung-lang") || "en");
  useEffect(() => {
    localStorage.setItem("lumbung-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t: copy[lang] }}>{children}</LangCtx.Provider>;
};

export const useLang = () => useContext(LangCtx);
