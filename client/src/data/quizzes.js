export const quizCategories = [
  {
    slug: 'ecossistemas',
    title: 'Ecossistemas',
    description: 'Perguntas sobre interações ecológicas, energia, matéria e equilíbrio ambiental.',
    color: 'emerald',
  },
  {
    slug: 'reino-animal',
    title: 'Reino Animal',
    description: 'Classificação, adaptação, evolução e importância ecológica dos animais.',
    color: 'sky',
  },
  {
    slug: 'problemas-ambientais',
    title: 'Problemas Ambientais',
    description: 'Poluição, desmatamento, aquecimento global e soluções sustentáveis.',
    color: 'amber',
  },
  {
    slug: 'tecnologia-sustentavel',
    title: 'Tecnologia Sustentável',
    description: 'Energia limpa, eficiência, inovação e impacto ambiental.',
    color: 'violet',
  },
];

export const quizzes = {
  ecossistemas: [
    {
      question: 'O que melhor define um ecossistema?',
      options: [
        'Apenas o conjunto de animais de uma região',
        'A interação entre seres vivos e fatores físicos do ambiente',
        'Somente o clima de um lugar',
        'Qualquer área com vegetação'
      ],
      answer: 1,
      explanation:
        'Um ecossistema reúne fatores bióticos e abióticos interagindo continuamente.',
    },
    {
      question: 'Qual alternativa representa um fator abiótico?',
      options: ['Fungos', 'Bactérias', 'Luz solar', 'Plantas'],
      answer: 2,
      explanation:
        'Luz solar não é ser vivo, portanto é um fator abiótico.',
    },
    {
      question: 'Qual é o papel dos produtores em um ecossistema?',
      options: [
        'Decompor matéria orgânica morta',
        'Produzir seu próprio alimento e iniciar o fluxo de energia',
        'Consumir apenas herbívoros',
        'Eliminar o excesso de oxigênio'
      ],
      answer: 1,
      explanation:
        'Produtores, como plantas e algas, captam energia e formam a base das cadeias alimentares.',
    },
    {
      question: 'Por que a energia diminui a cada nível trófico?',
      options: [
        'Porque a energia é reciclada totalmente',
        'Porque parte dela é dissipada como calor em processos metabólicos',
        'Porque os decompositores a roubam',
        'Porque só os herbívoros usam energia'
      ],
      answer: 1,
      explanation:
        'A cada transferência, parte da energia se perde como calor, por isso o fluxo é unidirecional.',
    },
    {
      question: 'Qual opção descreve melhor uma teia alimentar?',
      options: [
        'Uma sequência linear de alimentação',
        'Uma rede de relações alimentares interligadas',
        'O ciclo da água no ambiente',
        'A relação entre duas espécies isoladas'
      ],
      answer: 1,
      explanation:
        'A teia alimentar reúne várias cadeias alimentares conectadas.',
    },
    {
      question: 'Qual processo devolve nutrientes ao ambiente?',
      options: ['Fotossíntese', 'Respiração', 'Decomposição', 'Evaporação'],
      answer: 2,
      explanation:
        'Fungos e bactérias decompõem matéria orgânica e reciclam nutrientes.',
    },
    {
      question: 'Qual alternativa representa um ciclo biogeoquímico?',
      options: ['Ciclo da água', 'Ciclo da moda', 'Ciclo do consumo', 'Ciclo da digestão'],
      answer: 0,
      explanation:
        'A água circula entre atmosfera, solo, seres vivos e corpos d’água.',
    },
    {
      question: 'Uma consequência comum do desequilíbrio ecológico é:',
      options: [
        'Aumento automático da biodiversidade',
        'Estabilidade perfeita do ambiente',
        'Perda de espécies e alteração das relações entre os seres vivos',
        'Fim do fluxo de energia'
      ],
      answer: 2,
      explanation:
        'Quando o ecossistema sofre impactos, várias relações ecológicas podem ser afetadas.',
    },
  ],

  'reino-animal': [
    {
      question: 'Qual característica está presente em todos os animais?',
      options: [
        'Serem autotróficos',
        'Serem multicelulares e heterotróficos',
        'Terem coluna vertebral',
        'Produzirem seu próprio alimento'
      ],
      answer: 1,
      explanation:
        'Os animais são multicelulares e heterotróficos.',
    },
    {
      question: 'Qual grupo possui coluna vertebral?',
      options: ['Invertebrados', 'Vertebrados', 'Moluscos', 'Artrópodes'],
      answer: 1,
      explanation:
        'Vertebrados possuem coluna vertebral e endoesqueleto.',
    },
    {
      question: 'Qual animal é um mamífero?',
      options: ['Sapo', 'Golfinho', 'Tubarão', 'Cobra'],
      answer: 1,
      explanation:
        'Golfinhos são mamíferos aquáticos.',
    },
    {
      question: 'Qual alternativa é um exemplo de adaptação evolutiva?',
      options: [
        'Mimetismo',
        'Falta de alimentação',
        'Ausência total de células',
        'Aumento da temperatura do ambiente'
      ],
      answer: 0,
      explanation:
        'Mimetismo é uma adaptação que favorece a sobrevivência.',
    },
    {
      question: 'Por que os anfíbios dependem de ambientes úmidos?',
      options: [
        'Porque não respiram',
        'Porque a pele participa das trocas gasosas e perde água com facilidade',
        'Porque vivem apenas na água salgada',
        'Porque têm escamas impermeáveis'
      ],
      answer: 1,
      explanation:
        'A pele dos anfíbios é fina e sensível à desidratação.',
    },
    {
      question: 'Qual é um papel ecológico importante dos animais?',
      options: [
        'Produzir luz solar',
        'Controlar cadeias alimentares e polinizar plantas',
        'Eliminar a biodiversidade',
        'Impedir totalmente a decomposição'
      ],
      answer: 1,
      explanation:
        'Animais atuam em polinização, dispersão de sementes e equilíbrio ecológico.',
    },
    {
      question: 'A divisão entre vertebrados e invertebrados considera principalmente:',
      options: [
        'A cor da pele',
        'A presença de coluna vertebral',
        'O tamanho do corpo',
        'A quantidade de água no ambiente'
      ],
      answer: 1,
      explanation:
        'A presença ou ausência de coluna vertebral é a base dessa divisão.',
    },
    {
      question: 'Por que a biodiversidade animal é importante?',
      options: [
        'Porque deixa os ecossistemas mais frágeis',
        'Porque reduz a estabilidade ambiental',
        'Porque sustenta funções ecológicas e aumenta a resiliência dos ecossistemas',
        'Porque elimina a necessidade de conservação'
      ],
      answer: 2,
      explanation:
        'Maior biodiversidade tende a aumentar estabilidade e capacidade de resposta do ambiente.',
    },
  ],

  'problemas-ambientais': [
    {
      question: 'Qual alternativa representa uma forma de poluição do ar?',
      options: [
        'Uso de energia solar',
        'Queima de combustíveis fósseis em veículos e indústrias',
        'Plantio de árvores',
        'Reciclagem de vidro'
      ],
      answer: 1,
      explanation:
        'A queima de combustíveis fósseis libera poluentes atmosféricos.',
    },
    {
      question: 'O desmatamento pode causar:',
      options: [
        'Aumento da estabilidade do solo',
        'Perda de habitat, erosão e alteração do regime de chuvas',
        'Fim da necessidade de água',
        'Aumento automático da biodiversidade'
      ],
      answer: 1,
      explanation:
        'A retirada da vegetação afeta solo, fauna, clima e biodiversidade.',
    },
    {
      question: 'O efeito estufa é:',
      options: [
        'Sempre algo ruim e totalmente artificial',
        'Um fenômeno natural necessário, que pode ser intensificado pela ação humana',
        'Um processo exclusivo dos oceanos',
        'Algo que não interfere na temperatura da Terra'
      ],
      answer: 1,
      explanation:
        'O efeito estufa natural mantém a Terra habitável, mas pode ser intensificado por gases poluentes.',
    },
    {
      question: 'Qual alternativa está mais ligada ao aquecimento global?',
      options: [
        'Redução da concentração de gases na atmosfera',
        'Aumento da emissão de gases de efeito estufa',
        'Crescimento de áreas verdes',
        'Uso de transporte público'
      ],
      answer: 1,
      explanation:
        'O aumento de gases como CO₂ e CH₄ intensifica o aquecimento global.',
    },
    {
      question: 'Economia circular significa:',
      options: [
        'Produzir, consumir e descartar rapidamente',
        'Manter materiais e produtos em uso por mais tempo, reduzindo resíduos',
        'Eliminar toda tecnologia',
        'Aumentar a extração de recursos naturais'
      ],
      answer: 1,
      explanation:
        'A economia circular busca reutilização, reparo, reciclagem e menor desperdício.',
    },
    {
      question: 'Qual é uma medida de mitigação ambiental?',
      options: [
        'Aumentar queimadas',
        'Reduzir emissões e investir em energias renováveis',
        'Descarte de lixo em rios',
        'Eliminar áreas de preservação'
      ],
      answer: 1,
      explanation:
        'Mitigação envolve reduzir impactos e emissões.',
    },
    {
      question: 'A poluição da água pode causar:',
      options: [
        'Melhora da qualidade ambiental',
        'Danos à saúde humana e à vida aquática',
        'Aumento da pureza dos rios',
        'Fim da necessidade de tratamento'
      ],
      answer: 1,
      explanation:
        'Esgoto, químicos e lixo afetam ecossistemas e abastecimento.',
    },
    {
      question: 'Qual atitude combina responsabilidade individual e impacto ambiental positivo?',
      options: [
        'Consumir mais plástico descartável',
        'Ignorar a coleta seletiva',
        'Economizar energia, reduzir desperdício e consumir conscientemente',
        'Aumentar o desperdício de água'
      ],
      answer: 2,
      explanation:
        'Mudanças de hábito ajudam quando combinadas com ações coletivas e políticas públicas.',
    },
  ],

  'tecnologia-sustentavel': [
    {
      question: 'O que melhor define tecnologia sustentável?',
      options: [
        'Toda tecnologia cara',
        'Tecnologia que busca atender necessidades humanas com menor impacto ambiental',
        'Somente painéis solares',
        'A substituição total da natureza por máquinas'
      ],
      answer: 1,
      explanation:
        'Tecnologia sustentável envolve inovação com responsabilidade ambiental.',
    },
    {
      question: 'Qual alternativa é uma fonte renovável de energia?',
      options: ['Carvão mineral', 'Petróleo', 'Energia eólica', 'Gás natural'],
      answer: 2,
      explanation:
        'A energia eólica se renova naturalmente e reduz emissões.',
    },
    {
      question: 'Eficiência energética significa:',
      options: [
        'Usar mais energia para produzir o mesmo resultado',
        'Obter o mesmo resultado com menos desperdício de energia',
        'Eliminar qualquer tecnologia',
        'Desligar toda a rede elétrica'
      ],
      answer: 1,
      explanation:
        'Eficiência é fazer melhor uso da energia disponível.',
    },
    {
      question: 'Qual é um exemplo de tecnologia sustentável no cotidiano?',
      options: [
        'Carro a combustão sem controle de emissão',
        'Painel solar para geração elétrica',
        'Descarte de água sem reaproveitamento',
        'Uso excessivo de energia'
      ],
      answer: 1,
      explanation:
        'Painéis solares aproveitam energia limpa e renovável.',
    },
    {
      question: 'O ciclo de vida de uma tecnologia considera:',
      options: [
        'Somente o uso final',
        'Da extração de matéria-prima ao descarte ou reaproveitamento',
        'Apenas o preço de venda',
        'Somente a propaganda do produto'
      ],
      answer: 1,
      explanation:
        'Avaliar sustentabilidade exige olhar toda a cadeia de produção e uso.',
    },
    {
      question: 'Qual é um desafio da inovação sustentável?',
      options: [
        'Não existir custo algum',
        'Acesso desigual e necessidade de infraestrutura adequada',
        'Fim da necessidade de políticas públicas',
        'Impossibilidade de inovação tecnológica'
      ],
      answer: 1,
      explanation:
        'Tecnologia sustentável precisa ser acessível, viável e bem planejada.',
    },
    {
      question: 'Qual alternativa representa uma solução com baixo impacto ambiental?',
      options: [
        'Queima de combustíveis fósseis',
        'Uso de eletricidade sem controle',
        'Reuso de água da chuva e equipamentos eficientes',
        'Descarte de resíduos sem separação'
      ],
      answer: 2,
      explanation:
        'Reuso e eficiência são pilares da sustentabilidade tecnológica.',
    },
    {
      question: 'Por que tecnologia sustentável importa?',
      options: [
        'Porque substitui toda responsabilidade humana',
        'Porque permite desenvolvimento com menor pressão sobre os recursos naturais',
        'Porque elimina qualquer impacto ambiental',
        'Porque impede a inovação'
      ],
      answer: 1,
      explanation:
        'O objetivo é equilibrar desenvolvimento, inovação e preservação.',
    },
  ],
};

export const quizBySlug = Object.fromEntries(
  Object.entries(quizzes).map(([slug, questions]) => [
    slug,
    {
      slug,
      title: quizCategories.find((item) => item.slug === slug)?.title ?? slug,
      description: quizCategories.find((item) => item.slug === slug)?.description ?? '',
      questions,
    },
  ])
);