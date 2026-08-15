import { CODE_MODERN_COURSES, CODE_HOUR_OF_CODE, CODE_HOUR_OF_AI } from './code';
import { HTML_CODE_ORG, JS_LEARN_COURSE, FCC_HTML_COURSE, FCC_JS_COURSE, RASPBERRY_WEB_LEVEL_1, RASPBERRY_WEB_LEVEL_2, RASPBERRY_WEB_LEVEL_3 } from './html';
import { ARDUINO_CHALLENGES } from './arduino';
import { TINKERCAD_3D_ACADEMY, TINKERCAD_3D_CHALLENGES, TINKERCAD_CODEBLOCKS_CHALLENGES, BLOCKSCAD_CHALLENGES } from './tinkercad';
import { ML_LEARNINGML, ML_FOR_KIDS } from './machinelearning';
import { PYTHON_ACADEMIA, PYTHON_RASPBERRY_INTRO, PYTHON_RASPBERRY_MORE, PYTHON_CODING_KIDS, PYTHON_CODEDEX_BEGINNER, PYTHON_CODEDEX_INTERMEDIATE, PYTHON_FREECODECAMP, PYTHON_PICUINO } from './python';
import { RASPBERRY_SCRATCH_L1, RASPBERRY_SCRATCH_L2, RASPBERRY_SCRATCH_CHALLENGES } from './raspberry';
import { ROBOTIX_CHALLENGES } from './robotix';
import { MICROBIT_CHALLENGES } from './microbit';
import { ARCADE_CHALLENGES } from './arcade';
import { APP_INVENTOR_ACADEMIA, APP_INVENTOR_SOCIAL } from './appinventor';

export const ACTIVITY_REGISTRY = {
  'code': [
    { title: 'Cursos Modernos', items: CODE_MODERN_COURSES || [] },
    { title: 'Hora del Código', items: CODE_HOUR_OF_CODE || [] },
    { title: 'IA', items: CODE_HOUR_OF_AI || [] }
  ],
  'html': [
    { title: 'Code.org', items: HTML_CODE_ORG || [] },
    { title: 'Learn JS', items: JS_LEARN_COURSE || [] },
    { title: 'FCC HTML', items: FCC_HTML_COURSE || [] },
    { title: 'FCC JS', items: FCC_JS_COURSE || [] },
    { title: 'Raspberry L1', items: RASPBERRY_WEB_LEVEL_1 || [] },
    { title: 'Raspberry L2', items: RASPBERRY_WEB_LEVEL_2 || [] },
    { title: 'Raspberry L3', items: RASPBERRY_WEB_LEVEL_3 || [] }
  ],
  'arduino': [
    { title: 'Retos', items: Object.values(ARDUINO_CHALLENGES || {}).flat() }
  ],
  'tinkercad': [
    { title: '3D Academy', items: TINKERCAD_3D_ACADEMY || [] },
    { title: '3D Retos', items: TINKERCAD_3D_CHALLENGES || [] },
    { title: 'Codeblocks', items: Object.values(TINKERCAD_CODEBLOCKS_CHALLENGES || {}).flat() },
    { title: 'BlocksCAD', items: BLOCKSCAD_CHALLENGES || [] }
  ],
  'ia': [
    { title: 'LearningML', items: ML_LEARNINGML || [] },
    { title: 'Machine Learning for Kids', items: ML_FOR_KIDS || [] }
  ],
  'python': [
    { title: 'Academia', items: PYTHON_ACADEMIA || [] },
    { title: 'Raspberry Intro', items: PYTHON_RASPBERRY_INTRO || [] },
    { title: 'Raspberry Plus', items: PYTHON_RASPBERRY_MORE || [] },
    { title: 'Coding Kids', items: PYTHON_CODING_KIDS || [] },
    { title: 'Codédex Principiante', items: PYTHON_CODEDEX_BEGINNER || [] },
    { title: 'Codédex Intermedio', items: PYTHON_CODEDEX_INTERMEDIATE || [] },
    { title: 'FreeCodeCamp', items: PYTHON_FREECODECAMP || [] },
    { title: 'Picuino', items: PYTHON_PICUINO || [] }
  ],
  'scratch': [
    { title: 'Robotix', items: ROBOTIX_CHALLENGES || [] },
    { title: 'Raspberry L1', items: RASPBERRY_SCRATCH_L1 || [] },
    { title: 'Raspberry L2', items: RASPBERRY_SCRATCH_L2 || [] },
    { title: 'Raspberry Retos', items: RASPBERRY_SCRATCH_CHALLENGES || [] }
  ],
  'makecode-microbit': [
    { title: 'Retos', items: Object.values(MICROBIT_CHALLENGES || {}).flat() }
  ],
  'makecode-arcade': [
    { title: 'Retos', items: Object.values(ARCADE_CHALLENGES || {}).flat() }
  ],
  'appinventor': [
    { title: 'Academia', items: APP_INVENTOR_ACADEMIA || [] },
    { title: 'Social', items: APP_INVENTOR_SOCIAL || [] }
  ]
};
