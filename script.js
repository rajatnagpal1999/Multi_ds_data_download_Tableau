<script>
let worksheets = [];

async function init() {
  await tableau.extensions.initializeAsync();
  const dashboard = tableau.extensions.dashboardContent.dashboard;
  worksheets = dashboard.worksheets;

  const firstSheet = worksheets[0];
  const summary = await firstSheet.getSummaryDataAsync();

  populateDropdown(summary, 'Category', 'categorySelect');
  populateDropdown(summary, 'Region', 'regionSelect');
  populateDropdown(summary, 'Segment', 'segmentSelect');

  document.getElementById('applyBtn').addEventListener('click', applyFilters);
}

tableau.extensions.initializeAsync().then(init);

function populateDropdown(summary, fieldName, elementId) {
  const colIndex = summary.columns.findIndex(c => c.fieldName === fieldName);
  if (colIndex === -1) return;
  const uniqueValues = [...new Set(summary.data.map(row => row[colIndex].value))];
  const dropdown = document.getElementById(elementId);
  uniqueValues.forEach(v => {
    const opt = document.createElement('option');
    opt.textContent = v;
    opt.value = v;
    dropdown.appendChild(opt);
  });
}

function getSelectedValues(elementId) {
  return Array.from(document.getElementById(elementId).selectedOptions).map(o => o.value);
}

async function applyFilters() {
  const filters = [
    { field: 'Category', values: getSelectedValues('categorySelect') },
    { field: 'Region', values: getSelectedValues('regionSelect') },
    { field: 'Segment', values: getSelectedValues('segmentSelect') }
  ];

  for (const ws of worksheets) {
    for (const f of filters) {
      if (f.values.length === 0) continue; // skip empty
      try {
        await ws.applyFilterAsync(f.field, f.values, tableau.FilterUpdateType.REPLACE);
      } catch (err) {
        console.warn(`Filter failed on ${ws.name} for field ${f.field}:`, err);
      }
    }
  }
}
</script>
