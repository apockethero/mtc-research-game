import { TopicConfig } from '../../types/card';

export const DEFAULT_TOPICS: TopicConfig[] = [
  {
    id: "mtc-electric",
    name: "Mototriciclos Eléctricos y Movilidad Ligera (MTC)",
    question: "¿Cómo optimizar la estabilidad, la propulsión eficiente y la accesibilidad ergonómica en vehículos eléctricos de 3 ruedas para el transporte urbano y periurbano en el Sur Global?",
    field: "Ingeniería de Transporte & Electromovilidad",
    defaultCategories: [
      "Estructura, ergonomía y seguridad",
      "Propulsión, batería y energía",
      "Logística, producción y despliegue",
      "Accesibilidad y movilidad inclusiva",
      "Aceptación pública y servicio",
      "Política, regulación y sociedad"
    ],
    deckType: "mtc_pilot"
  },
  {
    id: "ai-inventory",
    name: "Inteligencia Artificial en Gestión de Inventarios y Cadenas de Suministro",
    question: "¿En qué medida los modelos predictivos de aprendizaje profundo superan a las heurísticas clásicas en la reducción de costos y rotura de stock bajo demanda estocástica?",
    field: "Ciencia de la Computación & Operaciones",
    defaultCategories: [
      "Modelado Predictivo y Redes Neuronales",
      "Optimización Heurística y Estocástica",
      "Sistemas ERP y Despliegue en la Nube",
      "Evaluación Económica y Costos Operativos",
      "Resiliencia y Gestión de Riesgo"
    ],
    deckType: "custom"
  },
  {
    id: "telemedicine",
    name: "Telemedicina y Diagnóstico Clínico Asistido por Algoritmos",
    question: "¿Cuáles son las barreras metodológicas y éticas en la validación de sistemas de apoyo a decisiones clínicas en atención primaria remota?",
    field: "Salud Digital & Bioingeniería",
    defaultCategories: [
      "Visión por Computador en Imágenes Médicas",
      "Monitoreo Fisiológico Remoto (IoMT)",
      "Adopción y Experiencia del Paciente",
      "Cumplimiento Regulatorio y Privacidad (HIPAA/GDPR)",
      "Ensayos Clínicos y Validación de Fiabilidad"
    ],
    deckType: "custom"
  }
];
