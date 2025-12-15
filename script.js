let worksheets = [];


//field names as present in data sources
const FILTER_FIELDS = [
{ fieldName: 'resp_region_grouped', label: 'Region', elementId: 'regionSelect' },
{ fieldName: 'resp_sampling_phase', label: 'Phase', elementId: 'phaseSelect' },
{ fieldName: 'resp_personal_income', label: 'Personal Income', elementId: 'incomeSelect' }
];


async function initializeExtension() {
await tableau.extensions.initializeAsync();


const dashboard = tableau.extensions.dashboardContent.dashboard;
worksheets = dashboard.worksheets;


// Use first worksheet to populate filter values
const firstWorksheet = worksheets[0];
const summaryData = await firstWorksheet.getSummaryDataAsync();


FILTER_FIELDS.forEach(f => {
populateDropdown(summaryData, f.fieldName, f.elementId);
});


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
for (const worksheet of worksheets) {
for (const filter of FILTER_FIELDS) {
const values = getSelectedValues(filter.elementId);
if (values.length === 0) continue;


try {
await worksheet.applyFilterAsync(
filter.fieldName,
values,
tableau.FilterUpdateType.REPLACE
);
} catch (err) {
console.warn(
`Failed filtering ${filter.fieldName} on ${worksheet.name}`,
err
);
}
}
}
}


document.addEventListener('DOMContentLoaded', initializeExtension);