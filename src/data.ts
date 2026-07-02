/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EdlComponent, RoadmapModule, SpaceNode, DependencyInjectNode } from './types';

export const EDL_COMPONENTS_POOL: EdlComponent[] = [
  // Data Components
  { id: 'TransformData', name: 'TransformData', type: 'data', description: 'Позиция, поворот и масштаб в плоском дереве (2D/3D).' },
  { id: 'PhysicsData', name: 'PhysicsData', type: 'data', description: 'Масса, трение, скорость, тип тела и упругость.' },
  { id: 'HealthData', name: 'HealthData', type: 'data', description: 'Реактивное здоровье, регенерация и события смерти.' },
  { id: 'TextData', name: 'TextData', type: 'data', description: 'Реактивное строковое поле и его модификаторы выпрямления.' },
  { id: 'WeaponSettings', name: 'WeaponSettings', type: 'data', description: 'Урон, дальность, тип патронов и частота выстрелов.' },
  { id: 'AiAgentData', name: 'AiAgentData', type: 'data', description: 'Цели ИИ, скорость поиска путей и дистанция зрения.' },

  // Logic Components
  { id: 'TransformLogic', name: 'TransformLogic', type: 'logic', description: 'Рассчитывает абсолютные матрицы трансформации.' },
  { id: 'MovementSystem', name: 'MovementSystem', type: 'logic', description: 'Считывает инпут и прикладывает физические силы.' },
  { id: 'CombatLogic', name: 'CombatLogic', type: 'logic', description: 'Просчитывает коллизии снарядов и отнимает Health.' },
  { id: 'DialogLogic', name: 'DialogLogic', type: 'logic', description: 'Запускает реактивный граф диалогов при контакте.' },
  { id: 'AStarPathfinder', name: 'AStarPathfinder', type: 'logic', description: 'Потокобезопасный поиск кратчайшего пути.' },
  { id: 'RenderSystem', name: 'RenderSystem', type: 'logic', description: 'Передает геометрию на экран при тике LateUpdate.' }
];

export const ROADMAP_MODULES: RoadmapModule[] = [
  {
    id: 'core',
    title: 'Core',
    status: 'completed',
    description: 'Инжектирование [Inject/AutoInject], сериализация данных, update loop.',
    tags: ['.NET 10', 'EDL', 'DI']
  },
  {
    id: 'source_gen',
    title: 'Source Generators',
    status: 'completed',
    description: 'Генерация сериализации, файлов настроек движка, высоко производительных update runners',
    tags: ['.NET 10','Source Generators']
  },  
  {
    id: 'build',
    title: 'Build',
    status: 'completed',
    description: 'Лёгкие билды под все ведущие платформы: Windows, Linux, macOs, Android, iOS.',
    tags: ['Assets Compression', 'Cross-platform']
  },
  {
    id: 'transform',
    title: 'Transform',
    status: 'in-progress',
    description: 'Пространства GUID-папок, вычисление иерархий без тяжелой связи в ОЗУ, 3D трансформации.',
    tags: ['GUID Hierarchy', 'SIMD', '3D Math']
  },
  {
    id: 'render',
    title: 'Render',
    status: 'in-progress',
    description: 'Оптимизированный рендеринг батчей, pixel-perfect, RT, кроссплатформенный шейдеринг Vulkan/DX12.',
    tags: ['Vulkan', 'DirectX 12', 'Batching']
  },
  {
    id: 'editor',
    title: 'Editor',
    status: 'in-progress',
    description: 'Красивый, современный, а главное удобный редактор в MD3E стиле.',
    tags: ['Editor', 'Material Design']
  },
  {
    id: 'physics',
    title: 'Physics',
    status: 'planned',
    description: 'Гравитация, стабильный FixedUpdate цикл, коллайдеры, твёрдые и жидкие тела.',
    tags: ['FixedUpdate', 'Colliders']
  },
  {
    id: 'input',
    title: 'Input',
    status: 'planned',
    description: 'Удобная и гибкая система для считывания ввода пользователя с разных девайсов.',
    tags: ['Input system', 'Cross-platform']
  },
  {
    id: 'audio',
    title: 'Audio',
    status: 'planned',
    description: 'Поддержка разных современных форматов и пространственного звучания.',
    tags: ['Audio streaming', 'Spatial audio']
  }
];

export const SPACE_NODES: SpaceNode[] = [
  {
    id: 'global-space',
    name: 'Global Space (Глобальный)',
    type: 'global',
    entities: ['SoundService', 'SaveManager', 'GlobalSettings']
  },
  {
    id: 'root-town',
    name: 'Town (Root Local Space)',
    type: 'local',
    entities: ['TownBackground', 'TownNPC_Spawner']
  },
  {
    id: 'child-tavern',
    name: 'Tavern (Child of Town)',
    type: 'local',
    parentId: 'root-town',
    entities: ['TavernKeeperNPC', 'InnDoorTrigger', 'AmbientMusic']
  },
  {
    id: 'subchild-cellar',
    name: 'Cellar (Child of Tavern)',
    type: 'local',
    parentId: 'child-tavern',
    entities: ['ChestEntity', 'RatMob_1', 'RatMob_2']
  },
  {
    id: 'root-dungeon',
    name: 'Dungeon (Root Local Space)',
    type: 'local',
    entities: ['DungeonEntrance', 'Torch_Generator']
  },
  {
    id: 'child-boss',
    name: 'Boss Arena (Child of Dungeon)',
    type: 'local',
    parentId: 'root-dungeon',
    entities: ['BossEntity', 'LavaFloorTrigger', 'CameraShakeControl']
  }
];

export const DEPENDENCY_NODES: DependencyInjectNode[] = [
  { id: 'player-entity', name: 'Player Entity', category: 'Data', injectType: 'Inject', status: 'valid' },
  { id: 'input-service', name: 'InputService', category: 'Logic', injectType: 'AutoInject', status: 'valid' },
  { id: 'calc-matrix', name: 'TransformSystem', category: 'Logic', injectType: 'AutoInject', status: 'valid' },
  { id: 'movement-logic', name: 'MovementLogic', category: 'Logic', injectType: 'AutoInject', status: 'valid', injectedFrom: 'input-service' },
  { id: 'player-health', name: 'HealthData', category: 'Data', injectType: 'Inject', status: 'valid' },
  { id: 'combat-logic', name: 'CombatLogic', category: 'Logic', injectType: 'AutoInject', status: 'valid', injectedFrom: 'player-health' },
  { id: 'inventory-data', name: 'InventoryData', category: 'Data', injectType: 'Inject', status: 'valid' },
  { id: 'missing-ui-system', name: 'FeedbackUiSystem', category: 'Logic', injectType: 'AutoInject', status: 'missing' }
];

