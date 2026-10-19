import React from 'react';
import { GameKey, GameTutorialConfig } from '../../types/tutorial';
import {
  TimelineStep1Diagram,
  TimelineStep2Diagram,
  TimelineStep3Diagram,
  TimelineStep4Diagram,
  TimelineStep5Diagram,
  MatrixStep1Diagram,
  MatrixStep2Diagram,
  MatrixStep3Diagram,
  MatrixStep4Diagram,
  MatrixStep5Diagram,
  GapHunterStep1Diagram,
  GapHunterStep2Diagram,
  GapHunterStep3Diagram,
  GapHunterStep4Diagram,
  GapHunterStep5Diagram,
  CombatStep1Diagram,
  CombatStep2Diagram,
  CombatStep3Diagram,
  CombatStep4Diagram,
  CombatStep5Diagram
} from './tutorialDiagrams';

export const TUTORIAL_CONFIGS: Record<GameKey, GameTutorialConfig> = {
  timeline: {
    gameKey: 'timeline',
    gameTitle: 'El Puente de Cronología',
    badgeTag: 'DINÁMICA 1 · GUÍA INTERACTIVA',
    startBtnLabel: 'Comenzar cronología',
    steps: [
      {
        stepNumber: 1,
        title: '¿Cuál es el objetivo?',
        explanation:
          'En el Puente de Cronología debes organizar publicaciones científicas de acuerdo con su año de publicación para comprender y reconstruir la evolución tecnológica e histórica de tu tema de investigación.',
        visualAlt: 'Línea temporal con tarjetas ubicadas en diferentes años (2012 a 2025)',
        visualComponent: <TimelineStep1Diagram />
      },
      {
        stepNumber: 2,
        title: 'Conoce las tarjetas académicas',
        explanation:
          'Cada tarjeta presenta el identificador del artículo (ej. MTC09), el primer autor, el año de publicación en una insignia destacada, el título del estudio y su metodología. Puedes voltear la tarjeta con el botón circular para consultar la cita BibTeX y el DOI.',
        visualAlt: 'Tarjeta académica con el año de publicación e indicadores bibliográficos destacados',
        visualComponent: <TimelineStep2Diagram />
      },
      {
        stepNumber: 3,
        title: 'Organiza las investigaciones',
        explanation:
          'Arrastra cada tarjeta desde la bandeja inferior hacia los hitos temporales del puente. También puedes hacer clic directo sobre cualquier tarjeta disponible para ubicarla automáticamente en el primer hito libre.',
        visualAlt: 'Tarjeta que se desplaza hacia un espacio vacío de la línea temporal',
        visualComponent: <TimelineStep3Diagram />
      },
      {
        stepNumber: 4,
        title: 'Valida el orden y detecta anacronismos',
        explanation:
          'Pulsa el botón "Validar Puente ⚡". El sistema comprobará si las fechas guardan estricto orden cronológico ascendente. Si un artículo posterior precede a uno anterior, se alertará de un anacronismo para que puedas corregir la secuencia.',
        visualAlt: 'Comparación visual entre una secuencia con anacronismo y una secuencia cronológica coherente',
        visualComponent: <TimelineStep4Diagram />
      },
      {
        stepNumber: 5,
        title: 'Usa la ayuda y consulta los resultados',
        explanation:
          'Si necesitas apoyo, pulsa "Ayuda Pedagógica (Auto-ordenar)" para visualizar la secuencia cronológica óptima. Los hitos ordenados alimentan en tiempo real la sección de Evolución Histórica de tu Estado del Arte Vivo en la pestaña de Síntesis.',
        visualAlt: 'Cronología ordenada conectada con el borrador de síntesis académica con citas',
        visualComponent: <TimelineStep5Diagram />
      }
    ]
  },

  matrix: {
    gameKey: 'matrix',
    gameTitle: 'La Matriz de Enfoques',
    badgeTag: 'DINÁMICA 2 · GUÍA INTERACTIVA',
    startBtnLabel: 'Comenzar clasificación',
    steps: [
      {
        stepNumber: 1,
        title: '¿Qué es la matriz?',
        explanation:
          'La Matriz de Enfoques te permite clasificar, contrastar y organizar investigaciones del corpus según criterios epistemológicos y metodológicos, identificando la distribución y el balance de tu estado del arte.',
        visualAlt: 'Cuadrícula de cuadrantes para clasificación multidimensional de investigaciones',
        visualComponent: <MatrixStep1Diagram />
      },
      {
        stepNumber: 2,
        title: 'Identifica los criterios de análisis',
        explanation:
          'En la barra superior puedes alternar entre tres criterios de clasificación: Categorías Temáticas (chasis, batería, logística, etc.), Enfoques Metodológicos (simulación, prototipo, pruebas, empírico) o Cuartiles Bibliométricos (Q1-Q2, Q3-Q4, NQ). Solo un criterio puede estar activo a la vez.',
        visualAlt: 'Selector de criterios de análisis con opciones temáticas, metodológicas y bibliométricas',
        visualComponent: <MatrixStep2Diagram />
      },
      {
        stepNumber: 3,
        title: 'Clasifica una tarjeta',
        explanation:
          'Arrastra cada tarjeta desde la bandeja inferior hacia el cuadrante que le corresponda según el criterio activo. Al soltarla dentro de la zona receptora, el sistema evaluará si la asignación es epistemológicamente coherente.',
        visualAlt: 'Arrastre de una tarjeta hacia el cuadrante correspondiente',
        visualComponent: <MatrixStep3Diagram />
      },
      {
        stepNumber: 4,
        title: 'Interpreta el resultado y feedback',
        explanation:
          'Cada clasificación acertada otorga +100 puntos y activa un destello verde. Si clasificas una tarjeta en un cuadrante erróneo, el sistema muestra una ventana explicativa detallando a qué categoría pertenece realmente y su justificación conceptual.',
        visualAlt: 'Feedback de acierto con puntuación y retroalimentación explicativa ante error',
        visualComponent: <MatrixStep4Diagram />
      },
      {
        stepNumber: 5,
        title: 'Explora los resultados y la tabla comparativa',
        explanation:
          'El botón "Clasificar Todo" permite autocompletar la matriz con fines demostrativos o de exploración rápida, sin sustituir tu análisis crítico como investigador. Las tarjetas clasificadas estructuran la Matriz Comparativa y tabla académica en la Síntesis.',
        visualAlt: 'Matriz completada conectada con la tabla comparativa de síntesis académica',
        visualComponent: <MatrixStep5Diagram />
      }
    ]
  },

  gapHunter: {
    gameKey: 'gapHunter',
    gameTitle: 'Cazadores de Vacíos',
    badgeTag: 'DINÁMICA 3 · GUÍA INTERACTIVA',
    startBtnLabel: 'Comenzar exploración',
    steps: [
      {
        stepNumber: 1,
        title: '¿Qué es una brecha de investigación?',
        explanation:
          'Una brecha (gap) es una cuestión, limitación no resuelta o contradicción metodológica detectada al cruzar antecedentes. La brecha sugerida por el sistema es una hipótesis relacional de partida que requiere tu valoración académica.',
        visualAlt: 'Dos investigaciones con limitaciones cruzadas convergiendo en un vacío central',
        visualComponent: <GapHunterStep1Diagram />
      },
      {
        stepNumber: 2,
        title: 'Explora las investigaciones de la constelación',
        explanation:
          'La constelación espacial contiene nodos orbitales que representan investigaciones clave. Al pasar el cursor o hacer clic sobre un nodo, puedes examinar el primer autor, año, aportes centrales y limitaciones metodológicas declaradas.',
        visualAlt: 'Constelación espacial orbital con nodos de artículos científicos',
        visualComponent: <GapHunterStep2Diagram />
      },
      {
        stepNumber: 3,
        title: 'Conecta 2 o 3 investigaciones',
        explanation:
          'Haz clic sobre 2 o 3 nodos para seleccionarlos y vincular sus aportes y limitaciones. Si seleccionas más de tres, el sistema desmarcará automáticamente el nodo más antiguo para mantener una relación nítida.',
        visualAlt: 'Selección de 2 a 3 nodos con anillos activos en la constelación',
        visualComponent: <GapHunterStep3Diagram />
      },
      {
        stepNumber: 4,
        title: 'Traza el haz digital y revela el vacío',
        explanation:
          'Pulsa el botón "Trazar Haz Digital y Revelar Vacío ⚡". Se proyectará un haz de luz láser interactivo entre los nodos seleccionados, activando el motor relacional que sintetiza la limitación cruzada detectada.',
        visualAlt: 'Haces luminosos de color conectando los nodos con efecto láser en el lienzo',
        visualComponent: <GapHunterStep4Diagram />
      },
      {
        stepNumber: 5,
        title: 'Interpreta y transfiere la brecha a tu tesis',
        explanation:
          'Revisa el título de la brecha, su formulación y el impacto en tu pregunta de investigación. Cada vacío descubierto se transfiere automáticamente a la sección de Justificación y Brechas de tu borrador académico.',
        visualAlt: 'Brecha de investigación descubierta consolidada en la síntesis académica',
        visualComponent: <GapHunterStep5Diagram />
      }
    ]
  },

  combat: {
    gameKey: 'combat',
    gameTitle: 'Combates de Validación',
    badgeTag: 'DINÁMICA 4 · GUÍA INTERACTIVA',
    startBtnLabel: 'Comenzar combate',
    steps: [
      {
        stepNumber: 1,
        title: '¿Para qué sirve un combate de validación?',
        explanation:
          'En los Combates de Validación enfrentas dos investigaciones cara a cara para evaluar críticamente su relación conceptual, discernir aportes novedosos de evidencias redundantes y fortalecer el marco teórico de tu tesis.',
        visualAlt: 'Dos esquinas de combate académico enfrentadas con el distintivo VS central',
        visualComponent: <CombatStep1Diagram />
      },
      {
        stepNumber: 2,
        title: 'Selecciona las investigaciones a contrastar',
        explanation:
          'En la esquina izquierda (azul) selecciona el Antecedente Referencial o Hito Base. En la esquina derecha (roja) escoge el Antecedente Retador que deseas someter a contraste mediante los selectores desplegables.',
        visualAlt: 'Selectores de antecedentes para la esquina base y la esquina retadora',
        visualComponent: <CombatStep2Diagram />
      },
      {
        stepNumber: 3,
        title: 'Comprende el índice de solapamiento',
        explanation:
          'La barra central muestra el porcentaje de solapamiento conceptual calculado por el sistema a partir de coincidencias en categoría y metodología (30% a 95%). Es una heurística orientativa para dimensionar similitud preliminar antes de tu juicio crítico.',
        visualAlt: 'Medidor de solapamiento conceptual orientativo con barra de porcentaje',
        visualComponent: <CombatStep3Diagram />
      },
      {
        stepNumber: 4,
        title: 'Emite un veredicto crítico',
        explanation:
          'Evalúa el combate y emite uno de tres veredictos: 🏆 Hito Novedoso (avance cualitativo decisivo), 🔗 Extensión Complementaria (mitiga limitaciones del antecedente base) o ⚠️ Evidencia Redundante (metodologías análogas sin valor añadido).',
        visualAlt: 'Los tres botones de veredicto: Hito Novedoso, Extensión Complementaria y Evidencia Redundante',
        visualComponent: <CombatStep4Diagram />
      },
      {
        stepNumber: 5,
        title: 'Historial y duelos aleatorios',
        explanation:
          'Cada veredicto emitido se registra con análisis crítico y hora en el panel inferior, enriqueciendo tu Estado del Arte Vivo. Puedes utilizar el botón "Duelo Aleatorio 🎲" para descubrir y analizar combinaciones inesperadas.',
        visualAlt: 'Historial de veredictos registrados y botón de duelo aleatorio',
        visualComponent: <CombatStep5Diagram />
      }
    ]
  }
};
