export type InspectionSection = "Intérieur" | "Extérieur" | "Fonctionnement" | "Équipement";

export type InspectionQuestion = {
  id: string;
  section: InspectionSection;
  label: string;
  anomalyTitle: string;
  area: string;
  severity: "mineure" | "moderee" | "importante" | "critique";
  impact: "usable" | "usable_caution" | "unusable";
};

export const INSPECTION_QUESTIONS: InspectionQuestion[] = [
  {
    id: "controls",
    section: "Intérieur",
    label: "Le volant, les pédales et le frein de stationnement fonctionnent-ils correctement?",
    anomalyTitle: "Problème de commandes de conduite",
    area: "Poste de conduite",
    severity: "critique",
    impact: "unusable",
  },
  {
    id: "dashboard",
    section: "Intérieur",
    label: "Le klaxon, les commandes et les instruments du tableau de bord fonctionnent-ils correctement?",
    anomalyTitle: "Commande ou instrument défectueux",
    area: "Tableau de bord",
    severity: "importante",
    impact: "usable_caution",
  },
  {
    id: "visibility",
    section: "Intérieur",
    label: "Les essuie-glaces, le lave-glace, les vitres et la visibilité sont-ils en bon état?",
    anomalyTitle: "Problème de visibilité",
    area: "Visibilité",
    severity: "importante",
    impact: "usable_caution",
  },
  {
    id: "safety-interior",
    section: "Intérieur",
    label: "La ceinture, le siège conducteur et les portes fonctionnent-ils correctement?",
    anomalyTitle: "Équipement de sécurité intérieur défectueux",
    area: "Sécurité intérieure",
    severity: "critique",
    impact: "unusable",
  },
  {
    id: "cleanliness",
    section: "Intérieur",
    label: "L'intérieur est-il propre, sécuritaire et sans objet gênant la conduite?",
    anomalyTitle: "Intérieur non conforme",
    area: "Habitacle",
    severity: "mineure",
    impact: "usable",
  },
  {
    id: "lights",
    section: "Extérieur",
    label: "Les phares, feux arrière, feux de freinage, clignotants et feux de détresse fonctionnent-ils?",
    anomalyTitle: "Éclairage extérieur défectueux",
    area: "Éclairage",
    severity: "importante",
    impact: "usable_caution",
  },
  {
    id: "tires",
    section: "Extérieur",
    label: "Les quatre pneus semblent-ils gonflés et exempts de crevaison, d'usure ou de dommage visible?",
    anomalyTitle: "Anomalie de pneu",
    area: "Pneus",
    severity: "critique",
    impact: "unusable",
  },
  {
    id: "glass-mirrors",
    section: "Extérieur",
    label: "Le pare-brise, les fenêtres et les rétroviseurs extérieurs sont-ils en bon état?",
    anomalyTitle: "Vitre ou rétroviseur endommagé",
    area: "Vitres et rétroviseurs",
    severity: "importante",
    impact: "usable_caution",
  },
  {
    id: "body",
    section: "Extérieur",
    label: "La carrosserie, les portes, les pare-chocs, la plaque et les logos sont-ils en bon état et présentables?",
    anomalyTitle: "Dommage extérieur ou apparence non conforme",
    area: "Carrosserie",
    severity: "moderee",
    impact: "usable",
  },
  {
    id: "leaks",
    section: "Extérieur",
    label: "Aucune fuite, fumée, pièce détachée ou anomalie visible n'est-elle présente autour du véhicule?",
    anomalyTitle: "Fuite ou pièce extérieure anormale",
    area: "Sous le véhicule",
    severity: "critique",
    impact: "unusable",
  },
  {
    id: "engine",
    section: "Fonctionnement",
    label: "Le véhicule démarre-t-il et fonctionne-t-il normalement, sans voyant, bruit, vibration ou odeur inhabituelle?",
    anomalyTitle: "Anomalie moteur ou fonctionnement",
    area: "Moteur et fonctionnement",
    severity: "importante",
    impact: "usable_caution",
  },
  {
    id: "drive",
    section: "Fonctionnement",
    label: "La direction, les freins et la transmission semblent-ils fonctionner normalement?",
    anomalyTitle: "Problème de direction, freinage ou transmission",
    area: "Conduite",
    severity: "critique",
    impact: "unusable",
  },
  {
    id: "fuel",
    section: "Fonctionnement",
    label: "Le niveau de carburant est-il suffisant pour commencer le quart?",
    anomalyTitle: "Carburant insuffisant",
    area: "Carburant",
    severity: "mineure",
    impact: "usable",
  },
  {
    id: "equipment",
    section: "Équipement",
    label: "Les documents et équipements requis sont-ils présents et utilisables?",
    anomalyTitle: "Document ou équipement manquant",
    area: "Équipement",
    severity: "moderee",
    impact: "usable_caution",
  },
];

export const INSPECTION_SECTIONS: InspectionSection[] = ["Intérieur", "Extérieur", "Fonctionnement", "Équipement"];
