/**
 * vCard Utils
 * Hanterar parsing och skapande av vCards (.vcf)
 */

export const createVCard = (contact) => {
  // Enkel vCard 3.0 generator
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${contact.name || "Okänd"}`,
    `ORG:${contact.company || ""}`,
    `TITLE:${contact.role || ""}`
  ];

  // Hantering av flera telefonnummer
  const phones = Array.isArray(contact.phone) ? contact.phone : [contact.phone];
  phones.forEach(p => {
    if(p) lines.push(`TEL;TYPE=CELL:${p}`);
  });

  // Hantering av flera emails
  const emails = Array.isArray(contact.email) ? contact.email : [contact.email];
  emails.forEach(e => {
    if(e) lines.push(`EMAIL;TYPE=WORK:${e}`);
  });

  lines.push("END:VCARD");
  return lines.join("\n");
};

export const exportContactsToVCard = (contacts) => {
  if (!contacts || contacts.length === 0) return;

  // Slå ihop alla kontakter till en sträng
  const vCardString = contacts.map(createVCard).join("\n");
  
  // Skapa en blob och trigga nedladdning
  const blob = new Blob([vCardString], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = "team-contacts.vcf";
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const parseVCard = (vCardString) => {
  // Enkel parser som extraherar fält från en multi-vcard sträng
  const cards = vCardString.split("BEGIN:VCARD").filter(c => c.trim().length > 0);
  
  return cards.map(card => {


    // Hantera fält som kan ha parametrar (t.ex. TEL;TYPE=CELL:) genom att matcha allt efter första kolonet
    const getValue = (key) => {
      const lines = card.split("\n");
      const line = lines.find(l => l.startsWith(key));
      if (!line) return "";
      const parts = line.split(":");
      // Ta allt efter första delen (hanterar om värdet innehåller kolon)
      return parts.slice(1).join(":").trim(); 
    };

    // Helper för att hämta alla förekomster av en nyckel (för arrayer)
    const getValues = (key) => {
      const lines = card.split("\n");
      return lines
        .filter(l => l.startsWith(key))
        .map(l => {
          const parts = l.split(":");
          return parts.slice(1).join(":").trim();
        });
    };

    return {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      name: getValue("FN") || "Okänd",
      company: getValue("ORG"),
      role: getValue("TITLE"),
      phone: getValues("TEL"), 
      email: getValues("EMAIL")
    };
  });
};
