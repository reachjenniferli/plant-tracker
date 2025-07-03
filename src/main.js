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
const deleteBtn = document.getElementById("trash-can-icon");
let popupPlantName = ""; 

// Helper function to create a new array with the existing plants and a new plant item
const addPlant = (plants, newPlantText, newPlantId, watering, last) => [
  ...plants,
  { id: newPlantId, 
    text: newPlantText,
    thirsty: Boolean((daysSince(last) >= Number(watering))), 
    recommendedWatering: watering,
    lastWatered: daysSince(last),
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
  if (!lastWateredValue) lastWateredValue = new Date().toISOString(); 
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

// Helper function to delete all thirsty plants
const deleteThirstyPlants = (plants) => {
  return plants.filter((plant) => !plant.thirsty);
};

// Factory function to create a plant app
const createPlantApp = () => {
  // Define the state of our app
  let plants = [];
  let nextPlantId = 1;
  let filter = "all"; // can be 'all', 'thirsy', or 'watered'

  return {
    addPlant: (newPlantText, watering, last) => {
      plants = addPlant(plants, newPlantText, nextPlantId++, watering, last);
    },
    updatePlantField: (id, field, newValue) => {
      plants = plants.map((plant) => {
        if (plant.id !== id) return plant;
        const updatedPlant = { ...plant };
        if (field === "text") updatedPlant.text = newValue;
        else if (field === "recommendedWatering") updatedPlant.recommendedWatering = newValue;
        else if (field === "lastWatered") updatedPlant.lastWatered = newValue;
        return updatedPlant;
      });
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
    deletePlant: (id) => {
      plants = plants.filter((plant) => plant.id !== id);
    },
    deleteThirsty: () => {
      plants = deleteThirstyPlants(plants);
    },
    getNumberOfThirstyPlants: () =>
      plants.reduce((acc, plant) => acc + plant.thirsty, 0),
    getPlants: () => filterPlants(plants, filter),
  };
};

const plantApp = createPlantApp();

// Helper function to create plant edit input element
const enableEditing = (element, plantId, field, parent = null) => {
  const numberMatch = element.innerText.match(/(\d+)/);
  const numberOnly = numberMatch ? numberMatch[0] : "";
  const input = document.createElement("input");
  input.type = field === "text" ? "text" : "number";
  input.value = field === "text" ? element.innerText.trim() : numberOnly;
  input.classList.add("border", "border-gray-300", "rounded", "p-1", "w-full");
  input.addEventListener("blur", (event) => {
    const newValue = input.value.trim();
    if (!newValue) return renderPlants();
    let updatedValue;
    if (field === "recommendedWatering") updatedValue = newValue + ' days';
    else if (field === "lastWatered") updatedValue = daysSince(newValue) + " days ago";
    else updatedValue = newValue;
    plantApp.updatePlantField(plantId, field, updatedValue);
    renderPlants();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
  });
  if (parent) {
    parent.innerHTML = "";
    parent.appendChild(input);
  } else {
    element.replaceWith(input);
  }
  input.focus();
};

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

const createWateringCan = (plant) => {
  const iconImg = document.createElement("img");
  iconImg.classList.add("watering-can-icon");
  iconImg.setAttribute("data-id", plant.id);
  iconImg.src = "plant-tracker/watering-can.png";
  iconImg.alt = "Thirsty plant";
  iconImg.style.width = "24px";
  iconImg.style.height = "24px";
  iconImg.style.marginLeft = "8px";
  iconImg.style.verticalAlign = "middle";
  iconImg.classList.add("opacity-50", "hover:opacity-100", "transition-opacity");
  iconImg.style.cursor = "pointer";
  return iconImg;
}

const createTrashCan = (plant) => {
  const deleteBtn = document.createElement("img");
  deleteBtn.classList.add("trash-can-icon");
  deleteBtn.src = "plant-tracker/trash-can.png";
  deleteBtn.style.width = "20px";
  deleteBtn.style.height = "20px";
  deleteBtn.style.marginLeft = "8px";
  deleteBtn.style.alignSelf = "center";
  deleteBtn.style.cursor = "pointer";
  deleteBtn.classList.add("opacity-50", "hover:opacity-100", "transition-opacity");
  deleteBtn.addEventListener("click", () => {
    plantApp.deletePlant(plant.id);
    renderPlants();
  });
  return deleteBtn;
}

// Helper function to create a plant item
const createPlantItem = (plant) => {
  const plantItem = document.createElement("div");
  plantItem.classList.add("p-4", "plant-item", ...(plant.thirsty ? ["bg-red-50"] : []));
  plantItem.style.display = "flex";
  plantItem.style.alignItems = "center";

  const contentContainer = document.createElement("div");
  contentContainer.style.flex = "1";

  // Main plant text
  const text = createPlantText(plant);
  text.addEventListener("dblclick", () => enableEditing(text, plant.id, "text"));

  // Wrap plant text and icon in a container
  const textContainer = document.createElement("div");
  textContainer.style.display = "inline-flex";
  textContainer.style.alignItems = "center";
  textContainer.appendChild(text);

  if (plant.thirsty) {
    // Create image element for icon
    const iconWateringCan = createWateringCan(plant);
    textContainer.appendChild(iconWateringCan);
  }
  
  // "Recommended" display
  const recommended = document.createElement("div");
  recommended.classList.add("text-sm", "text-gray-400", "mt-1");
  recommended.innerText = `Recommended watering: every ${plant.recommendedWatering} days`;
  recommended.addEventListener("dblclick", () => enableEditing(recommended, plant.id, "recommendedWatering", recommended));

  // "Last Watered" display
  const watered = document.createElement("div");
  watered.classList.add("text-sm", "text-gray-400", "mt-1");
  watered.innerText = `Last watered: ${plant.lastWatered} days ago`;
    watered.addEventListener("dblclick", () => enableEditing(watered, plant.id, "lastWatered", watered));

  contentContainer.append(textContainer, recommended, watered);

  // Trash can display
  const iconTrash = createTrashCan(plant);

  plantItem.append(contentContainer, iconTrash);

  return plantItem;
};

// Function to render the plants based on the current filter
const renderPlants = () => {
  plantListElement.innerHTML = ""; // Clear the current list to avoid duplicates
  const plantElements = plantApp.getPlants().map(createPlantItem);
  plantListElement.append(...plantElements);
  activePlantsCount.innerText = `${plantApp.getNumberOfThirstyPlants()} plant${plantApp.getNumberOfThirstyPlants() === 1 ? "" : "s"} to water`;
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
  event.target.classList.contains("watering-can-icon") ? event.target : null;

// Helper function to parse the plant id from the plant element
const parsePlantId = (iconElement) => 
  iconElement ? Number(iconElement.getAttribute("data-id")) : -1;

// Helper function to update the class list of a navbar element
const updateClassList = (element, isActive) => {
  const classes = [
    "underline",
    "underline-offset-4",
    "decoration-rose-800",
    "decoration-2",
  ];
  if (isActive) {element.classList.add(...classes);
  } else {element.classList.remove(...classes);}
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

// Event handler to toggle the Thirsty status of a plant item
const handleClickOnPlantList = (event) => {
  const icon = findTargetPlantElement(event);
  if (icon) {
    const plantId = parsePlantId(icon);
    plantApp.togglePlant(plantId);
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

const deletePlant = () => {
  plantApp.deletePlant(plant.id);
  renderPlants();
};

// Add the event listeners
plantListElement.addEventListener("click", handleClickOnPlantList);
inputNewPlant.addEventListener("keydown", handleKeyDownToCreateNewPlant);
plantNav.addEventListener("click", handleClickOnNavbar);
popupCancel.addEventListener("click", hidePopUp);
popupConfirm.addEventListener("click", newPlant);
markAllWatered.addEventListener("click", handleMarkAllWatered);
clearThirsty.addEventListener("click", clearThirstyPlants); 
deleteBtn.addEventListener("click", deletePlant);
document.addEventListener("DOMContentLoaded", renderPlants);