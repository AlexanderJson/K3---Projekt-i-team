class UserService 
{
    constructor(repo)
    {
        this.key = "people";
        this.people = [];
        this.repo = repo;
    }

    init()
    {
        this.people = this.repo.get(this.key);
    }

    addUser(...data)
    {

    }

    


}