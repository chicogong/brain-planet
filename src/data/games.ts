export const games = [
  {
    id: 'color-match',
    name: '色彩找不同',
    category: '3-6岁',
    tags: ['视觉敏锐', '专注力'],
    path: '/games/color-match',
    difficulty: '简单',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    icon: '🎨',
    isNew: true
  },
  {
    id: "schulte",
    name: "舒尔特方格",
    category: "4-12岁",
    tags: ["专注力", "视觉追踪"],
    path: "/games/schulte",
    difficulty: "自适应",
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-600",
    icon: "👁️",
    isNew: false
  },
  {
    id: "memory",
    name: "记忆翻牌",
    category: "3-8岁",
    tags: ["短时记忆", "图像识别"],
    path: "/games/memory",
    difficulty: "自适应",
    bgColor: "bg-orange-100",
    textColor: "text-orange-600",
    icon: "🦊",
    isNew: true
  },
  {
    id: 'sudoku',
    name: '星球数独',
    category: '6-9岁',
    tags: ['逻辑推理', '规则理解'],
    path: '/games/sudoku',
    difficulty: '中等',
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
    icon: '🧩',
    locked: false
  },
  {
    id: 'math-24',
    name: '极限24点',
    category: '8-12岁',
    tags: ['数学思维', '运算能力'],
    path: '/games/math-24',
    difficulty: '困难',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    icon: '🔢',
    locked: false,
    isNew: true
  }
];
