
let worksheets = [];


async function initializeExtension() {
await tableau.extensions.initializeAsync();


const dashboard = tableau.extensions.dashboardContent.dashboard;
worksheets = dashboard.worksheets;


// Use first worksheet to populate filter values
const firstWorksheet = worksheets[0];
const summaryData = await firstWorksheet.getSummaryDataAsync();


populateDropdown(summaryData, 'Category', 'categorySelect');
populateDropdown(summaryData, 'Region', 'regionSelect');
populateDropdown(summaryData, 'Segment', 'segmentSelect');


document
.getElementById('applyBtn')
.addEventListener('click', applyFilters);
}


function populateDropdown(summaryData, fieldName, elementId) {
const colIndex = summaryData.columns.findIndex(
c => c.fieldName === fieldName
);


if (colIndex === -1) {
console.warn(`Field not found: ${fieldName}`);
return;
}


const values = summaryData.data.map(row => row[colIndex].value);
const uniqueValues = [...new Set(values)];


const select = document.getElementById(elementId);


uniqueValues.forEach(val => {
const option = document.createElement('option');
option.value = val;
option.textContent = val;
select.appendChild(option);
});
}


function getSelectedValues(elementId) {
return Array.from(
document.getElementById(elementId).selectedOptions
).map(o => o.value);
}


async function applyFilters() {
const filters = [
{ field: 'Category', values: getSelectedValues('categorySelect') },
{ field: 'Region', values: getSelectedValues('regionSelect') },
{ field: 'Segment', values: getSelectedValues('segmentSelect') }
];


for (const worksheet of worksheets) {
for (const filter of filters) {
if (filter.values.length === 0) continue;


try {
await worksheet.applyFilterAsync(
filter.field,
filter.values,
tableau.FilterUpdateType.REPLACE
);
} catch (err) {
console.warn(
`Failed filtering ${filter.field} on ${worksheet.name}`,
err
);
}
}
}
}


// Initialize extension
document.addEventListener('DOMContentLoaded', initializeExtension);