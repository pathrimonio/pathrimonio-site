export function exportStoriesToCSV(stories) {
  const headers = [
    "ID",
    "Módulo",
    "Prioridad",
    "Estado",
    "Como (Rol)",
    "Quiero (Acción)",
    "Para que (Beneficio)",
    "Criterios de Aceptación",
    "Autor",
    "Creado"
  ];

  const rows = stories.map(s => [
    `"${s.id}"`,
    `"${s.module}"`,
    `"${s.priority}"`,
    `"${s.status}"`,
    `"${(s.role || '').replace(/"/g, '""')}"`,
    `"${(s.action || '').replace(/"/g, '""')}"`,
    `"${(s.benefit || '').replace(/"/g, '""')}"`,
    `"${s.criteria.map(c => (c.checked ? '[x] ' : '[ ] ') + c.text).join('; ').replace(/"/g, '""')}"`,
    `"${s.author || ''}"`,
    `"${s.createdAt || ''}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `pathrimonio_historias_sprint14_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportStoriesToJiraJSON(stories) {
  const jiraFormat = {
    project: {
      key: "PATH",
      name: "Pathrimonio Core Banking & Impact Hub"
    },
    sprint: "Sprint 14 Planning",
    exportedAt: new Date().toISOString(),
    issues: stories.map(s => ({
      key: s.id,
      summary: `${s.module}: ${s.role} - ${s.action.slice(0, 60)}...`,
      issueType: "Story",
      priority: s.priority,
      status: s.status,
      description: `*Como:* ${s.role}\n*Quiero:* ${s.action}\n*Para:* ${s.benefit}\n\n*Criterios de Aceptación:*\n` +
        s.criteria.map(c => `* ${c.checked ? '(/)' : '(x)'} ${c.text}`).join('\n'),
      customFields: {
        module: s.module,
        author: s.author
      }
    }))
  };

  const jsonContent = JSON.stringify(jiraFormat, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `pathrimonio_jira_sprint14_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
