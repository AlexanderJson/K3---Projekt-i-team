
// Always runs first and applies saved (or default) theme. 
export function initTheme()
{
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (systemDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
}

export function toggleTheme() 
{
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const otherTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', otherTheme);
    localStorage.setItem('theme', otherTheme);

}

export function getTheme()
{    const savedTheme = localStorage.getItem('theme');

    return savedTheme;
}