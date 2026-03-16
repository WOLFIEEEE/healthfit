export type ResourceKind = "guide" | "article";

export type ResearchSource = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  updated: string;
  notes: string;
};

export type ResourceSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  sourceIds: string[];
};

export type ResourceFaq = {
  question: string;
  answer: string;
  sourceIds: string[];
};

export type ResourceEntry = {
  slug: string;
  kind: ResourceKind;
  title: string;
  seoTitle: string;
  description: string;
  category: string;
  readingMinutes: number;
  hero: {
    eyebrow: string;
    statValue: string;
    statLabel: string;
    summary: string;
  };
  keywords: string[];
  summaryPoints: string[];
  sections: ResourceSection[];
  faq: ResourceFaq[];
};

export const researchSources: ResearchSource[] = [
  {
    id: "cdc-adult-activity",
    title: "Adult Activity: An Overview",
    url: "https://www.cdc.gov/physical-activity-basics/guidelines/adults.html",
    publisher: "CDC",
    updated: "December 20, 2023",
    notes:
      "Adult weekly activity targets, muscle-strengthening minimums, and the move-more-sit-less framing.",
  },
  {
    id: "cdc-activity-benefits",
    title: "Benefits of Physical Activity",
    url: "https://www.cdc.gov/physical-activity-basics/benefits/index.html",
    publisher: "CDC",
    updated: "December 4, 2025",
    notes:
      "Immediate and long-term benefits of physical activity, plus notes on muscle strength and fall risk.",
  },
  {
    id: "cdc-intensity",
    title: "How to Measure Physical Activity Intensity",
    url: "https://www.cdc.gov/physical-activity-basics/measuring/index.html",
    publisher: "CDC",
    updated: "December 4, 2025",
    notes:
      "Talk test and examples of moderate- and vigorous-intensity activity, including brisk walking.",
  },
  {
    id: "odphp-guidelines-qa",
    title: "Physical Activity Guidelines Questions & Answers",
    url: "https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/about-physical-activity-guidelines/questions-answers",
    publisher: "HHS ODPHP",
    updated: "2026",
    notes:
      "Context on sedentary behavior, the removal of the 10-minute bout requirement, and adherence gaps.",
  },
  {
    id: "odphp-move-planner",
    title: "Plan Your Week",
    url: "https://odphp.health.gov/moveyourway/activity-planner/activities",
    publisher: "HHS ODPHP",
    updated: "March 15, 2026",
    notes:
      "Activity planner showing the 150-minute aerobic target and 2-day strength target.",
  },
  {
    id: "odphp-move-goals",
    title: "Why These Goals?",
    url: "https://odphp.health.gov/moveyourway/activity-planner/why-these-goals",
    publisher: "HHS ODPHP",
    updated: "March 11, 2026",
    notes:
      "Start-small guidance, 300-minute advanced target, and balance reminders for people who do not feel steady.",
  },
  {
    id: "cdc-sleep",
    title: "About Sleep",
    url: "https://www.cdc.gov/sleep/about/index.html",
    publisher: "CDC",
    updated: "May 15, 2024",
    notes:
      "Age-based sleep duration recommendations and the core sleep-health framing.",
  },
  {
    id: "cdc-water",
    title: "About Water and Healthier Drinks",
    url: "https://www.cdc.gov/healthy-weight-growth/water-healthy-drinks/index.html",
    publisher: "CDC",
    updated: "March 5, 2026",
    notes:
      "Hydration basics, why water matters, and practical ways to increase water intake.",
  },
  {
    id: "nih-wellness-toolkits",
    title: "Your Healthiest Self: Wellness Toolkits",
    url: "https://www.nih.gov/health-information/your-healthiest-self-wellness-toolkits",
    publisher: "NIH",
    updated: "November 18, 2025",
    notes:
      "High-level framing for evidence-based wellness toolkits across physical and emotional well-being.",
  },
  {
    id: "nih-habit-checklist",
    title: "Build Healthy Habits Checklist",
    url: "https://www.nih.gov/sites/default/files/2024-12/physical-build-healthy-habits-checklist.pdf",
    publisher: "NIH",
    updated: "2024",
    notes:
      "Simple checklist for planning, tracking, support, rewards, and patience while building habits.",
  },
  {
    id: "nccih-stress-tips",
    title: "5 Things To Know About Relaxation Techniques for Stress",
    url: "https://www.nccih.nih.gov/health/tips/things-to-know-about-relaxation-techniques-for-stress",
    publisher: "NCCIH",
    updated: "2026",
    notes:
      "Core framing for the stress response, relaxation response, and the caution not to replace medical care.",
  },
  {
    id: "nccih-relaxation",
    title: "Relaxation Techniques: What You Need To Know",
    url: "https://www.nccih.nih.gov/health/relaxation-techniques-what-you-need-to-know",
    publisher: "NCCIH",
    updated: "Current NIH guidance",
    notes:
      "Deeper detail on breathing, progressive relaxation, and what research says about stress, blood pressure, and sleep.",
  },
  {
    id: "myplate-basics",
    title: "What Is MyPlate?",
    url: "https://www.myplate.gov/eat-healthy/what-is-myplate",
    publisher: "USDA MyPlate",
    updated: "Current USDA guidance",
    notes:
      "Core MyPlate messages: half the plate fruits and vegetables, half the grains whole, vary protein, and choose dairy or fortified soy alternatives.",
  },
  {
    id: "myplate-start-simple",
    title: "Start Simple with MyPlate",
    url: "https://www.myplate.gov/sites/default/files/2024-06/Tipsheet-1-Start-Simple-With-MyPlate.pdf",
    publisher: "USDA MyPlate",
    updated: "June 2024",
    notes:
      "Action-oriented version of MyPlate that emphasizes small changes and Nutrition Facts label reading.",
  },
  {
    id: "myplate-whole-grains",
    title: "Make Half Your Grains Whole Grains",
    url: "https://www.myplate.gov/web/tip-sheet/make-half-your-grains-whole-grains",
    publisher: "USDA MyPlate",
    updated: "Current USDA guidance",
    notes:
      "Examples and swaps for whole grains within everyday meals.",
  },
  {
    id: "myplate-protein",
    title: "Vary Your Protein Routine",
    url: "https://www.myplate.gov/es/tip-sheet/consuma-una-variedad-de-proteinas",
    publisher: "USDA MyPlate",
    updated: "Current USDA guidance",
    notes:
      "Examples of nutrient-dense protein choices and practical swaps using seafood, beans, lentils, nuts, eggs, and lean meats.",
  },
  {
    id: "myplate-dairy",
    title: "Dairy Group",
    url: "https://www.myplate.gov/DAIRY",
    publisher: "USDA MyPlate",
    updated: "Current USDA guidance",
    notes:
      "Dairy or fortified soy guidance and the focus on low-fat or fat-free choices.",
  },
  {
    id: "fda-sodium",
    title: "Sodium in Your Diet",
    url: "https://www.fda.gov/food/nutrition-education-resources-materials/sodium-your-diet",
    publisher: "FDA",
    updated: "Current FDA guidance",
    notes:
      "The less-than-2,300-mg Daily Value and practical sodium framing for food labels.",
  },
  {
    id: "fda-added-sugars",
    title: "Added Sugars on the Nutrition Facts Label",
    url: "https://www.fda.gov/food/nutrition-facts-label/added-sugars-nutrition-facts-label",
    publisher: "FDA",
    updated: "Current FDA guidance",
    notes:
      "Added sugars definition, 50-gram Daily Value on a 2,000-calorie diet, and low/high %DV thresholds.",
  },
  {
    id: "cdc-older-adults",
    title: "Older Adult Activity: An Overview",
    url: "https://www.cdc.gov/physical-activity-basics/guidelines/older-adults.html",
    publisher: "CDC",
    updated: "December 4, 2025",
    notes:
      "Older-adult activity targets, including aerobic, strength, and balance.",
  },
  {
    id: "cdc-older-what-counts",
    title: "What Counts as Physical Activity for Older Adults",
    url: "https://www.cdc.gov/physical-activity-basics/adding-older-adults/what-counts.html",
    publisher: "CDC",
    updated: "December 4, 2025",
    notes:
      "Examples of balance activities and multicomponent movement for older adults.",
  },
];

export const resourceEntries: ResourceEntry[] = [
  {
    slug: "physical-activity-guidelines-for-adults",
    kind: "guide",
    title: "Physical Activity Guidelines for Adults",
    seoTitle: "Physical Activity Guidelines for Adults: What the Official Guidance Says",
    description:
      "A research-backed summary of the adult physical activity guidelines, including weekly aerobic and strength targets.",
    category: "Movement",
    readingMinutes: 6,
    hero: {
      eyebrow: "Research-backed guide",
      statValue: "150-300 min",
      statLabel: "moderate aerobic activity each week",
      summary:
        "CDC and HHS guidance centers adult activity around weekly aerobic minutes plus muscle-strengthening work on at least 2 days.",
    },
    keywords: [
      "physical activity guidelines for adults",
      "150 minutes exercise a week",
      "adult exercise recommendations",
    ],
    summaryPoints: [
      "Adults need at least 150 minutes of moderate-intensity activity each week, or 75 minutes of vigorous activity, or a comparable mix.",
      "Adults also need muscle-strengthening activity on 2 or more days each week.",
      "The latest federal guidance also emphasizes moving more and sitting less throughout the day.",
    ],
    sections: [
      {
        title: "What the weekly target actually is",
        paragraphs: [
          "CDC says adults need at least 150 minutes of moderate-intensity aerobic activity each week. That can also be 75 minutes of vigorous-intensity activity, or an equivalent combination of both.",
          "For even greater health benefits, adults can go beyond the minimum. HHS materials built around the Physical Activity Guidelines point to a higher range of 300 minutes of moderate activity or 150 minutes of vigorous activity each week for additional benefit.",
        ],
        bullets: [
          "Moderate example: 30 minutes a day on 5 days each week.",
          "Strength target: 2 or more days that work all major muscle groups.",
          "You do not need to do the full weekly total in one pattern to benefit.",
        ],
        sourceIds: ["cdc-adult-activity", "odphp-move-goals"],
      },
      {
        title: "What counts as moderate or vigorous",
        paragraphs: [
          "CDC describes moderate-intensity activity as effort that raises breathing and heart rate enough that you can still talk, but not sing. Vigorous activity pushes hard enough that you can only say a few words without pausing for breath.",
          "Brisk walking, recreational swimming, water aerobics, and similar movement can count toward the moderate range. Jogging, running, and swimming laps are common vigorous examples.",
        ],
        sourceIds: ["cdc-intensity"],
      },
      {
        title: "Why the guidance also says move more and sit less",
        paragraphs: [
          "The first key guideline for adults is to move more and sit less. HHS explains that this comes from evidence linking more sedentary behavior with higher risk of all-cause mortality, heart disease, and high blood pressure.",
          "The same HHS guidance also notes that the older requirement for activity to happen in 10-minute bouts was removed. Smaller chunks still count, which makes the guidelines more usable in real life.",
        ],
        sourceIds: ["odphp-guidelines-qa"],
      },
    ],
    faq: [
      {
        question: "Does walking count toward the adult activity guidelines?",
        answer:
          "Yes. Brisk walking is listed by CDC as a moderate-intensity activity, so it can count toward weekly aerobic minutes if the effort is high enough for your breathing and heart rate to rise.",
        sourceIds: ["cdc-adult-activity", "cdc-intensity"],
      },
      {
        question: "Do I have to exercise in 10-minute blocks?",
        answer:
          "No. HHS says the 10-minute bout requirement was removed, which means shorter periods of movement can still contribute to your weekly total.",
        sourceIds: ["odphp-guidelines-qa"],
      },
    ],
  },
  {
    slug: "strength-training-benefits-and-guidelines",
    kind: "guide",
    title: "Strength Training Benefits and Guidelines",
    seoTitle: "Strength Training Benefits and Guidelines: What Counts and Why It Matters",
    description:
      "An official-source guide to weekly muscle-strengthening targets, what counts, and why strength work matters.",
    category: "Movement",
    readingMinutes: 5,
    hero: {
      eyebrow: "Research-backed guide",
      statValue: "2+ days",
      statLabel: "of strength work each week",
      summary:
        "Federal physical activity guidance treats muscle-strengthening work as a core part of weekly activity, not an optional extra.",
    },
    keywords: [
      "strength training guidelines",
      "muscle strengthening 2 days a week",
      "benefits of strength training",
    ],
    summaryPoints: [
      "Adults should do muscle-strengthening activities on 2 or more days each week.",
      "The goal is to work all major muscle groups, including legs, hips, back, abdomen, chest, shoulders, and arms.",
      "CDC highlights strength work as important for maintaining muscle mass, strength, and function as people age.",
    ],
    sections: [
      {
        title: "The weekly minimum",
        paragraphs: [
          "CDC pairs aerobic activity with muscle-strengthening work in the adult recommendations. The baseline target is at least 2 days each week of activity that works all major muscle groups.",
          "That means a routine is not complete if it only counts cardio minutes. The federal standard includes both movement categories.",
        ],
        sourceIds: ["cdc-adult-activity"],
      },
      {
        title: "What counts as strength work",
        paragraphs: [
          "CDC materials for adults and older adults use examples such as lifting weights, working with resistance bands, or doing bodyweight exercises. Gardening and some yoga postures can also contribute in the right context.",
          "The important part is not the equipment. The important part is whether the activity challenges the muscles enough to count as muscle-strengthening work.",
        ],
        sourceIds: ["cdc-adult-activity", "cdc-older-what-counts"],
      },
      {
        title: "Why strength work is worth protecting",
        paragraphs: [
          "CDC says muscle-strengthening activities can help people increase or maintain muscle mass and strength. For older adults, the agency also connects this kind of training with better physical function and lower fall risk when paired with balance and aerobic activity.",
          "In practice, that makes strength work one of the most durable habits in a long-term wellness routine because it supports everyday activity, not just gym performance.",
        ],
        sourceIds: ["cdc-activity-benefits", "cdc-older-adults"],
      },
    ],
    faq: [
      {
        question: "Do bodyweight exercises count as strength training?",
        answer:
          "Yes. CDC includes bodyweight exercises such as push-ups and similar resistance-based movements among examples that can count as muscle-strengthening activity.",
        sourceIds: ["cdc-older-what-counts"],
      },
      {
        question: "Is strength training only for older adults?",
        answer:
          "No. The adult guidelines include strength work for all adults, while CDC gives extra emphasis to its role in maintaining strength and function with age.",
        sourceIds: ["cdc-adult-activity", "cdc-activity-benefits"],
      },
    ],
  },
  {
    slug: "walking-benefits-and-brisk-walking",
    kind: "guide",
    title: "Walking Benefits and Brisk Walking",
    seoTitle: "Walking Benefits and Brisk Walking: How Walking Counts Toward Weekly Activity",
    description:
      "A guide to brisk walking, moderate intensity, and why walking is one of the simplest ways to build weekly activity.",
    category: "Movement",
    readingMinutes: 5,
    hero: {
      eyebrow: "Research-backed guide",
      statValue: "Talk, not sing",
      statLabel: "CDC's simple brisk-walking test",
      summary:
        "Walking can count toward weekly activity goals when the effort is high enough to qualify as moderate intensity.",
    },
    keywords: [
      "walking benefits",
      "does walking count as exercise",
      "brisk walking moderate intensity",
    ],
    summaryPoints: [
      "CDC treats brisk walking as a moderate-intensity aerobic activity.",
      "A simple test is whether you can talk, but not sing, while doing it.",
      "Even small increases in activity can help people who are starting from low activity levels.",
    ],
    sections: [
      {
        title: "When walking counts",
        paragraphs: [
          "Walking counts toward the guidelines when it reaches moderate intensity. CDC describes that level as effort that makes you breathe harder and raise your heart rate while still allowing conversation, but not singing.",
          "Current CDC intensity guidance lists brisk walking among moderate-intensity examples, and CDC activity pages regularly use brisk walking as the go-to example for adults.",
        ],
        sourceIds: ["cdc-intensity", "cdc-adult-activity"],
      },
      {
        title: "Why walking is such a useful entry point",
        paragraphs: [
          "HHS and CDC both emphasize that some activity is better than none. That matters because walking is widely accessible, easy to scale up gradually, and already familiar for many adults.",
          "CDC's activity guidance also notes that people start to benefit from even less than 150 minutes a week of moderate-intensity movement when they are building from a lower baseline.",
        ],
        sourceIds: ["cdc-activity-benefits", "odphp-move-goals"],
      },
      {
        title: "How to build a walking habit around the guideline",
        paragraphs: [
          "The federal 150-minute target can be broken into smaller patterns. CDC uses 30 minutes a day on 5 days a week as one example, but HHS planning tools also encourage building your week with a mix of activities and day counts that fit your life.",
          "That flexibility is important for SEO topics around walking because people often search for a single perfect number. The real official guidance is about a weekly total, not one required daily format.",
        ],
        sourceIds: ["cdc-adult-activity", "odphp-move-planner"],
      },
    ],
    faq: [
      {
        question: "How do I know if my walk is brisk enough?",
        answer:
          "CDC's talk test is the easiest check. At moderate intensity, you should be able to talk, but not sing, during the activity.",
        sourceIds: ["cdc-intensity"],
      },
      {
        question: "Does slow walking still help?",
        answer:
          "Yes. HHS and CDC both emphasize that some activity is better than none, even if it does not yet add up to the full weekly target.",
        sourceIds: ["odphp-guidelines-qa", "odphp-move-goals"],
      },
    ],
  },
  {
    slug: "move-more-sit-less-guide",
    kind: "guide",
    title: "Move More, Sit Less Guide",
    seoTitle: "Move More, Sit Less: What the Physical Activity Guidelines Mean for Sedentary Time",
    description:
      "A clear guide to the official move-more-sit-less recommendation and what it means for sedentary time.",
    category: "Movement",
    readingMinutes: 5,
    hero: {
      eyebrow: "Research-backed guide",
      statValue: "No exact sitting cap",
      statLabel: "in the federal guideline",
      summary:
        "The official message is to move more and sit less, not to obsess over one universal sitting number.",
    },
    keywords: [
      "move more sit less",
      "sedentary behavior guideline",
      "how much sitting is too much",
    ],
    summaryPoints: [
      "The first key adult guideline is to move more and sit less throughout the day.",
      "HHS links more sedentary behavior with higher risk of all-cause mortality, heart disease, and high blood pressure.",
      "There is no single official daily sitting limit in the current guideline.",
    ],
    sections: [
      {
        title: "The official message",
        paragraphs: [
          "HHS says the first key guideline for adults is to move more and sit less throughout the day. CDC's adult overview echoes the same point and notes that adults who sit less and do any amount of moderate- to vigorous-intensity activity gain some health benefits.",
          "That wording matters because it gives people a realistic starting point instead of an all-or-nothing rule.",
        ],
        sourceIds: ["odphp-guidelines-qa", "cdc-adult-activity"],
      },
      {
        title: "Why the guidance changed",
        paragraphs: [
          "HHS explains that the stronger sedentary-behavior language reflects newer evidence linking more sitting with higher risk of all-cause mortality, heart disease, and high blood pressure.",
          "At the same time, the agency says the evidence did not support one specific recommended daily limit for sitting or a single best pattern for breaking it up.",
        ],
        sourceIds: ["odphp-guidelines-qa"],
      },
      {
        title: "How to use the guidance in real life",
        paragraphs: [
          "The most practical interpretation is to reduce long inactive stretches where possible and to build more intentional moderate or vigorous activity into the week.",
          "This also aligns with the federal removal of the 10-minute-bout rule. Shorter movement breaks can still count toward the bigger goal of moving more across the whole day.",
        ],
        sourceIds: ["odphp-guidelines-qa", "cdc-adult-activity"],
      },
    ],
    faq: [
      {
        question: "Is there an official maximum number of sitting hours per day?",
        answer:
          "No. HHS says the evidence did not support a specific recommended daily limit on sedentary behavior in the current federal guideline.",
        sourceIds: ["odphp-guidelines-qa"],
      },
      {
        question: "Do short movement breaks still matter?",
        answer:
          "Yes. The current guidance removed the older 10-minute bout requirement, which supports the idea that shorter movement blocks can still contribute to a healthier day.",
        sourceIds: ["odphp-guidelines-qa"],
      },
    ],
  },
  {
    slug: "sleep-recommendations-for-adults",
    kind: "guide",
    title: "Sleep Recommendations for Adults",
    seoTitle: "Sleep Recommendations for Adults: CDC Sleep Duration Guidance by Age",
    description:
      "CDC-backed sleep duration recommendations for adults, plus the basics of what to track and when to seek help.",
    category: "Recovery",
    readingMinutes: 5,
    hero: {
      eyebrow: "Research-backed guide",
      statValue: "7+ hours",
      statLabel: "for adults ages 18 to 60",
      summary:
        "CDC's sleep guidance sets adult sleep targets by age and frames good sleep as essential for health and emotional well-being.",
    },
    keywords: [
      "sleep recommendations for adults",
      "how much sleep do adults need",
      "cdc sleep guidance",
    ],
    summaryPoints: [
      "CDC recommends 7 or more hours for adults ages 18 to 60.",
      "For ages 61 to 64, CDC lists 7 to 9 hours; for ages 65 and older, 7 to 8 hours.",
      "CDC also emphasizes sleep quality, not only time in bed.",
    ],
    sections: [
      {
        title: "The age-based recommendations",
        paragraphs: [
          "CDC lists 7 or more hours as the recommended daily amount for adults ages 18 to 60. For adults 61 to 64, the range is 7 to 9 hours, and for adults 65 and older, 7 to 8 hours.",
          "These age splits are useful for SEO because many pages flatten sleep advice into one number when the official public-health framing is more nuanced.",
        ],
        sourceIds: ["cdc-sleep"],
      },
      {
        title: "Why sleep belongs in a wellness plan",
        paragraphs: [
          "CDC describes good sleep as essential for health and emotional well-being. It also stresses that healthy sleep depends on getting enough sleep and good sleep quality.",
          "That makes sleep a tracking priority, not just a nice-to-have, in any wellness system that also cares about workouts, hydration, and stress.",
        ],
        sourceIds: ["cdc-sleep"],
      },
      {
        title: "What to track without overcomplicating it",
        paragraphs: [
          "The cleanest sleep questions are still the best ones: how many hours you actually get, how steady the pattern feels, and whether sleep problems are becoming persistent.",
          "CDC explicitly advises people to talk with a health care provider if they have problems sleeping. That is especially important for ongoing or severe sleep issues.",
        ],
        sourceIds: ["cdc-sleep"],
      },
    ],
    faq: [
      {
        question: "Is 6 hours enough for most adults?",
        answer:
          "CDC's public guidance says adults 18 to 60 should aim for 7 or more hours, so 6 hours falls below the recommended amount for that age group.",
        sourceIds: ["cdc-sleep"],
      },
      {
        question: "Does sleep need change with age?",
        answer:
          "Yes. CDC lists different recommended ranges for different life stages, including different adult age bands.",
        sourceIds: ["cdc-sleep"],
      },
    ],
  },
  {
    slug: "hydration-basics-guide",
    kind: "guide",
    title: "Hydration Basics Guide",
    seoTitle: "Hydration Basics: What Official Guidance Says About Water and Healthy Drinks",
    description:
      "A CDC-based guide to hydration basics, why water matters, and simple ways to make hydration easier.",
    category: "Nutrition",
    readingMinutes: 5,
    hero: {
      eyebrow: "Research-backed guide",
      statValue: "Water counts",
      statLabel: "and foods contribute too",
      summary:
        "CDC frames hydration around body function, dehydration prevention, and practical ways to choose water more often.",
    },
    keywords: [
      "hydration basics",
      "water intake guide",
      "benefits of drinking water",
    ],
    summaryPoints: [
      "CDC says getting enough water every day is important for health.",
      "Water helps with temperature regulation, joints, sensitive tissues, and waste removal.",
      "Daily fluid needs vary by age, sex, pregnancy status, activity level, and breastfeeding status.",
    ],
    sections: [
      {
        title: "What water helps your body do",
        paragraphs: [
          "CDC says drinking water can help prevent dehydration and helps the body function normally. Its public guidance lists several examples: keeping a normal temperature, lubricating and cushioning joints, protecting the spinal cord and other sensitive tissues, and helping remove waste.",
          "That makes hydration less about trend-driven rules and more about protecting everyday function.",
        ],
        sourceIds: ["cdc-water"],
      },
      {
        title: "Why one universal number does not fit everyone",
        paragraphs: [
          "CDC notes that daily water intake recommendations vary by age, sex, pregnancy status, activity level, and breastfeeding status. The same page also points out that foods with high water content, including many fruits and vegetables, add to total fluid intake.",
          "People also tend to need more water in hot climates, when physically active, or while dealing with fever, diarrhea, or vomiting.",
        ],
        sourceIds: ["cdc-water"],
      },
      {
        title: "The cleanest behavior change",
        paragraphs: [
          "CDC's practical advice is straightforward: carry a reusable water bottle, choose water over sugary drinks, serve water during meals, and use simple flavor add-ins like lemon or lime if that helps.",
          "This is useful SEO territory because many hydration pages overstate precision, while official guidance is much more behavior focused.",
        ],
        sourceIds: ["cdc-water"],
      },
    ],
    faq: [
      {
        question: "Do foods count toward hydration?",
        answer:
          "Yes. CDC says total water intake comes from water and other beverages, and foods with high water content such as many fruits and vegetables also contribute.",
        sourceIds: ["cdc-water"],
      },
      {
        question: "Do hydration needs go up with exercise?",
        answer:
          "Yes. CDC notes that the body needs more water when you are more physically active, among other situations.",
        sourceIds: ["cdc-water"],
      },
    ],
  },
  {
    slug: "healthy-eating-pattern-guide",
    kind: "guide",
    title: "Healthy Eating Pattern Guide",
    seoTitle: "Healthy Eating Pattern Guide: MyPlate Basics Backed by USDA Guidance",
    description:
      "A clean, source-backed summary of MyPlate basics and the core food-pattern messages that matter most.",
    category: "Nutrition",
    readingMinutes: 6,
    hero: {
      eyebrow: "Research-backed guide",
      statValue: "Half the plate",
      statLabel: "fruits and vegetables",
      summary:
        "USDA MyPlate turns the Dietary Guidelines into a simple public-health pattern that is practical enough to use every day.",
    },
    keywords: [
      "healthy eating pattern",
      "myplate basics",
      "healthy eating guide",
    ],
    summaryPoints: [
      "MyPlate says to make half your plate fruits and vegetables and to focus on whole fruits.",
      "USDA also says to make half your grains whole grains and vary your protein routine.",
      "Low-fat or fat-free dairy milk or yogurt, or fortified soy versions, remain part of the core pattern.",
    ],
    sections: [
      {
        title: "The MyPlate pattern in one view",
        paragraphs: [
          "USDA's public MyPlate messages are intentionally simple. Make half your plate fruits and vegetables, make half your grains whole grains, vary your protein routine, and move toward low-fat or fat-free dairy milk or yogurt or fortified soy versions.",
          "For most people, that is a more useful starting point than chasing one nutrient in isolation.",
        ],
        sourceIds: ["myplate-basics", "myplate-dairy"],
      },
      {
        title: "Why small changes matter",
        paragraphs: [
          "MyPlate repeatedly uses the phrase that the benefits of healthy eating add up over time, bite by bite. That message matters because healthy eating patterns are built through repetition, not one perfect day.",
          "The Start Simple materials also encourage comparing foods with the Nutrition Facts label instead of relying only on front-package marketing.",
        ],
        sourceIds: ["myplate-basics", "myplate-start-simple"],
      },
      {
        title: "How to keep the pattern practical",
        paragraphs: [
          "A clean pattern is easier to maintain when you use it as a weekly direction instead of trying to build every meal around exact macros. Official USDA messages are broad on purpose: they help you shape choices without forcing one rigid menu.",
          "That is also why this page avoids invented meal plans. The public guidance is about food-group balance, variety, and consistency.",
        ],
        sourceIds: ["myplate-basics", "myplate-start-simple"],
      },
    ],
    faq: [
      {
        question: "What is the simplest MyPlate message to remember?",
        answer:
          "A strong starting point is to make half your plate fruits and vegetables, then use whole grains, varied protein foods, and dairy or fortified soy choices to round out the rest.",
        sourceIds: ["myplate-basics", "myplate-dairy"],
      },
      {
        question: "Does MyPlate support small changes instead of extreme diets?",
        answer:
          "Yes. USDA's Start Simple messaging explicitly says the benefits of healthy eating add up over time, bite by bite, and encourages practical changes rather than perfection.",
        sourceIds: ["myplate-start-simple"],
      },
    ],
  },
  {
    slug: "whole-grains-guide",
    kind: "guide",
    title: "Whole Grains Guide",
    seoTitle: "Whole Grains Guide: What 'Make Half Your Grains Whole' Means in Practice",
    description:
      "A USDA-backed guide to whole grains, common examples, and the easiest whole-grain swaps to use.",
    category: "Nutrition",
    readingMinutes: 5,
    hero: {
      eyebrow: "Research-backed guide",
      statValue: "Half your grains",
      statLabel: "should be whole grains",
      summary:
        "USDA's whole-grains message is one of the simplest high-impact improvements in a healthy eating pattern.",
    },
    keywords: [
      "whole grains guide",
      "make half your grains whole",
      "whole grain examples",
    ],
    summaryPoints: [
      "USDA says to make half your grains whole grains.",
      "Whole-grain choices can include oatmeal, barley, brown rice, millet, quinoa, and whole-grain breads.",
      "USDA also reminds people to watch added sugars, sodium, and saturated fat when choosing grain foods.",
    ],
    sections: [
      {
        title: "The official whole-grains message",
        paragraphs: [
          "USDA's MyPlate guidance says to make half your grains whole grains. That is the core public-health message, and it is deliberately simple enough to guide shopping and meal planning without complex tracking.",
          "MyPlate also treats whole grains as part of a broader healthy pattern that includes fruits, vegetables, protein foods, and dairy or fortified soy alternatives.",
        ],
        sourceIds: ["myplate-basics", "myplate-whole-grains"],
      },
      {
        title: "What whole-grain swaps look like",
        paragraphs: [
          "USDA's tip sheet suggests whole-grain hot cereals such as oatmeal, swapping sandwich bread for whole-grain versions, and choosing grains like barley, wild rice, buckwheat, millet, or quinoa.",
          "This matters because the easiest whole-grain habit is usually substitution, not total reinvention.",
        ],
        sourceIds: ["myplate-whole-grains"],
      },
      {
        title: "Why labels still matter",
        paragraphs: [
          "USDA also notes that grain choices should be limited in added sugars, sodium, and saturated fat. In other words, a grain-based food is not automatically a strong everyday choice just because it contains some whole grain.",
          "Reading the Nutrition Facts label and ingredient list remains part of the work.",
        ],
        sourceIds: ["myplate-whole-grains", "myplate-start-simple"],
      },
    ],
    faq: [
      {
        question: "Is oatmeal a whole grain?",
        answer:
          "Yes. USDA's whole-grains tip sheet uses oatmeal as one of its example whole-grain breakfast choices.",
        sourceIds: ["myplate-whole-grains"],
      },
      {
        question: "Do I need every grain I eat to be whole grain?",
        answer:
          "USDA's public message is to make half your grains whole grains, not necessarily all of them.",
        sourceIds: ["myplate-whole-grains"],
      },
    ],
  },
  {
    slug: "protein-routine-guide",
    kind: "guide",
    title: "Protein Routine Guide",
    seoTitle: "Protein Routine Guide: How to Vary Protein Foods the MyPlate Way",
    description:
      "A USDA-backed guide to varying protein choices with seafood, beans, lentils, nuts, eggs, and lean meats.",
    category: "Nutrition",
    readingMinutes: 5,
    hero: {
      eyebrow: "Research-backed guide",
      statValue: "Vary it",
      statLabel: "instead of repeating one protein source",
      summary:
        "USDA MyPlate emphasizes protein variety rather than pushing one single food or one rigid macro target.",
    },
    keywords: [
      "vary your protein routine",
      "healthy protein foods",
      "protein food ideas",
    ],
    summaryPoints: [
      "USDA's MyPlate message is to vary your protein routine.",
      "Good routine options include seafood, beans, lentils, eggs, nuts, and lean meats.",
      "USDA also says to choose protein options limited in added sugars, saturated fat, and sodium.",
    ],
    sections: [
      {
        title: "What protein variety means",
        paragraphs: [
          "USDA does not frame healthy eating as picking one best protein. Its MyPlate materials emphasize a varied protein routine built from nutrient-dense options.",
          "The public tip sheet highlights seafood, beans, peas, lentils, nuts, seeds, eggs, and lean meats as practical choices to rotate across the week.",
        ],
        sourceIds: ["myplate-protein", "myplate-basics"],
      },
      {
        title: "Why variety helps",
        paragraphs: [
          "Protein variety makes it easier to widen the nutrient profile of the diet and reduce overreliance on heavily processed or higher-sodium choices.",
          "USDA's wording is especially clear here: choose protein foods that are full of nutrients and limited in added sugars, saturated fat, and sodium.",
        ],
        sourceIds: ["myplate-protein"],
      },
      {
        title: "The easiest practical shifts",
        paragraphs: [
          "USDA suggests keeping canned seafood on hand, using beans or lentils in chili or soups, adding chicken or chickpeas to salads, and using nuts or nut butter as snacks.",
          "The point is not to build a performance diet. The point is to make protein variety easy enough to repeat.",
        ],
        sourceIds: ["myplate-protein"],
      },
    ],
    faq: [
      {
        question: "Do beans and lentils count as protein foods?",
        answer:
          "Yes. USDA's protein guidance specifically highlights beans, peas, and lentils as part of a varied protein routine.",
        sourceIds: ["myplate-protein"],
      },
      {
        question: "Is protein variety better than eating the same protein every day?",
        answer:
          "USDA's public healthy-eating messaging favors variety. The MyPlate pattern explicitly says to vary your protein routine rather than repeat one option constantly.",
        sourceIds: ["myplate-protein", "myplate-basics"],
      },
    ],
  },
  {
    slug: "sodium-guide",
    kind: "guide",
    title: "Sodium Guide",
    seoTitle: "Sodium Guide: FDA Daily Value, Food Labels, and Where Sodium Hides",
    description:
      "A source-backed guide to sodium, the FDA Daily Value, and the food categories that often drive intake up.",
    category: "Nutrition",
    readingMinutes: 5,
    hero: {
      eyebrow: "Research-backed guide",
      statValue: "< 2,300 mg",
      statLabel: "FDA Daily Value for sodium",
      summary:
        "Sodium matters in healthy eating because a small amount is necessary, but too much can work against overall health goals.",
    },
    keywords: [
      "sodium guide",
      "how much sodium per day",
      "fda sodium daily value",
    ],
    summaryPoints: [
      "FDA says the Daily Value for sodium is less than 2,300 milligrams per day.",
      "Sodium is needed in small amounts, but too much can be bad for health.",
      "Packaged, processed, fast, and restaurant foods are common places where intake rises quickly.",
    ],
    sections: [
      {
        title: "The number to know",
        paragraphs: [
          "FDA says the Daily Value for sodium is less than 2,300 milligrams per day. That is the label-based reference point many people use when comparing packaged foods.",
          "The point is not zero sodium. The body needs a small amount of sodium to work properly.",
        ],
        sourceIds: ["fda-sodium"],
      },
      {
        title: "Where sodium adds up fast",
        paragraphs: [
          "FDA and federal nutrition guidance consistently point people toward label reading because sodium adds up quickly in processed and packaged foods. Restaurant foods, canned products, sauces, and packaged snack items can all push totals up fast.",
          "This is one reason public-health guidance focuses on patterns rather than single meals.",
        ],
        sourceIds: ["fda-sodium", "myplate-start-simple"],
      },
      {
        title: "How to use labels without obsessing",
        paragraphs: [
          "Nutrition labels work best as a comparison tool. If two similar products are available, the lower-sodium option is often the easier long-term choice.",
          "That approach fits well with USDA's broader healthy-pattern messaging and keeps the behavior change realistic.",
        ],
        sourceIds: ["fda-sodium", "myplate-start-simple"],
      },
    ],
    faq: [
      {
        question: "Does the body need sodium at all?",
        answer:
          "Yes. FDA says the body needs a small amount of sodium to work properly, but too much sodium can be bad for health.",
        sourceIds: ["fda-sodium"],
      },
      {
        question: "What sodium number should I use on the label?",
        answer:
          "FDA uses a Daily Value of less than 2,300 milligrams per day, which is the benchmark shown on the Nutrition Facts label.",
        sourceIds: ["fda-sodium"],
      },
    ],
  },
  {
    slug: "added-sugars-guide",
    kind: "guide",
    title: "Added Sugars Guide",
    seoTitle: "Added Sugars Guide: FDA Label Rules, 50-Gram Daily Value, and Smart Comparisons",
    description:
      "A clean guide to added sugars, the Nutrition Facts label, and what low and high %DV mean.",
    category: "Nutrition",
    readingMinutes: 6,
    hero: {
      eyebrow: "Research-backed guide",
      statValue: "50 g",
      statLabel: "Daily Value on a 2,000-calorie diet",
      summary:
        "FDA label rules make added sugars easier to compare across foods, which is why this topic matters for everyday decisions.",
    },
    keywords: [
      "added sugars guide",
      "added sugars nutrition facts label",
      "how much added sugar per day",
    ],
    summaryPoints: [
      "FDA says the Daily Value for added sugars is 50 grams per day on a 2,000-calorie diet.",
      "The Dietary Guidelines recommend limiting added sugars to less than 10 percent of calories per day.",
      "On the label, 5% DV or less is low and 20% DV or more is high.",
    ],
    sections: [
      {
        title: "Added sugars versus total sugars",
        paragraphs: [
          "FDA separates total sugars from added sugars on the Nutrition Facts label. Added sugars include sugars added during processing, foods packaged as sweeteners, sugars from syrups and honey, and sugars from concentrated fruit or vegetable juices used as sweeteners.",
          "Naturally occurring sugars in foods such as milk, fruits, and vegetables are not counted as added sugars.",
        ],
        sourceIds: ["fda-added-sugars"],
      },
      {
        title: "The number and the label shortcut",
        paragraphs: [
          "FDA says the Daily Value for added sugars is 50 grams per day based on a 2,000-calorie diet. The agency also notes that 5% Daily Value or less is considered low, while 20% or more is high.",
          "That makes the label useful even if you are not tracking grams across the whole day. You can still compare products quickly.",
        ],
        sourceIds: ["fda-added-sugars"],
      },
      {
        title: "Where most added sugars come from",
        paragraphs: [
          "FDA points to sugar-sweetened beverages, baked goods, desserts, and sweets as major sources of added sugars for most Americans.",
          "The most practical public-health move is often swapping patterns, not chasing one perfect food. Water over sugary drinks and lower-added-sugar comparisons within the same product category tend to be more sustainable.",
        ],
        sourceIds: ["fda-added-sugars", "cdc-water"],
      },
    ],
    faq: [
      {
        question: "How many grams of added sugar is the Daily Value?",
        answer:
          "FDA sets the Daily Value for added sugars at 50 grams per day based on a 2,000-calorie diet.",
        sourceIds: ["fda-added-sugars"],
      },
      {
        question: "What counts as a low source of added sugars?",
        answer:
          "FDA says 5% Daily Value or less is low, while 20% Daily Value or more is high.",
        sourceIds: ["fda-added-sugars"],
      },
    ],
  },
  {
    slug: "stress-relaxation-techniques-guide",
    kind: "guide",
    title: "Stress and Relaxation Techniques Guide",
    seoTitle: "Stress and Relaxation Techniques Guide: What NIH Says About Stress Support",
    description:
      "An NIH-backed guide to relaxation techniques, what they are, and how to use them without treating them like medical care.",
    category: "Recovery",
    readingMinutes: 6,
    hero: {
      eyebrow: "Research-backed guide",
      statValue: "6.4%",
      statLabel: "of U.S. adults used guided imagery or progressive relaxation in 2022",
      summary:
        "NIH sources frame relaxation techniques as generally safe practices that can support stress management, but not replace professional care.",
    },
    keywords: [
      "relaxation techniques for stress",
      "stress management breathing exercises",
      "nih relaxation techniques",
    ],
    summaryPoints: [
      "NCCIH says relaxation techniques include breathing exercises, progressive relaxation, guided imagery, biofeedback, and self-hypnosis.",
      "The goal is to produce the body's natural relaxation response.",
      "NCCIH also says relaxation techniques should not replace conventional care or delay seeing a doctor about a medical problem.",
    ],
    sections: [
      {
        title: "What relaxation techniques are",
        paragraphs: [
          "NCCIH describes relaxation techniques as practices such as progressive muscle relaxation, guided imagery, biofeedback-assisted relaxation, self-hypnosis, and breathing exercises. The goal is to consciously produce the body's natural relaxation response.",
          "The same NIH source explains that the relaxation response is associated with slower breathing, lower blood pressure, and a calmer physical state.",
        ],
        sourceIds: ["nccih-stress-tips", "nccih-relaxation"],
      },
      {
        title: "What the research suggests",
        paragraphs: [
          "NCCIH's deeper review says some breathing and relaxation interventions show modest benefits in areas such as stress, anxiety, and blood pressure, but the evidence is mixed in many conditions and the quality of studies varies.",
          "That is why clean wellness content should describe these techniques as supportive tools, not guaranteed treatments.",
        ],
        sourceIds: ["nccih-relaxation"],
      },
      {
        title: "The most important caution",
        paragraphs: [
          "NCCIH explicitly says not to use relaxation techniques as a replacement for conventional care or to postpone seeing a doctor about a medical problem.",
          "That caution fits the broader Healthfit.ai positioning: stress-management tools can support a wellness routine, but they are not a substitute for diagnosis or treatment.",
        ],
        sourceIds: ["nccih-stress-tips"],
      },
    ],
    faq: [
      {
        question: "What is the simplest relaxation technique to start with?",
        answer:
          "Breathing exercises are one of the most accessible starting points. NCCIH includes slow, deep breathing among its core relaxation techniques.",
        sourceIds: ["nccih-relaxation"],
      },
      {
        question: "Should relaxation techniques replace medical care?",
        answer:
          "No. NCCIH clearly says they should not replace conventional care or delay evaluation for a medical problem.",
        sourceIds: ["nccih-stress-tips"],
      },
    ],
  },
  {
    slug: "healthy-habit-building-guide",
    kind: "guide",
    title: "Healthy Habit Building Guide",
    seoTitle: "Healthy Habit Building Guide: NIH Steps for Building Health Habits That Last",
    description:
      "A practical habit-building guide based on NIH wellness toolkit guidance and habit checklist principles.",
    category: "Habits",
    readingMinutes: 5,
    hero: {
      eyebrow: "Research-backed guide",
      statValue: "Plan and track",
      statLabel: "are core NIH habit themes",
      summary:
        "NIH's healthy-habit checklist focuses on simple repeatable behavior design, not motivation spikes.",
    },
    keywords: [
      "healthy habit building",
      "build healthy habits nih",
      "how to make healthy habits stick",
    ],
    summaryPoints: [
      "NIH's healthy-habit checklist starts with planning, identifying triggers, and setting realistic goals.",
      "The checklist also emphasizes changing surroundings, getting support, and tracking progress.",
      "NIH explicitly says improvement takes time and setbacks happen.",
    ],
    sections: [
      {
        title: "Start with triggers, not just goals",
        paragraphs: [
          "The NIH checklist begins with planning: identify unhealthy patterns and triggers, then set realistic goals. That is more actionable than simply deciding to 'be healthier.'",
          "This framing also fits the broader NIH wellness toolkit approach, which focuses on evidence-based tips for living well rather than extreme rules.",
        ],
        sourceIds: ["nih-habit-checklist", "nih-wellness-toolkits"],
      },
      {
        title: "Change the environment around the behavior",
        paragraphs: [
          "NIH also recommends changing your surroundings to make healthier choices easier and temptations harder. That can include things as simple as preparing for a walk, keeping water visible, or making a healthier food choice the default at home.",
          "This matters because habits are easier to repeat when the environment does more of the work.",
        ],
        sourceIds: ["nih-habit-checklist"],
      },
      {
        title: "Track progress and expect setbacks",
        paragraphs: [
          "The checklist also calls out support, tracking, future thinking, healthy rewards, and patience. NIH explicitly says improvement takes time and setbacks happen, so the focus should stay on progress, not perfection.",
          "That is one of the clearest public-health habit messages available and it maps well to wellness apps, journals, and simple checklists.",
        ],
        sourceIds: ["nih-habit-checklist"],
      },
    ],
    faq: [
      {
        question: "What is the first thing NIH recommends for habit change?",
        answer:
          "The NIH checklist starts with planning: identify unhealthy patterns and triggers, then set realistic goals.",
        sourceIds: ["nih-habit-checklist"],
      },
      {
        question: "Does NIH expect habit change to be perfect?",
        answer:
          "No. NIH says improvement takes time and setbacks happen, and encourages focusing on progress rather than perfection.",
        sourceIds: ["nih-habit-checklist"],
      },
    ],
  },
  {
    slug: "older-adult-balance-and-strength-guide",
    kind: "guide",
    title: "Older Adult Balance and Strength Guide",
    seoTitle: "Older Adult Balance and Strength Guide: CDC Activity Guidance for Adults 65+",
    description:
      "A CDC-based guide to aerobic, strength, and balance activity for older adults.",
    category: "Movement",
    readingMinutes: 5,
    hero: {
      eyebrow: "Research-backed guide",
      statValue: "3 activity types",
      statLabel: "aerobic, strength, and balance",
      summary:
        "CDC says adults 65 and older need a weekly mix of aerobic activity, muscle-strengthening work, and balance activity.",
    },
    keywords: [
      "older adult balance exercises",
      "cdc activity guidelines older adults",
      "strength and balance over 65",
    ],
    summaryPoints: [
      "CDC says adults 65 and older need aerobic, muscle-strengthening, and balance activities each week.",
      "Older adults still use the 150-minute moderate or 75-minute vigorous aerobic target.",
      "Balance activities help prevent falls and reduce the risk of injury from a fall.",
    ],
    sections: [
      {
        title: "The weekly mix for adults 65 and older",
        paragraphs: [
          "CDC's older-adult guidance keeps the same aerobic base used for other adults: at least 150 minutes of moderate-intensity activity, 75 minutes of vigorous activity, or a comparable mix each week.",
          "What changes is the explicit addition of balance work alongside muscle-strengthening activity.",
        ],
        sourceIds: ["cdc-older-adults"],
      },
      {
        title: "What balance activity can look like",
        paragraphs: [
          "CDC gives examples such as walking backward, standing on one leg, or using a wobble board. The agency also notes that strengthening back, abdomen, and leg muscles improves balance.",
          "Some multicomponent activities such as yoga, tai chi, gardening, and certain sports can cover more than one category at the same time.",
        ],
        sourceIds: ["cdc-older-what-counts"],
      },
      {
        title: "Why the mix matters",
        paragraphs: [
          "CDC says activities of all three types are important for improving physical function and decreasing the risk of falls or injury from a fall.",
          "That is a strong example of why good SEO health content should stick close to the official framing instead of overpromising one single exercise style.",
        ],
        sourceIds: ["cdc-activity-benefits", "cdc-older-what-counts"],
      },
    ],
    faq: [
      {
        question: "Do older adults still need 150 minutes a week?",
        answer:
          "Yes. CDC's older-adult guidance still uses the 150-minute moderate-intensity target, or 75 minutes vigorous, or an equivalent combination.",
        sourceIds: ["cdc-older-adults"],
      },
      {
        question: "Is balance really part of the official guidance for older adults?",
        answer:
          "Yes. CDC explicitly says adults 65 and older need balance activities each week in addition to aerobic and muscle-strengthening work.",
        sourceIds: ["cdc-older-adults", "cdc-older-what-counts"],
      },
    ],
  },
  {
    slug: "how-to-build-a-150-minute-week",
    kind: "article",
    title: "How to Build a 150-Minute Week",
    seoTitle: "How to Build a 150-Minute Week Using Official Activity Guidance",
    description:
      "A custom article that turns official federal activity guidance into a practical weekly planning framework.",
    category: "Movement",
    readingMinutes: 7,
    hero: {
      eyebrow: "Custom article",
      statValue: "30 x 5",
      statLabel: "is only one valid pattern",
      summary:
        "The official weekly target is flexible. This article shows how to translate that flexibility into a plan that actually fits life.",
    },
    keywords: [
      "how to build a 150 minute week",
      "weekly exercise plan 150 minutes",
      "how to reach 150 minutes of exercise",
    ],
    summaryPoints: [
      "The weekly target is 150 minutes of moderate activity, but it does not have to be done in one fixed way.",
      "HHS planning tools support building the week activity by activity rather than following one perfect schedule.",
      "Strength work still needs to appear on at least 2 days of the week.",
    ],
    sections: [
      {
        title: "Start with the official floor, not the internet's favorite shortcut",
        paragraphs: [
          "The federal target is a weekly total: at least 150 minutes of moderate-intensity activity, 75 minutes of vigorous-intensity activity, or a comparable combination. A 30-minutes-for-5-days pattern is one example, not the only acceptable schedule.",
          "That matters because many people search for a single daily prescription when the official guidance is built around weekly totals and flexibility.",
        ],
        sourceIds: ["cdc-adult-activity", "odphp-move-planner"],
      },
      {
        title: "Three clean ways to build the week",
        paragraphs: [
          "A moderate-focused week might look like five 30-minute sessions. A mixed week could use fewer total sessions by including vigorous activity, since federal guidance treats 1 minute of vigorous activity as roughly equivalent to 2 minutes of moderate activity. A starting-from-zero week may simply build toward the target over time.",
          "HHS guidance for consumers explicitly says that if you are just getting started, you can build up to 150 minutes over time, and even 5 minutes of activity has health benefits.",
        ],
        bullets: [
          "Pattern A: 30 minutes on 5 days.",
          "Pattern B: 50 minutes on 3 days.",
          "Pattern C: A mix of moderate and vigorous activity plus gradual progression.",
        ],
        sourceIds: ["cdc-adult-activity", "odphp-move-goals", "cdc-intensity"],
      },
      {
        title: "Do not forget the second half of the guideline",
        paragraphs: [
          "The weekly plan is incomplete if it only counts aerobic minutes. CDC also says adults need muscle-strengthening activity on 2 or more days each week.",
          "A realistic 150-minute week usually works best when strength days are scheduled first and aerobic minutes are built around them, not added as an afterthought.",
        ],
        sourceIds: ["cdc-adult-activity", "odphp-move-planner"],
      },
    ],
    faq: [
      {
        question: "Can I reach 150 minutes with shorter sessions?",
        answer:
          "Yes. The current guidelines no longer require activity to happen in 10-minute bouts, so shorter blocks can still contribute to the weekly total.",
        sourceIds: ["odphp-guidelines-qa"],
      },
      {
        question: "Should I wait until I can do the full target?",
        answer:
          "No. HHS consumer guidance says even 5 minutes of activity has health benefits, and people can build toward 150 minutes over time.",
        sourceIds: ["odphp-move-goals"],
      },
    ],
  },
  {
    slug: "beginner-strength-week-guide",
    kind: "article",
    title: "A Beginner Strength Week That Fits the Guidelines",
    seoTitle: "A Beginner Strength Week That Fits the Guidelines Without Overcomplicating It",
    description:
      "A custom article that translates the official 2-day strength recommendation into a simple weekly structure.",
    category: "Movement",
    readingMinutes: 6,
    hero: {
      eyebrow: "Custom article",
      statValue: "2 days",
      statLabel: "is the official starting point",
      summary:
        "A beginner strength week does not need to be advanced. It needs to be regular enough to cover the official weekly minimum.",
    },
    keywords: [
      "beginner strength week",
      "2 day strength training guideline",
      "beginner strength training routine guide",
    ],
    summaryPoints: [
      "The federal target is at least 2 days a week of muscle-strengthening activity.",
      "Those sessions should work all major muscle groups.",
      "Weights, bands, and bodyweight all count when the muscles are being challenged.",
    ],
    sections: [
      {
        title: "Build around the real target",
        paragraphs: [
          "The official starting point is not a 5-day split or an elite program. It is at least 2 days each week of muscle-strengthening work that covers the major muscle groups.",
          "That makes a beginner week easier to design than the internet often suggests.",
        ],
        sourceIds: ["cdc-adult-activity", "cdc-older-what-counts"],
      },
      {
        title: "What a simple week can emphasize",
        paragraphs: [
          "A clean beginner structure is to make both weekly strength sessions full-body sessions rather than trying to isolate one body part each day. That directly matches CDC's focus on legs, hips, back, abdomen, chest, shoulders, and arms.",
          "The equipment can stay simple. CDC examples include lifting weights, resistance bands, and bodyweight exercises.",
        ],
        sourceIds: ["cdc-adult-activity", "cdc-older-what-counts"],
      },
      {
        title: "How to keep it sustainable",
        paragraphs: [
          "The easiest beginner mistake is treating strength training like a temporary challenge instead of a weekly standard. A better long-term model is to reserve two repeatable time slots and keep them protected.",
          "That structure fits public-health guidance better than an aggressive start followed by inconsistency.",
        ],
        sourceIds: ["cdc-adult-activity", "cdc-activity-benefits"],
      },
    ],
    faq: [
      {
        question: "Do I need a gym for a beginner strength week?",
        answer:
          "No. CDC examples include weights, resistance bands, and bodyweight exercises, which means a gym is not required for the weekly minimum.",
        sourceIds: ["cdc-older-what-counts"],
      },
      {
        question: "Should beginners focus on all major muscle groups?",
        answer:
          "Yes. The guideline is built around working all major muscle groups rather than only a few favorite areas.",
        sourceIds: ["cdc-adult-activity"],
      },
    ],
  },
  {
    slug: "sleep-stress-and-recovery-basics",
    kind: "article",
    title: "Sleep, Stress, and Recovery Basics",
    seoTitle: "Sleep, Stress, and Recovery Basics Based on CDC and NIH Guidance",
    description:
      "A custom article that combines official sleep and relaxation guidance into one realistic recovery framework.",
    category: "Recovery",
    readingMinutes: 7,
    hero: {
      eyebrow: "Custom article",
      statValue: "7+ hours",
      statLabel: "plus a calmer nervous system",
      summary:
        "Recovery is not one behavior. Official guidance points to sleep quality, sufficient duration, and stress-management tools used appropriately.",
    },
    keywords: [
      "sleep stress recovery basics",
      "recovery habits official guidance",
      "sleep and stress management guide",
    ],
    summaryPoints: [
      "CDC sets sleep duration recommendations by age and emphasizes both enough sleep and good sleep quality.",
      "NCCIH describes relaxation techniques as supportive tools for stress management, not replacements for care.",
      "Regular movement, good nutrition, and social support sit beside stress practices in NIH guidance.",
    ],
    sections: [
      {
        title: "Start with sleep duration",
        paragraphs: [
          "For adults 18 to 60, CDC recommends 7 or more hours of sleep each day. For older adult age bands, the recommended ranges shift slightly, but the central message stays the same: sleep is essential to health and emotional well-being.",
          "Any recovery conversation that skips sleep usually misses the biggest lever first.",
        ],
        sourceIds: ["cdc-sleep"],
      },
      {
        title: "Add stress support without pretending it is treatment",
        paragraphs: [
          "NCCIH says relaxation techniques can help support stress management and describes options such as breathing exercises, progressive relaxation, guided imagery, and biofeedback-assisted relaxation.",
          "But the same NIH source is careful: these techniques should not replace conventional care or delay evaluation of medical problems.",
        ],
        sourceIds: ["nccih-stress-tips", "nccih-relaxation"],
      },
      {
        title: "Think in systems, not hacks",
        paragraphs: [
          "NCCIH notes that relaxation techniques may work best when practiced regularly and combined with good nutrition, regular exercise, and strong social support.",
          "That is one of the cleanest official arguments for tracking recovery across more than one domain at a time.",
        ],
        sourceIds: ["nccih-stress-tips", "nih-wellness-toolkits"],
      },
    ],
    faq: [
      {
        question: "Is more sleep always better?",
        answer:
          "Official public guidance is framed as age-based ranges and minimums, not a universal 'more is always better' rule. For adults 18 to 60, CDC says 7 or more hours.",
        sourceIds: ["cdc-sleep"],
      },
      {
        question: "Can breathing exercises replace medical help for stress-related symptoms?",
        answer:
          "No. NIH guidance says relaxation techniques should not replace conventional care or postpone evaluation of medical problems.",
        sourceIds: ["nccih-stress-tips"],
      },
    ],
  },
  {
    slug: "simple-healthy-eating-week-guide",
    kind: "article",
    title: "A Simple Healthy Eating Week Guide",
    seoTitle: "A Simple Healthy Eating Week Guide Using MyPlate, Sodium, and Added Sugars Guidance",
    description:
      "A custom article that turns MyPlate, sodium, and added-sugars guidance into a simple weekly decision framework.",
    category: "Nutrition",
    readingMinutes: 7,
    hero: {
      eyebrow: "Custom article",
      statValue: "Bite by bite",
      statLabel: "is the USDA framing",
      summary:
        "Healthy eating guidance becomes easier to use when you think in weekly patterns, not one perfect meal.",
    },
    keywords: [
      "simple healthy eating week",
      "myplate weekly guide",
      "healthy eating week based on official guidance",
    ],
    summaryPoints: [
      "USDA's MyPlate pattern gives the broad food-group structure for the week.",
      "FDA label guidance adds fast checks for sodium and added sugars when buying packaged foods.",
      "Water and healthier drink guidance supports the beverage side of the same weekly pattern.",
    ],
    sections: [
      {
        title: "Use MyPlate as the weekly frame",
        paragraphs: [
          "USDA's MyPlate messages are simple enough to carry across a full week: make half your plate fruits and vegetables, make half your grains whole grains, vary your protein routine, and use dairy or fortified soy choices where they fit.",
          "This is a better weekly framework than trying to optimize every single meal from scratch.",
        ],
        sourceIds: ["myplate-basics", "myplate-dairy"],
      },
      {
        title: "Use labels to make the pattern cleaner",
        paragraphs: [
          "The Nutrition Facts label is most useful when comparing similar foods. FDA says the Daily Value for sodium is less than 2,300 mg per day, and the Daily Value for added sugars is 50 grams on a 2,000-calorie diet.",
          "For added sugars, FDA also gives an easy shortcut: 5% Daily Value or less is low, and 20% or more is high.",
        ],
        sourceIds: ["fda-sodium", "fda-added-sugars"],
      },
      {
        title: "Keep beverages simple",
        paragraphs: [
          "CDC's hydration guidance says plain water counts toward daily water intake and encourages choosing water over sugary drinks. That one shift can support hydration and help lower added-sugar intake at the same time.",
          "This is exactly why weekly eating patterns should include beverages, not only food.",
        ],
        sourceIds: ["cdc-water", "fda-added-sugars"],
      },
    ],
    faq: [
      {
        question: "Do I need a rigid meal plan to follow official healthy-eating guidance?",
        answer:
          "No. USDA's public materials emphasize a simple pattern and small repeatable changes rather than one rigid meal schedule.",
        sourceIds: ["myplate-start-simple", "myplate-basics"],
      },
      {
        question: "What is the fastest label check for added sugars?",
        answer:
          "FDA says 5% Daily Value or less is low and 20% Daily Value or more is high, which makes quick comparisons easier.",
        sourceIds: ["fda-added-sugars"],
      },
    ],
  },
];

export function getResourceBySlug(slug: string) {
  return resourceEntries.find((entry) => entry.slug === slug) ?? null;
}

export function getSourceById(sourceId: string) {
  return researchSources.find((source) => source.id === sourceId) ?? null;
}

export function getSourcesForResource(resource: ResourceEntry) {
  const sourceIds = new Set<string>();

  resource.sections.forEach((section) => {
    section.sourceIds.forEach((sourceId) => sourceIds.add(sourceId));
  });

  resource.faq.forEach((item) => {
    item.sourceIds.forEach((sourceId) => sourceIds.add(sourceId));
  });

  return Array.from(sourceIds)
    .map((sourceId) => getSourceById(sourceId))
    .filter((source): source is ResearchSource => Boolean(source));
}

export function getFeaturedResources() {
  return resourceEntries.slice(0, 6);
}

export function getResourcesByKind(kind: ResourceKind) {
  return resourceEntries.filter((entry) => entry.kind === kind);
}

export function getResourcesByCategory(category: string) {
  return resourceEntries.filter((entry) => entry.category === category);
}

export const resourceCategories = Array.from(
  new Set(resourceEntries.map((entry) => entry.category))
);

export function getRelatedResources(resource: ResourceEntry) {
  const sameCategory = resourceEntries.filter(
    (entry) =>
      entry.slug !== resource.slug &&
      entry.category === resource.category &&
      entry.kind === resource.kind
  );

  const fallback = resourceEntries.filter((entry) => entry.slug !== resource.slug);

  return [...sameCategory, ...fallback].slice(0, 3);
}
