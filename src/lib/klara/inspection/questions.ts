import type { AnomalySeverity, InspectionSectionId } from "./types";

export type InspectionFollowUp = {
  id: string;
  label: string;
  options: string[];
  required?: boolean;
  multiple?: boolean;
};

export type InspectionQuestionConfig = {
  id: string;
  section: InspectionSectionId;
  label: string;
  category: string;
  anomalyTitle: string;
  defaultSeverity: AnomalySeverity;
  outOfServiceOnDefect: boolean;
  commentRequiredOnDefect: boolean;
  photoRecommendedOnDefect?: boolean;
  followUpOptions?: InspectionFollowUp[];
  okLabel?: string;
  defectLabel?: string;
};

export const INSPECTION_QUESTIONS: InspectionQuestionConfig[] = [
  {
    id: "q1",
    section: "interior",
    label: "Le volant, les pédales, le frein de stationnement et les commandes de conduite fonctionnent-ils correctement?",
    category: "driving_controls",
    anomalyTitle: "Commandes de conduite défectueuses",
    defaultSeverity: "critical",
    outOfServiceOnDefect: true,
    commentRequiredOnDefect: true,
  },
  {
    id: "q2",
    section: "interior",
    label: "Le tableau de bord, le klaxon et les instruments fonctionnent-ils correctement, sans voyant inhabituel?",
    category: "dashboard_instruments",
    anomalyTitle: "Tableau de bord ou instrument défectueux",
    defaultSeverity: "major",
    outOfServiceOnDefect: false,
    commentRequiredOnDefect: true,
    followUpOptions: [
      {
        id: "warning_lights",
        label: "Voyants allumés (facultatif)",
        multiple: true,
        options: [
          "Check Engine",
          "Batterie",
          "Huile",
          "Freins",
          "Pression des pneus",
          "Température moteur",
          "ABS",
          "Airbag",
          "Autre",
        ],
      },
    ],
  },
  {
    id: "q3",
    section: "interior",
    label: "Les essuie-glaces, le lave-glace, les fenêtres et le système de désembuage fonctionnent-ils correctement?",
    category: "visibility_systems",
    anomalyTitle: "Système de visibilité défectueux",
    defaultSeverity: "major",
    outOfServiceOnDefect: false,
    commentRequiredOnDefect: true,
  },
  {
    id: "q4",
    section: "interior",
    label: "Les rétroviseurs, les ceintures, le siège conducteur et les portes sont-ils sécuritaires et fonctionnels?",
    category: "interior_safety",
    anomalyTitle: "Équipement de sécurité intérieur défectueux",
    defaultSeverity: "major",
    outOfServiceOnDefect: false,
    commentRequiredOnDefect: true,
    photoRecommendedOnDefect: true,
  },
  {
    id: "q5",
    section: "interior",
    label: "L'intérieur du véhicule est-il propre, dégagé et sécuritaire?",
    category: "interior_condition",
    anomalyTitle: "Intérieur non conforme",
    defaultSeverity: "minor",
    outOfServiceOnDefect: false,
    commentRequiredOnDefect: true,
  },
  {
    id: "q6",
    section: "exterior",
    label: "Les phares, feux arrière, feux de freinage, clignotants et feux de détresse fonctionnent-ils correctement?",
    category: "lighting",
    anomalyTitle: "Éclairage défectueux",
    defaultSeverity: "major",
    outOfServiceOnDefect: false,
    commentRequiredOnDefect: true,
    photoRecommendedOnDefect: true,
  },
  {
    id: "q7",
    section: "exterior",
    label: "Les quatre pneus sont-ils suffisamment gonflés et exempts de crevaison, d'usure excessive ou de dommage visible?",
    category: "tires",
    anomalyTitle: "Anomalie de pneu",
    defaultSeverity: "critical",
    outOfServiceOnDefect: true,
    commentRequiredOnDefect: true,
    photoRecommendedOnDefect: true,
    followUpOptions: [
      {
        id: "tire_position",
        label: "Quel pneu est concerné?",
        required: true,
        options: ["Avant gauche", "Avant droit", "Arrière gauche", "Arrière droit", "Plusieurs pneus"],
      },
      {
        id: "tire_problem",
        label: "Quel problème est constaté?",
        required: true,
        options: [
          "Pression insuffisante",
          "Pneu complètement dégonflé",
          "Crevaison",
          "Usure importante",
          "Coupure ou dommage",
          "Autre",
        ],
      },
    ],
  },
  {
    id: "q8",
    section: "exterior",
    label: "Le pare-brise, les fenêtres et les rétroviseurs extérieurs sont-ils en bon état?",
    category: "glass_and_mirrors",
    anomalyTitle: "Vitre ou rétroviseur endommagé",
    defaultSeverity: "major",
    outOfServiceOnDefect: false,
    commentRequiredOnDefect: true,
    photoRecommendedOnDefect: true,
  },
  {
    id: "q9",
    section: "exterior",
    label: "La carrosserie, les portes, les pare-chocs, la plaque et les logos sont-ils en bon état et présentables?",
    category: "body_condition",
    anomalyTitle: "Dommage à la carrosserie",
    defaultSeverity: "minor",
    outOfServiceOnDefect: false,
    commentRequiredOnDefect: true,
    photoRecommendedOnDefect: true,
    followUpOptions: [
      {
        id: "damage_location",
        label: "Où se trouve le dommage?",
        required: true,
        options: ["Avant", "Arrière", "Côté conducteur", "Côté passager", "Toit", "Autre"],
      },
    ],
  },
  {
    id: "q10",
    section: "exterior",
    label: "Aucune fuite, fumée, odeur anormale ou pièce détachée n'est-elle visible sous ou autour du véhicule?",
    category: "external_mechanical",
    anomalyTitle: "Fuite ou pièce anormale sous le véhicule",
    defaultSeverity: "major",
    outOfServiceOnDefect: false,
    commentRequiredOnDefect: true,
    photoRecommendedOnDefect: true,
  },
  {
    id: "q11",
    section: "operation",
    label: "Le véhicule démarre-t-il et fonctionne-t-il normalement, sans voyant, bruit, vibration ou odeur inhabituelle?",
    category: "engine_operation",
    anomalyTitle: "Problème moteur ou de fonctionnement",
    defaultSeverity: "major",
    outOfServiceOnDefect: false,
    commentRequiredOnDefect: true,
  },
  {
    id: "q12",
    section: "operation",
    label: "La direction, les freins et la transmission semblent-ils fonctionner normalement?",
    category: "road_operation",
    anomalyTitle: "Problème de direction, de freinage ou de transmission",
    defaultSeverity: "critical",
    outOfServiceOnDefect: true,
    commentRequiredOnDefect: true,
  },
  {
    id: "q13",
    section: "operation",
    label: "Le niveau de carburant est-il suffisant pour commencer ou poursuivre le quart?",
    category: "fuel",
    anomalyTitle: "Carburant insuffisant",
    defaultSeverity: "minor",
    outOfServiceOnDefect: false,
    commentRequiredOnDefect: true,
  },
  {
    id: "q14",
    section: "equipment",
    label: "Les documents et équipements obligatoires sont-ils présents dans le véhicule?",
    category: "required_equipment",
    anomalyTitle: "Document ou équipement manquant",
    defaultSeverity: "minor",
    outOfServiceOnDefect: false,
    commentRequiredOnDefect: true,
  },
  {
    id: "q15",
    section: "conclusion",
    label: "Selon votre inspection, le véhicule peut-il être utilisé de façon sécuritaire?",
    category: "vehicle_safety",
    anomalyTitle: "Véhicule jugé non sécuritaire",
    defaultSeverity: "critical",
    outOfServiceOnDefect: true,
    commentRequiredOnDefect: true,
    okLabel: "OK — Le véhicule peut être utilisé",
    defectLabel: "Défaut — Le véhicule ne devrait pas être utilisé",
  },
  {
    id: "q16",
    section: "conclusion",
    label: "Avez-vous remarqué une autre anomalie non couverte dans le formulaire?",
    category: "other",
    anomalyTitle: "Autre anomalie signalée",
    defaultSeverity: "minor",
    outOfServiceOnDefect: false,
    commentRequiredOnDefect: true,
    photoRecommendedOnDefect: true,
    okLabel: "OK — Rien d'autre à signaler",
    defectLabel: "Défaut — Une autre anomalie est présente",
  },
];

export const QUESTIONS_BY_ID: Record<string, InspectionQuestionConfig> = Object.fromEntries(
  INSPECTION_QUESTIONS.map((q) => [q.id, q]),
);

export function questionsForSection(section: InspectionQuestionConfig["section"]) {
  return INSPECTION_QUESTIONS.filter((q) => q.section === section);
}