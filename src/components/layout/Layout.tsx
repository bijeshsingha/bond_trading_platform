import React from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased selection:bg-blue-500/30">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden bg-background">
                <header className="h-16 border-b border-border bg-card/50 backdrop-blur px-8 flex items-center justify-between z-10">
                    <h2 className="text-lg font-semibold text-foreground/80">
                        Market Overview
                    </h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                            Market Status: <span className="text-green-400 font-bold tracking-wide">OPEN</span>
                        </span>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8 relative">
                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
