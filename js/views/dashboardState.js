export class dashboardState
{

    
    constructor(state)
    {
        this.state = state;
        this.FAVORITES_KEY = "dashboard:favorites";
        this.FILTER_KEY = "dashboardViewFilter"
    }


    
    loadFavorites()
    {
    return JSON.parse(localStorage.getItem(this.FAVORITES_KEY) || "[]");
    }

    saveFavorites(favorites)
    {
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    }

     normalizeFavorites(favorites, people)
    {
    return favorites.filter(name => people.includes(name));
    }

     loadCurrentFilter()
    {
        const placeholder = "Team";
        return localStorage.getItem(this.FILTER_KEY) || placeholder;
    }

     saveCurrentFilter(filter)
    {
        localStorage.setItem(this.FILTER_KEY, filter);
    }

    getWeeklyTarget() {
        return this.state.settings?.weeklyTarget || 5;
    }



     getTasks()
    {
        return this.state.tasks || [];
    }

     getPeople()
    {
    // FILTRERING: Ta bort "Ingen" från listan över personer som ska visas
    const people = (this.state.people || []).filter(p => p !== "Ingen"); 
    return people;
    }

     getTeam()
    {
        const placeholder = "Mitt Team";
        return this.state.settings?.teamName || placeholder;
    }

    getState()
    {
    const tasks = this.getTasks();
    const people = this.getPeople();
    const teamName = this.getTeam();
    const rawFavorites = this.loadFavorites();
    const currentFilter = this.loadCurrentFilter();
    const favorites = this.normalizeFavorites(rawFavorites, people);
    this.saveFavorites(favorites);
    return {tasks,people,teamName,favorites,currentFilter}
    }
}