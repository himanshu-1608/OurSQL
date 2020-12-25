jsonStr = `{"databases":["db1","db2"],"tables":[["table11","table12"],["table21","table22","table23"]],"table-details":{"db1+table11":[{"colName":"index","colType":"int"},{"colName":"empName","colType":"varchar(50)"},{"colName":"workingHours","colType":"int"}],"db1+table12":[{"colName":"col121","colType":"int"},{"colName":"col122","colType":"varchar(50)"},{"colName":"col123","colType":"int"}],"db2+table21":[{"colName":"index","colType":"int"},{"colName":"empName","colType":"varchar(50)"},{"colName":"workingHours","colType":"int"}],"db2+table22":[{"colName":"col221","colType":"int"},{"colName":"col222","colType":"varchar(50)"},{"colName":"col223","colType":"int"}],"db2+table23":[{"colName":"col231","colType":"int"},{"colName":"col232","colType":"varchar(50)"},{"colName":"col233","colType":"int"}]},"table-data":{"db1+table11":[[1,"Emp1",38],[2,"Emp2",40],[1,"Emp3",45]],"db1+table12":[[1,"Entry121",121],[2,"Entry122",122],[3,"Entry123",123]],"db2+table21":[[1,"Entry211",211],[2,"Entry212",212],[3,"Entry213",213]],"db2+table22":[[1,"Entry221",221],[2,"Entry222",222],[3,"Entry223",223]],"db2+table23":[[1,"Entry231",231],[1,"Entry232",232],[1,"Entry233",233]]}}`;

jsonObj = JSON.parse(jsonStr);

function addDynamicAccordionElements() {
    let innerElements = "";
    for (dbName of jsonObj.databases) {
        innerElements += `<h5 class="ui-accordion-header databases yellow-text black">${dbName}</h5>`;
        innerElements += `<div class="ui-accordion-content yellow-text black">`;
        const relatedTables = retrieveTablesFromDB(dbName);
        for (tables of relatedTables) {
            innerElements += `<p class="tables">${tables}</p>`;
        }
        innerElements += `</div>`;
    }
    $('#accordion').html(innerElements);
}

function retrieveTablesFromDB(dbName) {
    currDbIndex = jsonObj.databases.findIndex(obj => obj == dbName);
    return jsonObj.tables[currDbIndex];
}

function setError(responseText) {
    $('#query-error').text(responseText);
}

function checkQueryText() {
    let responseText = "";
    let inpQuery = $("#query-text").val();
    tempArray = inpQuery.split("\n");
    inpQuery = tempArray.join(" ");
    const dbSemiColon = inpQuery.indexOf(";");
    useReg = /use/i;
    if (useReg.test(inpQuery.slice(0, 3)) && dbSemiColon !== -1) {
        dbName = inpQuery.slice(3, dbSemiColon).trim();
        responseText += `Database Chosen: ${dbName}`;
        setError(responseText);
        operation = inpQuery.slice(dbSemiColon + 1).trim();
        switch (true) {
            case /select /i.test(operation.slice(0, 7)):
                selectQueryHandler(operation, responseText);
                break;
            case /insert /i.test(operation.slice(0, 7)):
                insertQueryHandler(operation, responseText);
                break;
            case /delete /i.test(operation.slice(0, 7)):
                deleteQueryHandler(operation, responseText);
                break;
            case /update /i.test(operation.slice(0, 7)):
                updateQueryHandler(operation, responseText);
                break;
            default:
                responseText += "Query not matching any one of(SELECT/INSERT/UPDATE/DELETE)";
                break;
        }
    } else {
        $('#query-error').html(`Please choose a database eg. <span class="pink-text">USE dbName;</span>`);
    }
}

function selectQueryHandler(operation, responseText) {

}

function insertQueryHandler(operation, responseText) {

}

function updateQueryHandler(operation, responseText) {

}

function deleteQueryHandler(operation, responseText) {

}

function executeQuery() {
    if ($("#query-text").val().trim() !== "") {
        addToHistory();
        checkQueryText();
    } else {
        alert("Empty SQL Query!");
    }
}

function addToHistory() {
    const text = $("#query-text").val().trim();
    $("#history-ol").prepend(`<li>${text}</li>`);
    const lengthOL = $("#history-ol").children().length;
    if (lengthOL > 10) {
        $('#history-ol li:last-child').remove();
    }
}

function saveQueryToTab() {
    const queryText = $("#query-text").val().trim();
    if (queryText == "") {
        alert("Empty SQL Query!");
    } else {
        $("#save-ol").prepend(`<li>${queryText}</li>`);
    }
}

function validateDTSelection() {
    const queryError = $("#query-error");
    if (currDB == "" && currTable == "") {
        queryError.text("Response: PLEASE SELECT A DATABASE AND A TABLE");
        queryError.css('color', 'red');
        return false;
    } else if (currTable == "") {
        queryError.text("Response: PLEASE SELECT A TABLE");
        queryError.css('color', 'red');
        return false;
    } else {
        return true;
    }
}

function renderTablesOfDB(tables) {
    let tableDetails = "";
    tableDetails += `<table class="highlight"><thead><tr><th>Table Name</th><th>Drop Table</th><th>Delete All Entries</th></tr></thead><tbody>`;
    for (table of tables) {
        tableDetails += ('<tr><td>' + table + '</td><td><i class="material-icons small" style="vertical-align:middle">delete_forever</i>Drop</td><td><i class="material-icons small" style="vertical-align:middle">delete_sweep</i>Delete Entries</td></tr>');
    }
    tableDetails += '</tbody></table>';
    $("#result-response").html(tableDetails);
}

function displayTableContent(dbName, tableName) {
    const currDB = dbName;
    const currTable = tableName;
    tableDetails = jsonObj["table-details"][currDB + "+" + currTable];
    let innerContent = "";
    innerContent += `<h5>Data of table "<strong>${tableName}</strong>" is:</h5>`;
    innerContent += `<table border="5" class="centered highlight"><hr><thead><tr>`;
    for (const columnDetails of tableDetails) {
        innerContent += `<th>${columnDetails.colName}</th>`;
    }
    innerContent += `</tr></thead><tbody>`;
    tableData = jsonObj["table-data"][currDB + "+" + currTable];
    for (row of tableData) {
        innerContent += `<tr>`;
        const nThRow = row;
        for (items of nThRow) {
            innerContent += `<td>${items}</td>`;
        }
        innerContent += `</tr>`;
    }
    innerContent += `</tbody></table>`;
    $("#result-response").html(innerContent);
}

function confirmClear() {
    return window.confirm("Are you sure you want to clear the current query?");
}

function insertionQuery() {
    let innerContent = "USE " + currDB + ";\n";
    innerContent += `INSERT INTO ${currTable}\nVALUES\n(`;
    tableDetails = jsonObj["table-details"][currDB + "+" + currTable];
    var abc = [];
    for (const columnDetails of tableDetails) {
        abc.push(`\'${columnDetails.colName}\'`);
    }
    let columnName = abc.join(" , ");
    innerContent += `${columnName} );`;
    queryText = $("#query-text");
    queryText.val(innerContent);
    queryText.css('color', 'lightgreen');
}

function selectionQuery() {
    let innerContent = "USE " + currDB + ";\n";
    innerContent += `SELECT `;
    tableDetails = jsonObj["table-details"][currDB + "+" + currTable];
    var abc = [];
    for (const columnDetails of tableDetails) {
        abc.push(`${columnDetails.colName}`);
    }
    let columnName = abc.join(" , ");
    innerContent += `${columnName}\nFROM ${currTable};`;
    queryText = $("#query-text");
    queryText.val(innerContent);
    queryText.css('color', 'lightgreen');
    checkQueryText();
}

function deleteQuery() {
    if (validateDTSelection()) {
        const queryText = $("#query-text");
        if (queryText.val().trim() !== "") {
            if (confirmClear()) {
                queryText.val("");
                deleteQuery();
            }
        } else {
            const tableDetails = jsonObj["table-details"][currDB + "+" + currTable];
            let query = "USE " + currDB + ";\nDELETE " + currTable;
            query += " WHERE ";
            for (let i = 0; i < tableDetails.length; i++) {
                if (i < tableDetails.length - 1)
                    query += `${tableDetails[i].colName}` + " = \"\" AND ";
                else
                    query += `${tableDetails[i].colName}` + " = \"\"";
            }
            query += ";";
            queryText.val(query);
            queryText.css('color', 'lightgreen');
        }
    }
}

function updateQuery() {
    if (validateDTSelection()) {
        const queryText = $("#query-text");
        if (queryText.val().trim() !== "") {
            if (confirmClear()) {
                queryText.val("");
                updateQuery();
            }
        } else {
            queryText.val();
            const tableDetails = jsonObj["table-details"][currDB + "+" + currTable];
            let query = "USE " + currDB + ";\nUPDATE " + currTable + " SET ";
            for (let i = 0; i < tableDetails.length; i++) {
                if (i < tableDetails.length - 1)
                    query += `${tableDetails[i].colName}` + " = \"\" , ";
                else
                    query += `${tableDetails[i].colName}` + " = \"\"";
            }
            query += " WHERE ";
            for (let i = 0; i < tableDetails.length; i++) {
                if (i < tableDetails.length - 1)
                    query += `${tableDetails[i].colName}` + " = \"\" AND ";
                else
                    query += `${tableDetails[i].colName}` + " = \"\"";
            }
            query += ";";
            queryText.val(query);
            queryText.css('color', 'lightgreen');
        }
    }
}


let currDB = "",
    currTable = "",
    prevp;

addDynamicAccordionElements();

$(document).ready(function() {
    $('#accordion').accordion({
        collapsible: true,
        animate: 500,
        active: false,
        heightStyle: "content",
        icons: { header: "ui-icon-plus", activeHeader: "ui-icon-minus" }
    });

    $('.databases').click(function() {
        currTable = "";
        if ($("#accordion").accordion("option", "active") !== false) {
            currDB = $(this)[0].innerText;
            renderTablesOfDB(retrieveTablesFromDB(currDB));
        } else {
            currDB = "";
            $(prevp).removeClass('border');
        }
    });

    $('#query-text').on('input', checkQueryText);

    $("#execute-button").click(executeQuery);

    $("#auto-save").click(saveQueryToTab);

    $("#auto-clear").click(function() {
        const queryText = $("#query-text").val().trim();
        if (queryText == "") {
            alert("Empty SQL Query!");
        } else if (confirmClear()) {
            $("#query-text").val("");
        }
    });

    $(".sub-auto-queries").click(validateDTSelection);

    $("#auto-select-all").click(function() {
        const queryText = $("#query-text");
        if (validateDTSelection()) {
            if (queryText.val().trim() !== "") {
                if (confirmClear()) {
                    queryText.val("");
                    queryText.val("USE " + currDB + ";\nSELECT * FROM " + currTable + ";");
                    queryText.css('color', 'lightgreen');
                }
            } else {
                queryText.val("USE " + currDB + ";\nSELECT * FROM " + currTable + ";");
                queryText.css('color', 'lightgreen');
            }
        }
    });

    $(".tables").click(function() {
        currTable = $(this)[0].innerText;
        $(prevp).removeClass('border');
        $(this).addClass('border');
        prevp = $(this);
        displayTableContent(currDB, currTable);
    });

    $("#auto-insert").click(function() {
        if (validateDTSelection()) {
            const queryText = $("#query-text").val().trim();
            if (queryText != "") {
                if (confirmClear()) {
                    $("#query-text").val("");
                    insertionQuery();
                }
            } else {
                insertionQuery();
            }
        }
    });

    $("#auto-select").click(function() {
        if (validateDTSelection()) {
            const queryText = $("#query-text").val().trim();
            if (queryText != "") {
                if (confirmClear()) {
                    $("#query-text").val("");
                    selectionQuery();
                }
            } else {
                selectionQuery();
            }
        }
    });

    $("#auto-update").click(updateQuery);

    $("#auto-delete").click(deleteQuery);
});




//get all databases
// for (const dbs of jsonObj["databases"]) {
//     console.log(dbs);
// }


//find any db index
// currDb = "db2";
// console.log(jsonObj.databases.findIndex(obj => obj == currDb));

//find any table index
// currDbIndex = jsonObj.databases.findIndex(obj => obj == "db1");
// currTabList = jsonObj.tables[currDbIndex];
// console.log(currTabList.findIndex(obj => obj == "table12"));

//for tableNames of specific db:
// currDbIndex = jsonObj.databases.findIndex(obj => obj == "db2");
// currTabList = jsonObj.tables[currDbIndex];
// for (tables of currTabList) {
//     console.log(tables);
// }

//if query is DESC tablename
// currDB = "db1";
// currTable = "table12";
// tableDetails = jsonObj["table-details"][currDB + "+" + currTable];
// for (const columnDetails of tableDetails) {
//     console.log("Column Name: " + columnDetails.colName);
//     console.log("Column DataType: " + columnDetails.colType);
//     console.log("");
// }

// query select workingHours empName =>
// currDB = "db1";
// currTable = "table11";
// cols = ["workingHours", "empName"];
// indicesToShow = [];
// tableDetails = jsonObj["table-details"][currDB + "+" + currTable];
// cols.forEach(columnName => {
//     tableDetails.forEach((tableColumn, index) => {
//         if (columnName == tableColumn.colName) {
//             indicesToShow.push(index);
//         }
//     });
// });
// console.log(indicesToShow);
// tableData = jsonObj["table-data"][currDB + "+" + currTable];
// for (row of tableData) {
//     const nThRow = row;
//     for (index of indicesToShow) {
//         console.log(nThRow[index]);
//     }
//     console.log("Row End");
// }

//query insert into table11
// currDB = "db1";
// currTable = "table11";
// cols = ["workingHours", "empName"];
// indicesToPut = [];
// tableDetails = jsonObj["table-details"][currDB + "+" + currTable];
// cols.forEach(columnName => {
//     tableDetails.forEach((tableColumn, index) => {
//         if (columnName == tableColumn.colName) {
//             indicesToPut.push(index);
//         }
//     });
// });
// console.log(indicesToPut);
// tableData = jsonObj["table-data"][currDB + "+" + currTable];
// tableData.push([, "Emp4", 43]);
// tableData.push([, "Emp5", 45]);
// for (rows of tableData) {
//     console.log(rows);
// }

// update any column entry
// currDB = "db1";
// currTable = "table11";
// columnToChangeIndex = [2, 1];
// newValuesToReplace = [40, "EmpN"];
// checkCols = [2, 1];
// checkVals = [38, "Emp1"];
// tableDetails = jsonObj["table-data"][currDB + "+" + currTable];
// //console.log(tableDetails);
// tableDetails.forEach((tableRow, i) => {
//     const nThRow = tableRow;
//     //console.log(nThRow);
//     const allTrue = checkCols.every((data, index) => {
//         //console.log(nThRow[data] + ", " + checkVals[index]);
//         return nThRow[data] === checkVals[index];
//     });
//     if (allTrue) {
//         //console.log("All True");
//         columnToChangeIndex.forEach((data, index) => {
//             tableDetails[i][data] = newValuesToReplace[index];
//         });
//     } else {
//         //console.log("Not compatible");
//     }
// });


// delete any row 
// currDB = "db1";
// currTable = "table11";
// checkCols = [2, 1];
// checkVals = [38, "Emp1"];
// rowsToRemove = [];
// tableDetails = jsonObj["table-data"][currDB + "+" + currTable];
// tableDetails.forEach((tableRow, rowIndex) => {
//     console.log(tableRow);
//     const nThRow = tableRow;
//     const allTrue = checkCols.every((data, index) => {
//         //console.log(nThRow[data] + ", " + checkVals[index]);
//         return nThRow[data] === checkVals[index];
//     });
//     if (allTrue) {
//         rowsToRemove.push(rowIndex);
//     } else {

//     }
// });
// rowsToRemove.sort();
// rowsToRemove.reverse();
// console.log(rowsToRemove);
// rowsToRemove.forEach((data, index) => tableDetails.splice(index, 1));
// console.log(jsonObj);