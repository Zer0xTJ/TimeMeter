// name (input)
// hourPrice (input)
// totalTime
// getPrice() -> totalHours * hourPrice

let projects = [];

function updateProjectList(){
   let projectsContainer = $("#projects-container");
   projectsContainer.empty();
   let htmlContent = "";
   for(let i = 0; i < projects.length; i++){
       htmlContent += projects[i].getElementHtml()
   }
   
   projectsContainer.html(htmlContent);
}


function addProject(){
    let name = window.prompt("Enter Project Name");
    let hourPrice = window.prompt("Enter Hour Price");
    hourPrice = parseFloat(hourPrice);
    projects.push(new Project(name, hourPrice));
    updateProjectList();
    
}







class Project {
    constructor(name, hourPrice) {
        this.name = name;
        this.hourPrice = hourPrice;
        this.totalTimeInSeconds = 0;
    }

    /**
     * Description reset the total time spent
     */
    reset(){
        this.totalTimeInSeconds = 0;
    }

    /**
     * Description return the time info , hours, minutes and seconds
     * @returns {{s: number, h: number, m: number}}
     */
    getTimeInfo(){
        return {
            h: Math.floor(this.totalTimeInSeconds / 3600),
            m: Math.floor(this.totalTimeInSeconds % 3600) / 60,
            s: this.totalTimeInSeconds % 60,
        }
    }

    /**
     * Description return the total price of the working hours
     * @returns {number}
     */
    getTotalPrice() {
        let totalHours = this.totalTimeInSeconds / 3600;
        return this.hourPrice * totalHours;
    }

    
    /**
     * Description return the time and price in string format
     * @returns {string}
     */
    getTimeAndPriceString(){
        let timeInfo = this.getTimeInfo();
        let totalPrice = this.getTotalPrice();
        
        let hString = timeInfo.h.toString().padStart(4, '0');
        let mString = timeInfo.m.toString().padStart(2, '0');
        let sString = timeInfo.s.toString().padStart(2, '0');
        
        return `${hString}:${mString}:${sString} = ${totalPrice}$`;
        
    }
    
    
    getElementHtml(){
        return `
        <div class="project-card">
            <div class="project-info">
                <h2>${this.name} (<span class="price">$${this.hourPrice}</span>)</h2>
                <div class="time-info">
                    <span class="small-txt">${this.getTimeAndPriceString()}</span>
                </div>
            </div>
            <div class="action-buttons">
                <button class="action-btn bg-primary">Start</button>
                <button class="action-btn bg-orange">Reset</button>
                <button class="action-btn bg-red">Delete</button>
            </div>
        </div>
        `
    }
}