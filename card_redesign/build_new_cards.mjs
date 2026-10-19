import fs from "node:fs";
import path from "node:path";

const redesignDir = path.resolve(import.meta.dirname);
const sourceMd = path.join(redesignDir, "final_card_text_49.md");
const bibFile = path.resolve(redesignDir, "..", "references_paper1.bib");
const visualDir = path.join(redesignDir, "generated_visuals");
const outDir = path.join(redesignDir, "final_cards");

const categoryStyle = {
  "Accessibility and inclusive mobility": { color: "#0f766e", route: "R1-R2", es: "Accesibilidad y movilidad inclusiva" },
  "Public acceptance and service quality": { color: "#2563eb", route: "R1-R5", es: "Aceptaci?n p?blica y calidad del servicio" },
  "Structure, ergonomics and safety": { color: "#b91c1c", route: "R1-R2", es: "Estructura, ergonom?a y seguridad" },
  "Propulsion, battery and energy management": { color: "#b45309", route: "T1-T2", es: "Propulsi?n, bater?a y gesti?n de energ?a" },
  "Logistics, production and applied deployment": { color: "#15803d", route: "T2-T3", es: "Log?stica, producci?n y despliegue" },
  "Policy, regulation and socioeconomic context": { color: "#7e22ce", route: "R1-R4", es: "Pol?tica, regulaci?n y contexto socioecon?mico" }
};

const esCards = {
  MTC01: ["Freno por pedaleo inverso", "Dise�o/prototipo", "El pedaleo inverso puede conectar la accion de las piernas con el frenado de un triciclo h�brido.", "Introduce una interfaz mec�nica simple de frenado para plataform�s pequenas.", "No afirmar mejora de seguridad sin v�lidacion experimental."],
  MTC02: ["Triciclo el�ctrico solar inteligente", "Dise�o", "El apoyo solar puede integrarse en una arquitectura compacta de triciclo el�ctrico.", "Muestra una ruta trazable para dise�ar triciclos solares el�ctricos.", "Fuente de reemplazo; no mencionar control por huella."],
  MTC03: ["Prototipo agr�cola de triciclo", "Prototipo virtual", "El dise�o agr�cola puede conectar conductor, veh�culo y condiciones del camino.", "Conserva el rol rural/agr�cola con una fuente verificable de modelado.", "No atribuir hallazgos de Ghana, suelo seco o implementos montados."],
  MTC04: ["Conversion solar y desempe�o", "Prueba de conversion/desempe�o", "Un veh�culo de gasolina de tres ruedas puede convertirse a propulsi�n el�ctrica con carga solar a bordo.", "Aporta evidencia medida sobre conversion y desempe�o energetico.", "No generalizar m�s alla del veh�culo y la configuracion probada."],
  MTC05: ["Chasis para movilidad de adultos mayores", "Dise�o/fabricacion", "La geometr�a del chasis afecta estabilidad y acceso para usuarios mayores.", "Orienta la carta hacia dise�o accesible de chasis con evidencia trazable.", "Fuente con metadatos incompletos; evitar afirmaciones sobre resortes o carga."],
  MTC06: ["Carga est�tica del bastidor", "Simulaci�n", "La simulaci�n de carga est�tica ayuda a evaluar si el bastidor soporta cargas esperadas.", "Muestra c�mo la simulaci�n temprana informa el dise�o antes de pruebas f�sicas.", "La carga est�tica no reemplaza fatiga, vibracion ni v�lidacion en campo."],
  MTC07: ["Enfriamiento solar del motor", "Dise�o/control", "El enfriamiento apoyado por energ�a solar puede ayudar a controlar temperatura del motor.", "Conecta gesti�n t�rmica, apoyo fotovoltaico y confiabilidad.", "No afirmar ganancias de eficiencia sin datos medidos."],
  MTC08: ["Recuperaci�n de energ�a con volante", "Dise�o mec�nico", "Un KERS con volante puede acoplarse mec�nicamente al tren motriz de un triciclo.", "Presenta la recuperaci�n de energ�a c�mo reto de componente.", "Los ahorros pr�cticos requieren pruebas con ciclos reales de uso."],
  MTC09: ["Asistencia el�ctrica en e-trike", "Algoritmo/experimento", "La asistencia por din�mica inversa puede reducir el esfuerzo de adultos mayores.", "Muestra que la asistencia puede dise�arse segun la demanda del movimiento humano.", "Mantener las afirmaciones ligadas al perfil de participantes y condiciones probadas."],
  MTC10: ["An�lisis del brazo oscilante delantero", "An�lisis estructural", "Un brazo oscilante delantero debe equilibrar resistencia, peso y cargas de frenado.", "Muestra c�mo CAE apoya el dise�o seguro del frente del veh�culo.", "La simulaci�n no equivale a v�lidacion de durabilidad en carretera."],
  MTC11: ["Econom�a de combustible en rickshaw h�brido", "Modelo/referencia", "El dise�o h�brido de un rickshaw puede evaluarse mediante modelado de econom�a de combustible.", "Da un punto de comparaci�n para sistem�s energ�ticos de tres ruedas.", "No leer resultados h�bridos c�mo desempe�o de campo de bater�a el�ctrica."],
  MTC12: ["Triciclo el�ctrico accesible", "Proyecto de dise�o", "La asistencia el�ctrica puede ampliar movilidad si prioriza estabilidad, control y costo.", "Ubica el dise�o inclusivo dentro de la investigaci�n sobre triciclos el�ctricos.", "Evidencia aplicada de dise�o; evitar generalizaci�n amplia."],
  MTC13: ["Ciclismo exterior en e-trike", "Evaluaci�n con usuarios", "El e-trike al aire libre puede funcionar c�mo actividad fisica de baja intensidad.", "Conecta e-trikes con salud, movilidad y esfuerzo controlado.", "El perfil de participantes y las condiciones limitan la generalizaci�n."],
  MTC14: ["Aceptaci�n p�blica del e-trike", "Estudio cuantitativo descriptivo", "La aceptaci�n depende de seguridad, conveniencia, costo y experiencia de servicio.", "Muestra la implementaci�n c�mo asunto social y de servicio, no solo t�cnico.", "No generalizar fuera del contexto urbano espec�fico."],
  MTC15: ["Eficiencia operaci�nal del e-trike", "Evaluaci�n operaci�nal", "E-trikes y triciclos motorizados pueden compararse c�mo veh�culos de utilidad p�blica.", "Conecta tarifas, operaci�n terminal y servicio al pasajero.", "Los resultados dependen de condiciones modeladas de terminal."],
  MTC16: ["Ergonom�a del E-Traysikel", "Evaluaci�n ergon�mica", "Las dimensiones del e-trike deben ajustarse a cuerpos, posturas y confort.", "Hace visible el ajuste del conductor y pasajero en el dise�o.", "Hallazgos ligados a datos antropom�tricos y participantes."],
  MTC17: ["Dise�o de triciclo adaptativo", "Dise�o/an�lisis", "El dise�o adaptativo traduce necesidades de movilidad en decisiones de marco y control.", "Apoya el dise�o vehicular centrado en accesibilidad.", "Fuente de reemplazo; no atribuir afirmaciones al informe original."],
  MTC18: ["Calidad del servicio e-trike", "An�lisis de calidad de servicio", "La calidad del servicio depende de sostenibilidad e indicadores de experiencia.", "Muestra que calidad de viaje, accesibilidad y experiencia importan.", "Mantener las afirmaciones ligadas a Metro Manila."],
  MTC19: ["Dimensionamiento del tren motriz", "Dimensionamiento/simulaci�n", "El tren motriz de un EV de tres ruedas debe conectar motor, bater�a y desempe�o.", "Reemplaza un caso especializado por evidencia directa de dimensionamiento.", "La simulaci�n requiere v�lidacion con ciclos reales y carga util."],
  MTC20: ["Direcci�n Ackerman en triciclo el�ctrico", "Estudio de direcci�n", "La geometr�a de direcci�n afecta control, estabilidad y maniobrabilidad.", "Reemplaza una tesis no verificada con fuente trazable.", "Mantener el foco en dise�o de direcci�n Ackerman."],
  MTC21: ["Triciclo inclinable ajustable", "Prototipo/dise�o", "La inclinacion ajustable puede acercar manejo de bicicleta y estabilidad de triciclo.", "Muestra mecanismos de inclinacion ajustable para seguridad.", "No afirmar mejora universal de seguridad sin condiciones de prueba."],
  MTC22: ["Din�mica de tres ruedas angosto", "Revisi�n", "Los veh�culos el�ctricos angostos requieren integrar din�mica y control antivuelco.", "Aporta una revisi�n de alto nivel sobre seguridad y control.", "Una revisi�n no v�lida un dise�o espec�fico de motocarro."],
  MTC23: ["Control de estabilidad en EV inclinable", "Control/modelo", "El control multivariable puede mejorar estabilidad en veh�culos el�ctricos angostos inclinables.", "Aporta evidencia directa de control de estabilidad en tres ruedas.", "Mantener afirmaciones ligadas a la arquitectura modelada."],
  MTC24: ["Triciclo el�ctrico de carga �ltima milla", "Desarrollo vehicular", "Los triciclos el�ctricos de carga pueden dise�arse segun requisitos de paqueter�a.", "Muestra c�mo los requisitos de servicio moldean el dise�o.", "Las pruebas de prototipo no son v�lidacion operaci�nal m�siva."],
  MTC25: ["An�lisis de estabilidad antivuelco", "An�lisis de estabilidad", "El an�lisis de vuelco ayuda a identificar condiciones inseguras.", "Mantiene el rol de modelado de seguridad con fuente verificada.", "Evidencia de congreso; no presentarla c�mo v�lidacion de campo."],
  MTC26: ["Confort de viaje del pasajero", "Modelo biodin�mico", "El confort puede modelarse mediante din�mica del cuerpo sentado y suspensi�n.", "Muestra el confort c�mo criterio medible de dise�o.", "Los resultados dependen de supuestos del modelo y entradas de camino."],
  MTC27: ["Capacidad de flujo vehicular", "An�lisis de capacidad vial", "Los veh�culos de tres ruedas pueden afectar capacidad y uso del espacio vial.", "Preserva el rol de gesti�n del tr�fico con una fuente trazable.", "Fuente de reemplazo; no afirmar congesti�n especifica de Bishoftu."],
  MTC28: ["Din�mica de suspensi�n con inerter", "Modelo dinamico", "La suspensi�n con absorbedor inerter puede afectar confort y estabilidad.", "Conecta din�mica de suspensi�n, camino y respuesta vehicular.", "La mejora analitica o simulada no equivale a campo."],
  MTC29: ["Consumo de bater�a por carga y velocidad", "Prueba experimental", "El consumo de bater�a cambia con carga y velocidad en un EV de tres ruedas.", "Muestra carga y velocidad c�mo variables de desempe�o de bater�a.", "Los valores num�ricos requieren contexto completo de prueba."],
  MTC30: ["Dise�o seguro en curvas", "An�lisis dinamico", "El an�lisis dinamico puede apoyar suspensi�n y direcci�n m�s seguras.", "Muestra dise�o basado en modelos para seguridad en curvas.", "Separar seguridad modelada de evidencia en uso real."],
  MTC31: ["Controlador por indice de vuelco", "Simulaci�n de control", "El frenado diferencial trasero puede reducir riesgo de vuelco en tres ruedas delta.", "Explica deteccion y mitigacion del riesgo de vuelco.", "La v�lidacion simulada no es despliegue real."],
  MTC32: ["Evaluaci�n de propulsi�n en rickshaw", "Evaluaci�n comparativa", "La propulsi�n el�ctrica requiere comparar motor, bater�a y necesidades de desempe�o.", "Ayuda a comparar opciones de propulsi�n c�mo decisiones de dise�o.", "Las recomendaciones dependen de supuestos de operaci�n."],
  MTC33: ["Vuelco por obstaculo y derrape", "Control num�rico/HIL", "Vuelco y derrape lateral son problem�s de seguridad conectados.", "Muestra la necesidad de sensores y estrategias de control.", "La v�lidacion numerica o HIL no es prueba de campo."],
  MTC34: ["Control antivuelco con direcci�n activa", "Desarrollo de controlador", "La direcci�n activa delantera puede mitigar riesgo de vuelco.", "Agrega una ruta de control distinta al frenado diferencial.", "Distinguirlo del control por frenado diferencial trasero."],
  MTC35: ["Dise�o de propulsi�n por patron de manejo", "Simulaci�n de ciclo de manejo", "La propulsi�n el�ctrica debe dimensionarse desde patrones representativos de uso.", "Conecta uso real, torque, potencia y seleccion de componentes.", "Depende del ciclo elegido y los supuestos de modelado."],
  MTC36: ["Riesgo de vuelco en triciclo delta", "�ndice de vuelco/simulaci�n", "Los triciclos delta requieren modelado dedicado de riesgo de vuelco.", "Introduce el riesgo de vuelco c�mo evidencia medible.", "Evidencia de modelado, no despliegue en campo."],
  MTC37: ["Unidad industrial inteligente de tres ruedas", "Dise�o/prueba", "Unidades el�ctricas inteligentes de tres ruedas pueden apoyar log�stica interna.", "Extiende la movilidad de tres ruedas m�s alla del transporte publico.", "No generalizar productividad fuera del contexto demostrado."],
  MTC38: ["Triciclo el�ctrico accesible", "Prototipo/fabricacion", "El dise�o puede adaptar controles y estabilidad para discapacidad motriz.", "Muestra accesibilidad c�mo problema mec�nico y el�ctrico.", "Evidencia de prototipo salvo que exista prueba con usuarios."],
  MTC39: ["Triciclo accesible con energ�a solar", "Prototipo/dise�o", "La energ�a solar puede apoyar movilidad el�ctrica accesible de baja potencia.", "Conecta energ�a renovable, traccion el�ctrica y confort.", "No exagerar autonom�a solar sin datos medidos de alcance."],
  MTC40: ["Triciclo parcialmente solar", "Dise�o/an�lisis", "El apoyo fotovoltaico puede integrarse con bater�a y dise�o vehicular.", "Distingue dise�o solar asistido de solucion plenamente v�lidada.", "Identificar si la evidencia es an�lisis, prototipo o desempe�o."],
  MTC41: ["Triciclo el�ctrico h�brido", "Dise�o de prototipo", "La propulsi�n h�brida/el�ctrica puede apoyar movilidad accesible.", "Conecta accesibilidad, propulsi�n y dise�o de bajo costo.", "Indicar si hay dise�o, prototipo, prueba o prueba con usuarios."],
  MTC42: ["Mantenimiento de auto-rickshaw", "Estudio de caso", "La capacidad de reparacion afecta el despliegue sostenible.", "Hace visible el mantenimiento c�mo requisito de despliegue.", "Contexto de Kum�si; no es modelo universal de confiabilidad."],
  MTC43: ["Dise�o de bastidor liviano", "Optimizacion estructural", "Los bastidores deben evaluarse con cargas realistas de conduccion.", "Muestra el equilibrio entre reduccion de m�sa y esfuerzo dinamico.", "Confirmar condiciones exactas de manejo y reduccion de peso."],
  MTC44: ["Verificacion de seguridad", "Pruebas de seguridad", "Los triciclos el�ctricos requieren verificacion de seguridad segun contexto.", "Muestra la seguridad c�mo tema t�cnico y regulatorio.", "No convertir un contexto nacional en norma universal."],
  MTC45: ["Dise�o de motor PMBLDC", "Dise�o de motor", "El motor PMBLDC puede adaptarse a requisitos de EV de tres ruedas.", "Reemplaza evidencia amplia de e-bike por fuente especifica.", "Evidencia de conferencia; requiere v�lidacion a nivel veh�culo."],
  MTC46: ["Mototaxis y ley", "An�lisis legal", "La clasificaci�n legal moldea permisos, seguridad y derechos de operaci�n.", "Muestra la movilidad de tres ruedas c�mo asunto regulatorio.", "Evidencia legal especifica de Indonesia."],
  MTC47: ["Mototriciclos y microempresas", "Estudio empirico transporte/negocio", "Los mototriciclos pueden apoyar micro y pequenas empresas en transporte precario.", "Muestra la movilidad c�mo recurso economico y logistico.", "Conservar contexto y condiciones moderadoras."],
  MTC48: ["Dimensionamiento de bater�a y motor", "M�todo procedimental", "Bateria y motor deben dimensionarse desde m�sa, velocidad, aceleracion y uso.", "Traduce el dimensionamiento en flujo de dise�o.", "Acta local verificada; sin DOI o indice externo."],
  MTC49: ["Desempeno real de E2W/E3W", "Estudio de campo", "Vehiculos el�ctricos de dos y tres ruedas deben evaluarse en tr�fico heterogeneo real.", "Aporta evidencia de campo que ancla el mazo m�s alla de prototipos.", "No universalizar el caso de Bengal Occidental sin v�lidacion local."]
};

const labels = {
  en: {
    title: "MTC cards - interactive state-of-the-art review",
    print: "Print / PDF",
    proof: "Evidence", idea: "Finding", use: "For studying",
    question: "Guide question",
    source: "Year", lang: "en",
    metrics: ["Evidence", "Maturity", "Real use", "Human focus"]
  },
  es: {
    title: "Cartas MTC - revisi?n interactiva del estado del arte",
    print: "Imprimir / PDF",
    proof: "Evidencia", idea: "Hallazgo", use: "Para estudiar",
    question: "Pregunta gu?a",
    source: "A?o", lang: "es",
    metrics: ["Evidencia", "Madurez", "Uso real", "Persona"]
  }
};

function parseMarkdownTable(markdown) {
  const escapedPipe = "__MTC_ESCAPED_PIPE__";
  return markdown.split(/\r?\n/)
    .filter((line) => line.startsWith("| MTC"))
    .map((line) => line.replace(/\\\|/g, escapedPipe))
    .map((line) => line.trim().slice(1, -1).split("|").map((cell) => cell.trim().replaceAll(escapedPipe, "|")))
    .map(([id, category, quality, title, evidence, core, contribution, limitation, trace]) => ({
      id, category, quality, title, evidence, core, contribution, limitation, trace,
      visual: `generated_visuals/${id}_visual_final.png`
    }));
}

function htmlEscape(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function texEscape(value) {
  return String(value)
    .replaceAll("\\", "\\textbackslash{}").replaceAll("&", "\\&").replaceAll("%", "\\%")
    .replaceAll("$", "\\$").replaceAll("#", "\\#").replaceAll("_", "\\_")
    .replaceAll("{", "\\{").replaceAll("}", "\\}").replaceAll("~", "\\textasciitilde{}")
    .replaceAll("^", "\\textasciicircum{}");
}

function sourceKeyFromTrace(trace) {
  return String(trace).split("|")[0].trim();
}

function normalizeAuthors(value = "") {
  return String(value).replace(/[{}]/g, "").replace(/\s+and\s+/gi, "; ").replace(/\s+/g, " ").trim();
}

function cleanBibValue(value = "") {
  return String(value).replace(/^\s*[{"]|[}"]\s*$/g, "").replace(/[{}]/g, "").replace(/\s+/g, " ").trim();
}

function parseBibDatabase(text) {
  const entries = new Map();
  const entryRe = /@(\w+)\s*\{\s*([^,]+),([\s\S]*?)\n\}/g;
  let entry;
  while ((entry = entryRe.exec(text))) {
    const [, type, key, body] = entry;
    const fields = {};
    const fieldRe = /([a-zA-Z]+)\s*=\s*(\{(?:[^{}]|\{[^{}]*\})*\}|"[^"]*"|[^,\n]+)\s*,?/g;
    let field;
    while ((field = fieldRe.exec(body))) fields[field[1].toLowerCase()] = cleanBibValue(field[2]);
    entries.set(key.trim(), { key: key.trim(), type, ...fields });
  }
  return entries;
}

function publicationKind(entry, quality, locale) {
  const names = {
    article: locale === "es" ? "Art?culo de revista" : "Journal article",
    inproceedings: locale === "es" ? "Ponencia / congreso" : "Conference paper",
    incollection: locale === "es" ? "Cap?tulo de libro" : "Book chapter",
    book: locale === "es" ? "Libro" : "Book",
    techreport: locale === "es" ? "Informe t?cnico" : "Technical report",
    report: locale === "es" ? "Informe" : "Report",
    mastersthesis: locale === "es" ? "Tesis de maestr?a" : "Master thesis",
    phdthesis: locale === "es" ? "Tesis doctoral" : "PhD thesis"
  };
  const type = names[String(entry?.type ?? "").toLowerCase()] ?? (locale === "es" ? "Documento acad?mico" : "Academic document");
  return type + " ? " + quality;
}

function venueOf(entry) {
  return entry?.journal || entry?.booktitle || entry?.publisher || entry?.institution || entry?.school || "";
}

function doiOf(entry) {
  return entry?.doi ? "https://doi.org/" + entry.doi.replace(/^https?:\/\/doi.org\//i, "") : "";
}

function citationText(entry, fallbackTitle, year) {
  if (!entry) return fallbackTitle + " (" + year + ").";
  const authors = normalizeAuthors(entry.author || entry.editor || "");
  const title = entry.title || fallbackTitle;
  const venue = venueOf(entry);
  const y = entry.year || year;
  const doi = doiOf(entry);
  return (authors ? authors + ". " : "") + "(" + y + "). " + title + "." + (venue ? " " + venue + "." : "") + (doi ? " " + doi : "");
}

function sanitizeSpanish(value) {
  return String(value)
    .replaceAll("???", "")
    .replaceAll("plataforms", "plataformas")
    .replaceAll("plataform?s", "plataformas")
    .replaceAll("pequenas", "peque?as")
    .replaceAll("diseno", "dise?o")
    .replaceAll("Diseo", "Dise?o")
    .replaceAll("elctrico", "el?ctrico")
    .replaceAll("hbrido", "h?brido")
    .replaceAll("validacion", "validaci?n")
    .replaceAll("operacion", "operaci?n")
    .replaceAll("publico", "p?blico")
    .replaceAll("energia", "energ?a")
    .replaceAll("bateria", "bater?a")
    .replaceAll("vehiculo", "veh?culo")
    .replaceAll("vehiculos", "veh?culos")
    .replaceAll("tecnico", "t?cnico")
    .replaceAll("politica", "pol?tica")
    .replaceAll("economia", "econom?a")
    .replaceAll("logistica", "log?stica")
    .replaceAll("Qu hace", "Qu? hace")
    .replaceAll("Qu riesgo", "Qu? riesgo")
    .replaceAll("Qu aporta", "Qu? aporta")
    .replaceAll("Dnde", "D?nde")
    .replaceAll("Qu regla", "Qu? regla")
    .replaceAll("Quin", "Qui?n");
}

function learnerContribution(card, locale) {
  if (locale === "es") return "Permite conectar el hallazgo con " + card.categoryLabel.toLowerCase() + " y comparar la evidencia con otras fuentes del mazo.";
  return "Connects the finding with " + card.categoryLabel.toLowerCase() + " and lets the learner compare this evidence with other sources in the deck.";
}

function yearFromTrace(trace) {
  return trace.match(/\b(19|20)\d{2}\b/)?.[0] ?? "";
}

function displayNumber(id) {
  return `${id.replace("MTC", "")}/49`;
}

function cardStyle(card) {
  return categoryStyle[card.category] ?? { color: "#475569", route: "R1-R6", es: card.category };
}

function studyLens(card, locale) {
  const map = {
    "Accessibility and inclusive mobility": {
      en: ["Who gains mobility, and what design decision makes that possible?", "Other accessibility or user-effort cards."],
      es: ["Qui�n gana movilidad y que decision de dise�o lo hace posible?", "Otras cartas de accesibilidad o esfuerzo del usuario."]
    },
    "Public acceptance and service quality": {
      en: ["What makes adoption or service quality plausible for users?", "Cards about policy, operation or passenger experience."],
      es: ["Qu� hace plausible la aceptaci�n o la calidad del servicio?", "Cartas de pol�tica, operaci�n o experiencia del pasajero."]
    },
    "Structure, ergonomics and safety": {
      en: ["What risk, posture or mechanical behavior is being controlled?", "Cards about stability, comfort, frame or steering."],
      es: ["Qu� riesgo, postura o comportamiento mec�nico se controla?", "Cartas de estabilidad, confort, bastidor o direcci�n."]
    },
    "Propulsi�n, battery and energy management": {
      en: ["What energy decision does this evidence support?", "Cards about battery, motor, solar support or duty cycle."],
      es: ["Qu� decision energetica sostiene esta evidencia?", "Cartas de bater�a, motor, apoyo solar o ciclo de uso."]
    },
    "Logistics, production and applied deployment": {
      en: ["Where would this vehicle or system actually work?", "Cards about field use, maintenance, cargo or operations."],
      es: ["D�nde funcionaria realmente este veh�culo o sistema?", "Cartas de uso en campo, mantenimiento, carga u operaci�n."]
    },
    "Policy, regulation and socioeconomic context": {
      en: ["What context rule, market condition or institution changes the interpretation?", "Cards about adoption, traffic, service or deployment."],
      es: ["Qu� regla, condicion de mercado o institucion cambia la interpretacion?", "Cartas de aceptaci�n, tr�fico, servicio o despliegue."]
    }
  };
  const [question, compare] = (map[card.category] ?? {
    en: ["What does this source add to the state of the art?", "Cards with similar evidence or topic."],
    es: ["Qu� aporta esta fuente al estado del arte?", "Cartas con evidencia o tema similar."]
  })[locale];
  return { question, compare };
}

function studyUse(card, locale) {
  const map = {
    "Accessibility and inclusive mobility": {
      en: "Relate vehicle design with access, effort and independent mobility.",
      es: "Relacionar el dise�o del veh�culo con acceso, esfuerzo y movilidad independiente."
    },
    "Public acceptance and service quality": {
      en: "Connect adoption, service experience and conditions for public use.",
      es: "Conectar adopcion, experiencia de servicio y condiciones de uso publico."
    },
    "Structure, ergonomics and safety": {
      en: "Compare how design choices affect safety, posture, comfort or stability.",
      es: "Comparar c�mo las decisiones de dise�o afectan seguridad, postura, confort o estabilidad."
    },
    "Propulsi�n, battery and energy management": {
      en: "Compare energy, motor, battery or solar decisions in three-wheel vehicles.",
      es: "Comparar decisiones de energ�a, motor, bater�a o apoyo solar en veh�culos de tres ruedas."
    },
    "Logistics, production and applied deployment": {
      en: "Study where the vehicle works, who operates it and what conditions it needs.",
      es: "Estudiar donde funciona el veh�culo, quien lo opera y que condiciones necesita."
    },
    "Policy, regulation and socioeconomic context": {
      en: "Connect technical design with rules, institutions, traffic or local economy.",
      es: "Conectar el dise�o t�cnico con norm�s, instituciones, tr�fico o econom�a local."
    }
  };
  return (map[card.category] ?? {
    en: "Compare one source with the rest of the state of the art.",
    es: "Comparar una fuente con el resto del estado del arte."
  })[locale];
}

function clampScore(value) {
  return Math.max(1, Math.min(5, value));
}

function comparableMetrics(card) {
  const text = `${card.category} ${card.quality} ${card.title} ${card.evidence} ${card.core} ${card.contribution}`.toLowerCase();
  let evidence = 2;
  if (card.quality === "Q1") evidence = 5;
  else if (card.quality === "Q2") evidence = 4;
  else if (["Q3", "Proceedings", "Chapter"].includes(card.quality)) evidence = 3;
  else if (card.quality === "Q4") evidence = 2;
  if (/field|experimental|experiment|test|performance|assessment|emp�rical|case study/.test(text)) evidence += 1;
  if (/review/.test(text)) evidence += 1;

  let maturity = 2;
  if (/design|concept|procedural/.test(text)) maturity = 2;
  if (/simulation|model|analysis|virtual/.test(text)) maturity = 3;
  if (/prototype|fabrication|development|controller/.test(text)) maturity = 4;
  if (/field|operational|maintenance|real-world|case study|performance test|safety testing/.test(text)) maturity = 5;

  let application = 2;
  if (/component|motor|battery|frame|steering|suspensi�n|cooling|brake/.test(text)) application = 3;
  if (/service|cargo|agricultural|industrial|deployment|maintenance|traffic|policy|legal|msme|public utility|last-mile|field/.test(text)) application = 5;
  if (/access|elderly|passenger|comfort|acceptance|service quality|mobility impairment|user/.test(text)) application = Math.max(application, 4);

  let userFocus = 2;
  if (/access|inclusive|elderly|passenger|comfort|acceptance|service quality|mobility|user|public|health|disabled|handicapped/.test(text)) userFocus = 5;
  else if (/safety|ergonomic|ride|traffic|policy|service/.test(text)) userFocus = 4;
  else if (/deployment|logistics|maintenance|msme|cargo/.test(text)) userFocus = 3;

  return [clampScore(evidence), clampScore(maturity), clampScore(application), clampScore(userFocus)];
}

function localizedCard(card, locale, bibliography) {
  const style = cardStyle(card);
  const lens = studyLens(card, locale);
  const useText = studyUse(card, locale);
  const visibleId = displayNumber(card.id);
  const sourceLabel = yearFromTrace(card.trace);
  const sourceKey = sourceKeyFromTrace(card.trace);
  const bib = bibliography.get(sourceKey);
  const common = {
    ...card,
    visibleId,
    sourceKey,
    sourceLabel,
    sourceType: publicationKind(bib, card.quality, locale),
    authors: normalizeAuthors(bib?.author || bib?.editor || ""),
    venue: venueOf(bib),
    doi: doiOf(bib),
    citation: citationText(bib, card.title, sourceLabel),
    studyUse: useText,
    metrics: comparableMetrics(card),
    categoryLabel: locale === "es" ? style.es : card.category,
    ...lens,
    ...style
  };
  if (locale === "es") {
    const [title, evidence, core, contribution, limitation] = esCards[card.id];
    const localized = { ...common, title, evidence, core, contribution, limitation };
    for (const key of ["title", "evidence", "core", "contribution", "limitation", "studyUse", "question", "compare", "categoryLabel"]) {
      localized[key] = sanitizeSpanish(localized[key]);
    }
    return localized;
  }
  return common;
}

function metricsHtml(names, values) {
  return names.map((name, index) => `<div class="metric"><span>${htmlEscape(name)}</span><b>${values[index]}</b></div>`).join("");
}

function metricsTex(names, values) {
  return names.map((name, index) => `${texEscape(name)} ${values[index]}`).join(" \\quad ");
}

function buildHtml(cards, locale) {
  const t = labels[locale];
  const cardsHtml = cards.map((card) => `<article class="mtc-card" data-card="${card.id}" style="--accent:${card.color}">
  <header><span class="id">${htmlEscape(card.visibleId)}</span><span class="year">${htmlEscape(yearFromTrace(card.trace))}</span></header>
  <figure><img src="../generated_visuals/${card.id}_visual_final.png" alt="${htmlEscape(card.title)}"></figure>
  <section class="body">
    <p class="category">${htmlEscape(card.categoryLabel)}</p>
    <h2>${htmlEscape(card.title)}</h2>
    <div class="metrics">${metricsHtml(t.metrics, card.metrics)}</div>
    <dl>
      <dt>${t.question}</dt><dd>${htmlEscape(card.question)}</dd>
      <dt>${t.proof}</dt><dd>${htmlEscape(card.evidence)}</dd>
      <dt>${t.idea}</dt><dd>${htmlEscape(card.core)}</dd>
      <dt>${t.use}</dt><dd>${htmlEscape(card.studyUse)}</dd>
    </dl>
  </section>
  <footer><span>${htmlEscape(t.source)}: ${htmlEscape(card.sourceLabel)}</span></footer>
</article>`).join("\n");

  return `<!doctype html>
<html lang="${t.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${htmlEscape(t.title)}</title>
<style>
:root{font-family:Inter,Arial,sans-serif;color:#172033;background:#f3f4f6}
body{margin:0}.toolbar{position:sticky;top:0;z-index:5;background:#fff;border-bottom:1px solid #d8dee8;padding:12px 18px;display:flex;gap:12px;align-items:center}.toolbar h1{font-size:18px;margin:0;flex:1}.toolbar button{border:0;background:#172033;color:#fff;border-radius:6px;padding:9px 12px;cursor:pointer}
.deck{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:18px;padding:18px}.mtc-card{background:#fff;border:1px solid #d7dde6;border-radius:8px;overflow:hidden;box-shadow:0 10px 24px #0f172a14}
.mtc-card header{height:48px;background:var(--accent);color:#fff;display:flex;justify-content:space-between;align-items:center;padding:0 16px}.id{font-weight:800;font-size:21px}.year{font-weight:700;font-size:14px}
figure{margin:0;background:#e5e7eb}figure img{display:block;width:100%;aspect-ratio:1.35/1;object-fit:cover}.body{padding:14px 16px}.category{margin:0 0 6px;color:var(--accent);font-weight:800;font-size:12px;text-transform:uppercase}.body h2{font-size:20px;line-height:1.08;margin:0 0 10px}
.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:0 0 11px}.metric{border:1px solid #e2e8f0;background:#f8fafc;border-radius:6px;padding:5px 4px;text-align:center}.metric span{display:block;font-size:10px;color:#475569;font-weight:800}.metric b{display:block;font-size:17px;line-height:1;color:var(--accent)}
dl{display:grid;grid-template-columns:92px 1fr;gap:7px 10px;margin:0}dt{font-size:11px;text-transform:uppercase;color:#64748b;font-weight:800}dd{margin:0;font-size:13px;line-height:1.25}footer{border-top:1px solid #e2e8f0;padding:10px 16px;font-size:12px;color:#475569}
@media print{.toolbar{display:none}.deck{grid-template-columns:repeat(2,1fr);gap:8mm;padding:0}.mtc-card{break-inside:avoid;box-shadow:none}}
</style>
</head>
<body><header class="toolbar"><h1>${htmlEscape(t.title)}</h1><button onclick="window.print()">${htmlEscape(t.print)}</button></header><main class="deck">${cardsHtml}</main></body>
</html>`;
}

function buildTex(cards, locale) {
  const t = labels[locale];
  const cardCommands = cards.map((card) => `\\begin{tikzpicture}[x=1mm,y=1mm]
  \\definecolor{Accent}{HTML}{${card.color.replace("#", "")}}
  \\fill[white] (0,0) rectangle (86,120);
  \\draw[Line,line width=.35mm,rounded corners=2mm] (0,0) rectangle (86,120);
  \\fill[Accent,rounded corners=2mm] (0,108) rectangle (86,120);
  \\node[anchor=west,text=white,font=\\bfseries\\fontsize{13}{14}\\selectfont] at (4,114.3) {${texEscape(card.visibleId)}};
  \\node[anchor=east,text=white,font=\\bfseries\\fontsize{7}{8}\\selectfont] at (82,114.3) {${texEscape(yearFromTrace(card.trace))}};
  \\node[anchor=north west,inner sep=0] at (0,108) {\\includegraphics[width=86mm,height=48mm]{../generated_visuals/${card.id}_visual_final.png}};
  \\node[anchor=north west,text=Accent,font=\\bfseries\\fontsize{5.8}{6.5}\\selectfont,text width=78mm] at (4,58) {${texEscape(card.categoryLabel)}};
  \\node[anchor=north west,text=Ink,font=\\bfseries\\fontsize{10.2}{11}\\selectfont,text width=78mm] at (4,53.2) {${texEscape(card.title)}};
  \\node[anchor=north west,text=Accent,font=\\bfseries\\fontsize{5.5}{6.2}\\selectfont,text width=78mm] at (4,44.2) {${metricsTex(t.metrics, card.metrics)}};
  \\node[anchor=north west,text=Accent,font=\\bfseries\\fontsize{5.5}{6.2}\\selectfont,text width=22mm] at (4,39.8) {${texEscape(t.question)}};
  \\node[anchor=north west,text=Ink,font=\\fontsize{5.2}{5.8}\\selectfont,text width=52mm] at (28,39.8) {${texEscape(card.question)}};
  \\draw[Line] (4,38.8) -- (82,38.8);
  \\node[anchor=north west,text=Accent,font=\\bfseries\\fontsize{5.4}{6.0}\\selectfont,text width=22mm] at (4,34.5) {${texEscape(t.proof)}};
  \\node[anchor=north west,text=Ink,font=\\fontsize{5.5}{6.1}\\selectfont,text width=52mm] at (28,34.5) {${texEscape(card.evidence)}};
  \\node[anchor=north west,text=Accent,font=\\bfseries\\fontsize{5.4}{6.0}\\selectfont,text width=22mm] at (4,27.5) {${texEscape(t.idea)}};
  \\node[anchor=north west,text=Ink,font=\\fontsize{5.3}{5.9}\\selectfont,text width=52mm] at (28,27.5) {${texEscape(card.core)}};
  \\node[anchor=north west,text=Accent,font=\\bfseries\\fontsize{5.4}{6.0}\\selectfont,text width=22mm] at (4,15.5) {${texEscape(t.use)}};
  \\node[anchor=north west,text=Ink,font=\\fontsize{5.1}{5.7}\\selectfont,text width=52mm] at (28,15.5) {${texEscape(card.studyUse)}};
  \\fill[black!3] (0,0) rectangle (86,4.8);
  \\node[anchor=west,text=Muted,font=\\fontsize{4.7}{5.2}\\selectfont] at (4,2.4) {${texEscape(t.source)}: ${texEscape(card.sourceLabel)}};
\\end{tikzpicture}`);

  const pages = [];
  for (let i = 0; i < cardCommands.length; i += 9) {
    const rows = [];
    for (let r = i; r < Math.min(i + 9, cardCommands.length); r += 3) {
      const row = cardCommands.slice(r, Math.min(r + 3, cardCommands.length));
      while (row.length < 3) row.push("");
      rows.push(`${row.join(" & ")} \\\\[4mm]`);
    }
    pages.push(`\\begin{tabular}{ccc}\n${rows.join("\n")}\n\\end{tabular}`);
  }

  return `\\documentclass[10pt]{article}
\\usepackage[paperwidth=297mm,paperheight=420mm,margin=8mm]{geometry}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{graphicx}
\\usepackage{xcolor}
\\usepackage{tikz}
\\usepackage{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\definecolor{Ink}{HTML}{172033}
\\definecolor{Muted}{HTML}{475569}
\\definecolor{Line}{HTML}{D7DDE6}
\\begin{document}
\\noindent
${pages.join("\n\\newpage\n\\noindent\n")}
\\end{document}`;
}

fs.mkdirSync(outDir, { recursive: true });
const bibliography = parseBibDatabase(fs.readFileSync(bibFile, "utf8"));
const baseCards = parseMarkdownTable(fs.readFileSync(sourceMd, "utf8"));
if (baseCards.length !== 49) throw new Error(`Expected 49 cards, found ${baseCards.length}`);
for (const card of baseCards) {
  const visual = path.join(visualDir, `${card.id}_visual_final.png`);
  if (!fs.existsSync(visual)) throw new Error(`Missing final visual: ${visual}`);
}

for (const locale of ["en", "es"]) {
  const cards = baseCards.map((card) => localizedCard(card, locale, bibliography));
  const suffix = locale === "en" ? "en" : "es";
  fs.writeFileSync(path.join(outDir, `mtc_cards_new_proposal_${suffix}.html`), buildHtml(cards, locale), "utf8");
  fs.writeFileSync(path.join(outDir, `mtc_cards_new_proposal_${suffix}.tex`), buildTex(cards, locale), "utf8");
  fs.writeFileSync(path.join(outDir, `mtc_cards_new_proposal_${suffix}.json`), JSON.stringify(cards, null, 2), "utf8");
}
console.log(`Built ${baseCards.length} bilingual cards in ${outDir}`);
