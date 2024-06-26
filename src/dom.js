import { checkChecklistItem, manualMoveProject, manualMoveWithinProject, moveIntoProject, populateProjectCollection, projectCreator, projectEditor, projectList, rescheduleTodo, setDefault, sortItemsBy, todoCreator, todoEditor, updateCurrentProject, updateStorage } from "./app";
import { createTodoForm } from "./create-todo-form";
import { createProjectList } from "./create-project-list";
import { createTodoList } from "./create-todo-list";
import { createProjectForm } from "./edit-project-name-form";
import { createMoveMenu } from "./create-move-menu";

let currentProject;

//todos
const newTodoItemButton = document.querySelector('.project-heading .add-todo-button');
const todoArea = document.querySelector('.todo-area');

//drag and drop
todoArea.addEventListener('dragover', e => {
    manualSorting(e, todoArea, "todo", "todo-id")
});

//todo functions
function getTodoInfo(e) {
    const data = e.formData;
    const todoItemInfo = [];
    for(let value of data.values()) {
        todoItemInfo.push(value);
    }
    return todoItemInfo
}

function getTodoIdFromDom(e) {
    return e.target.closest('[data-todo-id]').dataset.todoId;
}

function renderTodoList() {
    clearTodoArea();
    todoArea.append(createTodoList());

    const todoViewButtons = todoArea.querySelectorAll('button');

    todoViewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const todoId = getTodoIdFromDom(e);
            //check this
            renderTodoForm("edit", todoId);
        });
    });

    const todoCompleteButtons = todoArea.querySelectorAll('[type="checkbox"]');

    todoCompleteButtons.forEach(button => {
        button.addEventListener('click', e => {
            e.target.parentNode.classList.toggle('completed');
        })
    });

    const todoChecklist = todoArea.querySelectorAll('.todo-checklist');

    todoChecklist.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const todoId = getTodoIdFromDom(e);
            const index = e.target.dataset.checklistIndex;
            checkChecklistItem(currentProject, todoId, index);
            updateStorage();
        })
    })

    const todoItem = todoArea.querySelectorAll('.todo-item');
    const contextMenu = document.querySelector('.context-menu.todo-menu');

    todoItem.forEach(item => {
        item.addEventListener('contextmenu', e => {
            e.preventDefault();
            const x = e.pageX;
            const y = e.pageY;
            contextMenu.classList.add('show');
            contextMenu.setAttribute('data-todo-id', getTodoIdFromDom(e));
            //check this
            contextMenu.style.top = `${y}px`
            contextMenu.style.left = `${x}px`
        });
        item.addEventListener('dragstart', () => {
            item.classList.add('dragging');
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            renderTodoList();
        })
    });

    document.addEventListener('click', e => {
        if (!e.target.closest('.context-menu')) {
            closeMenus();
        }
        if (!e.target.closest('.sort-menu-button')) {
            sortMenu.style.display = "none";
        }
    });

    window.addEventListener('resize', () => {
        closeMenus();
        sortMenu.style.display = "none";
    });
}


function checkCompleted() {
    const completedTodos = todoArea.querySelectorAll('.completed.todo-item');

    completedTodos.forEach(todo => {
        const todoId = todo.dataset.todoId;
        const item = currentProject.getItem(todoId)
        if(item.repeated !== "none") {
            rescheduleTodo(currentProject, todoId)
        } else {
            moveIntoProject(currentProject, todoId, "00000000-0000-0000-0000-000000000000");
        }
    });

    updateStorage();
}

function clearTodoArea() {
    todoArea.replaceChildren();
}

//todo form
newTodoItemButton.addEventListener("click", () => {
    renderTodoForm("new");
})

function renderTodoForm(type, id) {
    clearTodoArea();
    todoArea.append(createTodoForm(type, id));

    let form;

    if (type === "new") {
        form = todoArea.querySelector('form');
        form.addEventListener("formdata", e => {
            const todoItemInfo = getTodoInfo(e);
            todoCreator(currentProject, undefined, undefined, ...todoItemInfo);
            updateStorage();
        });
    } else if (type === "edit") {
        form = todoArea.querySelector('form')
        form.addEventListener("formdata", e => {
            const todoId = e.target.dataset.todoId;
            const todoItemInfo = getTodoInfo(e);
            todoEditor(currentProject, todoId, ...todoItemInfo);
            updateStorage();
        });
    }

    const cancelButton = todoArea.querySelector('.cancel');
    const confirmButton = todoArea.querySelector('.confirm');

    cancelButton.addEventListener("click", e => {
        todoFormReset(e);
    })
        
    confirmButton.addEventListener("click", e => {
        console.log(form)
        new FormData(form);
        todoFormReset(e);
    })

    function todoFormReset(e) {
        e.preventDefault();
        form.reset(); 
        //do I need this?^
        renderTodoList();
    }
}

//project
const projectNameHolder = document.querySelector('.project-heading h1');

projectNameHolder.addEventListener('dblclick', () => {
    projectNameHolder.textContent = ""
    projectNameHolder.append(createProjectForm())
    
    const projectNameForm = projectNameHolder.querySelector('form');
    const confirmButton = projectNameHolder.querySelector('.confirm');
        
    confirmButton.addEventListener("click", e => {
        e.preventDefault();
        new FormData(projectNameForm);
        renderCurrentProjectName();
        renderProjectList();
    });

    projectNameForm.addEventListener("formdata", e => {
        const newProjectName = e.formData.get("project-name");
        projectEditor(currentProject, newProjectName);
        updateStorage();
    });
});

//project functions
function renderCurrentProjectName() {
    projectNameHolder.textContent = currentProject.collectionName;
}

function loadProject() {
    renderCurrentProjectName();
    renderTodoList();
}

//project list
const projectListHolder = document.querySelector('nav .start');

function renderProjectList() {
    projectListHolder.replaceChildren();
    projectListHolder.append(createProjectList());

    const projects = projectListHolder.querySelectorAll('.project');
    const contextMenu = document.querySelector('.context-menu.project-menu')

    projects.forEach(project => {
        project.addEventListener('click', projectCallback);
        project.addEventListener('contextmenu', e => {
            e.preventDefault();
            const x = e.pageX;
            const y = e.pageY;
            contextMenu.classList.add('show');
            const id = e.target.dataset.projectId;
            contextMenu.setAttribute('data-project-id', id);
            //check this
            contextMenu.style.top = `${y}px`
            contextMenu.style.left = `${x}px`
        });
        project.addEventListener('dragstart', () => {
            project.classList.add('dragging');
        });
        project.addEventListener('dragend', () => {
            project.classList.remove('dragging');
            renderProjectList();
        });
    });
}

const completedProject = document.querySelector('.completed');

completedProject.addEventListener('click', projectCallback);

function projectCallback(e) {
    checkCompleted();
    currentProject = updateCurrentProject(e.target.dataset.projectId);
    updateStorage();
    loadProject();
}

projectListHolder.addEventListener('dragover', e => {
    manualSorting(e, projectListHolder, "project-list", "project-id");
});


const newProjectButton = document.querySelector('nav button');
const newProjectFormDialog = document.querySelector("dialog.form");
const newProjectForm = document.querySelector('dialog form');
const confirmNewProjectButton = newProjectForm.querySelector('.confirm');

newProjectButton.addEventListener('click', () => {
    newProjectFormDialog.showModal();
});

newProjectForm.addEventListener('formdata', e => {
    const newProjectName = e.formData.get("project-name");
    projectCreator(newProjectName);
    updateStorage();
});

confirmNewProjectButton.addEventListener('click', (e) => {
    e.preventDefault();
    new FormData(newProjectForm);
    newProjectFormDialog.close();
    newProjectForm.reset();
    renderProjectList();
});

//sorting

function manualSorting(e, area, type, idType) {
    e.preventDefault();
    const elementAbove = getElementAboveDraggable(e.y, area);
    const draggable = document.querySelector('.dragging');
    const itemToSortId = draggable.getAttribute(`data-${idType}`);
    const space = document.createElement('div');
    space.classList.add('space');
    const currentSpaces = document.querySelectorAll('.space');
    let functionCall;
    if (type === "todo") {
        functionCall = function(originalPositionId, afterItemId) {
            manualMoveWithinProject(originalPositionId, afterItemId);
            updateStorage();
        }
    } else {
        functionCall = function(originalPositionId, afterItemId) {
            manualMoveProject(originalPositionId, afterItemId);
            updateStorage();
        }
    }
    if (elementAbove === undefined) {
        functionCall(itemToSortId);
        if (currentSpaces.length > 0) {
            currentSpaces.forEach(space => {
                if (space !== space.parentNode.firstElementChild) {
                    space.remove()
                }
            });
        }
        if (currentSpaces.length === 0) {
            area.prepend(space);
        }
    } else {
        const elementAboveId = elementAbove.getAttribute(`data-${idType}`);
        functionCall(itemToSortId, elementAboveId);
        if (currentSpaces.length > 0) {
            currentSpaces.forEach(space => {
                if (space !== elementAbove.nextSibling) {
                    space.remove()
                }
            });
        }
        if (currentSpaces.length === 0) {
            elementAbove.after(space);
        }
    }
}

function getElementAboveDraggable(y, area) {
    const otherDraggableElements = [...area.querySelectorAll('[draggable="true"]:not(.dragging)')];
    return otherDraggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset > 0 && offset < closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest
        }
    }, { offset: Number.POSITIVE_INFINITY }).element;
}

//context menu

const menus = document.querySelectorAll('.menu');
const todoContextMenu = document.querySelector('.context-menu.todo-menu');

function closeMenus() {
    menus.forEach(menu => {
        menu.classList.remove('show');
        if (menu.classList.contains('move')) {
            moveOption.replaceChildren();
            moveOption.textContent = "Move Todo";
            todoContextMenu.removeChild(menu)
        }
    });
}
//not sold on this, check later

const projectDeleteOption = document.querySelector('.project-menu .delete');

projectDeleteOption.addEventListener('click', e => {
    e.preventDefault();
    const projectId = e.target.closest('[data-project-id]').dataset.projectId;
    projectList.deleteItem(projectId);
    //might put pop up "do you want to delete" here
    closeMenus();
    renderProjectList();
})

const todoDeleteOption = document.querySelector('.todo-menu .delete');

todoDeleteOption.addEventListener('click', e => {
    e.preventDefault();
    const todoId = getTodoIdFromDom(e);
    currentProject.deleteItem(todoId);
    //might put pop up "do you want to delete" here
    closeMenus();
    renderTodoList();
})

const moveOption = document.querySelector('.move');

moveOption.addEventListener('click', e => {
    if (todoContextMenu.classList.contains('show')) {
        showMoveMenu(e);
    }
});

function showMoveMenu(e) {
    e.preventDefault();
    const todoId = getTodoIdFromDom(e);
    const x = e.x;
    const y = e.y;
    e.target.append(createMoveMenu(x, y));
    const projects = document.querySelectorAll('.available-projects');
    projects.forEach(project => {
        project.addEventListener('click', () => {
            moveIntoProject(currentProject, todoId, project.dataset.projectId);
            updateStorage();
            moveOption.replaceChildren();
            moveOption.textContent = "Move Todo";
            closeMenus();
            renderTodoList();
        });
    });
}

//sort menu
const sortMenuButton = document.querySelector('.sort-menu-button');
const sortMenu = document.querySelector('.sort-menu ul')
const sortMenuItems = document.querySelectorAll('.sort-menu li');

sortMenuButton.addEventListener('click', () => {
    sortMenu.style.display = "block";
});

sortMenuItems.forEach(item => {
    item.addEventListener('click', e => {
        sortItemsBy(currentProject, e.target.textContent)
        updateStorage();
        renderTodoList();
        sortMenu.style.display = "none";
    })
})

//update storage on page change 
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === "hidden") {
        updateStorage();
    }
})

//does current project in dom and in app components get updated properly??

//on page load
// console.log(JSON.parse(localStorage.getItem('projectList')))
if (!localStorage.getItem('projectList')) {
    populateProjectCollection('new');
    currentProject = setDefault();
    updateStorage();
    console.log(projectList)
} else {
    populateProjectCollection('stored');
    console.log(projectList)
    currentProject = projectList.getCurrentProject();
    console.log(projectList.getCurrentProject())
}
loadProject();
renderProjectList();

//remember to check how this works with storage