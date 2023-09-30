let projects = [];
let currentProject;
let timer;

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

   if (currentProject) {
      localStorage.setItem("currentProject", JSON.stringify(currentProject));
   }
}

/**
 * @description Load Projects from local storage
 */
function loadProjects() {
   let projectsString = localStorage.getItem("projects");
   projects = projectsString != null ? JSON.parse(projectsString) : [];
   // convert objects to Project instances
   projects = projects.map((obj) => new Project(obj.name, obj.hourPrice, obj.totalTimeInSeconds, obj.timeScaler ?? 0));
   updateProjectList();

   // load current project
   let currentProjectStr = localStorage.getItem("currentProject");
   let parsedCurrentProject = currentProjectStr ? JSON.parse(currentProjectStr) : null;
   if (parsedCurrentProject) {
      currentProject = projects.find((p) => p.name === parsedCurrentProject.name);
   }
}

/**
 * @description calculate total money based on projects
 */
function calculateTotalMoney() {
   let totalMoney = 0;
   for (let i = 0; i < projects.length; i++) {
      totalMoney += parseFloat(projects[i].getTotalPrice());
   }
   totalMoney = totalMoney.toFixed(2);
   return totalMoney;
}

/**
 * @description update total money ui
 */
function updateTotalMoneyUI() {
   $("#total-money").html(`(Total = $${calculateTotalMoney()})`);
}

/**
 * @description stop the timer of the current project
 */
function stopCurrentProject() {
   // check if there is a current project
   if (!currentProject) return;

   // currrent project has a value
   let msg = "Are you sure you want to stop project [" + currentProject.name + "] ?";
   let confirm = window.confirm(msg);
   if (!confirm) return;

   // stop current project interval
   currentProject.stopInterval();
   updateUI(false);
}

/**
 * @description edit time scaler for a given project
 * @param {string} name of project
 * @returns
 */
function editTimeScaler(name) {
   let project = projects.find((p) => p.name === name);
   if (!project) return;

   let newTimeScaler = prompt("Enter new time scaler", project.timeScaler);
   newTimeScaler = parseFloat(newTimeScaler);
   if (isNaN(newTimeScaler)) return;


   project.setTimeScaler(newTimeScaler);

   updateUI(true);
}

/**
 * @description start the timer of the project by its name
 * @param {string} name the name of the project
 */
function startProject(name) {
   let msg = "Are you sure you want to start project [" + name + "] ?";
   let confirm = window.confirm(msg);
   if (!confirm) return;

   // stop current project interval
   if (currentProject) {
      currentProject.stopInterval();
   }

   // change current project
   let proj = projects.find((p) => p.name === name);
   if (!proj) {
      alert("Project not found!");
      return;
   }
   currentProject = proj;

   // start current project interval
   updateUI(false);
   currentProject.startInterval();
}

/**
 * @description reset project's total work time by the name of project
 * @param name the name of the project
 */
function resetProject(name) {
   let msg = "Are you sure you want to reset the time of project [" + name + "] ?";
   let confirm = window.confirm(msg);
   if (!confirm) return;

   let proj = projects.find((p) => p.name === name);
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

   // check if the current project is the same as the one we want to delete
   // then stop the current project
   // then empty current project
   let foundProject = projects.find((p) => p.name === name);
   if (foundProject.name === currentProject?.name) {
      stopCurrentProject();
      currentProject = null;
   }
   // delete priejct
   projects = projects.filter((p) => p.name != name);
   updateUI(true);
}

function updateUI(withSave = true) {
   if (withSave) {
      saveProjects();
   }
   updateCurrentProjectUI();
   updateProjectList();
   updateTotalMoneyUI();
}

/**
 * @description update current project UI
 */
function updateCurrentProjectUI() {
   let elm = $("#current");
   if (currentProject) {
      elm.html(currentProject.getCurrentProjectUIHtml());
   } else {
      elm.html("<h1>No Current Project Selected</h1>");
   }
}

function updateProjectList() {
   let projectsContainer = $("#projects-container");
   projectsContainer.empty();
   let htmlContent = "";
   for (let i = 0; i < projects.length; i++) {
      htmlContent += projects[i].getElementHtml();
   }

   projectsContainer.html(htmlContent);
}

/**
 * @description add new project to project list
 * @returns void
 */
function addProject() {
   let name = window.prompt("Enter Project Name");
   name = name.trim();
   let foundProjectByName = projects.find((p) => p.name === name);
   if (foundProjectByName) {
      alert("Project is already exists!");
      return;
   }

   let hourPrice = window.prompt("Enter Hour Price");
   hourPrice = parseFloat(hourPrice);

   let totalTimeInMinutes = window.prompt("Enter minutes done:") || "0";
   let totalTimeInSeconds = parseInt(totalTimeInMinutes) * 60;

   projects.push(new Project(name, hourPrice, totalTimeInSeconds));

   updateUI(true);
}

/**
 * @description a class that represents a project
 */
class Project {
   _currentInterval = null;


   constructor(name, hourPrice, totalTimeInSeconds = 0, timeScaler = 0) {
      this.name = name;
      this.hourPrice = hourPrice;
      this.totalTimeInSeconds = totalTimeInSeconds;
      this.timeScaler = timeScaler;
   }

   /**
    * @description change time scaler
    * @param {number} scaler
    */
   setTimeScaler(scaler) {
      this.timeScaler = scaler
   }

   /**
    * @description start project's timer
    */
   startInterval() {
      this._currentInterval = true;
      this.totalTimeInSeconds++;
      updateUI(true);

      this._currentInterval = setInterval(() => {
         this.totalTimeInSeconds++;
         updateUI(true);
      }, 1000 / this.timeScaler);
   }

   /**
    * @description stop project's timer
    */
   stopInterval() {
      clearInterval(this._currentInterval);
      this._currentInterval = null;
      updateUI(true);
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
      let remainingSeconds = this.totalTimeInSeconds % 3600;
      return {
         h: Math.floor(this.totalTimeInSeconds / 3600),
         m: Math.floor(remainingSeconds / 60),
         s: remainingSeconds % 60,
      };
   }

   /**
    * @description return the total price of the working hours
    * @returns {number}
    */
   getTotalPrice() {
      let totalHours = this.totalTimeInSeconds / 3600;
      let totalPrice = this.hourPrice * totalHours;
      return totalPrice.toFixed(2);
   }
   // gnu emacs

   /**
    * @description return the time and price in string format
    * @returns {string}
    */
   getTimeAndPriceString() {
      let timeInfo = this.getTimeInfo();
      let totalPrice = this.getTotalPrice();

      let hString = timeInfo.h.toString().padStart(4, "0");
      let mString = timeInfo.m.toString().padStart(2, "0");
      let sString = timeInfo.s.toString().padStart(2, "0");

      return `[ x${this.timeScaler} ] - ${hString}h, ${mString}m, ${sString}s = ${totalPrice}$`;
   }

   // 0xWaleed

   /**
    *
    * @default get the action button html code to render based on current project status
    * @returns {string} action button html code (start/stop)
    */
   getActionButtonsHtml() {
      if (this._currentInterval) {
         return `<button onclick="stopCurrentProject()" class="red-btn">STOP</button>`;
      } else {
         return `<button onclick="startProject('${this.name}')" class="btn">START</button>`;
      }
   }

   /**
    *  @description get the html code with project info for current project card
    * @returns html code
    */
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
            ${this.getActionButtonsHtml()}
        </div>
        `;
   }

   /**
    * @description returns the html code for the project card (used in project list)
    * @returns html code
    */
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
                <button onclick="startProject('${this.name}')" class="action-btn bg-primary">Start</button>
                <button onclick="editTimeScaler('${this.name}')" class="action-btn bg-purple">Scaler</button>
                <button onclick="resetProject('${this.name}')" class="action-btn bg-orange">Reset</button>
                <button onclick="deleteProject('${this.name}')" class="action-btn bg-red">Delete</button>
            </div>
        </div>
        `;
   }
}
