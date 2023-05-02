var tableCounter = 0;

// This function is triggered when a change event occurs on a select element with the class "building-input".
// For now, when selecting building with bonus, already selected buildings that is gonna be affected 
// by this bonus in other cities, will get an update of their income after the next select onchange.
$(document).on('change', 'select.building-input', async function () {
    var divId = $(this).closest('.formContainer').attr('id');
    // Update the building image based on the selected value and the container id
    updateBuildingImage($(this).val(), divId);
    var row = $(this).closest('tr')[0]; //access the DOM element from the jQuery using the [0] index
    var rowId = row.getAttribute('id');
    var table = $(this).closest('table')[0];
    // Get all select elements in the row and collect their values in an array
    var selectsInRow = row.querySelectorAll('select');
    var selectsValuesInRow = collectSelectsValues(selectsInRow);
    // Get all select elements in the table and collect their values in an array
    var selectsInTable = table.querySelectorAll('select');
    var selectsValuesInTable = collectSelectsValues(selectsInTable) //sep function
    // Calculates the total for the row and update the table
    await rowTotal(selectsValuesInRow, selectsValuesInTable, table, rowId);
    // Calculates the total for the province and update the table
    provinceTotal(table);
    // Calculates the total for the faction and update the div.all-tables-total
    factionTotal();
});

/**
 * Updates the building image displayed in the specified container.
 * @param {string} value - The value of the selected building.
 * @param {string} divId - The ID of the container element.
 */
const updateBuildingImage = async (value, divId) => {
    try {
        if (!value) return; // If value is not defined or null, return early
    
        // Fetch the building icon data from the server
        const data = await fetchData(`/get_building_icon/${value}`);
        const imageSrc = `data:image/jpeg;base64,${data["building.icon"].icon_data}`;
    
        // Create a new image element and add it to the container
        const imgElement = document.createElement("img");
        imgElement.src = imageSrc;
        imgElement.classList.add("building-image");
    
        const container = document.querySelector(`#${divId}.imageContainer`);
        container.innerHTML = "";
        container.appendChild(imgElement);
      } catch (error) {
        console.error(error);
      }
};

//Collects the selected values of an array of <select> elements
function collectSelectsValues(selectsList) {
    var selectsValues = [];
    selectsList.forEach((select) => {
        if (select.value) {
            selectsValues.push(select.value);
        }
    });
    return selectsValues;
};

/**
 * Calculates and updates the total income, public order, trade resources, food, and growth for a row in the table.
 * @param {Array} rowBuildingIdList - The list of building IDs in the row.
 * @param {Array} tableBuildingIdList - The list of building IDs in the entire table.
 * @param {HTMLTableElement} table - The table element.
 * @param {string} rowId - The ID of the row to update.
 * @returns {Promise} - A Promise that resolves when the row totals have been updated.
 */
const rowTotal = async (rowBuildingIdList, tableBuildingIdList, table, rowId) => {
    try {
        var url = `/get_total/?row_building_id_list=${rowBuildingIdList.join(',')}&table_building_id_list=${tableBuildingIdList.join(',')}`;
        var data = await fetchData(url);
        var totalIncome = data['total_income'];
        var publicOrder = data['public_order'];
        var tradeResources = data['trade_resources'];
        var food = data['food'];
        var growth = data['growth'];
        var tdTotalIncome = table.querySelector(`#${rowId}.total-income`);
        tdTotalIncome.innerHTML = totalIncome;
        var tdPublicOrder = table.querySelector(`#${rowId}.public-order`);
        tdPublicOrder.innerHTML = publicOrder;
        var tdTradeResources = table.querySelector(`#${rowId}.trade-resources`);
        tdTradeResources.innerHTML = tradeResources;
        var tdFood = table.querySelector(`#${rowId}.food`);
        tdFood.innerHTML = food;
        var tdGrowth = table.querySelector(`#${rowId}.growth`);
        tdGrowth.innerHTML = growth;
    } catch (error) {
        console.error(error);
    }
};

// This function iterates over each of the total classes and their corresponding province total classes,
// and calls calculateProvinceTotalAndUpdateCell to update the corresponding cell in the table with the new value.
function provinceTotal(tableId) {
    $.each({
        '.total-income': '.province-total-income',
        '.public-order': '.province-total-order',
        '.trade-resources': '.province-total-resources',
        '.food': '.province-total-food',
        '.growth': '.province-total-growth',
    }, function (totalClassName, provinceTotalClassName) {
        calculateProvinceTotalAndUpdateCell(tableId, totalClassName, provinceTotalClassName);
    });
};

// This function calculates the province total by summing up the values in the total cells,
// and updates the corresponding cell in the table with the new value.
function calculateProvinceTotalAndUpdateCell(table, totalClassName, provinceTotalClassName) {
    var totalCells = table.querySelectorAll(totalClassName)
    var provinceTotalCell = table.querySelector(provinceTotalClassName)
    var provinceTotal = 0
    for (var i = 0; i < totalCells.length; i++) {
        var cellText = totalCells[i].textContent;
        if (totalClassName === '.trade-resources') {
            provinceTotal = 'Not Applicable';
            break;
        } else {
            if (cellText != "None") {
                provinceTotal += parseInt(cellText);
            };
        };
    };
    provinceTotalCell.innerHTML = provinceTotal
};

// Calculates and updates the faction total for various categories based on the province totals.
// Additionally, the function calls the updateTotalIcons function.
function factionTotal() {
    $.each({
        '.province-total-income': '.total-income',
        '.province-total-order': '.total-order',
        '.province-total-food': '.total-food',
    }, function (provinceTotalClassName, factionTotalClassName) {
        var factionTotalSpan = document.querySelector(`span${factionTotalClassName}`);
        var provincesTotals = document.querySelectorAll(provinceTotalClassName);
        var factionTotal = 0;
        for (var i = 0; i < provincesTotals.length; i++) {
            var cellText = provincesTotals[i].textContent;
            factionTotal += parseInt(cellText);
        };
        factionTotalSpan.innerHTML = factionTotal;
        updateTotalIcons(factionTotalClassName, factionTotal);
    });
};

function updateTotalIcons(factionTotalClassName, factionTotal) {
    var image = document.querySelector(`img${factionTotalClassName}`);
    switch (factionTotalClassName) {
        case '.total-income':
            if (factionTotal <= 0) {
                image.src = imageSources.incomeNegative;
            } else {
                image.src = imageSources.incomePositive;
            };
            break;
        case '.total-order':
            if (factionTotal < 0) {
                image.src = imageSources.orderNegative;
            } else if (factionTotal == 0) {
                image.src = imageSources.orderNeutral;
            } else {
                image.src = imageSources.orderPositive;
            };
            break;
        case '.total-food':
            if (factionTotal < 0) {
                image.src = imageSources.foodNegative;
            } else {
                image.src = imageSources.foodPositive;
            };
    };
};

const updateCitiesAndCreateTable = async () => {
    var provinceForm = document.getElementById("id_province")
    var id_province = provinceForm.value
    var provinceName = provinceForm.selectedOptions[0].textContent
    var citiesData = await fetchData(`/get_cities/${id_province}`);
    tableCounter += 1;
    var table = addTable(provinceName);
    populateTable(table, citiesData);
};

async function fetchData(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

function addTable(provinceName) {
    var table = document.createElement("table");
    table.className = "table table-bordered table-dark";
    table.id = `table-${tableCounter}`;
    table.innerHTML = `
    <thead>
        <tr>
            <th class="pl-holder"></th>
            <th class="pl-holder" colspan="6">
                <span class="province-name">${provinceName}</span> 
            </th>
            <th class="pl-holder"></th>
            <th class="pl-holder"></th>
            <th class="pl-holder"></th>
            <th class="pl-holder"></th>
        </tr>   
        <tr>
            <th rowspan="2">City Name</th>
            <th rowspan="2", colspan="6">Building Slots</th>
        </tr>
        <tr>
            <th class="colIncome">Income</th>
            <th class="colFeatures">Public Order</th>
            <th class="colFeatures">Trade Resources</th>
            <th class="colFeatures">Food</th>
            <th class="colFeatures">Growth</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="pl-holder"></td>
            <td class="province-total" colspan="6"> Province Total</td>
            <td class="province-total province-total-income">None</td>
            <td class="province-total province-total-order">None</td>
            <td class="province-total province-total-resources">None</td>
            <td class="province-total province-total-food">None</td>
            <td class="province-total province-total-growth">None</td>
        </tr>
    </tbody>
    `;
    //creating button that will delete the corresponding table
    var firstRow = table.rows[0];
    var deleteButtonCell = firstRow.insertCell(-1);
    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete";
    deleteButton.classList.add("btn", "btn-danger", "btn-sm");
    deleteButton.addEventListener("click", function () {
        table.remove();
    });
    deleteButtonCell.appendChild(deleteButton);
    document.getElementById("table-container").appendChild(table);
    return table;
};

function populateTable(table, citiesData) {
    // Makes an AJAX request to the URL for the form
    $.ajax({
        url: '/buildings_form/',
        method: 'GET',
        success: function (buildings_form) {
            var tbody = table.getElementsByTagName("tbody")[0];
            var rowIndex = 1;
            for (var i = 0; i < citiesData.length; i++) {
                var row = tbody.insertRow(i);
                row.id = `row-${rowIndex}`
                var nameCell = row.insertCell(0);
                var cellIndex = 1;
                var avaliableSlotCells = 6
                for (var c = 0; c < citiesData[i].building_slots; c++) {
                    var slotCell = $(row.insertCell(cellIndex));
                    var imageContainer = $(`<div class='imageContainer' id='img-${tableCounter}${rowIndex}${cellIndex}'>`).append(`<img class='building-image' src='${imageSources.defaultBuildingImage}'>`);
                    var formContainer = $(`<div class='formContainer' id ='img-${tableCounter}${rowIndex}${cellIndex}'>`).append(buildings_form);
                    var container = $('<div class="completeFrom">').append(formContainer).append(imageContainer);
                    slotCell.html(container);
                    cellIndex += 1;
                    avaliableSlotCells -= 1;
                };
                for (var c = 0; c < avaliableSlotCells; c++) {
                    var noSlotCell = row.insertCell(cellIndex);
                    noSlotCell.innerHTML = `<img class ='default-slum-img' src='${imageSources.defaultBuildingImage}'>`;
                    cellIndex += 1;
                };
                var classNames = ['total-income', 'public-order', 'trade-resources', 'food', 'growth']
                for (var name of classNames) {
                    var numCell = row.insertCell(cellIndex);
                    numCell.innerHTML = "None";
                    numCell.className = name;
                    numCell.id = `row-${rowIndex}`;
                    cellIndex += 1;
                };
                nameCell.innerHTML = citiesData[i].name;
                rowIndex += 1;
            };
        }
    });
};


// function hideShow(className) {
//     var td = document.getElementsByClassName(className);
//     for (var i = 0; i < td.length; i++) {
//         // Add or remove the "hidden" class to show or hide the column
//         td[i].classList.toggle('hidden');
//     };
// }
// function sorter(button, className) {
//     switch (className) {
//         case "colFeatures":
//             hideShow(className)
//             break;
//         case "colIncome":
//             hideShow(className)
//             break;
//         case "colBonus":
//             hideShow(className)
//     }
//     if (button.innerHTML === '-') {
//       button.innerHTML = '+';
//     } else {
//       button.innerHTML = '-';
//     }
// }