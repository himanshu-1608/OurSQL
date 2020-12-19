let currDB = "",
    currTable = "";

$(document).ready(function() {
    $('#accordion').accordion({
        collapsible: true,
        animate: 500,
        active: false,
        heightStyle: "content",
        icons: { header: "ui-icon-plus", activeHeader: "ui-icon-minus" }
    });
    $('.tables').click(function() {
        console.log($(this)[0].innerText);
        currTable = $(this)[0].innerText;
    });
    $('.databases').click(function() {
        console.log($(this)[0].innerText);
        currTable = "";
        if ($("#accordion").accordion("option", "active") !== false) {
            currDB = $(this)[0].innerText;
            renderTablesOfDB(retrieveTablesFromDB(currDB), currDB);
        } else {
            currDB = "";
            $(prevp).removeClass('border');
        }
    });

    function checkQueryText() {
        //Do validation and print answer in result tab
        const inpQuery = document.getElementById("query-text");
        reg = /SELECT/i;
        if (reg.test(inpQuery.value)) {
            inpQuery.style.color = "lightgreen";
            document.getElementById("query-error").innerText = "Response: Looks Good";
            document.getElementById("query-error").style.color = "green";
        } else {
            inpQuery.style.color = "red";
            document.getElementById("query-error").innerText = "Response: You are writing a shitty query";
            document.getElementById("query-error").style.color = "red";
        }
    }
    $('#query-text').on('input', checkQueryText);

    $("#execute-button").click(executeQuery);

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
    $("#auto-save").click(save_query);

    function save_query() {
        const queryText = $("#query-text").val().trim();
        if (queryText == "") {
            alert("Empty SQL Query!");
        } else {
            $("#save-ol").prepend(`<li>${queryText}</li>`);
        }
    }

    $("#auto-clear").click(function() {
        const queryText = $("#query-text").val().trim();
        if (queryText == "") {
            alert("Empty SQL Query!");
        } else if (window.confirm("Do you want to clear this query"))
            $("#query-text").val("");
    });

    $(".sub-auto-queries").click(validate_selection);
    $("#auto-select-all").click(function() {
        const queryText = $("#query-text");
        if (validate_selection()) {
            queryText.val("USE " + currDB + ";\nSELECT * FROM " + currTable + ";");
            queryText.css('color', 'green');
        }
    });

    function validate_selection() {
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
            queryError.text("Response: All good till now");
            queryError.css('color', 'green');
            return true;
        }
    }
    let prevp;
    $(".tables").click(function() {
        $(prevp).removeClass('border');
        //$(this).css({ "border": "red solid 2px" });
        $(this).addClass('border');
        prevp = $(this);
        var tables = displayTableContent(currDB, currTable);
    });

});

function renderTablesOfDB(tables, currDB) {
    let tableDetails = "";
    tableDetails += `<table class="highlight"><thead><tr><th>Table Name</th><th>Drop Table</th><th>Delete All Entries</th></tr></thead>`;
    for (var i = 0; i < tables.length; i++) {
        tableDetails += ('<tr><td>' + tables[i] + '</td><td><button>Drop</button></td><td><button>Delete Entries</button></td></tr>');
    }
    tableDetails += '</table>';
    console.log(tableDetails);
    $("#result-response").html(tableDetails);
}

function retrieveTablesFromDB(dbName) {
    currDbIndex = jsonObj.databases.findIndex(obj => obj == dbName);
    return jsonObj.tables[currDbIndex];
}

jsonStr = `{"databases":["db1","db2"],"tables":[["table11","table12"],["table21","table22","table23"]],"table-details":{"db1+table11":[{"colName":"index","colType":"int"},{"colName":"empName","colType":"varchar(50)"},{"colName":"workingHours","colType":"int"}],"db1+table12":[{"colName":"col121","colType":"int"},{"colName":"col122","colType":"varchar(50)"},{"colName":"col123","colType":"int"}],"db2+table21":[{"colName":"index","colType":"int"},{"colName":"empName","colType":"varchar(50)"},{"colName":"workingHours","colType":"int"}],"db2+table22":[{"colName":"col21","colType":"int"},{"colName":"col22","colType":"varchar(50)"},{"colName":"col23","colType":"int"}],"db2+table23":[{"colName":"col21","colType":"int"},{"colName":"col22","colType":"varchar(50)"},{"colName":"col23","colType":"int"}]},"table-data":{"db1+table11":[[1,"Emp1",38],[2,"Emp2",40],[1,"Emp3",45]],"db1+table12":[[121,"Entry 121",12],[122,"Entry 122",13],[123,"Entry 123",14]],"db2+table21":[[211,"Entry 21",21],[221,"Entry 22",22],[231,"Entry 23",23]],"db2+table22":[[211,"Entry 21",21],[221,"Entry 22",22],[231,"Entry 23",23]],"db2+table23":[[211,"Entry 21",21],[221,"Entry 22",22],[231,"Entry 23",23]]}}`;

jsonObj = JSON.parse(jsonStr);

function displayTableContent(dbName, tableName) {
    currDB = dbName;
    currTable = tableName;
    tableDetails = jsonObj["table-details"][currDB + "+" + currTable];
    let innerContent = "";
    innerContent += `<h5>Data of table <strong>${tableName}</strong> is:\n</h5>`;
    innerContent += `<table class = "centered highlight"><hr><hr><hr><thead class = ""><tr>`;
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
        innerContent += `</tr>`
    }
    innerContent += `</tbody></table>`;
    $("#result-response").html(innerContent);
}


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