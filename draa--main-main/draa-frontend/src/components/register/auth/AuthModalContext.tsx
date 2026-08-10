import React, { createContext, useContext, useState, useCallback } from "react";

export type AuthModalTab = "student" | "teacher";
export type AuthModalFlow = "login" | "register" | "forgot";

interface AuthModalContextValue {
  isOpen: boolean;
  defaultTab: AuthModalTab;
  defaultFlow: AuthModalFlow;
  openAuthModal: (tab?: AuthModalTab, flow?: AuthModalFlow) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue>({
  isOpen: false,
  defaultTab: "student",
  defaultFlow: "login",
  openAuthModal: () => { },
  closeAuthModal: () => { },
});

export const AuthModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<AuthModalTab>("student");
  const [defaultFlow, setDefaultFlow] = useState<AuthModalFlow>("login");

  const openAuthModal = useCallback((tab: AuthModalTab = "student", flow: AuthModalFlow = "login") => {
    setDefaultTab(tab);
    setDefaultFlow(flow);
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AuthModalContext.Provider value={{ isOpen, defaultTab, defaultFlow, openAuthModal, closeAuthModal }}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => useContext(AuthModalContext);
