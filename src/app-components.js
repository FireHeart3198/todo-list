const { compareAsc, isBefore, constructNow, addDays, format, addWeeks, addMonths, addYears } = require("date-fns");

class TodoItem {
    nextDueDate;
    checklistCompleted = [];

    constructor(todoInfo) {
        this.populateTodoItem(todoInfo);
    }

    populateTodoItem({title, description, dueDate, priority, repeated, _repeated, notes, checklistOriginal, checklistCompleted}) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority || "low";
        this.repeated = _repeated || repeated;
        this.notes = notes;
        this.checklistOriginal = checklistOriginal;
        this.checklistFormatted = checklistOriginal;
        this.checkThroughChecklist(checklistCompleted);
    }

    get repeated() {
        return this._repeated
    }

    set repeated(repeats) {
        if(repeats === "none") {
            this._repeated = repeats;
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
        this._repeated = repeats;
    }

    get checklistFormatted() {
        return this._checklistFormatted;
    }

    set checklistFormatted(checklist) {
        this._checklistFormatted = checklist.split('\n');
    }

    checkThroughChecklist(checklistCompleted) {
        if (checklistCompleted) {
            this.checklistCompleted = checklistCompleted;
        } else {
            if (this.checklistFormatted.length < this.checklistCompleted.length) {
                this.checklistCompleted.splice(this.checklistFormatted.length)
            }
            for (let i = 0; i < this.checklistFormatted.length; i++) {
                if (this.checklistCompleted[i] === undefined) {
                    this.checklistCompleted.push('unchecked');
                }
            }
        }
    }

    reschedule() {
        this.dueDate = this.nextDueDate;
        this.repeated = this.repeated;
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
        if(this.searchItemList(id) !== undefined) {
            return this.searchItemList(id).item;
        }
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
        let newIndex;
        if (afterItemId === undefined) {
            newIndex = 0;
        } else {
            newIndex = this.searchItemList(afterItemId).index + 1;
        }
        this.itemList.splice(itemIndex, 1);
        this.itemList.splice(newIndex, 0, {item: item, id: originalPositionId });
    }
}

class Project extends Collection {
    
    sortBy(sortMethod) {
        if (sortMethod === "Alphabetical") {
            this.itemList.sort((firstTodo, secondTodo) => {
                const firstTitle = firstTodo.item.title.toUpperCase();
                const secondTitle = secondTodo.item.title.toUpperCase();
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
                return compareAsc(firstTodo.item.dueDate, secondTodo.item.dueDate)
            });
        }
    }
}

class ProjectList extends Collection {
    currentProject;
    currentProjectId;

    getCurrentProject() {
        return this.currentProject;
    }

    getCurrentProjectId() {
        return this.currentProjectId;
    }

    setCurrentProject(currentProjectId) {
        this.currentProject = this.searchItemList(currentProjectId).item;
        this.currentProjectId = currentProjectId;
    }
}

export { ProjectList, Project, TodoItem}