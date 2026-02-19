  // ---------- KONTROLLER ----------
export const dashboardControls = ({
  teamName,
  people,
  currentFilter,
  onChange
})  =>
{
  const controls = document.createElement("div");
  controls.className = "dashboard-controls";

  const select = document.createElement("select");
  select.className = "taskFilterSelect";

  const teamOption = document.createElement("option");
  teamOption.value = "Team";
  teamOption.textContent = `${teamName} & Favoriter`;
  select.append(teamOption);

  const allOption = document.createElement("option");
  allOption.value = "ALLA";
  allOption.textContent = "--- Visa alla dashboards ---";
  select.append(allOption);

  // Här renderas nu endast riktiga personer (Ingen är bortfiltrerad ovan)
  people.forEach(person => {
    const option = document.createElement("option");
    option.value = person;
    option.textContent = person;
    select.append(option);
  });

  select.value = currentFilter;
  select.addEventListener("change", () => {
    localStorage.setItem("dashboardViewFilter", select.value);
    onChange();
  });


  controls.append(select);
  return controls;
}
