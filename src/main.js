import "./style.css";

// Get the necessary DOM elements
const plantListElement = document.getElementById("plant-list");
const inputNewPlant = document.getElementById("new-plant");
const plantNav = document.getElementById("plant-nav");
const popupCancel = document.getElementById("cancel-popup");
const popupConfirm = document.getElementById("confirm-popup");
const markAllWatered = document.getElementById("mark-all-watered");
const clearThirsty = document.getElementById("clear-thirsty");
const activePlantsCount = document.getElementById("plant-count");
let popupPlantName = ""; 

// Helper function to create a new array with the existing plants and a new plant item
const addPlant = (plants, newPlantText, newPlantId, watering, last) => [
  ...plants,
  { id: newPlantId, 
    text: newPlantText,
    thirsty: (daysSince(last) >= Number(watering)), 
    recommendedWatering: "every " + watering + " days",
    lastWatered: daysSince(last) + " days ago",
  }
];

const showPopUp = (newPlantText) => {

  popupPlantName = newPlantText;

  document.getElementById("popup-title").textContent = `Add ${newPlantText} details`;

  document.getElementById("popup-watering").value = "";

  document.getElementById("popup-modal").classList.remove("hidden");
  document.getElementById("popup-watering").focus();

};

const newPlant = () => {
  const wateringValue = document.getElementById("popup-watering").value.trim();
  let lastWateredValue = document.getElementById("popup-last-watered").value.trim();

  if (!lastWateredValue) {
    lastWateredValue = new Date().toISOString(); // Default to today if no date is provided
  }

  plantApp.addPlant(popupPlantName, wateringValue, lastWateredValue);
  hidePopUp();
  renderPlants();

}

const hidePopUp = () => {
  document.getElementById("popup-modal").classList.add("hidden");
  document.getElementById("popup-watering").value = "";
  document.getElementById("popup-last-watered").value = "";
}

const daysSince = (date) => {
  const today = new Date();
  const differenceInMilliseconds = today.getTime() - new Date(date).getTime();

  return Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
};

// Helper function to toggle the Thirsty status of a plant item
const togglePlant = (plants, plantId) =>
  plants.map((plant) =>
    plant.id === plantId ? { ...plant, thirsty: false, lastWatered: daysSince(new Date) + " days ago"} : plant,
  );

// Helper function to filter plants based on the current filter setting
const filterPlants = (plants, filter) => {
  switch (filter) {
    case "all":
      return [...plants];
    case "thirsty":
      return plants.filter((plant) => plant.thirsty);
    case "watered":
      return plants.filter((plant) => !plant.thirsty);
  }
};

// Helper function to mark all plants as watered
const markAllPlantsWatered = (plants) => {
  return plants.map((plant) => {
    return { ...plant, thirsty: false };
  });
};

// Helper function to delete all Thirsty plants
const deleteThirstyPlants = (plants) => {
  return plants.filter((plant) => !plant.thirsty);
};

// Factory function to create a plant app
const createPlantApp = () => {
  // Define the state of our app
  let plants = [];
  let nextPlantId = 1;
  let filter = "all"; // can be 'all', 'active', or 'Thirsty'

  return {
    addPlant: (newPlantText, watering, last) => {
      plants = addPlant(plants, newPlantText, nextPlantId++, watering, last);
    },
    togglePlant: (plantId) => {
      plants = togglePlant(plants, plantId);
    }, 
    setFilter: (newFilter) => {
      filter = newFilter;
    },
    markAllWatered: () => {
      plants = markAllPlantsWatered(plants);
    },
    deleteThirsty: () => {
      plants = deleteThirstyPlants(plants);
    },
    getNumberOfActivePlants: () =>
      plants.reduce((acc, plant) => acc + plant.thirsty, 0),
    getPlants: () => filterPlants(plants, filter),
  };
};

const plantApp = createPlantApp();

// Helper function to create plant text element
const createPlantText = (plant) => {
  const plantText = document.createElement("div");
  plantText.id = `plant-text-${plant.id}`;
  plantText.classList.add(
    "plant-text",
    ...(plant.thirsty ? [] : []),
  );
  plantText.innerText = plant.text;
  return plantText;
};

// Helper function to create plant edit input element
const createPlantEditInput = (plant) => {
  const plantEdit = document.createElement("input");
  plantEdit.classList.add("hidden", "plant-edit");
  plantEdit.value = plant.text;
  return plantEdit;
};

// Helper function to create a plant item
const createPlantItem = (plant) => {
  const plantItem = document.createElement("div");
  plantItem.classList.add("p-4", "plant-item");

  // Main plant text
  const text = createPlantText(plant);
  const edit = createPlantEditInput(plant);

  // Wrap plant text and icon in a container
  const textContainer = document.createElement("div");
  textContainer.style.display = "inline-flex";
  textContainer.style.alignItems = "center";
  textContainer.appendChild(text);

  if (plant.thirsty) {
    // Create image element for icon
    const iconImg = document.createElement("img");
    iconImg.src = "plant-tracker/watering-can.svg";
    iconImg.alt = "Thirsty plant";
    iconImg.style.width = "14px";  // adjust size as needed
    iconImg.style.height = "14px";
    iconImg.style.marginLeft = "8px";
    iconImg.style.verticalAlign = "middle";
    textContainer.appendChild(iconImg);
  }
    
  // "Recommended" display
  const recommended = document.createElement("div");
  recommended.classList.add("text-sm", "text-gray-400", "mt-1");
  recommended.innerText = `Recommended watering: ${plant.recommendedWatering}`;

  // "Last Watered" display
  const watered = document.createElement("div");
  watered.classList.add("text-sm", "text-gray-400", "mt-1");
  watered.innerText = `Last watered: ${plant.lastWatered}`;

  plantItem.append(textContainer, recommended, watered, edit);
  return plantItem;
};


// Function to render the plants based on the current filter
const renderPlants = () => {
  plantListElement.innerHTML = ""; // Clear the current list to avoid duplicates

  const plantElements = plantApp.getPlants().map(createPlantItem);
  plantListElement.append(...plantElements);

  activePlantsCount.innerText = `${plantApp.getNumberOfActivePlants()} item${plantApp.getNumberOfActivePlants() === 1 ? "" : "s"} left`;
};

// Event handler to create a new plant item
const handleKeyDownToCreateNewPlant = (event) => {
  if (event.key === "Enter") {
    const plantText = event.target.value.trim();
  
    if (plantText) {
      
      showPopUp(plantText); // Default watering value
      event.preventDefault();
      event.target.value = ""; // Clear the input
    }
  }
};

// Helper function to find the target plant element
const findTargetPlantElement = (event) =>
  event.target.id?.includes("plant-text") ? event.target : null;

// Helper function to parse the plant id from the plant element
const parsePlantId = (plant) => (plant ? Number(plant.id.split("-").pop()) : -1);

// Event handler to toggle the Thirsty status of a plant item
const handleClickOnPlantList = (event) => {
  plantApp.togglePlant(parsePlantId(findTargetPlantElement(event)));
  renderPlants();
};

// Helper function to update the class list of a navbar element
const updateClassList = (element, isActive) => {
  const classes = [
    "underline",
    "underline-offset-4",
    "decoration-rose-800",
    "decoration-2",
  ];
  if (isActive) {
    element.classList.add(...classes);
  } else {
    element.classList.remove(...classes);
  }
};

// Helper function to render the navbar anchor elements
const renderPlantNavBar = (href) => {
  Array.from(plantNav.children).forEach((element) => {
    updateClassList(element, element.href === href);
  });
};

// Event handler to filter the plants based on the navbar selection
const handleClickOnNavbar = (event) => {
  // if the clicked element is an anchor tag
  if (event.target.tagName === "A") {
    const hrefValue = event.target.href;
    plantApp.setFilter(hrefValue.split("/").pop() || "all");
    renderPlantNavBar(hrefValue);
    renderPlants();
  }
};

// Event handler to mark all plants as Thirsty
const handleMarkAllWatered = () => {
  plantApp.markAllWatered();
  renderPlants();
};

// Event handler to clear all Thirsty plants
const clearThirstyPlants = () => {
  plantApp.deleteThirsty();
  renderPlants();
};

// Add the event listeners
plantListElement.addEventListener("click", handleClickOnPlantList);
inputNewPlant.addEventListener("keydown", handleKeyDownToCreateNewPlant);
plantNav.addEventListener("click", handleClickOnNavbar);
popupCancel.addEventListener("click", hidePopUp);
popupConfirm.addEventListener("click", newPlant);
markAllWatered.addEventListener("click", handleMarkAllWatered);
clearThirsty.addEventListener("click", clearThirstyPlants); //delete selected plants
document.addEventListener("DOMContentLoaded", renderPlants);
