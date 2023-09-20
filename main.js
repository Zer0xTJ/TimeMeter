// name (input)
// hourPrice (input)
// totalTime
// getPrice() -> totalHours * hourPrice

let projects = [];
let currentProject;

// when the page loads, load all projects
$(document).ready(() => {
    loadProjects();
    updateUI();
});


/**
 * @description save projects
 */
function saveProjects() {
    let projectsString = JSON.stringify(projects);
    localStorage.setItem("projects", projectsString);
}

/**
 * @description Load Projects from local storage
 */
function loadProjects() {
    let projectsString = localStorage.getItem("projects")
    projects = projectsString != null ? JSON.parse(projectsString) : [];
    // convert objects to Project instances
    projects = projects.map(obj => new Project(obj.name, obj.hourPrice, obj.totalTimeInSeconds));
    // projects.push(new Project("Demo", 22, 1800))
    updateProjectList();
}

function startProject(name) {
    let msg = "Are you sure you want to start project [" + name + "] ?";
    let confirm = window.confirm(msg);
    if (!confirm) return;

    let proj = projects.find(p => p.name === name);
    if (!proj) {
        alert("Project not found!");
        return;
    }
    currentProject = proj;
    updateUI(false);
    // TODO: start project timer
    // startProjectTimer();
}

/**
 * @description reset project's total work time by the name of project
 * @param name the name of the project
 */
function resetProject(name) {
    let msg = "Are you sure you want to reset the time of project [" + name + "] ?";
    let confirm = window.confirm(msg);
    if (!confirm) return;

    let proj = projects.find(p => p.name === name);
    if (!proj) {
        alert("Project not found!");
        return;
    }
    // found
    proj.reset();
    // update ui and local storage
    updateUI(true);
}


/**
 * @description delete project by name
 * @param name the name of the project
 */
function deleteProject(name) {
    let msg = "Are you sure you want to delete project [" + name + "] ?";
    let confirm = window.confirm(msg);
    if (!confirm) return;
    projects = projects.filter(p => p.name != name);
    updateUI(true);
}

function updateUI(withSave = true) {
    if (withSave) {
        saveProjects();
    }
    updateCurrentProjectUI();
    updateProjectList();
}

/**
 * @description update current project UI
 */
function updateCurrentProjectUI() {
    let elm = $("#current");
    if (currentProject) {
        elm.html(currentProject.getCurrentProjectUIHtml())
    } else {
        elm.html("<h1>No Current Project Selected</h1>")
    }
}


function updateProjectList() {
    let projectsContainer = $("#projects-container");
    projectsContainer.empty();
    let htmlContent = "";
    for (let i = 0; i < projects.length; i++) {
        htmlContent += projects[i].getElementHtml()
    }

    projectsContainer.html(htmlContent);
}


function addProject() {
    let name = window.prompt("Enter Project Name");
    name = name.trim();
    let foundProjectByName = projects.find(p => p.name === name)
    if (foundProjectByName) {
        alert("Project is already exists!");
        return;
    }

    let hourPrice = window.prompt("Enter Hour Price");
    hourPrice = parseFloat(hourPrice);
    projects.push(new Project(name, hourPrice));

    updateUI(true);

}


class Project {
    constructor(name, hourPrice, totalTimeInSeconds = 0) {
        this.name = name;
        this.hourPrice = hourPrice;
        this.totalTimeInSeconds = totalTimeInSeconds;
    }

    /**
     * @description reset the total time spent
     */
    reset() {
        this.totalTimeInSeconds = 0;
    }

    /**
     * @description return the time info , hours, minutes and seconds
     * @returns {{s: number, h: number, m: number}}
     */
    getTimeInfo() {
        return {
            h: Math.floor(this.totalTimeInSeconds / 3600),
            m: Math.floor(this.totalTimeInSeconds % 3600) / 60,
            s: this.totalTimeInSeconds % 60,
        }
    }

    /**
     * @description return the total price of the working hours
     * @returns {number}
     */
    getTotalPrice() {
        let totalHours = this.totalTimeInSeconds / 3600;
        return this.hourPrice * totalHours;
    }


    /**
     * @description return the time and price in string format
     * @returns {string}
     */
    getTimeAndPriceString() {
        let timeInfo = this.getTimeInfo();
        let totalPrice = this.getTotalPrice();

        let hString = timeInfo.h.toString().padStart(4, '0');
        let mString = timeInfo.m.toString().padStart(2, '0');
        let sString = timeInfo.s.toString().padStart(2, '0');

        return `${hString}h, ${mString}m, ${sString}s = ${totalPrice}$`;

    }

    // 0xWaleed

    getCurrentProjectUIHtml() {
        return `
        <div>
            <span class="small-txt">Current Project</span>
            <div class="project-name">
                <h2>${this.name} (<span class="price">$${this.hourPrice}</span>)</h2>
            </div>
            <span class="large-txt">${this.getTimeAndPriceString()}</span>
            <br/>
            <br/>
            <br/>
            <button class="red-btn">STOP</button>
        </div>
        `
    }


    getElementHtml() {
        return `
        <div class="project-card">
            <div class="project-info">
                <h2>${this.name} (<span class="price">$${this.hourPrice}</span>)</h2>
                <div class="time-info">
                    <span class="small-txt">${this.getTimeAndPriceString()}</span>
                </div>
            </div>
            <div class="action-buttons">
                <button onclick="startProject('${this.name}')" class="action-btn bg-primary">Start</buttono>
                <button onclick="resetProject('${this.name}')" class="action-btn bg-orange">Reset</button>
                <button onclick="deleteProject('${this.name}')" class="action-btn bg-red">Delete</button>
            </div>
        </div>
        `
    }
}