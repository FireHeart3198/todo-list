const { compareAsc, isBefore, constructNow, addDays, format, addWeeks, addMonths, addYears } = require("date-fns");

class TodoItem {
    nextDueDate;

    constructor(todoInfo) {
        this.populateTodoItem(todoInfo);
    }

    populateTodoItem({title, description, dueDate, priority, repeated, notes, checklist}) {
        this.title = title;
        this.description = description;
        this.dueDate = new Date(dueDate);
        this.priority = priority || "low";
        this.repeated = repeated;
        this.notes = notes;
        this.checklist = checklist;
    }

    set repeated(repeats) {
        if(typeof repeats === "undefined") {
            return
        } 
        let dateToCompare;
        let nextDueDate;
        if (isBefore(this.dueDate, constructNow())) {
            dateToCompare = constructNow();
        } else {
            dateToCompare = this.dueDate;
        }
        // ^ might not need this
        if(repeats === "Daily") {
            nextDueDate = addDays(dateToCompare, 2);
        } else if (repeats === "Weekly") {
            nextDueDate = addWeeks(dateToCompare, 1);
        } else if (repeats === "Fortnightly") {
            nextDueDate = addWeeks(dateToCompare, 2);
        } else if (repeats === "Monthly") {
            nextDueDate = addMonths(dateToCompare, 1);
        } else if (repeats === "Yearly") {
            nextDueDate = addYears(dateToCompare, 1);
        }
        this.nextDueDate = format(nextDueDate, 'yyyy-MM-dd')
        return this._repeated = repeats;
    }
}

class Project {
    itemList = [];
    completedList = [];

    constructor(projectName){
        this.projectName = projectName;
    }

    addItem(item) {
        this.itemList.push(item);
    }

    getItem(itemIndex) {
        return this.itemList[itemIndex];
    }

    deleteItem(itemIndex) {
        this.itemList.splice(itemIndex, 1);
    }

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
            this.itemList.sort((firstTodo, secondTodo) => compareAsc(firstTodo.dueDate, secondTodo.dueDate));
        }
    }

    manualSort(originalIndex, newIndex) {
        const item = this.getItem(originalIndex)
        this.itemList.splice(originalIndex, 1);
        this.itemList.splice(newIndex, 0, item);
    }

    completeItem(itemIndex) {
        const item = this.getItem(itemIndex)
        this.itemList.splice(itemIndex, 1);
        this.completedList.push(item);
    }
}

const projectList = (function() {
    const projectList = [];
    let currentProject;

    const addProject = function(newProject) {
        projectList.push(newProject);
    };

    const getCurrentProject = function() {
        return currentProject;
    };

    const setCurrentProject = function(currentProjectIndex) {
        currentProject = projectList[currentProjectIndex];
    };
    
    const sortProjects = function(originalIndex, newIndex) {
        const item = projectList[originalIndex];
        projectList.splice(originalIndex, 1);
        projectList.splice(newIndex, 0, item);
    };

    return { getCurrentProject, setCurrentProject, addProject, projectList, sortProjects };
})();

function todoCreator(currentProject, todoInfo) {
    const newTodoItem = new TodoItem(todoInfo);
    currentProject.addItem(newTodoItem);
}

function projectCreator(projectName) {
    const newProject = new Project(projectName);
    projectList.addProject(newProject);
}

function todoEditor(currentProject, todoInfo, todoItemIndex) {
    const todoItem = currentProject.getItem(todoItemIndex);
    todoItem.populateTodoItem(todoInfo);
    //Do I expect to get the full todoInfo every time?
}

function projectEditor(currentProject, newProjectName) {
    currentProject.projectName = newProjectName;
}

function moveIntoProject(currentProject, itemIndex, destinationProjectIndex) {
   const itemToBeMoved = currentProject.getItem(itemIndex);
   currentProject.deleteItem(itemIndex);
   const destinationProject = projectList.projectList[destinationProjectIndex];
   destinationProject.addItem(itemToBeMoved);
}