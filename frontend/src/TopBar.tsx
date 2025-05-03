import { NavLink } from "react-router-dom";
import { Button } from "./components/ui/button";

export default function TopBar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white">
            <div className="container flex h-16 items-center justify-between">
                <NavLink to="/">
                    <div className="flex items-center gap-2 pl-6">
                        <span className="font-bold text-2xl text-primary">Siikli</span>
                        <span className="text-sm font-medium text-muted-foreground">ERP</span>
                    </div>
                </NavLink>
                <nav className="hidden md:flex gap-6 items-center">
                    <a
                        href="#ominaisuudet"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Ominaisuudet
                    </a>
                    <a
                        href="#hinnoittelu"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Hinnoittelu
                    </a>
                    <a
                        href="#tuki"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Tuki
                    </a>
                    <NavLink
                        to="/yhteystiedot"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Yhteystiedot
                    </NavLink>
                </nav>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <a href="#demo">Kokeile demoa</a>
                    </Button>
                    <Button size="sm" asChild>
                        <a href="#kirjaudu">Kirjaudu sisään</a>
                    </Button>
                </div>
            </div>
        </header>
    )
}