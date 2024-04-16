const { compareAsc, isBefore, constructNow, addDays, format, addWeeks, addMonths, addYears } = require("date-fns");

class TodoItem {
    nextDueDate;

    constructor(todoInfo) {
        this.populateTodoItem(todoInfo);
    }

    populateTodoItem({title, description, dueDate, priority, repeated, notes, checklist}) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority || "low";
        this.repeated = repeated;
        this.notes = notes;
        this.checklist = checklist;
    }

    set repeated(repeats) {
        if(repeats === "none") {
            return
        } 
        let dateToCompare;
        let nextDueDate;
        if (isBefore(this.dueDate, constructNow())) {
            dateToCompare = constructNow();
        } else {
            dateToCompare = new Date(this.dueDate);
        }
        // ^ might not need this
        if(repeats === "daily") {
            nextDueDate = addDays(dateToCompare, 1);
        } else if (repeats === "weekly") {
            nextDueDate = addWeeks(dateToCompare, 1);
        } else if (repeats === "fortnightly") {
            nextDueDate = addWeeks(dateToCompare, 2);
        } else if (repeats === "monthly") {
            nextDueDate = addMonths(dateToCompare, 1);
        } else if (repeats === "yearly") {
            nextDueDate = addYears(dateToCompare, 1);
        }
        this.nextDueDate = format(nextDueDate, 'yyyy-MM-dd')
        return this._repeated = repeats;
    }
}

class Collection {
    itemList = [];

    constructor(collectionName) {
        this.collectionName = collectionName;
    }

    addItem(newItem) {
        this.itemList.push(newItem);
    }

    searchItemList(id) {
        for (let i = 0; i < this.itemList.length; i++) {
            if (this.itemList[i].id === id) {
                return {
                    item: this.itemList[i].item,
                    index: i,
                };
            }
        }
    }

    getItem(id) {
        return this.searchItemList(id).item;
    }

    getItemList() {
        return this.itemList;
    }

    deleteItem(id) {
        const itemIndex = this.searchItemList(id).index;
        this.itemList.splice(itemIndex, 1);
    }

    sortItemsManually(originalPositionId, afterItemId) {
        const item = this.searchItemList(originalPositionId).item;
        const itemIndex = this.searchItemList(originalPositionId).index;
        const newIndex = this.searchItemList(afterItemId).index + 1;
        this.itemList.splice(itemIndex, 1);
        this.itemList.splice(newIndex, 0, item);
    }
}

class Project extends Collection {
    
    sortBy(sortMethod) {
        if (sortMethod === "Alphabetical") {
            this.itemList.sort((firstTodo, secondTodo) => {
                const firstTitle = firstTodo.title.toUpperCase();
                const secondTitle = secondTodo.title.toUpperCase();
                if (firstTitle < secondTitle) {
                    return -1;
                }
                if (firstTitle > secondTitle) {
                    return 1;
                }
                return 0;
            });
        } else if (sortMethod === "Due date") {
            this.itemList.sort((firstTodo, secondTodo) => {
                compareAsc(firstTodo.dueDate, secondTodo.dueDate)
            });
        }
    }
}

class ProjectList extends Collection {
    currentProject;

    getCurrentProject() {
        return this.currentProject;
    }

    setCurrentProject(currentProjectId) {
        this.currentProject = this.searchItemList(currentProjectId).item;
    }
}

const projectList = new ProjectList("Project List");
    //see how this works with storage


export { projectList, Project, TodoItem}