import { useLocation } from 'react-router-dom';

export function useIsActive(path: string) {
    const location = useLocation();
    return location.pathname === path;
}
